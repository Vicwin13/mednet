"use client";

import { useState } from "react";
import { X, Loader2, AlertCircle } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase";
import { Profile } from "@/context/AuthContext";
import FormField from "./FormField";
import NINField, {NINStatus} from "./NINField";
interface EditModalProps {
    profile: Profile;
    userEmail: string | null | undefined;
    onClose: () => void;
    onSaved: (updated: Partial<Profile>) => void;
}

interface EditFormData {
    firstname: string;
    lastname: string;
    hospitalname: string;
    phone_number: string;
    dob: string;
    address: string;
    nin: string;
}

export default function EditModal({
    profile,
    userEmail,
    onClose,
    onSaved,
}: EditModalProps) {
    const supabase = getSupabaseClient();
    const isPatient = profile.role === "patient";

    const [form, setForm] = useState<EditFormData>({
        firstname: profile.firstname ?? "",
        lastname: profile.lastname ?? "",
        hospitalname: profile.hospitalname ?? "",
        phone_number: profile.phone_number ?? "",
        dob: profile.dob ?? "",
        address: profile.address ?? "",
        nin: profile.nin ? String(profile.nin) : "",
    });

    const [ninStatus, setNINStatus] = useState<NINStatus>(
        profile.verified && profile.nin ? "verified" : "unverified"
    );
    const [ninError, setNINError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    function handleChange(field: keyof EditFormData, value: string) {
        setForm((prev) => ({ ...prev, [field]: value }));
        // Reset NIN status if the NIN itself changes
        if (field === "nin") {
            setNINStatus("unverified");
            setNINError(null);
        }
    }

    async function verifyNIN() {
        if (!form.nin || !form.firstname || !form.lastname) {
            setNINError("First name, last name and NIN are all required for verification.");
            return;
        }
        setNINStatus("verifying");
        setNINError(null);
        try {
            const res = await fetch(
                "https://api-marketplace-routing.k8.isw.la/marketplace-routing/api/v1/verify/identity/nin",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${process.env.NEXT_PUBLIC_ISW_TOKEN}`,
                    },
                    body: JSON.stringify({
                        firstName: form.firstname,
                        lastName: form.lastname,
                        nin: form.nin,
                    }),
                }
            );

            if (res.ok) {
                setNINStatus("verified");
            } else {
                setNINStatus("failed");
                setNINError("NIN could not be verified. Please check the number and try again.");
            }
        } catch {
            setNINStatus("failed");
            setNINError("Verification failed. Please check your connection.");
        }
    }

    async function handleSave() {
        setSaving(true);
        setSaveError(null);

        // Build update payload based on role — shared fields first
        const updates: Partial<Profile> = {
            phone_number: form.phone_number || null,
            address: form.address || null,
        };

        if (isPatient) {
            updates.firstname = form.firstname || null;
            updates.lastname = form.lastname || null;
            updates.dob = form.dob || null;
            updates.nin = form.nin ? Number(form.nin) : null;
            updates.verified = ninStatus === "verified";
        } else {
            updates.hospitalname = form.hospitalname || null;
        }

        const { error } = await supabase
            .from("profiles")
            .update(updates)
            .eq("id", profile.id);

        if (error) {
            setSaveError("Failed to save changes. Please try again.");
            setSaving(false);
            return;
        }

        onSaved(updates);
        setSaving(false);
        onClose();
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h3 className="text-base font-bold text-gray-900">Edit Profile Details</h3>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <X size={18} className="text-gray-500" />
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5 grid grid-cols-2 gap-4">
                    {isPatient ? (
                        <>
                            <FormField
                                label="First Name"
                                value={form.firstname}
                                onChange={(v) => handleChange("firstname", v)}
                            />
                            <FormField
                                label="Last Name"
                                value={form.lastname}
                                onChange={(v) => handleChange("lastname", v)}
                            />
                            <FormField
                                label="Email"
                                value={userEmail ?? ""}
                                onChange={() => { }}
                                type="email"
                                disabled
                            />
                            <FormField
                                label="Phone Number"
                                value={form.phone_number}
                                onChange={(v) => handleChange("phone_number", v)}
                                type="tel"
                            />
                            <FormField
                                label="Date of Birth"
                                value={form.dob}
                                onChange={(v) => handleChange("dob", v)}
                                type="date"
                            />
                            <FormField
                                label="Address"
                                value={form.address}
                                onChange={(v) => handleChange("address", v)}
                            />
                            <NINField
                                value={form.nin}
                                onChange={(v) => handleChange("nin", v)}
                                status={ninStatus}
                                error={ninError}
                                onVerify={verifyNIN}
                            />
                        </>
                    ) : (
                        <>
                            <div className="col-span-2">
                                <FormField
                                    label="Hospital Name"
                                    value={form.hospitalname}
                                    onChange={(v) => handleChange("hospitalname", v)}
                                />
                            </div>
                            <FormField
                                label="Email"
                                value={userEmail ?? ""}
                                onChange={() => { }}
                                type="email"
                                disabled
                            />
                            <FormField
                                label="Phone Number"
                                value={form.phone_number}
                                onChange={(v) => handleChange("phone_number", v)}
                                type="tel"
                            />
                            <div className="col-span-2">
                                <FormField
                                    label="Address"
                                    value={form.address}
                                    onChange={(v) => handleChange("address", v)}
                                />
                            </div>

                            {/* CAC notice */}
                            <div className="col-span-2 flex gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                                <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                                <p className="text-xs text-amber-700 leading-relaxed">
                                    <span className="font-semibold">CAC Verification</span> — Automated CAC
                                    verification for hospitals is currently beyond our scope. Our team will
                                    manually verify your registration details.
                                </p>
                            </div>
                        </>
                    )}

                    {/* Save error */}
                    {saveError && (
                        <div className="col-span-2 text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                            {saveError}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 border border-gray-200 text-sm font-semibold
              text-gray-600 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm
              font-semibold rounded-xl transition-colors flex items-center justify-center
              gap-2 disabled:opacity-60"
                    >
                        {saving ? (
                            <>
                                <Loader2 size={15} className="animate-spin" />
                                Saving...
                            </>
                        ) : (
                            "Save Changes"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}