"use client";

import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Loader2,
  MapPin,
  Pencil,
  ShieldCheck,
  User,
} from "lucide-react";
import { Profile, useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";

import EditModal from "@/components/patient/EditModal";
import Image from "next/image";
import InfoRow from "@/components/patient/InfoRow";
import NINBadge from "@/components/patient/NINBadge";
import SectionCard from "@/components/patient/SectionCard";
import { formatDate } from "@/app/utils/Helpers";
import { getSupabaseClient } from "@/lib/supabase";

export default function SettingsPage() {
  const { user, profile: authProfile } = useAuth();
  const supabase = getSupabaseClient();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [ninVerifying, setNINVerifying] = useState(false);
  const [ninVerified, setNINVerified] = useState(false);

  useEffect(() => {
    if (!authProfile) return;
    setProfile(authProfile);
    setNINVerified(authProfile.verified ?? false);
    setLoading(false);
  }, [authProfile]);

  async function handleQuickVerifyNIN() {
    if (!profile || profile.role !== "patient") return;
    if (!profile.nin || !profile.firstname || !profile.lastname) return;

    setNINVerifying(true);
    try {
      const res = await fetch("/api/nin-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: profile.firstname,
          lastName: profile.lastname,
          nin: profile.nin,
        }),
      });

      if (res.ok) {
        await supabase
          .from("profiles")
          .update({ verified: true })
          .eq("id", profile.id);
        setNINVerified(true);
        setProfile((prev) => (prev ? { ...prev, verified: true } : prev));
      }
    } finally {
      setNINVerifying(false);
    }
  }

  function handleSaved(updated: Partial<Profile>) {
    setProfile((prev) => (prev ? { ...prev, ...updated } : prev));
    if ("verified" in updated) setNINVerified(!!updated.verified);
  }

  if (loading || !profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={28} className="animate-spin text-blue-500" />
      </div>
    );
  }

  const isPatient = profile.role === "patient";
  const displayName = isPatient
    ? `${profile.firstname ?? ""} ${profile.lastname ?? ""}`.trim() || "—"
    : profile.hospitalname || "—";

  return (
    <div className="max-w-3xl px-8 py-8 flex flex-col gap-6">
      {/* Profile Header */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 relative rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center shrink-0 overflow-hidden">
            {profile.profile_image ? (
              <Image
                src={profile.profile_image}
                alt="Profile"
                fill
                className="w-full h-full object-cover"
              />
            ) : (
              <User size={32} className="text-gray-400" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                {isPatient ? "Patient Profile" : "Hospital Profile"}
              </span>
              {profile.verified && (
                <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                  <CheckCircle2 size={11} /> Verified
                </span>
              )}
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 leading-tight">
              {displayName}
            </h1>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-sm font-semibold text-gray-600 rounded-xl hover:border-blue-400 hover:text-blue-600 transition-colors"
        >
          <Pencil size={14} />
          Edit details
        </button>
      </div>

      {/* Personal / Hospital Information */}
      <SectionCard
        icon={isPatient ? <User size={18} /> : <Building2 size={18} />}
        title={isPatient ? "Personal Information" : "Hospital Information"}
      >
        {isPatient ? (
          <>
            <InfoRow label="First Name" value={profile.firstname} />
            <InfoRow label="Last Name" value={profile.lastname} />
            <InfoRow label="Email" value={user?.email} />
            <InfoRow label="Phone Number" value={profile.phone_number} />
            <InfoRow label="Date of Birth" value={formatDate(profile.dob)} />
            <NINBadge
              nin={profile.nin}
              isVerified={ninVerified}
              isVerifying={ninVerifying}
              onVerify={handleQuickVerifyNIN}
            />
          </>
        ) : (
          <>
            <InfoRow label="Hospital Name" value={profile.hospitalname} />
            <InfoRow label="Email" value={user?.email} />
            <InfoRow label="Phone Number" value={profile.phone_number} />
            <div className="col-span-2 flex gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              <AlertCircle
                size={16}
                className="text-amber-500 shrink-0 mt-0.5"
              />
              <p className="text-xs text-amber-700 leading-relaxed">
                <span className="font-semibold">CAC Verification</span> —
                Automated CAC verification is currently beyond our scope. Our
                team will manually verify your hospital registration details.
              </p>
            </div>
            {profile.verified && (
              <div className="col-span-2 flex items-center gap-2 text-xs font-bold text-green-600 bg-green-50 border border-green-200 px-3 py-2 rounded-xl w-fit">
                <ShieldCheck size={14} /> Hospital manually verified
              </div>
            )}
          </>
        )}
      </SectionCard>

      {/* Address */}
      <SectionCard icon={<MapPin size={18} />} title="Address">
        <div className="col-span-2">
          <InfoRow label="Full Address" value={profile.address} />
        </div>
      </SectionCard>

      {/* Edit Modal */}
      {showModal && (
        <EditModal
          profile={profile}
          userEmail={user?.email}
          onClose={() => setShowModal(false)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
