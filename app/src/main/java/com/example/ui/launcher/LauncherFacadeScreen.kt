package com.example.ui.launcher

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutVertically
import androidx.compose.foundation.Canvas
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
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Apps
import androidx.compose.material.icons.filled.Autorenew
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.AssistChip
import androidx.compose.material3.AssistChipDefaults
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableLongStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.AppInfo
import com.example.data.model.Proverb
import com.example.ui.theme.BorderDark
import com.example.ui.theme.SafetyRed
import com.example.ui.theme.SankofaCardBg
import com.example.ui.theme.SankofaDarkBg
import com.example.ui.theme.SankofaGold
import com.example.ui.theme.SankofaGoldDark
import com.example.ui.theme.SankofaGoldLight
import com.example.ui.theme.SankofaSurface
import com.example.ui.theme.TextMuted
import com.example.ui.theme.TextPrimary
import com.example.ui.theme.TextSecondary
import kotlinx.coroutines.delay
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@Composable
fun LauncherFacadeScreen(
    installedApps: List<AppInfo>,
    currentProverb: Proverb,
    onCycleProverb: () -> Unit,
    onLaunchApp: (String) -> Unit,
    onSecretGestureTriggered: () -> Unit,
    onRequestPinUnlock: () -> Unit,
    showPinModal: Boolean,
    onVerifyPin: (String) -> Boolean,
    onDismissPinModal: () -> Unit,
    isDrawerOpen: Boolean,
    onToggleDrawer: (Boolean) -> Unit,
    appSearchQuery: String,
    onAppSearchQueryChange: (String) -> Unit,
    onQuickSosTrigger: () -> Unit = {}
) {
    var currentTime by remember { mutableStateOf("") }
    var currentDate by remember { mutableStateOf("") }

    // Secret Tap Counter for the Golden Crest
    var tapCount by remember { mutableIntStateOf(0) }
    var lastTapTime by remember { mutableLongStateOf(0L) }

    LaunchedEffect(Unit) {
        while (true) {
            val now = Date()
            currentTime = SimpleDateFormat("HH:mm", Locale.getDefault()).format(now)
            currentDate = SimpleDateFormat("EEEE, d MMMM", Locale.getDefault()).format(now)
            delay(1000)
        }
    }

    val backgroundGradient = Brush.verticalGradient(
        colors = listOf(
            Color(0xFF07070A),
            Color(0xFF111118),
            Color(0xFF1B160E)
        )
    )

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(backgroundGradient)
            .statusBarsPadding()
            .navigationBarsPadding()
    ) {
        // Main Facade Content
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 20.dp, vertical = 12.dp)
                .verticalScroll(rememberScrollState()),
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            Column(
                modifier = Modifier.fillMaxWidth(),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                // Top discreet header & subtle PIN trigger
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 4.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "SANKOFA",
                        style = MaterialTheme.typography.labelMedium.copy(
                            fontWeight = FontWeight.Bold,
                            letterSpacing = 2.sp,
                            color = SankofaGoldDark
                        )
                    )

                    // Subtle discreet vault trigger
                    IconButton(
                        onClick = onRequestPinUnlock,
                        modifier = Modifier
                            .size(36.dp)
                            .testTag("discreet_vault_trigger")
                    ) {
                        Icon(
                            imageVector = Icons.Default.Lock,
                            contentDescription = "Discreet Settings",
                            tint = Color(0x33D6A84F),
                            modifier = Modifier.size(16.dp)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Time and Date Display
                Text(
                    text = currentTime.ifEmpty { "12:00" },
                    style = MaterialTheme.typography.displayLarge.copy(
                        fontSize = 62.sp,
                        fontWeight = FontWeight.Light,
                        fontFamily = FontFamily.SansSerif,
                        color = TextPrimary
                    )
                )

                Text(
                    text = currentDate.ifEmpty { "South Africa" },
                    style = MaterialTheme.typography.bodyMedium.copy(
                        color = SankofaGoldLight,
                        fontWeight = FontWeight.Medium
                    ),
                    modifier = Modifier.padding(bottom = 20.dp)
                )

                // Golden Grace Legacy Super-Headline
                Surface(
                    shape = RoundedCornerShape(20.dp),
                    color = Color(0x22D6A84F),
                    border = CardDefaults.outlinedCardBorder().copy(
                        brush = Brush.linearGradient(listOf(SankofaGoldDark, Color(0x22D6A84F)))
                    ),
                    modifier = Modifier.padding(bottom = 14.dp)
                ) {
                    Text(
                        text = "✦ GOLDEN GRACE LEGACY ✦",
                        style = MaterialTheme.typography.labelSmall.copy(
                            fontWeight = FontWeight.ExtraBold,
                            letterSpacing = 2.sp,
                            color = SankofaGoldLight
                        ),
                        modifier = Modifier.padding(horizontal = 14.dp, vertical = 6.dp)
                    )
                }

                // Secret Golden Honeycomb Crest (Tap 3x to secretly activate Safe Haven)
                Box(
                    contentAlignment = Alignment.Center,
                    modifier = Modifier
                        .size(88.dp)
                        .clip(CircleShape)
                        .background(
                            Brush.radialGradient(
                                colors = listOf(Color(0x33D6A84F), Color.Transparent)
                            )
                        )
                        .clickable(
                            interactionSource = remember { MutableInteractionSource() },
                            indication = null
                        ) {
                            val now = System.currentTimeMillis()
                            if (now - lastTapTime < 800) {
                                tapCount++
                            } else {
                                tapCount = 1
                            }
                            lastTapTime = now

                            if (tapCount >= 3) {
                                tapCount = 0
                                onSecretGestureTriggered()
                            }
                        }
                        .testTag("sankofa_crest_trigger")
                ) {
                    SankofaEmblemDrawing(modifier = Modifier.size(60.dp))
                }

                // Evocative Stewardship Narrative
                Text(
                    text = "Guardians of human dignity, sanctuary, and generational strength.\nHonoring heritage, walking in sovereign purpose.",
                    style = MaterialTheme.typography.bodySmall.copy(
                        color = SankofaGoldLight,
                        fontSize = 12.sp,
                        lineHeight = 16.sp,
                        textAlign = TextAlign.Center
                    ),
                    modifier = Modifier.padding(top = 10.dp, bottom = 16.dp, start = 16.dp, end = 16.dp)
                )

                // Streamlined CTA Anchors
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 18.dp),
                    horizontalArrangement = Arrangement.Center
                ) {
                    AssistChip(
                        onClick = onQuickSosTrigger,
                        label = { Text("SOS", fontSize = 11.sp, fontWeight = FontWeight.ExtraBold) },
                        leadingIcon = {
                            Icon(
                                imageVector = Icons.Default.Warning,
                                contentDescription = "Quick SOS",
                                tint = SafetyRed,
                                modifier = Modifier.size(14.dp)
                            )
                        },
                        colors = AssistChipDefaults.assistChipColors(
                            containerColor = Color(0x33E53935),
                            labelColor = SafetyRed
                        ),
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier.padding(end = 8.dp).testTag("facade_quick_sos_chip")
                    )

                    AssistChip(
                        onClick = onCycleProverb,
                        label = { Text("Reflect", fontSize = 11.sp, fontWeight = FontWeight.SemiBold) },
                        leadingIcon = {
                            Icon(
                                imageVector = Icons.Default.Autorenew,
                                contentDescription = null,
                                modifier = Modifier.size(14.dp)
                            )
                        },
                        colors = AssistChipDefaults.assistChipColors(
                            containerColor = SankofaCardBg,
                            labelColor = SankofaGold
                        ),
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier.padding(end = 8.dp)
                    )

                    AssistChip(
                        onClick = onRequestPinUnlock,
                        label = { Text("Sanctuary", fontSize = 11.sp, fontWeight = FontWeight.SemiBold) },
                        leadingIcon = {
                            Icon(
                                imageVector = Icons.Default.Shield,
                                contentDescription = null,
                                modifier = Modifier.size(14.dp)
                            )
                        },
                        colors = AssistChipDefaults.assistChipColors(
                            containerColor = Color(0x33D6A84F),
                            labelColor = TextPrimary
                        ),
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier.padding(end = 8.dp)
                    )

                    AssistChip(
                        onClick = { onToggleDrawer(true) },
                        label = { Text("Applications", fontSize = 11.sp, fontWeight = FontWeight.SemiBold) },
                        leadingIcon = {
                            Icon(
                                imageVector = Icons.Default.Apps,
                                contentDescription = null,
                                modifier = Modifier.size(14.dp)
                            )
                        },
                        colors = AssistChipDefaults.assistChipColors(
                            containerColor = SankofaCardBg,
                            labelColor = TextSecondary
                        ),
                        shape = RoundedCornerShape(12.dp)
                    )
                }

                // African Wisdom / Reflection Card
                Card(
                    shape = RoundedCornerShape(24.dp),
                    colors = CardDefaults.cardColors(containerColor = SankofaCardBg),
                    border = CardDefaults.outlinedCardBorder().copy(
                        brush = Brush.linearGradient(
                            listOf(Color(0x44D6A84F), Color(0x11D6A84F))
                        )
                    ),
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("reflection_card")
                ) {
                    Column(
                        modifier = Modifier.padding(20.dp),
                        verticalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "${currentProverb.sourceCulture} • ${currentProverb.category}",
                                style = MaterialTheme.typography.labelMedium.copy(
                                    color = SankofaGold,
                                    fontWeight = FontWeight.SemiBold
                                )
                            )
                            IconButton(
                                onClick = onCycleProverb,
                                modifier = Modifier
                                    .size(32.dp)
                                    .testTag("cycle_proverb_button")
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Autorenew,
                                    contentDescription = "Cycle Wisdom",
                                    tint = SankofaGold,
                                    modifier = Modifier.size(18.dp)
                                )
                            }
                        }

                        Text(
                            text = "“${currentProverb.proverbOriginal}”",
                            style = MaterialTheme.typography.titleMedium.copy(
                                color = TextPrimary,
                                fontWeight = FontWeight.Bold,
                                fontStyle = androidx.compose.ui.text.font.FontStyle.Italic
                            )
                        )

                        Text(
                            text = currentProverb.englishMeaning,
                            style = MaterialTheme.typography.bodyMedium.copy(
                                color = TextSecondary,
                                lineHeight = 20.sp
                            )
                        )

                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(12.dp))
                                .background(Color(0x332A2214))
                                .padding(12.dp)
                        ) {
                            Text(
                                text = currentProverb.reflectivePrompt,
                                style = MaterialTheme.typography.bodySmall.copy(
                                    color = SankofaGoldLight,
                                    lineHeight = 18.sp
                                )
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Daily Grounding Card
                Card(
                    shape = RoundedCornerShape(20.dp),
                    colors = CardDefaults.cardColors(containerColor = Color(0x9913141D)),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(14.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(40.dp)
                                .clip(CircleShape)
                                .background(Color(0x33D6A84F)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.Shield,
                                contentDescription = null,
                                tint = SankofaGold,
                                modifier = Modifier.size(22.dp)
                            )
                        }
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = "Inner Sanctuary Active",
                                style = MaterialTheme.typography.bodyMedium.copy(
                                    fontWeight = FontWeight.SemiBold,
                                    color = TextPrimary
                                )
                            )
                            Text(
                                text = "Your device is protected. Step forward in quiet confidence.",
                                style = MaterialTheme.typography.bodySmall.copy(
                                    color = TextSecondary
                                )
                            )
                        }
                    }
                }
            }

            // Bottom App Dock
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 16.dp, bottom = 8.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Surface(
                    shape = RoundedCornerShape(32.dp),
                    color = Color(0xEE12131C),
                    border = CardDefaults.outlinedCardBorder().copy(brush = Brush.linearGradient(listOf(BorderDark, Color(0x22FFFFFF)))),
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 8.dp)
                        .testTag("launcher_dock")
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 14.dp, vertical = 8.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        // Quick apps (First 4 launchable apps or sample)
                        installedApps.take(4).forEach { app ->
                            AppGridItem(
                                app = app,
                                onClick = { onLaunchApp(app.packageName) }
                            )
                        }

                        // App Drawer Open Button
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally,
                            modifier = Modifier
                                .clip(RoundedCornerShape(12.dp))
                                .clickable { onToggleDrawer(true) }
                                .padding(6.dp)
                                .testTag("open_apps_drawer_button")
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(48.dp)
                                    .clip(CircleShape)
                                    .background(SankofaGold),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Apps,
                                    contentDescription = "All Apps",
                                    tint = Color(0xFF141006),
                                    modifier = Modifier.size(26.dp)
                                )
                            }
                            Text(
                                text = "Apps",
                                style = MaterialTheme.typography.bodySmall.copy(
                                    fontSize = 11.sp,
                                    color = TextSecondary,
                                    fontWeight = FontWeight.Medium
                                ),
                                modifier = Modifier.padding(top = 6.dp)
                            )
                        }
                    }
                }
            }
        }

        // App Drawer Slide-Up Overlay
        AnimatedVisibility(
            visible = isDrawerOpen,
            enter = slideInVertically(initialOffsetY = { it }),
            exit = slideOutVertically(targetOffsetY = { it }),
            modifier = Modifier.align(Alignment.BottomCenter)
        ) {
            AppDrawerView(
                apps = installedApps,
                searchQuery = appSearchQuery,
                onSearchQueryChange = onAppSearchQueryChange,
                onAppClick = { packageName ->
                    onToggleDrawer(false)
                    onLaunchApp(packageName)
                },
                onClose = { onToggleDrawer(false) }
            )
        }

        // Secret PIN Dialog (Backup entry for Safe Haven)
        if (showPinModal) {
            var enteredPin by remember { mutableStateOf("") }
            var hasError by remember { mutableStateOf(false) }

            AlertDialog(
                onDismissRequest = onDismissPinModal,
                title = {
                    Text(
                        text = "Sankofa Reflection Vault",
                        style = MaterialTheme.typography.titleMedium.copy(
                            color = SankofaGold,
                            fontWeight = FontWeight.Bold
                        )
                    )
                },
                text = {
                    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                        Text(
                            text = "Enter your 4-digit security PIN to open private records:",
                            style = MaterialTheme.typography.bodyMedium.copy(color = TextSecondary)
                        )
                        OutlinedTextField(
                            value = enteredPin,
                            onValueChange = {
                                if (it.length <= 6) {
                                    enteredPin = it
                                    hasError = false
                                }
                            },
                            visualTransformation = PasswordVisualTransformation(),
                            singleLine = true,
                            isError = hasError,
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = SankofaGold,
                                unfocusedBorderColor = BorderDark,
                                focusedTextColor = TextPrimary,
                                unfocusedTextColor = TextPrimary
                            ),
                            placeholder = { Text("Default: 1234", color = TextMuted) },
                            modifier = Modifier
                                .fillMaxWidth()
                                .testTag("vault_pin_input")
                        )
                        if (hasError) {
                            Text(
                                text = "Incorrect PIN. Try 1234.",
                                color = MaterialTheme.colorScheme.error,
                                style = MaterialTheme.typography.bodySmall
                            )
                        }
                    }
                },
                confirmButton = {
                    Button(
                        onClick = {
                            val success = onVerifyPin(enteredPin)
                            if (!success) {
                                hasError = true
                            }
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = SankofaGold),
                        modifier = Modifier.testTag("submit_pin_button")
                    ) {
                        Text("Unlock", color = Color(0xFF141006), fontWeight = FontWeight.Bold)
                    }
                },
                dismissButton = {
                    TextButton(onClick = onDismissPinModal) {
                        Text("Cancel", color = TextSecondary)
                    }
                },
                containerColor = SankofaSurface
            )
        }
    }
}

