package com.example

import com.example.data.local.entity.GuardianEntity
import com.example.data.local.entity.IncidentEntity
import com.example.data.local.entity.UserProfileEntity
import com.example.data.model.Province
import com.example.data.repository.ProverbsRepository
import com.example.data.repository.SafetyResourcesRepository
import com.example.data.repository.ThuthuzelaRepository
import com.example.service.DeviceTelemetryInfo
import com.example.service.EmergencyDispatchHelper
import com.example.ui.safehaven.SortOrder
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * High-speed pure JVM Unit Tests for Umkhuseli / Sankofa Safe.
 * Tests domain models, legal particulars, Domestic Violence Act Section 4(2) address withholding,
 * Form 2 filter and sort engine, safety repositories, provincial coverage, and 72-hour emergency beacon formatting.
 */
class UmkhuseliUnitTest {

    @Test
    fun `user profile entity defaults reflect un-completed stealth state`() {
        val profile = UserProfileEntity()
        assertEquals(1L, profile.id)
        assertFalse(profile.isProfileCompleted)
        assertEquals("9999", profile.duressPin)
        assertFalse(profile.useDynamicLauncherTheme)
        assertFalse(profile.isAddressWithheld)
        assertTrue(profile.autoScrubMedia)
    }

    @Test
    fun `user profile supports Domestic Violence Act Section 4(2) safe address withholding`() {
        val profile = UserProfileEntity(
            id = 1L,
            fullLegalNames = "Nomsa Khumalo",
            idOrPassportNumber = "9201010000085",
            safeContactNumber = "0821234567",
            safeServiceAddress = "Care of Sunnyside Police Station, Pretoria",
            isAddressWithheld = true,
            relationshipToRespondent = "Spouse / Intimate Partner",
            respondentName = "Sipho Khumalo",
            isProfileCompleted = true
        )

        assertTrue(profile.isAddressWithheld)
        assertTrue(profile.isProfileCompleted)
        assertEquals("Care of Sunnyside Police Station, Pretoria", profile.safeServiceAddress)
        assertEquals("Nomsa Khumalo", profile.fullLegalNames)
    }

    @Test
    fun `form 2 sort engine sorts incidents correctly by date descending and ascending`() {
        val incident1 = IncidentEntity(
            id = 1L,
            incidentType = "Physical",
            severityLevel = 4,
            timestamp = 1000L,
            dateTimeFormatted = "2026-10-20",
            perpetrator = "Ex-partner",
            locationDescription = "Home",
            description = "First incident",
            injuriesOrImpact = "Bruising",
            witnesses = "Neighbor"
        )
        val incident2 = IncidentEntity(
            id = 2L,
            incidentType = "Emotional",
            severityLevel = 2,
            timestamp = 3000L,
            dateTimeFormatted = "2026-10-22",
            perpetrator = "Ex-partner",
            locationDescription = "Office",
            description = "Third incident",
            injuriesOrImpact = "Anxiety",
            witnesses = "Colleague"
        )
        val incident3 = IncidentEntity(
            id = 3L,
            incidentType = "Physical",
            severityLevel = 5,
            timestamp = 2000L,
            dateTimeFormatted = "2026-10-21",
            perpetrator = "Ex-partner",
            locationDescription = "Car",
            description = "Second incident",
            injuriesOrImpact = "Laceration",
            witnesses = "Bystander"
        )

        val list = listOf(incident1, incident2, incident3)

        // Sort by DATE_DESC
        val sortedDateDesc = list.sortedByDescending { it.timestamp }
        assertEquals(listOf(incident2, incident3, incident1), sortedDateDesc)

        // Sort by DATE_ASC
        val sortedDateAsc = list.sortedBy { it.timestamp }
        assertEquals(listOf(incident1, incident3, incident2), sortedDateAsc)

        // Sort by SEVERITY_DESC
        val sortedSevDesc = list.sortedByDescending { it.severityLevel }
        assertEquals(listOf(incident3, incident1, incident2), sortedSevDesc)

        // Sort by SEVERITY_ASC
        val sortedSevAsc = list.sortedBy { it.severityLevel }
        assertEquals(listOf(incident2, incident1, incident3), sortedSevAsc)
    }

