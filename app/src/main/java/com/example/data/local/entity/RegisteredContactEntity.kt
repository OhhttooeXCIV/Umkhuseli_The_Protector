package com.example.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "registered_contacts")
data class RegisteredContactEntity(
    @PrimaryKey
    val phoneHash: String,
    val contactName: String,
    val rawPhoneNumber: String,
    val isAppUser: Boolean = false,
    val lastDiscoveredAt: Long = System.currentTimeMillis()
)
