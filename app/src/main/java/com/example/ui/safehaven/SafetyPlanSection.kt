package com.example.ui.safehaven

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Download
import androidx.compose.material.icons.filled.Gavel
import androidx.compose.material.icons.filled.KeyboardArrowDown
import androidx.compose.material.icons.filled.KeyboardArrowUp
import androidx.compose.material.icons.filled.Map
import androidx.compose.material.icons.filled.NearMe
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material.icons.filled.Share
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material.icons.filled.Work
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Checkbox
import androidx.compose.material3.CheckboxDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.local.entity.GuardianEntity
import com.example.ui.theme.SafetyAmber
import com.example.ui.theme.SafetyGreen
import com.example.ui.theme.SafetyRed
import com.example.ui.theme.SankofaCardBg
import com.example.ui.theme.SankofaGold
import com.example.ui.theme.SankofaSurface
import com.example.ui.theme.TextMuted
import com.example.ui.theme.TextPrimary
import com.example.ui.theme.TextSecondary

@Composable
fun SafetyPlanSection(
    guardians: List<GuardianEntity>,
    onOpenAddGuardian: () -> Unit,
    onDeleteGuardian: (GuardianEntity) -> Unit,
    showAddGuardianModal: Boolean,
    onCloseAddGuardianModal: () -> Unit,
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
    onDispatchWhatsApp: (GuardianEntity) -> Unit = {},
    onDispatchEmail: (GuardianEntity) -> Unit = {},
    onDispatchSocial: (GuardianEntity, String) -> Unit = { _, _ -> },
    onDownloadOfflineMaps: () -> Unit = {},
    onOpenFindMyDevice: () -> Unit = {},
    currentAreaName: String = "Detecting City / Area..."
) {
    var isGoBagExpanded by remember { mutableStateOf(false) }
    var isLegalRightsExpanded by remember { mutableStateOf(false) }

    // Go-Bag Checklist states (in memory for session safety)
    val checkedItems = remember { mutableStateListOf<String>() }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp),
        contentPadding = PaddingValues(top = 10.dp, bottom = 32.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Geolocation, Offline Google Maps & Find My Device Card
        item {
            Card(
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF131A24)),
                border = CardDefaults.outlinedCardBorder().copy(
                    brush = Brush.linearGradient(listOf(Color(0xFF4285F4), Color(0x334285F4)))
                ),
                modifier = Modifier.fillMaxWidth().testTag("geolocation_offline_maps_card")
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(36.dp)
                                .clip(CircleShape)
                                .background(Color(0x334285F4)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.NearMe,
                                contentDescription = null,
                                tint = Color(0xFF4285F4),
                                modifier = Modifier.size(20.dp)
                            )
                        }
                        Column {
                            Text(
                                text = "Current Identified Area",
                                style = MaterialTheme.typography.labelSmall.copy(color = Color(0xFF90CAF9))
                            )
                            Text(
                                text = currentAreaName,
                                style = MaterialTheme.typography.titleSmall.copy(
                                    fontWeight = FontWeight.Bold,
                                    color = TextPrimary
                                )
                            )
                        }
                    }

                    Text(
                        text = "Prompt: In case of network blackout or zero airtime during an emergency, download your local municipality map for offline navigation.",
                        style = MaterialTheme.typography.bodySmall.copy(color = TextSecondary)
                    )

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Button(
                            onClick = onDownloadOfflineMaps,
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF1E88E5)),
                            shape = RoundedCornerShape(12.dp),
                            modifier = Modifier.weight(1f).testTag("download_offline_maps_button")
                        ) {
                            Icon(Icons.Default.Download, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.size(6.dp))
                            Text("Offline Maps", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                        }

                        OutlinedButton(
                            onClick = onOpenFindMyDevice,
                            shape = RoundedCornerShape(12.dp),
                            modifier = Modifier.weight(1f).testTag("open_find_my_device_button")
                        ) {
                            Icon(Icons.Default.Map, contentDescription = null, tint = SankofaGold, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.size(6.dp))
                            Text("Find My Device", fontSize = 11.sp, color = TextPrimary)
                        }
                    }
                }
            }
        }

        // 5 ICE Contacts Recommendation Banner (if fewer than 5 contacts)
        if (guardians.size < 5) {
            item {
                Card(
                    shape = RoundedCornerShape(18.dp),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF24160E)),
                    border = CardDefaults.outlinedCardBorder().copy(
                        brush = Brush.linearGradient(listOf(SafetyAmber, Color(0x33FFA000)))
                    ),
                    modifier = Modifier.fillMaxWidth().testTag("ice_prompt_banner")
                ) {
                    Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Icon(Icons.Default.Warning, contentDescription = null, tint = SafetyAmber)
                            Text(
                                text = "Action: Complete 5 ICE Contacts (${guardians.size}/5)",
                                style = MaterialTheme.typography.titleSmall.copy(
                                    fontWeight = FontWeight.Bold,
                                    color = SafetyAmber
                                )
                            )
                        }
                        Text(
                            text = "South African GBV protection guidelines advise configuring 5 verified In Case of Emergency contacts. Each contact receives 72-hour live beacons, mobile alerts, and social channel dispatch.",
                            style = MaterialTheme.typography.bodySmall.copy(color = TextSecondary)
                        )
                        Button(
                            onClick = onOpenAddGuardian,
                            colors = ButtonDefaults.buttonColors(containerColor = SafetyAmber),
                            shape = RoundedCornerShape(10.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text("Add ICE Contact #${guardians.size + 1}", color = Color.Black, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }

        // Trusted Emergency Guardians Header
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "ICE Contacts (${guardians.size} / 5)",
                        style = MaterialTheme.typography.titleMedium.copy(
                            fontWeight = FontWeight.Bold,
                            color = SankofaGold
                        )
                    )
                    Text(
                        text = "Receive distress alerts, live GPS link, and 72-hr WhatsApp beacons",
                        style = MaterialTheme.typography.bodySmall.copy(color = TextSecondary)
                    )
                }

                Button(
                    onClick = onOpenAddGuardian,
                    colors = ButtonDefaults.buttonColors(containerColor = SankofaGold),
                    shape = RoundedCornerShape(12.dp),
                    contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp),
                    modifier = Modifier.testTag("add_guardian_button")
                ) {
                    Icon(
                        imageVector = Icons.Default.Add,
                        contentDescription = null,
                        tint = Color(0xFF141006),
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.size(4.dp))
                    Text("Add ICE", color = Color(0xFF141006), fontWeight = FontWeight.Bold, fontSize = 12.sp)
                }
            }
        }

        // Guardians List
        if (guardians.isEmpty()) {
            item {
                Card(
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = SankofaSurface),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(
                        text = "No ICE contacts configured yet. Add trusted contacts to receive your 72-hour live GPS coordinates and emergency dispatch.",
                        style = MaterialTheme.typography.bodyMedium.copy(color = TextMuted),
                        modifier = Modifier.padding(16.dp)
                    )
                }
            }
        }

        items(guardians, key = { it.id }) { guardian ->
            IceContactCard(
                guardian = guardian,
                onDelete = { onDeleteGuardian(guardian) },
                onSendWhatsApp = { onDispatchWhatsApp(guardian) },
                onSendEmail = { onDispatchEmail(guardian) },
                onSendSocial = { platform -> onDispatchSocial(guardian, platform) }
            )
        }

        // Emergency Go-Bag Checklist
        item {
            Card(
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = SankofaCardBg),
                modifier = Modifier.fillMaxWidth().testTag("go_bag_card")
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { isGoBagExpanded = !isGoBagExpanded },
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(36.dp)
                                    .clip(CircleShape)
                                    .background(Color(0x332E7D32)),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Work,
                                    contentDescription = null,
                                    tint = SafetyGreen,
                                    modifier = Modifier.size(20.dp)
                                )
                            }
                            Column {
                                Text(
                                    text = "Escape 'Go-Bag' Checklist",
                                    style = MaterialTheme.typography.titleSmall.copy(
                                        fontWeight = FontWeight.Bold,
                                        color = TextPrimary
                                    )
                                )
                                Text(
                                    text = "Prepared items hidden in a safe location",
                                    style = MaterialTheme.typography.bodySmall.copy(color = SafetyGreen)
                                )
                            }
                        }

                        Icon(
                            imageVector = if (isGoBagExpanded) Icons.Default.KeyboardArrowUp else Icons.Default.KeyboardArrowDown,
                            contentDescription = "Toggle",
                            tint = TextSecondary
                        )
                    }

                    AnimatedVisibility(visible = isGoBagExpanded) {
                        Column(
                            modifier = Modifier.padding(top = 12.dp),
                            verticalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            val checklist = listOf(
                                "South African Smart ID Card or Green Barcoded ID Book",
                                "SASSA Child Support / Disability / Older Persons Grant Cards",
                                "Children's Birth Certificates & Clinic Road to Health Cards",
                                "Emergency Cash (hidden from shared bank accounts)",
                                "Duplicate Car & Residence Keys",
                                "Spare Phone or unregistered backup SIM card",
                                "Chronic Medication (ARVs, Insulin, Asthma Pumps) & Prescriptions",
                                "Change of comfortable clothes & children's essentials"
                            )

                            checklist.forEach { itemText ->
                                val isChecked = checkedItems.contains(itemText)
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .clip(RoundedCornerShape(8.dp))
                                        .clickable {
                                            if (isChecked) checkedItems.remove(itemText) else checkedItems.add(itemText)
                                        }
                                        .padding(vertical = 4.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Checkbox(
                                        checked = isChecked,
                                        onCheckedChange = { checked ->
                                            if (checked) checkedItems.add(itemText) else checkedItems.remove(itemText)
                                        },
                                        colors = CheckboxDefaults.colors(
                                            checkedColor = SafetyGreen,
                                            checkmarkColor = Color.White,
                                            uncheckedColor = TextMuted
                                        )
                                    )
                                    Text(
                                        text = itemText,
                                        style = MaterialTheme.typography.bodySmall.copy(
                                            color = if (isChecked) TextMuted else TextPrimary,
                                            fontSize = 12.sp
                                        )
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }

        // South African Domestic Violence Legal Rights Explainer
        item {
            Card(
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = SankofaSurface),
                border = CardDefaults.outlinedCardBorder().copy(
                    brush = Brush.linearGradient(listOf(Color(0xFF2A2B3D), Color(0x112A2B3D)))
                ),
                modifier = Modifier.fillMaxWidth().testTag("legal_rights_card")
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { isLegalRightsExpanded = !isLegalRightsExpanded },
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(36.dp)
                                    .clip(CircleShape)
                                    .background(Color(0x33D6A84F)),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Gavel,
                                    contentDescription = null,
                                    tint = SankofaGold,
                                    modifier = Modifier.size(20.dp)
                                )
                            }
                            Column {
                                Text(
                                    text = "Your Rights Under South African Law",
                                    style = MaterialTheme.typography.titleSmall.copy(
                                        fontWeight = FontWeight.Bold,
                                        color = TextPrimary
                                    )
                                )
                                Text(
                                    text = "Domestic Violence Act 116 of 1998",
                                    style = MaterialTheme.typography.bodySmall.copy(color = SankofaGold)
                                )
                            }
                        }

                        Icon(
                            imageVector = if (isLegalRightsExpanded) Icons.Default.KeyboardArrowUp else Icons.Default.KeyboardArrowDown,
                            contentDescription = "Toggle",
                            tint = TextSecondary
                        )
                    }

                    AnimatedVisibility(visible = isLegalRightsExpanded) {
                        Column(
                            modifier = Modifier.padding(top = 14.dp),
                            verticalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            LegalInfoItem(
                                title = "1. You don't need a lawyer to get a Protection Order",
                                desc = "Go to your nearest Magistrates Court. The Clerk of the Court is legally required to assist you in completing Form 2 free of charge."
                            )
                            LegalInfoItem(
                                title = "2. Interim Protection Orders are immediate",
                                desc = "If you face imminent danger, the magistrate can issue an Interim Order the very same day without the respondent present."
                            )
                            LegalInfoItem(
                                title = "3. Suspended Warrant of Arrest is automatic",
                                desc = "Every protection order in South Africa includes a suspended warrant of arrest. If the perpetrator violates ANY term, hand the warrant to SAPS for immediate arrest."
                            )
                        }
                    }
                }
            }
        }
    }

    // Modal: Add New 5 ICE Contact
    if (showAddGuardianModal) {
        AddIceContactDialog(
            onDismiss = onCloseAddGuardianModal,
            onSave = onSaveFullIceContact,
            contactIndex = guardians.size + 1
        )
    }
}

