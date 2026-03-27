import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export type NINStatus = "unverified" | "verifying" | "verified" | "failed";

interface NINFieldProps {
    value: string;
    onChange: (value: string) => void;
    status: NINStatus;
    error: string | null;
    onVerify: () => void;
}

export default function NINField({
    value,
    onChange,
    status,
    error,
    onVerify,
}: NINFieldProps) {
    const isVerified = status === "verified";
    const isVerifying = status === "verifying";

    return (
        <div className="flex flex-col gap-1.5 col-span-2">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                NIN (National Identification Number)
            </label>

            <div className="flex gap-2">
                {/* Input */}
                <div className="relative flex-1">
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        maxLength={11}
                        placeholder="Enter your 11-digit NIN"
                        className="w-full px-3 py-2.5 pr-8 border border-gray-200 rounded-xl text-sm
              text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                    {isVerified && (
                        <CheckCircle2
                            size={15}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-green-500"
                        />
                    )}
                    {status === "failed" && (
                        <AlertCircle
                            size={15}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-red-400"
                        />
                    )}
                </div>

                {/* Verify button */}
                <button
                    onClick={onVerify}
                    disabled={isVerifying || isVerified || !value}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50
            disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl
            transition-colors flex items-center gap-1.5 whitespace-nowrap"
                >
                    {isVerifying ? (
                        <>
                            <Loader2 size={13} className="animate-spin" />
                            Verifying...
                        </>
                    ) : isVerified ? (
                        <>
                            <CheckCircle2 size={13} />
                            Verified
                        </>
                    ) : (
                        "Verify NIN"
                    )}
                </button>
            </div>

            {/* Feedback */}
            {error && <p className="text-xs text-red-500">{error}</p>}
            {isVerified && (
                <p className="text-xs text-green-600 font-medium">✓ NIN successfully verified</p>
            )}
        </div>
    );
}