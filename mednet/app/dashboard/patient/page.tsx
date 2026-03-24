"use client";
import { useState } from "react";
import FilterBar from "@/components/patient/Filterbar";
import HospitalCard, { Hospital } from "@/components/patient/HospitalCard";
import SearchBar from "@/components/patient/Searchbar";

const hospitals: Hospital[] = [
    {
        id: 1,
        name: "St. Mary Medical Center",
        location: "Downtown Medical District",
        distance: "4.2 km",
        rating: 4.9,
        specialties: ["Cardiology", "Neurology"],
        extraCount: 3,
        fee: "120",
        image: "/images/hospital1.jpg",
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
        image: "/images/hospital2.jpg",
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
        image: "/images/hospital3.jpg",
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
        image: "/images/hospital4.jpg",
    },
];

export default function HospitalsPage() {
    const [activeSpecialty, setActiveSpecialty] = useState("All");

    const filtered: Hospital[] =
        activeSpecialty === "All"
            ? hospitals
            : hospitals.filter((h) =>
                h.specialties.some((s) => s.toLowerCase() === activeSpecialty.toLowerCase())
            );

    return (
        <div className="max-w-4xl px-8 py-8">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Verified Hospitals</h1>
                <p className="text-sm text-gray-500 mt-1">
                    Connect with top-rated medical facilities and book appointments with secured escrow payments.
                </p>
            </div>

            <div className="mb-5">
                <SearchBar />
            </div>

            <div className="mb-6">
                <FilterBar activeSpecialty={activeSpecialty} onSpecialtyChange={setActiveSpecialty} />
            </div>

            <div className="flex flex-col gap-4">
                {filtered.length > 0 ? (
                    filtered.map((hospital) => <HospitalCard key={hospital.id} hospital={hospital} />)
                ) : (
                    <div className="text-center py-16 text-gray-400">
                        <p className="text-lg font-medium">No hospitals found</p>
                        <p className="text-sm mt-1">Try a different specialty filter</p>
                    </div>
                )}
            </div>
        </div>
    );
}