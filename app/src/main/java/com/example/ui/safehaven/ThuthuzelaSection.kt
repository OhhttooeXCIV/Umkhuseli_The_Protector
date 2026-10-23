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
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Call
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.KeyboardArrowDown
import androidx.compose.material.icons.filled.KeyboardArrowUp
import androidx.compose.material.icons.filled.LocalHospital
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.AssistChip
import androidx.compose.material3.AssistChipDefaults
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
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
import com.example.data.model.Province
import com.example.data.model.ThuthuzelaCenter
import com.example.data.repository.ThuthuzelaRepository
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
fun ThuthuzelaSection(
    selectedProvince: Province,
    onSelectProvince: (Province) -> Unit,
    searchQuery: String,
    onSearchQueryChange: (String) -> Unit,
    onCallCenter: (String) -> Unit
) {
    var isProtocolExpanded by remember { mutableStateOf(false) }

    val filteredCenters = remember(selectedProvince, searchQuery) {
        ThuthuzelaRepository.centers.filter { center ->
            val matchesProvince = selectedProvince == Province.ALL || center.province == selectedProvince
            val matchesQuery = searchQuery.isBlank() ||
                center.name.contains(searchQuery, ignoreCase = true) ||
                center.cityOrTown.contains(searchQuery, ignoreCase = true) ||
                center.hospitalOrLocation.contains(searchQuery, ignoreCase = true)
            matchesProvince && matchesQuery
        }
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp),
        contentPadding = PaddingValues(top = 10.dp, bottom = 32.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        // Expandable 72-Hour Medical Protocol Card
        item {
            Card(
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF1C1814)),
                border = CardDefaults.outlinedCardBorder().copy(
                    brush = Brush.linearGradient(listOf(SafetyAmber, Color(0x33FFA000)))
                ),
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { isProtocolExpanded = !isProtocolExpanded }
                    .testTag("first_72_hours_card")
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
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
                                    .size(36.dp)
                                    .clip(CircleShape)
                                    .background(Color(0x33FFA000)),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Info,
                                    contentDescription = null,
                                    tint = SafetyAmber,
                                    modifier = Modifier.size(20.dp)
                                )
                            }
                            Column {
                                Text(
                                    text = "The First 72 Hours Guide",
                                    style = MaterialTheme.typography.titleSmall.copy(
                                        fontWeight = FontWeight.Bold,
                                        color = TextPrimary
                                    )
                                )
                                Text(
                                    text = "Critical medical & forensic steps",
                                    style = MaterialTheme.typography.bodySmall.copy(color = SafetyAmber)
                                )
                            }
                        }

                        Icon(
                            imageVector = if (isProtocolExpanded) Icons.Default.KeyboardArrowUp else Icons.Default.KeyboardArrowDown,
                            contentDescription = "Toggle",
                            tint = TextSecondary
                        )
                    }

                    AnimatedVisibility(visible = isProtocolExpanded) {
                        Column(
                            modifier = Modifier.padding(top = 14.dp),
                            verticalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            ProtocolItem(
                                step = "1",
                                title = "Do not bathe or change clothes yet",
                                body = "Crucial DNA and physical evidence is preserved on your skin and garments for the forensic medical exam."
                            )
                            ProtocolItem(
                                step = "2",
                                title = "HIV PEP Prophylaxis within 72 hours",
                                body = "Post-Exposure Prophylaxis (PEP) medication prevents HIV transmission if started within 72 hours at a Thuthuzela Centre or emergency clinic."
                            )
                            ProtocolItem(
                                step = "3",
                                title = "Emergency Contraception within 120 hours",
                                body = "Oral emergency contraception is provided free of charge to prevent unintended pregnancy."
                            )
                            ProtocolItem(
                                step = "4",
                                title = "Ask for the J88 Medical Examination Form",
                                body = "Ensure the medical doctor completes and signs the official SAPS J88 form. This is the cornerstone of criminal prosecution in SA courts."
                            )
                        }
                    }
                }
            }
        }

        // Search Input
        item {
            OutlinedTextField(
                value = searchQuery,
                onValueChange = onSearchQueryChange,
                placeholder = { Text("Search by town, hospital, or centre...", color = TextMuted) },
                leadingIcon = {
                    Icon(imageVector = Icons.Default.Search, contentDescription = null, tint = SankofaGold)
                },
                singleLine = true,
                shape = RoundedCornerShape(16.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = SankofaGold,
                    unfocusedBorderColor = SankofaCardBg,
                    focusedTextColor = TextPrimary,
                    unfocusedTextColor = TextPrimary,
                    focusedContainerColor = SankofaSurface,
                    unfocusedContainerColor = SankofaSurface
                ),
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("tcc_search_input")
            )
        }

        // Province Filter Chips
        item {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .horizontalScroll(rememberScrollState()),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Province.values().forEach { province ->
                    val isSelected = province == selectedProvince
                    AssistChip(
                        onClick = { onSelectProvince(province) },
                        label = {
                            Text(
                                text = province.displayName,
                                fontSize = 12.sp,
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal
                            )
                        },
                        colors = AssistChipDefaults.assistChipColors(
                            containerColor = if (isSelected) SankofaGold else SankofaSurface,
                            labelColor = if (isSelected) Color(0xFF141006) else TextSecondary
                        ),
                        shape = RoundedCornerShape(14.dp),
                        modifier = Modifier.testTag("province_chip_${province.name}")
                    )
                }
            }
        }

        // TCC Count Header
        item {
            Text(
                text = "Thuthuzela Care Centres (${filteredCenters.size})",
                style = MaterialTheme.typography.titleMedium.copy(
                    fontWeight = FontWeight.Bold,
                    color = SankofaGold
                )
            )
        }

        // Centers List
        items(filteredCenters, key = { it.id }) { center ->
            TccCard(
                center = center,
                onCall = { onCallCenter(center.contactNumber) }
            )
        }
    }
}