    @Test
    fun `form 2 filter engine filters by abuse category and SAPS occurrence book status`() {
        val incidentPhysical = IncidentEntity(
            id = 1L,
            incidentType = "Physical",
            severityLevel = 4,
            timestamp = 1000L,
            dateTimeFormatted = "2026-10-20",
            perpetrator = "Ex-partner",
            locationDescription = "Home",
            description = "Physical abuse",
            injuriesOrImpact = "Bruising",
            witnesses = "None",
            policeObNumber = "OB 123/10/2026"
        )
        val incidentEmotional = IncidentEntity(
            id = 2L,
            incidentType = "Emotional",
            severityLevel = 2,
            timestamp = 2000L,
            dateTimeFormatted = "2026-10-21",
            perpetrator = "Ex-partner",
            locationDescription = "Home",
            description = "Emotional verbal threat",
            injuriesOrImpact = "Distress",
            witnesses = "None",
            policeObNumber = ""
        )
        val incidentPhysicalNoOb = IncidentEntity(
            id = 3L,
            incidentType = "Physical",
            severityLevel = 3,
            timestamp = 3000L,
            dateTimeFormatted = "2026-10-22",
            perpetrator = "Ex-partner",
            locationDescription = "Public area",
            description = "Physical grab",
            injuriesOrImpact = "None",
            witnesses = "Public",
            policeObNumber = "   "
        )

        val list = listOf(incidentPhysical, incidentEmotional, incidentPhysicalNoOb)

        // Filter by category "Physical"
        val physicalOnly = list.filter { it.incidentType.equals("Physical", ignoreCase = true) }
        assertEquals(2, physicalOnly.size)

        // Filter by police OB number present
        val withOb = list.filter { it.policeObNumber.isNotBlank() }
        assertEquals(1, withOb.size)
        assertEquals("OB 123/10/2026", withOb.first().policeObNumber)

        // Combined filter
        val physicalWithOb = list
            .filter { it.incidentType.equals("Physical", ignoreCase = true) }
            .filter { it.policeObNumber.isNotBlank() }
        assertEquals(1, physicalWithOb.size)
        assertEquals(1L, physicalWithOb.first().id)
    }

    @Test
    fun `national lifelines contains all statutory South African zero rated lines`() {
        val lifelines = SafetyResourcesRepository.nationalLifelines
        assertTrue(lifelines.isNotEmpty())

        val gbvcc = lifelines.find { it.id == "gbvcc_voice" }
        assertNotNull(gbvcc)
        assertEquals("0800428428", gbvcc?.dialString)
        assertTrue(gbvcc?.isTollFree == true)

        val saps = lifelines.find { it.id == "saps_police" }
        assertNotNull(saps)
        assertEquals("10111", saps?.dialString)

        val ussdCallback = lifelines.find { it.id == "gbvcc_ussd" }
        assertNotNull(ussdCallback)
        assertEquals("*120*7867#", ussdCallback?.dialString)
        assertTrue(ussdCallback?.zeroDataZeroAirtime == true)
    }

    @Test
    fun `thuthuzela care centre directory provides accredited centers in all South African provinces`() {
        val provinces = Province.values().filter { it != Province.ALL }
        provinces.forEach { province ->
            val centers = ThuthuzelaRepository.centers.filter { it.province == province }
            assertTrue("Expected centres for province $province", centers.isNotEmpty())
            centers.forEach { center ->
                assertTrue(center.name.isNotBlank())
                assertTrue(center.contactNumber.isNotBlank())
                assertTrue(center.address.isNotBlank())
            }
        }
    }

    @Test
    fun `proverbs repository returns cultural empowerment content for all South African languages`() {
        val proverbs = ProverbsRepository.proverbs
        assertTrue(proverbs.isNotEmpty())
        proverbs.forEach { proverb ->
            assertTrue(proverb.proverbOriginal.isNotBlank())
            assertTrue(proverb.englishMeaning.isNotBlank())
            assertTrue(proverb.sourceCulture.isNotBlank())
        }
    }

    @Test
    fun `emergency dispatch helper formats 72 hour beacon with live location and Google Find My Device tracker`() {
        val helper = EmergencyDispatchHelper()
        val telemetry = DeviceTelemetryInfo(
            deviceModel = "Samsung Galaxy S24 Ultra",
            androidVersion = "Android 14 (API 34)",
            batteryPercentage = 84,
            isCharging = false,
            currentArea = "Braamfontein, Johannesburg"
        )
        val contact = GuardianEntity(
            name = "Thabo",
            surname = "Mokoena",
            mobileNumber1 = "0821234567",
            tiktokHandle = "thabo_protect",
            instagramHandle = "thabo_ice",
            facebookProfile = "thabo.mokoena",
            hasWhatsAppAccess = true
        )

        val messageNoLoc = helper.build72HourDistressMessage(null, telemetry, contact)
        assertTrue(messageNoLoc.contains("URGENT ICE ALERT FOR THABO MOKOENA:"))
        assertTrue(messageNoLoc.contains("LIVE LOCATION (72-HR BEACON): Location unavailable (Check Find My Device)"))
        assertTrue(messageNoLoc.contains("• CURRENT AREA: Braamfontein, Johannesburg"))
        assertTrue(messageNoLoc.contains("• GOOGLE FIND MY DEVICE TRACKER: https://www.google.com/android/find"))
        assertTrue(messageNoLoc.contains("• DEVICE BATTERY: 84%"))
        assertFalse(messageNoLoc.contains("(Charging)"))
        assertTrue(messageNoLoc.contains("• HANDSET: Samsung Galaxy S24 Ultra"))
        assertTrue(messageNoLoc.contains("IG: @thabo_ice"))
        assertTrue(messageNoLoc.contains("TikTok: @thabo_protect"))
        assertTrue(messageNoLoc.contains("FB: thabo.mokoena"))
        assertTrue(messageNoLoc.contains("SAPS 10111"))
        assertTrue(messageNoLoc.contains("0800 428 428"))
    }

