package com.example.service

import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.location.Geocoder
import android.location.Location
import android.net.Uri
import android.os.BatteryManager
import android.os.Build
import com.example.data.local.entity.GuardianEntity
import com.example.data.model.PoliceStation
import com.example.data.model.ThuthuzelaCenter
import com.example.data.repository.PoliceStationRepository
import com.example.data.repository.ThuthuzelaRepository
import java.util.Locale

data class DeviceTelemetryInfo(
    val deviceModel: String,
    val androidVersion: String,
    val batteryPercentage: Int,
    val isCharging: Boolean,
    val currentArea: String,
    val findMyDeviceUrl: String = "https://www.google.com/android/find"
)

object UssdHelper {
    /**
     * Resolves the statutory South African zero-rated "Please Call Me" USSD string
     * for the detected cellular network carrier.
     */
    fun getPleaseCallMeCode(carrierNameOrMcc: String, targetPhoneNumber: String): String {
        val cleanPhone = targetPhoneNumber.filter { it.isDigit() }
        val localPhone = when {
            cleanPhone.startsWith("27") && cleanPhone.length == 11 -> "0" + cleanPhone.substring(2)
            cleanPhone.startsWith("0") && cleanPhone.length == 10 -> cleanPhone
            else -> cleanPhone
        }

        val carrier = carrierNameOrMcc.lowercase()
        return when {
            carrier.contains("vodacom") || carrier.contains("65501") -> "*140*$localPhone#"
            carrier.contains("mtn") || carrier.contains("65510") -> "*121*$localPhone#"
            carrier.contains("cell c") || carrier.contains("cellc") || carrier.contains("65507") -> "*111*1*$localPhone#"
            carrier.contains("telkom") || carrier.contains("65502") -> "*140*$localPhone#"
            else -> "*140*$localPhone#"
        }
    }
}

class EmergencyDispatchHelper(private val context: Context? = null) {

    fun getDeviceTelemetry(location: Location?): DeviceTelemetryInfo {
        // Battery info
        val batteryStatus: Intent? = if (context != null) {
            IntentFilter(Intent.ACTION_BATTERY_CHANGED).let { filter ->
                context.registerReceiver(null, filter)
            }
        } else null
        val level: Int = batteryStatus?.getIntExtra(BatteryManager.EXTRA_LEVEL, -1) ?: -1
        val scale: Int = batteryStatus?.getIntExtra(BatteryManager.EXTRA_SCALE, -1) ?: -1
        val batteryPct: Int = if (level >= 0 && scale > 0) (level * 100 / scale) else 50
        val status: Int = batteryStatus?.getIntExtra(BatteryManager.EXTRA_STATUS, -1) ?: -1
        val isCharging = status == BatteryManager.BATTERY_STATUS_CHARGING ||
            status == BatteryManager.BATTERY_STATUS_FULL

        // Identified Area / City via Geocoder
        val areaName = getAreaNameFromLocation(location)

        return DeviceTelemetryInfo(
            deviceModel = "${Build.MANUFACTURER} ${Build.MODEL}",
            androidVersion = "Android ${Build.VERSION.RELEASE} (API ${Build.VERSION.SDK_INT})",
            batteryPercentage = batteryPct,
            isCharging = isCharging,
            currentArea = areaName
        )
    }

    fun getAreaNameFromLocation(location: Location?): String {
        if (location == null) return "Area pending GPS lock"
        if (context == null) return "Area: ${location.latitude}, ${location.longitude}"
        return try {
            val geocoder = Geocoder(context, Locale.getDefault())
            @Suppress("DEPRECATION")
            val addresses = geocoder.getFromLocation(location.latitude, location.longitude, 1)
            if (!addresses.isNullOrEmpty()) {
                val addr = addresses[0]
                val subLocality = addr.subLocality ?: addr.subAdminArea ?: ""
                val locality = addr.locality ?: addr.adminArea ?: ""
                when {
                    subLocality.isNotBlank() && locality.isNotBlank() -> "$subLocality, $locality"
                    locality.isNotBlank() -> locality
                    addr.featureName != null -> addr.featureName
                    else -> "Coordinates: ${location.latitude}, ${location.longitude}"
                }
            } else {
                "Area: ${location.latitude}, ${location.longitude}"
            }
        } catch (_: Exception) {
            "Area: ${location.latitude}, ${location.longitude}"
        }
    }

