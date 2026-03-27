import { ShieldCheck, Stethoscope, Lock } from "lucide-react";

export function FeaturesSection() {
    const features = [
        {
            icon: ShieldCheck,
            title: "Escrow-Protected Payments",
            desc: "Funds are only released to hospitals after your appointment is confirmed and completed.",
        },
        {
            icon: Stethoscope,
            title: "Verified Medical Facilities",
            desc: "Every hospital on MedNet passes a rigorous accreditation and identity check before listing.",
        },
        {
            icon: Lock,
            title: "Clinical-Grade Privacy",
            desc: "Your medical history and personal data are encrypted at rest and in transit — always.",
        },
    ];

    return (
        <section id="features" className="py-24 bg-white">
            <div className="max-w-5xl mx-auto px-8">
                <div className="text-center mb-16">
                    <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-3">
                        Why MedNet
                    </p>
                    <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">
                        Built for trust at every step
                    </h2>
                    <p className="text-gray-500 mt-4 max-w-lg mx-auto text-base">
                        From booking to payment, every touchpoint is designed to protect both
                        patients and healthcare providers.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {features.map(({ icon: Icon, title, desc }) => (
                        <div
                            key={title}
                            className="bg-gray-50 hover:bg-blue-50 border border-gray-100 hover:border-blue-200 rounded-2xl p-6 transition-all group"
                        >
                            <div className="w-11 h-11 justify-self-center bg-blue-100 group-hover:bg-blue-600 rounded-xl flex items-center justify-center mb-4 transition-colors">
                                <Icon size={20} className="text-blue-600 group-hover:text-white transition-colors" />
                            </div>
                            <h3 className="text-center font-bold text-gray-900 text-base mb-2">{title}</h3>
                            <p className="text-center text-sm text-gray-500 leading-relaxed">{desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}