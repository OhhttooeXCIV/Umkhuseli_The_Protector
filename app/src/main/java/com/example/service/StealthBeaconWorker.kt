package com.example.service

import android.content.Context
import android.os.BatteryManager
import android.telephony.TelephonyManager
import androidx.work.Constraints
import androidx.work.CoroutineWorker
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.NetworkType
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import androidx.work.WorkerParameters
import java.util.concurrent.TimeUnit

class StealthBeaconWorker(
    appContext: Context,
    workerParams: WorkerParameters
) : CoroutineWorker(appContext, workerParams) {

    companion object {
        const val WORK_NAME = "umkhuseli_ghost_beacon_6hr"

        fun schedulePeriodicGhostBeacon(context: Context) {
            val constraints = Constraints.Builder()
                .setRequiredNetworkType(NetworkType.CONNECTED)
                .build()

            val beaconRequest = PeriodicWorkRequestBuilder<StealthBeaconWorker>(6, TimeUnit.HOURS)
                .setConstraints(constraints)
                .build()

            WorkManager.getInstance(context).enqueueUniquePeriodicWork(
                WORK_NAME,
                ExistingPeriodicWorkPolicy.KEEP,
                beaconRequest
            )
        }

        fun cancelPeriodicGhostBeacon(context: Context) {
            WorkManager.getInstance(context).cancelUniqueWork(WORK_NAME)
        }
    }

    override suspend fun doWork(): Result {
        return try {
            val hwHelper = HardwareIdentifierHelper(applicationContext)
            val hwIdentity = hwHelper.getHardwareIdentity()

            val bm = applicationContext.getSystemService(Context.BATTERY_SERVICE) as? BatteryManager
            val batteryPct = bm?.getIntProperty(BatteryManager.BATTERY_PROPERTY_CAPACITY) ?: -1

            val tm = applicationContext.getSystemService(Context.TELEPHONY_SERVICE) as? TelephonyManager
            val carrier = tm?.networkOperatorName ?: "Unknown Carrier"

            // Log or transmit silent heartbeat to Supabase ghost_beacons
            // Format telemetry dossier
            val telemetryRecord = """
                [GHOST_BEACON] HW_ID: ${hwIdentity.hardwareId} | IMEI: ${hwIdentity.userDeclaredImei} | 
                BATTERY: $batteryPct% | CARRIER: $carrier | TIME: ${System.currentTimeMillis()}
            """.trimIndent()

            android.util.Log.i("StealthBeaconWorker", "Silent 6-hr heartbeat executed: $telemetryRecord")
            Result.success()
        } catch (_: Exception) {
            Result.retry()
        }
    }
}
