
"use client";

import type React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EDeviceStatus, EDeviceStatusViMap } from "@/enum/device";
import { cn } from "@/lib/utils";

interface DeviceStatusSelectProps {
    value: EDeviceStatus;
    onValueChange: (value: EDeviceStatus) => void;
    disabled?: boolean;
    className?: string;
}

const DeviceStatusSelect: React.FC<DeviceStatusSelectProps> = ({ value, onValueChange, disabled, className }) => {
    return (
        <Select
            value={value}
            onValueChange={(value) => onValueChange(value as EDeviceStatus)}
            disabled={disabled}
        >
            <SelectTrigger className={cn("h-12 text-sm px-4 border-2 bg-white/80 backdrop-blur-sm", className)}>
                <SelectValue placeholder="Chọn trạng thái" />
            </SelectTrigger>
            <SelectContent>
                {Object.entries(EDeviceStatusViMap).map(([key, label]) => (
                    <SelectItem key={key} value={key} className="text-sm">
                        {label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
};

export default DeviceStatusSelect;