package com.example

import android.Manifest
import android.os.Bundle
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.biometric.BiometricPrompt
import androidx.compose.animation.Crossfade
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.fragment.app.FragmentActivity
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.di.ViewModelFactory
import com.example.ui.components.SafetyTriggerOverlay
import com.example.ui.launcher.LauncherFacadeScreen
import com.example.ui.safehaven.SafeHavenScreen
import com.example.ui.onboarding.SetupWizardScreen
import com.example.ui.theme.SankofaDarkBg
import com.example.ui.theme.SankofaSafeTheme
import com.example.ui.viewmodel.AppMode
import com.example.ui.viewmodel.SafetyTriggerViewModel
import com.example.ui.viewmodel.SankofaViewModel

class MainActivity : FragmentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        // Retrieve the application-scoped DI container
        val container = (application as SankofaApplication).container
        val factory = ViewModelFactory(container)

        setContent {
            val viewModel: SankofaViewModel = viewModel(factory = factory)
            val useDynamicTheme by viewModel.useDynamicTheme.collectAsStateWithLifecycle()

            SankofaSafeTheme(dynamicColor = useDynamicTheme) {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = SankofaDarkBg
                ) {
                    val safetyTriggerViewModel: SafetyTriggerViewModel = viewModel(factory = factory)

                    // Request runtime permissions required for emergency features
                    val permissionLauncher = rememberLauncherForActivityResult(
                        contract = ActivityResultContracts.RequestMultiplePermissions()
                    ) { /* Permissions granted or denied — handled gracefully in services */ }

                    LaunchedEffect(Unit) {
                        permissionLauncher.launch(
                            arrayOf(
                                Manifest.permission.CALL_PHONE,
                                Manifest.permission.SEND_SMS,
                                Manifest.permission.ACCESS_FINE_LOCATION,
                                Manifest.permission.ACCESS_COARSE_LOCATION
                            )
                        )
                    }

                    SankofaRootApp(
                        viewModel = viewModel,
                        safetyTriggerViewModel = safetyTriggerViewModel,
                        onTriggerBiometricAuth = {
                            launchBiometricPrompt(
                                biometricAuthManager = container.biometricAuthManager,
                                viewModel = viewModel
                            )
                        }
                    )
                }
            }
        }
    }

    private fun launchBiometricPrompt(
        biometricAuthManager: com.example.service.BiometricAuthManager,
        viewModel: SankofaViewModel
    ) {
        biometricAuthManager.promptBiometricAuth(
            activity = this,
            title = "Unlock Evidence Vault",
            subtitle = "Biometric Authentication Required",
            description = "Authenticate with Fingerprint, Face, or Device PIN to decrypt and access confidential domestic abuse evidence.",
            onSuccess = { viewModel.unlockVaultBiometrically() },
            onError = { errorCode, _ ->
                if (errorCode == BiometricPrompt.ERROR_NO_BIOMETRICS ||
                    errorCode == BiometricPrompt.ERROR_HW_NOT_PRESENT ||
                    errorCode == BiometricPrompt.ERROR_HW_UNAVAILABLE
                ) {
                    // Fallback: grant access when no biometric hardware is enrolled
                    viewModel.unlockVaultBiometrically()
                }
            },
            onFailed = { /* Biometric mismatch — user must retry */ }
        )
    }
}