@Composable
fun TccCard(
    center: ThuthuzelaCenter,
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
            .testTag("tcc_card_${center.id}")
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Top
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = center.name,
                        style = MaterialTheme.typography.titleSmall.copy(
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary
                        )
                    )
                    Text(
                        text = "${center.cityOrTown} • ${center.province.displayName}",
                        style = MaterialTheme.typography.bodySmall.copy(
                            color = SankofaGold,
                            fontWeight = FontWeight.Medium
                        )
                    )
                }

                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = Color(0x332E7D32)
                ) {
                    Text(
                        text = "24/7 OPEN",
                        color = SafetyGreen,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 3.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.LocationOn,
                    contentDescription = null,
                    tint = TextMuted,
                    modifier = Modifier.size(16.dp)
                )
                Text(
                    text = center.address,
                    style = MaterialTheme.typography.bodySmall.copy(
                        color = TextSecondary,
                        fontSize = 12.sp
                    )
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Services chips
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .horizontalScroll(rememberScrollState()),
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                center.services.take(3).forEach { service ->
                    Surface(
                        shape = RoundedCornerShape(6.dp),
                        color = Color(0x22FFFFFF)
                    ) {
                        Text(
                            text = service,
                            color = TextSecondary,
                            fontSize = 10.sp,
                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Action row
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Tel: ${center.contactNumber}",
                    style = MaterialTheme.typography.labelMedium.copy(
                        fontWeight = FontWeight.Bold,
                        color = TextPrimary
                    )
                )

                Button(
                    onClick = onCall,
                    colors = ButtonDefaults.buttonColors(containerColor = SafetyGreen),
                    shape = RoundedCornerShape(12.dp),
                    contentPadding = PaddingValues(horizontal = 14.dp, vertical = 6.dp),
                    modifier = Modifier.testTag("call_tcc_${center.id}")
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Call,
                            contentDescription = null,
                            tint = Color.White,
                            modifier = Modifier.size(16.dp)
                        )
                        Text("Call Centre", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}

@Composable
fun ProtocolItem(step: String, title: String, body: String) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        Box(
            modifier = Modifier
                .size(24.dp)
                .clip(CircleShape)
                .background(SafetyAmber),
            contentAlignment = Alignment.Center
        ) {
            Text(text = step, color = Color.Black, fontWeight = FontWeight.Bold, fontSize = 12.sp)
        }
        Column {
            Text(text = title, fontWeight = FontWeight.Bold, color = TextPrimary, fontSize = 13.sp)
            Text(text = body, color = TextSecondary, fontSize = 12.sp, lineHeight = 16.sp)
        }
    }
}
