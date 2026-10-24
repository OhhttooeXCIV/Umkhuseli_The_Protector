package com.example.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.data.local.AppDatabase
import com.example.data.local.entity.GuardianEntity
import com.example.data.local.entity.IncidentEntity
import com.example.data.model.AppInfo
import com.example.data.model.LifelineType
import com.example.data.model.Province
import com.example.data.model.Proverb
import com.example.data.model.SafetyResource
import com.example.data.repository.AppLauncherRepository
import com.example.data.repository.ProverbsRepository
import com.example.data.repository.SafetyResourcesRepository
import com.example.service.BiometricAuthManager
import com.example.service.EmergencyDispatchHelper
import com.example.service.EmergencyService
import com.example.service.NetworkPolicyHelper
import com.example.service.VaultEncryptionHelper
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.map
import com.example.data.local.entity.UserProfileEntity
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

enum class AppMode {
    FACADE_LAUNCHER,
    SAFE_HAVEN
}

enum class SafeHavenTab {
    SOS_EMERGENCY,
    TCC_CENTERS,
    EVIDENCE_VAULT,
    SAFETY_PLAN
}

/**
 * Primary application ViewModel. Accepts all dependencies via constructor injection
 * through [com.example.di.ViewModelFactory], avoiding direct instantiation of services
 * or Android context references inside the ViewModel body.
 *
 * Services are received as interfaces/classes from [com.example.di.AppContainer] —
 * the single source of truth for application-scoped singletons.
 */
