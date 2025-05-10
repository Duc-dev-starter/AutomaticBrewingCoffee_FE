"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { format } from "date-fns"
import { EBaseStatusViMap } from "@/enum/base"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Calendar, Clock, FileText, Info, Package, Store, Tag, Plus, ArrowLeft } from "lucide-react"
import clsx from "clsx"
import { getBaseStatusColor } from "@/utils/color"
import { getKiosk, addDeviceInKiosk } from "@/services/kiosk"
import { getDevices } from "@/services/device"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2 } from "lucide-react"
import { Kiosk } from "@/interfaces/kiosk"
import { Device } from "@/interfaces/device"

const KioskDetailPage = () => {
    const { slug } = useParams()
    const router = useRouter()
    const [kiosk, setKiosk] = useState<Kiosk>(null)
    const [loading, setLoading] = useState(true)
    const [availableDevices, setAvailableDevices] = useState<Device[]>([])
    const [selectedDeviceId, setSelectedDeviceId] = useState("")
    const [addingDevice, setAddingDevice] = useState(false)

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                // Fetch kiosk details
                if (slug) {
                    const kioskData = await getKiosk(slug);
                    console.log(kioskData);
                    setKiosk(kioskData.response)
                }

                // Fetch available devices (not assigned to any kiosk)
                const devicesData = await getDevices()
                setAvailableDevices(devicesData.items || [])
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

        fetchData()
    }, [slug])

    const handleAddDevice = async () => {
        if (!selectedDeviceId) {
            toast({
                title: "Lỗi",
                description: "Vui lòng chọn thiết bị để thêm vào kiosk.",
                variant: "destructive",
            })
            return
        }

        try {
            setAddingDevice(true)
            const payload = {
                kioskId: slug,
                deviceId: selectedDeviceId,
            }

            await addDeviceInKiosk(payload)

            // Refresh kiosk data to show the new device
            const updatedKioskData = await (await getKiosk(slug)).response
            setKiosk(updatedKioskData)

            // Remove the added device from available devices
            setAvailableDevices(availableDevices.filter((device) => device.deviceId !== selectedDeviceId))

            // Reset selection
            setSelectedDeviceId("")

            toast({
                title: "Thành công",
                description: "Đã thêm thiết bị vào kiosk.",
            })
        } catch (error) {
            console.error("Lỗi khi thêm thiết bị:", error)
            toast({
                title: "Lỗi",
                description: "Không thể thêm thiết bị. Vui lòng thử lại sau.",
                variant: "destructive",
            })
        } finally {
            setAddingDevice(false)
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
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <Button variant="outline" size="icon" className="mr-4" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h1 className="text-2xl font-bold flex items-center">
                        <Info className="mr-2 h-5 w-5" />
                        Chi tiết Kiosk
                    </h1>
                </div>
                <Badge className={clsx("px-3 py-1", getBaseStatusColor(kiosk.status))}>{EBaseStatusViMap[kiosk.status]}</Badge>
            </div>

            <div className="flex items-center text-sm text-muted-foreground">
                <FileText className="mr-1 h-4 w-4" />
                Mã kiosk: <span className="font-medium ml-1">{kiosk.kioskId}</span>
            </div>

            <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="details">Thông tin chi tiết</TabsTrigger>
                    <TabsTrigger value="devices">Thiết bị ({kiosk.devices?.length || 0})</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-6 mt-6">
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
                </TabsContent>

                <TabsContent value="devices" className="space-y-6 mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center">
                                <Plus className="mr-2 h-5 w-5" />
                                Thêm thiết bị
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1">
                                    <Select value={selectedDeviceId} onValueChange={setSelectedDeviceId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn thiết bị" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableDevices.length > 0 ? (
                                                availableDevices.map((device) => (
                                                    <SelectItem key={device.deviceId} value={device.deviceId}>
                                                        {device.name} - {device.serialNumber}
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <SelectItem value="no-devices" disabled>
                                                    Không có thiết bị khả dụng
                                                </SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <Button
                                    onClick={handleAddDevice}
                                    disabled={!selectedDeviceId || addingDevice}
                                    className="md:w-auto w-full"
                                >
                                    {addingDevice ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Đang thêm...
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Thêm thiết bị
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center">
                                <Package className="mr-2 h-5 w-5" />
                                Danh sách thiết bị ({kiosk.devices?.length || 0})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {kiosk.devices && kiosk.devices.length > 0 ? (
                                    kiosk.devices.map((device) => (
                                        <div key={device.deviceId} className="border rounded-md p-4">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <h4 className="font-medium">{device.name}</h4>
                                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                                        {device.description || "Không có mô tả"}
                                                    </p>
                                                </div>
                                                <Badge className={clsx("ml-2", getBaseStatusColor(device.status))}>
                                                    {EBaseStatusViMap[device.status] || device.status}
                                                </Badge>
                                            </div>

                                            <Separator className="my-3" />

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center text-sm">
                                                        <Tag className="h-3 w-3 mr-1 text-muted-foreground" />
                                                        <span className="text-muted-foreground">Mã thiết bị:</span>
                                                    </div>
                                                    <div className="font-medium text-sm">{device.deviceId}</div>
                                                </div>

                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center text-sm">
                                                        <Tag className="h-3 w-3 mr-1 text-muted-foreground" />
                                                        <span className="text-muted-foreground">Serial Number:</span>
                                                    </div>
                                                    <div className="font-medium text-sm">{device.serialNumber || "N/A"}</div>
                                                </div>

                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center text-sm">
                                                        <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                                                        <span className="text-muted-foreground">Ngày tạo:</span>
                                                    </div>
                                                    <div className="font-medium text-sm">
                                                        {device.createdDate ? format(new Date(device.createdDate), "dd/MM/yyyy") : "N/A"}
                                                    </div>
                                                </div>

                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center text-sm">
                                                        <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                                                        <span className="text-muted-foreground">Ngày cập nhật:</span>
                                                    </div>
                                                    <div className="font-medium text-sm">
                                                        {device.updatedDate ? format(new Date(device.updatedDate), "dd/MM/yyyy") : "Chưa cập nhật"}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <Package className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                        <p>Không có thiết bị nào được thêm vào kiosk này</p>
                                        <p className="text-sm mt-1">Hãy thêm thiết bị bằng form phía trên</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}

export default KioskDetailPage
