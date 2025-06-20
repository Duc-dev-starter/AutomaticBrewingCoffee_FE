import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, Check } from "lucide-react";
import { EDeviceStatus, EDeviceStatusViMap } from "@/enum/device";

interface DeviceStatusDropdownProps {
    value: EDeviceStatus;
    onChange: (status: EDeviceStatus) => void;
    disabled?: boolean;
}

const DeviceStatusDropdown = ({ value, onChange, disabled }: DeviceStatusDropdownProps) => {
    const [open, setOpen] = useState(false);

    return (
        <div className="relative">
            {/* Nút mở dropdown */}
            <button
                type="button"
                onClick={() => setOpen(!open)}
                disabled={disabled}
                className={cn(
                    "w-full h-12 px-4 text-left bg-white/80 backdrop-blur-sm border-2 rounded-md transition-all duration-300 flex items-center justify-between",
                    open && "border-primary-400 ring-4 ring-primary-100 shadow-lg",
                    !open && "border-gray-200 hover:border-gray-300"
                )}
            >
                <span className="text-sm">{EDeviceStatusViMap[value]}</span>
                <ChevronDown className={cn("w-4 h-4 text-gray-500 transition-transform", open && "rotate-180")} />
            </button>

            {/* Danh sách tùy chọn khi mở */}
            {open && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white/95 backdrop-blur-sm border-2 border-primary-200 rounded-md shadow-xl z-50 overflow-hidden">
                    {Object.entries(EDeviceStatusViMap).map(([key, label]) => (
                        <button
                            key={key}
                            type="button"
                            onClick={() => {
                                onChange(key as EDeviceStatus);
                                setOpen(false);
                            }}
                            className={cn(
                                "w-full px-4 py-3 text-left transition-colors text-sm flex items-center justify-between",
                                "hover:bg-primary-50 hover:text-primary-700",
                                value === key && "bg-primary-100 text-primary-700 font-medium"
                            )}
                        >
                            <span>{label}</span>
                            {value === key && <Check className="w-4 h-4 text-primary-700" />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DeviceStatusDropdown;