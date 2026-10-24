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
import androidx.compose.material.icons.filled.DirectionsWalk
import androidx.compose.material.icons.filled.LocalHospital
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Navigation
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material.icons.filled.PhoneInTalk
import androidx.compose.material.icons.filled.Security
import androidx.compose.material.icons.filled.Share
import androidx.compose.material.icons.filled.Shield
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
    onToggleSiren: () -> Unit,
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
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp),
        contentPadding = PaddingValues(top = 12.dp, bottom = 32.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Safe Journey Active Monitoring or Start CTA Card
        item {
            Card(
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(
                    containerColor = if (activeJourneyTitle != null) Color(0xFF1B2E24) else SankofaSurface
                ),
                border = CardDefaults.outlinedCardBorder().copy(
                    brush = Brush.linearGradient(
                        listOf(
                            if (activeJourneyTitle != null) SafetyGreen else SankofaGold,
                            Color(0x332E7D32)
                        )
                    )
                ),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.DirectionsWalk,
                                contentDescription = null,
                                tint = if (activeJourneyTitle != null) SafetyGreen else SankofaGold
                            )
                            Text(
                                text = if (activeJourneyTitle != null) "SAFE JOURNEY ACTIVE" else "SAFE JOURNEY SIGNAL",
                                style = MaterialTheme.typography.titleSmall.copy(
                                    fontWeight = FontWeight.ExtraBold,
                                    color = if (activeJourneyTitle != null) SafetyGreen else SankofaGold,
                                    letterSpacing = 1.sp
                                )
                            )
                        }
                        if (activeJourneyTitle != null) {
                            Box(
                                modifier = Modifier
                                    .clip(CircleShape)
                                    .background(SafetyGreen)
                                    .padding(horizontal = 8.dp, vertical = 2.dp)
                            ) {
                                Text(
                                    text = "MONITORED",
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color.Black
                                )
                            }
                        }
                    }

                    if (activeJourneyTitle != null) {
                        Text(
                            text = "Destination: $activeJourneyTitle",
                            style = MaterialTheme.typography.bodyMedium.copy(
                                fontWeight = FontWeight.Bold,
                                color = TextPrimary
                            )
                        )
                        Text(
                            text = "• 3km Departure Alert: Armed\n• 1km Home Safe Return: Armed (Fuzzy coordinates, address withheld §4(2))",
                            style = MaterialTheme.typography.bodySmall.copy(color = TextSecondary)
                        )
                        Button(
                            onClick = onEndSafeJourney,
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF37474F)),
                            shape = RoundedCornerShape(12.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text("END JOURNEY (ARRIVED SAFELY)", fontWeight = FontWeight.Bold)
                        }
                    } else {
                        Text(
                            text = "Broadcast your route to verified ICE guardians and registered friends. Alerts guardians if you move outside a 3km corridor, with fuzzy safe return notification.",
                            style = MaterialTheme.typography.bodySmall.copy(color = TextSecondary)
                        )
                        Button(
                            onClick = onStartSafeJourney,
                            colors = ButtonDefaults.buttonColors(containerColor = SankofaGold),
                            shape = RoundedCornerShape(12.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text("START SAFE JOURNEY", color = Color.Black, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }

        // Proximity Ranked Nearest Emergency Facilities Card
        if (nearestTccName != null || nearestSapsName != null) {
            item {
                Card(
                    shape = RoundedCornerShape(20.dp),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF1E212D)),
                    border = CardDefaults.outlinedCardBorder().copy(
                        brush = Brush.linearGradient(listOf(Color(0xFF4FC3F7), Color(0x334FC3F7)))
                    ),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Navigation,
                                contentDescription = null,
                                tint = Color(0xFF4FC3F7)
                            )
                            Text(
                                text = "CLOSEST EMERGENCY FACILITIES",
                                style = MaterialTheme.typography.titleSmall.copy(
                                    fontWeight = FontWeight.Bold,
                                    color = Color(0xFF4FC3F7),
                                    letterSpacing = 0.5.sp
                                )
                            )
                        }

                        if (nearestTccName != null && nearestTccPhone != null) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Column(modifier = Modifier.weight(1f)) {
                                    Text(
                                        text = nearestTccName,
                                        style = MaterialTheme.typography.bodyMedium.copy(
                                            fontWeight = FontWeight.Bold,
                                            color = TextPrimary
                                        )
                                    )
                                    Text(
                                        text = "Thuthuzela Care Centre • ${nearestTccDistance ?: "Nearby"}",
                                        style = MaterialTheme.typography.bodySmall.copy(color = TextSecondary)
                                    )
                                }
                                Button(
                                    onClick = { onCallNearestFacility(nearestTccPhone) },
                                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF0288D1)),
                                    shape = RoundedCornerShape(10.dp),
                                    contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp)
                                ) {
                                    Icon(Icons.Default.Phone, contentDescription = null, modifier = Modifier.size(16.dp))
                                    Spacer(modifier = Modifier.size(4.dp))
                                    Text("CALL", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                                }
                            }
                        }

                        if (nearestSapsName != null && nearestSapsPhone != null) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Column(modifier = Modifier.weight(1f)) {
                                    Text(
                                        text = nearestSapsName,
                                        style = MaterialTheme.typography.bodyMedium.copy(
                                            fontWeight = FontWeight.Bold,
                                            color = TextPrimary
                                        )
                                    )
                                    Text(
                                        text = "SAPS Police Station • ${nearestSapsDistance ?: "Nearby"}",
                                        style = MaterialTheme.typography.bodySmall.copy(color = TextSecondary)
                                    )
                                }
                                Button(
                                    onClick = { onCallNearestFacility(nearestSapsPhone) },
                                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF1976D2)),
                                    shape = RoundedCornerShape(10.dp),
                                    contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp)
                                ) {
                                    Icon(Icons.Default.Phone, contentDescription = null, modifier = Modifier.size(16.dp))
                                    Spacer(modifier = Modifier.size(4.dp))
                                    Text("CALL", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                                }
                            }
                        }
                    }
                }
            }
        }

        // Zero-Airtime Notice for South Africa
        item {
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0x332E7D32)),
                border = CardDefaults.outlinedCardBorder().copy(
                    brush = Brush.linearGradient(listOf(SafetyGreen, Color(0x332E7D32)))
                ),
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
                            text = "0800 numbers and *120* USSD codes are toll-free in South Africa across Vodacom, MTN, Cell C, and Telkom.",
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
                border = CardDefaults.outlinedCardBorder().copy(
                    brush = Brush.linearGradient(listOf(SafetyRed, SafetyRedDark))
                ),
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

        // Secondary Crisis Actions: 72-Hour Beacon & Auto Please Call Me
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Button(
                    onClick = onDispatch72HourBeacon,
                    colors = ButtonDefaults.buttonColors(containerColor = SankofaCardBg),
                    shape = RoundedCornerShape(16.dp),
                    border = CardDefaults.outlinedCardBorder().copy(
                        brush = Brush.linearGradient(listOf(Color(0xFF4FC3F7), Color(0x334FC3F7)))
                    ),
                    modifier = Modifier
                        .weight(1f)
                        .height(54.dp)
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Share,
                            contentDescription = null,
                            tint = Color(0xFF4FC3F7),
                            modifier = Modifier.size(18.dp)
                        )
                        Text(
                            text = "72-HR BEACON",
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary,
                            fontSize = 11.sp
                        )
                    }
                }

                Button(
                    onClick = onSendAutoPleaseCallMe,
                    colors = ButtonDefaults.buttonColors(containerColor = SankofaCardBg),
                    shape = RoundedCornerShape(16.dp),
                    border = CardDefaults.outlinedCardBorder().copy(
                        brush = Brush.linearGradient(listOf(SafetyGreen, Color(0x332E7D32)))
                    ),
                    modifier = Modifier
                        .weight(1f)
                        .height(54.dp)
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.PhoneInTalk,
                            contentDescription = null,
                            tint = SafetyGreen,
                            modifier = Modifier.size(18.dp)
                        )
                        Text(
                            text = "PLEASE CALL ME",
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary,
                            fontSize = 11.sp
                        )
                    }
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
                        .fillMaxWidth()
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
                            text = if (isSirenActive) "STOP AUDIBLE SIREN" else "ACTIVATE AUDIBLE SIREN (DETERRENT)",
                            fontWeight = FontWeight.Bold,
                            color = if (isSirenActive) Color.Black else TextPrimary,
                            fontSize = 12.sp
                        )
                    }
                }
            }
        }

        // Ghost Beacon Hardware Status Indicator
        item {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 4.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.Shield,
                    contentDescription = null,
                    tint = TextMuted,
                    modifier = Modifier.size(14.dp)
                )
                Text(
                    text = "Ghost Beacon: 6-Hour Background Sync Active (Hardware ID / IMEI Protected)",
                    style = MaterialTheme.typography.bodySmall.copy(color = TextMuted, fontSize = 11.sp)
                )
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
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Column(modifier = Modifier.weight(1f)) {
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
                    if (resource.isTollFree) {
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(4.dp))
                                .background(Color(0x332E7D32))
                                .padding(horizontal = 6.dp, vertical = 2.dp)
                        ) {
                            Text(
                                text = "TOLL-FREE",
                                fontSize = 9.sp,
                                fontWeight = FontWeight.Bold,
                                color = SafetyGreen
                            )
                        }
                    }
                }
                Text(
                    text = resource.description,
                    style = MaterialTheme.typography.bodySmall.copy(color = TextSecondary),
                    modifier = Modifier.padding(top = 4.dp)
                )
                Text(
                    text = resource.dialString,
                    style = MaterialTheme.typography.labelMedium.copy(
                        color = SankofaGold,
                        fontWeight = FontWeight.SemiBold
                    ),
                    modifier = Modifier.padding(top = 4.dp)
                )
            }

            Button(
                onClick = onCall,
                colors = ButtonDefaults.buttonColors(
                    containerColor = if (resource.id == "saps_police") SafetyRed else SankofaCardBg
                ),
                shape = RoundedCornerShape(14.dp),
                border = CardDefaults.outlinedCardBorder().copy(
                    brush = Brush.linearGradient(listOf(SankofaGold, Color(0x33D4AF37)))
                ),
                modifier = Modifier.size(width = 72.dp, height = 48.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.Phone,
                    contentDescription = "Call ${resource.title}",
                    tint = if (resource.id == "saps_police") Color.White else SankofaGold,
                    modifier = Modifier.size(20.dp)
                )
            }
        }
    }
}
