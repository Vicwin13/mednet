export function StatsBar() {

const stats = [
  { value: "12K+", label: "Verified Patients" },
  { value: "340+", label: "Partner Hospitals" },
  { value: "₦2.4B+", label: "Escrow Processed" },
  { value: "99.8%", label: "Uptime" },
];

  return (
    <section className="bg-blue-600 py-12">
      <div className="max-w-5xl mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        {stats.map(({ value, label }) => (
          <div key={label}>
            <p className="text-3xl font-extrabold text-white">{value}</p>
            <p className="text-sm text-blue-200 font-medium mt-1">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}