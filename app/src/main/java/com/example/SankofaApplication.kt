package com.example

import android.app.Application
import com.example.di.AppContainer
import com.example.service.StealthBeaconWorker

/**
 * Application entry point. Initialises the [AppContainer] dependency graph once for
 * the lifetime of the process. All ViewModels and services should obtain their
 * dependencies through this container via [ViewModelFactory].
 */
class SankofaApplication : Application() {

    /** Application-scoped DI container — lazy, thread-safe */
    val container: AppContainer by lazy {
        AppContainer(applicationContext)
    }

    override fun onCreate() {
        super.onCreate()
        try {
            StealthBeaconWorker.schedulePeriodicGhostBeacon(applicationContext)
        } catch (_: Exception) {
            // Ignore in testing or uninitialized WorkManager environments
        }
    }
}
