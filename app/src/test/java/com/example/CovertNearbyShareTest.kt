package com.example

import com.example.service.ApkIntegrityVerifier
import com.example.service.WifiDirectShareManager
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Rule
import org.junit.Test
import org.junit.rules.TemporaryFolder
import java.io.File

class CovertNearbyShareTest {

    @get:Rule
    val tempFolder = TemporaryFolder()

    private lateinit var verifier: ApkIntegrityVerifier

    @Before
    fun setUp() {
        verifier = ApkIntegrityVerifier(null)
    }

    @Test
    fun testSha256ComputationForBytes() {
        val testString = "Umkhuseli_The_Protector_Offline_P2P_Share"
        val expectedSha256 = java.security.MessageDigest.getInstance("SHA-256")
            .digest(testString.toByteArray(Charsets.UTF_8))
            .joinToString("") { "%02x".format(it) }

        val actual = verifier.computeSha256(testString.toByteArray(Charsets.UTF_8))
        assertEquals(expectedSha256, actual)
    }

    @Test
    fun testSha256ComputationForFile() {
        val file = tempFolder.newFile("test_payload.bin")
        val content = "Covert P2P distribution without internet access or cellular data"
        file.writeText(content, Charsets.UTF_8)

        val hash = verifier.computeSha256(file)
        assertNotNull(hash)
        assertEquals(64, hash.length) // 64 hex characters for SHA-256
    }

    @Test
    fun testVerifyApkRejectsNonExistentFile() {
        val nonExistent = File(tempFolder.root, "does_not_exist.apk")
        val result = verifier.verifyApk(nonExistent)

        assertFalse(result.isValid)
        assertTrue(result.failureReason?.contains("does not exist") == true)
    }

    @Test
    fun testVerifyApkRejectsTruncatedFile() {
        val tinyFile = tempFolder.newFile("tiny.apk")
        tinyFile.writeBytes(ByteArray(50 * 1024)) // 50KB (below 100KB minimum threshold)

        val result = verifier.verifyApk(tinyFile)
        assertFalse(result.isValid)
        assertTrue(result.failureReason?.contains("too small") == true)
    }

    @Test
    fun testVerifyApkDetectsHashMismatch() {
        val fakeApk = tempFolder.newFile("fake.apk")
        fakeApk.writeBytes(ByteArray(150 * 1024)) // 150KB

        val wrongHash = "0000000000000000000000000000000000000000000000000000000000000000"
        val result = verifier.verifyApk(fakeApk, expectedSha256 = wrongHash)

        assertFalse(result.isValid)
        assertTrue(result.failureReason?.contains("mismatch") == true)
    }

    @Test
    fun testVerifyApkSuccessWithCorrectHash() {
        val fakeApk = tempFolder.newFile("valid_size.apk")
        fakeApk.writeBytes(ByteArray(120 * 1024)) // 120KB
        val hash = verifier.computeSha256(fakeApk)

        val result = verifier.verifyApk(fakeApk, expectedSha256 = hash)
        assertTrue(result.isValid)
        assertEquals(hash, result.sha256Hash)
    }

    @Test
    fun testWifiDirectProtocolConstants() {
        assertEquals(8988, WifiDirectShareManager.DEFAULT_PORT)
        assertEquals("UMKHUSELI_P2P_V1", WifiDirectShareManager.HEADER_MAGIC)
        assertEquals(64 * 1024, WifiDirectShareManager.BUFFER_SIZE)
        assertEquals("covert_share", WifiDirectShareManager.CACHE_SUBDIR)
    }
}
