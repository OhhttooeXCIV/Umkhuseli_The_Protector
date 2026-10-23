package com.example.data.repository

import com.example.data.model.Province
import com.example.data.model.ThuthuzelaCenter

object ThuthuzelaRepository {
    val centers: List<ThuthuzelaCenter> = listOf(
        // GAUTENG
        ThuthuzelaCenter(
            id = "gp_bara",
            name = "Chris Hani Baragwanath TCC",
            hospitalOrLocation = "Chris Hani Baragwanath Academic Hospital",
            cityOrTown = "Soweto, Johannesburg",
            province = Province.GAUTENG,
            contactNumber = "0119339111",
            altContactNumber = "0119338000",
            address = "26 Chris Hani Rd, Diepkloof Zone 6, Soweto"
        ),
        ThuthuzelaCenter(
            id = "gp_helen_joseph",
            name = "Helen Joseph TCC",
            hospitalOrLocation = "Helen Joseph Hospital",
            cityOrTown = "Auckland Park, Johannesburg",
            province = Province.GAUTENG,
            contactNumber = "0114891011",
            altContactNumber = "0114890600",
            address = "1 Perth Rd, Westdene, Johannesburg"
        ),
        ThuthuzelaCenter(
            id = "gp_kalafong",
            name = "Kalafong Hospital TCC",
            hospitalOrLocation = "Kalafong Tertiary Hospital",
            cityOrTown = "Atteridgeville, Pretoria",
            province = Province.GAUTENG,
            contactNumber = "0123186400",
            altContactNumber = "0123738011",
            address = "Klipspringer St, Atteridgeville, Pretoria"
        ),
        ThuthuzelaCenter(
            id = "gp_thembisa",
            name = "Thembisa Hospital TCC",
            hospitalOrLocation = "Thembisa Provincial Tertiary Hospital",
            cityOrTown = "Tembisa, Ekurhuleni",
            province = Province.GAUTENG,
            contactNumber = "0119232000",
            altContactNumber = "0119232230",
            address = "Flint Mazibuko St, Hospital View, Tembisa"
        ),
        ThuthuzelaCenter(
            id = "gp_far_east",
            name = "Far East Rand TCC",
            hospitalOrLocation = "Far East Rand Hospital",
            cityOrTown = "Springs, Ekurhuleni",
            province = Province.GAUTENG,
            contactNumber = "0118128300",
            address = "Hospital Rd, New State Areas, Springs"
        ),

        // WESTERN CAPE
        ThuthuzelaCenter(
            id = "wc_karl_bremer",
            name = "Karl Bremer TCC",
            hospitalOrLocation = "Karl Bremer Hospital",
            cityOrTown = "Bellville, Cape Town",
            province = Province.WESTERN_CAPE,
            contactNumber = "0219181321",
            altContactNumber = "0219181911",
            address = "Cnr Mike Pienaar Blvd & Frans Conradie Ave, Bellville"
        ),
        ThuthuzelaCenter(
            id = "wc_heideveld",
            name = "Heideveld TCC",
            hospitalOrLocation = "Heideveld Emergency Centre",
            cityOrTown = "Athlone / Cape Flats, Cape Town",
            province = Province.WESTERN_CAPE,
            contactNumber = "0216993200",
            address = "Heideveld Rd, Heideveld, Cape Town"
        ),
        ThuthuzelaCenter(
            id = "wc_victoria",
            name = "Victoria Hospital TCC",
            hospitalOrLocation = "Victoria Hospital",
            cityOrTown = "Wynberg, Cape Town",
            province = Province.WESTERN_CAPE,
            contactNumber = "0217991111",
            address = "Alphen Hill Rd, Wynberg, Cape Town"
        ),
        ThuthuzelaCenter(
            id = "wc_khayelitsha",
            name = "Khayelitsha TCC",
            hospitalOrLocation = "Khayelitsha District Hospital",
            cityOrTown = "Khayelitsha, Cape Town",
            province = Province.WESTERN_CAPE,
            contactNumber = "0213604200",
            address = "Cnr Steve Biko & Walter Sisulu Rds, Khayelitsha"
        ),
        ThuthuzelaCenter(
            id = "wc_worcester",
            name = "Worcester Hospital TCC",
            hospitalOrLocation = "Worcester Regional Hospital",
            cityOrTown = "Worcester, Boland",
            province = Province.WESTERN_CAPE,
            contactNumber = "0233481100",
            address = "Murray St, Hospital Hill, Worcester"
        ),

        // KWAZULU-NATAL
        ThuthuzelaCenter(
            id = "kzn_addington",
            name = "Addington Hospital TCC",
            hospitalOrLocation = "Addington Hospital",
            cityOrTown = "South Beach, Durban",
            province = Province.KWAZULU_NATAL,
            contactNumber = "0313272000",
            altContactNumber = "0313272819",
            address = "16 Erskine Terrace, South Beach, Durban"
        ),
        ThuthuzelaCenter(
            id = "kzn_rk_khan",
            name = "RK Khan Hospital TCC",
            hospitalOrLocation = "RK Khan Regional Hospital",
            cityOrTown = "Chatsworth, Durban",
            province = Province.KWAZULU_NATAL,
            contactNumber = "0314596000",
            address = "336 RK Khan Circle, Westcliff, Chatsworth"
        ),
        ThuthuzelaCenter(
            id = "kzn_edendale",
            name = "Edendale Hospital TCC",
            hospitalOrLocation = "Harry Gwala Regional Hospital (Edendale)",
            cityOrTown = "Pietermaritzburg",
            province = Province.KWAZULU_NATAL,
            contactNumber = "0333954911",
            address = "Lot 89, Selby Msimang Rd, Plessislaer, Pietermaritzburg"
        ),
        ThuthuzelaCenter(
            id = "kzn_ngwelezana",
            name = "Ngwelezana Hospital TCC",
            hospitalOrLocation = "Ngwelezana Tertiary Hospital",
            cityOrTown = "Empangeni, Zululand",
            province = Province.KWAZULU_NATAL,
            contactNumber = "0359017000",
            address = "Thanduyise Rd, Ngwelezane, Empangeni"
        ),
        ThuthuzelaCenter(
            id = "kzn_port_shepstone",
            name = "Port Shepstone TCC",
            hospitalOrLocation = "Port Shepstone Regional Hospital",
            cityOrTown = "Port Shepstone, South Coast",
            province = Province.KWAZULU_NATAL,
            contactNumber = "0396886000",
            address = "Court House Rd, Port Shepstone"
        ),

        // EASTERN CAPE
        ThuthuzelaCenter(
            id = "ec_dora_nginza",
            name = "Dora Nginza TCC",
            hospitalOrLocation = "Dora Nginza Hospital",
            cityOrTown = "Gqeberha (Port Elizabeth)",
            province = Province.EASTERN_CAPE,
            contactNumber = "0414064111",
            altContactNumber = "0414064434",
            address = "Spondo St, Zwide, Gqeberha"
        ),
        ThuthuzelaCenter(
            id = "ec_frere",
            name = "Frere Hospital TCC",
            hospitalOrLocation = "Frere Tertiary Hospital",
            cityOrTown = "East London",
            province = Province.EASTERN_CAPE,
            contactNumber = "0437091111",
            address = "Amalinda Dr, Braelyn, East London"
        ),
        ThuthuzelaCenter(
            id = "ec_makiwane",
            name = "Cecilia Makiwane TCC",
            hospitalOrLocation = "Cecilia Makiwane Hospital",
            cityOrTown = "Mdantsane, Buffalo City",
            province = Province.EASTERN_CAPE,
            contactNumber = "0437082111",
            address = "Billie Rd, Mdantsane Unit 4, East London"
        ),
        ThuthuzelaCenter(
            id = "ec_mthatha",
            name = "Mthatha General TCC",
            hospitalOrLocation = "Mthatha General Hospital",
            cityOrTown = "Mthatha, OR Tambo",
            province = Province.EASTERN_CAPE,
            contactNumber = "0475024000",
            address = "Nelson Mandela Dr, Fort Gale, Mthatha"
        ),

        // FREE STATE
        ThuthuzelaCenter(
            id = "fs_pelonomi",
            name = "Pelonomi Tertiary Hospital TCC",
            hospitalOrLocation = "Pelonomi Tertiary Hospital",
            cityOrTown = "Bloemfontein, Mangaung",
            province = Province.FREE_STATE,
            contactNumber = "0514051911",
            address = "Dr Belcher Rd, Heidedal, Bloemfontein"
        ),
        ThuthuzelaCenter(
            id = "fs_bongani",
            name = "Bongani Hospital TCC",
            hospitalOrLocation = "Bongani Regional Hospital",
            cityOrTown = "Welkom, Lejweleputswa",
            province = Province.FREE_STATE,
            contactNumber = "0579168000",
            address = "Mothusi Rd, Thabong, Welkom"
        ),

        // LIMPOPO
        ThuthuzelaCenter(
            id = "lp_mankweng",
            name = "Mankweng Hospital TCC",
            hospitalOrLocation = "Mankweng Hospital",
            cityOrTown = "Sovenga / Polokwane",
            province = Province.LIMPOPO,
            contactNumber = "0152861000",
            address = "Hospital Rd, Sovenga, Polokwane"
        ),
        ThuthuzelaCenter(
            id = "lp_tshilidzini",
            name = "Tshilidzini Hospital TCC",
            hospitalOrLocation = "Tshilidzini Regional Hospital",
            cityOrTown = "Thohoyandou, Vhembe",
            province = Province.LIMPOPO,
            contactNumber = "0159641061",
            address = "R524 Punda Maria Rd, Shayandima, Thohoyandou"
        ),

        // MPUMALANGA
        ThuthuzelaCenter(
            id = "mp_rob_ferreira",
            name = "Rob Ferreira Hospital TCC",
            hospitalOrLocation = "Rob Ferreira Hospital",
            cityOrTown = "Mbombela (Nelspruit)",
            province = Province.MPUMALANGA,
            contactNumber = "0137416100",
            address = "Piet Retief St, Mbombela"
        ),
        ThuthuzelaCenter(
            id = "mp_witbank",
            name = "Witbank General Hospital TCC",
            hospitalOrLocation = "Witbank Hospital",
            cityOrTown = "eMalahleni (Witbank)",
            province = Province.MPUMALANGA,
            contactNumber = "0136532000",
            address = "Beatty Ave, eMalahleni"
        ),

        // NORTH WEST
        ThuthuzelaCenter(
            id = "nw_klerksdorp",
            name = "Klerksdorp Hospital TCC",
            hospitalOrLocation = "Klerksdorp / Tshepong Hospital Complex",
            cityOrTown = "Klerksdorp, Dr Kenneth Kaunda",
            province = Province.NORTH_WEST,
            contactNumber = "0184064600",
            address = "Cnr Church & Emily Hobhouse Sts, Klerksdorp"
        ),
        ThuthuzelaCenter(
            id = "nw_mafikeng",
            name = "Mafikeng Provincial TCC",
            hospitalOrLocation = "Mafikeng Provincial Hospital",
            cityOrTown = "Mahikeng",
            province = Province.NORTH_WEST,
            contactNumber = "0183832005",
            address = "Hector Peterson Ave, Mahikeng"
        ),

        // NORTHERN CAPE
        ThuthuzelaCenter(
            id = "nc_kimberley",
            name = "Robert Mangaliso Sobukwe TCC",
            hospitalOrLocation = "Robert Mangaliso Sobukwe Hospital (Kimberley Hospital)",
            cityOrTown = "Kimberley",
            province = Province.NORTHERN_CAPE,
            contactNumber = "0538029111",
            address = "Du Toitspan Rd, Kimberley"
        ),
        ThuthuzelaCenter(
            id = "nc_upington",
            name = "Dr Harry Surtie Hospital TCC",
            hospitalOrLocation = "Dr Harry Surtie Regional Hospital",
            cityOrTown = "Upington",
            province = Province.NORTHERN_CAPE,
            contactNumber = "0543329000",
            address = "Corner 4th Ave & Grobler St, Upington"
        )
    )
}
