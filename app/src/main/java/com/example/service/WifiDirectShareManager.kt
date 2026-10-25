package com.example.service

import android.content.Context
import android.content.Intent
import androidx.core.content.FileProvider
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.io.BufferedReader
import java.io.File
import java.io.FileInputStream
import java.io.FileOutputStream
import java.io.InputStreamReader
import java.io.PrintWriter
import java.net.ServerSocket
import java.net.Socket

/**
 * Covert Offline Peer-to-Peer APK Distribution Engine.
 * 
 * Enables Community Health Workers (CHWs) and trusted field staff to transfer
 * the authentic, cryptographically verified Umkhuseli APK to survivors in
 * rural or low-connectivity areas with 0 airtime, 0 mobile data, and no Google Play access.
 */
class WifiDirectShareManager(private val context: Context) {

    private val verifier = ApkIntegrityVerifier(context)

    /**
     * Resolves the running base APK currently installed on the host device.
     */
    fun getSourceApkFile(): File? {
        val sourcePath = context.applicationInfo.sourceDir
        if (sourcePath.isNullOrBlank()) return null
        val file = File(sourcePath)
        return if (file.exists() && file.canRead()) file else null
    }

    /**
     * Starts a local TCP server on the sender's device (e.g. over Wi-Fi Direct or Local Hotspot)
     * to stream the authentic APK binary directly to a connected peer.
     */
    fun startSenderServer(
        port: Int = DEFAULT_PORT,
        scope: CoroutineScope = CoroutineScope(Dispatchers.IO),
        onProgress: (sent: Long, total: Long) -> Unit = { _, _ -> },
        onComplete: () -> Unit = {},
        onError: (String) -> Unit = {}
    ): Job {
        return scope.launch {
            val apkFile = getSourceApkFile()
            if (apkFile == null || !apkFile.exists()) {
                withContext(Dispatchers.Main) {
                    onError("Source application APK not readable on this device")
                }
                return@launch
            }

            val sha256 = verifier.computeSha256(apkFile)
            val totalBytes = apkFile.length()

            try {
                ServerSocket(port).use { serverSocket ->
                    serverSocket.soTimeout = SOCKET_TIMEOUT_MS
                    val clientSocket = serverSocket.accept()
                    clientSocket.use { socket ->
                        val outputStream = socket.getOutputStream()
                        val writer = PrintWriter(outputStream, true)

                        // 1. Transmit protocol handshake header
                        writer.println(HEADER_MAGIC)
                        writer.println(totalBytes)
                        writer.println(sha256)

                        // 2. Stream raw binary payload
                        val buffer = ByteArray(BUFFER_SIZE)
                        FileInputStream(apkFile).use { fis ->
                            var bytesSent = 0L
                            var read: Int
                            while (fis.read(buffer).also { read = it } != -1) {
                                outputStream.write(buffer, 0, read)
                                bytesSent += read
                                withContext(Dispatchers.Main) {
                                    onProgress(bytesSent, totalBytes)
                                }
                            }
                            outputStream.flush()
                        }
                    }
                }
                withContext(Dispatchers.Main) {
                    onComplete()
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    onError("Transfer failed: ${e.message ?: "Socket connection error"}")
                }
            }
        }
    }

    /**
     * Connects to the sender's IP address, downloads the incoming APK into a protected cache,
     * and performs mandatory cryptographic integrity verification before returning the file.
     */
    fun startReceiverClient(
        hostAddress: String,
        port: Int = DEFAULT_PORT,
        scope: CoroutineScope = CoroutineScope(Dispatchers.IO),
        onProgress: (received: Long, total: Long) -> Unit = { _, _ -> },
        onComplete: (File) -> Unit = {},
        onError: (String) -> Unit = {}
    ): Job {
        return scope.launch {
            val destinationDir = File(context.cacheDir, CACHE_SUBDIR).apply { mkdirs() }
            val tempApkFile = File(destinationDir, "Umkhuseli_Shared_${System.currentTimeMillis()}.apk")

            try {
                Socket(hostAddress, port).use { socket ->
                    socket.soTimeout = SOCKET_TIMEOUT_MS
                    val inputStream = socket.getInputStream()
                    val reader = BufferedReader(InputStreamReader(inputStream))

                    // 1. Validate protocol handshake header
                    val magic = reader.readLine()
                    if (magic != HEADER_MAGIC) {
                        withContext(Dispatchers.Main) {
                            onError("Incompatible P2P protocol handshake from sender")
                        }
                        return@launch
                    }

                    val totalBytes = reader.readLine()?.toLongOrNull() ?: 0L
                    val expectedSha256 = reader.readLine() ?: ""

                    // 2. Stream incoming binary into temp cache file
                    FileOutputStream(tempApkFile).use { fos ->
                        val buffer = ByteArray(BUFFER_SIZE)
                        var receivedBytes = 0L
                        var read: Int
                        while (inputStream.read(buffer).also { read = it } != -1) {
                            fos.write(buffer, 0, read)
                            receivedBytes += read
                            withContext(Dispatchers.Main) {
                                onProgress(receivedBytes, totalBytes)
                            }
                            if (totalBytes > 0 && receivedBytes >= totalBytes) break
                        }
                        fos.flush()
                    }

                    // 3. Mandatory Cryptographic Integrity Audit
                    val audit = verifier.verifyApk(tempApkFile, expectedSha256)
                    if (!audit.isValid) {
                        tempApkFile.delete() // Instant wipe of tampered/corrupt file
                        withContext(Dispatchers.Main) {
                            onError("APK Security Verification Failed: ${audit.failureReason}")
                        }
                        return@launch
                    }

                    withContext(Dispatchers.Main) {
                        onComplete(tempApkFile)
                    }
                }
            } catch (e: Exception) {
                if (tempApkFile.exists()) tempApkFile.delete()
                withContext(Dispatchers.Main) {
                    onError("Download interrupted: ${e.message ?: "Connection lost"}")
                }
            }
        }
    }

    /**
     * Creates a secure system PackageInstaller launch intent via FileProvider.
     */
    fun getInstallIntent(apkFile: File): Intent {
        val authority = "${context.packageName}.provider"
        val contentUri = FileProvider.getUriForFile(context, authority, apkFile)

        return Intent(Intent.ACTION_VIEW).apply {
            setDataAndType(contentUri, "application/vnd.android.package-archive")
            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
    }

    /**
     * Scrubs all temporary P2P shared APK files from disk to prevent forensic traces.
     */
    fun cleanCovertShareCache(): Boolean {
        return try {
            val dir = File(context.cacheDir, CACHE_SUBDIR)
            if (dir.exists()) {
                dir.listFiles()?.forEach { it.delete() }
            }
            true
        } catch (_: Exception) {
            false
        }
    }

    companion object {
        const val DEFAULT_PORT = 8988
        const val HEADER_MAGIC = "UMKHUSELI_P2P_V1"
        const val BUFFER_SIZE = 64 * 1024
        const val SOCKET_TIMEOUT_MS = 30_000
        const val CACHE_SUBDIR = "covert_share"
    }
}
