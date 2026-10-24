package com.example

import android.content.Context
import androidx.room.Room
import androidx.test.core.app.ApplicationProvider
import com.example.data.local.AppDatabase
import com.example.data.local.dao.UserProfileDao
import com.example.data.local.entity.UserProfileEntity
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.test.runTest
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [36])
class UserProfileDaoTest {

    private lateinit var db: AppDatabase
    private lateinit var userProfileDao: UserProfileDao

    @Before
    fun createDb() {
        val context = ApplicationProvider.getApplicationContext<Context>()
        db = Room.inMemoryDatabaseBuilder(context, AppDatabase::class.java)
            .allowMainThreadQueries()
            .build()
        userProfileDao = db.userProfileDao()
    }

    @After
    fun closeDb() {
        db.close()
    }

    @Test
    fun defaultProfileEntity_hasExpectedDefaultValues() {
        val profile = UserProfileEntity()
        assertEquals(1L, profile.id)
        assertEquals("", profile.fullLegalNames)
        assertEquals("", profile.idOrPassportNumber)
        assertEquals("", profile.safeContactNumber)
        assertEquals("", profile.safeServiceAddress)
        assertFalse(profile.isAddressWithheld)
        assertEquals("Spouse / Intimate Partner", profile.relationshipToRespondent)
        assertEquals("", profile.respondentName)
        assertEquals("", profile.digitalSignatureBase64)
        assertFalse(profile.useDynamicLauncherTheme)
        assertEquals("9999", profile.duressPin)
        assertFalse(profile.isProfileCompleted)
        assertFalse(profile.isBatteryOptimizationDismissed)
        assertTrue(profile.autoScrubMedia)
        assertTrue(profile.createdAt > 0)
    }

    @Test
    fun upsertProfile_insertsNewProfileAndRetrievesIt() = runTest {
        val profile = UserProfileEntity(
            id = 1L,
            fullLegalNames = "Nandi Nomvula Khumalo",
            idOrPassportNumber = "9201010000085",
            safeContactNumber = "0823334444",
            safeServiceAddress = "12 Protea Lane, Rosebank, Johannesburg",
            isAddressWithheld = true, // Section 4(2) DVA right to withhold address
            relationshipToRespondent = "Former Domestic Partner",
            respondentName = "Sipho Ndlovu",
            digitalSignatureBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
            duressPin = "1234",
            isProfileCompleted = true,
            autoScrubMedia = true
        )

        userProfileDao.upsertProfile(profile)

        val retrieved = userProfileDao.getProfile()
        assertNotNull(retrieved)
        assertEquals("Nandi Nomvula Khumalo", retrieved?.fullLegalNames)
        assertEquals("9201010000085", retrieved?.idOrPassportNumber)
        assertEquals("0823334444", retrieved?.safeContactNumber)
        assertEquals("12 Protea Lane, Rosebank, Johannesburg", retrieved?.safeServiceAddress)
        assertTrue(retrieved?.isAddressWithheld == true)
        assertEquals("Former Domestic Partner", retrieved?.relationshipToRespondent)
        assertEquals("Sipho Ndlovu", retrieved?.respondentName)
        assertEquals("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...", retrieved?.digitalSignatureBase64)
        assertEquals("1234", retrieved?.duressPin)
        assertTrue(retrieved?.isProfileCompleted == true)
        assertTrue(retrieved?.autoScrubMedia == true)
    }

    @Test
    fun upsertProfile_replacesExistingProfileOnConflict() = runTest {
        val initial = UserProfileEntity(
            id = 1L,
            fullLegalNames = "Lerato Modise",
            safeContactNumber = "0811112222",
            isProfileCompleted = false
        )
        userProfileDao.upsertProfile(initial)

        val updated = initial.copy(
            fullLegalNames = "Lerato Modise-Mthembu",
            safeContactNumber = "0839998888",
            isProfileCompleted = true,
            duressPin = "4321"
        )
        userProfileDao.upsertProfile(updated)

        val current = userProfileDao.getProfile()
        assertNotNull(current)
        assertEquals("Lerato Modise-Mthembu", current?.fullLegalNames)
        assertEquals("0839998888", current?.safeContactNumber)
        assertTrue(current?.isProfileCompleted == true)
        assertEquals("4321", current?.duressPin)
    }

    @Test
    fun updateProfile_updatesExistingEntity() = runTest {
        val initial = UserProfileEntity(
            id = 1L,
            fullLegalNames = "Zola Dlamini",
            isAddressWithheld = false
        )
        userProfileDao.upsertProfile(initial)

        val modified = initial.copy(isAddressWithheld = true, safeServiceAddress = "Clerk of Court Safe Delivery")
        userProfileDao.updateProfile(modified)

        val retrieved = userProfileDao.getProfile()
        assertTrue(retrieved?.isAddressWithheld == true)
        assertEquals("Clerk of Court Safe Delivery", retrieved?.safeServiceAddress)
    }

    @Test
    fun getProfileFlow_emitsLatestProfileUpdates() = runTest {
        val flow = userProfileDao.getProfileFlow()

        val initialEmission = flow.first()
        assertNull(initialEmission)

        val profile = UserProfileEntity(
            id = 1L,
            fullLegalNames = "Ayanda Cele",
            respondentName = "Bheki Cele"
        )
        userProfileDao.upsertProfile(profile)

        val updatedEmission = flow.first()
        assertNotNull(updatedEmission)
        assertEquals("Ayanda Cele", updatedEmission?.fullLegalNames)
    }

    @Test
    fun clearProfile_deletesAllProfileRecords() = runTest {
        val profile = UserProfileEntity(
            id = 1L,
            fullLegalNames = "Test Complainant",
            isProfileCompleted = true
        )
        userProfileDao.upsertProfile(profile)
        assertNotNull(userProfileDao.getProfile())

        userProfileDao.clearProfile()
        assertNull(userProfileDao.getProfile())
    }
}
