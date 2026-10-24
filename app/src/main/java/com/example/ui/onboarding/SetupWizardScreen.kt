package com.example.ui.onboarding

import android.Manifest
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.PowerManager
import android.provider.Settings
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.BatteryAlert
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.ColorLens
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Map
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material.icons.filled.Place
import androidx.compose.material.icons.filled.Security
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material.icons.filled.Sms
import androidx.compose.material.icons.filled.Speed
import androidx.compose.material.icons.filled.Tune
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Checkbox
import androidx.compose.material3.CheckboxDefaults
import androidx.compose.material3.Divider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import androidx.core.content.PermissionChecker
import com.example.data.local.entity.GuardianEntity
import com.example.data.local.entity.UserProfileEntity
import com.example.ui.theme.SafetyAmber
import com.example.ui.theme.SafetyGreen
import com.example.ui.theme.SafetyRed
import com.example.ui.theme.SankofaCardBg
import com.example.ui.theme.SankofaGold
import com.example.ui.theme.SankofaGoldLight
import com.example.ui.theme.SankofaSurface
import com.example.ui.theme.TextPrimary
import com.example.ui.theme.TextSecondary

enum class OnboardingStep {
    GATEWAY_CHOICE,
    STEP_1_PERMISSIONS,
    STEP_2_GUARDIANS,
    STEP_3_OPTIMIZATION
}

@Composable
fun SetupWizardScreen(
    initialUserProfile: UserProfileEntity?,
    onCompleteProfileAndSetup: (UserProfileEntity, List<GuardianEntity>) -> Unit,
    onContinueLimitedAccess: () -> Unit
) {
    var currentStep by remember { mutableStateOf(OnboardingStep.GATEWAY_CHOICE) }

    // User Profile Form State
    var legalNames by remember { mutableStateOf(initialUserProfile?.fullLegalNames ?: "") }
    var idNumber by remember { mutableStateOf(initialUserProfile?.idOrPassportNumber ?: "") }
    var contactPhone by remember { mutableStateOf(initialUserProfile?.safeContactNumber ?: "") }
    var safeAddress by remember { mutableStateOf(initialUserProfile?.safeServiceAddress ?: "") }
    var isAddressWithheld by remember { mutableStateOf(initialUserProfile?.isAddressWithheld ?: false) }
    var relationship by remember { mutableStateOf(initialUserProfile?.relationshipToRespondent ?: "Spouse / Partner") }
    var respondentName by remember { mutableStateOf(initialUserProfile?.respondentName ?: "") }

    // Optimization Settings State
    var useLauncherTheme by remember { mutableStateOf(initialUserProfile?.useDynamicLauncherTheme ?: false) }
    var duressPin by remember { mutableStateOf(initialUserProfile?.duressPin ?: "9999") }
    var autoScrubMedia by remember { mutableStateOf(initialUserProfile?.autoScrubMedia ?: true) }

    // ICE Guardians State (Minimum 1 recommended, up to 5)
    val guardiansList = remember {
        mutableStateListOf<GuardianEntity>().apply {
            add(
                GuardianEntity(
                    id = 0,
                    name = "Sindi",
                    surname = "Mthembu",
                    mobileNumber1 = "0721234567",
                    relationship = "Sister",
                    notifyViaSms = true,
                    isPrimary = true
                )
            )
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF090A0F))
            .padding(16.dp)
    ) {
        when (currentStep) {
            OnboardingStep.GATEWAY_CHOICE -> {
                GatewayChoiceView(
                    onStartWizard = { currentStep = OnboardingStep.STEP_1_PERMISSIONS },
                    onLimitedAccess = onContinueLimitedAccess
                )
            }
            OnboardingStep.STEP_1_PERMISSIONS -> {
                Step1PermissionsView(
                    onNext = { currentStep = OnboardingStep.STEP_2_GUARDIANS }
                )
            }
            OnboardingStep.STEP_2_GUARDIANS -> {
                Step2GuardiansView(
                    guardians = guardiansList,
                    onAddGuardian = { guardiansList.add(it) },
                    onRemoveGuardian = { guardiansList.remove(it) },
                    onBack = { currentStep = OnboardingStep.STEP_1_PERMISSIONS },
                    onNext = { currentStep = OnboardingStep.STEP_3_OPTIMIZATION }
                )
            }
            OnboardingStep.STEP_3_OPTIMIZATION -> {
                Step3OptimizationView(
                    legalNames = legalNames,
                    onLegalNamesChange = { legalNames = it },
                    idNumber = idNumber,
                    onIdNumberChange = { idNumber = it },
                    contactPhone = contactPhone,
                    onContactPhoneChange = { contactPhone = it },
                    safeAddress = safeAddress,
                    onSafeAddressChange = { safeAddress = it },
                    isAddressWithheld = isAddressWithheld,
                    onIsAddressWithheldChange = { isAddressWithheld = it },
                    relationship = relationship,
                    onRelationshipChange = { relationship = it },
                    respondentName = respondentName,
                    onRespondentNameChange = { respondentName = it },
                    useLauncherTheme = useLauncherTheme,
                    onUseLauncherThemeChange = { useLauncherTheme = it },
                    duressPin = duressPin,
                    onDuressPinChange = { duressPin = it },
                    autoScrubMedia = autoScrubMedia,
                    onAutoScrubMediaChange = { autoScrubMedia = it },
                    onBack = { currentStep = OnboardingStep.STEP_2_GUARDIANS },
                    onFinish = {
                        val validation = com.example.service.SouthAfricanIdValidator.validateAndProfile(idNumber)
                        val profile = UserProfileEntity(
                            id = 1L,
                            fullLegalNames = legalNames.ifBlank { "Registered User" },
                            idOrPassportNumber = idNumber,
                            safeContactNumber = contactPhone,
                            safeServiceAddress = safeAddress,
                            isAddressWithheld = isAddressWithheld,
                            relationshipToRespondent = relationship,
                            respondentName = respondentName,
                            useDynamicLauncherTheme = useLauncherTheme,
                            duressPin = duressPin,
                            autoScrubMedia = autoScrubMedia,
                            isProfileCompleted = true,
                            userRole = validation.determinedRole.name,
                            gender = validation.gender.name,
                            dateOfBirth = validation.dateOfBirthFormatted,
                            hashedIdNumber = validation.hashedId,
                            isNrsoCleared = !validation.isNrsoBlacklisted,
                            isDeviceBlocked = validation.isNrsoBlacklisted
                        )
                        onCompleteProfileAndSetup(profile, guardiansList.toList())
                    }
                )
            }
        }
    }
}

