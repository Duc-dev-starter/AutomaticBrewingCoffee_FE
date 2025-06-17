"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import {
    createDeviceModelInKioskVersion,
    kioskSupportProducts,
    getKioskVersion,
    getSupportProducts,
} from "@/services/kiosk"
import { getDeviceModels } from "@/services/device"
import { getProducts } from "@/services/product"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2, Plus } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import type { KioskVersion, KioskVersionDeviceModelMappings } from "@/interfaces/kiosk"
import type { DeviceModel } from "@/interfaces/device"
import type { Product, SupportProduct } from "@/interfaces/product"
import type { ErrorResponse } from "@/types/error"

const KioskVersionDetailPage = () => {
    const { slug } = useParams()
    const [kioskVersion, setKioskVersion] = useState<KioskVersion | null>(null)
    const [deviceModels, setDeviceModels] = useState<DeviceModel[]>([])
    const [products, setProducts] = useState<Product[]>([])
    const [selectedDeviceModelId, setSelectedDeviceModelId] = useState<string>("")
    const [selectedProductId, setSelectedProductId] = useState<string>("")
    const [quantity, setQuantity] = useState<number>(1)
    const [mappings, setMappings] = useState<KioskVersionDeviceModelMappings[]>([])
    const [supportProducts, setSupportProducts] = useState<SupportProduct[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [addingDevice, setAddingDevice] = useState<boolean>(false)
    const [addingProduct, setAddingProduct] = useState<boolean>(false)

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                if (typeof slug === "string") {
                    // Fetch kiosk version details
                    const versionData = await getKioskVersion(slug)
                    setKioskVersion(versionData.response)

                    if (
                        versionData.response.kioskVersionDeviceModelMappings &&
                        versionData.response.kioskVersionDeviceModelMappings.length > 0
                    ) {
                        setMappings(versionData.response.kioskVersionDeviceModelMappings)
                    }

                    // Fetch support products for this kiosk version
                    const supportProductsData = await getSupportProducts({}, slug)
                    setSupportProducts(supportProductsData.items)
                } else {
                    throw new Error("Slug không hợp lệ")
                }

                const deviceModelsData = await getDeviceModels()
                setDeviceModels(deviceModelsData.items)

                const productsData = await getProducts({ productType: "child" })
                setProducts(productsData.items)
            } catch (error: unknown) {
                const err = error as ErrorResponse
                console.error("Lỗi khi lấy dữ liệu:", err)
                toast({
                    title: "Lỗi khi lấy dữ liệu",
                    description: err.message,
                    variant: "destructive",
                })
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
            const err = error as ErrorResponse
            console.error("Lỗi khi thêm device vào kiosk:", err)
            toast({
                title: "Lỗi khi thêm device vào kiosk",
                description: err.message,
                variant: "destructive",
            })
        } finally {
            setAddingDevice(false)
        }
    }

    const handleAddSupportProduct = async () => {
        if (!selectedProductId) {
            toast({
                title: "Lỗi",
                description: "Vui lòng chọn một sản phẩm.",
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
            setAddingProduct(true)

            const payload = {
                kioskVersionId: slug,
                productId: selectedProductId,
            }

            await kioskSupportProducts(payload)

            const selectedProduct = products.find((product) => product.productId === selectedProductId)

            if (selectedProduct) {
                // Add the new support product to the list with the correct structure
                const newSupportProduct: SupportProduct = {
                    kioskVersionId: slug,
                    productId: selectedProductId,
                    product: selectedProduct,
                }

                setSupportProducts((prev) => [...prev, newSupportProduct])

                toast({
                    title: "Thành công",
                    description: "Đã thêm sản phẩm hỗ trợ.",
                })
            }

            setSelectedProductId("")
        } catch (error: unknown) {
            const err = error as ErrorResponse
            console.error("Lỗi khi thêm sản phẩm hỗ trợ:", err)
            toast({
                title: "Lỗi khi thêm sản phẩm hỗ trợ",
                description: err.message,
                variant: "destructive",
            })
        } finally {
            setAddingProduct(false)
        }
    }


    // Filter out products that are already added as support products
    const availableProducts = products.filter(
        (product) => !supportProducts.some((sp) => sp.productId === product.productId),
    )

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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Add Device Model Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Thêm mẫu thiết bị</CardTitle>
                        <CardDescription>Thêm mẫu thiết bị vào phiên bản kiosk này</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <Select value={selectedDeviceModelId} onValueChange={setSelectedDeviceModelId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn mẫu thiết bị" />
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

                {/* Add Support Product Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Thêm sản phẩm hỗ trợ</CardTitle>
                        <CardDescription>Thêm sản phẩm hỗ trợ vào phiên bản kiosk này</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn sản phẩm" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableProducts.map((product) => (
                                            <SelectItem key={product.productId} value={product.productId}>
                                                {product.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button onClick={handleAddSupportProduct} disabled={!selectedProductId || addingProduct}>
                                {addingProduct ? (
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
            </div>

            {/* Support Products List */}
            <Card>
                <CardHeader>
                    <CardTitle>Danh sách sản phẩm hỗ trợ</CardTitle>
                    <CardDescription>Các sản phẩm đã được thêm vào phiên bản kiosk này</CardDescription>
                </CardHeader>
                <CardContent>
                    {supportProducts.length > 0 ? (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12">STT</TableHead>
                                        <TableHead className="w-14">Hình ảnh</TableHead>
                                        <TableHead>Tên sản phẩm</TableHead>
                                        <TableHead>Mô tả</TableHead>
                                        <TableHead>Giá</TableHead>
                                        <TableHead>Kích thước</TableHead>
                                        <TableHead>Loại</TableHead>
                                        <TableHead>Trạng thái</TableHead>
                                        <TableHead>Hoạt động</TableHead>
                                        <TableHead>Ngày tạo</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {supportProducts.map((item, index) => (
                                        <TableRow key={item.productId}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>
                                                {item.product.imageUrl ? (
                                                    <div className="relative h-10 w-10 overflow-hidden rounded-md">
                                                        <img
                                                            src={item.product.imageUrl || "/placeholder.svg"}
                                                            alt={item.product.name}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                                                        <span className="text-xs text-muted-foreground">N/A</span>
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell className="font-medium">{item.product.name}</TableCell>
                                            <TableCell className="max-w-[200px] truncate" title={item.product.description || "N/A"}>
                                                {item.product.description || "N/A"}
                                            </TableCell>
                                            <TableCell>{item.product.price.toLocaleString()} VND</TableCell>
                                            <TableCell>{item.product.size}</TableCell>
                                            <TableCell>{item.product.type}</TableCell>
                                            <TableCell>
                                                <Badge variant={item.product.status === "Selling" ? "default" : "secondary"}>
                                                    {item.product.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={item.product.isActive ? "default" : "outline"}>
                                                    {item.product.isActive ? "Có" : "Không"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {new Date(item.product.createdDate).toLocaleDateString("vi-VN", {
                                                    year: "numeric",
                                                    month: "2-digit",
                                                    day: "2-digit",
                                                })}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <div className="text-center py-6 text-muted-foreground">
                            Chưa có sản phẩm hỗ trợ nào được thêm vào phiên bản này
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Device Models List */}
            <Card>
                <CardHeader>
                    <CardTitle>Danh sách mẫu thiết bị đã thêm</CardTitle>
                    <CardDescription>Các mẫu thiết bị đã được thêm vào phiên bản kiosk này</CardDescription>
                </CardHeader>
                <CardContent>
                    {mappings.length > 0 ? (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12">STT</TableHead>
                                        <TableHead>Tên Model</TableHead>
                                        <TableHead>Nhà sản xuất</TableHead>
                                        <TableHead>Loại thiết bị</TableHead>
                                        <TableHead>Trạng thái</TableHead>
                                        <TableHead>Ngày tạo</TableHead>
                                        <TableHead className="text-right">Số lượng</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {mappings.map((mapping, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell className="font-medium">{mapping.deviceModel?.modelName || "N/A"}</TableCell>
                                            <TableCell>{mapping.deviceModel?.manufacturer || "N/A"}</TableCell>
                                            <TableCell>{mapping.deviceModel?.deviceType?.name || "N/A"}</TableCell>
                                            <TableCell>
                                                <Badge variant={mapping.deviceModel?.status === "Active" ? "default" : "secondary"}>
                                                    {mapping.deviceModel?.status || "N/A"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {mapping.deviceModel?.createdDate
                                                    ? new Date(mapping.deviceModel.createdDate).toLocaleDateString("vi-VN", {
                                                        year: "numeric",
                                                        month: "2-digit",
                                                        day: "2-digit",
                                                    })
                                                    : "N/A"}
                                            </TableCell>
                                            <TableCell className="text-right font-medium">{mapping.quantity}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <div className="text-center py-6 text-muted-foreground">
                            Chưa có mẫu thiết bị nào được thêm vào phiên bản này
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

export default KioskVersionDetailPage
