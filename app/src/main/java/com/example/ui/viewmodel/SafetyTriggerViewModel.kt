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

sealed interface SafetySignalState {
    data object Idle : SafetySignalState
    data class Armed(
        val secondsRemaining: Int,
        val totalSeconds: Int = 3
    ) : SafetySignalState

    data class Dispatched(
        val timestamp: Long,
        val formattedTime: String,
        val incidentId: Long,
        val guardiansAlertedCount: Int,
        val locationCoordinates: String?,
        val currentArea: String = "Identified Area",
        val findMyDeviceUrl: String = "https://www.google.com/android/find"
    ) : SafetySignalState

    data class Cancelled(
        val reason: String = "SOS signal cancelled during grace period"
    ) : SafetySignalState

    data class Error(
        val errorMessage: String
    ) : SafetySignalState
}

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

    val allLoggedIncidents: Flow<List<IncidentEntity>> = incidentDao.getAllIncidents()

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
            dispatchAndLogSos(customDistressMessage = null)
        }
    }

    fun cancelArmedSos(reason: String = "Cancelled by user before dispatch") {
        countdownJob?.cancel()
        countdownJob = null
        _signalState.value = SafetySignalState.Cancelled(reason)
        emergencyService.triggerVibration()
    }

    fun triggerInstantSos(customMessage: String? = null): Job {
        countdownJob?.cancel()
        countdownJob = null
        return viewModelScope.launch {
            dispatchAndLogSos(customMessage)
        }
    }

    fun resetToIdle() {
        clearCountdown()
        _signalState.value = SafetySignalState.Idle
    }

    fun callPoliceDirectly() {
        emergencyService.triggerVibration()
        emergencyService.makeCall("10111")
    }

    fun callGbvccDirectly() {
        emergencyService.triggerVibration()
        emergencyService.makeCall("0800428428")
    }

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

    internal fun clearCountdown() {
        countdownJob?.cancel()
        countdownJob = null
    }

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
            val activeGuardians = guardianDao.getActiveGuardians()
            val sentCount = emergencyService.sendSosSms(activeGuardians, fullDistress)

            emergencyService.triggerVibration()

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
        clearCountdown()
    }
}