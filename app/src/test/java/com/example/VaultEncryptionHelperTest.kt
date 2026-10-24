package com.example

import com.example.service.VaultEncryptionHelper
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotEquals
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test

class VaultEncryptionHelperTest {

    private lateinit var helper: VaultEncryptionHelper

    @Before
    fun setUp() {
        helper = VaultEncryptionHelper()
    }

    @Test
    fun `encrypt empty string returns empty string`() {
        val encrypted = helper.encrypt("")
        assertEquals("", encrypted)
    }

    @Test
    fun `decrypt unencrypted plain text returns unchanged text`() {
        val plain = "Unencrypted legacy record notes without ENC prefix."
        val result = helper.decrypt(plain)
        assertEquals(plain, result)
    }

    @Test
    fun `encrypt produces ENC prefix and ciphertext differing from plaintext`() {
        val narrative = "Respondent arrived intoxicated and breached interim protection order."
        val encrypted = helper.encrypt(narrative)
        assertTrue(encrypted.startsWith("ENC:"))
        assertNotEquals(narrative, encrypted)
    }

    @Test
    fun `encrypting identical text produces different ciphertexts due to unique IV nonces`() {
        val statement = "Medical examination report completed at Thuthuzela Care Centre."
        val enc1 = helper.encrypt(statement)
        val enc2 = helper.encrypt(statement)
        assertNotEquals(enc1, enc2)
        // Decrypting both must yield the exact same original statement
        assertEquals(statement, helper.decrypt(enc1))
        assertEquals(statement, helper.decrypt(enc2))
    }

    @Test
    fun `roundtrip encryption and decryption preserves South African victim narrative and J88 clinical notes`() {
        val detailedVictimNarrative = """
            CONFIDENTIAL COMPLAINANT STATEMENT:
            Date: 24 October 2026, 21:45
            Location: Protea Glen Ext 4, Soweto, Gauteng
            SAPS OB Number: OB 842/10/2026
            J88 Medical Report: Severe bruising to upper thorax, laceration to left forearm.
            Attending Clinician: Dr. M. Dlamini, Chris Hani Baragwanath TCC.
            Statutory Reference: Section 4(1) of Domestic Violence Act 116 of 1998 as amended by Act 14 of 2021.
            IsiZulu Statement: "Umsolwa ungene ngenkani endlini engiphoqa, engisongela ngokuthi uzongilimaza."
        """.trimIndent()

        val encrypted = helper.encrypt(detailedVictimNarrative)
        assertTrue(encrypted.startsWith("ENC:"))

        val decrypted = helper.decrypt(encrypted)
        assertEquals(detailedVictimNarrative, decrypted)
    }

    @Test
    fun `roundtrip encryption handles non-ASCII unicode and emoji characters`() {
        val textWithSpecialChars = "Sankofa: Se wo were fi na wosankofa a yenkyi 🛡️ 🇿🇦 - Ubuntu: Umuntu ngumuntu ngabantu."
        val encrypted = helper.encrypt(textWithSpecialChars)
        val decrypted = helper.decrypt(encrypted)
        assertEquals(textWithSpecialChars, decrypted)
    }

    @Test
    fun `decrypt corrupted ciphertext gracefully returns fallback without crashing`() {
        val corrupted = "ENC:ThisIsNotValidBase64Data!!"
        val result = helper.decrypt(corrupted)
        assertEquals(corrupted, result)
    }

    @Test
    fun `decrypt short base64 payload returns original text`() {
        // Less than or equal to 12 bytes IV
        val shortEncrypted = "ENC:QUJDREVGR0g=" // "ABCDEFGH" (8 bytes)
        val result = helper.decrypt(shortEncrypted)
        assertEquals(shortEncrypted, result)
    }
}
