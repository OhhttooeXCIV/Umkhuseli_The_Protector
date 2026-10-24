package com.example

import com.example.data.local.entity.IncidentEntity
import com.example.ui.safehaven.SortOrder
import com.example.ui.safehaven.filterAndSortIncidents
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test

class Form2RecordViewerTest {

    private lateinit var sampleIncidents: List<IncidentEntity>

    @Before
    fun setUp() {
        sampleIncidents = listOf(
            IncidentEntity(
                id = 1L,
                timestamp = 1000L,
                dateTimeFormatted = "01 Jan 2026, 10:00",
                incidentType = "Physical Violence",
                severityLevel = 5,
                perpetrator = "Former Partner",
                locationDescription = "Shared Residence",
                description = "Assault incident at residence",
                injuriesOrImpact = "Bruising to shoulder",
                witnesses = "Neighbor",
                policeObNumber = "OB 102/05/2026"
            ),
            IncidentEntity(
                id = 2L,
                timestamp = 3000L,
                dateTimeFormatted = "03 Jan 2026, 12:00",
                incidentType = "Emotional & Verbal Abuse",
                severityLevel = 2,
                perpetrator = "Former Partner",
                locationDescription = "Phone call",
                description = "Verbal threats via phone",
                injuriesOrImpact = "Emotional distress",
                witnesses = "None",
                policeObNumber = ""
            ),
            IncidentEntity(
                id = 3L,
                timestamp = 2000L,
                dateTimeFormatted = "02 Jan 2026, 11:00",
                incidentType = "Physical Violence",
                severityLevel = 4,
                perpetrator = "Former Partner",
                locationDescription = "Driveway",
                description = "Physical confrontation without formal police case",
                injuriesOrImpact = "Sprained wrist",
                witnesses = "Security Guard",
                policeObNumber = ""
            ),
            IncidentEntity(
                id = 4L,
                timestamp = 4000L,
                dateTimeFormatted = "04 Jan 2026, 14:00",
                incidentType = "Economic Abuse",
                severityLevel = 3,
                perpetrator = "Former Partner",
                locationDescription = "Bank branch",
                description = "Deprivation of financial resources and identity documents",
                injuriesOrImpact = "Financial destitution",
                witnesses = "Bank teller",
                policeObNumber = "OB 405/06/2026"
            ),
            IncidentEntity(
                id = 5L,
                timestamp = 5000L,
                dateTimeFormatted = "05 Jan 2026, 16:00",
                incidentType = "Harassment & Stalking",
                severityLevel = 1,
                perpetrator = "Former Partner",
                locationDescription = "Workplace parking lot",
                description = "Following complainant to workplace",
                injuriesOrImpact = "Fear for safety",
                witnesses = "Colleague",
                policeObNumber = "OB 99/07/2026"
            )
        )
    }

    @Test
    fun `empty incidents list returns empty list across all filters and sorts`() {
        val result = filterAndSortIncidents(
            incidents = emptyList(),
            sortOrder = SortOrder.DATE_DESC,
            selectedTypeFilter = "All",
            filterByPoliceOb = false
        )
        assertTrue(result.isEmpty())
    }

    @Test
    fun `sort by DATE_DESC orders incidents from newest to oldest`() {
        val sorted = filterAndSortIncidents(
            incidents = sampleIncidents,
            sortOrder = SortOrder.DATE_DESC
        )
        assertEquals(5, sorted.size)
        assertEquals(listOf(5000L, 4000L, 3000L, 2000L, 1000L), sorted.map { it.timestamp })
    }

    @Test
    fun `sort by DATE_ASC orders incidents from oldest to newest`() {
        val sorted = filterAndSortIncidents(
            incidents = sampleIncidents,
            sortOrder = SortOrder.DATE_ASC
        )
        assertEquals(5, sorted.size)
        assertEquals(listOf(1000L, 2000L, 3000L, 4000L, 5000L), sorted.map { it.timestamp })
    }

    @Test
    fun `sort by SEVERITY_DESC orders incidents from highest to lowest severity`() {
        val sorted = filterAndSortIncidents(
            incidents = sampleIncidents,
            sortOrder = SortOrder.SEVERITY_DESC
        )
        assertEquals(5, sorted.size)
        assertEquals(listOf(5, 4, 3, 2, 1), sorted.map { it.severityLevel })
    }

    @Test
    fun `sort by SEVERITY_ASC orders incidents from lowest to highest severity`() {
        val sorted = filterAndSortIncidents(
            incidents = sampleIncidents,
            sortOrder = SortOrder.SEVERITY_ASC
        )
        assertEquals(5, sorted.size)
        assertEquals(listOf(1, 2, 3, 4, 5), sorted.map { it.severityLevel })
    }

    @Test
    fun `filter by abuse category matches case-insensitively and filters out non-matching types`() {
        val filtered = filterAndSortIncidents(
            incidents = sampleIncidents,
            selectedTypeFilter = "physical violence"
        )
        assertEquals(2, filtered.size)
        assertTrue(filtered.all { it.incidentType.equals("Physical Violence", ignoreCase = true) })
        assertEquals(listOf(3L, 1L), filtered.map { it.id }) // Default DATE_DESC: timestamp 2000L before 1000L
    }

    @Test
    fun `filter by abuse category All includes all abuse types`() {
        val filtered = filterAndSortIncidents(
            incidents = sampleIncidents,
            selectedTypeFilter = "All"
        )
        assertEquals(5, filtered.size)
    }

    @Test
    fun `filter by SAPS OB status includes only incidents with non-blank police OB number`() {
        val filtered = filterAndSortIncidents(
            incidents = sampleIncidents,
            filterByPoliceOb = true
        )
        assertEquals(3, filtered.size)
        assertTrue(filtered.all { it.policeObNumber.isNotBlank() })
        assertEquals(listOf(5L, 4L, 1L), filtered.map { it.id })
    }

    @Test
    fun `combined filter by abuse category and SAPS OB status with SEVERITY_DESC sort`() {
        val filtered = filterAndSortIncidents(
            incidents = sampleIncidents,
            sortOrder = SortOrder.SEVERITY_DESC,
            selectedTypeFilter = "Physical Violence",
            filterByPoliceOb = true
        )
        assertEquals(1, filtered.size)
        val record = filtered.first()
        assertEquals(1L, record.id)
        assertEquals("Physical Violence", record.incidentType)
        assertEquals("OB 102/05/2026", record.policeObNumber)
        assertEquals(5, record.severityLevel)
    }

    @Test
    fun `filter returning no matches yields empty list without exception`() {
        val filtered = filterAndSortIncidents(
            incidents = sampleIncidents,
            selectedTypeFilter = "NonExistentAbuseType"
        )
        assertTrue(filtered.isEmpty())
    }
}
