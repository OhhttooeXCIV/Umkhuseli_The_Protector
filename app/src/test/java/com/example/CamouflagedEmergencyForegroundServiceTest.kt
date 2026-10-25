package com.example

import com.example.service.CamouflagedEmergencyForegroundService
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Test

class CamouflagedEmergencyForegroundServiceTest {

    @Test
    fun testServiceConstantsAndDisguisePersonas() {
        assertEquals("com.example.service.action.START_DISPATCH", CamouflagedEmergencyForegroundService.ACTION_START_DISPATCH)
        assertEquals("com.example.service.action.STOP_DISPATCH", CamouflagedEmergencyForegroundService.ACTION_STOP_DISPATCH)
        assertEquals("MUNICIPAL_PREPAID", CamouflagedEmergencyForegroundService.PERSONA_POWERCALC)
        assertEquals("DAILY_DEVOTIONAL", CamouflagedEmergencyForegroundService.PERSONA_DAILY_VERSE)
        assertEquals("SYSTEM_OPTIMIZER", CamouflagedEmergencyForegroundService.PERSONA_SYSTEM_OPTIMIZER)
        assertEquals("umkhuseli_utility_sync_channel", CamouflagedEmergencyForegroundService.CHANNEL_ID)
        assertEquals(40401, CamouflagedEmergencyForegroundService.NOTIFICATION_ID)
    }

    @Test
    fun testDozeCheckIntervalsAreBatterySafe() {
        // Assert 15-minute interval for Doze mode to preserve survivor's battery during outages
        val fifteenMinutesMs = 15 * 60 * 1000L
        assertEquals(fifteenMinutesMs, CamouflagedEmergencyForegroundService.DOZE_CHECK_INTERVAL_MS)
        assertEquals(500f, CamouflagedEmergencyForegroundService.MIN_DISTANCE_METERS)
    }
}
