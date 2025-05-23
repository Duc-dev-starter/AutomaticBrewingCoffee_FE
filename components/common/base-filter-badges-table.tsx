import { EBaseStatus } from '@/enum/base'
import clsx from 'clsx'
import { Power } from 'lucide-react'
import React from 'react'
import { Badge } from '../ui/badge'

const statusColorMap: Record<EBaseStatus, string> = {
    [EBaseStatus.Active]: "bg-primary",
    [EBaseStatus.Inactive]: "bg-muted-foreground",
}

const BaseFilterBadgesTable = ({
    statusText,
    status,
}: {
    statusText: string
    status: EBaseStatus
}) => {
    return (
        <div className="flex justify-center items-center w-full">
            <Badge
                className={clsx(
                    "flex items-center justify-center !w-fit !px-2 !py-[2px] !rounded-full !text-white !text-xs transition-opacity duration-200 hover:opacity-95",
                    statusColorMap[status] || "bg-gray-400"
                )}
            >
                <Power className="w-3 h-3 mr-1" />
                {statusText}
            </Badge>

        </div>
    )
}

export default BaseFilterBadgesTable
