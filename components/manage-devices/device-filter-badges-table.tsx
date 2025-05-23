import clsx from 'clsx'
import { Power } from 'lucide-react'
import React from 'react'
import { Badge } from '../ui/badge'
import { EDeviceStatus } from '@/enum/device'

const statusColorMap: Record<EDeviceStatus, string> = {
  [EDeviceStatus.Maintain]: "bg-yellow-500",
  [EDeviceStatus.Stock]: "bg-primary",
  [EDeviceStatus.Working]: "bg-green-500",
}

const DeviceFilterBadgesTable = ({
  statusText,
  status,
}: {
  statusText: string
  status: EDeviceStatus
}) => {
  return (
    <div className="flex justify-center items-center w-full">
      <Badge
        className={clsx(
          "flex items-center justify-center !w-fit !px-2 !py-[2px] !rounded-full !text-white !text-xs",
          statusColorMap[status] || "bg-gray-400"
        )}
      >
        <Power className="w-3 h-3 mr-1" />
        {statusText}
      </Badge>
    </div>
  )
}

export default DeviceFilterBadgesTable
