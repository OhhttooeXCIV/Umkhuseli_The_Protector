package com.example.data.repository

import com.example.data.model.Proverb

object ProverbsRepository {
    val proverbs: List<Proverb> = listOf(
        Proverb(
            id = "sankofa_origin",
            sourceCulture = "Akan (Sankofa Wisdom)",
            proverbOriginal = "Se wo were fi na wosankofa a yenkyi",
            englishMeaning = "It is not taboo to go back and fetch what is at risk of being left behind.",
            reflectivePrompt = "Reclaim your inner sovereignty. What truth about your safety and dignity must you remember today?",
            category = "Reclamation"
        ),
        Proverb(
            id = "ubuntu_humanity",
            sourceCulture = "Zulu & Xhosa Tradition",
            proverbOriginal = "Umuntu ngumuntu ngabantu",
            englishMeaning = "A person is a person through other persons.",
            reflectivePrompt = "You are not an isolated island. You deserve gentle hands, safe spaces, and fierce protectors.",
            category = "Community"
        ),
        Proverb(
            id = "seriti_dignity",
            sourceCulture = "Sesotho Wisdom",
            proverbOriginal = "Seriti sa motho ke botho ba hae",
            englishMeaning = "A person’s shadow and sacred aura is preserved by honouring inner dignity.",
            reflectivePrompt = "No person has the right to extinguish your light or diminish your sacred worth.",
            category = "Dignity"
        ),
        Proverb(
            id = "shona_storm",
            sourceCulture = "Shona Proverb",
            proverbOriginal = "Kusina mai hakuendwe",
            englishMeaning = "Where there is no protection, do not tarry.",
            reflectivePrompt = "Honor the quiet instinct that whispers when a boundary has been crossed. Your safety is your birthright.",
            category = "Intuition"
        ),
        Proverb(
            id = "tswana_strength",
            sourceCulture = "Setswana Wisdom",
            proverbOriginal = "Mabogo dinku a thebana",
            englishMeaning = "Hands wash one another; solidarity creates unbreakable armor.",
            reflectivePrompt = "Asking for help is not weakness; it is the first decisive victory against isolation.",
            category = "Courage"
        )
    )
}
