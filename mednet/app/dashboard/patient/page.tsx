"use client";
import { useState } from "react";
import FilterBar from "@/components/patient/Filterbar";
import HospitalCard from "@/components/patient/HospitalCard";
import SearchBar from "@/components/patient/Searchbar";
import { hospitals } from "@/app/data/hospitals";

export default function HospitalsPage() {
    const [activeSpecialty, setActiveSpecialty] = useState("All");

    const filtered =
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