@Composable
fun GatewayChoiceView(
    onStartWizard: () -> Unit,
    onLimitedAccess: () -> Unit
) {
    val carouselState = rememberPagerState(pageCount = { 3 })

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState()),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.SpaceBetween
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Spacer(modifier = Modifier.height(20.dp))

            Box(
                modifier = Modifier
                    .size(64.dp)
                    .clip(CircleShape)
                    .background(Color(0xFF1E293B))
                    .border(2.dp, SankofaGold, CircleShape),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Default.Shield,
                    contentDescription = null,
                    tint = SankofaGold,
                    modifier = Modifier.size(36.dp)
                )
            }

            Spacer(modifier = Modifier.height(14.dp))
            Text(
                text = "UMKHUSELI SAFE SHIELD",
                style = MaterialTheme.typography.titleMedium.copy(
                    fontWeight = FontWeight.Black,
                    letterSpacing = 2.sp,
                    color = SankofaGold
                )
            )
            Text(
                text = "South African Covert GBV Response & Evidence Vault",
                style = MaterialTheme.typography.bodySmall.copy(
                    color = TextSecondary,
                    textAlign = TextAlign.Center
                ),
                modifier = Modifier.padding(horizontal = 24.dp, vertical = 4.dp)
            )

            Spacer(modifier = Modifier.height(20.dp))

            // Interactive Capability Carousel
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(210.dp)
            ) {
                HorizontalPager(
                    state = carouselState,
                    modifier = Modifier.fillMaxSize()
                ) { page ->
                    when (page) {
                        0 -> CapabilitySlideCard(
                            icon = Icons.Default.Lock,
                            title = "Zero-Knowledge Evidence Vault",
                            description = "Hardware-backed AES-256-GCM encryption. Photos & voice notes auto-scrub from device gallery to prevent abuser detection.",
                            badge = "SURVEILLANCE CAMOUFLAGE"
                        )
                        1 -> CapabilitySlideCard(
                            icon = Icons.Default.Phone,
                            title = "Unstoppable SOS Beacon",
                            description = "Server-side webhook triggers 72-hour GPS distress beacon to 5 ICE guardians even if handset is destroyed or toggled to Airplane Mode.",
                            badge = "UNSTOPPABLE LIFELINE"
                        )
                        2 -> CapabilitySlideCard(
                            icon = Icons.Default.Security,
                            title = "Form 2 Court Affidavit Generator",
                            description = "Transforms testimony in 5 SA languages into sworn statutory affidavit for the Magistrates' Court pursuant to the Domestic Violence Act.",
                            badge = "COURT ADMISSIBLE"
                        )
                    }
                }
            }

            // Pager Dots
            Row(
                modifier = Modifier.padding(top = 10.dp),
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                repeat(3) { index ->
                    Box(
                        modifier = Modifier
                            .size(if (carouselState.currentPage == index) 8.dp else 6.dp)
                            .clip(CircleShape)
                            .background(if (carouselState.currentPage == index) SankofaGold else Color(0xFF334155))
                    )
                }
            }
        }

        // Actions Section
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 16.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            Button(
                onClick = onStartWizard,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(50.dp),
                colors = ButtonDefaults.buttonColors(containerColor = SankofaGold),
                shape = RoundedCornerShape(14.dp)
            ) {
                Icon(imageVector = Icons.Default.Security, contentDescription = null, tint = Color(0xFF0F172A))
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "Initialize Protection Profile (Full Access)",
                    color = Color(0xFF0F172A),
                    fontWeight = FontWeight.Bold,
                    fontSize = 13.sp
                )
            }

            OutlinedButton(
                onClick = onLimitedAccess,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(46.dp),
                shape = RoundedCornerShape(14.dp),
                colors = ButtonDefaults.outlinedButtonColors(containerColor = Color(0xFF131722))
            ) {
                Text(
                    text = "Quick Crisis Mode (Lifelines & Centres Only)",
                    color = TextPrimary,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.SemiBold
                )
            }

            Text(
                text = "Notice: Acute crisis lifelines (10111 & 0800 428 428) are always accessible without a profile.",
                color = Color(0xFF64748B),
                fontSize = 10.sp,
                textAlign = TextAlign.Center,
                modifier = Modifier.fillMaxWidth()
            )
        }
    }
}

