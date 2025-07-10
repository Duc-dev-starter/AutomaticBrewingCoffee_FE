"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, Edit, Plus, Settings2, CheckCircle2, AlertCircle, Monitor, Factory, Cpu, Circle, Layers } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createDeviceModel, updateDeviceModel, getDeviceTypes } from "@/services/device.service"
import type { DeviceDialogProps } from "@/types/dialog"
import type { DeviceFunction, DeviceType, DeviceIngredient } from "@/interfaces/device"
import InfiniteScroll from "react-infinite-scroll-component"
import { EBaseStatus, EBaseStatusViMap } from "@/enum/base"
import type { ErrorResponse } from "@/types/error"
import { deviceModelSchema } from "@/schema/device.schema"
import { EFunctionParameterType } from "@/enum/device"
import { DeviceFunctionCard } from "@/components/common/device-function-card"
import { cn } from "@/lib/utils"
import { EBaseUnit, EBaseUnitViMap } from "@/enum/product"
import { FormFooterActions } from "@/components/form"
import { useDebounce } from "@/hooks"
import { parseErrors } from "@/utils"
import { getIngredientTypes } from "@/services/ingredientType.service"
import { IngredientType } from "@/interfaces/ingredient"

const initialFormData = {
    modelName: "",
    manufacturer: "",
    deviceTypeId: "",
    status: EBaseStatus.Active,
    deviceFunctions: [] as DeviceFunction[],
    deviceIngredients: [] as DeviceIngredient[],
}

