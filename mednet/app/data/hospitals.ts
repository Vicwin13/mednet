export interface Hospital {
  id: number;
  name: string;
  location: string;
  distance: string;
  rating: number;
  specialties: string[];
  extraCount: number;
  fee: string;
  image: string;
}

export const hospitals: Hospital[] = [
  {
    id: 1,
    name: "St. Mary Medical Center",
    location: "Downtown Medical District",
    distance: "4.2 km",
    rating: 4.9,
    specialties: ["Cardiology", "Neurology"],
    extraCount: 3,
    fee: "120",
    image:
      "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=400&q=80",
  },
  {
    id: 2,
    name: "Lagos General Hospital",
    location: "Victoria Island, Lagos",
    distance: "7.1 km",
    rating: 4.7,
    specialties: ["Pediatrics", "Surgery"],
    extraCount: 2,
    fee: "95",
    image:
      "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&q=80",
  },
  {
    id: 3,
    name: "Eko Specialist Hospital",
    location: "Lekki Phase 1",
    distance: "9.8 km",
    rating: 4.8,
    specialties: ["Cardiology", "Neurology"],
    extraCount: 5,
    fee: "150",
    image:
      "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=400&q=80",
  },
  {
    id: 4,
    name: "HealthBridge Clinic",
    location: "Ikeja, Lagos",
    distance: "5.5 km",
    rating: 4.6,
    specialties: ["General Surgery", "Pediatrics"],
    extraCount: 1,
    fee: "80",
    image:
      "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=400&q=80",
  },
];
