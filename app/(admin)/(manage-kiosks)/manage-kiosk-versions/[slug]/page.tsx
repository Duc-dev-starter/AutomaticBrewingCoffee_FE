"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { createDeviceModelInKioskVersion } from "@/services/kiosk"
import { getDeviceModels } from "@/services/device"
import { getKioskVersion } from "@/services/kiosk"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2, Plus } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { KioskVersion, KioskVersionDeviceModelMappings } from "@/interfaces/kiosk"
import { DeviceModel } from "@/interfaces/device"
import { ErrorResponse } from "@/types/error"

const KioskVersionDetailPage = () => {
    const { slug } = useParams()
    const [kioskVersion, setKioskVersion] = useState<KioskVersion | null>(null)
    const [deviceModels, setDeviceModels] = useState<DeviceModel[]>([])
    const [selectedDeviceModelId, setSelectedDeviceModelId] = useState("")
    const [quantity, setQuantity] = useState(1)
    const [mappings, setMappings] = useState<KioskVersionDeviceModelMappings[]>([])
    const [loading, setLoading] = useState(true)
    const [addingDevice, setAddingDevice] = useState(false)

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                // Kiểm tra và đảm bảo slug là string
                if (typeof slug === "string") {
                    const versionData = await getKioskVersion(slug)
                    setKioskVersion(versionData.response)

                    // Nếu có mappings, cập nhật state
                    if (versionData.response.kioskVersionDeviceModelMappings && versionData.response.kioskVersionDeviceModelMappings.length > 0) {
                        setMappings(versionData.response.kioskVersionDeviceModelMappings)
                    }
                } else {
                    throw new Error("Slug không hợp lệ")
                }

                // Lấy danh sách device models
                const deviceModelsData = await getDeviceModels()
                setDeviceModels(deviceModelsData.items)
            } catch (error: unknown) {
                const err = error as ErrorResponse;
                console.error("Lỗi khi lấy danh sách kiosk version:", err);
                toast({
                    title: "Lỗi khi lấy danh sách kiosk version",
                    description: err.message,
                    variant: "destructive",
                });
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [slug])

    const handleAddDeviceModel = async () => {
        if (!selectedDeviceModelId || quantity <= 0) {
            toast({
                title: "Lỗi",
                description: "Vui lòng chọn DeviceModel và nhập số lượng hợp lệ.",
                variant: "destructive",
            })
            return
        }

        if (typeof slug !== "string") {
            toast({
                title: "Lỗi",
                description: "Slug không hợp lệ.",
                variant: "destructive",
            })
            return
        }

        try {
            setAddingDevice(true)

            const existingMappingIndex = mappings.findIndex(
                (mapping) => mapping.deviceModel?.deviceModelId === selectedDeviceModelId,
            )

            if (existingMappingIndex !== -1) {
                // Cập nhật số lượng nếu mapping đã tồn tại
                const updatedMappings = [...mappings]
                const newQuantity = updatedMappings[existingMappingIndex].quantity + quantity

                const payload = {
                    kioskVersionId: slug,
                    deviceModelId: selectedDeviceModelId,
                    quantity: newQuantity,
                }

                await createDeviceModelInKioskVersion(payload)
                updatedMappings[existingMappingIndex].quantity = newQuantity
                setMappings(updatedMappings)

                toast({
                    title: "Thành công",
                    description: "Đã cập nhật số lượng thiết bị.",
                })
            } else {
                // Thêm mới mapping
                const payload = {
                    kioskVersionId: slug,
                    deviceModelId: selectedDeviceModelId,
                    quantity,
                }

                await createDeviceModelInKioskVersion(payload)

                const selectedModel = deviceModels.find((model) => model.deviceModelId === selectedDeviceModelId)

                if (selectedModel && kioskVersion) {
                    const newMapping: KioskVersionDeviceModelMappings = {
                        kioskVersionId: slug,
                        deviceModelId: selectedDeviceModelId,
                        kioskVersion: kioskVersion,
                        deviceModel: selectedModel,
                        quantity,
                    }
                    setMappings([...mappings, newMapping])
                } else {
                    toast({
                        title: "Lỗi",
                        description: "Không tìm thấy DeviceModel hoặc KioskVersion.",
                        variant: "destructive",
                    })
                    return
                }

                toast({
                    title: "Thành công",
                    description: "Đã thêm thiết bị mới.",
                })
            }

            setSelectedDeviceModelId("")
        } catch (error: unknown) {
            const err = error as ErrorResponse;
            console.error("Lỗi khi thêm device vào kiosk:", err);
            toast({
                title: "Lỗi khi thêm device vào kiosk",
                description: err.message,
                variant: "destructive",
            });
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

    if (!kioskVersion) {
        return (
            <div className="p-6 text-center">
                <h1 className="text-2xl font-bold text-red-500">Không tìm thấy phiên bản Kiosk</h1>
            </div>
        )
    }

    return (
        <div className="container mx-auto p-6 space-y-8">
            <h1 className="text-3xl font-bold">Chi tiết phiên bản Kiosk</h1>

            {/* Kiosk Version Details Card */}
            <Card>
                <CardHeader>
                    <CardTitle>{kioskVersion.versionTitle}</CardTitle>
                    <CardDescription>Thông tin chi tiết về phiên bản kiosk</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="font-medium">Mô tả:</span>
                            <span>{kioskVersion.description}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-medium">Số phiên bản:</span>
                            <span>{kioskVersion.versionNumber}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-medium">Loại Kiosk:</span>
                            <span>{kioskVersion.kioskType?.name || "N/A"}</span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="font-medium">Trạng thái:</span>
                            <Badge variant={kioskVersion.status === "Active" ? "default" : "secondary"}>{kioskVersion.status}</Badge>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-medium">Ngày tạo:</span>
                            <span>{new Date(kioskVersion.createdDate).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-medium">Ngày cập nhật:</span>
                            <span>
                                {kioskVersion.updatedDate ? new Date(kioskVersion.updatedDate).toLocaleString() : "Chưa cập nhật"}
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Add Device Model Form */}
            <Card>
                <CardHeader>
                    <CardTitle>Thêm DeviceModel</CardTitle>
                    <CardDescription>Thêm thiết bị vào phiên bản kiosk này</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <Select value={selectedDeviceModelId} onValueChange={setSelectedDeviceModelId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn DeviceModel" />
                                </SelectTrigger>
                                <SelectContent>
                                    {deviceModels.map((model) => (
                                        <SelectItem key={model.deviceModelId} value={model.deviceModelId}>
                                            {model.modelName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="w-full md:w-32">
                            <Input
                                type="number"
                                value={quantity}
                                onChange={(e) => setQuantity(Number(e.target.value))}
                                placeholder="Số lượng"
                                min={1}
                            />
                        </div>
                        <Button onClick={handleAddDeviceModel} disabled={!selectedDeviceModelId || quantity <= 0 || addingDevice}>
                            {addingDevice ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Đang thêm...
                                </>
                            ) : (
                                <>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Thêm
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Device Models List */}
            <Card>
                <CardHeader>
                    <CardTitle>Danh sách DeviceModel đã thêm</CardTitle>
                    <CardDescription>Các thiết bị đã được thêm vào phiên bản kiosk này</CardDescription>
                </CardHeader>
                <CardContent>
                    {mappings.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>STT</TableHead>
                                    <TableHead>Tên Model</TableHead>
                                    <TableHead>Nhà sản xuất</TableHead>
                                    <TableHead className="text-right">Số lượng</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mappings.map((mapping, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>{mapping.deviceModel?.modelName || "N/A"}</TableCell>
                                        <TableCell>{mapping.deviceModel?.manufacturer || "N/A"}</TableCell>
                                        <TableCell className="text-right font-medium">{mapping.quantity}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="text-center py-6 text-muted-foreground">
                            Chưa có DeviceModel nào được thêm vào phiên bản này
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

export default KioskVersionDetailPage