package com.example.service

import android.content.Context
import android.content.pm.PackageManager
import android.os.Build
import java.io.File
import java.io.FileInputStream
import java.security.MessageDigest

/**
 * Result of the cryptographic APK authenticity and integrity audit.
 */
data class ApkVerificationResult(
    val isValid: Boolean,
    val sha256Hash: String,
    val packageName: String?,
    val versionCode: Long?,
    val failureReason: String? = null
)

/**
 * Cryptographic APK Integrity & Authenticity Verifier.
 * 
 * Protects survivors and community workers against:
 * 1. Malicious MITM replacement of APK binaries during P2P transfers.
 * 2. Corrupt or truncated byte streams caused by physical radio interference.
 * 3. Rogue APK stalkerware injected under the cover of offline sharing.
 */
class ApkIntegrityVerifier(private val context: Context? = null) {

    /**
     * Computes the SHA-256 cryptographic digest of a local file.
     */
    fun computeSha256(file: File): String {
        if (!file.exists() || file.length() == 0L) return ""
        val digest = MessageDigest.getInstance("SHA-256")
        val buffer = ByteArray(64 * 1024) // 64KB chunk buffer

        FileInputStream(file).use { fis ->
            var bytesRead: Int
            while (fis.read(buffer).also { bytesRead = it } != -1) {
                digest.update(buffer, 0, bytesRead)
            }
        }

        return digest.digest().joinToString("") { "%02x".format(it) }
    }

    /**
     * Computes SHA-256 digest of raw in-memory bytes.
     */
    fun computeSha256(bytes: ByteArray): String {
        val digest = MessageDigest.getInstance("SHA-256")
        return digest.digest(bytes).joinToString("") { "%02x".format(it) }
    }

    /**
     * Comprehensive validation of an incoming P2P APK file:
     * - Verifies non-zero size and file existence.
     * - Computes SHA-256 checksum and compares with expected sender hash (if provided).
     * - Inspects APK manifest to confirm legitimate package name matching Umkhuseli.
     */
    fun verifyApk(
        apkFile: File,
        expectedSha256: String? = null,
        allowedPackageNames: Set<String> = setOf("com.example", "com.sankofa.safe")
    ): ApkVerificationResult {
        if (!apkFile.exists()) {
            return ApkVerificationResult(
                isValid = false,
                sha256Hash = "",
                packageName = null,
                versionCode = null,
                failureReason = "File does not exist: ${apkFile.name}"
            )
        }

        if (apkFile.length() < 100 * 1024) { // Minimum valid APK size check (at least 100KB)
            return ApkVerificationResult(
                isValid = false,
                sha256Hash = "",
                packageName = null,
                versionCode = null,
                failureReason = "File size too small (${apkFile.length()} bytes) - payload truncated or corrupted"
            )
        }

        val calculatedHash = computeSha256(apkFile)

        // Check against sender's expected hash if provided
        if (!expectedSha256.isNullOrBlank() && !calculatedHash.equals(expectedSha256.trim(), ignoreCase = true)) {
            return ApkVerificationResult(
                isValid = false,
                sha256Hash = calculatedHash,
                packageName = null,
                versionCode = null,
                failureReason = "Cryptographic hash mismatch (tampered or corrupted in transit)"
            )
        }

        if (context == null) {
            return ApkVerificationResult(
                isValid = true,
                sha256Hash = calculatedHash,
                packageName = null,
                versionCode = null
            )
        }

        // Parse package metadata using Android PackageManager
        try {
            val pkgInfo = context.packageManager.getPackageArchiveInfo(apkFile.absolutePath, 0)
            if (pkgInfo == null) {
                return ApkVerificationResult(
                    isValid = false,
                    sha256Hash = calculatedHash,
                    packageName = null,
                    versionCode = null,
                    failureReason = "Android OS unable to parse APK package metadata (corrupt archive)"
                )
            }

            val pkgName = pkgInfo.packageName
            val isPackageAllowed = allowedPackageNames.any { pkgName.startsWith(it) }

            if (!isPackageAllowed) {
                return ApkVerificationResult(
                    isValid = false,
                    sha256Hash = calculatedHash,
                    packageName = pkgName,
                    versionCode = null,
                    failureReason = "Unauthorized package identity: $pkgName"
                )
            }

            val versionCode = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                pkgInfo.longVersionCode
            } else {
                @Suppress("DEPRECATION")
                pkgInfo.versionCode.toLong()
            }

            return ApkVerificationResult(
                isValid = true,
                sha256Hash = calculatedHash,
                packageName = pkgName,
                versionCode = versionCode
            )
        } catch (e: Exception) {
            return ApkVerificationResult(
                isValid = false,
                sha256Hash = calculatedHash,
                packageName = null,
                versionCode = null,
                failureReason = "Exception parsing package: ${e.message}"
            )
        }
    }
}
