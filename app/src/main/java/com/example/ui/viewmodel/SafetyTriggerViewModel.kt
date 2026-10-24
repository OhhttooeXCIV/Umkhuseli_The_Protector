package com.example.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.data.local.AppDatabase
import com.example.data.local.entity.IncidentEntity
import com.example.service.EmergencyDispatchHelper
import com.example.service.EmergencyService
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

/**
 * Represents the state-machine lifecycle of an emergency quick-access SOS signal.
 *
 * State transitions:
 *   [Idle] → [Armed] → [Dispatched]
 *   [Idle] → [Armed] → [Cancelled]
 *   any → [Error]
 */
sealed interface SafetySignalState {
    /** No active signal. Default state. */
    data object Idle : SafetySignalState

    /** Countdown grace period is running. User can cancel before dispatch. */
    data class Armed(
        val secondsRemaining: Int,
        val totalSeconds: Int = 3
    ) : SafetySignalState

    /** SOS has been dispatched and logged to the Evidence Vault. */
    data class Dispatched(
        val timestamp: Long,
        val formattedTime: String,
        val incidentId: Long,
        val guardiansAlertedCount: Int,
        val locationCoordinates: String?,
        val currentArea: String = "Identified Area",
        val findMyDeviceUrl: String = "https://www.google.com/android/find"
    ) : SafetySignalState

    /** User cancelled during the grace period — no alert was sent. */
    data class Cancelled(
        val reason: String = "SOS signal cancelled during grace period"
    ) : SafetySignalState

    /** An unrecoverable error occurred during dispatch. */
    data class Error(
        val errorMessage: String
    ) : SafetySignalState
}

/**
 * Manages the emergency SOS quick-access signal lifecycle. All dependencies are
 * injected via [com.example.di.ViewModelFactory] — no direct service construction here.
 *
 * Responsibilities:
 * - Arms a countdown SOS with a configurable grace period
 * - Dispatches the SOS immediately (panic trigger)
 * - Logs every distress event to the Room database for legal evidence
 * - Provides direct-dial helpers for SAPS 10111 and GBVCC 0800 428 428
 */
