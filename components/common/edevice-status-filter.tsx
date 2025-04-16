"use client"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Filter, ChevronDownIcon } from "lucide-react"
import { Table } from "@tanstack/react-table"
import { EDeviceStatusViMap } from "@/enum/device"

interface StatusFilterDropdownProps {
    loading: boolean;
    table: Table<any>;
}

export const EDeviceStatusFilterDropdown = ({ loading, table }: StatusFilterDropdownProps) => {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto" disabled={loading}>
                    <Filter className="mr-2 h-4 w-4" />
                    Lọc
                    <ChevronDownIcon className="ml-2 h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Lọc theo trạng thái</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {Object.entries(EDeviceStatusViMap).map(([key, label]) => (
                    <DropdownMenuItem
                        key={key}
                        onClick={() => table.getColumn("status")?.setFilterValue(key)}
                    >
                        {label}
                    </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => table.getColumn("status")?.setFilterValue("")}>
                    Xóa bộ lọc
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