@Composable
fun CapabilitySlideCard(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    title: String,
    description: String,
    badge: String
) {
    Card(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 4.dp),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF131722)),
        border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF262D40))
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(20.dp),
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .size(40.dp)
                        .clip(CircleShape)
                        .background(Color(0xFF1E293B)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(imageVector = icon, contentDescription = null, tint = SankofaGold, modifier = Modifier.size(20.dp))
                }
                Surface(
                    color = Color(0xFF1E293B),
                    shape = RoundedCornerShape(6.dp)
                ) {
                    Text(
                        text = badge,
                        color = Color(0xFF38BDF8),
                        fontSize = 9.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                    )
                }
            }

            Column {
                Text(
                    text = title,
                    color = Color.White,
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(bottom = 6.dp)
                )
                Text(
                    text = description,
                    color = TextSecondary,
                    fontSize = 11.sp,
                    lineHeight = 16.sp
                )
            }
        }
    }
}

@Composable
fun Step1PermissionsView(onNext: () -> Unit) {
    val context = LocalContext.current
    var hasPhonePermission by remember {
        mutableStateOf(ContextCompat.checkSelfPermission(context, Manifest.permission.CALL_PHONE) == PermissionChecker.PERMISSION_GRANTED)
    }
    var hasSmsPermission by remember {
        mutableStateOf(ContextCompat.checkSelfPermission(context, Manifest.permission.SEND_SMS) == PermissionChecker.PERMISSION_GRANTED)
    }
    var hasLocationPermission by remember {
        mutableStateOf(ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_FINE_LOCATION) == PermissionChecker.PERMISSION_GRANTED)
    }

    val launcher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        hasPhonePermission = permissions[Manifest.permission.CALL_PHONE] ?: hasPhonePermission
        hasSmsPermission = permissions[Manifest.permission.SEND_SMS] ?: hasSmsPermission
        hasLocationPermission = permissions[Manifest.permission.ACCESS_FINE_LOCATION] ?: hasLocationPermission
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState()),
        verticalArrangement = Arrangement.SpaceBetween
    ) {
        Column {
            Text(text = "STEP 1 OF 3", color = SankofaGold, fontSize = 11.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.sp)
            Text(text = "Device Lifeline Permissions", style = MaterialTheme.typography.titleLarge.copy(color = Color.White, fontWeight = FontWeight.Black))
            Text(
                text = "Umkhuseli operates silently in low-connectivity South African environments. These permissions ensure immediate rescue dispatch:",
                color = TextSecondary,
                fontSize = 12.sp,
                modifier = Modifier.padding(top = 4.dp, bottom = 16.dp)
            )

            PermissionRowItem(
                icon = Icons.Default.Phone,
                title = "Direct Emergency Call",
                description = "Instantly dials SAPS 10111 & GBV Command Centre (0800 428 428) in 1 tap.",
                isGranted = hasPhonePermission
            )

            PermissionRowItem(
                icon = Icons.Default.Sms,
                title = "Low-Data SMS Dispatch",
                description = "Pings GPS location distress beacon to ICE guardians during loadshedding when data is off.",
                isGranted = hasSmsPermission
            )

            PermissionRowItem(
                icon = Icons.Default.Place,
                title = "Live GPS Coordinates",
                description = "Locates closest 24/7 Thuthuzela Care Centre and embeds coordinates into emergency beacons.",
                isGranted = hasLocationPermission
            )

            Button(
                onClick = {
                    launcher.launch(
                        arrayOf(
                            Manifest.permission.CALL_PHONE,
                            Manifest.permission.SEND_SMS,
                            Manifest.permission.ACCESS_FINE_LOCATION,
                            Manifest.permission.ACCESS_COARSE_LOCATION
                        )
                    )
                },
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF1E293B)),
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 12.dp)
            ) {
                Text("Grant Lifeline Permissions", color = SankofaGoldLight, fontWeight = FontWeight.Bold)
            }
        }

        Button(
            onClick = onNext,
            modifier = Modifier
                .fillMaxWidth()
                .height(48.dp),
            colors = ButtonDefaults.buttonColors(containerColor = SankofaGold),
            shape = RoundedCornerShape(12.dp)
        ) {
            Text("Continue to ICE Guardians", color = Color(0xFF0F172A), fontWeight = FontWeight.Bold)
            Spacer(modifier = Modifier.width(6.dp))
            Icon(imageVector = Icons.Default.ChevronRight, contentDescription = null, tint = Color(0xFF0F172A))
        }
    }
}

