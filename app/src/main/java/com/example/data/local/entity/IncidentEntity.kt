package com.example.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "incidents")
data class IncidentEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val timestamp: Long = System.currentTimeMillis(),
    val dateTimeFormatted: String,
    val incidentType: String, // "Physical", "Verbal/Emotional", "Threat", "Financial", "Stalking", "Property Damage", "Digital Surveillance"
    val severityLevel: Int, // 1 to 5
    val perpetrator: String,
    val locationDescription: String,
    val description: String,
    val injuriesOrImpact: String,
    val witnesses: String,
    val policeObNumber: String = "", // SAPS Occurrence Book reference if reported
    val photosOrAudioNotes: String = "" // Private local note tag
)
