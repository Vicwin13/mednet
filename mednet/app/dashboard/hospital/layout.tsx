import Header from "@/components/patient/Header";
import Sidebar from "@/components/patient/Sidebar";

export default function HospitalRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-gray-50">
      <Header />
      <Sidebar />
      <main className="ml-52 pt-16 min-h-screen">{children}</main>
    </div>
  );
}
