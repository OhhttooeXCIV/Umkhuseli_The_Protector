package com.example.service

import android.Manifest
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.location.Location
import android.location.LocationListener
import android.location.LocationManager
import android.media.AudioManager
import android.media.ToneGenerator
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.telephony.SmsManager
import androidx.core.content.ContextCompat
import com.example.data.local.entity.GuardianEntity

class EmergencyService(private val context: Context) {

    private var toneGenerator: ToneGenerator? = null
    private var isAlarmPlaying = false

    fun makeCall(phoneNumber: String) {
        val cleanNumber = phoneNumber.filter { it.isDigit() || it == '+' || it == '*' || it == '#' }
        val uri = Uri.parse("tel:${Uri.encode(cleanNumber)}")

        val hasCallPermission = ContextCompat.checkSelfPermission(
            context,
            Manifest.permission.CALL_PHONE
        ) == PackageManager.PERMISSION_GRANTED

        val intent = if (hasCallPermission) {
            Intent(Intent.ACTION_CALL, uri)
        } else {
            Intent(Intent.ACTION_DIAL, uri)
        }.apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }

        try {
            context.startActivity(intent)
        } catch (_: Exception) {
            val fallback = Intent(Intent.ACTION_DIAL, uri).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            context.startActivity(fallback)
        }
    }

    fun triggerUssd(ussdCode: String) {
        val encodedUssd = ussdCode.replace("#", Uri.encode("#"))
        val uri = Uri.parse("tel:$encodedUssd")

        val hasCallPermission = ContextCompat.checkSelfPermission(
            context,
            Manifest.permission.CALL_PHONE
        ) == PackageManager.PERMISSION_GRANTED

        val intent = if (hasCallPermission) {
            Intent(Intent.ACTION_CALL, uri)
        } else {
            Intent(Intent.ACTION_DIAL, uri)
        }.apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }

        try {
            context.startActivity(intent)
        } catch (_: Exception) {
            val fallback = Intent(Intent.ACTION_DIAL, uri).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            context.startActivity(fallback)
        }
    }

    fun getLastKnownLocation(): Location? {
        val hasFine = ContextCompat.checkSelfPermission(
            context,
            Manifest.permission.ACCESS_FINE_LOCATION
        ) == PackageManager.PERMISSION_GRANTED
        val hasCoarse = ContextCompat.checkSelfPermission(
            context,
            Manifest.permission.ACCESS_COARSE_LOCATION
        ) == PackageManager.PERMISSION_GRANTED

        if (!hasFine && !hasCoarse) return null

        val locationManager = context.getSystemService(Context.LOCATION_SERVICE) as? LocationManager
            ?: return null

        return try {
            val gpsLocation = locationManager.getLastKnownLocation(LocationManager.GPS_PROVIDER)
            val networkLocation = locationManager.getLastKnownLocation(LocationManager.NETWORK_PROVIDER)

            when {
                gpsLocation != null && networkLocation != null -> {
                    if (gpsLocation.time > networkLocation.time) gpsLocation else networkLocation
                }
                gpsLocation != null -> gpsLocation
                else -> networkLocation
            }
        } catch (_: SecurityException) {
            null
        }
    }

    @Suppress("DEPRECATION")
    fun sendSosSms(guardians: List<GuardianEntity>, customMessage: String): Int {
        val hasSmsPermission = ContextCompat.checkSelfPermission(
            context,
            Manifest.permission.SEND_SMS
        ) == PackageManager.PERMISSION_GRANTED

        if (!hasSmsPermission || guardians.isEmpty()) return 0

        val location = getLastKnownLocation()
        val locationText = if (location != null) {
            "\nLocation: https://maps.google.com/?q=${location.latitude},${location.longitude}"
        } else {
            ""
        }

        val fullMessage = "$customMessage$locationText"

        val smsManager: SmsManager = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            context.getSystemService(SmsManager::class.java)
        } else {
            SmsManager.getDefault()
        }

        var sentCount = 0
        for (guardian in guardians) {
            if (guardian.phoneNumber.isNotBlank()) {
                try {
                    val parts = smsManager.divideMessage(fullMessage)
                    if (parts.size > 1) {
                        smsManager.sendMultipartTextMessage(guardian.phoneNumber, null, parts, null, null)
                    } else {
                        smsManager.sendTextMessage(guardian.phoneNumber, null, fullMessage, null, null)
                    }
                    sentCount++
                } catch (_: Exception) {
                    // Continue to next guardian even if one fails
                }
            }
        }
        return sentCount
    }

    fun triggerVibration() {
        val vibrator = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            val manager = context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as? VibratorManager
            manager?.defaultVibrator
        } else {
            @Suppress("DEPRECATION")
            context.getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
        }

        vibrator?.let {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                it.vibrate(VibrationEffect.createWaveform(longArrayOf(0, 150, 100, 150), -1))
            } else {
                @Suppress("DEPRECATION")
                it.vibrate(300)
            }
        }
    }

    fun toggleSafetySiren(): Boolean {
        if (isAlarmPlaying) {
            stopSiren()
            return false
        } else {
            startSiren()
            return true
        }
    }

    private fun startSiren() {
        try {
            toneGenerator = ToneGenerator(AudioManager.STREAM_ALARM, 100)
            toneGenerator?.startTone(ToneGenerator.TONE_CDMA_EMERGENCY_RINGBACK, 15000)
            isAlarmPlaying = true
            triggerVibration()
        } catch (_: Exception) {
            isAlarmPlaying = false
        }
    }

    fun stopSiren() {
        try {
            toneGenerator?.stopTone()
            toneGenerator?.release()
            toneGenerator = null
        } catch (_: Exception) {
            // Ignore
        } finally {
            isAlarmPlaying = false
        }
    }
}