/**
 * Beautiful vector drawing of the sacred Sankofa Bird looking backwards
 */
@Composable
fun SankofaEmblemDrawing(modifier: Modifier = Modifier) {
    Canvas(modifier = modifier) {
        val w = size.width
        val h = size.height

        // Outer subtle honeycomb boundary
        drawCircle(
            color = Color(0x33D6A84F),
            radius = w * 0.48f,
            center = Offset(w / 2f, h / 2f)
        )

        // Golden Honeycomb Hexagon Matrix
        fun drawHexagon(cx: Float, cy: Float, radius: Float, fill: Color, stroke: Color? = null) {
            val hexPath = Path()
            for (i in 0 until 6) {
                val angle = (Math.PI / 3.0 * i - Math.PI / 6.0)
                val x = cx + radius * Math.cos(angle).toFloat()
                val y = cy + radius * Math.sin(angle).toFloat()
                if (i == 0) hexPath.moveTo(x, y) else hexPath.lineTo(x, y)
            }
            hexPath.close()
            drawPath(path = hexPath, color = fill)
            if (stroke != null) {
                drawPath(
                    path = hexPath,
                    color = stroke,
                    style = androidx.compose.ui.graphics.drawscope.Stroke(width = 2f)
                )
            }
        }

        val r = w * 0.22f
        // Center hexagon cell
        drawHexagon(w * 0.5f, h * 0.5f, r, fill = Color(0xFF261D0C), stroke = SankofaGold)
        // Shield / Heart shape of Sankofa nested in honeycomb
        val path = Path().apply {
            moveTo(w * 0.5f, h * 0.28f)
            cubicTo(w * 0.68f, h * 0.32f, w * 0.76f, h * 0.52f, w * 0.5f, h * 0.72f)
            cubicTo(w * 0.24f, h * 0.52f, w * 0.32f, h * 0.32f, w * 0.5f, h * 0.28f)
            close()
        }
        drawPath(path = path, color = SankofaGold)

        // Inner reverse head & eye looking backwards (fetching wisdom from the past)
        drawCircle(
            color = Color(0xFF141006),
            radius = w * 0.07f,
            center = Offset(w * 0.56f, h * 0.42f)
        )
        drawCircle(
            color = SankofaGoldLight,
            radius = w * 0.03f,
            center = Offset(w * 0.56f, h * 0.42f)
        )
    }
}