@Composable
fun SankofaRootApp(
    viewModel: SankofaViewModel,
    safetyTriggerViewModel: SafetyTriggerViewModel,
    onTriggerBiometricAuth: () -> Unit
) {
    val currentMode by viewModel.currentMode.collectAsStateWithLifecycle()
    val currentTab by viewModel.currentTab.collectAsStateWithLifecycle()
    val installedApps by viewModel.installedApps.collectAsStateWithLifecycle()
    val currentProverb by viewModel.currentProverb.collectAsStateWithLifecycle()
    val drawerOpen by viewModel.drawerOpen.collectAsStateWithLifecycle()
    val appSearchQuery by viewModel.appSearchQuery.collectAsStateWithLifecycle()
    val tccSearchQuery by viewModel.tccSearchQuery.collectAsStateWithLifecycle()
    val selectedProvince by viewModel.selectedProvince.collectAsStateWithLifecycle()
    val isSirenActive by viewModel.isSirenActive.collectAsStateWithLifecycle()
    val isVaultUnlocked by viewModel.isVaultBiometricallyUnlocked.collectAsStateWithLifecycle()
    val showPinModal by viewModel.showPinModal.collectAsStateWithLifecycle()
    val incidents by viewModel.incidents.collectAsStateWithLifecycle()
    val guardians by viewModel.guardians.collectAsStateWithLifecycle()
    val showAddIncidentModal by viewModel.showNewIncidentModal.collectAsStateWithLifecycle()
    val showAddGuardianModal by viewModel.showNewGuardianModal.collectAsStateWithLifecycle()
    val exportedSummary by viewModel.exportedSummary.collectAsStateWithLifecycle()
    val statusNotification by viewModel.statusNotification.collectAsStateWithLifecycle()
    val safetySignalState by safetyTriggerViewModel.signalState.collectAsStateWithLifecycle()
    val userProfile by viewModel.userProfile.collectAsStateWithLifecycle()
    val isProfileCreated by viewModel.isProfileCreated.collectAsStateWithLifecycle()
    val showOnboardingWizard by viewModel.showOnboardingWizard.collectAsStateWithLifecycle()

    // Derive current area from the last known signal dispatch for display
    val currentAreaName = (safetySignalState as? com.example.ui.viewmodel.SafetySignalState.Dispatched)
        ?.currentArea ?: "Detecting Area..."

    Box(modifier = Modifier.fillMaxSize()) {
        if (showOnboardingWizard) {
            SetupWizardScreen(
                initialUserProfile = userProfile,
                onCompleteProfileAndSetup = { profile, guardiansList ->
                    viewModel.saveOnboardingProfileAndGuardians(profile, guardiansList)
                },
                onContinueLimitedAccess = {
                    viewModel.dismissOnboardingWizard()
                }
            )
        } else {
            Crossfade(targetState = currentMode, label = "app_mode_crossfade") { mode ->
            when (mode) {
                AppMode.FACADE_LAUNCHER -> {
                    LauncherFacadeScreen(
                        installedApps = installedApps,
                        currentProverb = currentProverb,
                        onLaunchApp = { viewModel.launchApp(it) },
                        onCycleProverb = { viewModel.cycleProverb() },
                        onRequestPinUnlock = { viewModel.requestUnlockSafeHaven() },
                        onSecretGestureTriggered = { viewModel.directUnlockFromSecretGesture() },
                        showPinModal = showPinModal,
                        onDismissPinModal = { viewModel.dismissPinModal() },
                        onVerifyPin = { viewModel.verifyPinAndUnlock(it) },
                        isDrawerOpen = drawerOpen,
                        onToggleDrawer = { viewModel.toggleAppDrawer(it) },
                        appSearchQuery = appSearchQuery,
                        onAppSearchQueryChange = { viewModel.setAppSearchQuery(it) },
                        onQuickSosTrigger = { safetyTriggerViewModel.armQuickAccessSos(3) }
                    )
                }

                AppMode.SAFE_HAVEN -> {
                    SafeHavenScreen(
                        currentTab = currentTab,
                        onSelectTab = { viewModel.selectTab(it) },
                        onPanicExit = { viewModel.panicCamouflage() },
                        lifelines = viewModel.nationalLifelines,
                        isSirenActive = isSirenActive,
                        onCallResource = { viewModel.callResource(it) },
                        onCallDirect = { viewModel.callDirect(it) },
                        onSendGuardianSos = { safetyTriggerViewModel.armQuickAccessSos(3) },
                        onToggleSiren = { viewModel.toggleSiren() },
                        selectedProvince = selectedProvince,
                        onSelectProvince = { viewModel.setProvinceFilter(it) },
                        tccSearchQuery = tccSearchQuery,
                        onTccSearchQueryChange = { viewModel.setTccSearchQuery(it) },
                        incidents = incidents,
                        onOpenAddIncidentModal = { viewModel.openNewIncidentModal() },
                        onDeleteIncident = { viewModel.deleteIncident(it) },
                        onExportSummary = { viewModel.exportProtectionOrderSummary() },
                        showAddIncidentModal = showAddIncidentModal,
                        onCloseAddIncidentModal = { viewModel.closeNewIncidentModal() },
                        onSaveIncident = { type, sev, perp, loc, desc, inj, wit, ob ->
                            viewModel.saveIncident(type, sev, perp, loc, desc, inj, wit, ob)
                        },
                        exportedSummary = exportedSummary,
                        onDismissExportDialog = { viewModel.dismissExportDialog() },
                        guardians = guardians,
                        onOpenAddGuardianModal = { viewModel.openNewGuardianModal() },
                        onDeleteGuardian = { viewModel.deleteGuardian(it) },
                        showAddGuardianModal = showAddGuardianModal,
                        onCloseAddGuardianModal = { viewModel.closeNewGuardianModal() },
                        onSaveGuardian = { name, rel, phone, primary ->
                            viewModel.saveFullIceContact(
                                name, "", phone, "", "", "", "", "", "", true, rel, primary
                            )
                        },
                        onSaveFullIceContact = { name, sur, m1, m2, e1, e2, tiktok, fb, ig, wa, rel, prim ->
                            viewModel.saveFullIceContact(name, sur, m1, m2, e1, e2, tiktok, fb, ig, wa, rel, prim)
                        },
                        isVaultUnlocked = isVaultUnlocked,
                        onTriggerBiometricAuth = onTriggerBiometricAuth,
                        onLockVault = { viewModel.lockVaultBiometrically() },
                        onDispatchWhatsApp = { contact -> viewModel.dispatchWhatsAppAlert(contact) },
                        onDispatchEmail = { contact -> viewModel.dispatchEmailAlert(contact) },
                        onDispatchSocial = { contact, platform -> viewModel.dispatchSocialAlert(contact, platform) },
                        onDownloadOfflineMaps = { viewModel.promptDownloadOfflineMaps() },
                        onOpenFindMyDevice = { viewModel.openFindMyDevice() },
                        currentAreaName = currentAreaName,
                        statusNotification = statusNotification,
                        onClearStatusNotification = { viewModel.clearStatusNotification() },
                        userProfile = userProfile,
                        onSaveUserProfile = { viewModel.saveUserProfile(it) },
                        onOpenSetupWizard = { viewModel.startOnboardingWizard() }
                    )
                }
            }
        }

        }

        // State-driven Quick-Access SOS Overlay (armed countdown, cancel, dispatch confirmation)
        SafetyTriggerOverlay(
            signalState = safetySignalState,
            onCancelSos = { safetyTriggerViewModel.cancelArmedSos() },
            onInstantDispatch = { safetyTriggerViewModel.triggerInstantSos() },
            onDismiss = { safetyTriggerViewModel.resetToIdle() },
            onCallPolice = { safetyTriggerViewModel.callPoliceDirectly() },
            onCallGbvcc = { safetyTriggerViewModel.callGbvccDirectly() },
            onDispatchWhatsApp = { safetyTriggerViewModel.dispatchWhatsAppBeacon() },
            onOpenFindMyDevice = { safetyTriggerViewModel.openFindMyDevice() },
            onDownloadOfflineMaps = { safetyTriggerViewModel.promptDownloadOfflineMaps() }
        )
    }
}
