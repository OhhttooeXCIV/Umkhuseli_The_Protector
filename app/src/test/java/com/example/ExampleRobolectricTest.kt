package com.example

import android.app.Application
import android.content.Context
import androidx.test.core.app.ApplicationProvider
import com.example.data.local.AppDatabase
import com.example.data.local.entity.GuardianEntity
import com.example.data.model.Province
import com.example.data.repository.ProverbsRepository
import com.example.data.repository.SafetyResourcesRepository
import com.example.data.repository.ThuthuzelaRepository
import com.example.service.EmergencyDispatchHelper
import com.example.service.EmergencyService
import com.example.service.VaultEncryptionHelper
import com.example.ui.viewmodel.SafetySignalState
import com.example.ui.viewmodel.SafetyTriggerViewModel
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.StandardTestDispatcher
import kotlinx.coroutines.test.advanceUntilIdle
import kotlinx.coroutines.test.resetMain
import kotlinx.coroutines.test.runTest
import kotlinx.coroutines.test.setMain
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotEquals
import org.junit.Assert.assertTrue
import org.junit.After
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [34])
class ExampleRobolectricTest {

    @Test
    fun `read app name string from context`() {
        val context = ApplicationProvider.getApplicationContext<Context>()
        val appName = context.getString(R.string.app_name)
        assertEquals("Sankofa Safe", appName)
    }

    @Test
    fun `national lifelines contains toll free GBV command centre`() {
        val lifelines = SafetyResourcesRepository.nationalLifelines
        assertTrue(lifelines.isNotEmpty())
        val gbvcc = lifelines.find { it.id == "gbvcc_voice" }
        assertTrue(gbvcc != null)
        assertEquals("0800428428", gbvcc?.dialString)
        assertTrue(gbvcc?.isTollFree == true)

        val gbvUssd = lifelines.find { it.id == "gbvcc_ussd" }
        assertTrue(gbvUssd != null)
        assertEquals("*120*7867#", gbvUssd?.dialString)
    }

    @Test
    fun `thuthuzela directory has all 9 South African provinces covered`() {
        val centers = ThuthuzelaRepository.centers
        assertTrue(centers.size >= 15)
        val provincesPresent = centers.map { it.province }.toSet()
        assertTrue(provincesPresent.contains(Province.GAUTENG))
        assertTrue(provincesPresent.contains(Province.WESTERN_CAPE))
        assertTrue(provincesPresent.contains(Province.KWAZULU_NATAL))
        assertTrue(provincesPresent.contains(Province.EASTERN_CAPE))
        assertTrue(provincesPresent.contains(Province.FREE_STATE))
        assertTrue(provincesPresent.contains(Province.LIMPOPO))
        assertTrue(provincesPresent.contains(Province.MPUMALANGA))
        assertTrue(provincesPresent.contains(Province.NORTH_WEST))
        assertTrue(provincesPresent.contains(Province.NORTHERN_CAPE))
    }

    @Test
    fun `proverbs repository contains core Sankofa and Ubuntu reflections`() {
        val proverbs = ProverbsRepository.proverbs
        assertTrue(proverbs.isNotEmpty())
        assertTrue(proverbs.any { it.sourceCulture.contains("Sankofa") })
        assertTrue(proverbs.any { it.sourceCulture.contains("Zulu") })
    }

    @OptIn(ExperimentalCoroutinesApi::class)
@Before
fun setUp() {
    Dispatchers.setMain(StandardTestDispatcher())
}

@OptIn(ExperimentalCoroutinesApi::class)
@After
fun tearDown() {
    Dispatchers.resetMain()
}

@OptIn(ExperimentalCoroutinesApi::class)
@Test
fun `safety trigger view model arms and logs distress timestamp to room database`() = runTest {
    val app = ApplicationProvider.getApplicationContext<Application>()
    val db = AppDatabase.getInstance(app)
    val emergencyService = EmergencyService(app)
    val emergencyDispatchHelper = EmergencyDispatchHelper(app)
    val viewModel = SafetyTriggerViewModel(db, emergencyService, emergencyDispatchHelper)

    assertEquals(SafetySignalState.Idle, viewModel.signalState.value)

    viewModel.armQuickAccessSos(countdownSeconds = 3)
    advanceUntilIdle()
    assertTrue(viewModel.signalState.value is SafetySignalState.Armed)

    viewModel.cancelArmedSos("Cancelled in test")
    advanceUntilIdle()
    assertTrue(viewModel.signalState.value is SafetySignalState.Cancelled)

    viewModel.triggerInstantSos("Immediate danger distress test alert")
    advanceUntilIdle()

    val state = viewModel.signalState.value
    assertTrue(state is SafetySignalState.Dispatched)

    val dispatched = state as SafetySignalState.Dispatched
    assertTrue(dispatched.incidentId > 0)
    assertTrue(dispatched.timestamp > 0)
    assertTrue(dispatched.formattedTime.isNotBlank())

    val incident = db.incidentDao().getIncidentById(dispatched.incidentId)
    assertTrue(incident != null)
    assertEquals("Emergency SOS Distress Signal", incident?.incidentType)
    assertEquals(5, incident?.severityLevel)
    assertEquals(dispatched.timestamp, incident?.timestamp)

    // viewModel.onCleared() is protected
}

    @Test
    fun `vault encryption helper encrypts and decrypts sensitive incident notes`() {
        val helper = VaultEncryptionHelper()
        val sensitiveStatement = "Confidential domestic abuse statement and J88 medical report details."

        val encrypted = helper.encrypt(sensitiveStatement)
        assertTrue(encrypted.startsWith("ENC:"))
        assertNotEquals(sensitiveStatement, encrypted)

        val decrypted = helper.decrypt(encrypted)
        assertEquals(sensitiveStatement, decrypted)
    }

    @Test
    fun `emergency dispatch helper builds 72 hour beacon with find my device and social media`() {
        val context = ApplicationProvider.getApplicationContext<Context>()
        val helper = EmergencyDispatchHelper(context)

        val contact = GuardianEntity(
            name = "Thabo",
            surname = "Mokoena",
            mobileNumber1 = "0821234567",
            mobileNumber2 = "0719876543",
            emailAddress1 = "thabo@example.com",
            tiktokHandle = "thabo_protect",
            instagramHandle = "thabo_ice",
            facebookProfile = "thabo.mokoena",
            hasWhatsAppAccess = true
        )

        val telemetry = helper.getDeviceTelemetry(null)
        val message = helper.build72HourDistressMessage(null, telemetry, contact)

        assertTrue(message.contains("LIVE LOCATION (72-HR BEACON)"))
        assertTrue(message.contains("https://www.google.com/android/find"))
        assertTrue(message.contains("IG: @thabo_ice"))
        assertTrue(message.contains("TikTok: @thabo_protect"))
        assertTrue(message.contains("10111"))
    }
}
