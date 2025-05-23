"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { format } from "date-fns"
import { EBaseStatusViMap } from "@/enum/base"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Calendar,
    Clock,
    FileText,
    Info,
    Package,
    Store,
    ArrowLeft,
    RefreshCw,
    Loader2,
    Eye,
    EyeOff,
    Copy,
    Link,
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
import type { Device } from "@/interfaces/device"
import { getDevicesToReplace } from "@/services/device"
import { DeviceStatusGroup } from "@/components/common/device-status-group"

const KioskDetailPage = () => {
    const { slug } = useParams()
    const router = useRouter()
    const { toast } = useToast()
    const [kiosk, setKiosk] = useState<Kiosk | null>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const [showApiKey, setShowApiKey] = useState<boolean>(false)

    const [isReplaceDialogOpen, setIsReplaceDialogOpen] = useState<boolean>(false)
    const [selectedKioskDevice, setSelectedKioskDevice] = useState<any>(null)
    const [replacementDevices, setReplacementDevices] = useState<Device[]>([])
    const [selectedReplacementDeviceId, setSelectedReplacementDeviceId] = useState<string>("")
    const [loadingReplacements, setLoadingReplacements] = useState<boolean>(false)
    const [processingAction, setProcessingAction] = useState<boolean>(false)

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
                                Thông tin Kiosk
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                                        <h3 className="text-sm font-medium text-muted-foreground">Chi nhánh</h3>
                                        <p className="font-medium">{kiosk.store?.name || "Không có"}</p>
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-medium text-muted-foreground">Địa chỉ chi nhánh</h3>
                                        <p className="font-medium">{kiosk.store?.locationAddress || "Không có"}</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
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

                                    <div>
                                        <h3 className="text-sm font-medium text-muted-foreground">Ngày tạo</h3>
                                        <div className="flex items-center">
                                            <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                                            <p className="font-medium">
                                                {kiosk.createdDate ? format(new Date(kiosk.createdDate), "dd/MM/yyyy HH:mm") : "Không có"}
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-medium text-muted-foreground">Ngày cập nhật</h3>
                                        <div className="flex items-center">
                                            <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                                            <p className="font-medium">
                                                {kiosk.updatedDate ? format(new Date(kiosk.updatedDate), "dd/MM/yyyy HH:mm") : "Chưa cập nhật"}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
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

                                    <div>
                                        <h3 className="text-sm font-medium text-muted-foreground">Trạng thái</h3>
                                        <div className="flex items-center">
                                            <Badge className={clsx("mt-1", getBaseStatusColor(kiosk.status))}>
                                                {EBaseStatusViMap[kiosk.status]}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {kiosk.apiKey ? (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center">
                                    <FileText className="mr-2 h-5 w-5" />
                                    API Key
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center space-x-2">
                                    <div className="relative flex-1">
                                        <input
                                            type={showApiKey ? "text" : "password"}
                                            value={kiosk.apiKey || ""}
                                            readOnly
                                            className="w-full px-3 py-2 border rounded-md bg-muted/30"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowApiKey(!showApiKey)}
                                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        >
                                            {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => {
                                            if (kiosk.apiKey) {
                                                navigator.clipboard.writeText(kiosk.apiKey)
                                                toast({
                                                    title: "Thành công",
                                                    description: "Đã sao chép API Key vào clipboard",
                                                })
                                            }
                                        }}
                                    >
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        ""
                    )}

                    {kiosk.webhooks && kiosk.webhooks.length > 0 ? (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center">
                                    <Link className="mr-2 h-5 w-5" />
                                    Webhooks ({kiosk.webhooks?.length || 0})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {
                                        kiosk.webhooks.map((webhook) => (
                                            <div key={webhook.webhookId} className="border rounded-md p-4">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <h4 className="font-medium">{webhook.webhookType}</h4>
                                                        <p className="text-sm text-muted-foreground break-all mt-1">{webhook.webhookUrl}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(webhook.webhookUrl)
                                                                toast({
                                                                    title: "Thành công",
                                                                    description: "Đã sao chép URL vào clipboard",
                                                                })
                                                            }}
                                                        >
                                                            <Copy className="h-4 w-4 mr-2" />
                                                            Sao chép URL
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    }
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        ""
                    )}

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center">
                                <Package className="mr-2 h-5 w-5" />
                                Danh sách thiết bị ({kiosk.kioskDevices?.length || 0})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {kiosk.kioskDevices && kiosk.kioskDevices.length > 0 ? (
                                <DeviceStatusGroup kioskDevices={kiosk.kioskDevices} openReplaceDialog={openReplaceDialog} />
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Package className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                    <p>Không có thiết bị nào được thêm vào kiosk này</p>
                                </div>
                            )}
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
