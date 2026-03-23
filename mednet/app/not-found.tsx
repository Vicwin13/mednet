import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-linear-to-br from-indigo-50 via-white to-purple-50 px-4">
      <div className="text-center">
        {/* SVG Illustration */}
        <div className="mb-8 flex justify-center">
          <svg
            width="300"
            height="300"
            viewBox="0 0 300 300"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="drop-shadow-2xl"
            aria-hidden="true"
          >
            {/* Background Circle */}
            <circle cx="150" cy="150" r="140" fill="#EEF2FF" />

            {/* Main 404 Text */}
            <text
              x="150"
              y="120"
              textAnchor="middle"
              fontSize="80"
              fontWeight="bold"
              fill="#4F46E5"
              fontFamily="Poppins, sans-serif"
            >
              404
            </text>

            {/* Sad Face */}
            <circle cx="150" cy="180" r="50" fill="#4F46E5" opacity="0.1" />

            {/* Eyes */}
            <circle cx="130" cy="165" r="8" fill="#4F46E5" />
            <circle cx="170" cy="165" r="8" fill="#4F46E5" />

            {/* Eyebrows (worried expression) */}
            <path
              d="M120 150 Q130 145 140 150"
              stroke="#4F46E5"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M160 150 Q170 145 180 150"
              stroke="#4F46E5"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />

            {/* Mouth (sad expression) */}
            <path
              d="M130 195 Q150 185 170 195"
              stroke="#4F46E5"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />

            {/* Tear drop */}
            <path
              d="M115 175 Q110 190 115 200 Q120 190 115 175"
              fill="#4F46E5"
              opacity="0.6"
            />

            {/* Floating elements */}
            <circle cx="80" cy="80" r="8" fill="#4F46E5" opacity="0.3" />
            <circle cx="220" cy="90" r="6" fill="#4F46E5" opacity="0.3" />
            <circle cx="70" cy="200" r="5" fill="#4F46E5" opacity="0.3" />
            <circle cx="230" cy="210" r="7" fill="#4F46E5" opacity="0.3" />

            {/* Question marks */}
            <text
              x="60"
              y="140"
              fontSize="24"
              fill="#4F46E5"
              opacity="0.5"
              fontFamily="Poppins, sans-serif"
            >
              ?
            </text>
            <text
              x="230"
              y="160"
              fontSize="24"
              fill="#4F46E5"
              opacity="0.5"
              fontFamily="Poppins, sans-serif"
            >
              ?
            </text>
          </svg>
        </div>

        {/* Error Message */}
        <h1 className="mb-4 text-3xl font-bold text-gray-900 font-poppins md:text-4xl">
          Oops!!!
        </h1>
        <p className="mb-8 max-w-md text-lg text-gray-600 font-poppins">
          {"The page you're looking for doesn't exist or has been moved."}
        </p>

        {/* Back to Home Button */}
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-8 py-3 text-base font-semibold text-white transition-all duration-200 hover:bg-indigo-700 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 font-poppins shadow-lg hover:shadow-xl"
        >
          <svg
            className="mr-2 h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          Back to Home
        </Link>

        {/* Additional help text */}
        <p className="mt-6 text-sm text-gray-500 font-poppins">
          If you believe this is an error, please contact support.
        </p>
      </div>
    </div>
  );
}
