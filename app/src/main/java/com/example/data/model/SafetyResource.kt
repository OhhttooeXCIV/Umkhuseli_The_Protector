package com.example.data.model

enum class LifelineType {
    VOICE_CALL,
    USSD_FREE,
    SMS_ALERT,
    WHATSAPP
}

data class SafetyResource(
    val id: String,
    val title: String,
    val description: String,
    val dialString: String,
    val type: LifelineType,
    val isTollFree: Boolean,
    val is24Hours: Boolean,
    val zeroDataZeroAirtime: Boolean,
    val priorityRank: Int = 1
)

data class Proverb(
    val id: String,
    val sourceCulture: String, // "Akan (Sankofa)", "Zulu (Ubuntu)", "Xhosa", "Sotho", "Tswana"
    val proverbOriginal: String,
    val englishMeaning: String,
    val reflectivePrompt: String,
    val category: String // "Resilience", "Healing", "Wisdom", "Courage", "Community"
)