@Composable
fun PermissionRowItem(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    title: String,
    description: String,
    isGranted: Boolean
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 6.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF131722)),
        border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF262D40))
    ) {
        Row(
            modifier = Modifier.padding(14.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(38.dp)
                    .clip(CircleShape)
                    .background(if (isGranted) Color(0xFF0F231D) else Color(0xFF221518)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    tint = if (isGranted) SafetyGreen else SafetyAmber,
                    modifier = Modifier.size(18.dp)
                )
            }
            Spacer(modifier = Modifier.width(12.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(text = title, color = Color.White, fontSize = 13.sp, fontWeight = FontWeight.Bold)
                Text(text = description, color = TextSecondary, fontSize = 11.sp)
            }
            Spacer(modifier = Modifier.width(8.dp))
            Surface(
                color = if (isGranted) Color(0xFF0F231D) else Color(0xFF2A2012),
                shape = RoundedCornerShape(6.dp)
            ) {
                Text(
                    text = if (isGranted) "ACTIVE" else "PENDING",
                    color = if (isGranted) SafetyGreen else SafetyAmber,
                    fontSize = 9.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 3.dp)
                )
            }
        }
    }
}

@Composable
fun Step2GuardiansView(
    guardians: List<GuardianEntity>,
    onAddGuardian: (GuardianEntity) -> Unit,
    onRemoveGuardian: (GuardianEntity) -> Unit,
    onBack: () -> Unit,
    onNext: () -> Unit
) {
    var showAddForm by remember { mutableStateOf(false) }
    var name by remember { mutableStateOf("") }
    var surname by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf("") }
    var rel by remember { mutableStateOf("Friend / Trusted Contact") }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState()),
        verticalArrangement = Arrangement.SpaceBetween
    ) {
        Column {
            Text(text = "STEP 2 OF 3", color = SankofaGold, fontSize = 11.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.sp)
            Text(text = "Review In-Case-of-Emergency (ICE)", style = MaterialTheme.typography.titleLarge.copy(color = Color.White, fontWeight = FontWeight.Black))
            Text(
                text = "These trusted guardians will receive your live 72-hour GPS distress beacon during an emergency trigger:",
                color = TextSecondary,
                fontSize = 12.sp,
                modifier = Modifier.padding(top = 4.dp, bottom = 12.dp)
            )

            // Review Before Create Card
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF131722)),
                border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF262D40))
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    Text(
                        text = "REGISTERED GUARDIANS (${guardians.size} of 5)",
                        color = Color(0xFF38BDF8),
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(8.dp))

                    if (guardians.isEmpty()) {
                        Text(text = "No guardians registered yet. Please add at least one trusted contact.", color = SafetyAmber, fontSize = 12.sp)
                    } else {
                        guardians.forEach { g ->
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(vertical = 4.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Column {
                                    Text(text = "${g.name} ${g.surname}".trim(), color = Color.White, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                                    Text(text = "${g.mobileNumber1} &bull; ${g.relationship}", color = TextSecondary, fontSize = 10.sp)
                                }
                                IconButton(onClick = { onRemoveGuardian(g) }, modifier = Modifier.size(24.dp)) {
                                    Icon(imageVector = Icons.Default.Delete, contentDescription = null, tint = SafetyRed, modifier = Modifier.size(16.dp))
                                }
                            }
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            if (!showAddForm && guardians.size < 5) {
                Button(
                    onClick = { showAddForm = true },
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF1E293B)),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text("+ Add Another ICE Guardian", color = Color.White, fontSize = 12.sp)
                }
            }

            if (showAddForm) {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF1A2234)),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Text(text = "Add ICE Guardian", color = SankofaGold, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        OutlinedTextField(
                            value = name,
                            onValueChange = { name = it },
                            label = { Text("First Name") },
                            singleLine = true,
                            modifier = Modifier.fillMaxWidth()
                        )
                        OutlinedTextField(
                            value = phone,
                            onValueChange = { phone = it },
                            label = { Text("South African Mobile (e.g. 0721234567)") },
                            singleLine = true,
                            modifier = Modifier.fillMaxWidth()
                        )
                        OutlinedTextField(
                            value = rel,
                            onValueChange = { rel = it },
                            label = { Text("Relationship (Sister, Mother, Friend)") },
                            singleLine = true,
                            modifier = Modifier.fillMaxWidth()
                        )

                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.End) {
                            TextButton(onClick = { showAddForm = false }) { Text("Cancel", color = TextSecondary) }
                            Button(
                                onClick = {
                                    if (name.isNotBlank() && phone.isNotBlank()) {
                                        onAddGuardian(
                                            GuardianEntity(
                                                id = 0,
                                                name = name,
                                                surname = surname,
                                                mobileNumber1 = phone,
                                                relationship = rel,
                                                isPrimary = guardians.isEmpty()
                                            )
                                        )
                                        name = ""
                                        phone = ""
                                        showAddForm = false
                                    }
                                },
                                colors = ButtonDefaults.buttonColors(containerColor = SankofaGold)
                            ) {
                                Text("Add", color = Color(0xFF0F172A))
                            }
                        }
                    }
                }
            }
        }

        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 12.dp),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            OutlinedButton(onClick = onBack) { Text("Back", color = Color.White) }
            Button(
                onClick = onNext,
                enabled = guardians.isNotEmpty(),
                colors = ButtonDefaults.buttonColors(containerColor = SankofaGold)
            ) {
                Text("Continue to Optimization", color = Color(0xFF0F172A), fontWeight = FontWeight.Bold)
            }
        }
    }
}