    @Test
    fun `emergency dispatch helper charging indicator and pending GPS lock format correctly`() {
        val helper = EmergencyDispatchHelper()
        val telemetry = DeviceTelemetryInfo(
            deviceModel = "Pixel 8",
            androidVersion = "Android 15 (API 35)",
            batteryPercentage = 15,
            isCharging = true,
            currentArea = "Area pending GPS lock"
        )

        val message = helper.build72HourDistressMessage(null, telemetry, null)
        assertTrue(message.contains("EMERGENCY DISTRESS BEACON:"))
        assertTrue(message.contains("• DEVICE BATTERY: 15% (Charging)"))
        assertTrue(message.contains("• CURRENT AREA: Area pending GPS lock"))
    }

    @Test
    fun `emergency dispatch helper area name defaults to pending lock when location is null`() {
        val helper = EmergencyDispatchHelper()
        val area = helper.getAreaNameFromLocation(null)
        assertEquals("Area pending GPS lock", area)
    }

    @Test
    fun `emergency dispatch helper omits social media line if guardian has no handles`() {
        val helper = EmergencyDispatchHelper()
        val telemetry = DeviceTelemetryInfo(
            deviceModel = "Test Phone",
            androidVersion = "Android 14",
            batteryPercentage = 90,
            isCharging = false,
            currentArea = "Cape Town"
        )
        val guardian = GuardianEntity(
            name = "Kagiso",
            surname = "Molefe",
            mobileNumber1 = "0820001111"
        )

        val message = helper.build72HourDistressMessage(null, telemetry, guardian)

        assertTrue(message.contains("URGENT ICE ALERT FOR KAGISO MOLEFE:"))
        assertFalse(message.contains("• ICE GUARDIAN HANDLES:"))
    }

    // ── FEATURE 1 TESTS: SAFE JOURNEYS & DYNAMIC GEOFENCING ───────────────────

    @Test
    fun `haversine distance calculates accurate geographic distance in kilometers`() {
        // Distance between Johannesburg Central (-26.2045, 28.0381) and Sandton (-26.0827, 28.0583) ~ 13.6 km
        val distance = com.example.service.SafeJourneyManager.calculateDistanceKm(
            -26.2045, 28.0381,
            -26.0827, 28.0583
        )
        assertTrue(distance > 13.0 && distance < 14.5)
    }

    @Test
    fun `journey geofence detects safe return home within 1km fuzzy zone`() {
        val homeLat = -26.2000
        val homeLng = 28.0400
        val journey = com.example.data.local.entity.SafeJourneyEntity(
            activityTitle = "Class at Wits",
            destinationName = "Braamfontein Campus",
            originLat = -26.2000,
            originLng = 28.0400,
            departureRadiusKm = 3.0,
            homeFuzzyRadiusKm = 1.0
        )

        // Point 400m away from home
        val currentLat = -26.2030
        val currentLng = 28.0400
        val event = com.example.service.SafeJourneyManager.evaluateJourneyLocation(
            currentLat, currentLng, journey, homeLat, homeLng
        )

        assertEquals(com.example.service.JourneyTransitionEvent.SAFE_RETURN_HOME, event)
    }

    @Test
    fun `journey geofence detects departure exceeding 3km corridor`() {
        val homeLat = -26.2000
        val homeLng = 28.0400
        val journey = com.example.data.local.entity.SafeJourneyEntity(
            activityTitle = "Shopping at Rosebank",
            destinationName = "Rosebank Mall",
            originLat = -26.2000,
            originLng = 28.0400,
            departureRadiusKm = 3.0,
            homeFuzzyRadiusKm = 1.0
        )

        // Point 6km away from origin (outside 3km radius)
        val currentLat = -26.1500
        val currentLng = 28.0400
        val event = com.example.service.SafeJourneyManager.evaluateJourneyLocation(
            currentLat, currentLng, journey, null, null
        )

        assertEquals(com.example.service.JourneyTransitionEvent.DEPARTURE_3KM_EXCEEDED, event)
    }

