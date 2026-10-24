package com.example.ui.safehaven

import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Campaign
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material.icons.filled.PhoneInTalk
import androidx.compose.material.icons.filled.Security
import androidx.compose.material.icons.filled.Sms
import androidx.compose.material.icons.filled.VolumeUp
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.LifelineType
import com.example.data.model.SafetyResource
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

@Composable
fun EmergencySosSection(
    lifelines: List<SafetyResource>,
    isSirenActive: Boolean,
    onCallResource: (SafetyResource) -> Unit,
    onSendGuardianSos: () -> Unit,
    onToggleSiren: () -> Unit
) {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp),
        contentPadding = PaddingValues(top = 12.dp, bottom = 32.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Zero-Airtime Notice for South Africa
        item {
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0x332E7D32)),
                border = CardDefaults.outlinedCardBorder().copy(brush = Brush.linearGradient(listOf(SafetyGreen, Color(0x332E7D32)))),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier.padding(14.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(36.dp)
                            .clip(CircleShape)
                            .background(SafetyGreen),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.Security,
                            contentDescription = null,
                            tint = Color.White,
                            modifier = Modifier.size(20.dp)
                        )
                    }
                    Column {
                        Text(
                            text = "Zero Airtime & Data Protection",
                            style = MaterialTheme.typography.titleSmall.copy(
                                fontWeight = FontWeight.Bold,
                                color = TextPrimary
                            )
                        )
                        Text(
                            text = "0800 numbers and *120* USSD codes are toll-free in South Africa across all mobile networks.",
                            style = MaterialTheme.typography.bodySmall.copy(color = TextSecondary)
                        )
                    }
                }
            }
        }

        // Primary SOS Dispatcher Button
        item {
            Card(
                shape = RoundedCornerShape(24.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF1F1214)),
                border = CardDefaults.outlinedCardBorder().copy(brush = Brush.linearGradient(listOf(SafetyRed, SafetyRedDark))),
                elevation = CardDefaults.cardElevation(defaultElevation = 8.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("sos_dispatch_card")
            ) {
                Column(
                    modifier = Modifier.padding(18.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Text(
                        text = "EMERGENCY GUARDIAN ALERT",
                        style = MaterialTheme.typography.labelMedium.copy(
                            fontWeight = FontWeight.ExtraBold,
                            letterSpacing = 1.5.sp,
                            color = SafetyRed
                        )
                    )

                    Button(
                        onClick = onSendGuardianSos,
                        colors = ButtonDefaults.buttonColors(containerColor = SafetyRed),
                        shape = RoundedCornerShape(18.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(58.dp)
                            .testTag("send_sos_button")
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Sms,
                                contentDescription = null,
                                tint = Color.White
                            )
                            Icon(
                                imageVector = Icons.Default.LocationOn,
                                contentDescription = null,
                                tint = Color.White
                            )
                            Text(
                                text = "SEND SOS SMS WITH GPS",
                                style = MaterialTheme.typography.titleMedium.copy(
                                    fontWeight = FontWeight.Bold,
                                    color = Color.White
                                )
                            )
                        }
                    }

                    Text(
                        text = "Instantly sends a distress SMS with your live location link to your trusted contacts.",
                        style = MaterialTheme.typography.bodySmall.copy(
                            color = TextSecondary,
                            textAlign = androidx.compose.ui.text.style.TextAlign.Center
                        )
                    )
                }
            }
        }

        // Siren and Physical Deterrent Toggle
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Button(
                    onClick = onToggleSiren,
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (isSirenActive) SafetyAmber else SankofaCardBg
                    ),
                    shape = RoundedCornerShape(16.dp),
                    border = CardDefaults.outlinedCardBorder().copy(
                        brush = Brush.linearGradient(listOf(SafetyAmber, Color(0x33FFA000)))
                    ),
                    modifier = Modifier
                        .weight(1f)
                        .height(50.dp)
                        .testTag("toggle_siren_button")
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Icon(
                            imageVector = if (isSirenActive) Icons.Default.VolumeUp else Icons.Default.Campaign,
                            contentDescription = null,
                            tint = if (isSirenActive) Color.Black else SafetyAmber
                        )
                        Text(
                            text = if (isSirenActive) "STOP SIREN" else "AUDIBLE SIREN",
                            fontWeight = FontWeight.Bold,
                            color = if (isSirenActive) Color.Black else TextPrimary,
                            fontSize = 12.sp
                        )
                    }
                }
            }
        }

        // Section Title: South African Emergency Lifelines
        item {
            Text(
                text = "South Africa Crisis Lifelines",
                style = MaterialTheme.typography.titleMedium.copy(
                    fontWeight = FontWeight.Bold,
                    color = SankofaGold
                ),
                modifier = Modifier.padding(top = 8.dp)
            )
        }

        // List of Lifelines
        items(lifelines, key = { it.id }) { resource ->
            LifelineCard(
                resource = resource,
                onCall = { onCallResource(resource) }
            )
        }
    }
}

@Composable
fun LifelineCard(
    resource: SafetyResource,
    onCall: () -> Unit
) {
    Card(
        shape = RoundedCornerShape(18.dp),
        colors = CardDefaults.cardColors(containerColor = SankofaSurface),
        border = CardDefaults.outlinedCardBorder().copy(
            brush = Brush.linearGradient(listOf(Color(0xFF2A2B3D), Color(0x112A2B3D)))
        ),
        modifier = Modifier
            .fillMaxWidth()
            .testTag("lifeline_card_${resource.id}")
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Column(modifier = Modifier.weight(1f).padding(end = 12.dp)) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Text(
                        text = resource.title,
                        style = MaterialTheme.typography.titleSmall.copy(
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary
                        )
                    )
                    if (resource.zeroDataZeroAirtime) {
                        Surface(
                            shape = RoundedCornerShape(6.dp),
                            color = Color(0x332E7D32)
                        ) {
                            Text(
                                text = "FREE",
                                color = SafetyGreen,
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold,
                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(4.dp))

                Text(
                    text = resource.description,
                    style = MaterialTheme.typography.bodySmall.copy(
                        color = TextSecondary,
                        lineHeight = 16.sp
                    )
                )

                Spacer(modifier = Modifier.height(6.dp))

                Text(
                    text = resource.dialString,
                    style = MaterialTheme.typography.labelLarge.copy(
                        color = SankofaGold,
                        fontWeight = FontWeight.Bold
                    )
                )
            }

            // Action Button
            Button(
                onClick = onCall,
                shape = CircleShape,
                colors = ButtonDefaults.buttonColors(
                    containerColor = if (resource.type == LifelineType.USSD_FREE) SafetyGreen else SafetyRed
                ),
                contentPadding = PaddingValues(12.dp),
                modifier = Modifier
                    .size(48.dp)
                    .testTag("call_action_${resource.id}")
            ) {
                Icon(
                    imageVector = if (resource.type == LifelineType.USSD_FREE) Icons.Default.PhoneInTalk else Icons.Default.Phone,
                    contentDescription = "Contact ${resource.title}",
                    tint = Color.White
                )
            }
        }
    }
}
