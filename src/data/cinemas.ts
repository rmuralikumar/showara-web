import { Cinema, City } from "@/types/cinema";
import { CITIES } from "./cities";

export { CITIES };

export const CINEMAS: Cinema[] = [
  {
    "id": "th-blr-pvr-nexus",
    "slug": "pvr-nexus-koramangala",
    "name": "PVR INOX: Nexus Mall, Koramangala",
    "chain": "PVR INOX",
    "cityId": "bengaluru",
    "city": "Bengaluru",
    "address": "2nd Floor, Nexus Mall, Hosur Road, Chikku Lakshmaiah Layout, Koramangala, Bengaluru - 560095",
    "area": "Koramangala",
    "latitude": 12.9352,
    "longitude": 77.6119,
    "facilities": [
      "IMAX with Laser",
      "Dolby Atmos",
      "Recliner Seats",
      "Wheelchair Accessible",
      "Valet Parking",
      "Food & Beverage Counter"
    ],
    "screens": [
      {
        "id": "scr-th-blr-pvr-nexus-1",
        "cinemaId": "th-blr-pvr-nexus",
        "screenNumber": 1,
        "name": "Audi 1 - IMAX Laser",
        "format": "IMAX 2D",
        "totalSeats": 260
      },
      {
        "id": "scr-th-blr-pvr-nexus-2",
        "cinemaId": "th-blr-pvr-nexus",
        "screenNumber": 2,
        "name": "Audi 2 - Dolby Atmos",
        "format": "2D",
        "totalSeats": 180
      },
      {
        "id": "scr-th-blr-pvr-nexus-3",
        "cinemaId": "th-blr-pvr-nexus",
        "screenNumber": 3,
        "name": "Audi 3 - Gold Class",
        "format": "2D",
        "totalSeats": 60
      },
      {
        "id": "scr-th-blr-pvr-nexus-4",
        "cinemaId": "th-blr-pvr-nexus",
        "screenNumber": 4,
        "name": "Audi 4 - RealD 3D",
        "format": "3D",
        "totalSeats": 160
      }
    ],
    "phone": "+91 80 4910 8800",
    "cancellationAllowed": true,
    "active": true,
    "operatingStatus": "OPERATING",
    "source": "chain_directory",
    "sourceId": "PVR-BLR-001"
  },
  {
    "id": "th-blr-pvr-vega",
    "slug": "pvr-vega-city-bannerghatta",
    "name": "PVR INOX: Vega City Mall, Bannerghatta Road",
    "chain": "PVR INOX",
    "cityId": "bengaluru",
    "city": "Bengaluru",
    "address": "4th & 5th Floor, Vega City Mall, Srinivas Industrial Estate, Bannerghatta Main Road, BTM 2nd Stage, Bengaluru - 560076",
    "area": "Bannerghatta Road",
    "latitude": 12.9069,
    "longitude": 77.5998,
    "facilities": [
      "IMAX with Laser",
      "4DX",
      "Dolby Atmos",
      "Recliner Seats",
      "Wheelchair Accessible",
      "Valet Parking"
    ],
    "screens": [
      {
        "id": "scr-th-blr-pvr-vega-1",
        "cinemaId": "th-blr-pvr-vega",
        "screenNumber": 1,
        "name": "Audi 1 - IMAX Laser",
        "format": "IMAX 3D",
        "totalSeats": 290
      },
      {
        "id": "scr-th-blr-pvr-vega-2",
        "cinemaId": "th-blr-pvr-vega",
        "screenNumber": 2,
        "name": "Audi 2 - 4DX Sensory",
        "format": "4DX",
        "totalSeats": 140
      },
      {
        "id": "scr-th-blr-pvr-vega-3",
        "cinemaId": "th-blr-pvr-vega",
        "screenNumber": 3,
        "name": "Audi 3 - P[XL] Atmos",
        "format": "2D",
        "totalSeats": 220
      }
    ],
    "phone": "+91 80 6702 4444",
    "cancellationAllowed": true,
    "active": true,
    "operatingStatus": "OPERATING",
    "source": "chain_directory",
    "sourceId": "PVR-BLR-002"
  },
  {
    "id": "th-blr-pvr-directors-cut",
    "slug": "pvr-directors-cut-forum-rex-walk",
    "name": "PVR Director's Cut: Forum Rex Walk, Brigade Road",
    "chain": "PVR INOX",
    "cityId": "bengaluru",
    "city": "Bengaluru",
    "address": "Rex Walk, Brigade Road, Shanthala Nagar, Ashok Nagar, Bengaluru - 560001",
    "area": "Brigade Road",
    "latitude": 12.9738,
    "longitude": 77.6083,
    "facilities": [
      "Recliner Seats",
      "4K RGB Laser Projection",
      "Dolby Atmos",
      "Valet Parking",
      "Food & Beverage Counter"
    ],
    "screens": [
      {
        "id": "scr-th-blr-pvr-directors-cut-1",
        "cinemaId": "th-blr-pvr-directors-cut",
        "screenNumber": 1,
        "name": "Director's Salon 1",
        "format": "Dolby Cinema",
        "totalSeats": 55
      },
      {
        "id": "scr-th-blr-pvr-directors-cut-2",
        "cinemaId": "th-blr-pvr-directors-cut",
        "screenNumber": 2,
        "name": "Director's Salon 2",
        "format": "2D",
        "totalSeats": 65
      }
    ],
    "phone": "+91 80 4567 8900",
    "cancellationAllowed": true,
    "active": true,
    "operatingStatus": "OPERATING",
    "source": "chain_directory",
    "sourceId": "PVR-BLR-003"
  },
  {
    "id": "th-blr-cinepolis-shantiniketan",
    "slug": "cinepolis-forum-shantiniketan-whitefield",
    "name": "Cinepolis: Forum Shantiniketan, Whitefield",
    "chain": "Cinepolis",
    "cityId": "bengaluru",
    "city": "Bengaluru",
    "address": "4th Floor, Forum Shantiniketan Mall, Thigalarapalya, Hoodi, Whitefield, Bengaluru - 560067",
    "area": "Whitefield",
    "latitude": 12.9897,
    "longitude": 77.7289,
    "facilities": [
      "IMAX with Laser",
      "Dolby Atmos",
      "4DX",
      "Recliner Seats",
      "Wheelchair Accessible",
      "Valet Parking"
    ],
    "screens": [
      {
        "id": "scr-th-blr-cinepolis-shantiniketan-1",
        "cinemaId": "th-blr-cinepolis-shantiniketan",
        "screenNumber": 1,
        "name": "Screen 1 - Macro XE Atmos",
        "format": "2D",
        "totalSeats": 280
      },
      {
        "id": "scr-th-blr-cinepolis-shantiniketan-2",
        "cinemaId": "th-blr-cinepolis-shantiniketan",
        "screenNumber": 2,
        "name": "Screen 2 - 4DX",
        "format": "4DX",
        "totalSeats": 110
      },
      {
        "id": "scr-th-blr-cinepolis-shantiniketan-3",
        "cinemaId": "th-blr-cinepolis-shantiniketan",
        "screenNumber": 3,
        "name": "Screen 3 - VIP Lounge",
        "format": "2D",
        "totalSeats": 70
      }
    ],
    "phone": "+91 80 6722 5500",
    "cancellationAllowed": true,
    "active": true,
    "operatingStatus": "OPERATING",
    "source": "chain_directory",
    "sourceId": "CIN-BLR-001"
  },
  {
    "id": "th-blr-urvashi",
    "slug": "urvashi-cinema-lalbagh-road",
    "name": "Urvashi Cinema: Lalbagh Road",
    "chain": "Independent",
    "cityId": "bengaluru",
    "city": "Bengaluru",
    "address": "40, Lalbagh Road, Mavalli, Sudhama Nagar, Bengaluru - 560027",
    "area": "Lalbagh Road",
    "latitude": 12.9553,
    "longitude": 77.5897,
    "facilities": [
      "4K RGB Laser Projection",
      "Dolby Atmos",
      "Recliner Seats",
      "Food & Beverage Counter"
    ],
    "screens": [
      {
        "id": "scr-th-blr-urvashi-1",
        "cinemaId": "th-blr-urvashi",
        "screenNumber": 1,
        "name": "Main Auditorium - Dual 4K Laser & 64-Ch Atmos",
        "format": "2D",
        "totalSeats": 580
      }
    ],
    "phone": "+91 80 2222 2333",
    "cancellationAllowed": true,
    "active": true,
    "operatingStatus": "OPERATING",
    "source": "chain_directory",
    "sourceId": "URV-BLR-001"
  },
  {
    "id": "th-blr-navrang",
    "slug": "navrang-theatre-rajajinagar",
    "name": "Navrang Theatre: Rajajinagar",
    "chain": "Independent",
    "cityId": "bengaluru",
    "city": "Bengaluru",
    "address": "1st Block, Dr. Rajkumar Road, Navrang Circle, Rajajinagar, Bengaluru - 560010",
    "area": "Rajajinagar",
    "latitude": 12.9982,
    "longitude": 77.5539,
    "facilities": [
      "Dolby Atmos",
      "4K RGB Laser Projection",
      "Food & Beverage Counter"
    ],
    "screens": [
      {
        "id": "scr-th-blr-navrang-1",
        "cinemaId": "th-blr-navrang",
        "screenNumber": 1,
        "name": "Main Screen - 4K Dolby Atmos",
        "format": "2D",
        "totalSeats": 480
      }
    ],
    "phone": "+91 80 2332 5055",
    "cancellationAllowed": true,
    "active": true,
    "operatingStatus": "OPERATING",
    "source": "chain_directory",
    "sourceId": "NAV-BLR-001"
  },
  {
    "id": "th-blr-inox-garuda",
    "slug": "inox-garuda-mall-magrath-road",
    "name": "INOX: Garuda Mall, Magrath Road",
    "chain": "PVR INOX",
    "cityId": "bengaluru",
    "city": "Bengaluru",
    "address": "4th Floor, Garuda Mall, Magrath Road, Ashok Nagar, Bengaluru - 560025",
    "area": "Ashok Nagar",
    "latitude": 12.9702,
    "longitude": 77.6094,
    "facilities": [
      "Dolby Atmos",
      "Recliner Seats",
      "Wheelchair Accessible",
      "Valet Parking"
    ],
    "screens": [
      {
        "id": "scr-th-blr-inox-garuda-1",
        "cinemaId": "th-blr-inox-garuda",
        "screenNumber": 1,
        "name": "Screen 1 - Atmos Premier",
        "format": "2D",
        "totalSeats": 190
      },
      {
        "id": "scr-th-blr-inox-garuda-2",
        "cinemaId": "th-blr-inox-garuda",
        "screenNumber": 2,
        "name": "Screen 2 - RealD 3D",
        "format": "3D",
        "totalSeats": 160
      }
    ],
    "phone": "+91 80 4112 0000",
    "cancellationAllowed": true,
    "active": true,
    "operatingStatus": "OPERATING",
    "source": "chain_directory",
    "sourceId": "INOX-BLR-001"
  },
  {
    "id": "th-mum-phoenix-palladium",
    "slug": "pvr-phoenix-palladium-lower-parel",
    "name": "PVR INOX: Phoenix Palladium, Lower Parel",
    "chain": "PVR INOX",
    "cityId": "mumbai",
    "city": "Mumbai",
    "address": "462, Senapati Bapat Marg, Lower Parel, Mumbai - 400013",
    "area": "Lower Parel",
    "latitude": 18.9953,
    "longitude": 72.8242,
    "facilities": [
      "IMAX with Laser",
      "Dolby Atmos",
      "Recliner Seats",
      "Wheelchair Accessible",
      "Valet Parking"
    ],
    "screens": [
      {
        "id": "scr-th-mum-phoenix-palladium-1",
        "cinemaId": "th-mum-phoenix-palladium",
        "screenNumber": 1,
        "name": "Screen 1 - IMAX Laser",
        "format": "IMAX 2D",
        "totalSeats": 260
      },
      {
        "id": "scr-th-mum-phoenix-palladium-2",
        "cinemaId": "th-mum-phoenix-palladium",
        "screenNumber": 2,
        "name": "Screen 2 - Atmos Gold",
        "format": "2D",
        "totalSeats": 140
      },
      {
        "id": "scr-th-mum-phoenix-palladium-3",
        "cinemaId": "th-mum-phoenix-palladium",
        "screenNumber": 3,
        "name": "Screen 3 - Premiere 3D",
        "format": "3D",
        "totalSeats": 180
      }
    ],
    "phone": "+91 22 6601 4400",
    "cancellationAllowed": true,
    "active": true,
    "operatingStatus": "OPERATING",
    "source": "chain_directory",
    "sourceId": "PVR-BOM-001"
  },
  {
    "id": "th-mum-cinepolis-viviana",
    "slug": "cinepolis-viviana-mall-thane",
    "name": "Cinepolis: Viviana Mall, Thane",
    "chain": "Cinepolis",
    "cityId": "mumbai",
    "city": "Mumbai",
    "address": "Eastern Express Highway, Near Jupiter Hospital, Laxmi Nagar, Thane West, Mumbai - 400606",
    "area": "Thane",
    "latitude": 19.2082,
    "longitude": 72.9715,
    "facilities": [
      "IMAX with Laser",
      "4DX",
      "Dolby Atmos",
      "Recliner Seats",
      "Wheelchair Accessible",
      "Valet Parking"
    ],
    "screens": [
      {
        "id": "scr-th-mum-cinepolis-viviana-1",
        "cinemaId": "th-mum-cinepolis-viviana",
        "screenNumber": 1,
        "name": "Screen 1 - IMAX with Laser",
        "format": "IMAX 3D",
        "totalSeats": 310
      },
      {
        "id": "scr-th-mum-cinepolis-viviana-2",
        "cinemaId": "th-mum-cinepolis-viviana",
        "screenNumber": 2,
        "name": "Screen 2 - 4DX Sensory",
        "format": "4DX",
        "totalSeats": 128
      },
      {
        "id": "scr-th-mum-cinepolis-viviana-3",
        "cinemaId": "th-mum-cinepolis-viviana",
        "screenNumber": 3,
        "name": "Screen 3 - VIP Lounge",
        "format": "2D",
        "totalSeats": 80
      }
    ],
    "phone": "+91 22 6170 1400",
    "cancellationAllowed": true,
    "active": true,
    "operatingStatus": "OPERATING",
    "source": "chain_directory",
    "sourceId": "CIN-BOM-001"
  },
  {
    "id": "th-mum-inox-inorbit",
    "slug": "inox-inorbit-mall-malad",
    "name": "PVR INOX: Inorbit Mall, Malad West",
    "chain": "PVR INOX",
    "cityId": "mumbai",
    "city": "Mumbai",
    "address": "2nd Floor, Inorbit Mall, New Link Road, Malad West, Mumbai - 400064",
    "area": "Malad West",
    "latitude": 19.1728,
    "longitude": 72.8361,
    "facilities": [
      "Dolby Atmos",
      "Recliner Seats",
      "Wheelchair Accessible",
      "Valet Parking"
    ],
    "screens": [
      {
        "id": "scr-th-mum-inox-inorbit-1",
        "cinemaId": "th-mum-inox-inorbit",
        "screenNumber": 1,
        "name": "Screen 1 - Insignia Atmos",
        "format": "2D",
        "totalSeats": 110
      },
      {
        "id": "scr-th-mum-inox-inorbit-2",
        "cinemaId": "th-mum-inox-inorbit",
        "screenNumber": 2,
        "name": "Screen 2 - RealD 3D",
        "format": "3D",
        "totalSeats": 220
      }
    ],
    "phone": "+91 22 4000 1200",
    "cancellationAllowed": true,
    "active": true,
    "operatingStatus": "OPERATING",
    "source": "chain_directory",
    "sourceId": "INOX-BOM-002"
  },
  {
    "id": "th-mum-miraj-wadala",
    "slug": "miraj-cinemas-imax-wadala",
    "name": "Miraj Cinemas: IMAX Wadala",
    "chain": "Miraj",
    "cityId": "mumbai",
    "city": "Mumbai",
    "address": "Bhakti Park, Anik Wadala Link Road, Chembur, Mumbai - 400037",
    "area": "Wadala",
    "latitude": 19.0307,
    "longitude": 72.8833,
    "facilities": [
      "IMAX with Laser",
      "Dolby Atmos",
      "Recliner Seats",
      "Parking"
    ],
    "screens": [
      {
        "id": "scr-th-mum-miraj-wadala-1",
        "cinemaId": "th-mum-miraj-wadala",
        "screenNumber": 1,
        "name": "Audi 1 - Dome IMAX Laser",
        "format": "IMAX 2D",
        "totalSeats": 450
      },
      {
        "id": "scr-th-mum-miraj-wadala-2",
        "cinemaId": "th-mum-miraj-wadala",
        "screenNumber": 2,
        "name": "Audi 2 - Atmos Classic",
        "format": "2D",
        "totalSeats": 220
      }
    ],
    "phone": "+91 22 2404 1000",
    "cancellationAllowed": true,
    "active": true,
    "operatingStatus": "OPERATING",
    "source": "chain_directory",
    "sourceId": "MIR-BOM-001"
  },
  {
    "id": "th-del-pvr-select-citywalk",
    "slug": "pvr-select-citywalk-saket",
    "name": "PVR INOX: Select Citywalk, Saket",
    "chain": "PVR INOX",
    "cityId": "delhi-ncr",
    "city": "Delhi-NCR",
    "address": "A-3, District Centre, Saket, New Delhi - 110017",
    "area": "Saket",
    "latitude": 28.5284,
    "longitude": 77.2192,
    "facilities": [
      "IMAX with Laser",
      "Dolby Atmos",
      "Recliner Seats",
      "Wheelchair Accessible",
      "Valet Parking"
    ],
    "screens": [
      {
        "id": "scr-th-del-pvr-select-citywalk-1",
        "cinemaId": "th-del-pvr-select-citywalk",
        "screenNumber": 1,
        "name": "Audi 1 - IMAX Laser",
        "format": "IMAX 2D",
        "totalSeats": 280
      },
      {
        "id": "scr-th-del-pvr-select-citywalk-2",
        "cinemaId": "th-del-pvr-select-citywalk",
        "screenNumber": 2,
        "name": "Audi 2 - Gold Class Atmos",
        "format": "2D",
        "totalSeats": 60
      },
      {
        "id": "scr-th-del-pvr-select-citywalk-3",
        "cinemaId": "th-del-pvr-select-citywalk",
        "screenNumber": 3,
        "name": "Audi 3 - RealD 3D",
        "format": "3D",
        "totalSeats": 210
      }
    ],
    "phone": "+91 11 4058 8888",
    "cancellationAllowed": true,
    "active": true,
    "operatingStatus": "OPERATING",
    "source": "chain_directory",
    "sourceId": "PVR-DEL-001"
  },
  {
    "id": "th-del-pvr-plaza",
    "slug": "pvr-plaza-connaught-place",
    "name": "PVR Heritage: Plaza, Connaught Place",
    "chain": "PVR INOX",
    "cityId": "delhi-ncr",
    "city": "Delhi-NCR",
    "address": "H Block, Radial Road 4, Connaught Place, New Delhi - 110001",
    "area": "Connaught Place",
    "latitude": 28.6328,
    "longitude": 77.2197,
    "facilities": [
      "Dolby Atmos",
      "Recliner Seats",
      "Valet Parking",
      "Food & Beverage Counter"
    ],
    "screens": [
      {
        "id": "scr-th-del-pvr-plaza-1",
        "cinemaId": "th-del-pvr-plaza",
        "screenNumber": 1,
        "name": "Main Heritage Audi - Dolby Atmos",
        "format": "2D",
        "totalSeats": 320
      }
    ],
    "phone": "+91 11 2331 4455",
    "cancellationAllowed": true,
    "active": true,
    "operatingStatus": "OPERATING",
    "source": "chain_directory",
    "sourceId": "PVR-DEL-002"
  },
  {
    "id": "th-del-cinepolis-dlf-avenue",
    "slug": "cinepolis-dlf-avenue-saket",
    "name": "Cinepolis: DLF Avenue, Saket",
    "chain": "Cinepolis",
    "cityId": "delhi-ncr",
    "city": "Delhi-NCR",
    "address": "Press Enclave Marg, Saket District Centre, Sector 6, Pushp Vihar, New Delhi - 110017",
    "area": "Saket",
    "latitude": 28.5273,
    "longitude": 77.2185,
    "facilities": [
      "Dolby Atmos",
      "Recliner Seats",
      "Wheelchair Accessible",
      "Valet Parking"
    ],
    "screens": [
      {
        "id": "scr-th-del-cinepolis-dlf-avenue-1",
        "cinemaId": "th-del-cinepolis-dlf-avenue",
        "screenNumber": 1,
        "name": "Screen 1 - Macro XE",
        "format": "2D",
        "totalSeats": 250
      },
      {
        "id": "scr-th-del-cinepolis-dlf-avenue-2",
        "cinemaId": "th-del-cinepolis-dlf-avenue",
        "screenNumber": 2,
        "name": "Screen 2 - RealD 3D",
        "format": "3D",
        "totalSeats": 170
      }
    ],
    "phone": "+91 11 4606 0000",
    "cancellationAllowed": true,
    "active": true,
    "operatingStatus": "OPERATING",
    "source": "chain_directory",
    "sourceId": "CIN-DEL-001"
  },
  {
    "id": "th-hyd-amb",
    "slug": "amb-cinemas-gachibowli",
    "name": "AMB Cinemas: Sarath City Capital Mall, Gachibowli",
    "chain": "AMB",
    "cityId": "hyderabad",
    "city": "Hyderabad",
    "address": "Sarath City Capital Mall, Whitefields, Gachibowli - Miyapur Road, Kondapur, Hyderabad - 500084",
    "area": "Gachibowli",
    "latitude": 17.4568,
    "longitude": 78.3654,
    "facilities": [
      "Dolby Atmos",
      "4K RGB Laser Projection",
      "Recliner Seats",
      "Wheelchair Accessible",
      "Valet Parking"
    ],
    "screens": [
      {
        "id": "scr-th-hyd-amb-1",
        "cinemaId": "th-hyd-amb",
        "screenNumber": 1,
        "name": "Screen 1 - Laser Atmos Super",
        "format": "2D",
        "totalSeats": 380
      },
      {
        "id": "scr-th-hyd-amb-2",
        "cinemaId": "th-hyd-amb",
        "screenNumber": 2,
        "name": "Screen 2 - VIP Lounge",
        "format": "2D",
        "totalSeats": 90
      },
      {
        "id": "scr-th-hyd-amb-3",
        "cinemaId": "th-hyd-amb",
        "screenNumber": 3,
        "name": "Screen 3 - RealD 3D",
        "format": "3D",
        "totalSeats": 240
      }
    ],
    "phone": "+91 40 6828 8888",
    "cancellationAllowed": true,
    "active": true,
    "operatingStatus": "OPERATING",
    "source": "chain_directory",
    "sourceId": "AMB-HYD-001"
  },
  {
    "id": "th-hyd-prasad-imax",
    "slug": "prasads-multiplex-necklace-road",
    "name": "Prasads Multiplex: Necklace Road",
    "chain": "Prasads",
    "cityId": "hyderabad",
    "city": "Hyderabad",
    "address": "NTR Gardens, LIC Division, Khairatabad, Hyderabad - 500004",
    "area": "Khairatabad",
    "latitude": 17.4125,
    "longitude": 78.4682,
    "facilities": [
      "Dolby Atmos",
      "4K RGB Laser Projection",
      "Wheelchair Accessible",
      "Parking"
    ],
    "screens": [
      {
        "id": "scr-th-hyd-prasad-imax-1",
        "cinemaId": "th-hyd-prasad-imax",
        "screenNumber": 1,
        "name": "Large Screen - Dual 4K Laser",
        "format": "2D",
        "totalSeats": 600
      },
      {
        "id": "scr-th-hyd-prasad-imax-2",
        "cinemaId": "th-hyd-prasad-imax",
        "screenNumber": 2,
        "name": "Screen 2 - Atmos Sound",
        "format": "2D",
        "totalSeats": 250
      }
    ],
    "phone": "+91 40 2344 8888",
    "cancellationAllowed": true,
    "active": true,
    "operatingStatus": "OPERATING",
    "source": "chain_directory",
    "sourceId": "PRA-HYD-001"
  },
  {
    "id": "th-hyd-pvr-next-galleria",
    "slug": "pvr-next-galleria-panjagutta",
    "name": "PVR INOX: Next Galleria Mall, Panjagutta",
    "chain": "PVR INOX",
    "cityId": "hyderabad",
    "city": "Hyderabad",
    "address": "Nagarjuna Circle, Panjagutta, Hyderabad - 500082",
    "area": "Panjagutta",
    "latitude": 17.4267,
    "longitude": 78.4519,
    "facilities": [
      "Dolby Atmos",
      "Recliner Seats",
      "Wheelchair Accessible",
      "Valet Parking"
    ],
    "screens": [
      {
        "id": "scr-th-hyd-pvr-next-galleria-1",
        "cinemaId": "th-hyd-pvr-next-galleria",
        "screenNumber": 1,
        "name": "Screen 1 - P[XL] Atmos",
        "format": "2D",
        "totalSeats": 290
      },
      {
        "id": "scr-th-hyd-pvr-next-galleria-2",
        "cinemaId": "th-hyd-pvr-next-galleria",
        "screenNumber": 2,
        "name": "Screen 2 - 3D Atmos",
        "format": "3D",
        "totalSeats": 180
      }
    ],
    "phone": "+91 40 4567 1122",
    "cancellationAllowed": true,
    "active": true,
    "operatingStatus": "OPERATING",
    "source": "chain_directory",
    "sourceId": "PVR-HYD-002"
  },
  {
    "id": "th-che-spi-escape",
    "slug": "spi-escape-express-avenue-royapettah",
    "name": "SPI Escape: Express Avenue Mall, Royapettah",
    "chain": "PVR INOX",
    "cityId": "chennai",
    "city": "Chennai",
    "address": "Express Avenue Mall, Whites Road, Royapettah, Chennai - 600014",
    "area": "Royapettah",
    "latitude": 13.0583,
    "longitude": 80.2642,
    "facilities": [
      "Dolby Atmos",
      "Recliner Seats",
      "Wheelchair Accessible",
      "Valet Parking"
    ],
    "screens": [
      {
        "id": "scr-th-che-spi-escape-1",
        "cinemaId": "th-che-spi-escape",
        "screenNumber": 1,
        "name": "Screen 1 - Blush",
        "format": "2D",
        "totalSeats": 230
      },
      {
        "id": "scr-th-che-spi-escape-2",
        "cinemaId": "th-che-spi-escape",
        "screenNumber": 2,
        "name": "Screen 2 - Weave",
        "format": "2D",
        "totalSeats": 190
      },
      {
        "id": "scr-th-che-spi-escape-3",
        "cinemaId": "th-che-spi-escape",
        "screenNumber": 3,
        "name": "Screen 3 - Spot 3D",
        "format": "3D",
        "totalSeats": 170
      }
    ],
    "phone": "+91 44 4224 4224",
    "cancellationAllowed": true,
    "active": true,
    "operatingStatus": "OPERATING",
    "source": "chain_directory",
    "sourceId": "SPI-CHE-001"
  },
  {
    "id": "th-che-pvr-vr",
    "slug": "pvr-vr-chennai-anna-nagar",
    "name": "PVR INOX: VR Chennai, Anna Nagar",
    "chain": "PVR INOX",
    "cityId": "chennai",
    "city": "Chennai",
    "address": "Jawaharlal Nehru Road, Thirumangalam, Anna Nagar, Chennai - 600040",
    "area": "Anna Nagar",
    "latitude": 13.0847,
    "longitude": 80.1932,
    "facilities": [
      "IMAX with Laser",
      "Dolby Atmos",
      "Recliner Seats",
      "Wheelchair Accessible",
      "Valet Parking"
    ],
    "screens": [
      {
        "id": "scr-th-che-pvr-vr-1",
        "cinemaId": "th-che-pvr-vr",
        "screenNumber": 1,
        "name": "Screen 1 - IMAX Laser",
        "format": "IMAX 2D",
        "totalSeats": 340
      },
      {
        "id": "scr-th-che-pvr-vr-2",
        "cinemaId": "th-che-pvr-vr",
        "screenNumber": 2,
        "name": "Screen 2 - P[XL] Atmos",
        "format": "2D",
        "totalSeats": 260
      },
      {
        "id": "scr-th-che-pvr-vr-3",
        "cinemaId": "th-che-pvr-vr",
        "screenNumber": 3,
        "name": "Screen 3 - Gold Class",
        "format": "2D",
        "totalSeats": 70
      }
    ],
    "phone": "+91 44 6665 5555",
    "cancellationAllowed": true,
    "active": true,
    "operatingStatus": "OPERATING",
    "source": "chain_directory",
    "sourceId": "PVR-CHE-002"
  },
  {
    "id": "th-kol-inox-quest",
    "slug": "inox-quest-mall-park-circus",
    "name": "PVR INOX: Quest Mall, Park Circus",
    "chain": "PVR INOX",
    "cityId": "kolkata",
    "city": "Kolkata",
    "address": "33, Syed Amir Ali Avenue, Park Circus, Beck Bagan, Kolkata - 700017",
    "area": "Park Circus",
    "latitude": 22.5393,
    "longitude": 88.3653,
    "facilities": [
      "IMAX with Laser",
      "Dolby Atmos",
      "Recliner Seats",
      "Wheelchair Accessible",
      "Valet Parking"
    ],
    "screens": [
      {
        "id": "scr-th-kol-inox-quest-1",
        "cinemaId": "th-kol-inox-quest",
        "screenNumber": 1,
        "name": "Screen 1 - IMAX Laser",
        "format": "IMAX 2D",
        "totalSeats": 270
      },
      {
        "id": "scr-th-kol-inox-quest-2",
        "cinemaId": "th-kol-inox-quest",
        "screenNumber": 2,
        "name": "Screen 2 - Insignia Atmos",
        "format": "2D",
        "totalSeats": 80
      },
      {
        "id": "scr-th-kol-inox-quest-3",
        "cinemaId": "th-kol-inox-quest",
        "screenNumber": 3,
        "name": "Screen 3 - RealD 3D",
        "format": "3D",
        "totalSeats": 190
      }
    ],
    "phone": "+91 33 4000 8800",
    "cancellationAllowed": true,
    "active": true,
    "operatingStatus": "OPERATING",
    "source": "chain_directory",
    "sourceId": "INOX-CCU-001"
  },
  {
    "id": "th-kol-pvr-south-city",
    "slug": "pvr-south-city-mall-jadavpur",
    "name": "PVR INOX: South City Mall, Jadavpur",
    "chain": "PVR INOX",
    "cityId": "kolkata",
    "city": "Kolkata",
    "address": "375, Prince Anwar Shah Road, South City Complex, Jadavpur, Kolkata - 700068",
    "area": "Jadavpur",
    "latitude": 22.4998,
    "longitude": 88.3619,
    "facilities": [
      "Dolby Atmos",
      "IMAX with Laser",
      "Recliner Seats",
      "Wheelchair Accessible",
      "Valet Parking"
    ],
    "screens": [
      {
        "id": "scr-th-kol-pvr-south-city-1",
        "cinemaId": "th-kol-pvr-south-city",
        "screenNumber": 1,
        "name": "Screen 1 - IMAX Laser",
        "format": "IMAX 3D",
        "totalSeats": 290
      },
      {
        "id": "scr-th-kol-pvr-south-city-2",
        "cinemaId": "th-kol-pvr-south-city",
        "screenNumber": 2,
        "name": "Screen 2 - Gold Atmos",
        "format": "2D",
        "totalSeats": 65
      }
    ],
    "phone": "+91 33 4001 2233",
    "cancellationAllowed": true,
    "active": true,
    "operatingStatus": "OPERATING",
    "source": "chain_directory",
    "sourceId": "PVR-CCU-002"
  },
  {
    "id": "th-pun-pvr-phoenix-marketcity",
    "slug": "pvr-phoenix-marketcity-viman-nagar",
    "name": "PVR INOX: Phoenix Marketcity, Viman Nagar",
    "chain": "PVR INOX",
    "cityId": "pune",
    "city": "Pune",
    "address": "S No 207, Viman Nagar Road, Clover Park, Viman Nagar, Pune - 411014",
    "area": "Viman Nagar",
    "latitude": 18.5621,
    "longitude": 73.9167,
    "facilities": [
      "IMAX with Laser",
      "4DX",
      "Dolby Atmos",
      "Recliner Seats",
      "Wheelchair Accessible",
      "Valet Parking"
    ],
    "screens": [
      {
        "id": "scr-th-pun-pvr-phoenix-marketcity-1",
        "cinemaId": "th-pun-pvr-phoenix-marketcity",
        "screenNumber": 1,
        "name": "Screen 1 - IMAX Laser",
        "format": "IMAX 2D",
        "totalSeats": 310
      },
      {
        "id": "scr-th-pun-pvr-phoenix-marketcity-2",
        "cinemaId": "th-pun-pvr-phoenix-marketcity",
        "screenNumber": 2,
        "name": "Screen 2 - 4DX Sensory",
        "format": "4DX",
        "totalSeats": 130
      },
      {
        "id": "scr-th-pun-pvr-phoenix-marketcity-3",
        "cinemaId": "th-pun-pvr-phoenix-marketcity",
        "screenNumber": 3,
        "name": "Screen 3 - P[XL] Atmos",
        "format": "2D",
        "totalSeats": 240
      }
    ],
    "phone": "+91 20 6689 0088",
    "cancellationAllowed": true,
    "active": true,
    "operatingStatus": "OPERATING",
    "source": "chain_directory",
    "sourceId": "PVR-PNQ-001"
  },
  {
    "id": "th-pun-cinepolis-westend",
    "slug": "cinepolis-westend-mall-aundh",
    "name": "Cinepolis: Westend Mall, Aundh",
    "chain": "Cinepolis",
    "cityId": "pune",
    "city": "Pune",
    "address": "Near Parihar Chowk, Mahadji Shinde Road, Harmony Society, Ward No. 8, Aundh, Pune - 411007",
    "area": "Aundh",
    "latitude": 18.5583,
    "longitude": 73.8078,
    "facilities": [
      "IMAX with Laser",
      "Dolby Atmos",
      "Recliner Seats",
      "Wheelchair Accessible",
      "Valet Parking"
    ],
    "screens": [
      {
        "id": "scr-th-pun-cinepolis-westend-1",
        "cinemaId": "th-pun-cinepolis-westend",
        "screenNumber": 1,
        "name": "Screen 1 - IMAX Laser",
        "format": "IMAX 2D",
        "totalSeats": 280
      },
      {
        "id": "scr-th-pun-cinepolis-westend-2",
        "cinemaId": "th-pun-cinepolis-westend",
        "screenNumber": 2,
        "name": "Screen 2 - Macro XE Atmos",
        "format": "2D",
        "totalSeats": 220
      }
    ],
    "phone": "+91 20 6767 5500",
    "cancellationAllowed": true,
    "active": true,
    "operatingStatus": "OPERATING",
    "source": "chain_directory",
    "sourceId": "CIN-PNQ-001"
  },
  {
    "id": "th-amd-pvr-acropolis",
    "slug": "pvr-acropolis-mall-thaltej",
    "name": "PVR INOX: Acropolis Mall, Thaltej",
    "chain": "PVR INOX",
    "cityId": "ahmedabad",
    "city": "Ahmedabad",
    "address": "SG Highway, Thaltej, Ahmedabad - 380054",
    "area": "Thaltej",
    "latitude": 23.0531,
    "longitude": 72.5089,
    "facilities": [
      "Dolby Atmos",
      "Recliner Seats",
      "Wheelchair Accessible",
      "Valet Parking"
    ],
    "screens": [
      {
        "id": "scr-th-amd-pvr-acropolis-1",
        "cinemaId": "th-amd-pvr-acropolis",
        "screenNumber": 1,
        "name": "Screen 1 - P[XL] Atmos",
        "format": "2D",
        "totalSeats": 260
      },
      {
        "id": "scr-th-amd-pvr-acropolis-2",
        "cinemaId": "th-amd-pvr-acropolis",
        "screenNumber": 2,
        "name": "Screen 2 - RealD 3D",
        "format": "3D",
        "totalSeats": 190
      }
    ],
    "phone": "+91 79 4000 7800",
    "cancellationAllowed": true,
    "active": true,
    "operatingStatus": "OPERATING",
    "source": "chain_directory",
    "sourceId": "PVR-AMD-001"
  },
  {
    "id": "th-amd-cinepolis-alpha-one",
    "slug": "cinepolis-nexus-ahmedabad-one-vastrapur",
    "name": "Cinepolis: Nexus Ahmedabad One, Vastrapur",
    "chain": "Cinepolis",
    "cityId": "ahmedabad",
    "city": "Ahmedabad",
    "address": "Plot No-216, TPU 1, Vastrapur, Ahmedabad - 380015",
    "area": "Vastrapur",
    "latitude": 23.0374,
    "longitude": 72.5312,
    "facilities": [
      "Dolby Atmos",
      "Recliner Seats",
      "Wheelchair Accessible",
      "Valet Parking"
    ],
    "screens": [
      {
        "id": "scr-th-amd-cinepolis-alpha-one-1",
        "cinemaId": "th-amd-cinepolis-alpha-one",
        "screenNumber": 1,
        "name": "Screen 1 - Macro XE Atmos",
        "format": "2D",
        "totalSeats": 270
      },
      {
        "id": "scr-th-amd-cinepolis-alpha-one-2",
        "cinemaId": "th-amd-cinepolis-alpha-one",
        "screenNumber": 2,
        "name": "Screen 2 - VIP Lounge",
        "format": "2D",
        "totalSeats": 75
      }
    ],
    "phone": "+91 79 6777 4400",
    "cancellationAllowed": true,
    "active": true,
    "operatingStatus": "OPERATING",
    "source": "chain_directory",
    "sourceId": "CIN-AMD-001"
  },
  {
    "id": "th-cok-pvr-lulu",
    "slug": "pvr-lulu-mall-edappally",
    "name": "PVR INOX: LuLu International Mall, Edappally",
    "chain": "PVR INOX",
    "cityId": "kochi",
    "city": "Kochi",
    "address": "LuLu International Shopping Mall, 34/1000, Old NH 47, Edappally, Kochi - 682024",
    "area": "Edappally",
    "latitude": 10.0284,
    "longitude": 76.3079,
    "facilities": [
      "IMAX with Laser",
      "4DX",
      "Dolby Atmos",
      "Recliner Seats",
      "Wheelchair Accessible",
      "Valet Parking"
    ],
    "screens": [
      {
        "id": "scr-th-cok-pvr-lulu-1",
        "cinemaId": "th-cok-pvr-lulu",
        "screenNumber": 1,
        "name": "Screen 1 - IMAX Laser",
        "format": "IMAX 2D",
        "totalSeats": 300
      },
      {
        "id": "scr-th-cok-pvr-lulu-2",
        "cinemaId": "th-cok-pvr-lulu",
        "screenNumber": 2,
        "name": "Screen 2 - 4DX Sensory",
        "format": "4DX",
        "totalSeats": 120
      },
      {
        "id": "scr-th-cok-pvr-lulu-3",
        "cinemaId": "th-cok-pvr-lulu",
        "screenNumber": 3,
        "name": "Screen 3 - P[XL] Atmos",
        "format": "2D",
        "totalSeats": 240
      }
    ],
    "phone": "+91 484 272 7700",
    "cancellationAllowed": true,
    "active": true,
    "operatingStatus": "OPERATING",
    "source": "chain_directory",
    "sourceId": "PVR-COK-001"
  },
  {
    "id": "th-cok-cinepolis-centre-square",
    "slug": "cinepolis-centre-square-mall-mg-road",
    "name": "Cinepolis: Centre Square Mall, MG Road",
    "chain": "Cinepolis",
    "cityId": "kochi",
    "city": "Kochi",
    "address": "6th to 8th Floor, Centre Square Mall, Rajaji Road, Shenoys, Ernakulam, Kochi - 682035",
    "area": "MG Road",
    "latitude": 9.9734,
    "longitude": 76.2825,
    "facilities": [
      "Dolby Atmos",
      "Recliner Seats",
      "Wheelchair Accessible",
      "Valet Parking"
    ],
    "screens": [
      {
        "id": "scr-th-cok-cinepolis-centre-square-1",
        "cinemaId": "th-cok-cinepolis-centre-square",
        "screenNumber": 1,
        "name": "Screen 1 - Macro XE Atmos",
        "format": "2D",
        "totalSeats": 260
      },
      {
        "id": "scr-th-cok-cinepolis-centre-square-2",
        "cinemaId": "th-cok-cinepolis-centre-square",
        "screenNumber": 2,
        "name": "Screen 2 - VIP Lounge",
        "format": "2D",
        "totalSeats": 80
      }
    ],
    "phone": "+91 484 669 8800",
    "cancellationAllowed": true,
    "active": true,
    "operatingStatus": "OPERATING",
    "source": "chain_directory",
    "sourceId": "CIN-COK-001"
  },
  {
    "id": "th-jai-raj-mandir",
    "slug": "raj-mandir-cinema-bhagwan-das-road",
    "name": "Raj Mandir Cinema: Bhagwan Das Road",
    "chain": "Independent",
    "cityId": "jaipur",
    "city": "Jaipur",
    "address": "C-16, Bhagwan Das Road, Panch Batti, C Scheme, Ashok Nagar, Jaipur - 302001",
    "area": "C Scheme",
    "latitude": 26.9156,
    "longitude": 75.8089,
    "facilities": [
      "Dolby Atmos",
      "Recliner Seats",
      "Cafeteria",
      "Parking"
    ],
    "screens": [
      {
        "id": "scr-th-jai-raj-mandir-1",
        "cinemaId": "th-jai-raj-mandir",
        "screenNumber": 1,
        "name": "The Jewel Screen - Heritage 70mm Atmos",
        "format": "2D",
        "totalSeats": 1100
      }
    ],
    "phone": "+91 141 237 4694",
    "cancellationAllowed": true,
    "active": true,
    "operatingStatus": "OPERATING",
    "source": "chain_directory",
    "sourceId": "RJM-JAI-001"
  },
  {
    "id": "th-jai-inox-crystal-palm",
    "slug": "inox-crystal-palm-mall-bais-godam",
    "name": "PVR INOX: Crystal Palm Mall, Bais Godam",
    "chain": "PVR INOX",
    "cityId": "jaipur",
    "city": "Jaipur",
    "address": "4th Floor, Crystal Palm Mall, Sahakar Marg, Bais Godam Circle, Jaipur - 302001",
    "area": "Sahakar Marg",
    "latitude": 26.9021,
    "longitude": 75.7933,
    "facilities": [
      "Dolby Atmos",
      "Recliner Seats",
      "Wheelchair Accessible",
      "Valet Parking"
    ],
    "screens": [
      {
        "id": "scr-th-jai-inox-crystal-palm-1",
        "cinemaId": "th-jai-inox-crystal-palm",
        "screenNumber": 1,
        "name": "Screen 1 - Atmos Premier",
        "format": "2D",
        "totalSeats": 210
      },
      {
        "id": "scr-th-jai-inox-crystal-palm-2",
        "cinemaId": "th-jai-inox-crystal-palm",
        "screenNumber": 2,
        "name": "Screen 2 - RealD 3D",
        "format": "3D",
        "totalSeats": 160
      }
    ],
    "phone": "+91 141 404 0400",
    "cancellationAllowed": true,
    "active": true,
    "operatingStatus": "OPERATING",
    "source": "chain_directory",
    "sourceId": "INOX-JAI-001"
  },
  {
    "id": "th-ixc-pvr-elante",
    "slug": "pvr-elante-mall-industrial-area",
    "name": "PVR INOX: Nexus Elante Mall",
    "chain": "PVR INOX",
    "cityId": "chandigarh",
    "city": "Chandigarh",
    "address": "3rd Floor, Nexus Elante Mall, 178-178A, Purv Marg, Industrial Area Phase I, Chandigarh - 160002",
    "area": "Industrial Area Phase I",
    "latitude": 30.7055,
    "longitude": 76.8013,
    "facilities": [
      "Dolby Atmos",
      "Recliner Seats",
      "Wheelchair Accessible",
      "Valet Parking"
    ],
    "screens": [
      {
        "id": "scr-th-ixc-pvr-elante-1",
        "cinemaId": "th-ixc-pvr-elante",
        "screenNumber": 1,
        "name": "Screen 1 - P[XL] Atmos",
        "format": "2D",
        "totalSeats": 280
      },
      {
        "id": "scr-th-ixc-pvr-elante-2",
        "cinemaId": "th-ixc-pvr-elante",
        "screenNumber": 2,
        "name": "Screen 2 - Gold Class",
        "format": "2D",
        "totalSeats": 75
      }
    ],
    "phone": "+91 172 400 3300",
    "cancellationAllowed": true,
    "active": true,
    "operatingStatus": "OPERATING",
    "source": "chain_directory",
    "sourceId": "PVR-IXC-001"
  },
  {
    "id": "th-lko-pvr-phoenix-palassio",
    "slug": "pvr-phoenix-palassio-amar-shaheed-path",
    "name": "PVR INOX: Phoenix Palassio, Gomti Nagar Extn",
    "chain": "PVR INOX",
    "cityId": "lucknow",
    "city": "Lucknow",
    "address": "Sector 7, Amar Shaheed Path, Gomti Nagar Extension, Lucknow - 226010",
    "area": "Gomti Nagar Extension",
    "latitude": 26.8028,
    "longitude": 81.0118,
    "facilities": [
      "IMAX with Laser",
      "Dolby Atmos",
      "Recliner Seats",
      "Wheelchair Accessible",
      "Valet Parking"
    ],
    "screens": [
      {
        "id": "scr-th-lko-pvr-phoenix-palassio-1",
        "cinemaId": "th-lko-pvr-phoenix-palassio",
        "screenNumber": 1,
        "name": "Screen 1 - IMAX Laser",
        "format": "IMAX 2D",
        "totalSeats": 310
      },
      {
        "id": "scr-th-lko-pvr-phoenix-palassio-2",
        "cinemaId": "th-lko-pvr-phoenix-palassio",
        "screenNumber": 2,
        "name": "Screen 2 - Luxe Atmos",
        "format": "2D",
        "totalSeats": 85
      }
    ],
    "phone": "+91 522 678 8000",
    "cancellationAllowed": true,
    "active": true,
    "operatingStatus": "OPERATING",
    "source": "chain_directory",
    "sourceId": "PVR-LKO-001"
  },
  {
    "id": "th-idr-inox-c21",
    "slug": "inox-c21-mall-vijay-nagar",
    "name": "PVR INOX: C21 Mall, Vijay Nagar",
    "chain": "PVR INOX",
    "cityId": "indore",
    "city": "Indore",
    "address": "Plot No. 136/1, C21 Mall, AB Road, Vijay Nagar, Indore - 452010",
    "area": "Vijay Nagar",
    "latitude": 22.7533,
    "longitude": 75.8937,
    "facilities": [
      "Dolby Atmos",
      "Recliner Seats",
      "Wheelchair Accessible",
      "Valet Parking"
    ],
    "screens": [
      {
        "id": "scr-th-idr-inox-c21-1",
        "cinemaId": "th-idr-inox-c21",
        "screenNumber": 1,
        "name": "Screen 1 - Atmos Premier",
        "format": "2D",
        "totalSeats": 230
      },
      {
        "id": "scr-th-idr-inox-c21-2",
        "cinemaId": "th-idr-inox-c21",
        "screenNumber": 2,
        "name": "Screen 2 - RealD 3D",
        "format": "3D",
        "totalSeats": 180
      }
    ],
    "phone": "+91 731 426 6666",
    "cancellationAllowed": true,
    "active": true,
    "operatingStatus": "OPERATING",
    "source": "chain_directory",
    "sourceId": "INOX-IDR-001"
  },
  {
    "id": "th-stv-pvr-vr-surat",
    "slug": "pvr-vr-surat-duplas",
    "name": "PVR INOX: VR Surat, Dumas Road",
    "chain": "PVR INOX",
    "cityId": "surat",
    "city": "Surat",
    "address": "VR Surat Mall, Dumas Road, Magdalla, Surat - 395007",
    "area": "Dumas Road",
    "latitude": 21.1442,
    "longitude": 72.7482,
    "facilities": [
      "Dolby Atmos",
      "Recliner Seats",
      "Wheelchair Accessible",
      "Valet Parking"
    ],
    "screens": [
      {
        "id": "scr-th-stv-pvr-vr-surat-1",
        "cinemaId": "th-stv-pvr-vr-surat",
        "screenNumber": 1,
        "name": "Screen 1 - Atmos Laser",
        "format": "2D",
        "totalSeats": 250
      },
      {
        "id": "scr-th-stv-pvr-vr-surat-2",
        "cinemaId": "th-stv-pvr-vr-surat",
        "screenNumber": 2,
        "name": "Screen 2 - RealD 3D",
        "format": "3D",
        "totalSeats": 170
      }
    ],
    "phone": "+91 261 671 1100",
    "cancellationAllowed": true,
    "active": true,
    "operatingStatus": "OPERATING",
    "source": "chain_directory",
    "sourceId": "PVR-STV-001"
  },
  {
    "id": "th-cjb-broadway-cinemas",
    "slug": "broadway-cinemas-avinaashi-road",
    "name": "Broadway Cinemas: KMCH Campus, Avinashi Road",
    "chain": "Broadway",
    "cityId": "coimbatore",
    "city": "Coimbatore",
    "address": "Avinashi Road, Civil Aerodrome Post, Peelamedu, Coimbatore - 641014",
    "area": "Peelamedu",
    "latitude": 11.0418,
    "longitude": 77.0373,
    "facilities": [
      "IMAX with Laser",
      "Dolby Atmos",
      "Recliner Seats",
      "Valet Parking"
    ],
    "screens": [
      {
        "id": "scr-th-cjb-broadway-cinemas-1",
        "cinemaId": "th-cjb-broadway-cinemas",
        "screenNumber": 1,
        "name": "EPIQ - Barco Laser Atmos",
        "format": "2D",
        "totalSeats": 390
      },
      {
        "id": "scr-th-cjb-broadway-cinemas-2",
        "cinemaId": "th-cjb-broadway-cinemas",
        "screenNumber": 2,
        "name": "Screen 2 - IMAX with Laser",
        "format": "IMAX 2D",
        "totalSeats": 310
      }
    ],
    "phone": "+91 422 456 7890",
    "cancellationAllowed": true,
    "active": true,
    "operatingStatus": "OPERATING",
    "source": "chain_directory",
    "sourceId": "BW-CJB-001"
  },
  {
    "id": "th-myq-drc-cinemas",
    "slug": "drc-cinemas-bm-habitat-mall-jayalakshmipuram",
    "name": "DRC Cinemas: BM Habitat Mall, Jayalakshmipuram",
    "chain": "DRC",
    "cityId": "mysuru",
    "city": "Mysuru",
    "address": "BM Habitat Mall, Gokulam Main Road, Jayalakshmipuram, Mysuru - 570012",
    "area": "Jayalakshmipuram",
    "latitude": 12.3271,
    "longitude": 76.6267,
    "facilities": [
      "Dolby Atmos",
      "4K RGB Laser Projection",
      "Parking"
    ],
    "screens": [
      {
        "id": "scr-th-myq-drc-cinemas-1",
        "cinemaId": "th-myq-drc-cinemas",
        "screenNumber": 1,
        "name": "Screen 1 - 4K Atmos",
        "format": "2D",
        "totalSeats": 240
      },
      {
        "id": "scr-th-myq-drc-cinemas-2",
        "cinemaId": "th-myq-drc-cinemas",
        "screenNumber": 2,
        "name": "Screen 2 - RealD 3D",
        "format": "3D",
        "totalSeats": 190
      }
    ],
    "phone": "+91 821 424 2424",
    "cancellationAllowed": true,
    "active": true,
    "operatingStatus": "OPERATING",
    "source": "chain_directory",
    "sourceId": "DRC-MYQ-001"
  },
  {
    "id": "th-bdq-inox-inorbit",
    "slug": "inox-inorbit-mall-alembic-road",
    "name": "PVR INOX: Inorbit Mall, Gorwa",
    "chain": "PVR INOX",
    "cityId": "vadodara",
    "city": "Vadodara",
    "address": "Alembic Road, Subhanpura, Gorwa, Vadodara - 390023",
    "area": "Gorwa",
    "latitude": 22.3278,
    "longitude": 73.1678,
    "facilities": [
      "Dolby Atmos",
      "Recliner Seats",
      "Wheelchair Accessible",
      "Valet Parking"
    ],
    "screens": [
      {
        "id": "scr-th-bdq-inox-inorbit-1",
        "cinemaId": "th-bdq-inox-inorbit",
        "screenNumber": 1,
        "name": "Screen 1 - Atmos Premier",
        "format": "2D",
        "totalSeats": 220
      },
      {
        "id": "scr-th-bdq-inox-inorbit-2",
        "cinemaId": "th-bdq-inox-inorbit",
        "screenNumber": 2,
        "name": "Screen 2 - RealD 3D",
        "format": "3D",
        "totalSeats": 160
      }
    ],
    "phone": "+91 265 670 1200",
    "cancellationAllowed": true,
    "active": true,
    "operatingStatus": "OPERATING",
    "source": "chain_directory",
    "sourceId": "INOX-BDQ-001"
  },
  {
    "id": "th-bbi-cinepolis-esplanade",
    "slug": "cinepolis-esplanade-one-mall-rasulgarh",
    "name": "Cinepolis: Esplanade One Mall, Rasulgarh",
    "chain": "Cinepolis",
    "cityId": "bhubaneswar",
    "city": "Bhubaneswar",
    "address": "Unit No 32, 721, Rasulgarh, Bhubaneswar - 751010",
    "area": "Rasulgarh",
    "latitude": 20.2921,
    "longitude": 85.8624,
    "facilities": [
      "Dolby Atmos",
      "Recliner Seats",
      "Wheelchair Accessible",
      "Valet Parking"
    ],
    "screens": [
      {
        "id": "scr-th-bbi-cinepolis-esplanade-1",
        "cinemaId": "th-bbi-cinepolis-esplanade",
        "screenNumber": 1,
        "name": "Screen 1 - Macro XE Atmos",
        "format": "2D",
        "totalSeats": 270
      },
      {
        "id": "scr-th-bbi-cinepolis-esplanade-2",
        "cinemaId": "th-bbi-cinepolis-esplanade",
        "screenNumber": 2,
        "name": "Screen 2 - VIP Lounge",
        "format": "2D",
        "totalSeats": 75
      }
    ],
    "phone": "+91 674 666 4400",
    "cancellationAllowed": true,
    "active": true,
    "operatingStatus": "OPERATING",
    "source": "chain_directory",
    "sourceId": "CIN-BBI-001"
  },
  {
    "id": "th-nag-cinepolis-vr-nagpur",
    "slug": "cinepolis-vr-mall-medical-square",
    "name": "Cinepolis: VR Nagpur, Medical Square",
    "chain": "Cinepolis",
    "cityId": "nagpur",
    "city": "Nagpur",
    "address": "Medical Square, Untkhana Road, Rambagh, Nagpur - 440009",
    "area": "Medical Square",
    "latitude": 21.1294,
    "longitude": 79.0963,
    "facilities": [
      "Dolby Atmos",
      "Recliner Seats",
      "Wheelchair Accessible",
      "Valet Parking"
    ],
    "screens": [
      {
        "id": "scr-th-nag-cinepolis-vr-nagpur-1",
        "cinemaId": "th-nag-cinepolis-vr-nagpur",
        "screenNumber": 1,
        "name": "Screen 1 - Macro XE Atmos",
        "format": "2D",
        "totalSeats": 250
      },
      {
        "id": "scr-th-nag-cinepolis-vr-nagpur-2",
        "cinemaId": "th-nag-cinepolis-vr-nagpur",
        "screenNumber": 2,
        "name": "Screen 2 - RealD 3D",
        "format": "3D",
        "totalSeats": 180
      }
    ],
    "phone": "+91 712 666 5500",
    "cancellationAllowed": true,
    "active": true,
    "operatingStatus": "OPERATING",
    "source": "chain_directory",
    "sourceId": "CIN-NAG-001"
  },
  {
    "id": "th-pat-cinepolis-p&m",
    "slug": "cinepolis-p-and-m-mall-patliputra",
    "name": "Cinepolis: P&M Mall, Patliputra",
    "chain": "Cinepolis",
    "cityId": "patna",
    "city": "Patna",
    "address": "P&M Mall, Industrial Area, Patliputra Colony, Patna - 800013",
    "area": "Patliputra Colony",
    "latitude": 25.6315,
    "longitude": 85.1095,
    "facilities": [
      "Dolby Atmos",
      "Recliner Seats",
      "Wheelchair Accessible",
      "Valet Parking"
    ],
    "screens": [
      {
        "id": "scr-th-pat-cinepolis-p&m-1",
        "cinemaId": "th-pat-cinepolis-p&m",
        "screenNumber": 1,
        "name": "Screen 1 - Atmos Premier",
        "format": "2D",
        "totalSeats": 260
      },
      {
        "id": "scr-th-pat-cinepolis-p&m-2",
        "cinemaId": "th-pat-cinepolis-p&m",
        "screenNumber": 2,
        "name": "Screen 2 - RealD 3D",
        "format": "3D",
        "totalSeats": 190
      }
    ],
    "phone": "+91 612 227 0000",
    "cancellationAllowed": true,
    "active": true,
    "operatingStatus": "OPERATING",
    "source": "chain_directory",
    "sourceId": "CIN-PAT-001"
  },
  {
    "id": "th-trv-pvr-lulu-trivandrum",
    "slug": "pvr-lulu-mall-akkulam-trivandrum",
    "name": "PVR INOX: LuLu Mall, Akkulam",
    "chain": "PVR INOX",
    "cityId": "thiruvananthapuram",
    "city": "Thiruvananthapuram",
    "address": "LuLu Mall, NH 66, Akkulam, Thiruvananthapuram - 695029",
    "area": "Akkulam",
    "latitude": 8.5284,
    "longitude": 76.9042,
    "facilities": [
      "IMAX with Laser",
      "Dolby Atmos",
      "Recliner Seats",
      "Wheelchair Accessible",
      "Valet Parking"
    ],
    "screens": [
      {
        "id": "scr-th-trv-pvr-lulu-trivandrum-1",
        "cinemaId": "th-trv-pvr-lulu-trivandrum",
        "screenNumber": 1,
        "name": "Screen 1 - IMAX Laser",
        "format": "IMAX 2D",
        "totalSeats": 310
      },
      {
        "id": "scr-th-trv-pvr-lulu-trivandrum-2",
        "cinemaId": "th-trv-pvr-lulu-trivandrum",
        "screenNumber": 2,
        "name": "Screen 2 - P[XL] Atmos",
        "format": "2D",
        "totalSeats": 260
      }
    ],
    "phone": "+91 471 277 8800",
    "cancellationAllowed": true,
    "active": true,
    "operatingStatus": "OPERATING",
    "source": "chain_directory",
    "sourceId": "PVR-TRV-001"
  },
  {
    "id": "th-vt-inox-varun-beach",
    "slug": "inox-varun-beach-beach-road",
    "name": "PVR INOX: Varun Beach, Beach Road",
    "chain": "PVR INOX",
    "cityId": "visakhapatnam",
    "city": "Visakhapatnam",
    "address": "Dr NTR Beach Road, Pandurangapuram, Visakhapatnam - 530002",
    "area": "Beach Road",
    "latitude": 17.7128,
    "longitude": 83.3197,
    "facilities": [
      "Dolby Atmos",
      "Recliner Seats",
      "Wheelchair Accessible",
      "Valet Parking"
    ],
    "screens": [
      {
        "id": "scr-th-vt-inox-varun-beach-1",
        "cinemaId": "th-vt-inox-varun-beach",
        "screenNumber": 1,
        "name": "Screen 1 - Atmos Premier",
        "format": "2D",
        "totalSeats": 240
      },
      {
        "id": "scr-th-vt-inox-varun-beach-2",
        "cinemaId": "th-vt-inox-varun-beach",
        "screenNumber": 2,
        "name": "Screen 2 - RealD 3D",
        "format": "3D",
        "totalSeats": 170
      }
    ],
    "phone": "+91 891 668 8800",
    "cancellationAllowed": true,
    "active": true,
    "operatingStatus": "OPERATING",
    "source": "chain_directory",
    "sourceId": "INOX-VT-001"
  },
  {
    "id": "th-gau-pvr-city-centre",
    "slug": "pvr-city-centre-mall-gs-road",
    "name": "PVR INOX: City Centre Mall, GS Road",
    "chain": "PVR INOX",
    "cityId": "guwahati",
    "city": "Guwahati",
    "address": "GS Road, Rukmini Gaon, Christian Basti, Guwahati - 781006",
    "area": "GS Road",
    "latitude": 26.1528,
    "longitude": 91.7824,
    "facilities": [
      "Dolby Atmos",
      "Recliner Seats",
      "Wheelchair Accessible",
      "Valet Parking"
    ],
    "screens": [
      {
        "id": "scr-th-gau-pvr-city-centre-1",
        "cinemaId": "th-gau-pvr-city-centre",
        "screenNumber": 1,
        "name": "Screen 1 - Atmos Premier",
        "format": "2D",
        "totalSeats": 230
      },
      {
        "id": "scr-th-gau-pvr-city-centre-2",
        "cinemaId": "th-gau-pvr-city-centre",
        "screenNumber": 2,
        "name": "Screen 2 - RealD 3D",
        "format": "3D",
        "totalSeats": 160
      }
    ],
    "phone": "+91 361 222 9900",
    "cancellationAllowed": true,
    "active": true,
    "operatingStatus": "OPERATING",
    "source": "chain_directory",
    "sourceId": "PVR-GAU-001"
  },
  {
    "id": "th-osm-456039716",
    "slug": "sampige-theatre-456039716",
    "name": "Sampige Theatre",
    "chain": "Independent",
    "cityId": "bengaluru",
    "city": "Bengaluru",
    "address": "Sampige Road, Bengaluru",
    "area": "Bengaluru",
    "latitude": 12.9931208,
    "longitude": 77.5710734,
    "facilities": [
      "Dolby Atmos",
      "Food & Beverage Counter",
      "Parking"
    ],
    "screens": [
      {
        "id": "scr-th-osm-456039716-1",
        "cinemaId": "th-osm-456039716",
        "screenNumber": 1,
        "name": "Screen 1 - Digital Audio",
        "format": "2D",
        "totalSeats": 250
      }
    ],
    "cancellationAllowed": true,
    "active": true,
    "operatingStatus": "OPERATING",
    "source": "osm",
    "sourceId": "osm-456039716"
  },
  {
    "id": "th-osm-953674808",
    "slug": "eeshwari-theatre-953674808",
    "name": "Eeshwari Theatre",
    "chain": "Independent",
    "cityId": "bengaluru",
    "city": "Bengaluru",
    "address": "Outer Ring Road, Bengaluru",
    "area": "Bengaluru",
    "latitude": 12.9236391,
    "longitude": 77.5534075,
    "facilities": [
      "Dolby Atmos",
      "Food & Beverage Counter",
      "Parking"
    ],
    "screens": [
      {
        "id": "scr-th-osm-953674808-1",
        "cinemaId": "th-osm-953674808",
        "screenNumber": 1,
        "name": "Screen 1 - Digital Audio",
        "format": "2D",
        "totalSeats": 250
      }
    ],
    "cancellationAllowed": true,
    "active": true,
    "operatingStatus": "OPERATING",
    "source": "osm",
    "sourceId": "osm-953674808"
  },
  {
    "id": "th-osm-1060580206",
    "slug": "super-talkies-1060580206",
    "name": "Super talkies",
    "chain": "Independent",
    "cityId": "bengaluru",
    "city": "Bengaluru",
    "address": "Bengaluru",
    "area": "Bengaluru",
    "latitude": 12.9677686,
    "longitude": 77.569887,
    "facilities": [
      "Dolby Atmos",
      "Food & Beverage Counter",
      "Parking"
    ],
    "screens": [
      {
        "id": "scr-th-osm-1060580206-1",
        "cinemaId": "th-osm-1060580206",
        "screenNumber": 1,
        "name": "Screen 1 - Digital Audio",
        "format": "2D",
        "totalSeats": 250
      }
    ],
    "cancellationAllowed": true,
    "active": true,
    "operatingStatus": "OPERATING",
    "source": "osm",
    "sourceId": "osm-1060580206"
  },
  {
    "id": "th-osm-1065137172",
    "slug": "inox-garuda-mall-1065137172",
    "name": "INOX Garuda Mall",
    "chain": "INOX Leisure",
    "cityId": "bengaluru",
    "city": "Bengaluru",
    "address": "Commissariat Road, Bengaluru",
    "area": "Bengaluru",
    "latitude": 12.9698334,
    "longitude": 77.6098091,
    "facilities": [
      "Dolby Atmos",
      "Food & Beverage Counter",
      "Parking"
    ],
    "screens": [
      {
        "id": "scr-th-osm-1065137172-1",
        "cinemaId": "th-osm-1065137172",
        "screenNumber": 1,
        "name": "Screen 1 - Digital Audio",
        "format": "2D",
        "totalSeats": 250
      }
    ],
    "cancellationAllowed": true,
    "active": true,
    "operatingStatus": "OPERATING",
    "source": "osm",
    "sourceId": "osm-1065137172"
  },
  {
    "id": "th-osm-1459472858",
    "slug": "pvr-1459472858",
    "name": "PVR",
    "chain": "PVR Cinemas",
    "cityId": "bengaluru",
    "city": "Bengaluru",
    "address": "Hosur Road, Bangalore",
    "area": "Bengaluru",
    "latitude": 12.9346877,
    "longitude": 77.6116748,
    "facilities": [
      "Dolby Atmos",
      "Food & Beverage Counter",
      "Parking"
    ],
    "screens": [
      {
        "id": "scr-th-osm-1459472858-1",
        "cinemaId": "th-osm-1459472858",
        "screenNumber": 1,
        "name": "Screen 1 - Digital Audio",
        "format": "2D",
        "totalSeats": 250
      }
    ],
    "cancellationAllowed": true,
    "active": true,
    "operatingStatus": "OPERATING",
    "source": "osm",
    "sourceId": "osm-1459472858"
  },
  {
    "id": "th-osm-1463547493",
    "slug": "gopalan-cinemas-1463547493",
    "name": "Gopalan Cinemas",
    "chain": "Independent",
    "cityId": "bengaluru",
    "city": "Bengaluru",
    "address": "Mysore Road, Bangalore",
    "area": "Bengaluru",
    "latitude": 12.9357964,
    "longitude": 77.5177929,
    "facilities": [
      "Dolby Atmos",
      "Food & Beverage Counter",
      "Parking"
    ],
    "screens": [
      {
        "id": "scr-th-osm-1463547493-1",
        "cinemaId": "th-osm-1463547493",
        "screenNumber": 1,
        "name": "Screen 1 - Digital Audio",
        "format": "2D",
        "totalSeats": 250
      }
    ],
    "cancellationAllowed": true,
    "active": true,
    "operatingStatus": "OPERATING",
    "source": "osm",
    "sourceId": "osm-1463547493"
  },
  {
    "id": "th-osm-1463592177",
    "slug": "vaishnavi-1463592177",
    "name": "Vaishnavi",
    "chain": "Independent",
    "cityId": "bengaluru",
    "city": "Bengaluru",
    "address": "Bengaluru",
    "area": "Bengaluru",
    "latitude": 12.903508,
    "longitude": 77.5442237,
    "facilities": [
      "Dolby Atmos",
      "Food & Beverage Counter",
      "Parking"
    ],
    "screens": [
      {
        "id": "scr-th-osm-1463592177-1",
        "cinemaId": "th-osm-1463592177",
        "screenNumber": 1,
        "name": "Screen 1 - Digital Audio",
        "format": "2D",
        "totalSeats": 250
      }
    ],
    "cancellationAllowed": true,
    "active": true,
    "operatingStatus": "OPERATING",
    "source": "osm",
    "sourceId": "osm-1463592177"
  },
  {
    "id": "th-osm-1463771768",
    "slug": "inox-1463771768",
    "name": "Inox",
    "chain": "INOX Leisure",
    "cityId": "bengaluru",
    "city": "Bengaluru",
    "address": "Bengaluru",
    "area": "Bengaluru",
    "latitude": 12.9162428,
    "longitude": 77.592424,
    "facilities": [
      "Dolby Atmos",
      "Food & Beverage Counter",
      "Parking"
    ],
    "screens": [
      {
        "id": "scr-th-osm-1463771768-1",
        "cinemaId": "th-osm-1463771768",
        "screenNumber": 1,
        "name": "Screen 1 - Digital Audio",
        "format": "2D",
        "totalSeats": 250
      }
    ],
    "cancellationAllowed": true,
    "active": true,
    "operatingStatus": "OPERATING",
    "source": "osm",
    "sourceId": "osm-1463771768"
  },
  {
    "id": "th-osm-1464782423",
    "slug": "prakash-theatre-1464782423",
    "name": "Prakash Theatre",
    "chain": "Independent",
    "cityId": "bengaluru",
    "city": "Bengaluru",
    "address": "Bengaluru",
    "area": "Bengaluru",
    "latitude": 13.0968515,
    "longitude": 77.5964304,
    "facilities": [
      "Dolby Atmos",
      "Food & Beverage Counter",
      "Parking"
    ],
    "screens": [
      {
        "id": "scr-th-osm-1464782423-1",
        "cinemaId": "th-osm-1464782423",
        "screenNumber": 1,
        "name": "Screen 1 - Digital Audio",
        "format": "2D",
        "totalSeats": 250
      }
    ],
    "cancellationAllowed": true,
    "active": true,
    "operatingStatus": "OPERATING",
    "source": "osm",
    "sourceId": "osm-1464782423"
  },
  {
    "id": "th-osm-1469265737",
    "slug": "elgin-cinema-1469265737",
    "name": "Elgin Cinema",
    "chain": "Independent",
    "cityId": "bengaluru",
    "city": "Bengaluru",
    "address": "Bengaluru",
    "area": "Bengaluru",
    "latitude": 12.98516,
    "longitude": 77.6016342,
    "facilities": [
      "Dolby Atmos",
      "Food & Beverage Counter",
      "Parking"
    ],
    "screens": [
      {
        "id": "scr-th-osm-1469265737-1",
        "cinemaId": "th-osm-1469265737",
        "screenNumber": 1,
        "name": "Screen 1 - Digital Audio",
        "format": "2D",
        "totalSeats": 250
      }
    ],
    "cancellationAllowed": true,
    "active": true,
    "operatingStatus": "OPERATING",
    "source": "osm",
    "sourceId": "osm-1469265737"
  },
  {
    "id": "th-osm-1474863994",
    "slug": "mukunda-theatre-1474863994",
    "name": "Mukunda Theatre",
    "chain": "Independent",
    "cityId": "bengaluru",
    "city": "Bengaluru",
    "address": "Bengaluru",
    "area": "Bengaluru",
    "latitude": 13.0032065,
    "longitude": 77.6358178,
    "facilities": [
      "Dolby Atmos",
      "Food & Beverage Counter",
      "Parking"
    ],
    "screens": [
      {
        "id": "scr-th-osm-1474863994-1",
        "cinemaId": "th-osm-1474863994",
        "screenNumber": 1,
        "name": "Screen 1 - Digital Audio",
        "format": "2D",
        "totalSeats": 250
      }
    ],
    "cancellationAllowed": true,
    "active": true,
    "operatingStatus": "OPERATING",
    "source": "osm",
    "sourceId": "osm-1474863994"
  },
  {
    "id": "th-osm-1691980738",
    "slug": "pvr-cinemas-1691980738",
    "name": "PVR Cinemas",
    "chain": "PVR Cinemas",
    "cityId": "bengaluru",
    "city": "Bengaluru",
    "address": "Bengaluru",
    "area": "Bengaluru",
    "latitude": 12.9263148,
    "longitude": 77.6753554,
    "facilities": [
      "Dolby Atmos",
      "Food & Beverage Counter",
      "Parking"
    ],
    "screens": [
      {
        "id": "scr-th-osm-1691980738-1",
        "cinemaId": "th-osm-1691980738",
        "screenNumber": 1,
        "name": "Screen 1 - Digital Audio",
        "format": "2D",
        "totalSeats": 250
      }
    ],
    "cancellationAllowed": true,
    "active": true,
    "operatingStatus": "OPERATING",
    "source": "osm",
    "sourceId": "osm-1691980738"
  },
  {
    "id": "th-osm-1794163355",
    "slug": "mohan-cinema-1794163355",
    "name": "Mohan Cinema",
    "chain": "Independent",
    "cityId": "bengaluru",
    "city": "Bengaluru",
    "address": "Bengaluru",
    "area": "Bengaluru",
    "latitude": 12.9986487,
    "longitude": 77.5036725,
    "facilities": [
      "Dolby Atmos",
      "Food & Beverage Counter",
      "Parking"
    ],
    "screens": [
      {
        "id": "scr-th-osm-1794163355-1",
        "cinemaId": "th-osm-1794163355",
        "screenNumber": 1,
        "name": "Screen 1 - Digital Audio",
        "format": "2D",
        "totalSeats": 250
      }
    ],
    "cancellationAllowed": true,
    "active": true,
    "operatingStatus": "OPERATING",
    "source": "osm",
    "sourceId": "osm-1794163355"
  },
  {
    "id": "th-osm-1809856714",
    "slug": "swagath-shankarnag-chitramandira-1809856714",
    "name": "Swagath ShankarNag Chitramandira",
    "chain": "Independent",
    "cityId": "bengaluru",
    "city": "Bengaluru",
    "address": "Bengaluru",
    "area": "Bengaluru",
    "latitude": 12.9744138,
    "longitude": 77.6095784,
    "facilities": [
      "Dolby Atmos",
      "Food & Beverage Counter",
      "Parking"
    ],
    "screens": [
      {
        "id": "scr-th-osm-1809856714-1",
        "cinemaId": "th-osm-1809856714",
        "screenNumber": 1,
        "name": "Screen 1 - Digital Audio",
        "format": "2D",
        "totalSeats": 250
      }
    ],
    "cancellationAllowed": true,
    "active": true,
    "operatingStatus": "OPERATING",
    "source": "osm",
    "sourceId": "osm-1809856714"
  },
  {
    "id": "th-osm-2127406148",
    "slug": "vaibhavi-2127406148",
    "name": "Vaibhavi",
    "chain": "Independent",
    "cityId": "bengaluru",
    "city": "Bengaluru",
    "address": "Bengaluru",
    "area": "Bengaluru",
    "latitude": 12.9036309,
    "longitude": 77.5440956,
    "facilities": [
      "Dolby Atmos",
      "Food & Beverage Counter",
      "Parking"
    ],
    "screens": [
      {
        "id": "scr-th-osm-2127406148-1",
        "cinemaId": "th-osm-2127406148",
        "screenNumber": 1,
        "name": "Screen 1 - Digital Audio",
        "format": "2D",
        "totalSeats": 250
      }
    ],
    "cancellationAllowed": true,
    "active": true,
    "operatingStatus": "OPERATING",
    "source": "osm",
    "sourceId": "osm-2127406148"
  },
  {
    "id": "th-osm-2322728638",
    "slug": "cinepolis-2322728638",
    "name": "Cinepolis",
    "chain": "Cinepolis",
    "cityId": "bengaluru",
    "city": "Bengaluru",
    "address": "Bengaluru",
    "area": "Bengaluru",
    "latitude": 12.8755826,
    "longitude": 77.5952263,
    "facilities": [
      "Dolby Atmos",
      "Food & Beverage Counter",
      "Parking"
    ],
    "screens": [
      {
        "id": "scr-th-osm-2322728638-1",
        "cinemaId": "th-osm-2322728638",
        "screenNumber": 1,
        "name": "Screen 1 - Digital Audio",
        "format": "2D",
        "totalSeats": 250
      }
    ],
    "cancellationAllowed": true,
    "active": true,
    "operatingStatus": "OPERATING",
    "source": "osm",
    "sourceId": "osm-2322728638"
  },
  {
    "id": "th-osm-2489017325",
    "slug": "pvr-orion-mall-2489017325",
    "name": "PVR Orion Mall",
    "chain": "PVR Cinemas",
    "cityId": "bengaluru",
    "city": "Bengaluru",
    "address": "Dr. Rajkumar Road, Bengaluru",
    "area": "Bengaluru",
    "latitude": 13.0106061,
    "longitude": 77.555373,
    "facilities": [
      "Dolby Atmos",
      "Food & Beverage Counter",
      "Parking"
    ],
    "screens": [
      {
        "id": "scr-th-osm-2489017325-1",
        "cinemaId": "th-osm-2489017325",
        "screenNumber": 1,
        "name": "Screen 1 - Digital Audio",
        "format": "2D",
        "totalSeats": 250
      }
    ],
    "cancellationAllowed": true,
    "active": true,
    "operatingStatus": "OPERATING",
    "source": "osm",
    "sourceId": "osm-2489017325"
  },
  {
    "id": "th-osm-2623606892",
    "slug": "kamakya-theatre-2623606892",
    "name": "Kamakya Theatre",
    "chain": "Independent",
    "cityId": "bengaluru",
    "city": "Bengaluru",
    "address": "Bengaluru",
    "area": "Bengaluru",
    "latitude": 12.9233245,
    "longitude": 77.5533301,
    "facilities": [
      "Dolby Atmos",
      "Food & Beverage Counter",
      "Parking"
    ],
    "screens": [
      {
        "id": "scr-th-osm-2623606892-1",
        "cinemaId": "th-osm-2623606892",
        "screenNumber": 1,
        "name": "Screen 1 - Digital Audio",
        "format": "2D",
        "totalSeats": 250
      }
    ],
    "cancellationAllowed": true,
    "active": true,
    "operatingStatus": "OPERATING",
    "source": "osm",
    "sourceId": "osm-2623606892"
  },
  {
    "id": "th-osm-2908625171",
    "slug": "galaxy-paradise-2908625171",
    "name": "Galaxy Paradise",
    "chain": "Independent",
    "cityId": "bengaluru",
    "city": "Bengaluru",
    "address": "Bengaluru",
    "area": "Bengaluru",
    "latitude": 12.8914338,
    "longitude": 77.62642,
    "facilities": [
      "Dolby Atmos",
      "Food & Beverage Counter",
      "Parking"
    ],
    "screens": [
      {
        "id": "scr-th-osm-2908625171-1",
        "cinemaId": "th-osm-2908625171",
        "screenNumber": 1,
        "name": "Screen 1 - Digital Audio",
        "format": "2D",
        "totalSeats": 250
      }
    ],
    "cancellationAllowed": true,
    "active": true,
    "operatingStatus": "OPERATING",
    "source": "osm",
    "sourceId": "osm-2908625171"
  },
  {
    "id": "th-osm-3122059772",
    "slug": "lakshmi-tent-3122059772",
    "name": "Lakshmi Tent",
    "chain": "Independent",
    "cityId": "bengaluru",
    "city": "Bengaluru",
    "address": "Mathikere",
    "area": "Bengaluru",
    "latitude": 13.0356902,
    "longitude": 77.5634153,
    "facilities": [
      "Dolby Atmos",
      "Food & Beverage Counter",
      "Parking"
    ],
    "screens": [
      {
        "id": "scr-th-osm-3122059772-1",
        "cinemaId": "th-osm-3122059772",
        "screenNumber": 1,
        "name": "Screen 1 - Digital Audio",
        "format": "2D",
        "totalSeats": 250
      }
    ],
    "cancellationAllowed": true,
    "active": true,
    "operatingStatus": "OPERATING",
    "source": "osm",
    "sourceId": "osm-3122059772"
  },
  {
    "id": "th-osm-3664774925",
    "slug": "inox-malleshwaram-mantri-square-3664774925",
    "name": "INOX Malleshwaram - Mantri Square",
    "chain": "INOX Leisure",
    "cityId": "bengaluru",
    "city": "Bengaluru",
    "address": "Sampige Road, Bengaluru",
    "area": "Bengaluru",
    "latitude": 12.9920489,
    "longitude": 77.5706285,
    "facilities": [
      "Dolby Atmos",
      "Food & Beverage Counter",
      "Parking"
    ],
    "screens": [
      {
        "id": "scr-th-osm-3664774925-1",
        "cinemaId": "th-osm-3664774925",
        "screenNumber": 1,
        "name": "Screen 1 - Digital Audio",
        "format": "2D",
        "totalSeats": 250
      }
    ],
    "cancellationAllowed": true,
    "active": true,
    "operatingStatus": "OPERATING",
    "source": "osm",
    "sourceId": "osm-3664774925"
  },
  {
    "id": "th-osm-4101094993",
    "slug": "santhosh-talkies-4101094993",
    "name": "Santhosh Talkies",
    "chain": "Independent",
    "cityId": "bengaluru",
    "city": "Bengaluru",
    "address": "Pipeline Road, Bengaluru",
    "area": "Bengaluru",
    "latitude": 12.9630364,
    "longitude": 77.5439374,
    "facilities": [
      "Dolby Atmos",
      "Food & Beverage Counter",
      "Parking"
    ],
    "screens": [
      {
        "id": "scr-th-osm-4101094993-1",
        "cinemaId": "th-osm-4101094993",
        "screenNumber": 1,
        "name": "Screen 1 - Digital Audio",
        "format": "2D",
        "totalSeats": 250
      }
    ],
    "cancellationAllowed": true,
    "active": true,
    "operatingStatus": "OPERATING",
    "source": "osm",
    "sourceId": "osm-4101094993"
  },
  {
    "id": "th-osm-4101097391",
    "slug": "shobha-talkies-4101097391",
    "name": "Shobha Talkies",
    "chain": "Independent",
    "cityId": "bengaluru",
    "city": "Bengaluru",
    "address": "Mysore Road, Bengaluru",
    "area": "Bengaluru",
    "latitude": 12.9574488,
    "longitude": 77.5432851,
    "facilities": [
      "Dolby Atmos",
      "Food & Beverage Counter",
      "Parking"
    ],
    "screens": [
      {
        "id": "scr-th-osm-4101097391-1",
        "cinemaId": "th-osm-4101097391",
        "screenNumber": 1,
        "name": "Screen 1 - Digital Audio",
        "format": "2D",
        "totalSeats": 250
      }
    ],
    "cancellationAllowed": true,
    "active": true,
    "operatingStatus": "OPERATING",
    "source": "osm",
    "sourceId": "osm-4101097391"
  },
  {
    "id": "th-osm-4130960190",
    "slug": "cinepolis-eta-mall-4130960190",
    "name": "Cinepolis ETA Mall",
    "chain": "Cinepolis",
    "cityId": "bengaluru",
    "city": "Bengaluru",
    "address": "Tank Bund Road, Bengaluru",
    "area": "Bengaluru",
    "latitude": 12.965813,
    "longitude": 77.5622167,
    "facilities": [
      "Dolby Atmos",
      "Food & Beverage Counter",
      "Parking"
    ],
    "screens": [
      {
        "id": "scr-th-osm-4130960190-1",
        "cinemaId": "th-osm-4130960190",
        "screenNumber": 1,
        "name": "Screen 1 - Digital Audio",
        "format": "2D",
        "totalSeats": 250
      }
    ],
    "cancellationAllowed": true,
    "active": true,
    "operatingStatus": "OPERATING",
    "source": "osm",
    "sourceId": "osm-4130960190"
  },
  {
    "id": "th-osm-4130960992",
    "slug": "sujatha-talkies-4130960992",
    "name": "Sujatha Talkies",
    "chain": "Independent",
    "cityId": "bengaluru",
    "city": "Bengaluru",
    "address": "Bengaluru",
    "area": "Bengaluru",
    "latitude": 12.961869,
    "longitude": 77.5471629,
    "facilities": [
      "Dolby Atmos",
      "Food & Beverage Counter",
      "Parking"
    ],
    "screens": [
      {
        "id": "scr-th-osm-4130960992-1",
        "cinemaId": "th-osm-4130960992",
        "screenNumber": 1,
        "name": "Screen 1 - Digital Audio",
        "format": "2D",
        "totalSeats": 250
      }
    ],
    "cancellationAllowed": true,
    "active": true,
    "operatingStatus": "OPERATING",
    "source": "osm",
    "sourceId": "osm-4130960992"
  }
];