    fun findNearestTcc(location: Location?): Pair<ThuthuzelaCenter, Double>? {
        if (location == null) return null
        return ThuthuzelaRepository.centers
            .filter { it.latitude != 0.0 && it.longitude != 0.0 }
            .map { center ->
                val dist = SafeJourneyManager.calculateDistanceKm(
                    location.latitude,
                    location.longitude,
                    center.latitude,
                    center.longitude
                )
                center to dist
            }
            .minByOrNull { it.second }
    }

    fun findNearestPoliceStation(location: Location?): Pair<PoliceStation, Double>? {
        if (location == null) return null
        return PoliceStationRepository.stations
            .map { station ->
                val dist = SafeJourneyManager.calculateDistanceKm(
                    location.latitude,
                    location.longitude,
                    station.latitude,
                    station.longitude
                )
                station to dist
            }
            .minByOrNull { it.second }
    }

    fun build72HourDistressMessage(
        location: Location?,
        telemetry: DeviceTelemetryInfo,
        contact: GuardianEntity? = null
    ): String {
        val mapsUrl = if (location != null) {
            "https://maps.google.com/?q=${location.latitude},${location.longitude}"
        } else {
            "Location unavailable (Check Find My Device)"
        }

        val greeting = if (contact != null) "URGENT ICE ALERT FOR ${contact.fullName.uppercase()}:\n" else "EMERGENCY DISTRESS BEACON:\n"

        return buildString {
            append(greeting)
            append("I am in imminent danger and require emergency help.\n")
            append("• CURRENT AREA: ").append(telemetry.currentArea).append("\n")
            append("• LIVE LOCATION (72-HR BEACON): ").append(mapsUrl).append("\n")
            append("• GOOGLE FIND MY DEVICE TRACKER: ").append(telemetry.findMyDeviceUrl).append("\n")
            append("• DEVICE BATTERY: ").append(telemetry.batteryPercentage).append("%")
            if (telemetry.isCharging) append(" (Charging)")
            append("\n")
            append("• HANDSET: ").append(telemetry.deviceModel).append("\n")

            // Proximity Ranked Nearest Emergency Facilities
            val nearestTcc = findNearestTcc(location)
            if (nearestTcc != null) {
                append("• NEAREST TCC (GBV MEDICAL/FORENSIC): ${nearestTcc.first.name} (${"%.1f".format(Locale.US, nearestTcc.second)} km) - Call ${nearestTcc.first.contactNumber}\n")
            }
            val nearestPolice = findNearestPoliceStation(location)
            if (nearestPolice != null) {
                append("• NEAREST SAPS STATION: ${nearestPolice.first.name} (${"%.1f".format(Locale.US, nearestPolice.second)} km) - Call ${nearestPolice.first.contactNumber}\n")
            }

            if (contact != null && (contact.tiktokHandle.isNotBlank() || contact.facebookProfile.isNotBlank() || contact.instagramHandle.isNotBlank())) {
                append("• ICE GUARDIAN HANDLES: ")
                if (contact.instagramHandle.isNotBlank()) append("IG: @${contact.instagramHandle} ")
                if (contact.tiktokHandle.isNotBlank()) append("TikTok: @${contact.tiktokHandle} ")
                if (contact.facebookProfile.isNotBlank()) append("FB: ${contact.facebookProfile} ")
                append("\n")
            }
            append("PLEASE CONTACT SAPS 10111 OR NATIONAL GBV CENTRE 0800 428 428 IMMEDIATELY.")
        }
    }

    fun launchWhatsAppEmergencyDispatch(
        contact: GuardianEntity,
        location: Location?,
        telemetry: DeviceTelemetryInfo
    ): Boolean {
        if (context == null) return false
        val message = build72HourDistressMessage(location, telemetry, contact)
        val cleanPhone = contact.mobileNumber1.filter { it.isDigit() }
        val formattedPhone = if (cleanPhone.startsWith("0") && cleanPhone.length == 10) {
            "27" + cleanPhone.substring(1) // South Africa country code
        } else {
            cleanPhone
        }

        val uri = Uri.parse("https://api.whatsapp.com/send?phone=$formattedPhone&text=${Uri.encode(message)}")
        val intent = Intent(Intent.ACTION_VIEW, uri).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }

        return try {
            context.startActivity(intent)
            true
        } catch (_: Exception) {
            val shareIntent = Intent(Intent.ACTION_SEND).apply {
                type = "text/plain"
                putExtra(Intent.EXTRA_TEXT, message)
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            context.startActivity(Intent.createChooser(shareIntent, "Dispatch Emergency Alert via..."))
            false
        }
    }

    fun promptDownloadOfflineGoogleMaps(location: Location?) {
        if (context == null) return
        val lat = location?.latitude ?: -26.2041
        val lon = location?.longitude ?: 28.0473
        val uri = Uri.parse("geo:$lat,$lon?q=offline+maps")
        val mapIntent = Intent(Intent.ACTION_VIEW, uri).apply {
            setPackage("com.google.android.apps.maps")
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        try {
            context.startActivity(mapIntent)
        } catch (_: Exception) {
            val fallback = Intent(Intent.ACTION_VIEW, Uri.parse("https://support.google.com/maps/answer/6291838")).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            context.startActivity(fallback)
        }
    }

    fun launchEmailEmergencyDispatch(
        contact: GuardianEntity,
        location: Location?,
        telemetry: DeviceTelemetryInfo
    ): Boolean {
        if (context == null) return false
        val message = build72HourDistressMessage(location, telemetry, contact)
        val emails = listOfNotNull(
            contact.emailAddress1.ifBlank { null },
            contact.emailAddress2.ifBlank { null }
        ).toTypedArray()

        if (emails.isEmpty()) return false

        val intent = Intent(Intent.ACTION_SENDTO).apply {
            data = Uri.parse("mailto:")
            putExtra(Intent.EXTRA_EMAIL, emails)
            putExtra(Intent.EXTRA_SUBJECT, "[EMERGENCY SOS] Urgent Distress Alert - ${telemetry.currentArea}")
            putExtra(Intent.EXTRA_TEXT, message)
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        return try {
            context.startActivity(intent)
            true
        } catch (_: Exception) {
            val shareIntent = Intent(Intent.ACTION_SEND).apply {
                type = "message/rfc822"
                putExtra(Intent.EXTRA_EMAIL, emails)
                putExtra(Intent.EXTRA_SUBJECT, "[EMERGENCY SOS] Urgent Distress Alert")
                putExtra(Intent.EXTRA_TEXT, message)
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            try {
                context.startActivity(Intent.createChooser(shareIntent, "Send Emergency Email via..."))
                true
            } catch (_: Exception) {
                false
            }
        }
    }

    fun launchSocialEmergencyDispatch(
        contact: GuardianEntity,
        platform: String,
        location: Location?,
        telemetry: DeviceTelemetryInfo
    ): Boolean {
        if (context == null) return false
        val message = build72HourDistressMessage(location, telemetry, contact)
        val url = when (platform.lowercase()) {
            "instagram" -> if (contact.instagramHandle.isNotBlank()) "https://instagram.com/${contact.instagramHandle}" else null
            "tiktok" -> if (contact.tiktokHandle.isNotBlank()) "https://www.tiktok.com/@${contact.tiktokHandle}" else null
            "facebook" -> if (contact.facebookProfile.isNotBlank()) "https://www.facebook.com/${contact.facebookProfile}" else null
            else -> null
        }

        val shareIntent = Intent(Intent.ACTION_SEND).apply {
            type = "text/plain"
            putExtra(Intent.EXTRA_TEXT, message)
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }

        return try {
            if (url != null) {
                val browserOrApp = Intent(Intent.ACTION_VIEW, Uri.parse(url)).apply {
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                }
                context.startActivity(browserOrApp)
            } else {
                context.startActivity(Intent.createChooser(shareIntent, "Dispatch Emergency Alert to ICE Contact..."))
            }
            true
        } catch (_: Exception) {
            try {
                context.startActivity(Intent.createChooser(shareIntent, "Dispatch Emergency Alert to ICE Contact..."))
                true
            } catch (_: Exception) {
                false
            }
        }
    }

    fun openFindMyDeviceService() {
        if (context == null) return
        val uri = Uri.parse("https://www.google.com/android/find")
        val intent = Intent(Intent.ACTION_VIEW, uri).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        try {
            context.startActivity(intent)
        } catch (_: Exception) {
            // Ignore
        }
    }
}