@Composable
fun IceContactCard(
    guardian: GuardianEntity,
    onDelete: () -> Unit,
    onSendWhatsApp: () -> Unit,
    onSendEmail: () -> Unit = {},
    onSendSocial: (platform: String) -> Unit = {}
) {
    Card(
        shape = RoundedCornerShape(18.dp),
        colors = CardDefaults.cardColors(containerColor = SankofaSurface),
        border = CardDefaults.outlinedCardBorder().copy(
            brush = Brush.linearGradient(listOf(Color(0xFF2A2B3D), Color(0x112A2B3D)))
        ),
        modifier = Modifier
            .fillMaxWidth()
            .testTag("guardian_item_${guardian.id}")
    ) {
        Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(42.dp)
                            .clip(CircleShape)
                            .background(Color(0x33D6A84F)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.Person,
                            contentDescription = null,
                            tint = SankofaGold,
                            modifier = Modifier.size(24.dp)
                        )
                    }

                    Column {
                        Text(
                            text = guardian.fullName,
                            style = MaterialTheme.typography.titleSmall.copy(
                                fontWeight = FontWeight.Bold,
                                color = TextPrimary
                            )
                        )
                        Text(
                            text = guardian.relationship,
                            style = MaterialTheme.typography.bodySmall.copy(color = SankofaGold)
                        )
                    }
                }

                IconButton(
                    onClick = onDelete,
                    modifier = Modifier.size(32.dp).testTag("delete_guardian_${guardian.id}")
                ) {
                    Icon(
                        imageVector = Icons.Default.Delete,
                        contentDescription = "Delete",
                        tint = TextMuted,
                        modifier = Modifier.size(18.dp)
                    )
                }
            }

            // Contact Numbers
            Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
                Text(
                    text = "• Mobile 1: ${guardian.mobileNumber1}",
                    style = MaterialTheme.typography.bodySmall.copy(color = TextPrimary)
                )
                if (guardian.mobileNumber2.isNotBlank()) {
                    Text(
                        text = "• Mobile 2: ${guardian.mobileNumber2}",
                        style = MaterialTheme.typography.bodySmall.copy(color = TextSecondary)
                    )
                }
                if (guardian.emailAddress1.isNotBlank()) {
                    Text(
                        text = "• Email: ${guardian.emailAddress1}",
                        style = MaterialTheme.typography.bodySmall.copy(color = TextMuted, fontSize = 11.sp)
                    )
                }
                if (guardian.emailAddress2.isNotBlank()) {
                    Text(
                        text = "• Email 2: ${guardian.emailAddress2}",
                        style = MaterialTheme.typography.bodySmall.copy(color = TextMuted, fontSize = 11.sp)
                    )
                }
            }

            // Social Media Tags (TikTok, Facebook, Instagram) - Clickable to dispatch emergency message
            if (guardian.tiktokHandle.isNotBlank() || guardian.facebookProfile.isNotBlank() || guardian.instagramHandle.isNotBlank()) {
                Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    Text(
                        text = "Emergency Social Channels (Tap to send alert):",
                        style = MaterialTheme.typography.labelSmall.copy(color = TextMuted, fontSize = 10.sp)
                    )
                    Row(
                        modifier = Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()),
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        if (guardian.instagramHandle.isNotBlank()) {
                            Surface(
                                shape = RoundedCornerShape(6.dp),
                                color = Color(0x33E1306C),
                                modifier = Modifier.clickable { onSendSocial("instagram") }
                            ) {
                                Text(
                                    text = "IG: @${guardian.instagramHandle} ↗",
                                    color = Color(0xFFFF80AB),
                                    fontSize = 11.sp,
                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                                )
                            }
                        }
                        if (guardian.tiktokHandle.isNotBlank()) {
                            Surface(
                                shape = RoundedCornerShape(6.dp),
                                color = Color(0x3300F2FE),
                                modifier = Modifier.clickable { onSendSocial("tiktok") }
                            ) {
                                Text(
                                    text = "TikTok: @${guardian.tiktokHandle} ↗",
                                    color = Color(0xFF80DEEA),
                                    fontSize = 11.sp,
                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                                )
                            }
                        }
                        if (guardian.facebookProfile.isNotBlank()) {
                            Surface(
                                shape = RoundedCornerShape(6.dp),
                                color = Color(0x331877F2),
                                modifier = Modifier.clickable { onSendSocial("facebook") }
                            ) {
                                Text(
                                    text = "FB: ${guardian.facebookProfile} ↗",
                                    color = Color(0xFF90CAF9),
                                    fontSize = 11.sp,
                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                                )
                            }
                        }
                    }
                }
            }

            // Dispatch buttons row: WhatsApp & Email
            Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                // 72-Hour Live Beacon WhatsApp Dispatch
                if (guardian.hasWhatsAppAccess) {
                    Button(
                        onClick = onSendWhatsApp,
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF25D366)),
                        shape = RoundedCornerShape(12.dp),
                        contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp),
                        modifier = Modifier.fillMaxWidth().testTag("whatsapp_dispatch_${guardian.id}")
                    ) {
                        Icon(
                            imageVector = Icons.Default.Share,
                            contentDescription = null,
                            tint = Color.White,
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.size(6.dp))
                        Text(
                            text = "Send 72-Hr Live Location via WhatsApp",
                            color = Color.White,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }

                // Email Emergency Dispatch
                if (guardian.emailAddress1.isNotBlank()) {
                    OutlinedButton(
                        onClick = onSendEmail,
                        shape = RoundedCornerShape(12.dp),
                        contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp),
                        modifier = Modifier.fillMaxWidth().testTag("email_dispatch_${guardian.id}")
                    ) {
                        Icon(
                            imageVector = Icons.Default.Share,
                            contentDescription = null,
                            tint = SankofaGold,
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.size(6.dp))
                        Text(
                            text = "Send Distress Alert via Email",
                            color = TextPrimary,
                            fontSize = 12.sp
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun AddIceContactDialog(
    onDismiss: () -> Unit,
    onSave: (
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
    contactIndex: Int = 1
) {
    var name by remember { mutableStateOf("") }
    var surname by remember { mutableStateOf("") }
    var mobile1 by remember { mutableStateOf("") }
    var mobile2 by remember { mutableStateOf("") }
    var email1 by remember { mutableStateOf("") }
    var email2 by remember { mutableStateOf("") }
    var tiktok by remember { mutableStateOf("") }
    var facebook by remember { mutableStateOf("") }
    var instagram by remember { mutableStateOf("") }
    var whatsappAccess by remember { mutableStateOf(true) }
    var relationship by remember { mutableStateOf("") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Text(
                text = "Add ICE Contact ($contactIndex of 5)",
                style = MaterialTheme.typography.titleMedium.copy(
                    fontWeight = FontWeight.Bold,
                    color = SankofaGold
                )
            )
        },
        text = {
            Column(
                modifier = Modifier.fillMaxWidth().verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Text(
                    text = "Collect complete contact and social details to guarantee distress dispatch across phone, email, and social networks.",
                    style = MaterialTheme.typography.bodySmall.copy(color = TextSecondary)
                )

                OutlinedTextField(
                    value = name,
                    onValueChange = { name = it },
                    label = { Text("First Name *") },
                    singleLine = true,
                    colors = OutlinedTextFieldDefaults.colors(focusedTextColor = TextPrimary, unfocusedTextColor = TextPrimary, focusedBorderColor = SankofaGold),
                    modifier = Modifier.fillMaxWidth().testTag("ice_name_input")
                )

                OutlinedTextField(
                    value = surname,
                    onValueChange = { surname = it },
                    label = { Text("Surname (Optional)") },
                    singleLine = true,
                    colors = OutlinedTextFieldDefaults.colors(focusedTextColor = TextPrimary, unfocusedTextColor = TextPrimary, focusedBorderColor = SankofaGold),
                    modifier = Modifier.fillMaxWidth()
                )

                OutlinedTextField(
                    value = mobile1,
                    onValueChange = { mobile1 = it },
                    label = { Text("Mobile Number 1 * (e.g. 0821234567)") },
                    singleLine = true,
                    colors = OutlinedTextFieldDefaults.colors(focusedTextColor = TextPrimary, unfocusedTextColor = TextPrimary, focusedBorderColor = SankofaGold),
                    modifier = Modifier.fillMaxWidth().testTag("ice_mobile1_input")
                )

                OutlinedTextField(
                    value = mobile2,
                    onValueChange = { mobile2 = it },
                    label = { Text("Mobile Number 2 (Optional)") },
                    singleLine = true,
                    colors = OutlinedTextFieldDefaults.colors(focusedTextColor = TextPrimary, unfocusedTextColor = TextPrimary, focusedBorderColor = SankofaGold),
                    modifier = Modifier.fillMaxWidth()
                )

                OutlinedTextField(
                    value = email1,
                    onValueChange = { email1 = it },
                    label = { Text("Email Address 1 *") },
                    singleLine = true,
                    colors = OutlinedTextFieldDefaults.colors(focusedTextColor = TextPrimary, unfocusedTextColor = TextPrimary, focusedBorderColor = SankofaGold),
                    modifier = Modifier.fillMaxWidth().testTag("ice_email1_input")
                )

                OutlinedTextField(
                    value = email2,
                    onValueChange = { email2 = it },
                    label = { Text("Email Address 2 (Optional)") },
                    singleLine = true,
                    colors = OutlinedTextFieldDefaults.colors(focusedTextColor = TextPrimary, unfocusedTextColor = TextPrimary, focusedBorderColor = SankofaGold),
                    modifier = Modifier.fillMaxWidth()
                )

                OutlinedTextField(
                    value = relationship,
                    onValueChange = { relationship = it },
                    label = { Text("Relationship (e.g. Sister, Best Friend, Mother)") },
                    singleLine = true,
                    colors = OutlinedTextFieldDefaults.colors(focusedTextColor = TextPrimary, unfocusedTextColor = TextPrimary, focusedBorderColor = SankofaGold),
                    modifier = Modifier.fillMaxWidth()
                )

                Text(
                    text = "Social Media Accounts (Emergency Handles):",
                    style = MaterialTheme.typography.labelMedium.copy(color = SankofaGold, fontWeight = FontWeight.Bold),
                    modifier = Modifier.padding(top = 6.dp)
                )

                OutlinedTextField(
                    value = instagram,
                    onValueChange = { instagram = it },
                    label = { Text("Instagram Handle (e.g. username)") },
                    singleLine = true,
                    colors = OutlinedTextFieldDefaults.colors(focusedTextColor = TextPrimary, unfocusedTextColor = TextPrimary, focusedBorderColor = SankofaGold),
                    modifier = Modifier.fillMaxWidth()
                )

                OutlinedTextField(
                    value = tiktok,
                    onValueChange = { tiktok = it },
                    label = { Text("TikTok Handle (e.g. username)") },
                    singleLine = true,
                    colors = OutlinedTextFieldDefaults.colors(focusedTextColor = TextPrimary, unfocusedTextColor = TextPrimary, focusedBorderColor = SankofaGold),
                    modifier = Modifier.fillMaxWidth()
                )

                OutlinedTextField(
                    value = facebook,
                    onValueChange = { facebook = it },
                    label = { Text("Facebook Profile / Name") },
                    singleLine = true,
                    colors = OutlinedTextFieldDefaults.colors(focusedTextColor = TextPrimary, unfocusedTextColor = TextPrimary, focusedBorderColor = SankofaGold),
                    modifier = Modifier.fillMaxWidth()
                )

                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.padding(top = 4.dp)
                ) {
                    Checkbox(
                        checked = whatsappAccess,
                        onCheckedChange = { whatsappAccess = it },
                        colors = CheckboxDefaults.colors(checkedColor = Color(0xFF25D366))
                    )
                    Text(
                        text = "Enable WhatsApp 72-hr live location dispatch",
                        style = MaterialTheme.typography.bodySmall.copy(color = TextPrimary)
                    )
                }
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    if (name.isNotBlank() && mobile1.isNotBlank()) {
                        onSave(
                            name,
                            surname,
                            mobile1,
                            mobile2,
                            email1,
                            email2,
                            tiktok,
                            facebook,
                            instagram,
                            whatsappAccess,
                            relationship,
                            false
                        )
                    }
                },
                enabled = name.isNotBlank() && mobile1.isNotBlank(),
                colors = ButtonDefaults.buttonColors(containerColor = SankofaGold),
                modifier = Modifier.testTag("save_ice_contact_button")
            ) {
                Text("Save ICE Contact", color = Color(0xFF141006), fontWeight = FontWeight.Bold)
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel", color = TextSecondary)
            }
        },
        containerColor = SankofaSurface
    )
}

@Composable
fun LegalInfoItem(title: String, desc: String) {
    Column {
        Text(text = title, fontWeight = FontWeight.Bold, color = TextPrimary, fontSize = 13.sp)
        Text(text = desc, color = TextSecondary, fontSize = 12.sp, lineHeight = 16.sp)
    }
}

