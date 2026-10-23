package com.example.ui.safehaven

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
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
import androidx.compose.material.icons.filled.Description
import androidx.compose.material.icons.filled.Fingerprint
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.LockOpen
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.ExposedDropdownMenuDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Slider
import androidx.compose.material3.SliderDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
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
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.local.entity.IncidentEntity
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
fun EvidenceVaultSection(
    incidents: List<IncidentEntity>,
    isVaultUnlocked: Boolean,
    onTriggerBiometricAuth: () -> Unit,
    onLockVault: () -> Unit,
    onOpenAddModal: () -> Unit,
    onDeleteIncident: (IncidentEntity) -> Unit,
    onExportSummary: () -> Unit,
    showAddModal: Boolean,
    onCloseAddModal: () -> Unit,
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
    onDismissExportDialog: () -> Unit
) {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp),
        contentPadding = PaddingValues(top = 10.dp, bottom = 32.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        // Biometric Security Gate Banner
        item {
            if (!isVaultUnlocked) {
                Card(
                    shape = RoundedCornerShape(22.dp),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF1F1216)),
                    border = CardDefaults.outlinedCardBorder().copy(
                        brush = Brush.linearGradient(listOf(SafetyAmber, Color(0x33FFA000)))
                    ),
                    modifier = Modifier.fillMaxWidth().testTag("vault_biometric_locked_card")
                ) {
                    Column(
                        modifier = Modifier.padding(18.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(52.dp)
                                .clip(CircleShape)
                                .background(Color(0x33FFA000)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.Fingerprint,
                                contentDescription = "Biometric Lock",
                                tint = SafetyAmber,
                                modifier = Modifier.size(32.dp)
                            )
                        }

                        Text(
                            text = "EVIDENCE VAULT ENCRYPTED",
                            style = MaterialTheme.typography.titleMedium.copy(
                                fontWeight = FontWeight.ExtraBold,
                                color = TextPrimary,
                                letterSpacing = 1.sp
                            )
                        )

                        Text(
                            text = "Sensitive incident logs, witness statements, and legal records are encrypted with AES-256-GCM. Biometric authentication (Fingerprint, Face, or PIN) is required to decrypt.",
                            style = MaterialTheme.typography.bodySmall.copy(
                                color = TextSecondary,
                                textAlign = TextAlign.Center
                            )
                        )

                        Button(
                            onClick = onTriggerBiometricAuth,
                            colors = ButtonDefaults.buttonColors(containerColor = SankofaGold),
                            shape = RoundedCornerShape(16.dp),
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(50.dp)
                                .testTag("authenticate_biometric_button")
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Fingerprint,
                                    contentDescription = null,
                                    tint = Color(0xFF141006)
                                )
                                Text(
                                    text = "AUTHENTICATE TO UNLOCK VAULT",
                                    color = Color(0xFF141006),
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 12.sp
                                )
                            }
                        }
                    }
                }
            } else {
                Card(
                    shape = RoundedCornerShape(20.dp),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF121B14)),
                    border = CardDefaults.outlinedCardBorder().copy(
                        brush = Brush.linearGradient(listOf(SafetyGreen, Color(0x332E7D32)))
                    ),
                    modifier = Modifier.fillMaxWidth().testTag("vault_biometric_unlocked_card")
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(38.dp)
                                    .clip(CircleShape)
                                    .background(Color(0x332E7D32)),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    imageVector = Icons.Default.LockOpen,
                                    contentDescription = null,
                                    tint = SafetyGreen,
                                    modifier = Modifier.size(20.dp)
                                )
                            }
                            Column {
                                Text(
                                    text = "Vault Unlocked & Decrypted",
                                    style = MaterialTheme.typography.titleSmall.copy(
                                        fontWeight = FontWeight.Bold,
                                        color = TextPrimary
                                    )
                                )
                                Text(
                                    text = "AES-256 protected session active",
                                    style = MaterialTheme.typography.bodySmall.copy(color = SafetyGreen)
                                )
                            }
                        }

                        OutlinedButton(
                            onClick = onLockVault,
                            shape = RoundedCornerShape(12.dp),
                            modifier = Modifier.testTag("lock_vault_now_button")
                        ) {
                            Text("Lock Vault", fontSize = 11.sp, color = TextPrimary)
                        }
                    }
                }
            }
        }

        // Action Buttons Row (Log Incident & Export Form 2)
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Button(
                    onClick = onOpenAddModal,
                    colors = ButtonDefaults.buttonColors(containerColor = SankofaGold),
                    shape = RoundedCornerShape(14.dp),
                    modifier = Modifier
                        .weight(1f)
                        .testTag("log_new_incident_button")
                ) {
                    Icon(
                        imageVector = Icons.Default.Add,
                        contentDescription = null,
                        tint = Color(0xFF141006)
                    )
                    Spacer(modifier = Modifier.size(6.dp))
                    Text("Log Incident", color = Color(0xFF141006), fontWeight = FontWeight.Bold)
                }

                OutlinedButton(
                    onClick = onExportSummary,
                    shape = RoundedCornerShape(14.dp),
                    border = CardDefaults.outlinedCardBorder().copy(
                        brush = Brush.linearGradient(listOf(SankofaGold, Color(0x33D6A84F)))
                    ),
                    modifier = Modifier
                        .weight(1f)
                        .testTag("export_form2_button")
                ) {
                    Icon(
                        imageVector = Icons.Default.Description,
                        contentDescription = null,
                        tint = SankofaGold
                    )
                    Spacer(modifier = Modifier.size(6.dp))
                    Text("Export Form 2", color = TextPrimary, fontWeight = FontWeight.SemiBold)
                }
            }
        }

        // Incident Count Header
        item {
            Text(
                text = "Recorded Incidents (${incidents.size})",
                style = MaterialTheme.typography.titleMedium.copy(
                    fontWeight = FontWeight.Bold,
                    color = SankofaGold
                )
            )
        }

        if (incidents.isEmpty()) {
            item {
                Card(
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = SankofaSurface),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(
                        text = "No incidents logged yet. Tap '+ Log Incident' to record timestamped documentation of abuse or threats.",
                        style = MaterialTheme.typography.bodyMedium.copy(color = TextMuted),
                        modifier = Modifier.padding(20.dp)
                    )
                }
            }
        }

        // Incident Cards
        items(incidents, key = { it.id }) { incident ->
            IncidentItemCard(
                incident = incident,
                onDelete = { onDeleteIncident(incident) }
            )
        }
    }

    // Modal: Add New Incident
    if (showAddModal) {
        AddIncidentDialog(
            onDismiss = onCloseAddModal,
            onSave = onSaveIncident
        )
    }

    // Modal: Export Form 2 Court Summary
    if (exportedSummary != null) {
        ExportSummaryDialog(
            summaryText = exportedSummary,
            onDismiss = onDismissExportDialog
        )
    }
}

