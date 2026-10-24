package com.example.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

/**
 * Encrypted Complainant Profile Entity.
 * Stores statutory legal particulars required under Section 4 of the
 * South African Domestic Violence Act 116 of 1998 (amended by Act 14 of 2021)
 * for the Form 2 Application for Protection Order, as well as operational
 * stealth settings and verified demographic access tiering.
 */
@Entity(tableName = "user_profile")
data class UserProfileEntity(
    @PrimaryKey
    val id: Long = 1L,
    val fullLegalNames: String = "",
    val idOrPassportNumber: String = "",
    val safeContactNumber: String = "",
    val safeServiceAddress: String = "",
    val isAddressWithheld: Boolean = false, // Section 4(2) right to withhold residential address for safety
    val relationshipToRespondent: String = "Spouse / Intimate Partner",
    val respondentName: String = "",
    val digitalSignatureBase64: String = "",
    val useDynamicLauncherTheme: Boolean = false,
    val duressPin: String = "9999",
    val isProfileCompleted: Boolean = false,
    val isBatteryOptimizationDismissed: Boolean = false,
    val autoScrubMedia: Boolean = true,
    val userRole: String = "TIER_0_GUEST", // FEMALE_PRIMARY, MALE_GUARDIAN_RESPONDER, TIER_0_GUEST, BLOCKED_OFFENDER
    val gender: String = "",               // FEMALE, MALE
    val dateOfBirth: String = "",
    val hashedIdNumber: String = "",       // POPIA salted SHA-256 hash
    val isNrsoCleared: Boolean = true,
    val isDeviceBlocked: Boolean = false,
    val createdAt: Long = System.currentTimeMillis()
)
