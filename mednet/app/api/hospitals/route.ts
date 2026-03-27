import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";

export async function GET() {
  try {
    const supabase = getSupabaseClient();

    // Fetch all verified hospitals from the database
    const { data: hospitals, error } = await supabase
      .from("hospitals")
      .select("*")
      

    if (error) {
      console.error("Error fetching hospitals:", error);
      return NextResponse.json(
        { error: "Failed to fetch hospitals" },
        { status: 500 }
      );
    }

    // Transform database hospitals to match Hospital interface
 const transformedHospitals = hospitals.map((hospital) => {
  console.log("id:", hospital.id, "name:", hospital.name); // ← add this
  return {
    id: hospital.id,
    name: hospital.name,
    location: hospital.location || hospital.city || hospital.address || "Unknown location",
    distance: hospital.distance || "N/A",
    rating: hospital.rating || 4.5,
    specialties: hospital.specialties || ["General"],
    extraCount: hospital.extra_count || 0,
    fee: hospital.fee || "100",
    image: hospital.image || "/images/hospital1.jpg",
    address: hospital.address,
    city: hospital.city,
    cac: hospital.cac,
    verified: hospital.verified,
  };
});


    return NextResponse.json(transformedHospitals);
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
