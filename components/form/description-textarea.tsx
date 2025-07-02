import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, CheckCircle2, Edit3 } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormDescriptionFieldProps {
    label?: string;
    icon?: React.ReactNode;
    value: string;
    onChange: (value: string) => void;
    onFocus?: () => void;
    onBlur?: () => void;
    placeholder?: string;
    disabled?: boolean;
    error?: string;
    maxLength?: number;
    showCounter?: boolean;
    valid?: boolean;
    focused?: boolean;
    submitted?: boolean;
}

const FormDescriptionField: React.FC<FormDescriptionFieldProps> = ({
    label = "Mô tả",
    icon = <Edit3 className="w-4 h-4 text-primary-300" />,
    value,
    onChange,
    onFocus,
    onBlur,
    placeholder = "Mô tả chi tiết...",
    disabled = false,
    error,
    maxLength = 450,
    showCounter = true,
    valid = false,
    focused = false,
    submitted = false,
}) => {
    return (
        <div className="space-y-3">
            <div className="flex items-center space-x-2 mb-2">
                {icon}
                <label className="text-sm font-medium text-gray-700 asterisk">{label}</label>
            </div>
            <div className="relative group">
                <Textarea
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    disabled={disabled}
                    className={cn(
                        "min-h-[100px] text-base p-4 border-2 transition-all duration-300 bg-white/80 backdrop-blur-sm resize-none",
                        focused && "border-primary-300 ring-4 ring-primary-100 shadow-lg scale-[1.01]",
                        valid && "border-green-400 bg-green-50/50"
                    )}
                />
                {valid && !error && (
                    <CheckCircle2 className="absolute right-3 top-3 w-5 h-5 text-green-500 animate-in zoom-in-50" />
                )}
                {error && submitted && (
                    <AlertCircle className="absolute right-3 top-3 w-5 h-5 text-red-400 animate-in zoom-in-50" />
                )}
            </div>

            {showCounter && (
                <div className="flex justify-between items-center text-xs">
                    <span
                        className={cn(
                            "transition-colors",
                            value.length > (maxLength || 450) ? "text-orange-500" : "text-gray-400"
                        )}
                    >
                        {value.length}/{maxLength}
                    </span>
                </div>
            )}

            {error && submitted && (
                <p className="text-red-500 text-xs mt-1">{error}</p>
            )}
        </div>
    );
};

export default FormDescriptionField;
