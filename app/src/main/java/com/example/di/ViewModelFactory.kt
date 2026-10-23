package com.example.di

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import com.example.ui.viewmodel.SafetyTriggerViewModel
import com.example.ui.viewmodel.SankofaViewModel

/**
 * A [ViewModelProvider.Factory] that wires ViewModels with their injectable dependencies
 * sourced from [AppContainer], avoiding direct instantiation of services inside ViewModels.
 *
 * This factory is registered at the Activity level so that both VMs share the same
 * [AppContainer] instance and therefore the same singletons.
 */
class ViewModelFactory(private val container: AppContainer) : ViewModelProvider.Factory {

    @Suppress("UNCHECKED_CAST")
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        return when {
            modelClass.isAssignableFrom(SankofaViewModel::class.java) -> {
                SankofaViewModel(
                    database = container.database,
                    emergencyService = container.emergencyService,
                    biometricAuthManager = container.biometricAuthManager,
                    vaultEncryptionHelper = container.vaultEncryptionHelper,
                    emergencyDispatchHelper = container.emergencyDispatchHelper,
                    networkPolicyHelper = container.networkPolicyHelper,
                    appLauncherRepository = container.appLauncherRepository
                ) as T
            }
            modelClass.isAssignableFrom(SafetyTriggerViewModel::class.java) -> {
                SafetyTriggerViewModel(
                    database = container.database,
                    emergencyService = container.emergencyService,
                    emergencyDispatchHelper = container.emergencyDispatchHelper
                ) as T
            }
            else -> throw IllegalArgumentException("Unknown ViewModel class: ${modelClass.name}")
        }
    }
}
