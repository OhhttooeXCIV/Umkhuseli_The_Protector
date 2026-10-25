package com.example.ui.launcher

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Bolt
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.ElectricMeter
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Receipt
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Divider
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.ExposedDropdownMenuDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableLongStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import java.util.Locale

data class MunicipalityTariff(
    val name: String,
    val block1Rate: Double, // ZAR per kWh (< 350 kWh)
    val block2Rate: Double, // ZAR per kWh (> 350 kWh)
    val serviceCharge: Double // Fixed monthly/base fee in ZAR
)

val SA_MUNICIPALITIES = listOf(
    MunicipalityTariff("City of Ekurhuleni (Boksburg / East Rand)", 2.42, 3.10, 0.0),
    MunicipalityTariff("City Power (Johannesburg)", 2.45, 3.12, 0.0),
    MunicipalityTariff("City of Tshwane (Pretoria)", 2.50, 3.18, 0.0),
    MunicipalityTariff("City of Cape Town", 2.38, 3.25, 0.0),
    MunicipalityTariff("eThekwini (Durban)", 2.40, 3.05, 0.0),
    MunicipalityTariff("Eskom Direct Residential", 2.22, 3.42, 0.0),
    MunicipalityTariff("Mangaung (Bloemfontein)", 2.48, 3.15, 0.0)
)

