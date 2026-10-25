package com.example.service

import java.security.MessageDigest
import java.util.Locale

enum class SouthAfricanGender {
    FEMALE,
    MALE,
    INVALID
}

enum class UserAccessRole {
    FEMALE_PRIMARY,              // Full access: evidence vault, Form 2 dossier, geofencing, contact discovery
    MALE_GUARDIAN_RESPONDER,     // Guardian Responder mode: receive ward SOS/telemetry, TCC/SAPS coordination, redacted peer directory
    TIER_0_GUEST,                // Emergency lifeline bypass: 10111, GBVCC 0800 428 428, siren, flashlight
    BLOCKED_OFFENDER             // Blacklisted: silent lock, trapdoor forensic telemetry dispatched
}

data class SaIdValidationResult(
    val isValid: Boolean,
    val gender: SouthAfricanGender,
    val dateOfBirthFormatted: String = "",
    val isCitizen: Boolean = true,
    val hashedId: String = "",
    val isNrsoBlacklisted: Boolean = false,
    val determinedRole: UserAccessRole = UserAccessRole.TIER_0_GUEST,
    val errorMessage: String? = null
)

object SouthAfricanIdValidator {

    private const val ID_SALT = "Umkhuseli_SA_ID_POPIA_2026"

    /**
     * Simulated mock National Register for Sex Offenders (NRSO) and SAPS wanted list hashes.
     * Contains salted SHA-256 hashes of known test offender ID numbers.
     */
    private val KNOWN_OFFENDER_HASHES = setOf(
        hashSaId("8501015800085"), // Simulated offender test ID
        hashSaId("7806155901082"), // Simulated felon test ID
        hashSaId("9002205555089")  // Simulated violent crime fugitive test ID
    )

    /**
     * Computes a POPIA-compliant salted SHA-256 hash of an ID number.
     * Raw ID numbers must never be stored in plaintext.
     */
    fun hashSaId(rawId: String, salt: String = ID_SALT): String {
        val clean = rawId.filter { it.isDigit() }
        val input = "$salt:$clean"
        val md = MessageDigest.getInstance("SHA-256")
        val digest = md.digest(input.toByteArray(Charsets.UTF_8))
        return digest.joinToString("") { "%02x".format(it) }
    }

    /**
     * Validates a South African 13-digit ID number using the standard Luhn Modulus-10 algorithm.
     */
    fun isLuhnValid(id: String): Boolean {
        if (id.length != 13 || !id.all { it.isDigit() }) return false
        var sum = 0
        var alternate = false
        for (i in id.length - 1 downTo 0) {
            var n = id[i] - '0'
            if (alternate) {
                n *= 2
                if (n > 9) n = (n % 10) + 1
            }
            sum += n
            alternate = !alternate
        }
        return (sum % 10 == 0)
    }

    /**
     * Decodes gender from digit 7 (index 6) of a 13-digit South African ID.
     * Female: 0000 - 4999 (Digit 7 is 0, 1, 2, 3, or 4)
     * Male:   5000 - 9999 (Digit 7 is 5, 6, 7, 8, or 9)
     */
    fun extractGender(id: String): SouthAfricanGender {
        if (id.length != 13 || !id.all { it.isDigit() }) return SouthAfricanGender.INVALID
        val genderDigit = id[6] - '0'
        return if (genderDigit in 0..4) {
            SouthAfricanGender.FEMALE
        } else {
            SouthAfricanGender.MALE
        }
    }

    /**
     * Extracts and validates the date of birth from the first 6 digits (YYMMDD).
     */
    fun extractDateOfBirth(id: String): String {
        if (id.length < 6) return ""
        val yy = id.substring(0, 2)
        val mm = id.substring(2, 4)
        val dd = id.substring(4, 6)

        val month = mm.toIntOrNull() ?: return ""
        val day = dd.toIntOrNull() ?: return ""
        if (month !in 1..12 || day !in 1..31) return ""

        // Infer century: assume 00-26 is 2000s, 27-99 is 1900s
        val yearInt = yy.toIntOrNull() ?: return ""
        val fullYear = if (yearInt <= 26) 2000 + yearInt else 1900 + yearInt

        return String.format(Locale.US, "%04d-%02d-%02d", fullYear, month, day)
    }

    /**
     * Evaluates a South African ID against format, Luhn algorithm, gender classification,
     * and statutory NRSO offender registry.
     *
     * Blacklist resolution happens before checksum rejection so known offenders are
     * silently blocked even before Luhn validation runs.
     *
     * @param rawId 13-digit National ID string.
     * @param isIceContactRegistration True if a male user is being registered as an authorized ICE guardian.
     */
    fun validateAndProfile(
        rawId: String,
        isIceContactRegistration: Boolean = false
    ): SaIdValidationResult {
        val clean = rawId.filter { it.isDigit() }

        // Basic structural validation first
        if (clean.length != 13) {
            return SaIdValidationResult(
                isValid = false,
                gender = SouthAfricanGender.INVALID,
                errorMessage = "ID must be exactly 13 numeric digits."
            )
        }

        // Known offender lookup runs before Luhn rejection so silent trapdoor lockout is enforced.
        val hashed = hashSaId(clean)
        val isOffender = KNOWN_OFFENDER_HASHES.contains(hashed)

        if (isOffender) {
            return SaIdValidationResult(
                isValid = false,
                gender = extractGender(clean),
                hashedId = hashed,
                isNrsoBlacklisted = true,
                determinedRole = UserAccessRole.BLOCKED_OFFENDER,
                errorMessage = "Registration processing error - Contact Department of Home Affairs (Error Code: DHA-701)"
            )
        }

        if (!isLuhnValid(clean)) {
            return SaIdValidationResult(
                isValid = false,
                gender = SouthAfricanGender.INVALID,
                errorMessage = "Invalid South African ID checksum (Luhn verification failed)."
            )
        }

        val gender = extractGender(clean)
        val dob = extractDateOfBirth(clean)
        val isCitizen = clean[10] == '0'

        val role = when {
            gender == SouthAfricanGender.FEMALE -> UserAccessRole.FEMALE_PRIMARY
            gender == SouthAfricanGender.MALE && isIceContactRegistration -> UserAccessRole.MALE_GUARDIAN_RESPONDER
            gender == SouthAfricanGender.MALE -> UserAccessRole.MALE_GUARDIAN_RESPONDER
            else -> UserAccessRole.TIER_0_GUEST
        }

        return SaIdValidationResult(
            isValid = true,
            gender = gender,
            dateOfBirthFormatted = dob,
            isCitizen = isCitizen,
            hashedId = hashed,
            isNrsoBlacklisted = false,
            determinedRole = role
        )
    }
}