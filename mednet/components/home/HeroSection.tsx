import { ArrowRight, CheckCircle, ChevronRight, ShieldCheck } from "lucide-react";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-[#f5f7ff] pt-16">
      <div className="absolute top-24 right-0 w-120 h-120 bg-blue-100 rounded-full opacity-40 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[320px] h-80 bg-blue-200 rounded-full opacity-30 blur-3xl pointer-events-none" />

      <div className="absolute right-12 top-1/2 -translate-y-1/2 hidden lg:grid grid-cols-2 gap-3 w-95">
        <div className="col-span-2 h-44 rounded-2xl overflow-hidden shadow-xl">
          <img
            src="/images/doctor3.png"
            alt="Doctor consultation"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="h-36 rounded-2xl overflow-hidden shadow-lg">
          <img
            src="/images/doctor2.jpg"
            alt="Medical care"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="h-36 rounded-2xl overflow-hidden shadow-lg">
          <img
            src="/images/heart.jpg"
            alt="Healthcare"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="absolute -left-12 bottom-8 bg-white rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3 border border-gray-100">
          <div className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center shrink-0">
            <CheckCircle className="text-green-600" size={18} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-900 leading-tight">Payment Secured</p>
            <p className="text-xs text-gray-400">Escrow protected</p>
          </div>
        </div>

        <div className="absolute -left-8 top-4 bg-white rounded-2xl shadow-xl px-4 py-3 border border-gray-100">
          <p className="text-xl font-extrabold text-blue-600">340+</p>
          <p className="text-xs text-gray-500 font-medium">Verified hospitals</p>
        </div>
      </div>

      <div className="relative z-10 max-w-2xl px-8 md:px-16 lg:px-24">
        <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold px-3 py-1.5 rounded-full mb-6">
          <ShieldCheck size={13} />
          Clinical-grade escrow system
        </div>

        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-[1.08] tracking-tight mb-6">
          The Future of
          <br />
          Secure{" "}
          <span className="text-blue-600">Consultations.</span>
        </h1>

        <p className="text-lg text-gray-500 leading-relaxed mb-10 max-w-md">
          MedNet provides a clinical-grade escrow system ensuring financial transparency
          between patients and verified medical institutions globally.
        </p>

        <div className="flex items-center gap-4 flex-wrap">
          <Link
            href="/auth"
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg text-sm"
          >
            Get started
            <ArrowRight size={16} />
          </Link>
          <Link
            href="/auth"
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-white border border-gray-200 hover:border-blue-300 text-gray-700 font-semibold rounded-xl transition-all text-sm shadow-sm"
          >
            Log in
            <ChevronRight size={16} />
          </Link>
        </div>

        <p className="mt-6 text-xs text-gray-400">
          By proceeding, you agree to our{" "}
          <a href="#" className="underline hover:text-gray-600">Terms of Service</a> and{" "}
          <a href="#" className="underline hover:text-gray-600">Privacy Policy</a>.
          Your medical data remains confidential.
        </p>
      </div>
    </section>
  );
}