import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getSupabaseClient();
    const { id } = await params;
    console.log("Hospital id received:", id);

    // Fetch hospital by ID from the database
    const { data: hospital, error } = await supabase
      .from("hospitals")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching hospital:", error);
      return NextResponse.json(
        { error: error.message || "Failed to fetch hospital" },
        { status: 500 }
      );
    }

    if (!hospital) {
      return NextResponse.json(
        { error: "Hospital not found" },
        { status: 404 }
      );
    }

    // Transform database hospital to match Hospital interface
    const transformedHospital = {
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

    return NextResponse.json(transformedHospital);
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