class SafetyTriggerViewModel(
    private val database: AppDatabase,
    private val emergencyService: EmergencyService,
    private val emergencyDispatchHelper: EmergencyDispatchHelper
) : ViewModel() {

    private val incidentDao = database.incidentDao()
    private val guardianDao = database.guardianDao()

    private val _signalState = MutableStateFlow<SafetySignalState>(SafetySignalState.Idle)
    val signalState: StateFlow<SafetySignalState> = _signalState.asStateFlow()

    private var countdownJob: Job? = null

    /** Real-time stream of all SOS incident records from Room */
    val allLoggedIncidents: Flow<List<IncidentEntity>> = incidentDao.getAllIncidents()

    // ── Public API ────────────────────────────────────────────────────────────

    /**
     * Arms the SOS signal with a [countdownSeconds]-second grace period.
     * Vibration feedback is triggered on each tick. If not cancelled, the SOS
     * is automatically dispatched and persisted when the countdown reaches zero.
     */
    fun armQuickAccessSos(countdownSeconds: Int = 3) {
        countdownJob?.cancel()
        _signalState.value = SafetySignalState.Armed(
            secondsRemaining = countdownSeconds,
            totalSeconds = countdownSeconds
        )
        emergencyService.triggerVibration()

        countdownJob = viewModelScope.launch {
            for (sec in countdownSeconds downTo 1) {
                _signalState.value = SafetySignalState.Armed(
                    secondsRemaining = sec,
                    totalSeconds = countdownSeconds
                )
                emergencyService.triggerVibration()
                delay(1_000L)
            }
            // Grace period expired — dispatch immediately
            dispatchAndLogSos(customDistressMessage = null)
        }
    }

    /**
     * Cancels an active countdown before dispatch, preventing false alarms.
     * Transitions state to [SafetySignalState.Cancelled].
     */
    fun cancelArmedSos(reason: String = "Cancelled by user before dispatch") {
        countdownJob?.cancel()
        countdownJob = null
        _signalState.value = SafetySignalState.Cancelled(reason)
        emergencyService.triggerVibration()
    }

    /**
     * Fires the SOS signal immediately without waiting for a countdown.
     * For life-threatening emergencies requiring instantaneous action.
     */
    fun triggerInstantSos(customMessage: String? = null): Job {
        countdownJob?.cancel()
        countdownJob = null
        return viewModelScope.launch {
            dispatchAndLogSos(customMessage)
        }
    }

    /** Resets signal back to idle. Safe to call from any state. */
    fun resetToIdle() {
        countdownJob?.cancel()
        countdownJob = null
        _signalState.value = SafetySignalState.Idle
    }

    /** Dials SAPS Police Emergency Flying Squad (10111) directly */
    fun callPoliceDirectly() {
        emergencyService.triggerVibration()
        emergencyService.makeCall("10111")
    }

    /** Dials the National GBV Command Centre (0800 428 428) directly */
    fun callGbvccDirectly() {
        emergencyService.triggerVibration()
        emergencyService.makeCall("0800428428")
    }

    /**
     * Dispatches the 72-hour live location beacon via WhatsApp to the primary
     * ICE guardian who has WhatsApp access.
     */
    fun dispatchWhatsAppBeacon() {
        viewModelScope.launch {
            val list = guardianDao.getActiveGuardians()
            val target = list.find { it.hasWhatsAppAccess && it.isPrimary }
                ?: list.find { it.hasWhatsAppAccess }
                ?: list.firstOrNull()
            if (target != null) {
                val location = emergencyService.getLastKnownLocation()
                val telemetry = emergencyDispatchHelper.getDeviceTelemetry(location)
                emergencyDispatchHelper.launchWhatsAppEmergencyDispatch(target, location, telemetry)
            }
        }
    }

    fun openFindMyDevice() = emergencyDispatchHelper.openFindMyDeviceService()

    fun promptDownloadOfflineMaps() {
        val location = emergencyService.getLastKnownLocation()
        emergencyDispatchHelper.promptDownloadOfflineGoogleMaps(location)
    }

    // ── Internal ──────────────────────────────────────────────────────────────

    /**
     * Core dispatch routine:
     * 1. Obtains GPS coordinates & device telemetry
     * 2. Persists a timestamped [IncidentEntity] to Room as legal evidence
     * 3. Sends SMS distress alerts to all active ICE guardians
     * 4. Triggers vibration feedback
     * 5. Transitions state to [SafetySignalState.Dispatched]
     */
    private suspend fun dispatchAndLogSos(customDistressMessage: String?) {
        try {
            val timestamp = System.currentTimeMillis()
            val timeFormatter = SimpleDateFormat("dd MMM yyyy, HH:mm:ss", Locale.getDefault())
            val formattedTime = timeFormatter.format(Date(timestamp))

            val location = emergencyService.getLastKnownLocation()
            val telemetry = emergencyDispatchHelper.getDeviceTelemetry(location)
            val fullDistress = customDistressMessage
                ?: emergencyDispatchHelper.build72HourDistressMessage(location, telemetry)

            val locationDescription = "Area: ${telemetry.currentArea} " +
                "(GPS: ${location?.latitude ?: "Pending"}, ${location?.longitude ?: "Pending"})"

            // 1. Persist distress event as a legal incident record
            val distressIncident = IncidentEntity(
                timestamp = timestamp,
                dateTimeFormatted = formattedTime,
                incidentType = "Emergency SOS Distress Signal",
                severityLevel = 5,
                perpetrator = "Emergency Trigger / Immediate Threat",
                locationDescription = locationDescription,
                description = fullDistress,
                injuriesOrImpact = "Life-safety distress alert broadcast to ICE guardian network. " +
                    "Battery: ${telemetry.batteryPercentage}%, Handset: ${telemetry.deviceModel}",
                witnesses = "Automated System Telemetry & Guardian Dispatch",
                policeObNumber = "",
                photosOrAudioNotes = "SOS_EVENT_$timestamp"
            )
            val insertedId = incidentDao.insertIncident(distressIncident)

            // 2. Transmit SMS alerts to all active ICE guardians
            val activeGuardians = guardianDao.getActiveGuardians()
            val sentCount = emergencyService.sendSosSms(activeGuardians, fullDistress)

            // 3. Tactile feedback confirmation
            emergencyService.triggerVibration()

            // 4. Transition to dispatched state
            _signalState.value = SafetySignalState.Dispatched(
                timestamp = timestamp,
                formattedTime = formattedTime,
                incidentId = insertedId,
                guardiansAlertedCount = sentCount,
                locationCoordinates = location?.let { "${it.latitude}, ${it.longitude}" },
                currentArea = telemetry.currentArea,
                findMyDeviceUrl = telemetry.findMyDeviceUrl
            )
        } catch (e: Exception) {
            _signalState.value = SafetySignalState.Error(
                errorMessage = e.localizedMessage ?: "Failed to dispatch SOS signal"
            )
        }
    }

    override fun onCleared() {
        super.onCleared()
        countdownJob?.cancel()
    }
}