@Composable
fun Step3OptimizationView(
    legalNames: String,
    onLegalNamesChange: (String) -> Unit,
    idNumber: String,
    onIdNumberChange: (String) -> Unit,
    contactPhone: String,
    onContactPhoneChange: (String) -> Unit,
    safeAddress: String,
    onSafeAddressChange: (String) -> Unit,
    isAddressWithheld: Boolean,
    onIsAddressWithheldChange: (Boolean) -> Unit,
    relationship: String,
    onRelationshipChange: (String) -> Unit,
    respondentName: String,
    onRespondentNameChange: (String) -> Unit,
    useLauncherTheme: Boolean,
    onUseLauncherThemeChange: (Boolean) -> Unit,
    duressPin: String,
    onDuressPinChange: (String) -> Unit,
    autoScrubMedia: Boolean,
    onAutoScrubMediaChange: (Boolean) -> Unit,
    onBack: () -> Unit,
    onFinish: () -> Unit
) {
    val context = LocalContext.current

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState()),
        verticalArrangement = Arrangement.SpaceBetween
    ) {
        Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
            Text(text = "STEP 3 OF 3", color = SankofaGold, fontSize = 11.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.sp)
            Text(text = "Optimization & Covert Profile", style = MaterialTheme.typography.titleLarge.copy(color = Color.White, fontWeight = FontWeight.Black))

            // Section A: Complainant Legal Details for Form 2
            Text(text = "Complainant Legal Particulars (Domestic Violence Act)", color = Color(0xFF38BDF8), fontSize = 12.sp, fontWeight = FontWeight.Bold)
            OutlinedTextField(
                value = legalNames,
                onValueChange = onLegalNamesChange,
                label = { Text("Your Full Legal Names (Complainant)") },
                singleLine = true,
                modifier = Modifier.fillMaxWidth()
            )
            OutlinedTextField(
                value = idNumber,
                onValueChange = onIdNumberChange,
                label = { Text("South African 13-Digit ID Number") },
                singleLine = true,
                modifier = Modifier.fillMaxWidth()
            )

            if (idNumber.length == 13 && idNumber.all { it.isDigit() }) {
                val validation = com.example.service.SouthAfricanIdValidator.validateAndProfile(idNumber)
                if (validation.isValid) {
                    val isFemale = validation.gender == com.example.service.SouthAfricanGender.FEMALE
                    val badgeColor = if (isFemale) SafetyGreen else Color(0xFF00B0FF)
                    val badgeText = if (isFemale) {
                        "✓ Verified: Female Primary Sanctuary Access (DOB: ${validation.dateOfBirthFormatted})"
                    } else {
                        "ℹ Verified: Male Ally • Guardian Responder Mode (DOB: ${validation.dateOfBirthFormatted})"
                    }
                    Text(
                        text = badgeText,
                        color = badgeColor,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(start = 4.dp, top = 2.dp)
                    )
                } else if (validation.isNrsoBlacklisted) {
                    Text(
                        text = "⚠ System Verification Notice: DHA-701 Verification Required",
                        color = SafetyRed,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(start = 4.dp, top = 2.dp)
                    )
                } else {
                    Text(
                        text = "⚠ ${validation.errorMessage ?: "Invalid South African ID"}",
                        color = SafetyAmber,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Medium,
                        modifier = Modifier.padding(start = 4.dp, top = 2.dp)
                    )
                }
            }
            OutlinedTextField(
                value = contactPhone,
                onValueChange = onContactPhoneChange,
                label = { Text("Safe Contact Mobile Number") },
                singleLine = true,
                modifier = Modifier.fillMaxWidth()
            )
            OutlinedTextField(
                value = respondentName,
                onValueChange = onRespondentNameChange,
                label = { Text("Respondent / Abuser Full Name") },
                singleLine = true,
                modifier = Modifier.fillMaxWidth()
            )

            // Section 4(2) Safe Address Toggle
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color(0xFF131722), RoundedCornerShape(8.dp))
                    .border(1.dp, Color(0xFF262D40), RoundedCornerShape(8.dp))
                    .padding(8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Checkbox(
                    checked = isAddressWithheld,
                    onCheckedChange = onIsAddressWithheldChange,
                    colors = CheckboxDefaults.colors(checkedColor = SafetyRed)
                )
                Column {
                    Text("Section 4(2) Safe Address Protection", color = Color.White, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    Text("Withhold residential address from respondent for safety", color = TextSecondary, fontSize = 9.sp)
                }
            }

            OutlinedTextField(
                value = safeAddress,
                onValueChange = onSafeAddressChange,
                label = { Text(if (isAddressWithheld) "Alternative Safe Service Address / SAPS Station" else "Physical Service Address") },
                modifier = Modifier.fillMaxWidth()
            )

            Divider(color = Color(0xFF262D40))

            // Section B: Crucial Android Performance & Optimization Settings
            Text(text = "Covert Shield & OS Performance Settings", color = Color(0xFF38BDF8), fontSize = 12.sp, fontWeight = FontWeight.Bold)

            // Setting 1: Battery Optimization Exemption
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF131722)),
                border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF262D40))
            ) {
                Column(modifier = Modifier.padding(12.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(imageVector = Icons.Default.BatteryAlert, contentDescription = null, tint = SafetyAmber, modifier = Modifier.size(20.dp))
                            Spacer(modifier = Modifier.width(8.dp))
                            Column {
                                Text("Battery Saver Exemption", color = Color.White, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                                Text("Prevents Samsung/Xiaomi OS from killing 72-hr beacon", color = TextSecondary, fontSize = 10.sp)
                            }
                        }
                        Button(
                            onClick = {
                                try {
                                    val intent = Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS).apply {
                                        data = Uri.parse("package:${context.packageName}")
                                        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                                    }
                                    context.startActivity(intent)
                                } catch (_: Exception) {
                                    val fallback = Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS)
                                    context.startActivity(fallback)
                                }
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF1E293B)),
                            shape = RoundedCornerShape(8.dp)
                        ) {
                            Text("Whitelist", color = SankofaGoldLight, fontSize = 11.sp)
                        }
                    }
                }
            }

            // Setting 2: Match Launcher Dynamic Theme
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF131722)),
                border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF262D40))
            ) {
                Row(
                    modifier = Modifier.padding(12.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(imageVector = Icons.Default.ColorLens, contentDescription = null, tint = SankofaGold, modifier = Modifier.size(20.dp))
                        Spacer(modifier = Modifier.width(8.dp))
                        Column {
                            Text("Match Device Launcher Theme", color = Color.White, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                            Text("Material You Dynamic Colors for 100% incognito camouflage", color = TextSecondary, fontSize = 10.sp)
                        }
                    }
                    Switch(
                        checked = useLauncherTheme,
                        onCheckedChange = onUseLauncherThemeChange,
                        colors = SwitchDefaults.colors(checkedThumbColor = SankofaGold, checkedTrackColor = Color(0xFF332506))
                    )
                }
            }

            // Setting 3: Duress PIN
            OutlinedTextField(
                value = duressPin,
                onValueChange = onDuressPinChange,
                label = { Text("Covert Duress PIN (Default: 9999)") },
                supportingText = { Text("If forced to unlock, enter this PIN to show a fake electricity receipt while silently sending SOS.") },
                singleLine = true,
                modifier = Modifier.fillMaxWidth()
            )
        }

        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 16.dp),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            OutlinedButton(onClick = onBack) { Text("Back", color = Color.White) }
            Button(
                onClick = onFinish,
                enabled = legalNames.isNotBlank(),
                colors = ButtonDefaults.buttonColors(containerColor = SankofaGold)
            ) {
                Text("Complete & Activate Shield", color = Color(0xFF0F172A), fontWeight = FontWeight.Bold)
            }
        }
    }
}
