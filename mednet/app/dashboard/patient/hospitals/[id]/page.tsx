"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Star, MapPin, BadgeCheck, Heart, Share2, ShieldCheck, BedDouble, Info, Wallet } from "lucide-react";
import { hospitals } from "@/app/data/hospitals";

const timeSlots: string[] = ["09:00 AM", "02:00 PM", "11:30 AM", "04:30 PM"];

export default function HospitalDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();

    const hospital = hospitals.find((h) => h.id === Number(id));

    const [selectedDate, setSelectedDate] = useState<string>("");
    const [selectedTime, setSelectedTime] = useState<string>("09:00 AM");
    const [medicalHistory, setMedicalHistory] = useState<string>("");
    const [saved, setSaved] = useState<boolean>(false);

    if (!hospital) {
        return (
            <div className="flex items-center justify-center h-96 text-gray-400">
                <p className="text-lg font-medium">Hospital not found.</p>
            </div>
        );
    }

    const consultationFee = Number(hospital.fee) * 70;
    const serviceFee = 10;
    const total = consultationFee + serviceFee;

    return (
        <div className="max-w-5xl px-8 py-8">

            {/* Hospital Header */}
            <div className="flex items-start justify-between mb-6">
                <div className="flex gap-4 items-start">
                    <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                        <img src={hospital.image} alt={hospital.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold text-gray-900">{hospital.name}</h1>
                            <BadgeCheck size={22} className="text-blue-600 fill-blue-100" />
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                            <Star size={14} className="text-yellow-400 fill-yellow-400" />
                            <span className="font-semibold text-gray-700">{hospital.rating}</span>
                            <span>(2,450 reviews)</span>
                            <span>•</span>
                            <MapPin size={13} />
                            <span>{hospital.location}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs font-bold text-green-700 bg-green-100 px-2.5 py-1 rounded-full">OPEN 24/7</span>
                            <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2.5 py-1 rounded-full">ESCROW PROTECTED</span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setSaved(!saved)}
                        className={`flex items-center gap-2 px-4 py-2 border rounded-xl text-sm font-semibold transition-colors ${saved ? "border-red-200 text-red-500 bg-red-50" : "border-gray-200 text-gray-600 hover:bg-gray-50"
                            }`}
                    >
                        <Heart size={16} className={saved ? "fill-red-500 text-red-500" : ""} />
                        {saved ? "Saved" : "Save"}
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors">
                        <Share2 size={16} />
                        Share
                    </button>
                </div>
            </div>

            {/* Step Indicator */}
            <div className="mb-6">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Step 1 of 2</p>
                <p className="text-sm text-gray-600 mt-0.5">Personalize your healthcare experience</p>
                <div className="flex gap-2 mt-2">
                    <div className="h-1.5 w-16 bg-blue-600 rounded-full" />
                    <div className="h-1.5 w-16 bg-gray-200 rounded-full" />
                </div>
            </div>

            {/* Two-column layout */}
            <div className="grid grid-cols-3 gap-6">

                {/* Left: Booking Form */}
                <div className="col-span-2 bg-white border border-gray-200 rounded-2xl p-6 flex flex-col gap-6">
                    <h2 className="text-lg font-bold text-gray-900">Request Consultation</h2>

                    {/* Date */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Preferred Date</label>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            placeholder="mm/dd/yyyy"
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                    </div>

                    {/* Time Slots */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Available Time Slots</label>
                        <div className="flex gap-3 flex-wrap">
                            {timeSlots.map((slot) => (
                                <button
                                    key={slot}
                                    onClick={() => setSelectedTime(slot)}
                                    className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${selectedTime === slot
                                        ? "bg-blue-600 text-white border-blue-600"
                                        : "border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600"
                                        }`}
                                >
                                    {slot}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Medical History */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Medical History <span className="text-gray-400 font-normal">(Optional)</span>
                        </label>
                        <textarea
                            rows={4}
                            value={medicalHistory}
                            onChange={(e) => setMedicalHistory(e.target.value)}
                            placeholder="Briefly describe your symptoms..."
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                        />
                    </div>

                    {/* Fee Breakdown */}
                    <div className="border border-gray-100 rounded-xl overflow-hidden">
                        <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
                            <span className="text-sm text-gray-500">Consultation Fee</span>
                            <span className="text-sm font-semibold text-gray-800">₦{consultationFee.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
                            <span className="text-sm text-gray-500">Service Fee</span>
                            <span className="text-sm font-semibold text-gray-800">₦{serviceFee.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center px-4 py-3 bg-gray-50">
                            <span className="text-sm font-bold text-blue-600">Total Amount</span>
                            <span className="text-sm font-bold text-blue-600">₦{total.toLocaleString()}</span>
                        </div>
                    </div>

                    {/* CTA */}
                    <button className="w-full flex items-center justify-center gap-2 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors text-sm">
                        <Wallet size={18} />
                        Confirm & proceed to payment
                    </button>
                </div>

                {/* Right: Info Panel */}
                <div className="col-span-1 flex flex-col gap-4">

                    {/* About */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <Info size={17} className="text-blue-600" />
                            <h3 className="text-sm font-bold text-gray-900">About Hospital</h3>
                        </div>
                        <p className="text-sm text-gray-500 leading-relaxed">
                            {hospital.name} is a premier multi-specialty healthcare provider with over 40 years of excellence.
                            Equipped with state-of-the-art diagnostic technology and world-renowned specialists committed to patient-centric care.
                        </p>

                        <div className="flex flex-col gap-2 mt-4">
                            <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-2.5">
                                <ShieldCheck size={18} className="text-blue-600 shrink-0" />
                                <div>
                                    <p className="text-xs text-gray-400">Accreditation</p>
                                    <p className="text-sm font-semibold text-gray-800">JCI & NABH Accredited</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-2.5">
                                <BedDouble size={18} className="text-blue-600 shrink-0" />
                                <div>
                                    <p className="text-xs text-gray-400">Capacity</p>
                                    <p className="text-sm font-semibold text-gray-800">500+ Beds Available</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Escrow Banner */}
                    <div className="bg-green-500 rounded-2xl p-5 relative overflow-hidden">
                        <div className="absolute right-3 bottom-3 opacity-10">
                            <ShieldCheck size={80} className="text-white" />
                        </div>
                        <p className="text-white font-bold text-base leading-snug relative z-10">
                            Your health is secured with Escrow.
                        </p>
                        <p className="text-green-100 text-xs mt-2 leading-relaxed relative z-10">
                            Funds are only released to medical providers after your appointment is completed and verified.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}