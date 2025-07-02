import React from "react";
import { Circle } from "lucide-react"; // hoặc icon khác
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

interface FormSelectFieldProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    options: { value: string; label: string }[];
    error?: string;
    disabled?: boolean;
}

const FormBaseStatusSelectField: React.FC<FormSelectFieldProps> = ({
    label,
    value,
    onChange,
    placeholder = "Chọn một giá trị",
    options,
    error,
    disabled = false,
}) => {
    return (
        <div className="space-y-3">
            <div className="flex items-center space-x-2 mb-2">
                <Circle className="w-4 h-4 text-primary-300" />
                <label className="text-sm font-medium text-gray-700 asterisk">{label}</label>
            </div>
            <Select value={value} onValueChange={onChange} disabled={disabled}>
                <SelectTrigger className="h-12 text-sm px-4 border-2 bg-white/80 backdrop-blur-sm">
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                    {options.map((option) => (
                        <SelectItem key={option.value} value={option.value} className="text-sm">
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    );
};

export default FormBaseStatusSelectField;
