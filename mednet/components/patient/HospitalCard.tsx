import { MapPin, Star, BadgeCheck } from "lucide-react";

export interface Hospital {
  id: number;
  name: string;
  location: string;
  distance: string;
  rating: number;
  specialties: string[];
  extraCount: number;
  fee: string;
  image: string;
}

interface HospitalCardProps {
  hospital: Hospital;
}

export default function HospitalCard({ hospital }: HospitalCardProps) {
  const { name, location, distance, rating, specialties, extraCount, fee, image } = hospital;

  return (
    <div className="min-w-5xl flex gap-4 bg-white border border-gray-200 rounded-2xl p-4 hover:border-blue-200 hover:shadow-md transition-all group">
      <div className="relative shrink-0 w-36 h-28 rounded-xl overflow-hidden bg-gray-100">
        <img src={image} alt={name} className="w-full h-full object-cover" />
        <div className="absolute top-2 left-2 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full text-xs font-semibold text-blue-600">
          <BadgeCheck size={12} />
          Verified
        </div>
      </div>

      <div className="flex-1 flex items-center gap-6 min-w-0">
        <div className="min-w-0 shrink-0 w-44">
          <h3 className="font-bold text-gray-900 text-base leading-snug">{name}</h3>
          <div className="flex items-center gap-1 mt-1 text-gray-500">
            <MapPin size={13} />
            <span className="text-xs truncate">{location}</span>
          </div>
          <div className="flex items-center gap-1 mt-1">
            <Star size={13} className="text-yellow-400 fill-yellow-400" />
            <span className="text-sm font-semibold text-gray-800">{rating}</span>
          </div>
          <span className="inline-block mt-1 text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
            {distance}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-1">
          {specialties.map((s) => (
            <span
              key={s}
              className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg uppercase tracking-wide"
            >
              {s}
            </span>
          ))}
          {extraCount > 0 && (
            <span className="px-2.5 py-1 bg-gray-100 text-gray-500 text-xs font-semibold rounded-lg">
              +{extraCount} MORE
            </span>
          )}
        </div>

        <div className="shrink-0 flex items-center gap-4 ml-auto">
          <div className="text-right">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Consultation</p>
            <p className="text-lg font-bold text-gray-900">₦{fee}</p>
          </div>
          <button className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors group-hover:shadow-md">
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
}