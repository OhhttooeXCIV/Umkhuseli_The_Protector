package com.example.ui.components

import android.graphics.Bitmap
import android.util.Base64
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
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
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.StrokeJoin
import androidx.compose.ui.graphics.asAndroidPath
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.SankofaGold
import com.example.ui.theme.SankofaSurface
import com.example.ui.theme.TextPrimary
import com.example.ui.theme.TextSecondary
import java.io.ByteArrayOutputStream

@Composable
fun SignaturePadDialog(
    onDismiss: () -> Unit,
    onSignatureCaptured: (base64Png: String) -> Unit
) {
    val paths = remember { mutableStateListOf<List<Offset>>() }
    var currentPath by remember { mutableStateOf<List<Offset>>(emptyList()) }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Text(
                text = "Sworn Complainant Signature",
                style = MaterialTheme.typography.titleMedium.copy(
                    color = SankofaGold,
                    fontSize = 16.sp
                )
            )
        },
        text = {
            Column(modifier = Modifier.fillMaxWidth()) {
                Text(
                    text = "Sign with your finger below to certify this Form 2 application pursuant to the Domestic Violence Act:",
                    style = MaterialTheme.typography.bodySmall.copy(
                        color = TextSecondary,
                        fontSize = 12.sp
                    ),
                    modifier = Modifier.padding(bottom = 8.dp)
                )

                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(180.dp)
                        .background(Color(0xFFF8FAFC), RoundedCornerShape(12.dp))
                        .border(1.5.dp, Color(0xFFCBD5E1), RoundedCornerShape(12.dp))
                        .pointerInput(Unit) {
                            detectDragGestures(
                                onDragStart = { offset ->
                                    currentPath = listOf(offset)
                                },
                                onDrag = { change, _ ->
                                    change.consume()
                                    currentPath = currentPath + change.position
                                },
                                onDragEnd = {
                                    if (currentPath.isNotEmpty()) {
                                        paths.add(currentPath)
                                        currentPath = emptyList()
                                    }
                                },
                                onDragCancel = {
                                    currentPath = emptyList()
                                }
                            )
                        }
                ) {
                    Canvas(modifier = Modifier.matchParentSize()) {
                        // Draw signature baseline
                        drawLine(
                            color = Color(0xFFE2E8F0),
                            start = Offset(20f, size.height - 35f),
                            end = Offset(size.width - 20f, size.height - 35f),
                            strokeWidth = 2f
                        )

                        // Draw completed paths
                        for (p in paths) {
                            if (p.size > 1) {
                                val path = Path().apply {
                                    moveTo(p.first().x, p.first().y)
                                    for (i in 1 until p.size) {
                                        lineTo(p[i].x, p[i].y)
                                    }
                                }
                                drawPath(
                                    path = path,
                                    color = Color(0xFF0F172A),
                                    style = Stroke(
                                        width = 4f,
                                        cap = StrokeCap.Round,
                                        join = StrokeJoin.Round
                                    )
                                )
                            }
                        }

                        // Draw current active dragging path
                        if (currentPath.size > 1) {
                            val path = Path().apply {
                                moveTo(currentPath.first().x, currentPath.first().y)
                                for (i in 1 until currentPath.size) {
                                    lineTo(currentPath[i].x, currentPath[i].y)
                                }
                            }
                            drawPath(
                                path = path,
                                color = Color(0xFF0F172A),
                                style = Stroke(
                                    width = 4f,
                                    cap = StrokeCap.Round,
                                    join = StrokeJoin.Round
                                )
                            )
                        }
                    }

                    if (paths.isEmpty() && currentPath.isEmpty()) {
                        Text(
                            text = "Draw signature here",
                            color = Color(0xFF94A3B8),
                            fontSize = 12.sp,
                            modifier = Modifier.align(Alignment.Center)
                        )
                    }
                }

                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 8.dp),
                    horizontalArrangement = Arrangement.End
                ) {
                    TextButton(
                        onClick = {
                            paths.clear()
                            currentPath = emptyList()
                        },
                        enabled = paths.isNotEmpty()
                    ) {
                        Text("Clear Signature", color = TextSecondary, fontSize = 12.sp)
                    }
                }
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    val base64 = renderPathsToBase64Png(paths)
                    onSignatureCaptured(base64)
                },
                enabled = paths.isNotEmpty(),
                colors = ButtonDefaults.buttonColors(containerColor = SankofaGold)
            ) {
                Text("Confirm Signature", color = Color(0xFF141006))
            }
        },
        dismissButton = {
            OutlinedButton(onClick = onDismiss) {
                Text("Cancel", color = TextPrimary)
            }
        },
        containerColor = SankofaSurface
    )
}

private fun renderPathsToBase64Png(paths: List<List<Offset>>): String {
    val width = 400
    val height = 180
    val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
    val canvas = android.graphics.Canvas(bitmap)
    canvas.drawColor(android.graphics.Color.WHITE)

    val paint = android.graphics.Paint().apply {
        color = android.graphics.Color.BLACK
        strokeWidth = 5f
        style = android.graphics.Paint.Style.STROKE
        strokeCap = android.graphics.Paint.Cap.ROUND
        strokeJoin = android.graphics.Paint.Join.ROUND
        isAntiAlias = true
    }

    for (p in paths) {
        if (p.size > 1) {
            val androidPath = android.graphics.Path().apply {
                moveTo(p.first().x, p.first().y)
                for (i in 1 until p.size) {
                    lineTo(p[i].x, p[i].y)
                }
            }
            canvas.drawPath(androidPath, paint)
        }
    }

    val stream = ByteArrayOutputStream()
    bitmap.compress(Bitmap.CompressFormat.PNG, 100, stream)
    val byteArray = stream.toByteArray()
    return "data:image/png;base64," + Base64.encodeToString(byteArray, Base64.NO_WRAP)
}
