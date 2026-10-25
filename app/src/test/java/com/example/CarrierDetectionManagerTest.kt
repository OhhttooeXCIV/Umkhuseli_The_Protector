package com.example

import com.example.service.SaCarrier
import com.example.service.ZeroRatedCarrierMatrix
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class CarrierDetectionManagerTest {

    @Test
    fun testCarrierFromIdentifierAndMccMnc() {
        assertEquals(SaCarrier.VODACOM, SaCarrier.fromIdentifier("Vodacom"))
        assertEquals(SaCarrier.VODACOM, SaCarrier.fromIdentifier("VODACOM-SA"))
        assertEquals(SaCarrier.VODACOM, SaCarrier.fromIdentifier("65501"))

        assertEquals(SaCarrier.MTN, SaCarrier.fromIdentifier("MTN"))
        assertEquals(SaCarrier.MTN, SaCarrier.fromIdentifier("MTN-SA"))
        assertEquals(SaCarrier.MTN, SaCarrier.fromIdentifier("65510"))

        assertEquals(SaCarrier.CELL_C, SaCarrier.fromIdentifier("Cell C"))
        assertEquals(SaCarrier.CELL_C, SaCarrier.fromIdentifier("CellC"))
        assertEquals(SaCarrier.CELL_C, SaCarrier.fromIdentifier("65507"))

        assertEquals(SaCarrier.TELKOM, SaCarrier.fromIdentifier("Telkom"))
        assertEquals(SaCarrier.TELKOM, SaCarrier.fromIdentifier("Telkom Mobile"))
        assertEquals(SaCarrier.TELKOM, SaCarrier.fromIdentifier("65502"))

        assertEquals(SaCarrier.UNKNOWN, SaCarrier.fromIdentifier("ExoticRoam99"))
    }

    @Test
    fun testPleaseCallMeCodeGenerationAcrossAllMajorCarriers() {
        val targetPhone = "+27 82 123 4567"
        assertEquals("*140*0821234567#", ZeroRatedCarrierMatrix.getPleaseCallMeCode(SaCarrier.VODACOM, targetPhone))
        assertEquals("*121*0821234567#", ZeroRatedCarrierMatrix.getPleaseCallMeCode(SaCarrier.MTN, targetPhone))
        assertEquals("*111*1*0821234567#", ZeroRatedCarrierMatrix.getPleaseCallMeCode(SaCarrier.CELL_C, targetPhone))
        assertEquals("*140*0821234567#", ZeroRatedCarrierMatrix.getPleaseCallMeCode(SaCarrier.TELKOM, targetPhone))
    }

    @Test
    fun testReverseBilledEmergencyUssd() {
        val target = "0829876543"
        val codeWithoutRef = ZeroRatedCarrierMatrix.getReverseBilledEmergencyUssd(target)
        assertEquals("*134*7867*0829876543#", codeWithoutRef)

        val codeWithRef = ZeroRatedCarrierMatrix.getReverseBilledEmergencyUssd(target, "CASE2026")
        assertEquals("*134*7867*0829876543*CASE2026#", codeWithRef)
    }

    @Test
    fun testSouthAfricanNumberNormalization() {
        assertEquals("0821234567", ZeroRatedCarrierMatrix.formatLocalSouthAfricanNumber("0821234567"))
        assertEquals("0821234567", ZeroRatedCarrierMatrix.formatLocalSouthAfricanNumber("+27821234567"))
        assertEquals("0821234567", ZeroRatedCarrierMatrix.formatLocalSouthAfricanNumber("27821234567"))
        assertEquals("0821234567", ZeroRatedCarrierMatrix.formatLocalSouthAfricanNumber("082-123-4567"))
        assertEquals("0821234567", ZeroRatedCarrierMatrix.formatLocalSouthAfricanNumber("+27 (82) 123 4567"))
    }

    @Test
    fun testZeroRatedCodeIdentification() {
        // Statutory GBV Command Centre
        assertTrue(ZeroRatedCarrierMatrix.isZeroRatedCode("*120*7867#"))
        // WASPA *134* reverse-billed codes
        assertTrue(ZeroRatedCarrierMatrix.isZeroRatedCode("*134*7867*0821234567#"))
        assertTrue(ZeroRatedCarrierMatrix.isZeroRatedCode("*130*123#"))
        // Carrier Please Call Me codes
        assertTrue(ZeroRatedCarrierMatrix.isZeroRatedCode("*140*0821234567#"))
        assertTrue(ZeroRatedCarrierMatrix.isZeroRatedCode("*121*0821234567#"))
        assertTrue(ZeroRatedCarrierMatrix.isZeroRatedCode("*111*1*0821234567#"))

        // Standard premium or unapproved shortcodes
        assertFalse(ZeroRatedCarrierMatrix.isZeroRatedCode("*120*999#"))
        assertFalse(ZeroRatedCarrierMatrix.isZeroRatedCode("*100#"))
        assertFalse(ZeroRatedCarrierMatrix.isZeroRatedCode("10111"))
    }

    @Test
    fun testEncodedDialUriPreservesTrailingHash() {
        val ussd = "*120*7867#"
        val uriString = ZeroRatedCarrierMatrix.getEncodedDialUriString(ussd)
        assertEquals("tel:*120*7867%23", uriString)
    }
}
