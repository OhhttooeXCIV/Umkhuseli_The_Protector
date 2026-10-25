package com.example.service

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.location.Location
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch

/**
 * Android 14+ Doze Mode Location Foreground Service with Chameleon Camouflage.
 * 
 * In accordance with Android 14 requirements, an ongoing foreground service with
 * foregroundServiceType="location" is maintained so emergency telemetry survives Doze mode.
 * 
 * CRITICAL ADVERSARY SAFETY:
 * The persistent notification NEVER displays words like "SOS", "Emergency", "GBV", or "Tracking".
 * It camouflages itself as a benign utility process (e.g. "PowerCalc SA: Tariff Monitor")
 * to prevent alerting an abuser who inspects or glances at the survivor's screen.
 */
class CamouflagedEmergencyForegroundService : Service() {

    private val serviceJob = Job()
    private val serviceScope = CoroutineScope(Dispatchers.IO + serviceJob)
    private var lastReportedLocation: Location? = null

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        createCamouflagedNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_STOP_DISPATCH -> {
                stopForegroundDispatch()
                stopSelf()
                return START_NOT_STICKY
            }
            ACTION_START_DISPATCH, null -> {
                val disguisePersona = intent?.getStringExtra(EXTRA_DISGUISE_PERSONA) ?: PERSONA_POWERCALC
                startForegroundDispatch(disguisePersona)
                startAdaptiveDozeLocationMonitoring()
                return START_STICKY
            }
        }
        return START_STICKY
    }

    private fun startForegroundDispatch(disguisePersona: String) {
        val notification = buildCamouflagedNotification(disguisePersona)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            startForeground(
                NOTIFICATION_ID,
                notification,
                ServiceInfo.FOREGROUND_SERVICE_TYPE_LOCATION
            )
        } else {
            startForeground(NOTIFICATION_ID, notification)
        }
    }

    private fun stopForegroundDispatch() {
        serviceJob.cancel()
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            stopForeground(STOP_FOREGROUND_REMOVE)
        } else {
            @Suppress("DEPRECATION")
            stopForeground(true)
        }
    }

    private fun startAdaptiveDozeLocationMonitoring() {
        serviceScope.launch {
            val emergencyService = EmergencyService(applicationContext)
            
            // Loop runs across Android 14 Doze Mode intervals:
            // Samples opportunistic coordinates without running battery-draining continuous wake-locks.
            while (isActive) {
                val currentLocation = emergencyService.getLastKnownLocation()
                if (currentLocation != null) {
                    val last = lastReportedLocation
                    val hasShiftedSignificantly = last == null ||
                            last.distanceTo(currentLocation) >= MIN_DISTANCE_METERS

                    if (hasShiftedSignificantly) {
                        lastReportedLocation = currentLocation
                    }
                }
                
                // Adaptive delay: 15 minutes between periodic stationary checks to preserve battery
                delay(DOZE_CHECK_INTERVAL_MS)
            }
        }
    }

    private fun createCamouflagedNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Utility Sync Services",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Background synchronization for municipal and utility updates"
                setShowBadge(false)
                enableVibration(false)
                enableLights(false)
                setSound(null, null)
            }
            val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            manager.createNotificationChannel(channel)
        }
    }

    private fun buildCamouflagedNotification(disguisePersona: String): Notification {
        val (title, content) = when (disguisePersona) {
            PERSONA_DAILY_VERSE -> "Daily Verse SA" to "Synchronizing daily liturgical reading"
            PERSONA_SYSTEM_OPTIMIZER -> "System Optimizer" to "Monitoring device battery profile"
            else -> "PowerCalc SA" to "Monitoring municipal off-peak electricity tariffs"
        }

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle(title)
            .setContentText(content)
            .setSmallIcon(android.R.drawable.ic_menu_rotate)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setCategory(NotificationCompat.CATEGORY_SERVICE)
            .setVisibility(NotificationCompat.VISIBILITY_SECRET) // Redacted from lockscreen preview
            .build()
    }

    override fun onDestroy() {
        serviceJob.cancel()
        super.onDestroy()
    }

    companion object {
        const val CHANNEL_ID = "umkhuseli_utility_sync_channel"
        const val NOTIFICATION_ID = 40401

        const val ACTION_START_DISPATCH = "com.example.service.action.START_DISPATCH"
        const val ACTION_STOP_DISPATCH = "com.example.service.action.STOP_DISPATCH"
        const val EXTRA_DISGUISE_PERSONA = "extra_disguise_persona"

        const val PERSONA_POWERCALC = "MUNICIPAL_PREPAID"
        const val PERSONA_DAILY_VERSE = "DAILY_DEVOTIONAL"
        const val PERSONA_SYSTEM_OPTIMIZER = "SYSTEM_OPTIMIZER"

        const val MIN_DISTANCE_METERS = 500f
        const val DOZE_CHECK_INTERVAL_MS = 15 * 60 * 1000L // 15 minutes

        fun start(context: Context, persona: String = PERSONA_POWERCALC) {
            val intent = Intent(context, CamouflagedEmergencyForegroundService::class.java).apply {
                action = ACTION_START_DISPATCH
                putExtra(EXTRA_DISGUISE_PERSONA, persona)
            }
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(intent)
            } else {
                context.startService(intent)
            }
        }

        fun stop(context: Context) {
            val intent = Intent(context, CamouflagedEmergencyForegroundService::class.java).apply {
                action = ACTION_STOP_DISPATCH
            }
            context.startService(intent)
        }
    }
}
