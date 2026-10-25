package com.example.service

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.telephony.SubscriptionManager
import android.telephony.TelephonyManager
import androidx.core.content.ContextCompat

/**
 * South African Mobile Carrier Specification.
 */
enum class SaCarrier(val carrierName: String, val mccMnc: String, val defaultPcmPrefix: String) {
    VODACOM("Vodacom", "65501", "*140*"),
    MTN("MTN", "65510", "*121*"),
    CELL_C("Cell C", "65507", "*111*1*"),
    TELKOM("Telkom", "65502", "*140*"),
    UNKNOWN("Unknown / Roaming", "65599", "*140*");

    companion object {
        fun fromIdentifier(identifier: String): SaCarrier {
            val clean = identifier.lowercase().trim()
            return when {
                clean.contains("vodacom") || clean.contains("65501") -> VODACOM
                clean.contains("mtn") || clean.contains("65510") -> MTN
                clean.contains("cell c") || clean.contains("cellc") || clean.contains("65507") -> CELL_C
                clean.contains("telkom") || clean.contains("65502") -> TELKOM
                else -> UNKNOWN
            }
        }
    }
}

/**
 * Information regarding an active SIM slot on the device.
 */
data class SimSlotInfo(
    val slotIndex: Int,
    val carrier: SaCarrier,
    val carrierDisplayName: String,
    val mccMnc: String,
    val isPrimary: Boolean
)

/**
 * Dual-SIM and Multi-Carrier Telephony Sentinel for South Africa.
 * Resolves active carriers (Vodacom, MTN, Cell C, Telkom) across physical SIM slots
 * to power zero-rated emergency reverse-billing and USSD callbacks.
 */
class CarrierDetectionManager(private val context: Context) {

    /**
     * Inspects active physical and eSIM slots to detect inserted carrier profiles.
     * Gracefully falls back to TelephonyManager if dual-SIM permissions are not granted.
     */
    fun getActiveSimSlots(): List<SimSlotInfo> {
        val slots = mutableListOf<SimSlotInfo>()

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP_MR1) {
            val hasPhoneStatePermission = ContextCompat.checkSelfPermission(
                context,
                Manifest.permission.READ_PHONE_STATE
            ) == PackageManager.PERMISSION_GRANTED

            if (hasPhoneStatePermission) {
                try {
                    val subManager = context.getSystemService(Context.TELEPHONY_SUBSCRIPTION_SERVICE) as? SubscriptionManager
                    val subList = subManager?.activeSubscriptionInfoList
                    if (!subList.isNullOrEmpty()) {
                        subList.forEachIndexed { index, info ->
                            val mccMnc = "${info.mcc}${info.mnc}"
                            val displayName = info.displayName?.toString() ?: info.carrierName?.toString() ?: "SIM ${index + 1}"
                            val detectedCarrier = SaCarrier.fromIdentifier("$displayName $mccMnc")
                            slots.add(
                                SimSlotInfo(
                                    slotIndex = info.simSlotIndex,
                                    carrier = detectedCarrier,
                                    carrierDisplayName = displayName,
                                    mccMnc = mccMnc,
                                    isPrimary = index == 0
                                )
                            )
                        }
                        if (slots.isNotEmpty()) return slots
                    }
                } catch (_: SecurityException) {
                    // Fall back to TelephonyManager
                }
            }
        }

        // Standard TelephonyManager fallback (Safe across all Android versions without dangerous permissions)
        val tm = context.getSystemService(Context.TELEPHONY_SERVICE) as? TelephonyManager
        val simOperator = tm?.simOperator ?: "65501"
        val simName = tm?.simOperatorName?.ifBlank { tm.networkOperatorName } ?: "Vodacom"
        val carrier = SaCarrier.fromIdentifier("$simName $simOperator")

