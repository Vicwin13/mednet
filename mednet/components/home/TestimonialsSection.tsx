import { Star } from "lucide-react";

export function TestimonialsSection() {
    const testimonials = [
        {
            name: "Amara Okafor",
            role: "Patient, Lagos",
            quote:
                "I booked a cardiology consultation and paid through escrow. The peace of mind knowing my money was protected was priceless.",
            rating: 5,
        },
        {
            name: "Dr. Emeka Nwosu",
            role: "Cardiologist, Abuja",
            quote:
                "MedNet brought us verified patients and a transparent payment process. It transformed how we manage appointments.",
            rating: 5,
        },
        {
            name: "Fatima Aliyu",
            role: "Patient, Kano",
            quote:
                "Finding a verified pediatrician used to take weeks. With MedNet I booked in minutes and paid safely.",
            rating: 5,
        },
    ];

    return (
        <section id="testimonials" className="py-24 bg-white">
            <div className="max-w-5xl mx-auto px-8">
                <div className="text-center mb-16">
                    <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-3">Testimonials</p>
                    <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">
                        Trusted by patients & doctors
                    </h2>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {testimonials.map(({ name, role, quote, rating }) => (
                        <div
                            key={name}
                            className="bg-gray-50 border border-gray-100 rounded-2xl p-6 flex flex-col gap-4"
                        >
                            <div className="flex gap-1">
                                {Array.from({ length: rating }).map((_, i) => (
                                    <Star key={i} size={14} className="text-yellow-400 fill-yellow-400" />
                                ))}
                            </div>
                            <p className="text-sm text-gray-600 leading-relaxed flex-1">"{quote}"</p>
                            <div>
                                <p className="text-sm font-bold text-gray-900">{name}</p>
                                <p className="text-xs text-gray-400">{role}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}