import React from "react";
import { Circle } from "lucide-react";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { EBaseStatusViMap } from "@/enum/base";

interface FormBaseStatusSelectFieldProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    error?: string;
    disabled?: boolean;
    focusedField: string | null;
    setFocusedField: (field: string | null) => void;
    submitted?: boolean;
}

const FormBaseStatusSelectField: React.FC<FormBaseStatusSelectFieldProps> = ({
    label,
    value,
    onChange,
    placeholder = "Chọn một giá trị",
    error,
    disabled = false,
    focusedField,
    setFocusedField,
    submitted,
}) => {
    const isFocused = focusedField === "status";

    return (
        <div className="space-y-3">
            <div className="flex items-center space-x-2 mb-2">
                <Circle className="w-4 h-4 text-primary-300" />
                <label className="text-sm font-medium text-gray-700 asterisk">
                    {label}
                </label>
            </div>
            <div className="relative group">
                <Select
                    value={value}
                    onValueChange={(val) => {
                        onChange(val);
                        setFocusedField(null);
                    }}
                    onOpenChange={(open) => {
                        setFocusedField(open ? "status" : null);
                    }}
                    disabled={disabled}
                >
                    <SelectTrigger
                        className={cn(
                            "h-12 text-base px-4 border-2 transition-all duration-300 bg-white/80 backdrop-blur-sm w-full flex items-center justify-between rounded-md",
                            isFocused && "border-primary-300 ring-4 ring-primary-100 shadow-lg scale-[1.02]",

                        )}
                    >
                        <span className="text-sm flex-1 truncate text-left">
                            {value ? EBaseStatusViMap[value as keyof typeof EBaseStatusViMap] : placeholder}
                        </span>
                    </SelectTrigger>
                    <SelectContent className="bg-white/95 backdrop-blur-sm border-2 border-primary-200 rounded-md shadow-xl z-50 overflow-hidden">
                        {Object.entries(EBaseStatusViMap).map(([key, label]) => (
                            <SelectItem
                                key={key}
                                value={key}
                                className={cn(
                                    "w-full px-4 py-3 text-left hover:bg-primary-50 transition-colors text-sm",
                                    value === key && "bg-primary-100 text-primary-700 font-medium"
                                )}
                            >
                                {label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {submitted && error && (
                <p className="text-red-500 text-xs mt-1">{error}</p>
            )}
        </div>
    );
};

export default FormBaseStatusSelectField;
