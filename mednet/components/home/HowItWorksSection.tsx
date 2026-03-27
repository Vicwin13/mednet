export function HowItWorksSection() {
    const steps = [
        { num: "01", title: "Create your account", desc: "Sign up as a patient or hospital in under 2 minutes." },
        { num: "02", title: "Verify your identity", desc: "Patients verify via NIN. Hospitals undergo manual accreditation." },
        { num: "03", title: "Book & pay securely", desc: "Choose a verified hospital, pick a time slot, and pay into escrow." },
        { num: "04", title: "Funds released on completion", desc: "After your appointment is confirmed, funds are released to the hospital." },
    ];

    return (
        <section id="how" className="py-24 bg-[#f5f7ff]">
            <div className="max-w-5xl mx-auto px-8">
                <div className="text-center mb-16">
                    <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-3">How it works</p>
                    <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">
                        Simple. Secure. Transparent.
                    </h2>
                </div>

                <div className="grid md:grid-cols-4 gap-6 relative">
                    {/* Connector line */}
                    <div className="hidden md:block absolute top-8 left-[12.5%] right-[12.5%] h-px bg-blue-200 z-0" />

                    {steps.map(({ num, title, desc }) => (
                        <div key={num} className="relative z-10 flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-white border-2 border-blue-200 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                                <span className="text-lg font-extrabold text-blue-600">{num}</span>
                            </div>
                            <h3 className="font-bold text-gray-900 text-sm mb-2">{title}</h3>
                            <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}