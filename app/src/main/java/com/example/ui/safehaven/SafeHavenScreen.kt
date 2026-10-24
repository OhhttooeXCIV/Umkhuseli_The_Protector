package com.example.ui.safehaven

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.LocalHospital
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.local.entity.GuardianEntity
import com.example.data.local.entity.IncidentEntity
import com.example.data.model.Province
import com.example.data.model.SafetyResource
import com.example.ui.theme.SafetyRed
import com.example.ui.theme.SafetyRedDark
import com.example.ui.theme.SankofaCardBg
import com.example.ui.theme.SankofaDarkBg
import com.example.ui.theme.SankofaGold
import com.example.ui.theme.SankofaSurface
import com.example.ui.theme.TextPrimary
import com.example.ui.theme.TextSecondary
import com.example.data.local.entity.UserProfileEntity
import androidx.compose.material.icons.filled.Warning
import com.example.ui.viewmodel.SafeHavenTab

@Composable
fun SafeHavenScreen(
    currentTab: SafeHavenTab,
    onSelectTab: (SafeHavenTab) -> Unit,
    onPanicExit: () -> Unit,
    lifelines: List<SafetyResource>,
    isSirenActive: Boolean,
    onCallResource: (SafetyResource) -> Unit,
    onCallDirect: (String) -> Unit,
    onSendGuardianSos: () -> Unit,
    onToggleSiren: () -> Unit,
    selectedProvince: Province,
    onSelectProvince: (Province) -> Unit,
    tccSearchQuery: String,
    onTccSearchQueryChange: (String) -> Unit,
    incidents: List<IncidentEntity>,
    onOpenAddIncidentModal: () -> Unit,
    onDeleteIncident: (IncidentEntity) -> Unit,
    onExportSummary: () -> Unit,
    showAddIncidentModal: Boolean,
    onCloseAddIncidentModal: () -> Unit,
    onSaveIncident: (
        incidentType: String,
        severity: Int,
        perpetrator: String,
        location: String,
        description: String,
        injuries: String,
        witnesses: String,
        policeObNumber: String
    ) -> Unit,
    exportedSummary: String?,
    onDismissExportDialog: () -> Unit,
    guardians: List<GuardianEntity>,
    onOpenAddGuardianModal: () -> Unit,
    onDeleteGuardian: (GuardianEntity) -> Unit,
    showAddGuardianModal: Boolean,
    onCloseAddGuardianModal: () -> Unit,
    onSaveGuardian: (name: String, relationship: String, phoneNumber: String, isPrimary: Boolean) -> Unit,
    onSaveFullIceContact: (
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
    ) -> Unit,
    isVaultUnlocked: Boolean = false,
    onTriggerBiometricAuth: () -> Unit = {},
    onLockVault: () -> Unit = {},
    onDispatchWhatsApp: (GuardianEntity) -> Unit = {},
    onDispatchEmail: (GuardianEntity) -> Unit = {},
    onDispatchSocial: (GuardianEntity, String) -> Unit = { _, _ -> },
    onDownloadOfflineMaps: () -> Unit = {},
    onOpenFindMyDevice: () -> Unit = {},
    currentAreaName: String = "Detecting Area...",
    statusNotification: String?,
    onClearStatusNotification: () -> Unit,
    userProfile: UserProfileEntity? = null,
    onSaveUserProfile: (UserProfileEntity) -> Unit = {},
    onOpenSetupWizard: () -> Unit = {},
    onSendAutoPleaseCallMe: () -> Unit = {},
    onDispatch72HourBeacon: () -> Unit = {},
    activeJourneyTitle: String? = null,
    onStartSafeJourney: () -> Unit = {},
    onEndSafeJourney: () -> Unit = {},
    nearestTccName: String? = null,
    nearestTccDistance: String? = null,
    nearestTccPhone: String? = null,
    nearestSapsName: String? = null,
    nearestSapsDistance: String? = null,
    nearestSapsPhone: String? = null,
    onCallNearestFacility: (String) -> Unit = {}
) {
    // Back gesture instantly triggers camouflage exit to facade
    BackHandler {
        onPanicExit()
    }

    val snackbarHostState = remember { SnackbarHostState() }

    LaunchedEffect(statusNotification) {
        if (statusNotification != null) {
            snackbarHostState.showSnackbar(statusNotification)
            onClearStatusNotification()
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(SankofaDarkBg)
            .statusBarsPadding()
            .navigationBarsPadding()
    ) {
        Column(modifier = Modifier.fillMaxSize()) {
            // Panic Camouflage Emergency Header
            Surface(
                color = Color(0xFF1F1012),
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("panic_header_bar")
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 10.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(8.dp)
                                    .background(SafetyRed, shape = RoundedCornerShape(4.dp))
                            )
                            Text(
                                text = "SHIELD ACTIVE",
                                style = MaterialTheme.typography.labelMedium.copy(
                                    fontWeight = FontWeight.ExtraBold,
                                    letterSpacing = 1.sp,
                                    color = SafetyRed
                                )
                            )
                        }
                        Text(
                            text = "South Africa GBV Haven",
                            style = MaterialTheme.typography.bodySmall.copy(color = TextSecondary)
                        )
                    }

                    // QUICK EXIT / CAMOUFLAGE BUTTON
                    Button(
                        onClick = onPanicExit,
                        colors = ButtonDefaults.buttonColors(containerColor = SafetyRed),
                        shape = RoundedCornerShape(20.dp),
                        contentPadding = PaddingValues(horizontal = 14.dp, vertical = 8.dp),
                        modifier = Modifier.testTag("panic_exit_button")
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.VisibilityOff,
                                contentDescription = null,
                                tint = Color.White,
                                modifier = Modifier.size(16.dp)
                            )
                            Text(
                                text = "QUICK EXIT",
                                fontWeight = FontWeight.ExtraBold,
                                fontSize = 12.sp,
                                color = Color.White
                            )
                        }
                    }
                }
            }

            // Tab Content
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f)
            ) {
                when (currentTab) {
                    SafeHavenTab.SOS_EMERGENCY -> {
                        EmergencySosSection(
                            lifelines = lifelines,
                            isSirenActive = isSirenActive,
                            onCallResource = onCallResource,
                            onSendGuardianSos = onSendGuardianSos,
                            onToggleSiren = onToggleSiren,
                            onSendAutoPleaseCallMe = onSendAutoPleaseCallMe,
                            onDispatch72HourBeacon = onDispatch72HourBeacon,
                            activeJourneyTitle = activeJourneyTitle,
                            onStartSafeJourney = onStartSafeJourney,
                            onEndSafeJourney = onEndSafeJourney,
                            nearestTccName = nearestTccName,
                            nearestTccDistance = nearestTccDistance,
                            nearestTccPhone = nearestTccPhone,
                            nearestSapsName = nearestSapsName,
                            nearestSapsDistance = nearestSapsDistance,
                            nearestSapsPhone = nearestSapsPhone,
                            onCallNearestFacility = onCallNearestFacility
                        )
                    }
                    SafeHavenTab.TCC_CENTERS -> {
                        ThuthuzelaSection(
                            selectedProvince = selectedProvince,
                            onSelectProvince = onSelectProvince,
                            searchQuery = tccSearchQuery,
                            onSearchQueryChange = onTccSearchQueryChange,
                            onCallCenter = onCallDirect
                        )
                    }
                    SafeHavenTab.EVIDENCE_VAULT -> {
                        if (userProfile?.userRole == "MALE_GUARDIAN_RESPONDER") {
                            GuardianResponderSection(
                                nearestTccName = nearestTccName,
                                nearestTccDistance = nearestTccDistance,
                                nearestTccPhone = nearestTccPhone,
                                nearestSapsName = nearestSapsName,
                                nearestSapsDistance = nearestSapsDistance,
                                nearestSapsPhone = nearestSapsPhone,
                                onCallNearestFacility = onCallNearestFacility,
                                onCallSaps = { onCallNearestFacility("10111") },
                                onCallGbvcc = { onCallNearestFacility("0800428428") }
                            )
                        } else {
                            EvidenceVaultSection(
                                incidents = incidents,
                                isVaultUnlocked = isVaultUnlocked,
                                onTriggerBiometricAuth = onTriggerBiometricAuth,
                                onLockVault = onLockVault,
                                onOpenAddModal = onOpenAddIncidentModal,
                                onDeleteIncident = onDeleteIncident,
                                onExportSummary = onExportSummary,
                                showAddModal = showAddIncidentModal,
                                onCloseAddModal = onCloseAddIncidentModal,
                                onSaveIncident = onSaveIncident,
                                exportedSummary = exportedSummary,
                                onDismissExportDialog = onDismissExportDialog,
                                userProfile = userProfile,
                                onSaveUserProfile = onSaveUserProfile
                            )
                        }
                    }
                    SafeHavenTab.SAFETY_PLAN -> {
                        SafetyPlanSection(
                            guardians = guardians,
                            onOpenAddGuardian = onOpenAddGuardianModal,
                            onDeleteGuardian = onDeleteGuardian,
                            showAddGuardianModal = showAddGuardianModal,
                            onCloseAddGuardianModal = onCloseAddGuardianModal,
                            onSaveFullIceContact = onSaveFullIceContact,
                            onDispatchWhatsApp = onDispatchWhatsApp,
                            onDispatchEmail = onDispatchEmail,
                            onDispatchSocial = onDispatchSocial,
                            onDownloadOfflineMaps = onDownloadOfflineMaps,
                            onOpenFindMyDevice = onOpenFindMyDevice,
                            currentAreaName = currentAreaName
                        )
                    }
                }
            }

            // Bottom Navigation Bar
            NavigationBar(
                containerColor = SankofaSurface,
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("safehaven_bottom_navigation")
            ) {
                NavigationBarItem(
                    selected = currentTab == SafeHavenTab.SOS_EMERGENCY,
                    onClick = { onSelectTab(SafeHavenTab.SOS_EMERGENCY) },
                    icon = {
                        Icon(
                            imageVector = Icons.Default.Phone,
                            contentDescription = "SOS"
                        )
                    },
                    label = { Text("SOS", fontSize = 11.sp) },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = Color.White,
                        selectedTextColor = SafetyRed,
                        indicatorColor = SafetyRed,
                        unselectedIconColor = TextSecondary,
                        unselectedTextColor = TextSecondary
                    ),
                    modifier = Modifier.testTag("nav_tab_sos")
                )

                NavigationBarItem(
                    selected = currentTab == SafeHavenTab.TCC_CENTERS,
                    onClick = { onSelectTab(SafeHavenTab.TCC_CENTERS) },
                    icon = {
                        Icon(
                            imageVector = Icons.Default.LocalHospital,
                            contentDescription = "Shelters"
                        )
                    },
                    label = { Text("Shelters", fontSize = 11.sp) },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = Color(0xFF141006),
                        selectedTextColor = SankofaGold,
                        indicatorColor = SankofaGold,
                        unselectedIconColor = TextSecondary,
                        unselectedTextColor = TextSecondary
                    ),
                    modifier = Modifier.testTag("nav_tab_centers")
                )

                val isGuardian = userProfile?.userRole == "MALE_GUARDIAN_RESPONDER"
                NavigationBarItem(
                    selected = currentTab == SafeHavenTab.EVIDENCE_VAULT,
                    onClick = { onSelectTab(SafeHavenTab.EVIDENCE_VAULT) },
                    icon = {
                        Icon(
                            imageVector = if (isGuardian) Icons.Default.Shield else Icons.Default.Lock,
                            contentDescription = if (isGuardian) "Guardian HQ" else "Vault"
                        )
                    },
                    label = { Text(if (isGuardian) "Guardian" else "Vault", fontSize = 11.sp) },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = Color(0xFF141006),
                        selectedTextColor = SankofaGold,
                        indicatorColor = SankofaGold,
                        unselectedIconColor = TextSecondary,
                        unselectedTextColor = TextSecondary
                    ),
                    modifier = Modifier.testTag("nav_tab_vault")
                )

                NavigationBarItem(
                    selected = currentTab == SafeHavenTab.SAFETY_PLAN,
                    onClick = { onSelectTab(SafeHavenTab.SAFETY_PLAN) },
                    icon = {
                        Icon(
                            imageVector = Icons.Default.Shield,
                            contentDescription = "Safety Plan"
                        )
                    },
                    label = { Text("Plan", fontSize = 11.sp) },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = Color(0xFF141006),
                        selectedTextColor = SankofaGold,
                        indicatorColor = SankofaGold,
                        unselectedIconColor = TextSecondary,
                        unselectedTextColor = TextSecondary
                    ),
                    modifier = Modifier.testTag("nav_tab_plan")
                )
            }
        }

        SnackbarHost(
            hostState = snackbarHostState,
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .padding(bottom = 70.dp)
        )
    }
}
