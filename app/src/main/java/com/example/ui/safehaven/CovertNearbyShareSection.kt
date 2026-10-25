package com.example.ui.safehaven

import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.InstallMobile
import androidx.compose.material.icons.filled.Security
import androidx.compose.material.icons.filled.Send
import androidx.compose.material.icons.filled.Share
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material.icons.filled.Wifi
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.service.WifiDirectShareManager
import java.io.File

/**
 * Covert Nearby Share Section (Gated in Safe Haven Dashboard).
 * 
 * Option B Implementation:
 * Allows Community Health Workers (CHWs) and survivors to share and receive
 * authentic APK packages without internet access or cellular data.
 */
@Composable
fun CovertNearbyShareSection(
    modifier: Modifier = Modifier,
    onNavigateBack: () -> Unit = {}
) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()
    val shareManager = remember { WifiDirectShareManager(context) }

    var selectedTab by remember { mutableStateOf(0) } // 0: Send, 1: Receive
    var isTransferring by remember { mutableStateOf(false) }
    var transferProgress by remember { mutableFloatStateOf(0f) }
    var statusMessage by remember { mutableStateOf("Ready for local peer distribution") }
    var receivedApkFile by remember { mutableStateOf<File?>(null) }
    var senderIpInput by remember { mutableStateOf("192.168.49.1") }

    val sourceApk = remember { shareManager.getSourceApkFile() }

    Surface(
        modifier = modifier.fillMaxSize(),
        color = Color(0xFF0F172A)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp)
                .verticalScroll(rememberScrollState()),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Header: Chameleon Camouflage Indicator
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B))
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(14.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(44.dp)
                            .clip(CircleShape)
                            .background(Color(0xFF3B82F6).copy(alpha = 0.2f)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.Share,
                            contentDescription = "Share",
                            tint = Color(0xFF60A5FA)
                        )
                    }
                    Spacer(modifier = Modifier.width(12.dp))
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "Covert P2P APK Distribution",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                        Text(
                            text = "Offline peer-to-peer sharing for community health workers (0 Data / 0 Airtime)",
                            fontSize = 12.sp,
                            color = Color(0xFF94A3B8)
                        )
                    }
                }
            }

            // Mode Selector Tabs (Send vs Receive)
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color(0xFF1E293B), RoundedCornerShape(8.dp))
                    .padding(4.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Button(
                    onClick = { selectedTab = 0 },
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(6.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (selectedTab == 0) Color(0xFF2563EB) else Color.Transparent,
                        contentColor = Color.White
                    )
                ) {
                    Icon(imageVector = Icons.Default.Send, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(text = "Send Package", fontSize = 13.sp)
                }

                Button(
                    onClick = { selectedTab = 1 },
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(6.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (selectedTab == 1) Color(0xFF2563EB) else Color.Transparent,
                        contentColor = Color.White
                    )
                ) {
                    Icon(imageVector = Icons.Default.Wifi, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(text = "Receive Package", fontSize = 13.sp)
                }
            }

            // Tab 0: Send Mode
            if (selectedTab == 0) {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B))
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Text(
                            text = "Broadcasting Device (Sender)",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = Color(0xFFE2E8F0)
                        )

                        val sizeMb = (sourceApk?.length() ?: 0L) / (1024.0 * 1024.0)
                        Text(
                            text = "Installed Base Package: ${"%.2f".format(sizeMb)} MB",
                            fontSize = 12.sp,
                            color = Color(0xFF94A3B8)
                        )

                        Text(
                            text = "Start local P2P broadcast server over port ${WifiDirectShareManager.DEFAULT_PORT}. The receiving device connects to stream the signed APK without internet access.",
                            fontSize = 12.sp,
                            color = Color(0xFFCBD5E1)
                        )

                        Button(
                            onClick = {
                                isTransferring = true
                                statusMessage = "Server listening on port ${WifiDirectShareManager.DEFAULT_PORT}... Waiting for peer connection"
                                shareManager.startSenderServer(
                                    scope = coroutineScope,
                                    onProgress = { sent, total ->
                                        transferProgress = if (total > 0) sent.toFloat() / total else 0f
                                        statusMessage = "Streaming APK: ${(transferProgress * 100).toInt()}% ($sent / $total bytes)"
                                    },
                                    onComplete = {
                                        isTransferring = false
                                        transferProgress = 1f
                                        statusMessage = "APK package transferred successfully to peer"
                                    },
                                    onError = { err ->
                                        isTransferring = false
                                        statusMessage = "Error: $err"
                                    }
                                )
                            },
                            enabled = !isTransferring && sourceApk != null,
                            modifier = Modifier.fillMaxWidth(),
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF2563EB))
                        ) {
                            Icon(imageVector = Icons.Default.Send, contentDescription = null)
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(text = if (isTransferring) "Streaming to Peer..." else "Start P2P Broadcast")
                        }
                    }
                }
            }

            // Tab 1: Receive Mode
            if (selectedTab == 1) {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B))
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Text(
                            text = "Receiving Device (Survivor / Volunteer)",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = Color(0xFFE2E8F0)
                        )

                        OutlinedTextField(
                            value = senderIpInput,
                            onValueChange = { senderIpInput = it },
                            label = { Text("Sender P2P / Hotspot IP Address", color = Color(0xFF94A3B8)) },
                            modifier = Modifier.fillMaxWidth(),
                            singleLine = true
                        )

                        Button(
                            onClick = {
                                isTransferring = true
                                statusMessage = "Connecting to $senderIpInput:${WifiDirectShareManager.DEFAULT_PORT}..."
                                shareManager.startReceiverClient(
                                    hostAddress = senderIpInput.trim(),
                                    scope = coroutineScope,
                                    onProgress = { received, total ->
                                        transferProgress = if (total > 0) received.toFloat() / total else 0f
                                        statusMessage = "Downloading APK: ${(transferProgress * 100).toInt()}% ($received / $total bytes)"
                                    },
                                    onComplete = { file ->
                                        isTransferring = false
                                        receivedApkFile = file
                                        transferProgress = 1f
                                        statusMessage = "APK downloaded & verified authentic (SHA-256 Valid)"
                                    },
                                    onError = { err ->
                                        isTransferring = false
                                        statusMessage = err
                                    }
                                )
                            },
                            enabled = !isTransferring && senderIpInput.isNotBlank(),
                            modifier = Modifier.fillMaxWidth(),
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF16A34A))
                        ) {
                            Icon(imageVector = Icons.Default.Wifi, contentDescription = null)
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(text = if (isTransferring) "Receiving Stream..." else "Connect & Download APK")
                        }

                        // Install Button if received and verified
                        receivedApkFile?.let { apk ->
                            Card(
                                modifier = Modifier.fillMaxWidth(),
                                shape = RoundedCornerShape(8.dp),
                                colors = CardDefaults.cardColors(containerColor = Color(0xFF166534).copy(alpha = 0.3f))
                            ) {
                                Column(
                                    modifier = Modifier.padding(12.dp),
                                    verticalArrangement = Arrangement.spacedBy(8.dp)
                                ) {
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Icon(imageVector = Icons.Default.CheckCircle, contentDescription = null, tint = Color(0xFF4ADE80))
                                        Spacer(modifier = Modifier.width(6.dp))
                                        Text(text = "Cryptographically Verified", color = Color(0xFF4ADE80), fontWeight = FontWeight.Bold)
                                    }
                                    Button(
                                        onClick = {
                                            try {
                                                val intent = shareManager.getInstallIntent(apk)
                                                context.startActivity(intent)
                                            } catch (e: Exception) {
                                                Toast.makeText(context, "Install error: ${e.message}", Toast.LENGTH_LONG).show()
                                            }
                                        },
                                        modifier = Modifier.fillMaxWidth(),
                                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF22C55E))
                                    ) {
                                        Icon(imageVector = Icons.Default.InstallMobile, contentDescription = null)
                                        Spacer(modifier = Modifier.width(8.dp))
                                        Text(text = "Install Verified Umkhuseli APK")
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // Live Transfer Status Card
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B))
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(14.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Text(
                        text = "Transfer Status & Diagnostics",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = Color(0xFF94A3B8)
                    )

                    if (isTransferring) {
                        LinearProgressIndicator(
                            progress = { transferProgress },
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(6.dp)
                                .clip(RoundedCornerShape(3.dp)),
                            color = Color(0xFF3B82F6),
                            trackColor = Color(0xFF334155)
                        )
                    }

                    Text(
                        text = statusMessage,
                        fontSize = 12.sp,
                        fontFamily = FontFamily.Monospace,
                        color = if (statusMessage.startsWith("Error")) Color(0xFFF87171) else Color(0xFF38BDF8)
                    )
                }
            }

            // Ephemeral Scrubbing Control
            OutlinedButton(
                onClick = {
                    shareManager.cleanCovertShareCache()
                    receivedApkFile = null
                    statusMessage = "Covert share cache scrubbed cleanly"
                    Toast.makeText(context, "Temporary APK files deleted from cache", Toast.LENGTH_SHORT).show()
                },
                modifier = Modifier.fillMaxWidth(),
                colors = ButtonDefaults.outlinedButtonColors(contentColor = Color(0xFF94A3B8))
            ) {
                Icon(imageVector = Icons.Default.Delete, contentDescription = null, modifier = Modifier.size(16.dp))
                Spacer(modifier = Modifier.width(8.dp))
                Text(text = "Scrub Temporary Share Residue")
            }
        }
    }
}
