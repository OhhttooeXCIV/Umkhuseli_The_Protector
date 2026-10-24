package com.example.data.repository

import com.example.data.model.LifelineType
import com.example.data.model.SafetyResource

object SafetyResourcesRepository {
    val nationalLifelines: List<SafetyResource> = listOf(
        SafetyResource(
            id = "gbvcc_voice",
            title = "National GBV Command Centre",
            description = "24/7 Toll-Free government crisis support with social workers. Supports all 11 SA languages.",
            dialString = "0800428428",
            type = LifelineType.VOICE_CALL,
            isTollFree = true,
            is24Hours = true,
            zeroDataZeroAirtime = true,
            priorityRank = 1
        ),
        SafetyResource(
            id = "gbvcc_ussd",
            title = "GBV Command 'Please Call Me'",
            description = "USSD callback request. Works instantly with ZERO airtime on Vodacom, MTN, Telkom & Cell C.",
            dialString = "*120*7867#",
            type = LifelineType.USSD_FREE,
            isTollFree = true,
            is24Hours = true,
            zeroDataZeroAirtime = true,
            priorityRank = 2
        ),
        SafetyResource(
            id = "saps_police",
            title = "SAPS Police Emergency Services",
            description = "South African Police Service emergency dispatch for immediate life-threatening physical danger.",
            dialString = "10111",
            type = LifelineType.VOICE_CALL,
            isTollFree = true,
            is24Hours = true,
            zeroDataZeroAirtime = true,
            priorityRank = 3
        ),
        SafetyResource(
            id = "tears_ussd",
            title = "TEARS Foundation Crisis USSD",
            description = "Locates closest 24/7 Thuthuzela Care Centre or shelter based on your location tower.",
            dialString = "*134*7355#",
            type = LifelineType.USSD_FREE,
            isTollFree = true,
            is24Hours = true,
            zeroDataZeroAirtime = true,
            priorityRank = 4
        ),
        SafetyResource(
            id = "childline_sa",
            title = "Childline South Africa",
            description = "Assistance for child abuse, statutory rape, teen victims, and affected minors.",
            dialString = "0800055555",
            type = LifelineType.VOICE_CALL,
            isTollFree = true,
            is24Hours = true,
            zeroDataZeroAirtime = true,
            priorityRank = 5
        ),
        SafetyResource(
            id = "lifeline_sa",
            title = "Lifeline South Africa (Trauma)",
            description = "National trauma, suicide prevention, and emotional counseling line.",
            dialString = "0861322322",
            type = LifelineType.VOICE_CALL,
            isTollFree = false,
            is24Hours = true,
            zeroDataZeroAirtime = false,
            priorityRank = 6
        ),
        SafetyResource(
            id = "legal_aid_sa",
            title = "Legal Aid South Africa",
            description = "Free state legal assistance for Protection Orders, bail opposition, and court representation.",
            dialString = "0800110110",
            type = LifelineType.VOICE_CALL,
            isTollFree = true,
            is24Hours = false,
            zeroDataZeroAirtime = true,
            priorityRank = 7
        )
    )
}
