package com.example.service

import android.content.Context
import android.location.Location
import com.example.data.local.dao.SafeJourneyDao
import com.example.data.local.entity.SafeJourneyEntity
import kotlin.math.atan2
import kotlin.math.cos
import kotlin.math.sin
import kotlin.math.sqrt

enum class JourneyTransitionEvent {
    NORMAL_IN_TRANSIT,
    DEPARTURE_3KM_EXCEEDED,
    SAFE_RETURN_HOME,
    COMPLETED
}

class SafeJourneyManager(
    private val context: Context? = null,
    private val safeJourneyDao: SafeJourneyDao? = null,
    private val emergencyDispatchHelper: EmergencyDispatchHelper? = null
) {

    companion object {
        const val EARTH_RADIUS_KM = 6371.0
        const val DEFAULT_DEPARTURE_RADIUS_KM = 3.0
        const val DEFAULT_HOME_FUZZY_RADIUS_KM = 1.0

        fun calculateDistanceKm(
            lat1: Double,
            lon1: Double,
            lat2: Double,
            lon2: Double
        ): Double {
            val dLat = Math.toRadians(lat2 - lat1)
            val dLon = Math.toRadians(lon2 - lon1)
            val a = sin(dLat / 2) * sin(dLat / 2) +
                cos(Math.toRadians(lat1)) * cos(Math.toRadians(lat2)) *
                sin(dLon / 2) * sin(dLon / 2)
            val c = 2 * atan2(sqrt(a), sqrt(1 - a))
            return EARTH_RADIUS_KM * c
        }

        fun evaluateJourneyLocation(
            currentLat: Double,
            currentLng: Double,
            journey: SafeJourneyEntity,
            homeLat: Double?,
            homeLng: Double?
        ): JourneyTransitionEvent {
            // 1. Check Safe Return Home within 1km fuzzy zone
            if (homeLat != null && homeLng != null) {
                val distHome = calculateDistanceKm(currentLat, currentLng, homeLat, homeLng)
                if (distHome <= journey.homeFuzzyRadiusKm) {
                    return JourneyTransitionEvent.SAFE_RETURN_HOME
                }
            }

            // 2. Check Departure radius from Origin (3km)
            if (journey.originLat != null && journey.originLng != null) {
                val distOrigin = calculateDistanceKm(currentLat, currentLng, journey.originLat, journey.originLng)
                if (distOrigin > journey.departureRadiusKm) {
                    return JourneyTransitionEvent.DEPARTURE_3KM_EXCEEDED
                }
            }

            return JourneyTransitionEvent.NORMAL_IN_TRANSIT
        }

        /**
         * Builds privacy-preserving safe return message.
         * Under Section 4(2) of the Domestic Violence Act 116 of 1998,
         * physical coordinates and home addresses are strictly withheld from alert broadcasts.
         */
        fun buildSafeReturnNotification(
            userName: String,
            activityTitle: String
        ): String {
            val nameDisplay = if (userName.isNotBlank()) userName else "User"
            return "SAFE RETURN ALERT: $nameDisplay has safely returned to their home area ($activityTitle completed). " +
                "Physical address withheld in terms of Section 4(2) of Act 116 of 1998."
        }

        fun build3KmDepartureAlert(
            userName: String,
            journey: SafeJourneyEntity,
            currentAreaName: String,
            locationUrl: String
        ): String {
            val nameDisplay = if (userName.isNotBlank()) userName else "User"
            return "JOURNEY ALERT: $nameDisplay has moved outside their 3km corridor for '${journey.activityTitle}' " +
                "towards ${journey.destinationName}.\n" +
                "• CURRENT AREA: $currentAreaName\n" +
                "• LIVE BEACON: $locationUrl\n" +
                "If concerned, please verify their safety immediately."
        }
    }

    suspend fun startJourney(
        activityTitle: String,
        destinationName: String,
        destinationLat: Double?,
        destinationLng: Double?,
        originLat: Double?,
        originLng: Double?,
        recipientIds: List<String>
    ): Long {
        val entity = SafeJourneyEntity(
            activityTitle = activityTitle,
            destinationName = destinationName,
            destinationLat = destinationLat,
            destinationLng = destinationLng,
            originLat = originLat,
            originLng = originLng,
            departureRadiusKm = DEFAULT_DEPARTURE_RADIUS_KM,
            homeFuzzyRadiusKm = DEFAULT_HOME_FUZZY_RADIUS_KM,
            status = "ACTIVE",
            recipientContactIds = recipientIds.joinToString(","),
            startedAt = System.currentTimeMillis()
        )
        return safeJourneyDao?.insertJourney(entity) ?: 0L
    }

    suspend fun checkJourneyProgress(
        currentLocation: Location?,
        homeLat: Double?,
        homeLng: Double?
    ): JourneyTransitionEvent {
        if (currentLocation == null || safeJourneyDao == null) return JourneyTransitionEvent.NORMAL_IN_TRANSIT

        val activeJourney = safeJourneyDao.getActiveJourney() ?: return JourneyTransitionEvent.COMPLETED
        val event = evaluateJourneyLocation(
            currentLocation.latitude,
            currentLocation.longitude,
            activeJourney,
            homeLat,
            homeLng
        )

        when (event) {
            JourneyTransitionEvent.SAFE_RETURN_HOME -> {
                safeJourneyDao.updateStatus(activeJourney.id, "SAFE_RETURN", System.currentTimeMillis())
            }
            JourneyTransitionEvent.DEPARTURE_3KM_EXCEEDED -> {
                if (activeJourney.status != "DEVIATION_ALERT") {
                    safeJourneyDao.updateStatus(activeJourney.id, "DEVIATION_ALERT", null)
                }
            }
            else -> {}
        }

        return event
    }

    suspend fun endJourney(journeyId: Long) {
        safeJourneyDao?.updateStatus(journeyId, "TERMINATED", System.currentTimeMillis())
    }
}
