interface InfoRowProps {
    label: string;
    value: string | null | undefined;
}

export default function InfoRow({ label, value }: InfoRowProps) {
    return (
        <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                {label}
            </span>
            <span className="text-sm font-semibold text-gray-800">{value || "—"}</span>
        </div>
    );
}