import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function CTASection() {
    return (
        <section className="py-20 bg-blue-600">
            <div className="max-w-2xl mx-auto px-8 text-center">
                <h2 className="text-4xl font-extrabold text-white tracking-tight mb-4">
                    Ready to take control of your healthcare?
                </h2>
                <p className="text-blue-200 mb-8 text-base">
                    Join thousands of Nigerians who book verified consultations safely every day.
                </p>
                <Link
                    href="/auth"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-all shadow-lg text-sm"
                >
                    Get started for free
                    <ArrowRight size={16} />
                </Link>
            </div>
        </section>
    );
}