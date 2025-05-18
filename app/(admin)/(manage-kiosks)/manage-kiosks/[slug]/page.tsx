"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { format } from "date-fns"
import { EBaseStatusViMap } from "@/enum/base"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
    Calendar,
    Clock,
    FileText,
    Info,
    Package,
    Store,
    Tag,
    ArrowLeft,
    Trash2,
    RefreshCw,
    Loader2,
} from "lucide-react"
import clsx from "clsx"
import { getBaseStatusColor } from "@/utils/color"
import { getKiosk } from "@/services/kiosk"
import { replaceDeviceByKioskId } from "@/services/kiosk"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import type { Kiosk } from "@/interfaces/kiosk"
import { RefreshButton } from "@/components/common"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"
import { Device } from "@/interfaces/device"
import { getDevicesToReplace } from "@/services/device"

const KioskDetailPage = () => {
    const { slug } = useParams()
    const router = useRouter()
    const { toast } = useToast()
    const [kiosk, setKiosk] = useState<Kiosk | null>(null)
    const [loading, setLoading] = useState(true)

    const [isReplaceDialogOpen, setIsReplaceDialogOpen] = useState(false)
    const [selectedKioskDevice, setSelectedKioskDevice] = useState<any>(null)
    const [replacementDevices, setReplacementDevices] = useState<Device[]>([])
    const [selectedReplacementDeviceId, setSelectedReplacementDeviceId] = useState("")
    const [loadingReplacements, setLoadingReplacements] = useState(false)
    const [processingAction, setProcessingAction] = useState(false)

    const fetchKioskData = async () => {
        try {
            setLoading(true)
            if (typeof slug !== "string") {
                toast({
                    title: "Lỗi",
                    description: "Slug không hợp lệ.",
                    variant: "destructive",
                })
                return
            }
            const kioskData = await getKiosk(slug)
            setKiosk(kioskData.response)
        } catch (error) {
            console.error("Error fetching data:", error)
            toast({
                title: "Lỗi",
                description: "Không thể tải dữ liệu. Vui lòng thử lại sau.",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchKioskData()
    }, [slug])

    const openReplaceDialog = async (kioskDevice: any) => {
        setSelectedKioskDevice(kioskDevice)
        setIsReplaceDialogOpen(true)

        try {
            setLoadingReplacements(true)
            const response = await getDevicesToReplace(kioskDevice.deviceId)
            setReplacementDevices(response.items || [])
        } catch (error) {
            console.error("Error fetching replacement devices:", error)
            toast({
                title: "Lỗi",
                description: "Không thể tải danh sách thiết bị thay thế.",
                variant: "destructive",
            })
        } finally {
            setLoadingReplacements(false)
        }
    }

    const handleReplaceDevice = async () => {
        if (!selectedKioskDevice || !selectedReplacementDeviceId) return

        try {
            setProcessingAction(true)
            await replaceDeviceByKioskId(selectedKioskDevice.kioskDeviceMappingId, {
                deviceReplaceId: selectedReplacementDeviceId,
            })

            toast({
                title: "Thành công",
                description: "Thiết bị đã được thay thế thành công.",
            })

            // Refresh data
            await fetchKioskData()
        } catch (error) {
            console.error("Error replacing device:", error)
            toast({
                title: "Lỗi",
                description: "Không thể thay thế thiết bị. Vui lòng thử lại sau.",
                variant: "destructive",
            })
        } finally {
            setProcessingAction(false)
            setIsReplaceDialogOpen(false)
            setSelectedKioskDevice(null)
            setSelectedReplacementDeviceId("")
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-lg">Đang tải dữ liệu...</span>
            </div>
        )
    }

    if (!kiosk) {
        return (
            <div className="p-6 text-center">
                <h1 className="text-2xl font-bold text-red-500">Không tìm thấy Kiosk</h1>
                <Button variant="outline" className="mt-4" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Quay lại
                </Button>
            </div>
        )
    }

    return (
        <div className="w-full">
            <div className="flex flex-col space-y-4 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center">
                        <Button variant="outline" size="icon" className="mr-4" onClick={() => router.back()}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight flex items-center">
                                <Info className="mr-2 h-5 w-5" />
                                Chi tiết Kiosk
                            </h2>
                            <div className="flex items-center text-sm text-muted-foreground mt-1">
                                <FileText className="mr-1 h-4 w-4" />
                                Mã kiosk: <span className="font-medium ml-1">{kiosk.kioskId}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge className={clsx("px-3 py-1", getBaseStatusColor(kiosk.status))}>
                            {EBaseStatusViMap[kiosk.status]}
                        </Badge>
                        <RefreshButton loading={loading} toggleLoading={fetchKioskData} />
                    </div>
                </div>

                <div className="space-y-6 mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center">
                                <Store className="mr-2 h-5 w-5" />
                                Thông tin cơ bản
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground">Vị trí</h3>
                                    <p className="font-medium">{kiosk.position || "Không có"}</p>
                                </div>

                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground">Địa chỉ</h3>
                                    <p className="font-medium">{kiosk.location || "Không có"}</p>
                                </div>

                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground">Ngày lắp đặt</h3>
                                    <div className="flex items-center">
                                        <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                                        <p className="font-medium">
                                            {kiosk.installedDate ? format(new Date(kiosk.installedDate), "dd/MM/yyyy") : "Không có"}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground">Thời hạn bảo hành</h3>
                                    <div className="flex items-center">
                                        <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                                        <p className="font-medium">
                                            {kiosk.warrantyTime ? format(new Date(kiosk.warrantyTime), "dd/MM/yyyy") : "Không có"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground">Chi nhánh</h3>
                                    <p className="font-medium">{kiosk.store?.name || "Không có"}</p>
                                </div>

                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground">Địa chỉ chi nhánh</h3>
                                    <p className="font-medium">{kiosk.store?.locationAddress || "Không có"}</p>
                                </div>

                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground">Số điện thoại liên hệ</h3>
                                    <p className="font-medium">{kiosk.store?.contactPhone || "Không có"}</p>
                                </div>

                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground">Phiên bản Kiosk</h3>
                                    <p className="font-medium">
                                        {kiosk.kioskVersion?.versionTitle || "Không có"} ({kiosk.kioskVersion?.versionNumber || "N/A"})
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center">
                                <Clock className="mr-2 h-5 w-5" />
                                Thông tin thời gian
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Ngày tạo</h3>
                                <p className="font-medium">
                                    {kiosk.createdDate ? format(new Date(kiosk.createdDate), "dd/MM/yyyy HH:mm") : "Không có"}
                                </p>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Ngày cập nhật</h3>
                                <p className="font-medium">
                                    {kiosk.updatedDate ? format(new Date(kiosk.updatedDate), "dd/MM/yyyy HH:mm") : "Chưa cập nhật"}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center">
                                <Package className="mr-2 h-5 w-5" />
                                Danh sách thiết bị ({kiosk.kioskDevices?.length || 0})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {kiosk.kioskDevices && kiosk.kioskDevices.length > 0 ? (
                                    kiosk.kioskDevices.map((kioskDevice) => (
                                        <div key={kioskDevice.kioskDeviceMappingId} className="border rounded-md p-4">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <h4 className="font-medium">{kioskDevice.device.name}</h4>
                                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                                        {kioskDevice.device.description || "Không có mô tả"}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge className={clsx("ml-2", getBaseStatusColor(kioskDevice.device.status))}>
                                                        {EBaseStatusViMap[kioskDevice.device.status] || kioskDevice.device.status}
                                                    </Badge>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => openReplaceDialog(kioskDevice)}>
                                                                <RefreshCw className="mr-2 h-4 w-4" />
                                                                Thay thế thiết bị
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </div>

                                            <Separator className="my-3" />

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center text-sm">
                                                        <Tag className="h-3 w-3 mr-1 text-muted-foreground" />
                                                        <span className="text-muted-foreground">Mã thiết bị:</span>
                                                    </div>
                                                    <div className="font-medium text-sm">{kioskDevice.device.deviceId}</div>
                                                </div>

                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center text-sm">
                                                        <Tag className="h-3 w-3 mr-1 text-muted-foreground" />
                                                        <span className="text-muted-foreground">Serial Number:</span>
                                                    </div>
                                                    <div className="font-medium text-sm">{kioskDevice.device.serialNumber || "N/A"}</div>
                                                </div>

                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center text-sm">
                                                        <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                                                        <span className="text-muted-foreground">Ngày tạo:</span>
                                                    </div>
                                                    <div className="font-medium text-sm">
                                                        {kioskDevice.device.createdDate
                                                            ? format(new Date(kioskDevice.device.createdDate), "dd/MM/yyyy")
                                                            : "N/A"}
                                                    </div>
                                                </div>

                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center text-sm">
                                                        <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                                                        <span className="text-muted-foreground">Ngày cập nhật:</span>
                                                    </div>
                                                    <div className="font-medium text-sm">
                                                        {kioskDevice.device.updatedDate
                                                            ? format(new Date(kioskDevice.device.updatedDate), "dd/MM/yyyy")
                                                            : "Chưa cập nhật"}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <Package className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                        <p>Không có thiết bị nào được thêm vào kiosk này</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Replace Device Dialog */}
            <Dialog open={isReplaceDialogOpen} onOpenChange={setIsReplaceDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Thay thế thiết bị</DialogTitle>
                        <DialogDescription>
                            Chọn thiết bị mới để thay thế cho "{selectedKioskDevice?.device.name}".
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        <Select value={selectedReplacementDeviceId} onValueChange={setSelectedReplacementDeviceId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn thiết bị thay thế" />
                            </SelectTrigger>
                            <SelectContent>
                                {loadingReplacements ? (
                                    <div className="flex items-center justify-center p-2">
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        <span>Đang tải...</span>
                                    </div>
                                ) : replacementDevices.length > 0 ? (
                                    replacementDevices.map((device) => (
                                        <SelectItem key={device.deviceId} value={device.deviceId}>
                                            {device.name} - {device.serialNumber}
                                        </SelectItem>
                                    ))
                                ) : (
                                    <SelectItem value="no-devices" disabled>
                                        Không có thiết bị khả dụng để thay thế
                                    </SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsReplaceDialogOpen(false)
                                setSelectedKioskDevice(null)
                                setSelectedReplacementDeviceId("")
                            }}
                            disabled={processingAction}
                        >
                            Hủy
                        </Button>
                        <Button onClick={handleReplaceDevice} disabled={!selectedReplacementDeviceId || processingAction}>
                            {processingAction ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Đang xử lý...
                                </>
                            ) : (
                                <>
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Thay thế
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default KioskDetailPage
