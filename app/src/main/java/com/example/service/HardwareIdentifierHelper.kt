package com.example.service

import android.annotation.SuppressLint
import android.content.Context
import android.media.MediaDrm
import android.os.Build
import android.provider.Settings
import android.telephony.TelephonyManager
import java.security.MessageDigest
import java.util.UUID

data class DeviceHardwareIdentity(
    val hardwareId: String,
    val androidId: String,
    val userDeclaredImei: String = "",
    val hardwareModel: String,
    val buildFingerprint: String,
    val isSystemPrivileged: Boolean = false
)

class HardwareIdentifierHelper(private val context: Context? = null) {

    companion object {
        private const val PREFS_NAME = "umkhuseli_hardware_prefs"
        private const val KEY_DECLARED_IMEI = "key_user_declared_imei"
        private val WIDEVINE_UUID = UUID(-0x121074568629b532L, -0x5c37d8232ae2de13L)

        fun computeHash(input: String): String {
            val md = MessageDigest.getInstance("SHA-256")
            val digest = md.digest(input.toByteArray(Charsets.UTF_8))
            return digest.joinToString("") { "%02x".format(it) }
        }
    }

    @SuppressLint("HardwareIds")
    fun getHardwareIdentity(): DeviceHardwareIdentity {
        val androidId = if (context != null) {
            try {
                Settings.Secure.getString(context.contentResolver, Settings.Secure.ANDROID_ID) ?: "UNKNOWN_ANDROID_ID"
            } catch (_: Exception) {
                "UNKNOWN_ANDROID_ID"
            }
        } else {
            "JVM_TEST_DEVICE_ID"
        }

        val drmId = getDrmUniqueId()
        val compositeId = if (drmId.isNotBlank()) {
            computeHash("DRM:$drmId:AID:$androidId")
        } else {
            computeHash("AID:$androidId:FP:${Build.FINGERPRINT}")
        }

        val declaredImei = getDeclaredImei()
        val privilegedImei = tryReadPrivilegedImei()
        val finalImei = if (privilegedImei.isNotBlank()) privilegedImei else declaredImei

        return DeviceHardwareIdentity(
            hardwareId = compositeId,
            androidId = androidId,
            userDeclaredImei = finalImei,
            hardwareModel = "${Build.MANUFACTURER} ${Build.MODEL}",
            buildFingerprint = Build.FINGERPRINT ?: "GENERIC_BUILD",
            isSystemPrivileged = privilegedImei.isNotBlank()
        )
    }

    private fun getDrmUniqueId(): String {
        return try {
            val mediaDrm = MediaDrm(WIDEVINE_UUID)
            val widevineId = mediaDrm.getPropertyByteArray(MediaDrm.PROPERTY_DEVICE_UNIQUE_ID)
            mediaDrm.close()
            widevineId.joinToString("") { "%02x".format(it) }
        } catch (_: Throwable) {
            ""
        }
    }

    @SuppressLint("HardwareIds")
    private fun tryReadPrivilegedImei(): String {
        if (context == null) return ""
        return try {
            val tm = context.getSystemService(Context.TELEPHONY_SERVICE) as? TelephonyManager
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                tm?.imei ?: ""
            } else {
                @Suppress("DEPRECATION")
                tm?.deviceId ?: ""
            }
        } catch (_: SecurityException) {
            // Expected on Android 10+ (API 29+) for non-privileged user apps
            ""
        } catch (_: Throwable) {
            ""
        }
    }

    fun saveDeclaredImei(imei: String) {
        if (context == null) return
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        prefs.edit().putString(KEY_DECLARED_IMEI, imei.trim()).apply()
    }

    fun getDeclaredImei(): String {
        if (context == null) return ""
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        return prefs.getString(KEY_DECLARED_IMEI, "") ?: ""
    }
}
