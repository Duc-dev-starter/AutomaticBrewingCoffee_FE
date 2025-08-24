import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, Check } from "lucide-react";
import { DeviceModel } from "@/interfaces/device";

interface DeviceModelDropdownProps {
    value: string | number;
    onChange: (id: string | number) => void;
    deviceModels: DeviceModel[];
    disabled?: boolean;
}

const DeviceModelDropdown = ({ value, onChange, deviceModels, disabled }: DeviceModelDropdownProps) => {
    const [open, setOpen] = useState(false);

    return (
        <div className="relative">
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
                <span className="text-sm">
                    {deviceModels.find((model) => model.deviceModelId === value)?.modelName || "Chọn mẫu thiết bị"}
                </span>
                <ChevronDown className={cn("w-4 h-4 text-gray-500 transition-transform", open && "rotate-180")} />
            </button>

            {open && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white/95 backdrop-blur-sm border-2 border-primary-200 rounded-md shadow-xl z-50 overflow-hidden">
                    {deviceModels.length > 0 ? (
                        deviceModels.map((model) => (
                            <button
                                key={model.deviceModelId}
                                type="button"
                                onClick={() => {
                                    onChange(model.deviceModelId);
                                    setOpen(false);
                                }}
                                className={cn(
                                    "w-full px-4 py-3 text-left transition-colors text-sm flex items-center justify-between",
                                    "hover:bg-primary-50 hover:text-primary-700",
                                    value === model.deviceModelId && "bg-primary-100 text-primary-700 font-medium"
                                )}
                            >
                                <span>{model.modelName}</span>
                                {value === model.deviceModelId && <Check className="w-4 h-4 text-primary-700" />}
                            </button>
                        ))
                    ) : (
                        <div className="p-2 text-center text-sm text-muted-foreground">Chưa có mẫu thiết bị nào.</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default DeviceModelDropdown;