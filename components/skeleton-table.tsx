"use client"

import { Table, TableHeader, TableRow, TableHead, TableBody } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import {
    ColumnDef
} from "@tanstack/react-table";

type SkeletonCustomProps<T> = {
    columns?: ColumnDef<T>[];
};

export default function SkeletonCustom<T>({ columns }: SkeletonCustomProps<T>) {
    return (
        <div className="mt-10 w-full px-3">
            <div className="my-4 flex justify-between">
                <div className="flex flex-col gap-1">
                    <Skeleton className="h-10 w-40" />
                    <Skeleton className="h-6 w-28" />
                </div>
                <Skeleton className="h-10 w-40" />
            </div>
            <div className="flex gap-3">
                <div className="grow">
                    <Skeleton className="h-10 w-full" />
                </div>

                <div className="flex gap-4">
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-24" />
                </div>
            </div>
            <div className="relative w-full overflow-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {columns?.map((_, columnIndex) => (
                                <TableHead key={columnIndex} className={columnIndex === 0 ? "w-[100px]" : columnIndex === columns.length - 1 ? "text-right" : ""}>
                                    <Skeleton className="h-4 w-full bg-slate-400" />
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {columns?.map((_, columnIndex) => (
                            <TableRow key={columnIndex}>
                                {columns?.map((_, columnIndex) => (
                                    <TableHead key={columnIndex} className={columnIndex === 0 ? "w-[100px]" : columnIndex === columns.length - 1 ? "text-right" : ""}>
                                        <Skeleton className="h-4 w-full" />
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}