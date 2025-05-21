import { EBaseStatus } from '@/enum/base'
import clsx from 'clsx'
import { Power } from 'lucide-react'
import React from 'react'
import { Badge } from '../ui/badge'

const BaseFilterBadgesTable = ({ statusText, status }: { statusText: string, status: string }) => {
    return (
        <div className="flex justify-center items-center w-full">
            <Badge
                className={clsx(
                    "flex items-center justify-center !w-fit !px-2 !py-[2px] !rounded-full !text-white !text-xs",
                    {
                        "bg-primary": status === EBaseStatus.Active,
                        "bg-muted-foreground": status === EBaseStatus.Inactive,
                    }
                )}
            >
                <Power className="w-3 h-3 mr-1" />
                {statusText}
            </Badge>
        </div>
    )
}

export default BaseFilterBadgesTable