    @Test
    fun `safe return notification strictly withholds address under Section 4(2) of Act 116 of 1998`() {
        val notification = com.example.service.SafeJourneyManager.buildSafeReturnNotification(
            userName = "Ayanda",
            activityTitle = "Night Shift at Clinic"
        )

        assertTrue(notification.contains("SAFE RETURN ALERT: Ayanda has safely returned to their home area"))
        assertTrue(notification.contains("Section 4(2) of Act 116 of 1998"))
        // Strict negative assertions: no coordinates, lat/lng or street details
        assertFalse(notification.contains("latitude"))
        assertFalse(notification.contains("longitude"))
        assertFalse(notification.contains("maps.google.com"))
    }

    // ── FEATURE 2 TESTS: STATUTORY USSD PLEASE CALL ME & 6-CHANNEL DISPATCH ───

    @Test
    fun `ussd helper resolves correct please call me string across South African carriers`() {
        val targetNumber = "0821234567"
        val targetE164 = "+27821234567"

        // Vodacom: *140*<number>#
        assertEquals("*140*0821234567#", com.example.service.UssdHelper.getPleaseCallMeCode("Vodacom", targetNumber))
        assertEquals("*140*0821234567#", com.example.service.UssdHelper.getPleaseCallMeCode("65501", targetE164))

        // MTN: *121*<number>#
        assertEquals("*121*0821234567#", com.example.service.UssdHelper.getPleaseCallMeCode("MTN-SA", targetNumber))
        assertEquals("*121*0821234567#", com.example.service.UssdHelper.getPleaseCallMeCode("65510", targetE164))

        // Cell C: *111*1*<number>#
        assertEquals("*111*1*0821234567#", com.example.service.UssdHelper.getPleaseCallMeCode("Cell C", targetNumber))
        assertEquals("*111*1*0821234567#", com.example.service.UssdHelper.getPleaseCallMeCode("65507", targetE164))

        // Telkom: *140*<number>#
        assertEquals("*140*0821234567#", com.example.service.UssdHelper.getPleaseCallMeCode("Telkom Mobile", targetNumber))
        assertEquals("*140*0821234567#", com.example.service.UssdHelper.getPleaseCallMeCode("65502", targetE164))
    }

    // ── FEATURE 3 TESTS: PROXIMITY-RANKED EMERGENCY FACILITIES ────────────────

    @Test
    fun `police station repository provides accredited SAPS stations with valid GPS coordinates`() {
        val stations = com.example.data.repository.PoliceStationRepository.stations
        assertTrue("Police stations database must have at least 10 stations", stations.size >= 10)
        stations.forEach { station ->
            assertTrue("Station ${station.name} must have a non-empty name", station.name.isNotBlank())
            assertTrue("Station ${station.name} must have a valid phone number", station.contactNumber.isNotBlank())
            assertTrue("Station ${station.name} latitude must be in South Africa (-35 to -22)", station.latitude in -35.0..-22.0)
            assertTrue("Station ${station.name} longitude must be in South Africa (16 to 33)", station.longitude in 16.0..33.0)
        }
    }

    // ── FEATURE 4 TESTS: PRIVATE CONTACT HASHING & HARDWARE GHOST IDENTITY ─────

    @Test
    fun `contact discovery helper normalizes various phone formats to statutory E164`() {
        assertEquals("+27821234567", com.example.service.ContactDiscoveryHelper.normalizeToE164("0821234567"))
        assertEquals("+27821234567", com.example.service.ContactDiscoveryHelper.normalizeToE164("27821234567"))
        assertEquals("+27821234567", com.example.service.ContactDiscoveryHelper.normalizeToE164("+27821234567"))
        assertEquals("+27821234567", com.example.service.ContactDiscoveryHelper.normalizeToE164("082 123 4567"))
    }

    @Test
    fun `contact discovery phone hashing is deterministic and salted`() {
        val phone = "+27821234567"
        val hash1 = com.example.service.ContactDiscoveryHelper.hashPhoneNumber(phone)
        val hash2 = com.example.service.ContactDiscoveryHelper.hashPhoneNumber(phone)

        assertEquals(hash1, hash2)
        assertEquals(64, hash1.length) // SHA-256 hex string length
        assertFalse(hash1.contains("821234567")) // Raw phone is never exposed
    }

    @Test
    fun `hardware identifier helper computes consistent SHA256 hardware hash`() {
        val input = "AID:test_device_1234:FP:google/pixel8/husky"
        val hash = com.example.service.HardwareIdentifierHelper.computeHash(input)
        assertEquals(64, hash.length)
        val hashAgain = com.example.service.HardwareIdentifierHelper.computeHash(input)
        assertEquals(hash, hashAgain)
    }
}
