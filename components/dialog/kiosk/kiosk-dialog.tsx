"use client"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import type { Device } from "@/interfaces/device"
import { EBaseStatus, EBaseStatusViMap } from "@/enum/base"
import { createKiosk, updateKiosk } from "@/services/kiosk.service"
import { getStores } from "@/services/store.service"
import { getKioskVersions } from "@/services/kiosk.service"
import { getMenus } from "@/services/menu.service"
import { format, isAfter, startOfDay } from "date-fns"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, X, Cpu, MapPin, Settings, Clock, CheckCircle2, AlertCircle } from "lucide-react"
import { vi } from "date-fns/locale"
import { kioskSchema } from "@/schema/kiosk.schema"
import type { KioskDialogProps } from "@/types/dialog"
import type { KioskVersion } from "@/interfaces/kiosk"
import type { Store } from "@/interfaces/store"
import type { Menu } from "@/interfaces/menu"
import InfiniteScroll from "react-infinite-scroll-component"
import type { ErrorResponse } from "@/types/error"
import { getValidDevicesInKiosk } from "@/services/kiosk.service"
import { EnhancedCalendar } from "@/components/common/enhanced-calendar"
import { cn } from "@/lib/utils"
import { useDebounce } from "@/hooks"
import { FormBaseStatusSelectField, FormFooterActions } from "@/components/form"
import { parseErrors } from "@/utils"

const initialFormData = {
    kioskVersionId: "",
    storeId: "",
    deviceIds: [] as string[],
    location: "",
    status: EBaseStatus.Active,
    installedDate: "",
    position: "",
    warrantyTime: "",
    menuId: "",
}

