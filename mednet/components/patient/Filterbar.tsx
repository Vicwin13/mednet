import { MapPin, SlidersHorizontal, BadgeCheck, Plus, ChevronDown } from "lucide-react";

interface FilterChip {
  icon: React.ElementType;
  label: string;
}

interface FilterBarProps {
  activeSpecialty: string;
  onSpecialtyChange: (specialty: string) => void;
}

const filterChips: FilterChip[] = [
  { icon: MapPin, label: "Distance: < 10km" },
  { icon: SlidersHorizontal, label: "Rating: 4.5+" },
];

const specialties: string[] = ["All", "Cardiology", "Pediatrics", "General Surgery", "Neurology"];

export default function FilterBar({ activeSpecialty, onSpecialtyChange }: FilterBarProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 flex-wrap">
        {filterChips.map(({ icon: Icon, label }) => (
          <button
            key={label}
            className="flex items-center gap-2 px-3.5 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <Icon size={15} className="text-gray-500" />
            {label}
            <ChevronDown size={14} className="text-gray-400" />
          </button>
        ))}
        <button className="flex items-center gap-2 px-3.5 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-colors">
          <BadgeCheck size={15} className="text-blue-600" />
          verified
          <Plus size={14} className="text-gray-400" />
        </button>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {specialties.map((s) => (
          <button
            key={s}
            onClick={() => onSpecialtyChange(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${activeSpecialty === s
              ? "bg-white border-blue-600 text-blue-600 shadow-sm"
              : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
              }`}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}