"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, Loader2, Edit, Plus, Settings2, CheckCircle2, AlertCircle, Save, Zap, Monitor, Factory, Cpu, Circle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createDeviceModel, updateDeviceModel, getDeviceTypes } from "@/services/device"
import type { DeviceDialogProps } from "@/types/dialog"
import type { DeviceFunction, DeviceType } from "@/interfaces/device"
import InfiniteScroll from "react-infinite-scroll-component"
import { EBaseStatus, EBaseStatusViMap } from "@/enum/base"
import type { ErrorResponse } from "@/types/error"
import { deviceModelSchema } from "@/schema/device"
import { EFunctionParameterType } from "@/enum/device"
import { DeviceFunctionCard } from "@/components/common/device-function-card"
import { cn } from "@/lib/utils"

const initialFormData = {
    modelName: "",
    manufacturer: "",
    deviceTypeId: "",
    status: EBaseStatus.Active,
    deviceFunctions: [] as DeviceFunction[],
}

const DeviceModelDialog = ({ open, onOpenChange, onSuccess, deviceModel }: DeviceDialogProps) => {
    const { toast } = useToast()
    const [errors, setErrors] = useState<Record<string, any>>({})
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState(initialFormData)
    const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([])
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const [submitted, setSubmitted] = useState(false)
    const [validFields, setValidFields] = useState<Record<string, boolean>>({})
    const [focusedField, setFocusedField] = useState<string | null>(null)
    const modelNameInputRef = useRef<HTMLInputElement>(null)

    const isUpdate = !!deviceModel

    const fetchDeviceTypes = async (pageNumber: number) => {
        try {
            const response = await getDeviceTypes({ page: pageNumber, size: 10 })
            if (pageNumber === 1) {
                setDeviceTypes(response.items)
            } else {
                setDeviceTypes((prev) => [...prev, ...response.items])
            }
            setHasMore(response.items.length === 10)
        } catch (error) {
            console.error("Lỗi khi lấy danh sách loại thiết bị:", error)
            toast({
                title: "Lỗi",
                description: "Không tải được các loại thiết bị.",
                variant: "destructive",
            })
        }
    }

    useEffect(() => {
        if (open) {
            fetchDeviceTypes(1)
            setTimeout(() => modelNameInputRef.current?.focus(), 200)
        }
    }, [open])

    useEffect(() => {
        if (deviceModel) {
            setFormData({
                modelName: deviceModel.modelName || "",
                manufacturer: deviceModel.manufacturer || "",
                deviceTypeId: deviceModel.deviceTypeId || "",
                status: deviceModel.status || EBaseStatus.Active,
                deviceFunctions: deviceModel.deviceFunctions || [],
            })
            setValidFields({
                modelName: deviceModel.modelName?.trim().length >= 1,
                manufacturer: deviceModel.manufacturer?.trim().length >= 1,
            })
        } else {
            setFormData(initialFormData)
            setValidFields({})
        }
        setErrors({})
        setSubmitted(false)
    }, [deviceModel, open])

    useEffect(() => {
        if (!open) {
            setFormData(initialFormData)
            setPage(1)
            setDeviceTypes([])
            setHasMore(true)
            setErrors({})
            setSubmitted(false)
            setValidFields({})
            setFocusedField(null)
        }
    }, [open])

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (open && (e.ctrlKey || e.metaKey) && e.key === "Enter" && !loading) {
                e.preventDefault()
                handleSubmit(new Event("submit") as any)
            }
        }
        document.addEventListener("keydown", handleKeyDown)
        return () => document.removeEventListener("keydown", handleKeyDown)
    }, [open, formData, loading])

    const validateField = (field: string, value: string) => {
        const newValidFields = { ...validFields }
        if (field === "modelName" || field === "manufacturer") {
            newValidFields[field] = value.trim().length >= 1
        }
        setValidFields(newValidFields)
    }

    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }))
        if (field === "modelName" || field === "manufacturer") {
            validateField(field, value)
        }
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }))
        }
    }

    const addDeviceFunction = () => {
        setFormData((prev) => ({
            ...prev,
            deviceFunctions: [
                ...prev.deviceFunctions,
                {
                    name: "",
                    functionParameters: [],
                    status: EBaseStatus.Active,
                },
            ],
        }))
    }

    const removeDeviceFunction = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            deviceFunctions: prev.deviceFunctions.filter((_, i) => i !== index),
        }))
    }

    const handleDeviceFunctionChange = (index: number, field: string, value: string) => {
        setFormData((prev) => {
            const updatedFunctions = [...prev.deviceFunctions]
            updatedFunctions[index] = {
                ...updatedFunctions[index],
                [field]: value,
            }
            return { ...prev, deviceFunctions: updatedFunctions }
        })
    }

    const addFunctionParameter = (functionIndex: number) => {
        setFormData((prev) => {
            const updatedFunctions = [...prev.deviceFunctions]
            updatedFunctions[functionIndex].functionParameters.push({
                name: "",
                min: null,
                options: null,
                max: null,
                description: null,
                type: EFunctionParameterType.Text,
                default: "",
            })
            return { ...prev, deviceFunctions: updatedFunctions }
        })
    }

    const removeFunctionParameter = (functionIndex: number, paramIndex: number) => {
        setFormData((prev) => {
            const updatedFunctions = [...prev.deviceFunctions]
            updatedFunctions[functionIndex].functionParameters = updatedFunctions[functionIndex].functionParameters.filter(
                (_, i) => i !== paramIndex,
            )
            return { ...prev, deviceFunctions: updatedFunctions }
        })
    }

    const handleFunctionParameterChange = (functionIndex: number, paramIndex: number, field: string, value: any) => {
        setFormData((prev) => {
            const updatedFunctions = [...prev.deviceFunctions]
            updatedFunctions[functionIndex].functionParameters[paramIndex] = {
                ...updatedFunctions[functionIndex].functionParameters[paramIndex],
                [field]: value,
            }
            return { ...prev, deviceFunctions: updatedFunctions }
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setSubmitted(true)

        const validationResult = deviceModelSchema.safeParse({
            modelName: formData.modelName,
            manufacturer: formData.manufacturer,
            deviceTypeId: formData.deviceTypeId,
            status: formData.status,
        })
        if (!validationResult.success) {
            const { fieldErrors } = validationResult.error.flatten()
            setErrors(fieldErrors)
            return
        }

        setErrors({})
        setLoading(true)
        try {
            const data = {
                modelName: formData.modelName,
                status: formData.status,
                manufacturer: formData.manufacturer,
                deviceTypeId: formData.deviceTypeId,
                deviceFunctions: formData.deviceFunctions.length > 0 ? formData.deviceFunctions : undefined,
            }
            if (deviceModel) {
                await updateDeviceModel(deviceModel.deviceModelId, data)
                toast({
                    title: "Thành công",
                    description: `Cập nhật mẫu thiết bị ${data.modelName} thành công.`,
                })
            } else {
                await createDeviceModel(data)
                toast({
                    title: "Thành công",
                    description: `Thêm mẫu thiết bị ${data.modelName} thành công.`,
                })
            }
            onSuccess?.()
            onOpenChange(false)
        } catch (error) {
            const err = error as ErrorResponse
            console.error("Lỗi khi xử lý mẫu thiết bị:", error)
            toast({
                title: "Lỗi khi xử lý mẫu thiết bị",
                description: err.message,
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    const loadMoreDeviceTypes = async () => {
        const nextPage = page + 1
        await fetchDeviceTypes(nextPage)
        setPage(nextPage)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[800px] p-0 border-0 bg-white backdrop-blur-xl shadow-2xl max-h-[90vh] overflow-y-auto hide-scrollbar">
                <div className="relative overflow-hidden bg-primary-100 rounded-tl-2xl rounded-tr-2xl">
                    <div className="relative px-8 py-6 border-b border-primary-300">
                        <div className="flex items-center space-x-4">
                            <div className="w-14 h-14 bg-gradient-to-r from-primary-400 to-primary-500 rounded-2xl flex items-center justify-center shadow-lg">
                                {isUpdate ? <Edit className="w-7 h-7 text-primary-100" /> : <PlusCircle className="w-7 h-7 text-primary-100" />}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                    {isUpdate ? "Cập nhật Mẫu Thiết Bị" : "Tạo Mẫu Thiết Bị Mới"}
                                </h1>
                                <p className="text-gray-500">{isUpdate ? "Chỉnh sửa thông tin mẫu thiết bị" : "Thêm mẫu thiết bị mới vào hệ thống"}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-8 py-8 pt-2 space-y-8">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <div className="flex items-center space-x-2 mb-2">
                                <Monitor className="w-4 h-4 text-primary-300" />
                                <label className="text-sm font-medium text-gray-700 asterisk">Tên Mẫu Thiết Bị</label>
                            </div>
                            <div className="relative group">
                                <Input
                                    ref={modelNameInputRef}
                                    placeholder="Nhập tên mẫu thiết bị"
                                    value={formData.modelName}
                                    onChange={(e) => handleChange("modelName", e.target.value)}
                                    onFocus={() => setFocusedField("modelName")}
                                    onBlur={() => setFocusedField(null)}
                                    disabled={loading}
                                    className={cn(
                                        "h-12 text-base px-4 border-2 transition-all duration-300 bg-white/80 backdrop-blur-sm pr-10",
                                        focusedField === "modelName" && "border-primary-300 ring-4 ring-primary-100 shadow-lg scale-[1.02]",
                                        validFields.modelName && "border-green-400 bg-green-50/50",
                                        !validFields.modelName && formData.modelName && "border-red-300 bg-red-50/50"
                                    )}
                                />
                                {validFields.modelName && (
                                    <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500 animate-in zoom-in-50" />
                                )}
                                {!validFields.modelName && formData.modelName && (
                                    <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-400 animate-in zoom-in-50" />
                                )}
                            </div>
                            {submitted && errors.modelName && (
                                <p className="text-red-500 text-xs mt-1">{errors.modelName}</p>
                            )}
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center space-x-2 mb-2">
                                <Factory className="w-4 h-4 text-primary-300" />
                                <label className="text-sm font-medium text-gray-700 asterisk">Nhà Sản Xuất</label>
                            </div>
                            <div className="relative group">
                                <Input
                                    placeholder="Nhập nhà sản xuất"
                                    value={formData.manufacturer}
                                    onChange={(e) => handleChange("manufacturer", e.target.value)}
                                    onFocus={() => setFocusedField("manufacturer")}
                                    onBlur={() => setFocusedField(null)}
                                    disabled={loading}
                                    className={cn(
                                        "h-12 text-base px-4 border-2 transition-all duration-300 bg-white/80 backdrop-blur-sm pr-10",
                                        focusedField === "manufacturer" && "border-primary-300 ring-4 ring-primary-100 shadow-lg scale-[1.02]",
                                        validFields.manufacturer && "border-green-400 bg-green-50/50",
                                        !validFields.manufacturer && formData.manufacturer && "border-red-300 bg-red-50/50"
                                    )}
                                />
                                {validFields.manufacturer && (
                                    <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500 animate-in zoom-in-50" />
                                )}
                                {!validFields.manufacturer && formData.manufacturer && (
                                    <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-400 animate-in zoom-in-50" />
                                )}
                            </div>
                            {submitted && errors.manufacturer && (
                                <p className="text-red-500 text-xs mt-1">{errors.manufacturer}</p>
                            )}
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center space-x-2 mb-2">
                                <Cpu className="w-4 h-4 text-primary-300" />
                                <label className="text-sm font-medium text-gray-700 asterisk">Loại Thiết Bị</label>
                            </div>
                            <Select
                                value={formData.deviceTypeId}
                                onValueChange={(value) => handleChange("deviceTypeId", value)}
                                disabled={loading}
                            >
                                <SelectTrigger className="h-12 text-base px-4 border-2 bg-white/80 backdrop-blur-sm">
                                    <SelectValue placeholder="Chọn loại thiết bị" />
                                </SelectTrigger>
                                <SelectContent className="max-h-[300px] overflow-y-auto">
                                    <InfiniteScroll
                                        dataLength={deviceTypes.length}
                                        next={loadMoreDeviceTypes}
                                        hasMore={hasMore}
                                        loader={<div className="p-2 text-center text-sm">Đang tải...</div>}
                                        scrollableTarget="select-content"
                                        style={{ overflow: "hidden" }}
                                    >
                                        {deviceTypes.map((deviceType) => (
                                            <SelectItem key={deviceType.deviceTypeId} value={deviceType.deviceTypeId}>
                                                {deviceType.name}
                                            </SelectItem>
                                        ))}
                                    </InfiniteScroll>
                                </SelectContent>
                            </Select>
                            {submitted && errors.deviceTypeId && (
                                <p className="text-red-500 text-xs mt-1">{errors.deviceTypeId}</p>
                            )}
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center space-x-2 mb-2">
                                <Circle className="w-4 h-4 text-primary-300" />
                                <label className="text-sm font-medium text-gray-700 asterisk">Trạng Thái</label>
                            </div>
                            <Select
                                value={formData.status}
                                onValueChange={(value) => handleChange("status", value)}
                                disabled={loading}
                            >
                                <SelectTrigger className="h-12 text-base px-4 border-2 bg-white/80 backdrop-blur-sm">
                                    <SelectValue placeholder="Chọn trạng thái" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(EBaseStatusViMap).map(([key, value]) => (
                                        <SelectItem key={key} value={key}>
                                            {value}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {submitted && errors.status && (
                                <p className="text-red-500 text-xs mt-1">{errors.status}</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Settings2 className="h-5 w-5 text-primary-300" />
                                <Label className="text-base font-semibold">Chức Năng Thiết Bị</Label>
                                <span className="text-sm text-muted-foreground">(tùy chọn)</span>
                            </div>
                            <Button type="button" variant="outline" onClick={addDeviceFunction} disabled={loading}>
                                <Plus className="h-4 w-4 mr-2" />
                                Thêm chức năng
                            </Button>
                        </div>

                        {formData.deviceFunctions.length === 0 ? (
                            <div className="text-center py-8 border-2 border-dashed rounded-lg bg-muted/20">
                                <Settings2 className="h-12 w-12 mx-auto text-muted-foreground mt-2" />
                                <p className="text-muted-foreground mt-4 mb-4">Chưa có chức năng nào được thêm</p>
                                <Button type="button" variant="outline" onClick={addDeviceFunction} disabled={loading}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Thêm chức năng đầu tiên
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {formData.deviceFunctions.map((func, index) => (
                                    <DeviceFunctionCard
                                        key={index}
                                        func={func}
                                        index={index}
                                        onUpdate={handleDeviceFunctionChange}
                                        onRemove={removeDeviceFunction}
                                        onAddParameter={addFunctionParameter}
                                        onRemoveParameter={removeFunctionParameter}
                                        onUpdateParameter={handleFunctionParameterChange}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex justify-between items-center pt-2">
                        <div className="flex items-center space-x-2 text-xs text-gray-400">
                            <Zap className="w-3 h-3" />
                            <span>Ctrl+Enter để lưu • Esc để đóng</span>
                        </div>
                        <div className="flex space-x-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={loading}
                                className="h-11 px-6 border-2 border-gray-300 hover:bg-gray-50 transition-all duration-200"
                            >
                                Hủy
                            </Button>
                            <Button
                                type="button"
                                onClick={handleSubmit}
                                disabled={loading}
                                className={cn(
                                    "h-11 px-8 bg-primary text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105",
                                    loading && "opacity-60 cursor-not-allowed hover:scale-100"
                                )}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Đang xử lý...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 w-4 h-4" />
                                        {isUpdate ? "Cập nhật" : "Tạo"}
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default DeviceModelDialog