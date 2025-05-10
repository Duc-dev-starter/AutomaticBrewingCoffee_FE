"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import type { Device } from "@/interfaces/device"
import { EBaseStatus } from "@/enum/base"
import { createKiosk, updateKiosk } from "@/services/kiosk"
import { getDevices } from "@/services/device"
import { getStores } from "@/services/store"
import { getKioskVersions } from "@/services/kiosk"
import { format } from "date-fns"
import { EDeviceStatus } from "@/enum/device"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { vi } from "date-fns/locale"
import { kioskSchema } from "@/schema/kiosk"
import type { KioskDialogProps } from "@/types/dialog"
import type { KioskVersion } from "@/interfaces/kiosk"
import type { Store } from "@/interfaces/store"
import { X, Cpu } from "lucide-react"
import InfiniteScroll from "react-infinite-scroll-component"

const initialFormData = {
    kioskVersionId: "",
    storeId: "",
    deviceIds: [] as string[],
    location: "",
    status: EBaseStatus.Active,
    installedDate: "",
    position: "",
    warrantyTime: "",
}

const KioskDialog = ({ open, onOpenChange, onSuccess, kiosk }: KioskDialogProps) => {
    const { toast } = useToast()
    const [formData, setFormData] = useState(initialFormData)
    const [kioskVersions, setKioskVersions] = useState<KioskVersion[]>([])
    const [stores, setStores] = useState<Store[]>([])
    const [devices, setDevices] = useState<Device[]>([])
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(false)
    const [deviceSearchQuery, setDeviceSearchQuery] = useState("")
    const [devicePage, setDevicePage] = useState(1)
    const [hasMoreDevices, setHasMoreDevices] = useState(true)
    const [isDeviceDropdownOpen, setIsDeviceDropdownOpen] = useState(false)

    useEffect(() => {
        const fetchData = async () => {
            setFetching(true)
            try {
                const [kioskVersionRes, storeRes, deviceRes] = await Promise.all([
                    getKioskVersions({ status: EBaseStatus.Active }),
                    getStores({ status: EBaseStatus.Active }),
                    getDevices({ status: EDeviceStatus.Stock, page: 1, size: 10 }),
                ])
                setKioskVersions(kioskVersionRes.items)
                setStores(storeRes.items)
                setDevices(deviceRes.items)
                setDevicePage(1)
                setHasMoreDevices(deviceRes.items.length === 10)
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu:", error)
                toast({
                    title: "Lỗi",
                    description: "Không thể tải danh sách phiên bản kiosk, cửa hàng hoặc thiết bị.",
                    variant: "destructive",
                })
            } finally {
                setFetching(false)
            }
        }
        if (open) {
            fetchData()
            if (!kiosk) {
                setFormData(initialFormData)
                setErrors({})
            }
            setIsDeviceDropdownOpen(false) // Đóng dropdown khi mở dialog
        }
    }, [open, toast, kiosk])

    useEffect(() => {
        if (kiosk) {
            setFormData({
                kioskVersionId: kiosk.kioskVersionId || "",
                storeId: kiosk.storeId || "",
                deviceIds: kiosk.devices?.map((d) => d.deviceId) || [],
                location: kiosk.location || "",
                status: kiosk.status || EBaseStatus.Active,
                installedDate: kiosk.installedDate ? format(new Date(kiosk.installedDate), "yyyy-MM-dd") : "",
                position: kiosk.position || "",
                warrantyTime: kiosk.warrantyTime ? format(new Date(kiosk.warrantyTime), "yyyy-MM-dd") : "",
            })
            setErrors({})
        }
    }, [kiosk])

    useEffect(() => {
        if (!open) {
            setFormData(initialFormData)
            setErrors({})
            setIsDeviceDropdownOpen(false) // Đóng dropdown khi đóng dialog
        }
    }, [open])

    const loadMoreDevices = async () => {
        if (fetching || !hasMoreDevices) return

        setFetching(true)
        try {
            const nextPage = devicePage + 1
            const deviceRes = await getDevices({
                status: EDeviceStatus.Stock,
                page: nextPage,
                size: 10,
                filterBy: deviceSearchQuery ? "name" : undefined,
                filterQuery: deviceSearchQuery || undefined,
            })

            if (deviceRes.items.length > 0) {
                setDevices((prev) => [...prev, ...deviceRes.items])
                setDevicePage(nextPage)
                setHasMoreDevices(deviceRes.items.length === 10)
            } else {
                setHasMoreDevices(false)
            }
        } catch (error) {
            console.error("Lỗi khi tải thêm thiết bị:", error)
            toast({
                title: "Lỗi",
                description: "Không thể tải thêm danh sách thiết bị.",
                variant: "destructive",
            })
        } finally {
            setFetching(false)
        }
    }

    const handleDeviceSearch = async (query: string) => {
        setDeviceSearchQuery(query)
        setFetching(true)
        try {
            setDevicePage(1)
            const deviceRes = await getDevices({
                status: EDeviceStatus.Stock,
                page: 1,
                size: 10,
                filterBy: query ? "name" : undefined,
                filterQuery: query || undefined,
            })
            setDevices(deviceRes.items)
            setHasMoreDevices(deviceRes.items.length === 10)
        } catch (error) {
            console.error("Lỗi khi tìm kiếm thiết bị:", error)
            toast({
                title: "Lỗi",
                description: "Không thể tìm kiếm thiết bị.",
                variant: "destructive",
            })
        } finally {
            setFetching(false)
        }
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            if (open && deviceSearchQuery) {
                handleDeviceSearch(deviceSearchQuery)
            }
        }, 300)
        return () => clearTimeout(timer)
    }, [deviceSearchQuery, open])

    const handleSubmit = async () => {
        const validationResult = kioskSchema.safeParse(formData)
        if (!validationResult.success) {
            const fieldErrors = validationResult.error.flatten().fieldErrors
            setErrors(
                Object.fromEntries(Object.entries(fieldErrors).map(([key, messages]) => [key, messages ? messages[0] : ""])),
            )
            return
        }

        setErrors({})
        setLoading(true)
        try {
            const data = {
                kioskVersionId: formData.kioskVersionId,
                storeId: formData.storeId,
                deviceIds: formData.deviceIds,
                location: formData.location,
                status: formData.status,
                installedDate: new Date(formData.installedDate).toISOString(),
                position: formData.position,
                warrantyTime: new Date(formData.warrantyTime).toISOString(),
            }
            if (kiosk) {
                await updateKiosk(kiosk.kioskId, data)
                toast({
                    title: "Thành công",
                    description: `Kiosk tại "${formData.location}" đã được cập nhật.`,
                })
            } else {
                await createKiosk(data)
                toast({
                    title: "Thành công",
                    description: `Kiosk tại "${formData.location}" đã được tạo.`,
                })
            }
            onSuccess?.()
            onOpenChange(false)
        } catch (error) {
            console.error("Lỗi:", error)
            toast({
                title: "Lỗi",
                description: kiosk ? "Không thể cập nhật kiosk." : "Không thể tạo kiosk.",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{kiosk ? "Chỉnh sửa kiosk" : "Thêm kiosk mới"}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2 min-h-[4.5rem]">
                        <Label htmlFor="kioskVersionId">Phiên bản kiosk</Label>
                        <Select
                            value={formData.kioskVersionId}
                            onValueChange={(value) => setFormData({ ...formData, kioskVersionId: value })}
                            disabled={loading || fetching}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn phiên bản kiosk" />
                            </SelectTrigger>
                            <SelectContent>
                                {kioskVersions.map((kv) => (
                                    <SelectItem key={kv.kioskVersionId} value={kv.kioskVersionId}>
                                        {kv.versionTitle}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.kioskVersionId && <p className="text-red-500 text-sm">{errors.kioskVersionId}</p>}
                    </div>
                    <div className="grid gap-2 min-h-[4.5rem]">
                        <Label htmlFor="storeId">Cửa hàng</Label>
                        <Select
                            value={formData.storeId}
                            onValueChange={(value) => setFormData({ ...formData, storeId: value })}
                            disabled={loading || fetching}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn cửa hàng" />
                            </SelectTrigger>
                            <SelectContent>
                                {stores.map((s) => (
                                    <SelectItem key={s.storeId} value={s.storeId}>
                                        {s.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.storeId && <p className="text-red-500 text-sm">{errors.storeId}</p>}
                    </div>
                    <div className="grid gap-2 min-h-[4.5rem]">
                        <Label htmlFor="deviceIds">Thiết bị</Label>
                        <div className="flex flex-col gap-2">
                            <div className="relative">
                                <div className="flex items-center border rounded-md focus-within:ring-1 focus-within:ring-ring">
                                    <Input
                                        placeholder="Tìm kiếm thiết bị..."
                                        className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                                        value={deviceSearchQuery}
                                        onChange={(e) => setDeviceSearchQuery(e.target.value)}
                                        onFocus={() => setIsDeviceDropdownOpen(true)}
                                        disabled={loading || fetching}
                                    />
                                    {deviceSearchQuery && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 mr-1"
                                            onClick={() => setDeviceSearchQuery("")}
                                            disabled={loading || fetching}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                                {isDeviceDropdownOpen && (
                                    <div
                                        className="absolute z-10 w-full mt-1 bg-popover rounded-md border shadow-md max-h-[200px] overflow-y-auto"
                                        id="device-search-results"
                                    >
                                        {devices.length > 0 ? (
                                            <InfiniteScroll
                                                dataLength={devices.length}
                                                next={loadMoreDevices}
                                                hasMore={hasMoreDevices}
                                                loader={<div className="p-2 text-center text-sm">Đang tải thêm...</div>}
                                                scrollableTarget="device-search-results"
                                            >
                                                <div className="p-1">
                                                    {devices.map((d) => (
                                                        <button
                                                            key={d.deviceId}
                                                            className={`w-full text-left px-3 py-2 hover:bg-accent hover:text-accent-foreground rounded-sm flex items-center justify-between ${formData.deviceIds.includes(d.deviceId) ? "bg-accent/50" : ""
                                                                }`}
                                                            onClick={() => {
                                                                if (!formData.deviceIds.includes(d.deviceId)) {
                                                                    setFormData({
                                                                        ...formData,
                                                                        deviceIds: [...formData.deviceIds, d.deviceId],
                                                                    })
                                                                }
                                                            }}
                                                            disabled={formData.deviceIds.includes(d.deviceId)}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <Cpu className="h-4 w-4 text-muted-foreground" />
                                                                <div>
                                                                    <div className="font-medium">{d.name}</div>
                                                                    {d.serialNumber && (
                                                                        <div className="text-xs text-muted-foreground">
                                                                            SN: {d.serialNumber}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            {formData.deviceIds.includes(d.deviceId) && (
                                                                <div className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                                                                    Đã chọn
                                                                </div>
                                                            )}
                                                        </button>
                                                    ))}
                                                </div>
                                                <div className="p-2">
                                                    <Button
                                                        variant="outline"
                                                        className="w-full"
                                                        onClick={() => setIsDeviceDropdownOpen(false)}
                                                    >
                                                        Đóng
                                                    </Button>
                                                </div>
                                            </InfiniteScroll>
                                        ) : (
                                            <div className="p-3 text-center text-sm text-muted-foreground">
                                                {deviceSearchQuery ? "Không tìm thấy thiết bị" : "Không có thiết bị nào"}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            {formData.deviceIds.length > 0 && (
                                <div className="border rounded-md p-2 space-y-2">
                                    <div className="text-sm font-medium">Thiết bị đã chọn ({formData.deviceIds.length})</div>
                                    <ul className="space-y-2">
                                        {formData.deviceIds.map((deviceId) => {
                                            const device = devices.find((d) => d.deviceId === deviceId)
                                            return (
                                                <li key={deviceId} className="flex justify-between items-center p-2 bg-muted/50 rounded-md">
                                                    <div className="flex items-center gap-2">
                                                        <div className="bg-primary/10 text-primary rounded-full p-1">
                                                            <Cpu className="h-4 w-4" />
                                                        </div>
                                                        <span className="font-medium">{device ? device.name : deviceId}</span>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            setFormData({
                                                                ...formData,
                                                                deviceIds: formData.deviceIds.filter((id) => id !== deviceId),
                                                            })
                                                        }
                                                        className="h-8 w-8 p-0"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </li>
                                            )
                                        })}
                                    </ul>
                                </div>
                            )}
                        </div>
                        {errors.deviceIds && <p className="text-red-500 text-sm">{errors.deviceIds}</p>}
                    </div>
                    <div className="grid gap-2 min-h-[4.5rem]">
                        <Label htmlFor="location">Địa chỉ</Label>
                        <Input
                            id="location"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            placeholder="Nhập địa chỉ kiosk"
                            disabled={loading}
                        />
                        {errors.location && <p className="text-red-500 text-sm">{errors.location}</p>}
                    </div>
                    <div className="grid gap-2 min-h-[4.5rem]">
                        <Label htmlFor="position">Vị trí</Label>
                        <Input
                            id="position"
                            value={formData.position}
                            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                            placeholder="Nhập vị trí kiosk"
                            disabled={loading}
                        />
                        {errors.position && <p className="text-red-500 text-sm">{errors.position}</p>}
                    </div>
                    <div className="grid gap-2 min-h-[4.5rem]">
                        <Label htmlFor="status">Trạng thái</Label>
                        <Select
                            value={formData.status}
                            onValueChange={(value) => setFormData({ ...formData, status: value as EBaseStatus })}
                            disabled={loading}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn trạng thái" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={EBaseStatus.Active}>Hoạt động</SelectItem>
                                <SelectItem value={EBaseStatus.Inactive}>Không hoạt động</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.status && <p className="text-red-500 text-sm">{errors.status}</p>}
                    </div>
                    <div className="grid gap-2 min-h-[4.5rem]">
                        <Label htmlFor="installedDate">Ngày lắp đặt</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full justify-start text-left font-normal" disabled={loading}>
                                    <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                                    {formData.installedDate ? (
                                        format(new Date(formData.installedDate), "dd/MM/yyyy")
                                    ) : (
                                        <span>Chọn ngày</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={formData.installedDate ? new Date(formData.installedDate) : undefined}
                                    onSelect={(date) =>
                                        setFormData({
                                            ...formData,
                                            installedDate: date ? format(date, "yyyy-MM-dd") : "",
                                        })
                                    }
                                    locale={vi}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                        {errors.installedDate && <p className="text-red-500 text-sm">{errors.installedDate}</p>}
                    </div>
                    <div className="grid gap-2 min-h-[4.5rem]">
                        <Label htmlFor="warrantyTime">Thời gian bảo hành</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full justify-start text-left font-normal" disabled={loading}>
                                    <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                                    {formData.warrantyTime ? (
                                        format(new Date(formData.warrantyTime), "dd/MM/yyyy")
                                    ) : (
                                        <span>Chọn ngày</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={formData.warrantyTime ? new Date(formData.warrantyTime) : undefined}
                                    onSelect={(date) =>
                                        setFormData({
                                            ...formData,
                                            warrantyTime: date ? format(date, "yyyy-MM-dd") : "",
                                        })
                                    }
                                    locale={vi}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                        {errors.warrantyTime && <p className="text-red-500 text-sm">{errors.warrantyTime}</p>}
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                        Hủy
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading || fetching}>
                        {kiosk ? "Cập nhật" : "Thêm"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default KioskDialog