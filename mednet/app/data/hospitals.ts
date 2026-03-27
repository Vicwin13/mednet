export interface Hospital {
  id: string | number;
  name: string;
  location: string;
  distance: string;
  rating: number;
  specialties: string[];
  extraCount: number;
  fee: string;
  image: string;
  // Additional fields from database
  address?: string;
  city?: string;
  cac?: string;
  verified?: boolean;
}

export const hospitals: Hospital[] = [
  {
    id: "1",
    name: "St. Mary Medical Center",
    location: "Downtown Medical District",
    distance: "4.2 km",
    rating: 4.9,
    specialties: ["Cardiology", "Neurology"],
    extraCount: 3,
    fee: "120",
    image: "/images/hospital1.jpg"
  },
  {
    id: "2",
    name: "Lagos General Hospital",
    location: "Victoria Island, Lagos",
    distance: "7.1 km",
    rating: 4.7,
    specialties: ["Pediatrics", "Surgery"],
    extraCount: 2,
    fee: "95",
    image: "/images/hospital2.jpg"
  },
  {
    id: "3",
    name: "Eko Specialist Hospital",
    location: "Lekki Phase 1",
    distance: "9.8 km",
    rating: 4.8,
    specialties: ["Cardiology", "Neurology"],
    extraCount: 5,
    fee: "150",
    image: "/images/hospital3.jpg"
  },
  {
    id: "4",
    name: "HealthBridge Clinic",
    location: "Ikeja, Lagos",
    distance: "5.5 km",
    rating: 4.6,
    specialties: ["General Surgery", "Pediatrics"],
    extraCount: 1,
    fee: "80",
    image: "/images/hospital4.jpg"
  },
];
