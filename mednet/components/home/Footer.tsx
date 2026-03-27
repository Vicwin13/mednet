export function Footer() {
  return (
    <footer className="bg-gray-900 py-10 px-8">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <img src="/images/logo.png" alt="logo" />
        </div>
        <p className="text-xs text-gray-500 text-center">
          © {new Date().getFullYear()} MedNet. All rights reserved. Your medical data remains confidential.
        </p>
        <div className="flex gap-6 text-xs text-gray-500">
          <a href="#" className="hover:text-white transition-colors">Privacy</a>
          <a href="#" className="hover:text-white transition-colors">Terms</a>
          <a href="#" className="hover:text-white transition-colors">Contact</a>
        </div>
      </div>
    </footer>
  );
}