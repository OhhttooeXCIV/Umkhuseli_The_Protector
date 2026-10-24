package com.example

import android.content.Context
import android.location.Location
import androidx.test.core.app.ApplicationProvider
import com.example.data.local.entity.GuardianEntity
import com.example.service.DeviceTelemetryInfo
import com.example.service.EmergencyDispatchHelper
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [34])
class EmergencyDispatchHelperTest {

    private lateinit var context: Context
    private lateinit var helper: EmergencyDispatchHelper

    @Before
    fun setUp() {
        context = ApplicationProvider.getApplicationContext()
        helper = EmergencyDispatchHelper(context)
    }

    @Test
    fun `build72HourDistressMessage with location formats live Google Maps coordinates`() {
        val location = Location("gps").apply {
            latitude = -26.2041
            longitude = 28.0473
        }
        val telemetry = DeviceTelemetryInfo(
            deviceModel = "Samsung Galaxy S24",
            androidVersion = "Android 14 (API 34)",
            batteryPercentage = 84,
            isCharging = false,
            currentArea = "Braamfontein, Johannesburg"
        )

        val message = helper.build72HourDistressMessage(location, telemetry, null)

        assertTrue(message.contains("EMERGENCY DISTRESS BEACON:"))
        assertTrue(message.contains("• CURRENT AREA: Braamfontein, Johannesburg"))
        assertTrue(message.contains("• LIVE LOCATION (72-HR BEACON): https://maps.google.com/?q=-26.2041,28.0473"))
        assertTrue(message.contains("• GOOGLE FIND MY DEVICE TRACKER: https://www.google.com/android/find"))
        assertTrue(message.contains("• DEVICE BATTERY: 84%"))
        assertFalse(message.contains("(Charging)"))
        assertTrue(message.contains("• HANDSET: Samsung Galaxy S24"))
        assertTrue(message.contains("SAPS 10111"))
        assertTrue(message.contains("0800 428 428"))
    }

    @Test
    fun `build72HourDistressMessage without location provides fallback Find My Device notice`() {
        val telemetry = DeviceTelemetryInfo(
            deviceModel = "Google Pixel 8",
            androidVersion = "Android 15 (API 35)",
            batteryPercentage = 15,
            isCharging = true,
            currentArea = "Area pending GPS lock"
        )

        val message = helper.build72HourDistressMessage(null, telemetry, null)

        assertTrue(message.contains("• LIVE LOCATION (72-HR BEACON): Location unavailable (Check Find My Device)"))
        assertTrue(message.contains("• DEVICE BATTERY: 15% (Charging)"))
    }

    @Test
    fun `build72HourDistressMessage with guardian contact formats personalized alert and social handles`() {
        val location = Location("gps").apply {
            latitude = -29.8587
            longitude = 31.0218
        }
        val telemetry = DeviceTelemetryInfo(
            deviceModel = "Xiaomi Redmi Note 13",
            androidVersion = "Android 14 (API 34)",
            batteryPercentage = 62,
            isCharging = false,
            currentArea = "Durban Central, eThekwini"
        )
        val guardian = GuardianEntity(
            name = "Nomusa",
            surname = "Zungu",
            mobileNumber1 = "0731234567",
            instagramHandle = "nomusa_z",
            tiktokHandle = "nomusa_safety",
            facebookProfile = "nomusa.zungu"
        )

        val message = helper.build72HourDistressMessage(location, telemetry, guardian)

        assertTrue(message.contains("URGENT ICE ALERT FOR NOMUSA ZUNGU:"))
        assertTrue(message.contains("• ICE GUARDIAN HANDLES: "))
        assertTrue(message.contains("IG: @nomusa_z"))
        assertTrue(message.contains("TikTok: @nomusa_safety"))
        assertTrue(message.contains("FB: nomusa.zungu"))
    }

    @Test
    fun `build72HourDistressMessage omits social media line if guardian has no handles`() {
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

    @Test
    fun `getAreaNameFromLocation returns pending lock when location is null`() {
        val area = helper.getAreaNameFromLocation(null)
        assertEquals("Area pending GPS lock", area)
    }

    @Test
    fun `getDeviceTelemetry returns valid telemetry info on robolectric context`() {
        val telemetry = helper.getDeviceTelemetry(null)
        assertTrue(telemetry.batteryPercentage in 0..100)
        assertTrue(telemetry.deviceModel.isNotBlank())
        assertTrue(telemetry.androidVersion.isNotBlank())
        assertEquals("https://www.google.com/android/find", telemetry.findMyDeviceUrl)
    }
}
