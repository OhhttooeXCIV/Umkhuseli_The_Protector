package com.example.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "guardians")
data class GuardianEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val name: String,
    val surname: String = "",
    val mobileNumber1: String,
    val mobileNumber2: String = "",
    val emailAddress1: String = "",
    val emailAddress2: String = "",
    val tiktokHandle: String = "",
    val facebookProfile: String = "",
    val instagramHandle: String = "",
    val hasWhatsAppAccess: Boolean = true,
    val relationship: String = "Guardian",
    val notifyViaSms: Boolean = true,
    val isPrimary: Boolean = false
) {
    // Backward-compatibility alias
    val phoneNumber: String
        get() = mobileNumber1

    val fullName: String
        get() = if (surname.isNotBlank()) "$name $surname" else name
}
