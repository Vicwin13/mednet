import { ShieldCheck, ShieldAlert, Loader2 } from "lucide-react";

interface NINBadgeProps {
    nin: number | null;
    isVerified: boolean;
    isVerifying: boolean;
    onVerify: () => void;
}

export default function NINBadge({
    nin,
    isVerified,
    isVerifying,
    onVerify,
}: NINBadgeProps) {
    return (
        <div className="col-span-2 flex flex-col gap-1">
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                NIN (National Identification Number)
            </span>

            <div className="flex items-center gap-3">
                {/* Masked NIN value */}
                <span className="text-sm font-semibold text-gray-800">
                    {nin ? `${"•".repeat(7)}${String(nin).slice(-4)}` : "Not provided"}
                </span>

                {/* Status badge */}
                {nin ? (
                    isVerified ? (
                        <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
                            <ShieldCheck size={12} />
                            Verified
                        </span>
                    ) : (
                        <button
                            onClick={onVerify}
                            disabled={isVerifying}
                            className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50
                border border-amber-200 px-2.5 py-1 rounded-full hover:bg-amber-100
                transition-colors disabled:opacity-60"
                        >
                            {isVerifying ? (
                                <Loader2 size={11} className="animate-spin" />
                            ) : (
                                <ShieldAlert size={12} />
                            )}
                            {isVerifying ? "Verifying..." : "Unverified — click to verify"}
                        </button>
                    )
                ) : (
                    <span className="flex items-center gap-1 text-xs font-bold text-gray-400 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-full">
                        <ShieldAlert size={12} />
                        Not provided
                    </span>
                )}
            </div>
        </div>
    );
}