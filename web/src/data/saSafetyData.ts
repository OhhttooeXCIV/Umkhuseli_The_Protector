export interface SafetyResource {
  id: string;
  title: string;
  description: string;
  dialString: string;
  type: 'VOICE_CALL' | 'USSD_FREE' | 'WHATSAPP';
  isTollFree: boolean;
  is24Hours: boolean;
  zeroDataZeroAirtime: boolean;
  priorityRank: number;
}

export interface ThuthuzelaCenter {
  id: string;
  name: string;
  hospitalOrLocation: string;
  cityOrTown: string;
  province: string;
  contactNumber: string;
  altContactNumber?: string;
  address: string;
}

export const NATIONAL_LIFELINES: SafetyResource[] = [
  {
    id: "gbvcc_voice",
    title: "National GBV Command Centre",
    description: "24/7 Toll-Free crisis support with social workers. Supports all 11 SA languages.",
    dialString: "0800428428",
    type: "VOICE_CALL",
    isTollFree: true,
    is24Hours: true,
    zeroDataZeroAirtime: true,
    priorityRank: 1
  },
  {
    id: "gbvcc_ussd",
    title: "GBV Command 'Please Call Me'",
    description: "USSD callback request. Works with ZERO airtime on Vodacom, MTN, Telkom & Cell C.",
    dialString: "*120*7867#",
    type: "USSD_FREE",
    isTollFree: true,
    is24Hours: true,
    zeroDataZeroAirtime: true,
    priorityRank: 2
  },
  {
    id: "saps_police",
    title: "SAPS Emergency Services",
    description: "South African Police Service emergency dispatch for immediate life danger.",
    dialString: "10111",
    type: "VOICE_CALL",
    isTollFree: true,
    is24Hours: true,
    zeroDataZeroAirtime: true,
    priorityRank: 3
  },
  {
    id: "tears_ussd",
    title: "TEARS Foundation Crisis USSD",
    description: "Locates closest 24/7 Thuthuzela Care Centre or shelter based on your location tower.",
    dialString: "*134*7355#",
    type: "USSD_FREE",
    isTollFree: true,
    is24Hours: true,
    zeroDataZeroAirtime: true,
    priorityRank: 4
  },
  {
    id: "childline_sa",
    title: "Childline South Africa",
    description: "Assistance for child abuse, statutory rape, teen victims, and affected minors.",
    dialString: "0800055555",
    type: "VOICE_CALL",
    isTollFree: true,
    is24Hours: true,
    zeroDataZeroAirtime: true,
    priorityRank: 5
  }
];

