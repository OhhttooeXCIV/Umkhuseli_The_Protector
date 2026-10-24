package com.example.service

import android.content.Context
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.os.Build

class NetworkPolicyHelper(private val context: Context) {

    private val connectivityManager =
        context.getSystemService(Context.CONNECTIVITY_SERVICE) as? ConnectivityManager

    /**
     * Network Gating: In South Africa, where mobile data costs are high and users
     * frequently operate with limited or metered bundles, this policy disables
     * autoplay, heavy background network tasks, and non-essential streaming.
     */
    fun shouldDisableAutoplay(): Boolean {
        val cm = connectivityManager ?: return true
        val activeNetwork = cm.activeNetwork ?: return true
        val capabilities = cm.getNetworkCapabilities(activeNetwork) ?: return true

        val isMetered = cm.isActiveNetworkMetered
        val isCellular = capabilities.hasTransport(NetworkCapabilities.TRANSPORT_CELLULAR)

        return isMetered || isCellular
    }

    fun isOnline(): Boolean {
        val cm = connectivityManager ?: return false
        val activeNetwork = cm.activeNetwork ?: return false
        val capabilities = cm.getNetworkCapabilities(activeNetwork) ?: return false
        return capabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
    }
}
