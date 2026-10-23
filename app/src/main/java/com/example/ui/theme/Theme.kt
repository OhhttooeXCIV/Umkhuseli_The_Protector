package com.example.ui.theme

import android.app.Activity
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

private val DarkColorScheme = darkColorScheme(
    primary = SankofaGold,
    onPrimary = Color(0xFF1A1202),
    primaryContainer = Color(0xFF332506),
    onPrimaryContainer = SankofaGoldLight,
    secondary = SafetyAmber,
    onSecondary = Color.Black,
    tertiary = SafetyGreen,
    onTertiary = Color.White,
    background = SankofaDarkBg,
    onBackground = TextPrimary,
    surface = SankofaSurface,
    onSurface = TextPrimary,
    surfaceVariant = SankofaCardBg,
    onSurfaceVariant = TextSecondary,
    error = SafetyRed,
    onError = Color.White
)

private val LightColorScheme = lightColorScheme(
    primary = SankofaGoldDark,
    onPrimary = Color.White,
    primaryContainer = Color(0xFFFBEBC7),
    onPrimaryContainer = Color(0xFF261902),
    secondary = SafetyAmber,
    onSecondary = Color.White,
    tertiary = SafetyGreen,
    onTertiary = Color.White,
    background = Color(0xFFFBF9F5),
    onBackground = Color(0xFF1A1A1E),
    surface = Color(0xFFFFFFFF),
    onSurface = Color(0xFF1A1A1E),
    surfaceVariant = Color(0xFFF0EDE4),
    onSurfaceVariant = Color(0xFF4A4742),
    error = SafetyRed,
    onError = Color.White
)

@Composable
fun SankofaSafeTheme(
    darkTheme: Boolean = true, // Default to sleek obsidian dark theme for privacy and elegance
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme
    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as? Activity)?.window
            if (window != null) {
                window.statusBarColor = colorScheme.background.toArgb()
                window.navigationBarColor = colorScheme.background.toArgb()
                WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = !darkTheme
                WindowCompat.getInsetsController(window, view).isAppearanceLightNavigationBars = !darkTheme
            }
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