/**
 * High-fidelity South African Municipal Prepaid Electricity Token Calculator.
 * Operates as the primary Chameleon Decoy interface to protect survivors against abuser surveillance.
 *
 * Secret Safe Haven Triggers:
 * 1. Triple-tap on the Municipal Shield crest within 800ms.
 * 2. Entering secret PIN (e.g., "8426") in the meter or token verification dialog.
 * 3. Entering Duress PIN ("9999") displays a benign token receipt while triggering a background silent distress signal.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MunicipalPrepaidCalculator(
    onSecretGestureTriggered: () -> Unit,
    onDuressTriggered: () -> Unit,
    modifier: Modifier = Modifier
) {
    var selectedMunicipality by remember { mutableStateOf(SA_MUNICIPALITIES[0]) }
    var isDropdownExpanded by remember { mutableStateOf(false) }
    var meterNumber by remember { mutableStateOf("04182948192") }
    var purchaseAmountText by remember { mutableStateOf("200") }
    var calculatedResult by remember { mutableStateOf<CalculationSummary?>(null) }
    var simulatedToken by remember { mutableStateOf<String?>(null) }

    // Covert Tap Gesture Tracking
    var crestTapCount by remember { mutableIntStateOf(0) }
    var lastTapTimestamp by remember { mutableLongStateOf(0L) }

    val onCrestTapped: () -> Unit = {
        val now = System.currentTimeMillis()
        if (now - lastTapTimestamp < 800) {
            crestTapCount++
        } else {
            crestTapCount = 1
        }
        lastTapTimestamp = now

        if (crestTapCount >= 3) {
            crestTapCount = 0
            onSecretGestureTriggered()
        }
    }

    val calculateUnits: () -> Unit = {
        val amount = purchaseAmountText.toDoubleOrNull() ?: 0.0
        if (amount > 0) {
            // Check for secret PINs entered in amount or meter (1234, 8426, or 0000)
            val amt = purchaseAmountText.trim()
            val mtr = meterNumber.trim()
            if (amt == "8426" || amt == "1234" || amt == "0000" || mtr.endsWith("8426") || mtr.endsWith("1234") || mtr.endsWith("0000")) {
                onSecretGestureTriggered()
            } else if (purchaseAmountText.trim() == "9999" || meterNumber.trim().endsWith("9999")) {
                // Duress PIN entered: show normal simulated token AND fire background silent SOS
                onDuressTriggered()
                simulatedToken = "4819 0281 9481 0294 8812"
                calculatedResult = CalculationSummary(
                    grossAmount = amount,
                    vatAmount = amount * 0.15 / 1.15,
                    netElectricity = amount - (amount * 0.15 / 1.15),
                    unitsKwh = (amount / selectedMunicipality.block1Rate),
                    tierRate = selectedMunicipality.block1Rate
                )
            } else {
                val vat = amount * 0.15 / 1.15
                val net = amount - vat
                val units = net / selectedMunicipality.block1Rate
                calculatedResult = CalculationSummary(
                    grossAmount = amount,
                    vatAmount = vat,
                    netElectricity = net,
                    unitsKwh = units,
                    tierRate = selectedMunicipality.block1Rate
                )
                // Generate authentic looking 20-digit STS token
                val part1 = (1000..9999).random()
                val part2 = (1000..9999).random()
                val part3 = (1000..9999).random()
                val part4 = (1000..9999).random()
                val part5 = (1000..9999).random()
                simulatedToken = "$part1 $part2 $part3 $part4 $part5"
            }
        }
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(Color(0xFF0F172A)) // Municipal Navy / Slate
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // Municipal Banner & Crest Header (Covert Secret Unlock)
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 12.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.clickable(
                    interactionSource = remember { MutableInteractionSource() },
                    indication = null,
                    onClick = onCrestTapped
                )
            ) {
                Box(
                    modifier = Modifier
                        .size(44.dp)
                        .clip(CircleShape)
                        .background(Color(0xFF1E293B))
                        .border(1.5.dp, Color(0xFF38BDF8), CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.Shield,
                        contentDescription = "Municipal Verification Shield",
                        tint = Color(0xFF38BDF8),
                        modifier = Modifier.size(24.dp)
                    )
                }
                Spacer(modifier = Modifier.width(12.dp))
                Column {
                    Text(
                        text = "MUNICIPAL UTILITY",
                        style = MaterialTheme.typography.labelSmall.copy(
                            color = Color(0xFF94A3B8),
                            letterSpacing = 1.5.sp,
                            fontWeight = FontWeight.SemiBold
                        )
                    )
                    Text(
                        text = "Prepaid Electricity Portal",
                        style = MaterialTheme.typography.titleMedium.copy(
                            color = Color.White,
                            fontWeight = FontWeight.Bold
                        )
                    )
                }
            }

            Surface(
                color = Color(0xFF1E293B),
                shape = RoundedCornerShape(12.dp),
                border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF334155))
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Default.Bolt,
                        contentDescription = null,
                        tint = Color(0xFFFBBF24),
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = "STS-6 Compliant",
                        color = Color(0xFFFBBF24),
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Medium
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Tariff Calculator Card
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B)),
            shape = RoundedCornerShape(16.dp)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(
                    text = "Select Municipality / Supply Authority",
                    color = Color(0xFF94A3B8),
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Medium
                )
                Spacer(modifier = Modifier.height(6.dp))

                ExposedDropdownMenuBox(
                    expanded = isDropdownExpanded,
                    onExpandedChange = { isDropdownExpanded = !isDropdownExpanded }
                ) {
                    OutlinedTextField(
                        value = selectedMunicipality.name,
                        onValueChange = {},
                        readOnly = true,
                        trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = isDropdownExpanded) },
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = Color.White,
                            unfocusedTextColor = Color.White,
                            focusedBorderColor = Color(0xFF38BDF8),
                            unfocusedBorderColor = Color(0xFF475569)
                        ),
                        modifier = Modifier
                            .menuAnchor()
                            .fillMaxWidth(),
                        shape = RoundedCornerShape(10.dp)
                    )

                    ExposedDropdownMenu(
                        expanded = isDropdownExpanded,
                        onDismissRequest = { isDropdownExpanded = false }
                    ) {
                        SA_MUNICIPALITIES.forEach { item ->
                            DropdownMenuItem(
                                text = { Text(item.name) },
                                onClick = {
                                    selectedMunicipality = item
                                    isDropdownExpanded = false
                                }
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                Text(
                    text = "Prepaid Meter Number (11 digits)",
                    color = Color(0xFF94A3B8),
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Medium
                )
                Spacer(modifier = Modifier.height(6.dp))
                OutlinedTextField(
                    value = meterNumber,
                    onValueChange = { meterNumber = it },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    leadingIcon = {
                        Icon(
                            imageVector = Icons.Default.ElectricMeter,
                            contentDescription = null,
                            tint = Color(0xFF94A3B8)
                        )
                    },
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedTextColor = Color.White,
                        unfocusedTextColor = Color.White,
                        focusedBorderColor = Color(0xFF38BDF8),
                        unfocusedBorderColor = Color(0xFF475569)
                    ),
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(10.dp)
                )

                Spacer(modifier = Modifier.height(14.dp))

                Text(
                    text = "Purchase Amount (ZAR)",
                    color = Color(0xFF94A3B8),
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Medium
                )
                Spacer(modifier = Modifier.height(6.dp))
                OutlinedTextField(
                    value = purchaseAmountText,
                    onValueChange = { purchaseAmountText = it },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    prefix = { Text("R ", color = Color(0xFF38BDF8), fontWeight = FontWeight.Bold) },
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedTextColor = Color.White,
                        unfocusedTextColor = Color.White,
                        focusedBorderColor = Color(0xFF38BDF8),
                        unfocusedBorderColor = Color(0xFF475569)
                    ),
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(10.dp)
                )

                // Quick Amount Chips
                Spacer(modifier = Modifier.height(10.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    listOf("50", "100", "200", "500").forEach { preset ->
                        Surface(
                            color = if (purchaseAmountText == preset) Color(0xFF0284C7) else Color(0xFF334155),
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier
                                .weight(1f)
                                .clickable { purchaseAmountText = preset }
                        ) {
                            Text(
                                text = "R$preset",
                                color = Color.White,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.SemiBold,
                                textAlign = TextAlign.Center,
                                modifier = Modifier.padding(vertical = 8.dp)
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(18.dp))

                Button(
                    onClick = calculateUnits,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(48.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF0284C7)),
                    shape = RoundedCornerShape(10.dp)
                ) {
                    Icon(imageVector = Icons.Default.Receipt, contentDescription = null)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Calculate Units & Generate Token",
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp
                    )
                }
            }
        }

        // Calculation Results Display
        AnimatedVisibility(
            visible = calculatedResult != null,
            enter = fadeIn(),
            exit = fadeOut()
        ) {
            calculatedResult?.let { res ->
                Spacer(modifier = Modifier.height(16.dp))
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B)),
                    shape = RoundedCornerShape(16.dp),
                    border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF38BDF8).copy(alpha = 0.4f))
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "ESTIMATED UNITS",
                                color = Color(0xFF38BDF8),
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold
                            )
                            Icon(
                                imageVector = Icons.Default.CheckCircle,
                                contentDescription = null,
                                tint = Color(0xFF10B981),
                                modifier = Modifier.size(18.dp)
                            )
                        }

                        Text(
                            text = String.format(Locale.getDefault(), "%.1f kWh", res.unitsKwh),
                            color = Color.White,
                            fontSize = 32.sp,
                            fontWeight = FontWeight.ExtraBold,
                            modifier = Modifier.padding(vertical = 6.dp)
                        )

                        Divider(color = Color(0xFF334155), modifier = Modifier.padding(vertical = 8.dp))

                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text("Rate Tier:", color = Color(0xFF94A3B8), fontSize = 12.sp)
                            Text("R${res.tierRate}/kWh", color = Color.White, fontSize = 12.sp, fontWeight = FontWeight.Medium)
                        }
                        Spacer(modifier = Modifier.height(4.dp))
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text("VAT (15% Included):", color = Color(0xFF94A3B8), fontSize = 12.sp)
                            Text(String.format(Locale.getDefault(), "R%.2f", res.vatAmount), color = Color.White, fontSize = 12.sp)
                        }
                        Spacer(modifier = Modifier.height(4.dp))
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text("Net Electricity:", color = Color(0xFF94A3B8), fontSize = 12.sp)
                            Text(String.format(Locale.getDefault(), "R%.2f", res.netElectricity), color = Color.White, fontSize = 12.sp)
                        }

                        simulatedToken?.let { token ->
                            Spacer(modifier = Modifier.height(14.dp))
                            Surface(
                                color = Color(0xFF0F172A),
                                shape = RoundedCornerShape(10.dp),
                                border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF0284C7).copy(alpha = 0.5f)),
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Column(
                                    modifier = Modifier.padding(12.dp),
                                    horizontalAlignment = Alignment.CenterHorizontally
                                ) {
                                    Text(
                                        text = "SAMPLE STS TOKEN",
                                        fontSize = 10.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = Color(0xFF38BDF8),
                                        letterSpacing = 1.sp
                                    )
                                    Spacer(modifier = Modifier.height(4.dp))
                                    Text(
                                        text = token,
                                        fontSize = 18.sp,
                                        fontWeight = FontWeight.Bold,
                                        fontFamily = FontFamily.Monospace,
                                        color = Color(0xFFFBBF24),
                                        textAlign = TextAlign.Center
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        // Legitimate Municipal Info Footer
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector = Icons.Default.Info,
                contentDescription = null,
                tint = Color(0xFF64748B),
                modifier = Modifier.size(16.dp)
            )
            Spacer(modifier = Modifier.width(6.dp))
            Text(
                text = "Tariffs calculated per NERSA 2026/2027 guideline price increase.",
                color = Color(0xFF64748B),
                fontSize = 11.sp
            )
        }
    }
}

data class CalculationSummary(
    val grossAmount: Double,
    val vatAmount: Double,
    val netElectricity: Double,
    val unitsKwh: Double,
    val tierRate: Double
)