        slots.add(
            SimSlotInfo(
                slotIndex = 0,
                carrier = carrier,
                carrierDisplayName = if (simName.isNotBlank()) simName else carrier.carrierName,
                mccMnc = simOperator,
                isPrimary = true
            )
        )

        return slots
    }

    /**
     * Returns the primary active carrier profile for the device.
     */
    fun getPrimaryCarrier(): SimSlotInfo {
        val slots = getActiveSimSlots()
        return slots.firstOrNull { it.isPrimary } ?: slots.first()
    }
}

/**
 * South African Zero-Rated Carrier & Reverse-Billing USSD Matrix.
 * Enforces statutory zero-rating under ICASA and WASPA frameworks so survivors
 * can trigger emergency dispatch without prepaid airtime or mobile data.
 */
object ZeroRatedCarrierMatrix {

    // Statutory Department of Social Development GBV Command Centre (ICASA Zero-Rated)
    const val STATUTORY_GBV_COMMAND_CENTRE = "*120*7867#"

    // Dedicated WASPA Reverse-Billed Shortcode Prefix (*134* is reverse-billed in SA)
    const val WASPA_REVERSE_BILLED_PREFIX = "*134*7867*"

    /**
     * Generates statutory Please Call Me USSD string based on carrier specification.
     */
    fun getPleaseCallMeCode(carrier: SaCarrier, targetPhone: String): String {
        val localPhone = formatLocalSouthAfricanNumber(targetPhone)
        return "${carrier.defaultPcmPrefix}$localPhone#"
    }

    /**
     * Generates statutory Please Call Me USSD string by carrier identifier / string.
     */
    fun getPleaseCallMeCode(carrierNameOrMcc: String, targetPhone: String): String {
        val carrier = SaCarrier.fromIdentifier(carrierNameOrMcc)
        return getPleaseCallMeCode(carrier, targetPhone)
    }

    /**
     * Formats reverse-billed emergency callback string via dedicated WASPA *134* shortcode.
     * Cost to subscriber = R0.00.
     */
    fun getReverseBilledEmergencyUssd(targetPhone: String, incidentRef: String = ""): String {
        val localPhone = formatLocalSouthAfricanNumber(targetPhone)
        return if (incidentRef.isNotBlank()) {
            val cleanRef = incidentRef.filter { it.isLetterOrDigit() }
            "$WASPA_REVERSE_BILLED_PREFIX$localPhone*$cleanRef#"
        } else {
            "$WASPA_REVERSE_BILLED_PREFIX$localPhone#"
        }
    }

    /**
     * Correctly encodes the USSD string into a dialer URI preserving the trailing '#' symbol
     * against Samsung/Pixel Android 14 URI parser truncation.
     */
    fun getEncodedDialUri(ussdCode: String): Uri {
        val cleanCode = ussdCode.trim()
        val encoded = cleanCode.replace("#", Uri.encode("#"))
        return Uri.parse("tel:$encoded")
    }

    /**
     * Evaluates if a given USSD dial string is statutory zero-rated in South Africa.
     * Covers: *130*, *134*, carrier Please Call Me prefixes (*140*, *121*, *111*1*),
     * and statutory GBV Command Centre (*120*7867#).
     */
    fun isZeroRatedCode(ussdCode: String): Boolean {
        val clean = ussdCode.trim()
        return clean == STATUTORY_GBV_COMMAND_CENTRE ||
                clean.startsWith("*130*") ||
                clean.startsWith("*134*") ||
                clean.startsWith("*140*") ||
                clean.startsWith("*121*") ||
                clean.startsWith("*111*1*")
    }

    /**
     * Normalizes South African phone number format to 10-digit local MSISDN (e.g. 0821234567).
     */
    fun formatLocalSouthAfricanNumber(phone: String): String {
        val digits = phone.filter { it.isDigit() }
        return when {
            digits.startsWith("27") && digits.length == 11 -> "0" + digits.substring(2)
            digits.startsWith("0") && digits.length == 10 -> digits
            else -> digits
        }
    }
}