const KioskDialog = ({ open, onOpenChange, onSuccess, kiosk }: KioskDialogProps) => {
    const { toast } = useToast()
    const [formData, setFormData] = useState(initialFormData)
    const [kioskVersions, setKioskVersions] = useState<KioskVersion[]>([])
    const [stores, setStores] = useState<Store[]>([])
    const [menus, setMenus] = useState<Menu[]>([])
    const [validDevices, setValidDevices] = useState<Device[]>([])
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(false)
    const [devicePage, setDevicePage] = useState(1)
    const [hasMoreDevices, setHasMoreDevices] = useState(true)
    const [isDeviceDropdownOpen, setIsDeviceDropdownOpen] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [validFields, setValidFields] = useState<Record<string, boolean>>({})
    const [focusedField, setFocusedField] = useState<string | null>(null)
    const locationInputRef = useRef<HTMLInputElement>(null)

    // Thêm các state cho tìm kiếm
    const [menuSearchQuery, setMenuSearchQuery] = useState("")
    const [kioskVersionSearchQuery, setKioskVersionSearchQuery] = useState("")
    const [storeSearchQuery, setStoreSearchQuery] = useState("")
    const [deviceSearchQuery, setDeviceSearchQuery] = useState("")


    const debouncedMenuSearchQuery = useDebounce(menuSearchQuery, 300)
    const debouncedKioskVersionSearchQuery = useDebounce(kioskVersionSearchQuery, 300)
    const debouncedStoreSearchQuery = useDebounce(storeSearchQuery, 300)
    const debouncedDeviceSearchQuery = useDebounce(deviceSearchQuery, 300)

    const isUpdate = !!kiosk

    useEffect(() => {
        if (!open) {
            setFormData(initialFormData);
            setValidFields({});
            setFocusedField(null);
            setKioskVersions([]);
            setDevicePage(1);
            setHasMoreDevices(true);
            setSubmitted(false);
            setErrors({});
            setMenuSearchQuery("");
            setKioskVersionSearchQuery("");
            setStoreSearchQuery("");
            setDeviceSearchQuery("");
        }
    }, [open]);

    useEffect(() => {
        if (open && kiosk) {
            setFormData({
                kioskVersionId: kiosk.kioskVersionId || "",
                storeId: kiosk.storeId || "",
                deviceIds: kiosk.kioskDevices.map((kd) => kd.deviceId),
                location: kiosk.location || "",
                status: kiosk.status || EBaseStatus.Active,
                installedDate: kiosk.installedDate ? format(new Date(kiosk.installedDate), "yyyy-MM-dd") : "",
                position: kiosk.position || "",
                warrantyTime: kiosk.warrantyTime ? format(new Date(kiosk.warrantyTime), "yyyy-MM-dd") : "",
                menuId: kiosk.menuId || "",
            })
            setValidFields({
                location: kiosk.location?.trim().length >= 1,
                position: kiosk.position?.trim().length >= 1,
                status: true,
            })
        } else if (open) {
            setFormData(initialFormData)
            setValidFields({
                location: false,
                position: false,
                status: true,
            })
        }
    }, [open, kiosk])

    useEffect(() => {
        const fetchData = async () => {
            setFetching(true)
            try {
                const [kioskVersionRes, storeRes, menuRes] = await Promise.all([
                    getKioskVersions({ status: EBaseStatus.Active, filterBy: "versionTitle", filterQuery: debouncedKioskVersionSearchQuery }),
                    getStores({ status: EBaseStatus.Active, filterBy: "name", filterQuery: debouncedStoreSearchQuery }),
                    getMenus({ filterBy: "name", filterQuery: debouncedMenuSearchQuery }),
                ])
                setKioskVersions(kioskVersionRes.items)
                setStores(storeRes.items)
                setMenus(menuRes.items)
            } catch (error) {
                const err = error as ErrorResponse
                console.error("Lỗi khi lấy dữ liệu:", error)
                toast({
                    title: "Lỗi khi lấy dữ liệu",
                    description: err.message,
                    variant: "destructive",
                })
            } finally {
                setFetching(false)
            }
        }
        if (open) {
            fetchData()
            setErrors({})
            setIsDeviceDropdownOpen(false)
        }
    }, [open, toast, debouncedKioskVersionSearchQuery, debouncedStoreSearchQuery, debouncedMenuSearchQuery])

    useEffect(() => {
        if (formData.kioskVersionId) {
            const fetchValidDevices = async () => {
                setFetching(true)
                try {
                    const response = await getValidDevicesInKiosk(formData.kioskVersionId, { page: 1, size: 10, filterBy: "name", filterQuery: debouncedDeviceSearchQuery })
                    setValidDevices(response.items)
                    setHasMoreDevices(response.items.length === 10)
                    setDevicePage(1)
                } catch (error) {
                    const err = error as ErrorResponse
                    console.error("Lỗi khi lấy danh sách thiết bị hợp lệ:", error)
                    toast({
                        title: "Lỗi khi lấy danh sách thiết bị hợp lệ",
                        description: err.message,
                        variant: "destructive",
                    })
                } finally {
                    setFetching(false)
                }
            }
            fetchValidDevices()
        } else {
            setValidDevices([])
            setHasMoreDevices(true)
        }
    }, [formData.kioskVersionId, toast, debouncedDeviceSearchQuery])

    const loadMoreDevices = async () => {
        if (fetching || !hasMoreDevices || !formData.kioskVersionId) return

        setFetching(true)
        try {
            const nextPage = devicePage + 1
            const response = await getValidDevicesInKiosk(formData.kioskVersionId, {
                page: nextPage,
                size: 10,
                filterBy: "name",
                filterQuery: deviceSearchQuery,
            })

            if (response.items.length > 0) {
                setValidDevices((prev) => [...prev, ...response.items])
                setDevicePage(nextPage)
                setHasMoreDevices(response.items.length === 10)
            } else {
                setHasMoreDevices(false)
            }
        } catch (error) {
            const err = error as ErrorResponse
            console.error("Lỗi khi tải thêm thiết bị hợp lệ:", error)
            toast({
                title: "Lỗi khi tải thêm thiết bị hợp lệ",
                description: err.message,
                variant: "destructive",
            })
        } finally {
            setFetching(false)
        }
    }

    const validateField = (field: string, value: string) => {
        const newValidFields = { ...validFields }
        switch (field) {
            case "location":
            case "position":
                newValidFields[field] = value.trim().length >= 1
                break
        }
        setValidFields(newValidFields)
    }

    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
        if (field === "location" || field === "position") {
            validateField(field, value)
        }
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }))
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
            handleSubmit()
        }
    }

    const handleSubmit = async () => {
        setSubmitted(true)
        const validationResult = kioskSchema.safeParse(formData)
        if (!validationResult.success) {
            const parsedErrors = parseErrors(validationResult.error)
            setErrors(parsedErrors)
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
                menuId: formData.menuId || undefined,
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
            const err = error as ErrorResponse
            console.error("Lỗi khi xử lý kiosk:", error)
            toast({
                title: "Lỗi khi xử lý kiosk",
                description: err.message,
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="sm:max-w-[650px] p-0 border-0 bg-white backdrop-blur-xl shadow-2xl max-h-[90vh] overflow-y-auto hide-scrollbar"
                onKeyDown={handleKeyDown}
            >
                <div className="relative overflow-hidden bg-primary-100 rounded-tl-2xl rounded-tr-2xl">
                    <div className="relative px-8 py-6 border-b border-primary-300">
                        <div className="flex items-center space-x-4">
                            <div className="w-14 h-14 bg-gradient-to-r from-primary-400 to-primary-500 rounded-2xl flex items-center justify-center shadow-lg">
                                {isUpdate ? <Settings className="w-7 h-7 text-primary-100" /> : <Cpu className="w-7 h-7 text-primary-100" />}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                    {isUpdate ? "Cập nhật Kiosk" : "Tạo Kiosk Mới"}
                                </h1>
                                <p className="text-gray-500">{isUpdate ? "Chỉnh sửa thông tin kiosk" : "Thêm kiosk mới vào hệ thống"}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-8 py-8 pt-2 space-y-8">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <div className="flex items-center space-x-2 mb-2">
                                <Settings className="w-4 h-4 text-primary-300" />
                                <label className="text-sm font-medium text-gray-700">Thực đơn (tùy chọn)</label>
                            </div>
                            <Select
                                value={formData.menuId}
                                onValueChange={(value) => handleChange("menuId", value)}
                                disabled={loading || fetching}
                            >
                                <SelectTrigger className="h-12 text-sm px-4 border-2 bg-white/80 backdrop-blur-sm">
                                    <SelectValue placeholder="Chọn menu (nếu có)" />
                                </SelectTrigger>
                                <SelectContent>
                                    <div className="p-2">
                                        <Input
                                            placeholder="Tìm kiếm menu..."
                                            className="h-10 text-xs px-3"
                                            value={menuSearchQuery}
                                            onChange={(e) => setMenuSearchQuery(e.target.value)}
                                            disabled={loading}
                                        />
                                    </div>
                                    <div className="max-h-[200px] overflow-y-auto">
                                        {menus.map((menu) => (
                                            <SelectItem key={menu.menuId} value={menu.menuId}>
                                                {menu.name}
                                            </SelectItem>
                                        ))}
                                    </div>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center space-x-2 mb-2">
                                <Cpu className="w-4 h-4 text-primary-300" />
                                <label className="text-sm font-medium text-gray-700 asterisk">Phiên bản kiosk</label>
                            </div>
                            <Select
                                value={formData.kioskVersionId}
                                onValueChange={(value) => handleChange("kioskVersionId", value)}
                                disabled={loading || fetching}
                            >
                                <SelectTrigger className="h-12 text-sm px-4 border-2 bg-white/80 backdrop-blur-sm">
                                    <SelectValue placeholder="Chọn phiên bản kiosk" />
                                </SelectTrigger>
                                <SelectContent>
                                    <div className="p-2">
                                        <Input
                                            placeholder="Tìm kiếm phiên bản kiosk..."
                                            className="h-10 text-xs px-3"
                                            value={kioskVersionSearchQuery}
                                            onChange={(e) => setKioskVersionSearchQuery(e.target.value)}
                                            disabled={loading}
                                        />
                                    </div>
                                    <div className="max-h-[200px] overflow-y-auto">
                                        {kioskVersions.map((kv) => (
                                            <SelectItem key={kv.kioskVersionId} value={kv.kioskVersionId}>
                                                {kv.versionTitle}
                                            </SelectItem>
                                        ))}
                                    </div>
                                </SelectContent>
                            </Select>
                            {submitted && errors.kioskVersionId && (
                                <p className="text-red-500 text-xs mt-1">{errors.kioskVersionId}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <div className="flex items-center space-x-2 mb-2">
                                <MapPin className="w-4 h-4 text-primary-300" />
                                <label className="text-sm font-medium text-gray-700 asterisk">Cửa hàng</label>
                            </div>
                            <Select
                                value={formData.storeId}
                                onValueChange={(value) => handleChange("storeId", value)}
                                disabled={loading || fetching}
                            >
                                <SelectTrigger className="h-12 text-sm px-4 border-2 bg-white/80 backdrop-blur-sm">
                                    <SelectValue placeholder="Chọn cửa hàng" />
                                </SelectTrigger>
                                <SelectContent>
                                    <div className="p-2">
                                        <Input
                                            placeholder="Tìm kiếm cửa hàng..."
                                            className="h-10 text-xs px-3"
                                            value={storeSearchQuery}
                                            onChange={(e) => setStoreSearchQuery(e.target.value)}
                                            disabled={loading}
                                        />
                                    </div>
                                    <div className="max-h-[200px] overflow-y-auto">
                                        {stores.map((s) => (
                                            <SelectItem key={s.storeId} value={s.storeId}>
                                                {s.name}
                                            </SelectItem>
                                        ))}
                                    </div>
                                </SelectContent>
                            </Select>
                            {submitted && errors.storeId && (
                                <p className="text-red-500 text-xs mt-1">{errors.storeId}</p>
                            )}
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center space-x-2 mb-2">
                                <Cpu className="w-4 h-4 text-primary-300" />
                                <label className="text-sm font-medium text-gray-700 asterisk">Thiết bị</label>
                            </div>
                            <div className="relative">
                                <div className="flex items-center border rounded-md focus-within:ring-1 focus-within:ring-ring">
                                    <Input
                                        placeholder="Tìm kiếm thiết bị..."
                                        className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                                        value={deviceSearchQuery}
                                        onChange={(e) => setDeviceSearchQuery(e.target.value)}
                                        onFocus={() => setIsDeviceDropdownOpen(true)}
                                        disabled={loading || fetching || !formData.kioskVersionId}
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
                                        {validDevices.length > 0 ? (
                                            <InfiniteScroll
                                                dataLength={validDevices.length}
                                                next={loadMoreDevices}
                                                hasMore={hasMoreDevices}
                                                loader={<div className="p-2 text-center text-sm">Đang tải thêm...</div>}
                                                scrollableTarget="device-search-results"
                                            >
                                                <div className="p-1">
                                                    {validDevices.map((d) => (
                                                        <button
                                                            key={d.deviceId}
                                                            className={`w-full text-left px-3 py-2 hover:bg-accent hover:text-accent-foreground rounded-sm flex items-center justify-between ${formData.deviceIds.includes(d.deviceId) ? "bg-accent/50" : ""}`}
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
                                                                        <div className="text-xs text-muted-foreground">SN: {d.serialNumber}</div>
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
                                                    <Button variant="outline" className="w-full" onClick={() => setIsDeviceDropdownOpen(false)}>
                                                        Đóng
                                                    </Button>
                                                </div>
                                            </InfiniteScroll>
                                        ) : (
                                            <div className="p-3 text-center text-sm text-muted-foreground">
                                                {formData.kioskVersionId ? "Chưa có thiết bị hợp lệ" : "Vui lòng chọn phiên bản kiosk"}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            {formData.deviceIds.length > 0 && (
                                <div className="border rounded-md p-2 space-y-2 mt-2">
                                    <div className="text-sm font-medium">Thiết bị đã chọn ({formData.deviceIds.length})</div>
                                    <ul className="space-y-2">
                                        {formData.deviceIds.map((deviceId) => {
                                            const device = validDevices.find((d) => d.deviceId === deviceId)
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
                            {submitted && errors.deviceIds && (
                                <p className="text-red-500 text-xs mt-1">{errors.deviceIds}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <div className="flex items-center space-x-2 mb-2">
                                <MapPin className="w-4 h-4 text-primary-300" />
                                <label className="text-sm font-medium text-gray-700">Địa chỉ</label>
                            </div>
                            <div className="relative group">
                                <Input
                                    ref={locationInputRef}
                                    placeholder="Nhập địa chỉ kiosk"
                                    value={formData.location}
                                    onChange={(e) => handleChange("location", e.target.value)}
                                    onFocus={() => setFocusedField("location")}
                                    onBlur={() => setFocusedField(null)}
                                    disabled={loading}
                                    className={cn(
                                        "h-12 text-base px-4 border-2 transition-all duration-300 bg-white/80 backdrop-blur-sm pr-10",
                                        focusedField === "location" && "border-primary-300 ring-4 ring-primary-100 shadow-lg scale-[1.02]",
                                    )}
                                />
                            </div>
                            {submitted && errors.location && (
                                <p className="text-red-500 text-xs mt-1">{errors.location}</p>
                            )}
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center space-x-2 mb-2">
                                <Settings className="w-4 h-4 text-primary-300" />
                                <label className="text-sm font-medium text-gray-700 asterisk">Vị trí</label>
                            </div>
                            <div className="relative group">
                                <Input
                                    placeholder="Nhập vị trí kiosk"
                                    value={formData.position}
                                    onChange={(e) => handleChange("position", e.target.value)}
                                    onFocus={() => setFocusedField("position")}
                                    onBlur={() => setFocusedField(null)}
                                    disabled={loading}
                                    className={cn(
                                        "h-12 text-base px-4 border-2 transition-all duration-300 bg-white/80 backdrop-blur-sm pr-10",
                                        focusedField === "position" && "border-primary-300 ring-4 ring-primary-100 shadow-lg scale-[1.02]",
                                    )}
                                />
                            </div>
                            {submitted && errors.position && (
                                <p className="text-red-500 text-xs mt-1">{errors.position}</p>
                            )}
                        </div>
                    </div>

                    <FormBaseStatusSelectField
                        label="Trạng thái"
                        value={formData.status}
                        onChange={(value) => handleChange("status", value as EBaseStatus)}
                        placeholder="Chọn trạng thái"
                        error={errors.status}
                        focusedField={focusedField}
                        setFocusedField={setFocusedField}
                        submitted={submitted}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <div className="flex items-center space-x-2 mb-2">
                                <Clock className="w-4 h-4 text-primary-300" />
                                <label className="text-sm font-medium text-gray-700 asterisk">Ngày lắp đặt</label>
                            </div>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full justify-start text-left font-normal h-12" disabled={loading}>
                                        <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                                        {formData.installedDate ? (
                                            format(new Date(formData.installedDate), "dd/MM/yyyy")
                                        ) : (
                                            <span>Chọn ngày lắp đặt</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <EnhancedCalendar
                                        mode="single"
                                        selected={formData.installedDate ? new Date(formData.installedDate) : undefined}
                                        onSelect={(date) =>
                                            setFormData({
                                                ...formData,
                                                installedDate: date ? format(date, "yyyy-MM-dd") : "",
                                                warrantyTime: "",
                                            })
                                        }
                                        locale={vi}
                                        initialFocus
                                        disabled={(date) => {
                                            const today = startOfDay(new Date())
                                            return isAfter(startOfDay(date), today)
                                        }}
                                    />
                                </PopoverContent>
                            </Popover>
                            {submitted && errors.installedDate && (
                                <p className="text-red-500 text-xs mt-1">{errors.installedDate}</p>
                            )}
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center space-x-2 mb-2">
                                <Clock className="w-4 h-4 text-primary-300" />
                                <label className="text-sm font-medium text-gray-700 asterisk">Thời gian bảo hành</label>
                            </div>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start text-left font-normal h-12"
                                        disabled={loading || !formData.installedDate}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                                        {formData.warrantyTime ? (
                                            format(new Date(formData.warrantyTime), "dd/MM/yyyy")
                                        ) : (
                                            <span>Chọn ngày bảo hành</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <EnhancedCalendar
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
                                        disabled={(date) => {
                                            if (!formData.installedDate) return true
                                            const installedDate = startOfDay(new Date(formData.installedDate))
                                            return startOfDay(date) < installedDate
                                        }}
                                    />
                                </PopoverContent>
                            </Popover>
                            {submitted && errors.warrantyTime && (
                                <p className="text-red-500 text-xs mt-1">{errors.warrantyTime}</p>
                            )}
                        </div>
                    </div>

                    <FormFooterActions
                        onCancel={() => onOpenChange(false)}
                        onSubmit={handleSubmit}
                        loading={loading}
                        isUpdate={isUpdate}
                    />
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default KioskDialog