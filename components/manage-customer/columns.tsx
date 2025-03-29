import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Transaction } from "@/types"
import { formatDate, formatTime } from "@/utils/date"
import { translateStatus } from "@/utils/status"
import { CaretSortIcon, DotsHorizontalIcon } from "@radix-ui/react-icons"
import { Clock, CreditCard, RefreshCw, Trash2, DropletsIcon as WaterDropIcon } from "lucide-react"
import { type ColumnDef } from '@tanstack/react-table'

const columns: ColumnDef<Transaction>[] = [
    {
        accessorKey: "id",
        header: "Mã giao dịch",
        cell: ({ row }) => <div className="font-medium">{row.getValue("id")}</div>,
    },
    {
        accessorKey: "date",
        header: ({ column }) => {
            return (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Ngày giờ
                    <CaretSortIcon className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const date = row.getValue("date") as Date
            return (
                <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDate(date)}</span>
                    <Clock className="ml-2 h-4 w-4 text-muted-foreground" />
                    <span>{formatTime(date)}</span>
                </div>
            )
        },
        sortingFn: "datetime",
    },
    {
        accessorKey: "amount",
        header: ({ column }) => {
            return (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Số tiền
                    <CaretSortIcon className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const amount = Number.parseFloat(row.getValue("amount"))
            const formatted = new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
            }).format(amount * 1000) // Convert to VND

            return <div>{formatted}</div>
        },
    },
    {
        accessorKey: "waterType",
        header: "Loại nước",
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <WaterDropIcon className="h-4 w-4 text-blue-500" />
                {row.getValue("waterType")}
            </div>
        ),
    },
    {
        accessorKey: "paymentMethod",
        header: "Phương thức thanh toán",
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                {row.getValue("paymentMethod")}
            </div>
        ),
    },
    {
        accessorKey: "status",
        header: "Trạng thái",
        cell: ({ row }) => {
            const status = row.getValue("status") as string
            return (
                <Badge
                    className={
                        status === "completed"
                            ? "bg-green-100 text-green-800 hover:bg-green-100"
                            : status === "pending"
                                ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                                : "bg-red-100 text-red-800 hover:bg-red-100"
                    }
                >
                    {status === "completed" && <RefreshCw className="mr-1 h-3 w-3 text-green-800" />}
                    {status === "pending" && <Clock className="mr-1 h-3 w-3 text-yellow-800" />}
                    {status === "failed" && <Trash2 className="mr-1 h-3 w-3 text-red-800" />}
                    {translateStatus(status)}
                </Badge>
            )
        },
    },
    {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
            const transaction = row.original

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Mở menu</span>
                            <DotsHorizontalIcon className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(transaction.id)}>
                            Sao chép mã giao dịch
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Xem chi tiết</DropdownMenuItem>
                        <DropdownMenuItem>Xuất hóa đơn</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]

export default columns;