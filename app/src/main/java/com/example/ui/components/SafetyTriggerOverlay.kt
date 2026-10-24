package com.example.ui.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Call
import androidx.compose.material.icons.filled.Cancel
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.PhoneInTalk
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.SafetyAmber
import com.example.ui.theme.SafetyGreen
import com.example.ui.theme.SafetyRed
import com.example.ui.theme.SafetyRedDark
import com.example.ui.theme.SankofaCardBg
import com.example.ui.theme.SankofaGold
import com.example.ui.theme.SankofaSurface
import com.example.ui.theme.TextMuted
import com.example.ui.theme.TextPrimary
import com.example.ui.theme.TextSecondary
import com.example.ui.viewmodel.SafetySignalState

@Composable
fun SafetyTriggerOverlay(
    signalState: SafetySignalState,
    onCancelSos: () -> Unit,
    onInstantDispatch: () -> Unit,
    onDismiss: () -> Unit,
    onCallPolice: () -> Unit,
    onCallGbvcc: () -> Unit,
    onDispatchWhatsApp: () -> Unit = {},
    onOpenFindMyDevice: () -> Unit = {},
    onDownloadOfflineMaps: () -> Unit = {}
) {
    when (signalState) {
        SafetySignalState.Idle -> {
            // Nothing to display when idle
        }

        is SafetySignalState.Armed -> {
            // High-urgency countdown modal with grace period
            AlertDialog(
                onDismissRequest = onCancelSos,
                title = {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Warning,
                            contentDescription = null,
                            tint = SafetyRed
                        )
                        Text(
                            text = "ARMING SOS SIGNAL",
                            style = MaterialTheme.typography.titleMedium.copy(
                                fontWeight = FontWeight.ExtraBold,
                                color = SafetyRed,
                                letterSpacing = 1.sp
                            )
                        )
                    }
                },
                text = {
                    Column(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        Text(
                            text = "Distress signal will broadcast to your guardian network and log to your private evidence vault.",
                            style = MaterialTheme.typography.bodyMedium.copy(
                                color = TextSecondary,
                                textAlign = TextAlign.Center
                            )
                        )

                        // Countdown Visual Ring
                        Box(
                            contentAlignment = Alignment.Center,
                            modifier = Modifier.size(100.dp)
                        ) {
                            val progress = signalState.secondsRemaining.toFloat() / signalState.totalSeconds.toFloat()
                            CircularProgressIndicator(
                                progress = { progress },
                                strokeWidth = 8.dp,
                                color = SafetyRed,
                                trackColor = Color(0x33E53935),
                                modifier = Modifier.size(100.dp)
                            )
                            Text(
                                text = "${signalState.secondsRemaining}",
                                style = MaterialTheme.typography.displayMedium.copy(
                                    fontWeight = FontWeight.Bold,
                                    color = TextPrimary
                                )
                            )
                        }

                        Text(
                            text = "Tap 'CANCEL' if triggered by mistake",
                            style = MaterialTheme.typography.labelSmall.copy(color = TextMuted)
                        )
                    }
                },
                confirmButton = {
                    Button(
                        onClick = onCancelSos,
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF333547)),
                        shape = RoundedCornerShape(14.dp),
                        modifier = Modifier.testTag("cancel_sos_button")
                    ) {
                        Text("CANCEL SOS", color = Color.White, fontWeight = FontWeight.Bold)
                    }
                },
                dismissButton = {
                    TextButton(
                        onClick = onInstantDispatch,
                        modifier = Modifier.testTag("dispatch_now_button")
                    ) {
                        Text("SEND IMMEDIATELY", color = SafetyRed, fontWeight = FontWeight.Bold)
                    }
                },
                containerColor = Color(0xFF1B1012),
                shape = RoundedCornerShape(24.dp),
                modifier = Modifier.testTag("armed_sos_dialog")
            )
        }

        is SafetySignalState.Dispatched -> {
            AlertDialog(
                onDismissRequest = onDismiss,
                title = {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.CheckCircle,
                            contentDescription = null,
                            tint = SafetyGreen
                        )
                        Text(
                            text = "SOS SIGNAL RECORDED",
                            style = MaterialTheme.typography.titleMedium.copy(
                                fontWeight = FontWeight.Bold,
                                color = TextPrimary
                            )
                        )
                    }
                },
                text = {
                    Column(
                        modifier = Modifier.fillMaxWidth(),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Surface(
                            shape = RoundedCornerShape(12.dp),
                            color = Color(0x332E7D32)
                        ) {
                            Text(
                                text = "Distress signal dispatched & secured into local Room database vault (Incident #${signalState.incidentId}).",
                                style = MaterialTheme.typography.bodySmall.copy(
                                    color = SafetyGreen,
                                    fontWeight = FontWeight.Medium
                                ),
                                modifier = Modifier.padding(10.dp)
                            )
                        }

                        Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                            Text(
                                text = "Timestamp: ${signalState.formattedTime}",
                                style = MaterialTheme.typography.bodySmall.copy(
                                    fontFamily = FontFamily.Monospace,
                                    color = TextPrimary
                                )
                            )
                            Text(
                                text = "Identified Area: ${signalState.currentArea}",
                                style = MaterialTheme.typography.bodySmall.copy(
                                    color = SankofaGold,
                                    fontWeight = FontWeight.SemiBold
                                )
                            )
                            if (signalState.locationCoordinates != null) {
                                Text(
                                    text = "GPS Coordinates: ${signalState.locationCoordinates}",
                                    style = MaterialTheme.typography.bodySmall.copy(color = TextSecondary)
                                )
                            }
                            Text(
                                text = "Guardians Alerted: ${signalState.guardiansAlertedCount} contact(s) via SMS",
                                style = MaterialTheme.typography.bodySmall.copy(color = Color(0xFF90CAF9))
                            )
                        }

                        // WhatsApp 72-Hour Live Location Beacon
                        Button(
                            onClick = onDispatchWhatsApp,
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF25D366)),
                            shape = RoundedCornerShape(12.dp),
                            modifier = Modifier.fillMaxWidth().testTag("overlay_whatsapp_dispatch_button")
                        ) {
                            Text("Send 72-Hr Beacon via WhatsApp", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                        }

                        // Geolocation Services: Find My Device & Offline Maps
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            OutlinedButton(
                                onClick = onOpenFindMyDevice,
                                shape = RoundedCornerShape(10.dp),
                                modifier = Modifier.weight(1f).testTag("overlay_find_my_device_button")
                            ) {
                                Text("Find My Device", fontSize = 11.sp, color = TextPrimary)
                            }
                            OutlinedButton(
                                onClick = onDownloadOfflineMaps,
                                shape = RoundedCornerShape(10.dp),
                                modifier = Modifier.weight(1f).testTag("overlay_offline_maps_button")
                            ) {
                                Text("Offline Maps", fontSize = 11.sp, color = TextPrimary)
                            }
                        }

                        // Direct Hotline Escalation Buttons
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Button(
                                onClick = onCallPolice,
                                colors = ButtonDefaults.buttonColors(containerColor = SafetyRed),
                                shape = RoundedCornerShape(10.dp),
                                modifier = Modifier.weight(1f).testTag("overlay_call_police_button")
                            ) {
                                Text("SAPS 10111", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                            }
                            Button(
                                onClick = onCallGbvcc,
                                colors = ButtonDefaults.buttonColors(containerColor = SankofaGold),
                                shape = RoundedCornerShape(10.dp),
                                modifier = Modifier.weight(1f).testTag("overlay_call_gbvcc_button")
                            ) {
                                Text("GBVCC 0800", color = Color.Black, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                },
                confirmButton = {
                    Button(
                        onClick = onDismiss,
                        colors = ButtonDefaults.buttonColors(containerColor = SankofaGold),
                        modifier = Modifier.testTag("dismiss_dispatched_button")
                    ) {
                        Text("Acknowledge", color = Color(0xFF141006), fontWeight = FontWeight.Bold)
                    }
                },
                containerColor = SankofaSurface,
                shape = RoundedCornerShape(24.dp)
            )
        }

        is SafetySignalState.Cancelled -> {
            AlertDialog(
                onDismissRequest = onDismiss,
                title = { Text("SOS Cancelled", color = TextPrimary) },
                text = { Text(signalState.reason, color = TextSecondary) },
                confirmButton = {
                    TextButton(onClick = onDismiss) { Text("OK", color = SankofaGold) }
                },
                containerColor = SankofaSurface
            )
        }

        is SafetySignalState.Error -> {
            AlertDialog(
                onDismissRequest = onDismiss,
                title = { Text("Alert Failed", color = SafetyRed) },
                text = { Text(signalState.errorMessage, color = TextSecondary) },
                confirmButton = {
                    TextButton(onClick = onDismiss) { Text("Dismiss", color = TextPrimary) }
                },
                containerColor = SankofaSurface
            )
        }
    }
}