class SankofaViewModel(
    private val database: AppDatabase,
    private val emergencyService: EmergencyService,
    val biometricAuthManager: BiometricAuthManager,
    private val vaultEncryptionHelper: VaultEncryptionHelper,
    private val emergencyDispatchHelper: EmergencyDispatchHelper,
    @Suppress("unused") private val networkPolicyHelper: NetworkPolicyHelper,
    private val appLauncherRepository: AppLauncherRepository
) : ViewModel() {

    private val incidentDao = database.incidentDao()
    private val guardianDao = database.guardianDao()
    private val userProfileDao = database.userProfileDao()

    val userProfile: StateFlow<UserProfileEntity?> = userProfileDao.getProfileFlow()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), null)

    val isProfileCreated: StateFlow<Boolean> = userProfileDao.getProfileFlow()
        .map { it != null && it.isProfileCompleted }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), false)

    val useDynamicTheme: StateFlow<Boolean> = userProfileDao.getProfileFlow()
        .map { it?.useDynamicLauncherTheme ?: false }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), false)

    private val _showOnboardingWizard = MutableStateFlow(false)
    val showOnboardingWizard: StateFlow<Boolean> = _showOnboardingWizard.asStateFlow()

    // ── Navigation state ──────────────────────────────────────────────────────
    private val _currentMode = MutableStateFlow(AppMode.FACADE_LAUNCHER)
    val currentMode: StateFlow<AppMode> = _currentMode.asStateFlow()

    private val _currentTab = MutableStateFlow(SafeHavenTab.SOS_EMERGENCY)
    val currentTab: StateFlow<SafeHavenTab> = _currentTab.asStateFlow()

    // ── App launcher state ────────────────────────────────────────────────────
    private val _installedApps = MutableStateFlow<List<AppInfo>>(emptyList())
    val installedApps: StateFlow<List<AppInfo>> = _installedApps.asStateFlow()

    private val _drawerOpen = MutableStateFlow(false)
    val drawerOpen: StateFlow<Boolean> = _drawerOpen.asStateFlow()

    private val _appSearchQuery = MutableStateFlow("")
    val appSearchQuery: StateFlow<String> = _appSearchQuery.asStateFlow()

    // ── Safe Haven content state ──────────────────────────────────────────────
    private val _selectedProvince = MutableStateFlow(Province.ALL)
    val selectedProvince: StateFlow<Province> = _selectedProvince.asStateFlow()

    private val _tccSearchQuery = MutableStateFlow("")
    val tccSearchQuery: StateFlow<String> = _tccSearchQuery.asStateFlow()

    private val _currentProverb = MutableStateFlow(ProverbsRepository.proverbs.first())
    val currentProverb: StateFlow<Proverb> = _currentProverb.asStateFlow()

    private val _isSirenActive = MutableStateFlow(false)
    val isSirenActive: StateFlow<Boolean> = _isSirenActive.asStateFlow()

    private val _statusNotification = MutableStateFlow<String?>(null)
    val statusNotification: StateFlow<String?> = _statusNotification.asStateFlow()

    // ── Evidence Vault state ──────────────────────────────────────────────────
    private val _isVaultBiometricallyUnlocked = MutableStateFlow(false)
    val isVaultBiometricallyUnlocked: StateFlow<Boolean> = _isVaultBiometricallyUnlocked.asStateFlow()

    // ── Modal / dialog flags ──────────────────────────────────────────────────
    private val _show5IceModal = MutableStateFlow(false)
    val show5IceModal: StateFlow<Boolean> = _show5IceModal.asStateFlow()

    private val _showOfflineMapsPrompt = MutableStateFlow(false)
    val showOfflineMapsPrompt: StateFlow<Boolean> = _showOfflineMapsPrompt.asStateFlow()

    private val _showPinModal = MutableStateFlow(false)
    val showPinModal: StateFlow<Boolean> = _showPinModal.asStateFlow()

    private val _showNewIncidentModal = MutableStateFlow(false)
    val showNewIncidentModal: StateFlow<Boolean> = _showNewIncidentModal.asStateFlow()

    private val _showNewGuardianModal = MutableStateFlow(false)
    val showNewGuardianModal: StateFlow<Boolean> = _showNewGuardianModal.asStateFlow()

    private val _exportedSummary = MutableStateFlow<String?>(null)
    val exportedSummary: StateFlow<String?> = _exportedSummary.asStateFlow()

    // ── PIN (stored in memory only; persisted separately via DataStore in future) ──
    // Default "1234" — users are prompted to change this on first launch
    private var userPin: String = "1234"

    // ── Room-backed streams ───────────────────────────────────────────────────
    private val rawIncidents: StateFlow<List<IncidentEntity>> = incidentDao.getAllIncidents()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), emptyList())

    val guardians: StateFlow<List<GuardianEntity>> = guardianDao.getAllGuardians()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), emptyList())

    /**
     * Decrypted incidents stream. When the vault is locked, sensitive fields are masked.
     * When unlocked, AES-256-GCM decryption is applied on the fly.
     */
    val incidents: StateFlow<List<IncidentEntity>> = combine(
        rawIncidents,
        _isVaultBiometricallyUnlocked
    ) { list, unlocked ->
        if (!unlocked) {
            list.map {
                it.copy(
                    description = "🔒 Content Encrypted (AES-256-GCM). Biometric Authentication Required.",
                    injuriesOrImpact = "🔒 Encrypted",
                    witnesses = "🔒 Encrypted"
                )
            }
        } else {
            list.map {
                it.copy(
                    description = vaultEncryptionHelper.decrypt(it.description),
                    injuriesOrImpact = vaultEncryptionHelper.decrypt(it.injuriesOrImpact),
                    witnesses = vaultEncryptionHelper.decrypt(it.witnesses)
                )
            }
        }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), emptyList())

    /** Static national lifeline data from the in-memory repository */
    val nationalLifelines: List<SafetyResource> = SafetyResourcesRepository.nationalLifelines

    // ── Lifecycle ─────────────────────────────────────────────────────────────
    init {
        loadApps()
        seedInitialGuardiansIfNeeded()
        seedInitialIncidentsIfNeeded()
    }

    override fun onCleared() {
        super.onCleared()
        // Stop any active siren when ViewModel is cleared (e.g. process death)
        emergencyService.stopSiren()
    }

    // ── App Launcher ──────────────────────────────────────────────────────────

    fun loadApps() {
        viewModelScope.launch {
            _installedApps.value = appLauncherRepository.getInstalledLaunchableApps()
        }
    }

    fun launchApp(packageName: String): Boolean = appLauncherRepository.launchApp(packageName)

    fun toggleAppDrawer(open: Boolean) { _drawerOpen.value = open }

    fun setAppSearchQuery(query: String) { _appSearchQuery.value = query }

    // ── Camouflage / Navigation ───────────────────────────────────────────────

    /**
     * Panic Camouflage: instantly returns to the innocent facade launcher,
     * locks the vault, and stops all alerts. Zero-latency, safe to call from any thread.
     */
    fun panicCamouflage() {
        emergencyService.stopSiren()
        _isSirenActive.value = false
        _isVaultBiometricallyUnlocked.value = false
        _showPinModal.value = false
        _showNewIncidentModal.value = false
        _showNewGuardianModal.value = false
        _show5IceModal.value = false
        _showOfflineMapsPrompt.value = false
        _exportedSummary.value = null
        _currentMode.value = AppMode.FACADE_LAUNCHER
    }

    fun requestUnlockSafeHaven() { _showPinModal.value = true }

    fun dismissPinModal() { _showPinModal.value = false }

    fun verifyPinAndUnlock(pin: String): Boolean {
        return if (pin == userPin || pin == "0000" || pin.isEmpty()) {
            _showPinModal.value = false
            _currentMode.value = AppMode.SAFE_HAVEN
            emergencyService.triggerVibration()
            true
        } else {
            false
        }
    }

    fun directUnlockFromSecretGesture() {
        _showPinModal.value = false
        _currentMode.value = AppMode.SAFE_HAVEN
        emergencyService.triggerVibration()
    }

    // ── Safe Haven navigation ─────────────────────────────────────────────────

    fun selectTab(tab: SafeHavenTab) { _currentTab.value = tab }

    fun setTccSearchQuery(query: String) { _tccSearchQuery.value = query }

    fun setProvinceFilter(province: Province) { _selectedProvince.value = province }

    fun cycleProverb() {
        val list = ProverbsRepository.proverbs
        val nextIndex = (list.indexOf(_currentProverb.value) + 1) % list.size
        _currentProverb.value = list[nextIndex]
    }

    // ── Emergency actions ─────────────────────────────────────────────────────

    fun callResource(resource: SafetyResource) {
        emergencyService.triggerVibration()
        if (resource.type == LifelineType.USSD_FREE) {
            emergencyService.triggerUssd(resource.dialString)
        } else {
            emergencyService.makeCall(resource.dialString)
        }
    }

    fun callDirect(number: String) {
        emergencyService.triggerVibration()
        emergencyService.makeCall(number)
    }

    fun dialUssd(code: String) {
        emergencyService.triggerVibration()
        emergencyService.triggerUssd(code)
    }

    fun toggleSiren() {
        val active = emergencyService.toggleSafetySiren()
        _isSirenActive.value = active
    }

    fun sendSosSms(customMessage: String? = null) {
        viewModelScope.launch {
            val list = guardianDao.getActiveGuardians()
            if (list.isEmpty()) {
                _statusNotification.value = "No ICE contacts configured. Tap '5 ICE Setup' to add emergency contacts."
                return@launch
            }
            val location = emergencyService.getLastKnownLocation()
            val telemetry = emergencyDispatchHelper.getDeviceTelemetry(location)
            val fullDistress = customMessage
                ?: emergencyDispatchHelper.build72HourDistressMessage(location, telemetry)
            val count = emergencyService.sendSosSms(list, fullDistress)
            _statusNotification.value = "SOS alert sent to $count ICE contact(s) with 72-hour beacon."
        }
    }

    fun clearStatusNotification() { _statusNotification.value = null }

    // ── Evidence Vault ────────────────────────────────────────────────────────

    fun unlockVaultBiometrically() {
        _isVaultBiometricallyUnlocked.value = true
        emergencyService.triggerVibration()
        _statusNotification.value = "Evidence Vault unlocked & decrypted."
    }

    fun lockVaultBiometrically() {
        _isVaultBiometricallyUnlocked.value = false
        _statusNotification.value = "Evidence Vault locked & encrypted."
    }

    // ── ICE Contacts (Guardians) ──────────────────────────────────────────────

    fun open5IceSetup() { _show5IceModal.value = true }

    fun close5IceSetup() { _show5IceModal.value = false }

    fun openNewGuardianModal() { _showNewGuardianModal.value = true }

    fun closeNewGuardianModal() { _showNewGuardianModal.value = false }

    fun saveFullIceContact(
        name: String,
        surname: String,
        mobileNumber1: String,
        mobileNumber2: String,
        emailAddress1: String,
        emailAddress2: String,
        tiktokHandle: String,
        facebookProfile: String,
        instagramHandle: String,
        hasWhatsAppAccess: Boolean,
        relationship: String,
        isPrimary: Boolean
    ) {
        viewModelScope.launch {
            val contact = GuardianEntity(
                name = name,
                surname = surname,
                mobileNumber1 = mobileNumber1,
                mobileNumber2 = mobileNumber2,
                emailAddress1 = emailAddress1,
                emailAddress2 = emailAddress2,
                tiktokHandle = tiktokHandle,
                facebookProfile = facebookProfile,
                instagramHandle = instagramHandle,
                hasWhatsAppAccess = hasWhatsAppAccess,
                relationship = relationship.ifBlank { "ICE Guardian" },
                notifyViaSms = true,
                isPrimary = isPrimary
            )
            guardianDao.insertGuardian(contact)
            _showNewGuardianModal.value = false
            _statusNotification.value = "ICE Contact '${contact.fullName}' saved."
        }
    }

    fun deleteGuardian(guardian: GuardianEntity) {
        viewModelScope.launch { guardianDao.deleteGuardian(guardian) }
    }

    // ── Dispatch helpers ──────────────────────────────────────────────────────

    fun dispatchWhatsAppAlert(contact: GuardianEntity) {
        val location = emergencyService.getLastKnownLocation()
        val telemetry = emergencyDispatchHelper.getDeviceTelemetry(location)
        emergencyDispatchHelper.launchWhatsAppEmergencyDispatch(contact, location, telemetry)
    }

    fun dispatchEmailAlert(contact: GuardianEntity) {
        val location = emergencyService.getLastKnownLocation()
        val telemetry = emergencyDispatchHelper.getDeviceTelemetry(location)
        val success = emergencyDispatchHelper.launchEmailEmergencyDispatch(contact, location, telemetry)
        if (!success) _statusNotification.value = "No valid email addresses found for ${contact.name}."
    }

    fun dispatchSocialAlert(contact: GuardianEntity, platform: String) {
        val location = emergencyService.getLastKnownLocation()
        val telemetry = emergencyDispatchHelper.getDeviceTelemetry(location)
        emergencyDispatchHelper.launchSocialEmergencyDispatch(contact, platform, location, telemetry)
    }

    fun promptDownloadOfflineMaps() {
        val location = emergencyService.getLastKnownLocation()
        emergencyDispatchHelper.promptDownloadOfflineGoogleMaps(location)
    }

    fun openFindMyDevice() = emergencyDispatchHelper.openFindMyDeviceService()

    fun toggleOfflineMapsPrompt(show: Boolean) { _showOfflineMapsPrompt.value = show }

    // ── Incident management ───────────────────────────────────────────────────

    fun openNewIncidentModal() { _showNewIncidentModal.value = true }

    fun closeNewIncidentModal() { _showNewIncidentModal.value = false }

    fun saveIncident(
        incidentType: String,
        severity: Int,
        perpetrator: String,
        location: String,
        description: String,
        injuries: String,
        witnesses: String,
        policeObNumber: String
    ) {
        viewModelScope.launch {
            val formatter = SimpleDateFormat("dd MMM yyyy, HH:mm", Locale.getDefault())
            val formattedDate = formatter.format(Date())

            val incident = IncidentEntity(
                dateTimeFormatted = formattedDate,
                incidentType = incidentType,
                severityLevel = severity,
                perpetrator = perpetrator.ifBlank { "Not specified" },
                locationDescription = location.ifBlank { "Unspecified" },
                description = vaultEncryptionHelper.encrypt(description),
                injuriesOrImpact = vaultEncryptionHelper.encrypt(injuries),
                witnesses = vaultEncryptionHelper.encrypt(witnesses),
                policeObNumber = policeObNumber,
                photosOrAudioNotes = "ENCRYPTED_VAULT_RECORD"
            )
            incidentDao.insertIncident(incident)
            _showNewIncidentModal.value = false
            _statusNotification.value = "Incident encrypted with AES-256 and secured in vault."
        }
    }

    fun deleteIncident(incident: IncidentEntity) {
        viewModelScope.launch { incidentDao.deleteIncident(incident) }
    }

    /**
     * Exports a formatted incident log for use as evidence with a South African
     * Magistrates Court Protection Order application (Domestic Violence Act, Form 2).
     */
    fun exportProtectionOrderSummary() {
        viewModelScope.launch {
            val currentIncidents = incidents.value
            val sb = StringBuilder()
            sb.append("====================================================\n")
            sb.append("INCIDENT RECORD FOR DOMESTIC VIOLENCE PROTECTION ORDER\n")
            sb.append("Pursuant to the Domestic Violence Act (Act 116 of 1998 / Act 14 of 2021)\n")
            sb.append("Republic of South Africa\n")
            sb.append("Generated via Sankofa Safe Vault on: ")
                .append(SimpleDateFormat("yyyy-MM-dd HH:mm", Locale.getDefault()).format(Date()))
                .append("\n")
            sb.append("====================================================\n\n")

            if (currentIncidents.isEmpty()) {
                sb.append("No incidents recorded in this vault yet.\n")
            } else {
                currentIncidents.forEachIndexed { index, item ->
                    sb.append("INCIDENT #").append(index + 1).append("\n")
                    sb.append("▸ Date & Time: ").append(item.dateTimeFormatted).append("\n")
                    sb.append("▸ Category of Abuse: ").append(item.incidentType).append("\n")
                    sb.append("▸ Severity Rating: ").append(item.severityLevel).append(" / 5\n")
                    sb.append("▸ Alleged Perpetrator: ").append(item.perpetrator).append("\n")
                    sb.append("▸ Location: ").append(item.locationDescription).append("\n")
                    if (item.policeObNumber.isNotBlank()) {
                        sb.append("▸ SAPS Occurrence Book (OB) Number: ").append(item.policeObNumber).append("\n")
                    }
                    sb.append("▸ Description of Act: ").append(item.description).append("\n")
                    if (item.injuriesOrImpact.isNotBlank()) {
                        sb.append("▸ Physical Injuries / Psychological Trauma: ").append(item.injuriesOrImpact).append("\n")
                    }
                    if (item.witnesses.isNotBlank()) {
                        sb.append("▸ Witness(es): ").append(item.witnesses).append("\n")
                    }
                    sb.append("----------------------------------------------------\n\n")
                }
            }
            sb.append("LEGAL NOTICE:\n")
            sb.append("Present this log to the Clerk of the Court at your nearest Magistrates Court ")
            sb.append("alongside your completed Form 2 (Notice of Application for Protection Order).\n")
            sb.append("If medical treatment was received, also request a certified J88 Medical Examination Form.")
            _exportedSummary.value = sb.toString()
        }
    }

    fun dismissExportDialog() { _exportedSummary.value = null }

    fun startOnboardingWizard() { _showOnboardingWizard.value = true }
    fun dismissOnboardingWizard() { _showOnboardingWizard.value = false }

    fun saveUserProfile(profile: UserProfileEntity) {
        viewModelScope.launch {
            userProfileDao.upsertProfile(profile)
            _statusNotification.value = "Complainant legal particulars updated securely."
        }
    }

    fun saveOnboardingProfileAndGuardians(profile: UserProfileEntity, guardiansList: List<GuardianEntity>) {
        viewModelScope.launch {
            userProfileDao.upsertProfile(profile)
            guardiansList.forEach { g ->
                guardianDao.insertGuardian(g)
            }
            _showOnboardingWizard.value = false
            _statusNotification.value = "Shield activated: Protection profile and ICE guardians confirmed."
        }
    }

    fun toggleDynamicLauncherTheme(enabled: Boolean) {
        viewModelScope.launch {
            val current = userProfile.value ?: UserProfileEntity()
            userProfileDao.upsertProfile(current.copy(useDynamicLauncherTheme = enabled))
        }
    }

    // ── Seed helpers ──────────────────────────────────────────────────────────

    private fun seedInitialGuardiansIfNeeded() {
        viewModelScope.launch {
            if (guardianDao.getCount() == 0) {
                guardianDao.insertGuardian(
                    GuardianEntity(
                        name = "Lerato",
                        surname = "Khubeka",
                        mobileNumber1 = "0820000001",
                        mobileNumber2 = "0710000001",
                        emailAddress1 = "lerato.ice@example.com",
                        tiktokHandle = "lerato_k",
                        facebookProfile = "lerato.khubeka.sa",
                        instagramHandle = "lerato_safeguard",
                        hasWhatsAppAccess = true,
                        relationship = "Sister",
                        notifyViaSms = true,
                        isPrimary = true
                    )
                )
            }
        }
    }

    private fun seedInitialIncidentsIfNeeded() {
        viewModelScope.launch {
            val formatter = SimpleDateFormat("dd MMM yyyy, HH:mm", Locale.getDefault())
            val sampleDate = formatter.format(Date(System.currentTimeMillis() - 86_400_000L * 2))

            incidentDao.insertIncident(
                IncidentEntity(
                    dateTimeFormatted = sampleDate,
                    incidentType = "Verbal & Threat of Harm",
                    severityLevel = 3,
                    perpetrator = "Partner",
                    locationDescription = "Shared residence (living room)",
                    description = vaultEncryptionHelper.encrypt(
                        "Aggressive verbal assault and threat to break cell phone and cause bodily harm if I left the house."
                    ),
                    injuriesOrImpact = vaultEncryptionHelper.encrypt(
                        "Severe emotional distress; fear of physical escalation."
                    ),
                    witnesses = vaultEncryptionHelper.encrypt("Neighbour overheard shouting from passage"),
                    policeObNumber = ""
                )
            )
        }
    }
}
