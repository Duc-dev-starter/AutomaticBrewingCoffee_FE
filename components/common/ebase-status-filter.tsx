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

interface StatusFilterDropdownProps {
    loading: boolean;
    table: Table<any>;
}

export const EBaseStatusFilterDropdown = ({ loading, table }: StatusFilterDropdownProps) => {
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
                <DropdownMenuItem onClick={() => table.getColumn("status")?.setFilterValue("Active")}>
                    Hoạt động
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => table.getColumn("status")?.setFilterValue("Inactive")}>
                    Không hoạt động
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => table.getColumn("status")?.setFilterValue("Deleted")}>
                    Đã xóa
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => table.getColumn("status")?.setFilterValue("")}>
                    Xóa bộ lọc
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}