@Composable
fun IncidentItemCard(
    incident: IncidentEntity,
    onDelete: () -> Unit
) {
    val severityColor = when (incident.severityLevel) {
        5 -> SafetyRed
        4 -> Color(0xFFFF5722)
        3 -> SafetyAmber
        2 -> Color(0xFFFBC02D)
        else -> SafetyGreen
    }

    Card(
        shape = RoundedCornerShape(18.dp),
        colors = CardDefaults.cardColors(containerColor = SankofaSurface),
        border = CardDefaults.outlinedCardBorder().copy(
            brush = Brush.linearGradient(listOf(Color(0xFF2A2B3D), Color(0x112A2B3D)))
        ),
        modifier = Modifier
            .fillMaxWidth()
            .testTag("incident_item_${incident.id}")
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Surface(
                        shape = RoundedCornerShape(6.dp),
                        color = severityColor.copy(alpha = 0.2f)
                    ) {
                        Text(
                            text = "Level ${incident.severityLevel}/5",
                            color = severityColor,
                            fontWeight = FontWeight.Bold,
                            fontSize = 11.sp,
                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                        )
                    }
                    Text(
                        text = incident.incidentType,
                        style = MaterialTheme.typography.titleSmall.copy(
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary
                        )
                    )
                }

                IconButton(
                    onClick = onDelete,
                    modifier = Modifier.size(32.dp).testTag("delete_incident_${incident.id}")
                ) {
                    Icon(
                        imageVector = Icons.Default.Delete,
                        contentDescription = "Delete",
                        tint = TextMuted,
                        modifier = Modifier.size(18.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(4.dp))

            Text(
                text = "${incident.dateTimeFormatted} • ${incident.locationDescription}",
                style = MaterialTheme.typography.bodySmall.copy(color = TextMuted)
            )

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = incident.description,
                style = MaterialTheme.typography.bodyMedium.copy(
                    color = TextSecondary,
                    lineHeight = 20.sp
                )
            )

            if (incident.injuriesOrImpact.isNotBlank()) {
                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    text = "Impact / Injuries: ${incident.injuriesOrImpact}",
                    style = MaterialTheme.typography.bodySmall.copy(
                        color = SafetyAmber,
                        fontWeight = FontWeight.Medium
                    )
                )
            }

            if (incident.policeObNumber.isNotBlank()) {
                Spacer(modifier = Modifier.height(6.dp))
                Surface(
                    shape = RoundedCornerShape(6.dp),
                    color = Color(0x22FFFFFF)
                ) {
                    Text(
                        text = "SAPS OB #: ${incident.policeObNumber}",
                        style = MaterialTheme.typography.labelSmall.copy(
                            color = SankofaGold,
                            fontWeight = FontWeight.Bold
                        ),
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                    )
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AddIncidentDialog(
    onDismiss: () -> Unit,
    onSave: (
        incidentType: String,
        severity: Int,
        perpetrator: String,
        location: String,
        description: String,
        injuries: String,
        witnesses: String,
        policeObNumber: String
    ) -> Unit
) {
    val categories = listOf(
        "Physical Assault",
        "Verbal & Emotional Abuse",
        "Threat of Violence",
        "Financial & Economic Control",
        "Stalking & Harassment",
        "Digital Surveillance",
        "Damage to Property",
        "Sexual Violation"
    )

    var selectedType by remember { mutableStateOf(categories[0]) }
    var expandedDropdown by remember { mutableStateOf(false) }
    var severitySlider by remember { mutableFloatStateOf(3f) }
    var perpetrator by remember { mutableStateOf("") }
    var location by remember { mutableStateOf("") }
    var description by remember { mutableStateOf("") }
    var injuries by remember { mutableStateOf("") }
    var witnesses by remember { mutableStateOf("") }
    var policeObNumber by remember { mutableStateOf("") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Text(
                text = "Log Incident for Legal Record",
                style = MaterialTheme.typography.titleMedium.copy(
                    fontWeight = FontWeight.Bold,
                    color = SankofaGold
                )
            )
        },
        text = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                // Category Dropdown
                ExposedDropdownMenuBox(
                    expanded = expandedDropdown,
                    onExpandedChange = { expandedDropdown = !expandedDropdown }
                ) {
                    OutlinedTextField(
                        value = selectedType,
                        onValueChange = {},
                        readOnly = true,
                        label = { Text("Abuse Category") },
                        trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expandedDropdown) },
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = TextPrimary,
                            unfocusedTextColor = TextPrimary,
                            focusedBorderColor = SankofaGold,
                            unfocusedBorderColor = SankofaCardBg
                        ),
                        modifier = Modifier
                            .fillMaxWidth()
                            .menuAnchor()
                    )
                    ExposedDropdownMenu(
                        expanded = expandedDropdown,
                        onDismissRequest = { expandedDropdown = false }
                    ) {
                        categories.forEach { category ->
                            DropdownMenuItem(
                                text = { Text(category) },
                                onClick = {
                                    selectedType = category
                                    expandedDropdown = false
                                }
                            )
                        }
                    }
                }

                // Severity Level Slider
                Column {
                    Text(
                        text = "Severity Rating: ${severitySlider.toInt()} / 5",
                        style = MaterialTheme.typography.bodySmall.copy(
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary
                        )
                    )
                    Slider(
                        value = severitySlider,
                        onValueChange = { severitySlider = it },
                        valueRange = 1f..5f,
                        steps = 3,
                        colors = SliderDefaults.colors(
                            thumbColor = SafetyRed,
                            activeTrackColor = SafetyRed
                        )
                    )
                }

                OutlinedTextField(
                    value = perpetrator,
                    onValueChange = { perpetrator = it },
                    label = { Text("Perpetrator (e.g. Partner, Ex-partner)") },
                    singleLine = true,
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedTextColor = TextPrimary,
                        unfocusedTextColor = TextPrimary,
                        focusedBorderColor = SankofaGold
                    ),
                    modifier = Modifier.fillMaxWidth().testTag("incident_perpetrator_input")
                )

                OutlinedTextField(
                    value = location,
                    onValueChange = { location = it },
                    label = { Text("Location (e.g. Home, Workplace)") },
                    singleLine = true,
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedTextColor = TextPrimary,
                        unfocusedTextColor = TextPrimary,
                        focusedBorderColor = SankofaGold
                    ),
                    modifier = Modifier.fillMaxWidth()
                )

                OutlinedTextField(
                    value = description,
                    onValueChange = { description = it },
                    label = { Text("Detailed Description of What Happened *") },
                    minLines = 3,
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedTextColor = TextPrimary,
                        unfocusedTextColor = TextPrimary,
                        focusedBorderColor = SankofaGold
                    ),
                    modifier = Modifier.fillMaxWidth().testTag("incident_description_input")
                )

                OutlinedTextField(
                    value = injuries,
                    onValueChange = { injuries = it },
                    label = { Text("Injuries / Psychological Impact") },
                    singleLine = true,
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedTextColor = TextPrimary,
                        unfocusedTextColor = TextPrimary,
                        focusedBorderColor = SankofaGold
                    ),
                    modifier = Modifier.fillMaxWidth()
                )

                OutlinedTextField(
                    value = witnesses,
                    onValueChange = { witnesses = it },
                    label = { Text("Witnesses (Names or neighbors)") },
                    singleLine = true,
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedTextColor = TextPrimary,
                        unfocusedTextColor = TextPrimary,
                        focusedBorderColor = SankofaGold
                    ),
                    modifier = Modifier.fillMaxWidth()
                )

                OutlinedTextField(
                    value = policeObNumber,
                    onValueChange = { policeObNumber = it },
                    label = { Text("SAPS Occurrence Book (OB) # (Optional)") },
                    singleLine = true,
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedTextColor = TextPrimary,
                        unfocusedTextColor = TextPrimary,
                        focusedBorderColor = SankofaGold
                    ),
                    modifier = Modifier.fillMaxWidth()
                )
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    if (description.isNotBlank()) {
                        onSave(
                            selectedType,
                            severitySlider.toInt(),
                            perpetrator,
                            location,
                            description,
                            injuries,
                            witnesses,
                            policeObNumber
                        )
                    }
                },
                enabled = description.isNotBlank(),
                colors = ButtonDefaults.buttonColors(containerColor = SankofaGold),
                modifier = Modifier.testTag("save_incident_button")
            ) {
                Text("Save to Vault", color = Color(0xFF141006), fontWeight = FontWeight.Bold)
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
fun ExportSummaryDialog(
    summaryText: String,
    onDismiss: () -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Text(
                text = "Domestic Violence Act Protection Order Record",
                style = MaterialTheme.typography.titleMedium.copy(
                    fontWeight = FontWeight.Bold,
                    color = SankofaGold
                )
            )
        },
        text = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .verticalScroll(rememberScrollState())
            ) {
                Text(
                    text = summaryText,
                    style = MaterialTheme.typography.bodySmall.copy(
                        fontFamily = androidx.compose.ui.text.font.FontFamily.Monospace,
                        color = TextPrimary,
                        fontSize = 11.sp,
                        lineHeight = 16.sp
                    )
                )
            }
        },
        confirmButton = {
            Button(
                onClick = onDismiss,
                colors = ButtonDefaults.buttonColors(containerColor = SankofaGold)
            ) {
                Text("Done", color = Color(0xFF141006), fontWeight = FontWeight.Bold)
            }
        },
        containerColor = SankofaSurface
    )
}
