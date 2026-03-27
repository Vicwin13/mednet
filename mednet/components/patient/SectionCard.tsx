interface SectionCardProps {
    icon: React.ReactNode;
    title: string;
    children: React.ReactNode;
}

export default function SectionCard({ icon, title, children }: SectionCardProps) {
    return (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
                <span className="text-blue-600">{icon}</span>
                <h2 className="text-base font-bold text-gray-900">{title}</h2>
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-5">{children}</div>
        </div>
    );
}