interface FormFieldProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    type?: string;
    disabled?: boolean;
    placeholder?: string;
    maxLength?: number;
}

export default function FormField({
    label,
    value,
    onChange,
    type = "text",
    disabled = false,
    placeholder,
    maxLength,
}: FormFieldProps) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                {label}
            </label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                placeholder={placeholder}
                maxLength={maxLength}
                className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800
          focus:outline-none focus:ring-2 focus:ring-blue-500
          disabled:bg-gray-50 disabled:text-gray-400 transition-all"
            />
        </div>
    );
}