package com.example.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "safe_journeys")
data class SafeJourneyEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val activityTitle: String,
    val destinationName: String,
    val destinationLat: Double? = null,
    val destinationLng: Double? = null,
    val originLat: Double? = null,
    val originLng: Double? = null,
    val departureRadiusKm: Double = 3.0,
    val homeFuzzyRadiusKm: Double = 1.0,
    val status: String = "ACTIVE", // ACTIVE, DEVIATION_ALERT, SAFE_RETURN, TERMINATED
    val recipientContactIds: String = "", // Comma-separated list of guardian/friend IDs
    val startedAt: Long = System.currentTimeMillis(),
    val endedAt: Long? = null
)
