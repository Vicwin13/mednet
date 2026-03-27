import Image from "next/image";
import Link from "next/link";

export function Navbar() {
  return (
    <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-8 py-4 bg-white/80 backdrop-blur-md border-b border-gray-100">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5">
          <img src="/images/logo.png" alt="logo" />
      </Link>

      {/* Nav links — desktop */}
      <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-500">
        <a href="#features" className="hover:text-gray-900 transition-colors">Features</a>
        <a href="#how" className="hover:text-gray-900 transition-colors">How it works</a>
        <a href="#testimonials" className="hover:text-gray-900 transition-colors">Testimonials</a>
      </div>

      {/* CTA buttons */}
      <div className="flex items-center gap-3">
        <Link
          href="/auth"
          className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors"
        >
          Log in
        </Link>
        <Link
          href="/auth"
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all shadow-sm hover:shadow-md"
        >
          Get started
        </Link>
      </div>
    </nav>
  );
}