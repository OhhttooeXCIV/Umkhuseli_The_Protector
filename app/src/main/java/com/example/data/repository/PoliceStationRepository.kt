package com.example.data.repository

import com.example.data.model.PoliceStation
import com.example.data.model.Province

object PoliceStationRepository {
    val stations: List<PoliceStation> = listOf(
        // GAUTENG
        PoliceStation(
            id = "saps_jhb_central",
            name = "Johannesburg Central SAPS",
            precinctOrArea = "Johannesburg CBD",
            province = Province.GAUTENG,
            contactNumber = "0114977000",
            address = "1 Commissioner St, Johannesburg",
            latitude = -26.2045,
            longitude = 28.0381
        ),
        PoliceStation(
            id = "saps_hillbrow",
            name = "Hillbrow SAPS",
            precinctOrArea = "Hillbrow / Berea",
            province = Province.GAUTENG,
            contactNumber = "0114886511",
            address = "Clarendon Pl, Hillbrow, Johannesburg",
            latitude = -26.1884,
            longitude = 28.0494
        ),
        PoliceStation(
            id = "saps_sandton",
            name = "Sandton SAPS",
            precinctOrArea = "Sandton / Rivonia",
            province = Province.GAUTENG,
            contactNumber = "0117224200",
            address = "Summit Rd & Rivonia Rd, Morningside, Sandton",
            latitude = -26.0827,
            longitude = 28.0583
        ),
        PoliceStation(
            id = "saps_soweto_diepkloof",
            name = "Diepkloof SAPS",
            precinctOrArea = "Diepkloof / Baragwanath",
            province = Province.GAUTENG,
            contactNumber = "0119337400",
            address = "Ebony St, Diepkloof Zone 3, Soweto",
            latitude = -26.2519,
            longitude = 27.9463
        ),
        PoliceStation(
            id = "saps_pretoria_central",
            name = "Pretoria Central SAPS",
            precinctOrArea = "Pretoria Central",
            province = Province.GAUTENG,
            contactNumber = "0123534000",
            address = "Bosman St & Pretorius St, Pretoria",
            latitude = -25.7483,
            longitude = 28.1871
        ),

        // WESTERN CAPE
        PoliceStation(
            id = "saps_cape_town_central",
            name = "Cape Town Central SAPS",
            precinctOrArea = "Cape Town City Bowl",
            province = Province.WESTERN_CAPE,
            contactNumber = "0214678000",
            address = "28 Buitenkant St, Cape Town",
            latitude = -33.9272,
            longitude = 18.4236
        ),
        PoliceStation(
            id = "saps_sea_point",
            name = "Sea Point SAPS",
            precinctOrArea = "Atlantic Seaboard",
            province = Province.WESTERN_CAPE,
            contactNumber = "0214303700",
            address = "Bay Rd, Sea Point, Cape Town",
            latitude = -33.9142,
            longitude = 18.3905
        ),
        PoliceStation(
            id = "saps_khayelitsha",
            name = "Khayelitsha SAPS",
            precinctOrArea = "Khayelitsha",
            province = Province.WESTERN_CAPE,
            contactNumber = "0218535500",
            address = "Walter Sisulu Rd, Khayelitsha",
            latitude = -34.0416,
            longitude = 18.6738
        ),

        // KWAZULU-NATAL
        PoliceStation(
            id = "saps_durban_central",
            name = "Durban Central SAPS",
            precinctOrArea = "Durban Central",
            province = Province.KWAZULU_NATAL,
            contactNumber = "0313254000",
            address = "370 Dr Pixley KaSeme St, Durban",
            latitude = -29.8587,
            longitude = 31.0218
        ),
        PoliceStation(
            id = "saps_point",
            name = "Point SAPS",
            precinctOrArea = "Durban South Beach / Point",
            province = Province.KWAZULU_NATAL,
            contactNumber = "0313674000",
            address = "Point Rd, Point, Durban",
            latitude = -29.8690,
            longitude = 31.0425
        ),

        // EASTERN CAPE
        PoliceStation(
            id = "saps_gqeberha_humewood",
            name = "Humewood SAPS",
            precinctOrArea = "Gqeberha Beachfront",
            province = Province.EASTERN_CAPE,
            contactNumber = "0415045000",
            address = "La Roche Dr, Humewood, Gqeberha",
            latitude = -33.9782,
            longitude = 25.6515
        ),

        // FREE STATE
        PoliceStation(
            id = "saps_bloem_parkweg",
            name = "Park Road SAPS",
            precinctOrArea = "Bloemfontein Central",
            province = Province.FREE_STATE,
            contactNumber = "0515076000",
            address = "Park Rd, Willows, Bloemfontein",
            latitude = -29.1221,
            longitude = 26.2167
        )
    )
}