export const THUTHUZELA_CENTERS: ThuthuzelaCenter[] = [
  // GAUTENG
  {
    id: "gp_bara",
    name: "Chris Hani Baragwanath TCC",
    hospitalOrLocation: "Chris Hani Baragwanath Academic Hospital",
    cityOrTown: "Soweto, Johannesburg",
    province: "Gauteng",
    contactNumber: "0119339111",
    altContactNumber: "0119338000",
    address: "26 Chris Hani Rd, Diepkloof Zone 6, Soweto"
  },
  {
    id: "gp_helen_joseph",
    name: "Helen Joseph TCC",
    hospitalOrLocation: "Helen Joseph Hospital",
    cityOrTown: "Auckland Park, Johannesburg",
    province: "Gauteng",
    contactNumber: "0114891011",
    altContactNumber: "0114890600",
    address: "1 Perth Rd, Westdene, Johannesburg"
  },
  {
    id: "gp_kalafong",
    name: "Kalafong Hospital TCC",
    hospitalOrLocation: "Kalafong Tertiary Hospital",
    cityOrTown: "Atteridgeville, Pretoria",
    province: "Gauteng",
    contactNumber: "0123186400",
    altContactNumber: "0123738011",
    address: "Klipspringer St, Atteridgeville, Pretoria"
  },
  {
    id: "gp_thembisa",
    name: "Thembisa Hospital TCC",
    hospitalOrLocation: "Thembisa Provincial Tertiary Hospital",
    cityOrTown: "Tembisa, Ekurhuleni",
    province: "Gauteng",
    contactNumber: "0119232000",
    address: "Flint Mazibuko St, Hospital View, Tembisa"
  },
  {
    id: "gp_far_east",
    name: "Far East Rand TCC",
    hospitalOrLocation: "Far East Rand Hospital",
    cityOrTown: "Springs, Ekurhuleni",
    province: "Gauteng",
    contactNumber: "0118128300",
    address: "Hospital Rd, New State Areas, Springs"
  },

  // WESTERN CAPE
  {
    id: "wc_karl_bremer",
    name: "Karl Bremer TCC",
    hospitalOrLocation: "Karl Bremer Hospital",
    cityOrTown: "Bellville, Cape Town",
    province: "Western Cape",
    contactNumber: "0219181321",
    altContactNumber: "0219181911",
    address: "Cnr Mike Pienaar Blvd & Frans Conradie Ave, Bellville"
  },
  {
    id: "wc_heideveld",
    name: "Heideveld TCC",
    hospitalOrLocation: "Heideveld Emergency Centre",
    cityOrTown: "Athlone / Cape Flats, Cape Town",
    province: "Western Cape",
    contactNumber: "0216993200",
    address: "Heideveld Rd, Heideveld, Cape Town"
  },
  {
    id: "wc_victoria",
    name: "Victoria Hospital TCC",
    hospitalOrLocation: "Victoria Hospital",
    cityOrTown: "Wynberg, Cape Town",
    province: "Western Cape",
    contactNumber: "0217991111",
    address: "Alphen Hill Rd, Wynberg, Cape Town"
  },
  {
    id: "wc_khayelitsha",
    name: "Khayelitsha TCC",
    hospitalOrLocation: "Khayelitsha District Hospital",
    cityOrTown: "Khayelitsha, Cape Town",
    province: "Western Cape",
    contactNumber: "0213604200",
    address: "Cnr Steve Biko & Walter Sisulu Rds, Khayelitsha"
  },

  // KWAZULU-NATAL
  {
    id: "kzn_king_edward",
    name: "King Edward VIII TCC",
    hospitalOrLocation: "King Edward VIII Hospital",
    cityOrTown: "Congella, Durban",
    province: "KwaZulu-Natal",
    contactNumber: "0313603111",
    address: "Rick Turner Rd & Sydney Rd, Congella, Durban"
  },
  {
    id: "kzn_rk_khan",
    name: "R.K. Khan TCC",
    hospitalOrLocation: "R.K. Khan Hospital",
    cityOrTown: "Chatsworth, Durban",
    province: "KwaZulu-Natal",
    contactNumber: "0314596000",
    address: "336 R K Khan Cir, Westcliff, Chatsworth"
  },
  {
    id: "kzn_mahatma_gandhi",
    name: "Mahatma Gandhi TCC",
    hospitalOrLocation: "Mahatma Gandhi Memorial Hospital",
    cityOrTown: "Phoenix, Durban",
    province: "KwaZulu-Natal",
    contactNumber: "0315021719",
    address: "100 Phoenix Hwy, Phoenix, Durban"
  },

  // EASTERN CAPE
  {
    id: "ec_livingstone",
    name: "Livingstone TCC",
    hospitalOrLocation: "Livingstone Tertiary Hospital",
    cityOrTown: "Gqeberha (Port Elizabeth)",
    province: "Eastern Cape",
    contactNumber: "0414059111",
    address: "Stanford Rd, Korsten, Gqeberha"
  },
  {
    id: "ec_frere",
    name: "Frere Hospital TCC",
    hospitalOrLocation: "Frere Hospital",
    cityOrTown: "East London",
    province: "Eastern Cape",
    contactNumber: "0437091111",
    address: "Amalinda Dr, Braelyn, East London"
  },

  // FREE STATE
  {
    id: "fs_pelonomi",
    name: "Pelonomi TCC",
    hospitalOrLocation: "Pelonomi Tertiary Hospital",
    cityOrTown: "Bloemfontein",
    province: "Free State",
    contactNumber: "0514051911",
    address: "Dr Belcher Rd, Heidedal, Bloemfontein"
  },
  {
    id: "fs_bongani",
    name: "Bongani Hospital TCC",
    hospitalOrLocation: "Bongani Regional Hospital",
    cityOrTown: "Welkom",
    province: "Free State",
    contactNumber: "0579168000",
    address: "Mothusi Rd, Thabong, Welkom"
  },

  // LIMPOPO
  {
    id: "lp_polokwane",
    name: "Polokwane Hospital TCC",
    hospitalOrLocation: "Polokwane Provincial Hospital",
    cityOrTown: "Polokwane",
    province: "Limpopo",
    contactNumber: "0152875000",
    address: "Hospital St, Polokwane"
  },

  // MPUMALANGA
  {
    id: "mp_rob_ferreira",
    name: "Rob Ferreira TCC",
    hospitalOrLocation: "Rob Ferreira Hospital",
    cityOrTown: "Mbombela (Nelspruit)",
    province: "Mpumalanga",
    contactNumber: "0137416100",
    address: "Piet Retief St, Mbombela"
  },

  // NORTH WEST
  {
    id: "nw_klerksdorp",
    name: "Klerksdorp TCC",
    hospitalOrLocation: "Klerksdorp/Tshepong Hospital Complex",
    cityOrTown: "Klerksdorp",
    province: "North West",
    contactNumber: "0184064600",
    address: "Church St, Klerksdorp"
  },

  // NORTHERN CAPE
  {
    id: "nc_robert_mangoliso",
    name: "Robert Mangaliso Sobukwe TCC",
    hospitalOrLocation: "Robert Mangaliso Sobukwe Hospital",
    cityOrTown: "Kimberley",
    province: "Northern Cape",
    contactNumber: "0538029111",
    address: "Du Toitspan Rd, Belgravia, Kimberley"
  }
];

export const SA_PROVINCES = [
  "All",
  "Gauteng",
  "Western Cape",
  "KwaZulu-Natal",
  "Eastern Cape",
  "Free State",
  "Limpopo",
  "Mpumalanga",
  "North West",
  "Northern Cape"
] as const;
