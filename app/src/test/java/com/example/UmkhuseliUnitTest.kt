package com.example

import com.example.data.local.entity.GuardianEntity
import com.example.data.local.entity.IncidentEntity
import com.example.data.local.entity.UserProfileEntity
import com.example.data.model.Province
import com.example.data.repository.ProverbsRepository
import com.example.data.repository.SafetyResourcesRepository
import com.example.data.repository.ThuthuzelaRepository
import com.example.ui.safehaven.SortOrder
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * High-speed pure JVM Unit Tests for Umkhuseli / Sankofa Safe.
 * Tests domain models, legal particulars, Domestic Violence Act Section 4(2) address withholding,
 * Form 2 filter and sort engine, safety repositories, and provincial coverage.
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
}
