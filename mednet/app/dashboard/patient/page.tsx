"use client";

import { useEffect, useState } from "react";

import AuthProtected from "@/components/AuthProtected";
import FilterBar from "@/components/patient/Filterbar";
import { Hospital } from "@/app/data/hospitals";
import HospitalCard from "@/components/patient/HospitalCard";
import SearchBar from "@/components/patient/Searchbar";

export default function HospitalsPage() {
  const [activeSpecialty, setActiveSpecialty] = useState("All");
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/hospitals");
        if (!response.ok) {
          throw new Error("Failed to fetch hospitals");
        }
        const data = await response.json();
        console.log("Fetched Hospitals:", data);
        setHospitals(data);
      } catch (error) {
        console.error("Error fetching hospitals:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHospitals();
  }, []);

  const filtered =
    activeSpecialty === "All"
      ? hospitals
      : hospitals.filter((h) =>
          h.specialties.some(
            (s) => s.toLowerCase() === activeSpecialty.toLowerCase(),
          ),
        );

  return (
    <AuthProtected allowedRoles={["patient"]} redirectTo="">
      <div className="max-w-4xl px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Verified Hospitals
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Connect with top-rated medical facilities and book appointments with
            secured escrow payments.
          </p>
        </div>

        <div className="mb-5">
          <SearchBar />
        </div>

        <div className="mb-6">
          <FilterBar
            activeSpecialty={activeSpecialty}
            onSpecialtyChange={setActiveSpecialty}
          />
        </div>

        <div className="flex flex-col gap-4">
          {loading ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-lg font-medium">Loading hospitals...</p>
            </div>
          ) : filtered.length > 0 ? (
            filtered.map((hospital) => (
              <HospitalCard key={hospital.id} hospital={hospital} />
            ))
          ) : (
            <div className="text-center py-16 text-gray-400">
              <p className="text-lg font-medium">No hospitals found</p>
              <p className="text-sm mt-1">Try a different specialty filter</p>
            </div>
          )}
        </div>
      </div>
    </AuthProtected>
  );
}