const DeviceModelDialog = ({ open, onOpenChange, onSuccess, deviceModel }: DeviceDialogProps) => {
    const { toast } = useToast()
    const [errors, setErrors] = useState<Record<string, any>>({})
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState(initialFormData)
    const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([])
    const [ingredientTypes, setIngredientTypes] = useState<IngredientType[]>([])
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const [submitted, setSubmitted] = useState(false)
    const [validFields, setValidFields] = useState<Record<string, boolean>>({})
    const [focusedField, setFocusedField] = useState<string | null>(null)
    const modelNameInputRef = useRef<HTMLInputElement>(null)

    const [deviceTypeSearchQuery, setDeviceTypeSearchQuery] = useState("")
    const debouncedSearchQuery = useDebounce(deviceTypeSearchQuery, 300)

    const isUpdate = !!deviceModel

    const fetchDeviceTypes = async (pageNumber: number, query: string) => {
        try {
            const response = await getDeviceTypes({
                page: pageNumber,
                size: 10,
                filterBy: "name",
                filterQuery: query,
            })
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

    const fetchIngredientTypes = async () => {
        try {
            const response = await getIngredientTypes({ page: 1, size: 1000 })
            setIngredientTypes(response.items)
        } catch (error) {
            console.error("Lỗi khi lấy danh sách loại nguyên liệu:", error)
            toast({
                title: "Lỗi",
                description: "Không thể tải danh sách loại nguyên liệu.",
                variant: "destructive",
            })
        }
    }

    useEffect(() => {
        if (open) {
            fetchDeviceTypes(1, debouncedSearchQuery)
            fetchIngredientTypes()
            setTimeout(() => modelNameInputRef.current?.focus(), 200)
        }
    }, [open, debouncedSearchQuery])

    useEffect(() => {
        if (deviceModel) {
            setFormData({
                modelName: deviceModel.modelName || "",
                manufacturer: deviceModel.manufacturer || "",
                deviceTypeId: deviceModel.deviceTypeId || "",
                status: deviceModel.status || EBaseStatus.Active,
                deviceFunctions: deviceModel.deviceFunctions || [],
                deviceIngredients: deviceModel.deviceIngredients || [],
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
            setIngredientTypes([])
            setHasMore(true)
            setErrors({})
            setSubmitted(false)
            setValidFields({})
            setFocusedField(null)
            setDeviceTypeSearchQuery("")
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
                    label: "",
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
        setErrors((prev) => {
            const newErrors = { ...prev }
            if (Array.isArray(newErrors.deviceFunctions)) {
                newErrors.deviceFunctions = newErrors.deviceFunctions.filter((_, i) => i !== index)
            }
            return newErrors
        })
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

    const addDeviceIngredient = () => {
        setFormData((prev) => ({
            ...prev,
            deviceIngredients: [
                ...prev.deviceIngredients,
                {
                    label: "",
                    ingredientType: "",
                    description: "",
                    maxCapacity: 0,
                    minCapacity: 0,
                    warningPercent: 0,
                    unit: EBaseUnit.Piece,
                    isRenewable: false,
                    isPrimary: false,
                    status: EBaseStatus.Active,
                    deviceFunctionName: "",
                    ingredientSelectorParameter: "",
                    ingredientSelectorValue: "",
                    targetOverrideParameter: "",
                },
            ],
        }))
    }

    const removeDeviceIngredient = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            deviceIngredients: prev.deviceIngredients.filter((_, i) => i !== index),
        }))
        setErrors((prev) => {
            const newErrors = { ...prev }
            if (Array.isArray(newErrors.deviceIngredients)) {
                newErrors.deviceIngredients = newErrors.deviceIngredients.filter((_, i) => i !== index)
            }
            return newErrors
        })
    }

    const handleDeviceIngredientChange = (index: number, field: string, value: any) => {
        setFormData((prev) => {
            const updatedIngredients = [...prev.deviceIngredients]
            updatedIngredients[index] = {
                ...updatedIngredients[index],
                [field]: value,
            }
            return { ...prev, deviceIngredients: updatedIngredients }
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setSubmitted(true)

        const validationResult = deviceModelSchema.safeParse(formData)
        if (!validationResult.success) {
            const parsedErrors = parseErrors(validationResult.error)
            setErrors(parsedErrors)
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
                deviceFunctions: formData.deviceFunctions,
                deviceIngredients: formData.deviceIngredients.map((ingredient) => {
                    const selectedType = ingredientTypes.find((type) => type.ingredientTypeId === ingredient.ingredientType)
                    return {
                        ...ingredient,
                        ingredientType: selectedType ? selectedType.name : "",
                    }
                }),
            }
            console.log("Form data before validation:", formData)
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
        await fetchDeviceTypes(nextPage, debouncedSearchQuery)
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
                                <SelectTrigger className="h-12 text-sm px-4 border-2 bg-white/80 backdrop-blur-sm">
                                    <SelectValue placeholder="Chọn loại thiết bị" />
                                </SelectTrigger>
                                <SelectContent>
                                    <div className="p-2">
                                        <Input
                                            placeholder="Tìm kiếm loại thiết bị..."
                                            className="h-10 text-xs px-3"
                                            value={deviceTypeSearchQuery}
                                            onChange={(e) => setDeviceTypeSearchQuery(e.target.value)}
                                            disabled={loading}
                                        />
                                    </div>
                                    <div id="device-type-scroll" className="max-h-[200px] overflow-y-auto">
                                        <InfiniteScroll
                                            dataLength={deviceTypes.length}
                                            next={loadMoreDeviceTypes}
                                            hasMore={hasMore}
                                            loader={<div className="p-2 text-center text-sm">Đang tải thêm...</div>}
                                            scrollableTarget="device-type-scroll"
                                        >
                                            {deviceTypes.map((deviceType) => (
                                                <SelectItem key={deviceType.deviceTypeId} value={deviceType.deviceTypeId}>
                                                    {deviceType.name}
                                                </SelectItem>
                                            ))}
                                        </InfiniteScroll>
                                    </div>
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
                                <SelectTrigger className="h-12 text-sm px-4 border-2 bg-white/80 backdrop-blur-sm">
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
                                        errors={errors.deviceFunctions?.[index] || {}}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Layers className="h-5 w-5 text-primary-300" />
                                <Label className="text-base font-semibold">Nguyên Liệu Thiết Bị</Label>
                            </div>
                            <Button type="button" variant="outline" onClick={addDeviceIngredient} disabled={loading}>
                                <Plus className="h-4 w-4 mr-2" />
                                Thêm nguyên liệu
                            </Button>
                        </div>

                        {formData.deviceIngredients.length === 0 ? (
                            <div className="text-center py-8 border-2 border-dashed rounded-lg bg-muted/20">
                                <Layers className="h-12 w-12 mx-auto text-muted-foreground mt-2" />
                                <p className="text-muted-foreground mt-4 mb-4">Chưa có nguyên liệu nào được thêm</p>
                                <Button type="button" variant="outline" onClick={addDeviceIngredient} disabled={loading}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Thêm nguyên liệu đầu tiên
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {formData.deviceIngredients.map((ingredient, index) => (
                                    <div key={index} className="p-4 border rounded-lg bg-white shadow-sm">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Label</Label>
                                                <Input
                                                    value={ingredient.label}
                                                    onChange={(e) => handleDeviceIngredientChange(index, "label", e.target.value)}
                                                    placeholder="Nhập label"
                                                    disabled={loading}
                                                />
                                                {submitted && errors.deviceIngredients?.[index]?.label && (
                                                    <p className="text-red-500 text-xs">{errors.deviceIngredients[index].label}</p>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Loại nguyên liệu</Label>
                                                <Select
                                                    value={ingredient.ingredientType}
                                                    onValueChange={(value) => handleDeviceIngredientChange(index, "ingredientType", value)}
                                                    disabled={loading}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Chọn loại nguyên liệu" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {ingredientTypes.map((type) => (
                                                            <SelectItem key={type.ingredientTypeId} value={type.ingredientTypeId}>
                                                                {type.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {submitted && errors.deviceIngredients?.[index]?.ingredientType && (
                                                    <p className="text-red-500 text-xs">{errors.deviceIngredients[index].ingredientType}</p>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Mô tả</Label>
                                                <Input
                                                    value={ingredient.description || ""}
                                                    onChange={(e) => handleDeviceIngredientChange(index, "description", e.target.value)}
                                                    placeholder="Nhập mô tả (tùy chọn)"
                                                    disabled={loading}
                                                />
                                                {submitted && errors.deviceIngredients?.[index]?.description && (
                                                    <p className="text-red-500 text-xs">{errors.deviceIngredients[index].description}</p>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Dung lượng tối đa</Label>
                                                <Input
                                                    type="number"
                                                    value={ingredient.maxCapacity}
                                                    onChange={(e) => handleDeviceIngredientChange(index, "maxCapacity", Number(e.target.value))}
                                                    placeholder="Nhập dung lượng tối đa"
                                                    disabled={loading}
                                                />
                                                {submitted && errors.deviceIngredients?.[index]?.maxCapacity && (
                                                    <p className="text-red-500 text-xs">{errors.deviceIngredients[index].maxCapacity}</p>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Dung lượng tối thiểu</Label>
                                                <Input
                                                    type="number"
                                                    value={ingredient.minCapacity}
                                                    onChange={(e) => handleDeviceIngredientChange(index, "minCapacity", Number(e.target.value))}
                                                    placeholder="Nhập dung lượng tối thiểu"
                                                    disabled={loading}
                                                />
                                                {submitted && errors.deviceIngredients?.[index]?.minCapacity && (
                                                    <p className="text-red-500 text-xs">{errors.deviceIngredients[index].minCapacity}</p>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Phần trăm cảnh báo</Label>
                                                <Input
                                                    type="number"
                                                    value={ingredient.warningPercent}
                                                    onChange={(e) => handleDeviceIngredientChange(index, "warningPercent", Number(e.target.value))}
                                                    placeholder="Nhập phần trăm cảnh báo"
                                                    disabled={loading}
                                                />
                                                {submitted && errors.deviceIngredients?.[index]?.warningPercent && (
                                                    <p className="text-red-500 text-xs">{errors.deviceIngredients[index].warningPercent}</p>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Đơn vị</Label>
                                                <Select
                                                    value={ingredient.unit}
                                                    onValueChange={(value) => handleDeviceIngredientChange(index, "unit", value)}
                                                    disabled={loading}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Chọn đơn vị" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {Object.entries(EBaseUnitViMap).map(([key, value]) => (
                                                            <SelectItem key={key} value={key}>
                                                                {value}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {submitted && errors.deviceIngredients?.[index]?.unit && (
                                                    <p className="text-red-500 text-xs">{errors.deviceIngredients[index].unit}</p>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Có thể làm mới</Label>
                                                <Select
                                                    value={ingredient.isRenewable ? "true" : "false"}
                                                    onValueChange={(value) => handleDeviceIngredientChange(index, "isRenewable", value === "true")}
                                                    disabled={loading}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="true">Có</SelectItem>
                                                        <SelectItem value="false">Không</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                {submitted && errors.deviceIngredients?.[index]?.isRenewable && (
                                                    <p className="text-red-500 text-xs">{errors.deviceIngredients[index].isRenewable}</p>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Trạng thái</Label>
                                                <Select
                                                    value={ingredient.status}
                                                    onValueChange={(value) => handleDeviceIngredientChange(index, "status", value)}
                                                    disabled={loading}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {Object.entries(EBaseStatusViMap).map(([key, value]) => (
                                                            <SelectItem key={key} value={key}>{value}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {submitted && errors.deviceIngredients?.[index]?.status && (
                                                    <p className="text-red-500 text-xs">{errors.deviceIngredients[index].status}</p>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Là chính</Label>
                                                <Select
                                                    value={ingredient.isPrimary ? "true" : "false"}
                                                    onValueChange={(value) => handleDeviceIngredientChange(index, "isPrimary", value === "true")}
                                                    disabled={loading}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="true">Có</SelectItem>
                                                        <SelectItem value="false">Không</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                {submitted && errors.deviceIngredients?.[index]?.isPrimary && (
                                                    <p className="text-red-500 text-xs">{errors.deviceIngredients[index].isPrimary}</p>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Tên chức năng thiết bị (tùy chọn)</Label>
                                                <Input
                                                    value={ingredient.deviceFunctionName || ""}
                                                    onChange={(e) => handleDeviceIngredientChange(index, "deviceFunctionName", e.target.value)}
                                                    placeholder="Nhập tên chức năng thiết bị"
                                                    disabled={loading}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Tham số chọn nguyên liệu (tùy chọn)</Label>
                                                <Input
                                                    value={ingredient.ingredientSelectorParameter || ""}
                                                    onChange={(e) => handleDeviceIngredientChange(index, "ingredientSelectorParameter", e.target.value)}
                                                    placeholder="Nhập tham số chọn nguyên liệu"
                                                    disabled={loading}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Giá trị chọn nguyên liệu (tùy chọn)</Label>
                                                <Input
                                                    value={ingredient.ingredientSelectorValue || ""}
                                                    onChange={(e) => handleDeviceIngredientChange(index, "ingredientSelectorValue", e.target.value)}
                                                    placeholder="Nhập giá trị chọn nguyên liệu"
                                                    disabled={loading}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Tham số ghi đè mục tiêu (tùy chọn)</Label>
                                                <Input
                                                    value={ingredient.targetOverrideParameter || ""}
                                                    onChange={(e) => handleDeviceIngredientChange(index, "targetOverrideParameter", e.target.value)}
                                                    placeholder="Nhập tham số ghi đè mục tiêu"
                                                    disabled={loading}
                                                />
                                            </div>
                                        </div>
                                        <Button
                                            variant="destructive"
                                            className="mt-4"
                                            onClick={() => removeDeviceIngredient(index)}
                                            disabled={loading}
                                        >
                                            Xóa
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                        {submitted && typeof errors.deviceIngredients === "string" && (
                            <p className="text-red-500 text-xs mt-1">{errors.deviceIngredients}</p>
                        )}
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

export default DeviceModelDialog