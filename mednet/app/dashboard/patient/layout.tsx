import type { Metadata } from "next";
import Header from "../../../components/patient/Header";
import Sidebar from "../../../components/patient/Sidebar";

export const metadata: Metadata = {
    title: "MedNet – Verified Hospitals",
    description: "Connect with top-rated medical facilities and book appointments with secured escrow payments.",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className="bg-gray-50">
                <Header />
                <Sidebar />
                <main className="ml-52 pt-16 min-h-screen">
                    {children}
                </main>
            </body>
        </html>
    );
}