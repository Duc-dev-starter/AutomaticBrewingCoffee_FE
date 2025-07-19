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
import { getKiosk, getOnhub, getOnplace } from "@/services/kiosk.service"
import { replaceDeviceByKioskId } from "@/services/kiosk.service"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import type { Kiosk, KioskDevice } from "@/interfaces/kiosk"
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
import { getDevicesToReplace } from "@/services/device.service"
import { DeviceStatusGroup } from "@/components/common/device-status-group"
import { ErrorResponse } from "@/types/error"
import { Webhook } from "@/interfaces/webhook"
import { updateWebhook } from "@/services/webhook.service"
import { Input } from "@/components/ui/input"
import { OnplaceDialog } from "@/components/dialog/kiosk"

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
    const [isOnhubDialogOpen, setIsOnhubDialogOpen] = useState<boolean>(false)
    const [selectedKioskDeviceForOnhub, setSelectedKioskDeviceForOnhub] = useState<any>(null)
    const [onhubData, setOnhubData] = useState<any>(null)
    const [loadingOnhub, setLoadingOnhub] = useState<boolean>(false)
    const [isUpdateWebhookDialogOpen, setIsUpdateWebhookDialogOpen] = useState<boolean>(false)
    const [selectedWebhook, setSelectedWebhook] = useState<any>(null)
    const [newWebhookUrl, setNewWebhookUrl] = useState<string>("")
    const [isOnplaceDialogOpen, setIsOnplaceDialogOpen] = useState<boolean>(false)
    const [selectedKioskDeviceForOnplace, setSelectedKioskDeviceForOnplace] = useState<KioskDevice | null>(null)
    const [onplaceData, setOnplaceData] = useState<any>(null)
    const [loadingOnplace, setLoadingOnplace] = useState<boolean>(false)
    const [isIngredientDialogOpen, setIsIngredientDialogOpen] = useState(false)
    const [selectedDeviceIngredients, setSelectedDeviceIngredients] = useState<any[]>([])

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
            const err = error as ErrorResponse
            console.error("Error fetching data:", error)
            toast({
                title: "Lỗi",
                description: err.message,
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchKioskData()
    }, [slug])

    const fetchOnhubData = async (kioskDeviceId: string) => {
        try {
            setLoadingOnhub(true)
            const response = await getOnhub(kioskDeviceId)
            setOnhubData(response)
        } catch (error) {
            const err = error as ErrorResponse
            console.error("Error fetching onhub data:", error)
            toast({
                title: "Lỗi",
                description: err.message,
                variant: "destructive",
            })
            setOnhubData(null)
        } finally {
            setLoadingOnhub(false)
        }
    }

    const openUpdateWebhookDialog = (webhook: Webhook) => {
        setSelectedWebhook(webhook)
        setNewWebhookUrl(webhook.webhookUrl)
        setIsUpdateWebhookDialogOpen(true)
    }

    const openOnhubDialog = (kioskDevice: KioskDevice) => {
        setSelectedKioskDeviceForOnhub(kioskDevice)
        setIsOnhubDialogOpen(true)
        setOnhubData(null)
        fetchOnhubData(kioskDevice.kioskDeviceMappingId)
    }

    const openOnplaceDialog = async (kioskDevice: KioskDevice) => {
        setSelectedKioskDeviceForOnplace(kioskDevice)
        setIsOnplaceDialogOpen(true)
        setOnplaceData(null)
        setLoadingOnplace(true)
        try {
            if (!kiosk?.kioskId) {
                toast({
                    title: "Lỗi",
                    description: "Không tìm thấy kioskId.",
                    variant: "destructive",
                })
                setOnplaceData(null)
                return
            }
            const data = await getOnplace(kiosk.kioskId, kioskDevice.device.deviceModelId)
            console.log("Onplace data:", data)
            setOnplaceData(data)
        } catch (error) {
            const err = error as ErrorResponse
            console.error("Error fetching onplace data:", error)
            toast({
                title: "Lỗi",
                description: err.message,
                variant: "destructive",
            })
            setOnplaceData(null)
        } finally {
            setLoadingOnplace(false)
        }
    }

    const openReplaceDialog = async (kioskDevice: KioskDevice) => {
        setSelectedKioskDevice(kioskDevice)
        setIsReplaceDialogOpen(true)

        try {
            setLoadingReplacements(true)
            const response = await getDevicesToReplace(kioskDevice.deviceId)
            setReplacementDevices(response.items || [])
        } catch (error) {
            const err = error as ErrorResponse
            console.error("Error fetching replacement devices:", error)
            toast({
                title: "Lỗi",
                description: err.message,
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
                variant: "success",
            })

            await fetchKioskData()
        } catch (error) {
            const err = error as ErrorResponse
            console.error("Error replacing device:", error)
            toast({
                title: "Lỗi",
                description: err.message,
                variant: "destructive",
            })
        } finally {
            setProcessingAction(false)
            setIsReplaceDialogOpen(false)
            setSelectedKioskDevice(null)
            setSelectedReplacementDeviceId("")
        }
    }

    const openIngredientDialog = (kioskDevice: KioskDevice) => {
        setSelectedDeviceIngredients(kioskDevice.device.deviceIngredientStates || [])
        setIsIngredientDialogOpen(true)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-lg">Đang tải dữ liệu...</span>
            </div>
        )
    }

    const handleUpdateWebhook = async () => {
        if (!selectedWebhook || !newWebhookUrl) return

        try {
            await updateWebhook(selectedWebhook.webhookId, { webhookUrl: newWebhookUrl })
            toast({
                title: "Thành công",
                description: "Webhook đã được cập nhật.",
                variant: "success",
            })

            setKiosk((prev) => {
                if (!prev) return prev
                return {
                    ...prev,
                    webhooks: (prev.webhooks ?? []).map((wh) =>
                        wh.webhookId === selectedWebhook.webhookId
                            ? { ...wh, webhookUrl: newWebhookUrl }
                            : wh
                    ),
                }
            })
        } catch (error) {
            const err = error as ErrorResponse
            console.error("Error updating webhook:", error)
            toast({
                title: "Lỗi",
                description: err.message,
                variant: "destructive",
            })
        } finally {
            setIsUpdateWebhookDialogOpen(false)
            setSelectedWebhook(null)
            setNewWebhookUrl("")
        }
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
                                    {kiosk.webhooks.map((webhook) => (
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
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => openUpdateWebhookDialog(webhook)}
                                                    >
                                                        Cập nhật
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
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
                                <DeviceStatusGroup
                                    kioskDevices={kiosk.kioskDevices}
                                    openReplaceDialog={openReplaceDialog}
                                    openOnhubDialog={openOnhubDialog}
                                    openOnplaceDialog={openOnplaceDialog}
                                    openDeviceIngredient={openIngredientDialog}
                                />
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

            <Dialog open={isIngredientDialogOpen} onOpenChange={setIsIngredientDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Thông tin Nguyên liệu của Thiết bị</DialogTitle>
                        <DialogDescription>
                            Danh sách các thành phần (ingredients) của thiết bị đã chọn.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        {selectedDeviceIngredients.length > 0 ? (
                            selectedDeviceIngredients.map((ingredient, index) => (
                                <div key={index} className="border p-4 rounded-md">
                                    <p><strong>Loại Nguyên liệu:</strong> {ingredient.ingredientType}</p>
                                    <p><strong>Dung lượng tối đa:</strong> {ingredient.maxCapacity} {ingredient.unit}</p>
                                    <p><strong>Dung lượng tối thiểu:</strong> {ingredient.minCapacity} {ingredient.unit}</p>
                                    <p><strong>Dung lượng hiện tại:</strong> {ingredient.currentCapacity} {ingredient.unit}</p>
                                    <p><strong>Mức cảnh báo:</strong> {ingredient.warningPercent}%</p>
                                    <p><strong>Trạng thái cảnh báo:</strong> {ingredient.isWarning ? "Có" : "Không"}</p>
                                    <p><strong>Có thể tái tạo:</strong> {ingredient.isRenewable ? "Có" : "Không"}</p>
                                    <p><strong>Chính:</strong> {ingredient.isPrimary ? "Có" : "Không"}</p>
                                </div>
                            ))
                        ) : (
                            <p>Không có thông tin nguyên liệu cho thiết bị này.</p>
                        )}
                    </div>
                    <DialogFooter>
                        <Button onClick={() => setIsIngredientDialogOpen(false)}>Đóng</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <OnplaceDialog
                isOpen={isOnplaceDialogOpen}
                onOpenChange={setIsOnplaceDialogOpen}
                data={onplaceData}
                loading={loadingOnplace}
                // @ts-ignore
                deviceName={selectedKioskDeviceForOnplace || ""}
            />

            <Dialog open={isOnhubDialogOpen} onOpenChange={setIsOnhubDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Thông tin OnHub</DialogTitle>
                        <DialogDescription>
                            Thông tin kết nối của thiết bị "{selectedKioskDeviceForOnhub?.device.name}".
                        </DialogDescription>
                    </DialogHeader>

                    {loadingOnhub ? (
                        <div className="flex items-center justify-center p-4">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    ) : onhubData ? (
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-medium">Trạng thái</h4>
                                <p>{onhubData.status}</p>
                            </div>
                            <div>
                                <h4 className="font-medium">Trạng thái kết nối</h4>
                                <p>{onhubData.connectionState}</p>
                            </div>
                            <div>
                                <h4 className="font-medium">Thời gian cập nhật trạng thái kết nối</h4>
                                <p>{format(new Date(onhubData.connectionStateUpdatedTime), "dd/MM/yyyy HH:mm")}</p>
                            </div>
                            <div>
                                <h4 className="font-medium">Thời gian hoạt động cuối cùng</h4>
                                <p>{format(new Date(onhubData.lastActivityTime), "dd/MM/yyyy HH:mm")}</p>
                            </div>
                            <div>
                                <h4 className="font-medium">Số lượng tin nhắn từ cloud đến thiết bị</h4>
                                <p>{onhubData.cloudToDeviceMessageCount}</p>
                            </div>
                            <div>
                                <h4 className="font-medium">Chuỗi kết nối</h4>
                                <p className="break-all">{onhubData.connectionString}</p>
                            </div>
                        </div>
                    ) : (
                        <p>Không có thông tin OnHub cho thiết bị này.</p>
                    )}

                    <DialogFooter>
                        <Button onClick={() => setIsOnhubDialogOpen(false)}>Đóng</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isUpdateWebhookDialogOpen} onOpenChange={setIsUpdateWebhookDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cập nhật Webhook</DialogTitle>
                        <DialogDescription>
                            Nhập URL mới cho webhook "{selectedWebhook?.webhookType}".
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Input
                            value={newWebhookUrl}
                            onChange={(e) => setNewWebhookUrl(e.target.value)}
                            placeholder="Nhập URL mới"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsUpdateWebhookDialogOpen(false)}>
                            Hủy
                        </Button>
                        <Button onClick={handleUpdateWebhook}>Lưu</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default KioskDetailPage
