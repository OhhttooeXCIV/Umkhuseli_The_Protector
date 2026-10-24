package com.example.di

import android.content.Context
import com.example.data.local.AppDatabase
import com.example.data.repository.AppLauncherRepository
import com.example.service.BiometricAuthManager
import com.example.service.EmergencyDispatchHelper
import com.example.service.EmergencyService
import com.example.service.NetworkPolicyHelper
import com.example.service.VaultEncryptionHelper

/**
 * Manual dependency injection container. Provides application-scoped singleton instances
 * of all services and repositories. Avoids the overhead of a full DI framework while
 * enforcing single-instance semantics across the whole app lifecycle.
 *
 * Usage: Access via [SankofaApplication.container] from any ViewModel or Activity.
 */
class AppContainer(applicationContext: Context) {

    /** Room database — singleton, thread-safe */
    val database: AppDatabase by lazy {
        AppDatabase.getInstance(applicationContext)
    }

    /** Handles SMS dispatch, calling, location, vibration, and siren */
    val emergencyService: EmergencyService by lazy {
        EmergencyService(applicationContext)
    }

    /** Builds device telemetry, 72-hour distress messages, and intent dispatchers */
    val emergencyDispatchHelper: EmergencyDispatchHelper by lazy {
        EmergencyDispatchHelper(applicationContext)
    }

    /** Biometric authentication (fingerprint / face / device PIN) */
    val biometricAuthManager: BiometricAuthManager by lazy {
        BiometricAuthManager(applicationContext)
    }

    /** AES-256/GCM encryption backed by AndroidKeyStore */
    val vaultEncryptionHelper: VaultEncryptionHelper by lazy {
        VaultEncryptionHelper()
    }

    /** Network policy decisions (metered connection, online check) */
    val networkPolicyHelper: NetworkPolicyHelper by lazy {
        NetworkPolicyHelper(applicationContext)
    }

    /** Queries the device's package manager for launchable apps */
    val appLauncherRepository: AppLauncherRepository by lazy {
        AppLauncherRepository(applicationContext)
    }
}
