package com.example.data.model

enum class Province(val displayName: String, val shortCode: String) {
    ALL("All Provinces", "ALL"),
    GAUTENG("Gauteng", "GP"),
    WESTERN_CAPE("Western Cape", "WC"),
    KWAZULU_NATAL("KwaZulu-Natal", "KZN"),
    EASTERN_CAPE("Eastern Cape", "EC"),
    FREE_STATE("Free State", "FS"),
    LIMPOPO("Limpopo", "LP"),
    MPUMALANGA("Mpumalanga", "MP"),
    NORTH_WEST("North West", "NW"),
    NORTHERN_CAPE("Northern Cape", "NC")
}

data class ThuthuzelaCenter(
    val id: String,
    val name: String,
    val hospitalOrLocation: String,
    val cityOrTown: String,
    val province: Province,
    val contactNumber: String,
    val altContactNumber: String = "",
    val address: String,
    val operates24Hours: Boolean = true,
    val services: List<String> = listOf("Forensic Medical Exam", "HIV PEP Prophylaxis", "Trauma Counseling", "SAPS IO Assistance", "Court Preparation"),
    val latitude: Double = 0.0,
    val longitude: Double = 0.0
)

data class PoliceStation(
    val id: String,
    val name: String,
    val precinctOrArea: String,
    val province: Province,
    val contactNumber: String,
    val address: String,
    val latitude: Double,
    val longitude: Double
)
