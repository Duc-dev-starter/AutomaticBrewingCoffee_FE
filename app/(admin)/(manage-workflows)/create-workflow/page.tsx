"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
    PlusCircle,
    Loader2,
    Trash2,
    ChevronDown,
    ChevronUp,
    Info,
    AlertTriangle,
    Settings,
    Monitor,
    Cpu,
    Search,
    X,
    Zap,
    ActivityIcon as Function,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createWorkflow } from "@/services/workflow"
import { getProducts } from "@/services/product"
import { getDeviceModels } from "@/services/device"
import { getWorkflows } from "@/services/workflow"
import { getKioskVersions } from "@/services/kiosk"
import InfiniteScroll from "react-infinite-scroll-component"
import type { Product } from "@/interfaces/product"
import type { Workflow } from "@/interfaces/workflow"
import type { ErrorResponse } from "@/types/error"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { EWorkflowType, EWorkflowTypeViMap } from "@/enum/workflow"
import { workflowSchema } from "@/schema/workflow"
import { useRouter } from "next/navigation"
import { Path } from "@/constants/path"
import { Checkbox } from "@/components/ui/checkbox"
import JsonEditorComponent from "@/components/common/json-editor"
import { DeviceType } from "@/interfaces/device"
import { KioskVersion } from "@/interfaces/kiosk"
import { PagingParams } from "@/types/paging"


interface FunctionParameter {
    functionParameterId: string
    deviceFunctionId: string
    name: string
    type: string
    min?: string
    options?: string[]
    max?: string
    default?: string
    description?: string
}

interface DeviceFunction {
    deviceFunctionId: string
    deviceModelId: string
    name: string
    functionParameters: FunctionParameter[]
    status: string
}


interface DeviceModel {
    deviceModelId: string
    modelName: string
    manufacturer: string
    deviceTypeId: string
    deviceType: DeviceType
    status: string
    createdDate: string
    updatedDate: string
    deviceFunctions: DeviceFunction[]
}

const initialFormData = {
    name: "",
    description: "",
    type: EWorkflowType.Activity, // Giữ nguyên enum từ mã nguồn
    productId: "", // Chuyển từ null sang "" để nhất quán với JSON (chuỗi rỗng)
    steps: [
        {
            name: "Bước 1",
            type: "",
            deviceModelId: "",
            maxRetries: 0,
            sequence: 1, // Giữ 1 để phù hợp với logic mã nguồn
            callbackWorkflowId: "",
            parameters: "{}",
        },
    ],
}

const CreateWorkflow = () => {
    const router = useRouter()
    const { toast } = useToast()
    const [errors, setErrors] = useState<Record<string, any>>({})
    const [loading, setLoading] = useState<boolean>(false)
    const [formData, setFormData] = useState(initialFormData)
    const [products, setProducts] = useState<Product[]>([])
    const [workflows, setWorkflows] = useState<Workflow[]>([])
    const [page, setPage] = useState<number>(1)
    const [workflowPage, setWorkflowPage] = useState<number>(1)
    const [hasMore, setHasMore] = useState(true)
    const [hasMoreWorkflows, setHasMoreWorkflows] = useState(true)
    const [expandedStep, setExpandedStep] = useState<number | null>(0)
    const [loadingProducts, setLoadingProducts] = useState(true)
    const [loadingWorkflows, setLoadingWorkflows] = useState(false)

    // Kiosk Version states
    const [kioskVersions, setKioskVersions] = useState<KioskVersion[]>([])
    const [kioskVersionSearchQueries, setKioskVersionSearchQueries] = useState<Record<number, string>>({})
    const [kioskVersionPages, setKioskVersionPages] = useState<Record<number, number>>({})
    const [hasMoreKioskVersions, setHasMoreKioskVersions] = useState<Record<number, boolean>>({})
    const [isKioskVersionDropdownOpen, setIsKioskVersionDropdownOpen] = useState<Record<number, boolean>>({})
    const [selectedKioskVersions, setSelectedKioskVersions] = useState<Record<number, KioskVersion | null>>({})

    // Device Model states
    const [deviceModels, setDeviceModels] = useState<Record<number, DeviceModel[]>>({})
    const [deviceModelSearchQueries, setDeviceModelSearchQueries] = useState<Record<number, string>>({})
    const [deviceModelPages, setDeviceModelPages] = useState<Record<number, number>>({})
    const [hasMoreDeviceModels, setHasMoreDeviceModels] = useState<Record<number, boolean>>({})
    const [isDeviceModelDropdownOpen, setIsDeviceModelDropdownOpen] = useState<Record<number, boolean>>({})
    const [selectedDeviceModels, setSelectedDeviceModels] = useState<Record<number, DeviceModel | null>>({})

    // Device Function states
    const [selectedDeviceFunctions, setSelectedDeviceFunctions] = useState<Record<number, DeviceFunction | null>>({})

    // Workflow step types (now as strings)
    const workflowStepTypes = [
        "AlertCancellationCommand",
        "ProcessPayment",
        "DispenseProduct",
        "UpdateInventory",
        "SendNotification",
        "ValidateUser",
        "LogActivity",
        "Custom",
    ]

    // Fetch products
    const fetchProducts = async (pageNumber: number) => {
        setLoadingProducts(true)
        try {
            const response = await getProducts({ page: pageNumber, size: 10 })
            if (pageNumber === 1) {
                setProducts(response.items)
            } else {
                setProducts((prev) => [...prev, ...response.items])
            }
            if (response.items.length < 10) {
                setHasMore(false)
            }
        } catch (error) {
            console.error("Error fetching products:", error)
            toast({
                title: "Lỗi",
                description: "Không tải được danh sách sản phẩm.",
                variant: "destructive",
            })
        } finally {
            setLoadingProducts(false)
        }
    }

    // Fetch workflows
    const fetchWorkflows = async (pageNumber: number) => {
        setLoadingWorkflows(true)
        try {
            const response = await getWorkflows({ page: pageNumber, size: 10 })
            if (pageNumber === 1) {
                setWorkflows(response.items)
            } else {
                setWorkflows((prev) => [...prev, ...response.items])
            }
            setWorkflowPage(pageNumber)
            if (response.items.length < 10) {
                setHasMoreWorkflows(false)
            }
        } catch (error) {
            console.error("Error fetching workflows:", error)
            toast({
                title: "Lỗi",
                description: "Không tải được các quy trình.",
                variant: "destructive",
            })
        } finally {
            setLoadingWorkflows(false)
        }
    }

    // Load kiosk versions for a specific step
    const loadKioskVersions = async (stepIndex: number, page: number, searchQuery: string, reset = false) => {
        try {
            const params: PagingParams = {
                page,
                size: 10,
                status: "Active",
            }

            if (searchQuery.trim()) {
                params.filterBy = "versionTitle"
                params.filterQuery = searchQuery.trim()
            }

            const response = await getKioskVersions(params)

            if (reset || page === 1) {
                setKioskVersions(response.items)
            } else {
                setKioskVersions((prev) => [...prev, ...response.items])
            }

            setKioskVersionPages((prev) => ({ ...prev, [stepIndex]: page }))
            setHasMoreKioskVersions((prev) => ({ ...prev, [stepIndex]: response.items.length === 10 }))
        } catch (error) {
            console.error("Error fetching kiosk versions:", error)
            toast({
                title: "Lỗi",
                description: "Không tải được danh sách phiên bản kiosk.",
                variant: "destructive",
            })
        }
    }

    // Load device models for a specific step
    const loadDeviceModels = async (stepIndex: number, page: number, searchQuery: string, reset = false) => {
        const kioskVersionId = formData.steps[stepIndex]?.kioskVersionId
        if (!kioskVersionId) return

        try {
            const params: PagingParams = {
                page,
                size: 10,
                kioskVersionId,
            }

            if (searchQuery.trim()) {
                params.filterBy = "modelName"
                params.filterQuery = searchQuery.trim()
            }

            const response = await getDeviceModels(params)

            if (reset || page === 1) {
                setDeviceModels((prev) => ({ ...prev, [stepIndex]: response.items }))
            } else {
                setDeviceModels((prev) => ({
                    ...prev,
                    [stepIndex]: [...(prev[stepIndex] || []), ...response.items],
                }))
            }

            setDeviceModelPages((prev) => ({ ...prev, [stepIndex]: page }))
            setHasMoreDeviceModels((prev) => ({ ...prev, [stepIndex]: response.items.length === 10 }))
        } catch (error) {
            console.error("Error fetching device models:", error)
            toast({
                title: "Lỗi",
                description: "Không tải được danh sách mẫu thiết bị.",
                variant: "destructive",
            })
        }
    }

    useEffect(() => {
        fetchProducts(1)
        fetchWorkflows(1)
    }, [])

    // Handle kiosk version search
    useEffect(() => {
        Object.keys(kioskVersionSearchQueries).forEach((stepIndexStr) => {
            const stepIndex = Number.parseInt(stepIndexStr)
            if (isKioskVersionDropdownOpen[stepIndex]) {
                const timeoutId = setTimeout(() => {
                    loadKioskVersions(stepIndex, 1, kioskVersionSearchQueries[stepIndex] || "", true)
                }, 300)
                return () => clearTimeout(timeoutId)
            }
        })
    }, [kioskVersionSearchQueries, isKioskVersionDropdownOpen])

    // Handle device model search
    useEffect(() => {
        Object.keys(deviceModelSearchQueries).forEach((stepIndexStr) => {
            const stepIndex = Number.parseInt(stepIndexStr)
            if (isDeviceModelDropdownOpen[stepIndex] && formData.steps[stepIndex]?.kioskVersionId) {
                const timeoutId = setTimeout(() => {
                    loadDeviceModels(stepIndex, 1, deviceModelSearchQueries[stepIndex] || "", true)
                }, 300)
                return () => clearTimeout(timeoutId)
            }
        })
    }, [deviceModelSearchQueries, isDeviceModelDropdownOpen])

    // Handle form field changes
    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }))

        if (errors[field]) {
            setErrors((prev) => {
                const newErrors = { ...prev }
                delete newErrors[field]
                return newErrors
            })
        }
    }

    const handleStepChange = (index: number, field: string, value: string | number | string[]) => {
        setFormData((prev) => {
            const newSteps = [...prev.steps]
            newSteps[index] = { ...newSteps[index], [field]: value }

            // Reset dependent fields when kiosk version changes
            if (field === "kioskVersionId") {
                newSteps[index].deviceModelId = ""
                newSteps[index].deviceFunctionId = ""
                newSteps[index].selectedFunctionParameters = []
                newSteps[index].parameters = "{}"
                setSelectedDeviceModels((prev) => ({ ...prev, [index]: null }))
                setSelectedDeviceFunctions((prev) => ({ ...prev, [index]: null }))
                setDeviceModels((prev) => ({ ...prev, [index]: [] }))
            }

            // Reset function fields when device model changes
            if (field === "deviceModelId") {
                newSteps[index].deviceFunctionId = ""
                newSteps[index].selectedFunctionParameters = []
                newSteps[index].parameters = "{}"
                setSelectedDeviceFunctions((prev) => ({ ...prev, [index]: null }))
            }

            // Reset parameters when device function changes
            if (field === "deviceFunctionId") {
                newSteps[index].selectedFunctionParameters = []
                newSteps[index].parameters = "{}"
            }

            return { ...prev, steps: newSteps }
        })

        if (errors.steps?.[index]?.[field]) {
            setErrors((prev) => {
                const newErrors = { ...prev }
                if (newErrors.steps && newErrors.steps[index]) {
                    delete newErrors.steps[index][field]
                    if (Object.keys(newErrors.steps[index]).length === 0) {
                        delete newErrors.steps[index]
                        if (Object.keys(newErrors.steps).length === 0) {
                            delete newErrors.steps
                        }
                    }
                }
                return newErrors
            })
        }
    }

    // Handle kiosk version selection
    const handleKioskVersionSelect = (stepIndex: number, kioskVersion: KioskVersion) => {
        setSelectedKioskVersions((prev) => ({ ...prev, [stepIndex]: kioskVersion }))
        handleStepChange(stepIndex, "kioskVersionId", kioskVersion.kioskVersionId)
        setIsKioskVersionDropdownOpen((prev) => ({ ...prev, [stepIndex]: false }))
        setKioskVersionSearchQueries((prev) => ({ ...prev, [stepIndex]: "" }))

        // Load device models for this step
        loadDeviceModels(stepIndex, 1, "", true)
    }

    // Handle device model selection
    const handleDeviceModelSelect = (stepIndex: number, deviceModel: DeviceModel) => {
        setSelectedDeviceModels((prev) => ({ ...prev, [stepIndex]: deviceModel }))
        handleStepChange(stepIndex, "deviceModelId", deviceModel.deviceModelId)
        setIsDeviceModelDropdownOpen((prev) => ({ ...prev, [stepIndex]: false }))
        setDeviceModelSearchQueries((prev) => ({ ...prev, [stepIndex]: "" }))
    }

    // Handle device function selection
    const handleDeviceFunctionSelect = (stepIndex: number, deviceFunction: DeviceFunction) => {
        setSelectedDeviceFunctions((prev) => ({ ...prev, [stepIndex]: deviceFunction }))
        handleStepChange(stepIndex, "deviceFunctionId", deviceFunction.deviceFunctionId)
    }

    // Handle function parameter selection
    const handleFunctionParameterToggle = (stepIndex: number, parameterId: string) => {
        const currentStep = formData.steps[stepIndex]
        const currentParams = currentStep.selectedFunctionParameters || []

        let newParams: string[]
        if (currentParams.includes(parameterId)) {
            newParams = currentParams.filter((id) => id !== parameterId)
        } else {
            newParams = [...currentParams, parameterId]
        }

        handleStepChange(stepIndex, "selectedFunctionParameters", newParams)

        // Update JSON parameters
        updateJsonParameters(stepIndex, newParams)
    }

    // Update JSON parameters based on selected function parameters
    const updateJsonParameters = (stepIndex: number, selectedParameterIds: string[]) => {
        const deviceFunction = selectedDeviceFunctions[stepIndex]
        if (!deviceFunction) return

        const selectedParams = deviceFunction.functionParameters.filter((param) =>
            selectedParameterIds.includes(param.functionParameterId),
        )

        const jsonObject: Record<string, any> = {}
        selectedParams.forEach((param) => {
            let defaultValue = param.default || ""

            // Try to parse default value based on type
            if (param.type === "number" || param.type === "integer") {
                defaultValue = param.default ? Number(param.default) : 0
            } else if (param.type === "boolean") {
                defaultValue = param.default === "true"
            } else if (param.type === "array" && param.options) {
                defaultValue = param.options
            }

            jsonObject[param.name] = defaultValue
        })

        handleStepChange(stepIndex, "parameters", JSON.stringify(jsonObject, null, 2))
    }

    // Add a new step with sequence
    const addStep = () => {
        setFormData((prev) => {
            const newSequence = prev.steps.length + 1
            return {
                ...prev,
                steps: [
                    ...prev.steps,
                    {
                        name: `Bước ${newSequence}`,
                        type: "",
                        kioskVersionId: "",
                        deviceModelId: "",
                        deviceFunctionId: "",
                        selectedFunctionParameters: [],
                        maxRetries: 0,
                        sequence: newSequence,
                        callbackWorkflowId: "",
                        parameters: "{}",
                    },
                ],
            }
        })
        setExpandedStep(formData.steps.length)
    }

    // Remove a step and update sequences
    const removeStep = (index: number) => {
        setFormData((prev) => {
            const newSteps = prev.steps.filter((_, i) => i !== index)
            return {
                ...prev,
                steps: newSteps.map((step, i) => ({
                    ...step,
                    name: `Bước ${i + 1}`,
                    sequence: i + 1,
                })),
            }
        })

        // Clean up step-specific states
        setSelectedKioskVersions((prev) => {
            const newState = { ...prev }
            delete newState[index]
            return newState
        })
        setSelectedDeviceModels((prev) => {
            const newState = { ...prev }
            delete newState[index]
            return newState
        })
        setSelectedDeviceFunctions((prev) => {
            const newState = { ...prev }
            delete newState[index]
            return newState
        })
        setDeviceModels((prev) => {
            const newState = { ...prev }
            delete newState[index]
            return newState
        })

        setExpandedStep(null)
    }

    // Move step up and update sequences
    const moveStepUp = (index: number) => {
        if (index === 0) return
        setFormData((prev) => {
            const newSteps = [...prev.steps]
            const temp = newSteps[index]
            newSteps[index] = newSteps[index - 1]
            newSteps[index - 1] = temp
            return {
                ...prev,
                steps: newSteps.map((step, i) => ({
                    ...step,
                    name: `Bước ${i + 1}`,
                    sequence: i + 1,
                })),
            }
        })
        setExpandedStep(index - 1)
    }

    // Move step down and update sequences
    const moveStepDown = (index: number) => {
        if (index === formData.steps.length - 1) return
        setFormData((prev) => {
            const newSteps = [...prev.steps]
            const temp = newSteps[index]
            newSteps[index] = newSteps[index + 1]
            newSteps[index + 1] = temp
            return {
                ...prev,
                steps: newSteps.map((step, i) => ({
                    ...step,
                    name: `Bước ${i + 1}`,
                    sequence: i + 1,
                })),
            }
        })
        setExpandedStep(index + 1)
    }

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        e.stopPropagation()

        const result = workflowSchema.safeParse(formData)
        if (!result.success) {
            const newErrors = result.error.flatten().fieldErrors
            setErrors(newErrors)
            console.log(newErrors)
            toast({
                title: "Lỗi xác thực",
                description: "Vui lòng kiểm tra lại thông tin đã nhập",
                variant: "destructive",
            })
            return
        }

        setErrors({})
        setLoading(true)
        try {
            const data = {
                name: formData.name,
                description: formData.description || undefined,
                type: formData.type,
                productId: formData.productId,
                steps: formData.steps.map((step) => ({
                    name: step.name,
                    type: step.type,
                    deviceModelId: step.deviceModelId,
                    deviceFunctionId: step.deviceFunctionId,
                    maxRetries: step.maxRetries,
                    sequence: step.sequence,
                    callbackWorkflowId: step.callbackWorkflowId,
                    parameters: step.parameters,
                })),
            } as Partial<Workflow>

            await createWorkflow(data)
            toast({
                title: "Thành công",
                description: "Thêm quy trình mới thành công",
            })
            setFormData(initialFormData)
            setExpandedStep(0)
            router.push(Path.MANAGE_WORKFLOWS)
        } catch (error) {
            const err = error as ErrorResponse
            console.error("Lỗi khi xử lý quy trình:", error)
            toast({
                title: "Lỗi khi xử lý quy trình",
                description: err.message,
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    // Load more products
    const loadMoreProducts = async () => {
        const nextPage = page + 1
        await fetchProducts(nextPage)
        setPage(nextPage)
    }

    return (
        <div className="container mx-auto p-6 space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold flex items-center">
                    <Info className="mr-2 h-5 w-5" />
                    Tạo quy trình mới
                </h1>
                <Button type="submit" disabled={loading} className="bg-blue-500 hover:bg-blue-600" onClick={handleSubmit}>
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Đang xử lý...
                        </>
                    ) : (
                        <>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Tạo quy trình
                        </>
                    )}
                </Button>
            </div>
            <form>
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Left column - Workflow information (35%) */}
                    <div className="w-full md:w-[35%] space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Thông tin quy trình</CardTitle>
                                <CardDescription>Nhập thông tin cơ bản về quy trình</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="flex items-center">
                                        Tên quy trình
                                        <span className="text-red-500 ml-1">*</span>
                                    </Label>
                                    <Input
                                        id="name"
                                        placeholder="Nhập tên quy trình"
                                        value={formData.name}
                                        onChange={(e) => handleChange("name", e.target.value)}
                                        disabled={loading}
                                        className={errors.name ? "border-red-500 focus-visible:ring-red-500" : ""}
                                    />
                                    {errors.name && (
                                        <p className="text-red-500 text-sm flex items-center">
                                            <AlertTriangle className="h-3 w-3 mr-1" />
                                            {errors.name[0]}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="type" className="flex items-center">
                                        Loại quy trình
                                        <span className="text-red-500 ml-1">*</span>
                                    </Label>
                                    <Select
                                        value={formData.type}
                                        onValueChange={(value) => handleChange("type", value)}
                                        disabled={loading}
                                    >
                                        <SelectTrigger id="type" className={errors.type ? "border-red-500 focus-visible:ring-red-500" : ""}>
                                            <SelectValue placeholder="Chọn loại quy trình" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.values(EWorkflowType).map((type) => (
                                                <SelectItem key={type} value={type} className="flex items-center">
                                                    <div className="flex items-center">{EWorkflowTypeViMap[type]}</div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.type && (
                                        <p className="text-red-500 text-sm flex items-center">
                                            <AlertTriangle className="h-3 w-3 mr-1" />
                                            {errors.type[0]}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="productId" className="flex items-center">
                                        Sản phẩm
                                    </Label>
                                    <Select
                                        value={formData.productId || ""}
                                        onValueChange={(value) => handleChange("productId", value)}
                                        disabled={loading}
                                    >
                                        <SelectTrigger
                                            id="productId"
                                            className={errors.productId ? "border-red-500 focus-visible:ring-red-500" : ""}
                                        >
                                            <SelectValue placeholder={loadingProducts ? "Đang tải sản phẩm..." : "Chọn sản phẩm"} />
                                        </SelectTrigger>
                                        <SelectContent className="max-h-[300px]">
                                            <ScrollArea className="h-[200px]">
                                                <InfiniteScroll
                                                    dataLength={products.length}
                                                    next={loadMoreProducts}
                                                    hasMore={hasMore}
                                                    loader={<div className="p-2 text-center text-sm">Đang tải thêm...</div>}
                                                    scrollableTarget="select-content"
                                                    style={{ overflow: "hidden" }}
                                                >
                                                    {products.map((product) => (
                                                        <SelectItem key={product.productId} value={product.productId}>
                                                            {product.name}
                                                        </SelectItem>
                                                    ))}
                                                </InfiniteScroll>
                                            </ScrollArea>
                                        </SelectContent>
                                    </Select>
                                    {errors.productId && (
                                        <p className="text-red-500 text-sm flex items-center">
                                            <AlertTriangle className="h-3 w-3 mr-1" />
                                            {errors.productId[0]}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description" className="flex items-center">
                                        Mô tả
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Info className="h-3.5 w-3.5 ml-1 text-gray-400" />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Mô tả chi tiết về quy trình này</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Nhập mô tả quy trình"
                                        value={formData.description}
                                        onChange={(e) => handleChange("description", e.target.value)}
                                        disabled={loading}
                                        className="min-h-[120px]"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right column - Steps (65%) */}
                    <div className="w-full md:w-[65%]">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>Các bước thực hiện</CardTitle>
                                    <CardDescription>Thêm và quản lý các bước của quy trình</CardDescription>
                                </div>
                                <Button type="button" onClick={addStep} disabled={loading} className="bg-blue-500 hover:bg-blue-600">
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Thêm bước
                                </Button>
                            </CardHeader>
                            <CardContent>
                                {formData.steps.length === 0 ? (
                                    <div className="text-center py-12 border-2 border-dashed rounded-lg">
                                        <Settings className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                                        <p className="text-gray-500">Chưa có bước nào được thêm vào</p>
                                        <Button type="button" onClick={addStep} variant="outline" className="mt-4">
                                            <PlusCircle className="mr-2 h-4 w-4" />
                                            Thêm bước đầu tiên
                                        </Button>
                                    </div>
                                ) : (
                                    <Accordion
                                        type="single"
                                        collapsible
                                        value={expandedStep !== null ? expandedStep.toString() : undefined}
                                        onValueChange={(value) => setExpandedStep(value ? Number.parseInt(value) : null)}
                                        className="space-y-3"
                                    >
                                        {formData.steps.map((step, index) => (
                                            <AccordionItem
                                                key={index}
                                                value={index.toString()}
                                                className="border rounded-md overflow-hidden bg-white dark:bg-gray-800"
                                            >
                                                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                                                    <div className="flex items-center justify-between w-full">
                                                        <div className="flex items-center">
                                                            <Badge variant="outline" className="mr-3 bg-blue-50 text-blue-700 border-blue-200">
                                                                {step.sequence}
                                                            </Badge>
                                                            <span className="font-medium">{step.name}</span>
                                                            {step.type && (
                                                                <Badge variant="secondary" className="ml-3">
                                                                    {step.type}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center space-x-1 mr-4">
                                                            <div
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    moveStepUp(index)
                                                                }}
                                                                className={`h-7 w-7 rounded-full flex items-center justify-center ${loading || index === 0 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"}`}
                                                            >
                                                                <ChevronUp className="h-4 w-4" />
                                                            </div>
                                                            <div
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    moveStepDown(index)
                                                                }}
                                                                className={`h-7 w-7 rounded-full flex items-center justify-center ${loading || index === formData.steps.length - 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"}`}
                                                            >
                                                                <ChevronDown className="h-4 w-4" />
                                                            </div>
                                                            <div
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    removeStep(index)
                                                                }}
                                                                className={`h-7 w-7 rounded-full flex items-center justify-center ${loading ? "opacity-50 cursor-not-allowed" : "text-red-500 hover:text-red-700 hover:bg-red-50"}`}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </AccordionTrigger>
                                                <AccordionContent className="px-4 pb-4 pt-2">
                                                    <div className="space-y-6">
                                                        {/* Basic step info */}
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                            <div className="space-y-2">
                                                                <Label htmlFor={`step-sequence-${index}`}>Thứ tự</Label>
                                                                <Input
                                                                    id={`step-sequence-${index}`}
                                                                    type="number"
                                                                    value={step.sequence}
                                                                    readOnly={true}
                                                                    disabled={loading}
                                                                    className={errors.steps?.[index]?.sequence ? "border-red-500" : ""}
                                                                />
                                                                {errors.steps?.[index]?.sequence && (
                                                                    <p className="text-red-500 text-sm">{errors.steps[index].sequence[0]}</p>
                                                                )}
                                                            </div>

                                                            <div className="space-y-2">
                                                                <Label htmlFor={`step-name-${index}`}>Tên bước</Label>
                                                                <Input
                                                                    id={`step-name-${index}`}
                                                                    value={step.name}
                                                                    onChange={(e) => handleStepChange(index, "name", e.target.value)}
                                                                    disabled={loading}
                                                                    className={errors.steps?.[index]?.name ? "border-red-500" : ""}
                                                                />
                                                                {errors.steps?.[index]?.name && (
                                                                    <p className="text-red-500 text-sm">{errors.steps[index].name[0]}</p>
                                                                )}
                                                            </div>

                                                            <div className="space-y-2">
                                                                <Label htmlFor={`step-type-${index}`}>Loại bước</Label>
                                                                <Select
                                                                    value={step.type}
                                                                    onValueChange={(value) => handleStepChange(index, "type", value)}
                                                                    disabled={loading}
                                                                >
                                                                    <SelectTrigger id={`step-type-${index}`}>
                                                                        <SelectValue placeholder="Chọn loại bước" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {workflowStepTypes.map((type) => (
                                                                            <SelectItem key={type} value={type}>
                                                                                {type}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                                {errors.steps?.[index]?.type && (
                                                                    <p className="text-red-500 text-sm">{errors.steps[index].type[0]}</p>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Kiosk Version Selection */}
                                                        <Card className="border-dashed">
                                                            <CardHeader className="pb-3">
                                                                <CardTitle className="text-sm flex items-center gap-2">
                                                                    <Monitor className="h-4 w-4" />
                                                                    Bước 1: Chọn phiên bản kiosk
                                                                </CardTitle>
                                                            </CardHeader>
                                                            <CardContent>
                                                                <div className="relative">
                                                                    <div className="flex items-center border rounded-md focus-within:ring-1 focus-within:ring-ring">
                                                                        <Search className="h-4 w-4 ml-3 text-muted-foreground" />
                                                                        <Input
                                                                            placeholder="Tìm kiếm phiên bản kiosk..."
                                                                            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                                                                            value={
                                                                                selectedKioskVersions[index]
                                                                                    ? selectedKioskVersions[index]!.versionTitle
                                                                                    : kioskVersionSearchQueries[index] || ""
                                                                            }
                                                                            onChange={(e) => {
                                                                                if (!selectedKioskVersions[index]) {
                                                                                    setKioskVersionSearchQueries((prev) => ({ ...prev, [index]: e.target.value }))
                                                                                }
                                                                            }}
                                                                            onFocus={() => {
                                                                                if (!selectedKioskVersions[index]) {
                                                                                    setIsKioskVersionDropdownOpen((prev) => ({ ...prev, [index]: true }))
                                                                                    loadKioskVersions(index, 1, kioskVersionSearchQueries[index] || "", true)
                                                                                }
                                                                            }}
                                                                            disabled={loading}
                                                                            readOnly={!!selectedKioskVersions[index]}
                                                                        />
                                                                        {selectedKioskVersions[index] && (
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                className="h-8 w-8 mr-1"
                                                                                onClick={() => {
                                                                                    setSelectedKioskVersions((prev) => ({ ...prev, [index]: null }))
                                                                                    handleStepChange(index, "kioskVersionId", "")
                                                                                    setKioskVersionSearchQueries((prev) => ({ ...prev, [index]: "" }))
                                                                                }}
                                                                                disabled={loading}
                                                                            >
                                                                                <X className="h-4 w-4" />
                                                                            </Button>
                                                                        )}
                                                                    </div>
                                                                    {isKioskVersionDropdownOpen[index] && !selectedKioskVersions[index] && (
                                                                        <div className="absolute z-10 w-full mt-1 bg-popover rounded-md border shadow-md max-h-[200px] overflow-y-auto">
                                                                            {kioskVersions.length > 0 ? (
                                                                                <InfiniteScroll
                                                                                    dataLength={kioskVersions.length}
                                                                                    next={() =>
                                                                                        loadKioskVersions(
                                                                                            index,
                                                                                            (kioskVersionPages[index] || 1) + 1,
                                                                                            kioskVersionSearchQueries[index] || "",
                                                                                        )
                                                                                    }
                                                                                    hasMore={hasMoreKioskVersions[index] || false}
                                                                                    loader={<div className="p-2 text-center text-sm">Đang tải thêm...</div>}
                                                                                >
                                                                                    <div className="p-1">
                                                                                        {kioskVersions.map((kv) => (
                                                                                            <button
                                                                                                key={kv.kioskVersionId}
                                                                                                className="w-full text-left px-3 py-2 hover:bg-accent hover:text-accent-foreground rounded-sm flex items-center gap-2"
                                                                                                onClick={() => handleKioskVersionSelect(index, kv)}
                                                                                            >
                                                                                                <Monitor className="h-4 w-4 text-muted-foreground" />
                                                                                                <div>
                                                                                                    <div className="font-medium">{kv.versionTitle}</div>
                                                                                                    {kv.description && (
                                                                                                        <div className="text-xs text-muted-foreground">
                                                                                                            {kv.description}
                                                                                                        </div>
                                                                                                    )}
                                                                                                </div>
                                                                                            </button>
                                                                                        ))}
                                                                                    </div>
                                                                                    <div className="p-2">
                                                                                        <Button
                                                                                            variant="outline"
                                                                                            className="w-full"
                                                                                            onClick={() =>
                                                                                                setIsKioskVersionDropdownOpen((prev) => ({ ...prev, [index]: false }))
                                                                                            }
                                                                                        >
                                                                                            Đóng
                                                                                        </Button>
                                                                                    </div>
                                                                                </InfiniteScroll>
                                                                            ) : (
                                                                                <div className="p-3 text-center text-sm text-muted-foreground">
                                                                                    Không tìm thấy phiên bản kiosk
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                {selectedKioskVersions[index] && (
                                                                    <div className="mt-2 p-2 bg-muted/50 rounded-md">
                                                                        <div className="flex items-center gap-2">
                                                                            <Badge variant="secondary" className="text-xs">
                                                                                Đã chọn
                                                                            </Badge>
                                                                            <span className="text-sm font-medium">
                                                                                {selectedKioskVersions[index]!.versionTitle}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </CardContent>
                                                        </Card>

                                                        {/* Device Model Selection */}
                                                        {selectedKioskVersions[index] && (
                                                            <Card className="border-dashed">
                                                                <CardHeader className="pb-3">
                                                                    <CardTitle className="text-sm flex items-center gap-2">
                                                                        <Cpu className="h-4 w-4" />
                                                                        Bước 2: Chọn mẫu thiết bị
                                                                    </CardTitle>
                                                                </CardHeader>
                                                                <CardContent>
                                                                    <div className="relative">
                                                                        <div className="flex items-center border rounded-md focus-within:ring-1 focus-within:ring-ring">
                                                                            <Search className="h-4 w-4 ml-3 text-muted-foreground" />
                                                                            <Input
                                                                                placeholder="Tìm kiếm mẫu thiết bị..."
                                                                                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                                                                                value={
                                                                                    selectedDeviceModels[index]
                                                                                        ? selectedDeviceModels[index]!.modelName
                                                                                        : deviceModelSearchQueries[index] || ""
                                                                                }
                                                                                onChange={(e) => {
                                                                                    if (!selectedDeviceModels[index]) {
                                                                                        setDeviceModelSearchQueries((prev) => ({
                                                                                            ...prev,
                                                                                            [index]: e.target.value,
                                                                                        }))
                                                                                    }
                                                                                }}
                                                                                onFocus={() => {
                                                                                    if (!selectedDeviceModels[index]) {
                                                                                        setIsDeviceModelDropdownOpen((prev) => ({ ...prev, [index]: true }))
                                                                                        loadDeviceModels(index, 1, deviceModelSearchQueries[index] || "", true)
                                                                                    }
                                                                                }}
                                                                                disabled={loading}
                                                                                readOnly={!!selectedDeviceModels[index]}
                                                                            />
                                                                            {selectedDeviceModels[index] && (
                                                                                <Button
                                                                                    variant="ghost"
                                                                                    size="icon"
                                                                                    className="h-8 w-8 mr-1"
                                                                                    onClick={() => {
                                                                                        setSelectedDeviceModels((prev) => ({ ...prev, [index]: null }))
                                                                                        handleStepChange(index, "deviceModelId", "")
                                                                                        setDeviceModelSearchQueries((prev) => ({ ...prev, [index]: "" }))
                                                                                    }}
                                                                                    disabled={loading}
                                                                                >
                                                                                    <X className="h-4 w-4" />
                                                                                </Button>
                                                                            )}
                                                                        </div>
                                                                        {isDeviceModelDropdownOpen[index] && !selectedDeviceModels[index] && (
                                                                            <div className="absolute z-10 w-full mt-1 bg-popover rounded-md border shadow-md max-h-[200px] overflow-y-auto">
                                                                                {(deviceModels[index] || []).length > 0 ? (
                                                                                    <InfiniteScroll
                                                                                        dataLength={(deviceModels[index] || []).length}
                                                                                        next={() =>
                                                                                            loadDeviceModels(
                                                                                                index,
                                                                                                (deviceModelPages[index] || 1) + 1,
                                                                                                deviceModelSearchQueries[index] || "",
                                                                                            )
                                                                                        }
                                                                                        hasMore={hasMoreDeviceModels[index] || false}
                                                                                        loader={<div className="p-2 text-center text-sm">Đang tải thêm...</div>}
                                                                                    >
                                                                                        <div className="p-1">
                                                                                            {(deviceModels[index] || []).map((dm) => (
                                                                                                <button
                                                                                                    key={dm.deviceModelId}
                                                                                                    className="w-full text-left px-3 py-2 hover:bg-accent hover:text-accent-foreground rounded-sm flex items-center gap-2"
                                                                                                    onClick={() => handleDeviceModelSelect(index, dm)}
                                                                                                >
                                                                                                    <Cpu className="h-4 w-4 text-muted-foreground" />
                                                                                                    <div>
                                                                                                        <div className="font-medium">{dm.modelName}</div>
                                                                                                        <div className="text-xs text-muted-foreground">
                                                                                                            {dm.manufacturer}
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </button>
                                                                                            ))}
                                                                                        </div>
                                                                                        <div className="p-2">
                                                                                            <Button
                                                                                                variant="outline"
                                                                                                className="w-full"
                                                                                                onClick={() =>
                                                                                                    setIsDeviceModelDropdownOpen((prev) => ({ ...prev, [index]: false }))
                                                                                                }
                                                                                            >
                                                                                                Đóng
                                                                                            </Button>
                                                                                        </div>
                                                                                    </InfiniteScroll>
                                                                                ) : (
                                                                                    <div className="p-3 text-center text-sm text-muted-foreground">
                                                                                        Không tìm thấy mẫu thiết bị
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    {selectedDeviceModels[index] && (
                                                                        <div className="mt-2 p-2 bg-muted/50 rounded-md">
                                                                            <div className="flex items-center gap-2">
                                                                                <Badge variant="secondary" className="text-xs">
                                                                                    Đã chọn
                                                                                </Badge>
                                                                                <span className="text-sm font-medium">
                                                                                    {selectedDeviceModels[index]!.modelName}
                                                                                </span>
                                                                            </div>
                                                                            <div className="text-xs text-muted-foreground mt-1">
                                                                                {selectedDeviceModels[index]!.manufacturer} •{" "}
                                                                                {selectedDeviceModels[index]!.deviceType.name}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </CardContent>
                                                            </Card>
                                                        )}

                                                        {/* Device Function Selection */}
                                                        {selectedDeviceModels[index] && (
                                                            <Card className="border-dashed">
                                                                <CardHeader className="pb-3">
                                                                    <CardTitle className="text-sm flex items-center gap-2">
                                                                        <Function className="h-4 w-4" />
                                                                        Bước 3: Chọn chức năng thiết bị
                                                                    </CardTitle>
                                                                </CardHeader>
                                                                <CardContent>
                                                                    {selectedDeviceModels[index]!.deviceFunctions.length === 0 ? (
                                                                        <div className="text-center py-4 text-muted-foreground">
                                                                            <Function className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                                                            <p>Thiết bị này không có chức năng nào</p>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="space-y-2">
                                                                            {selectedDeviceModels[index]!.deviceFunctions.map((func) => (
                                                                                <div
                                                                                    key={func.deviceFunctionId}
                                                                                    className={`border rounded-md p-3 cursor-pointer transition-colors ${selectedDeviceFunctions[index]?.deviceFunctionId === func.deviceFunctionId
                                                                                        ? "border-primary bg-primary/5"
                                                                                        : "border-border hover:border-primary/50"
                                                                                        }`}
                                                                                    onClick={() => handleDeviceFunctionSelect(index, func)}
                                                                                >
                                                                                    <div className="flex items-center gap-2">
                                                                                        <Function className="h-4 w-4 text-muted-foreground" />
                                                                                        <span className="font-medium">{func.name}</span>
                                                                                        {selectedDeviceFunctions[index]?.deviceFunctionId ===
                                                                                            func.deviceFunctionId && (
                                                                                                <Badge variant="secondary" className="text-xs ml-auto">
                                                                                                    Đã chọn
                                                                                                </Badge>
                                                                                            )}
                                                                                    </div>
                                                                                    <div className="text-xs text-muted-foreground mt-1">
                                                                                        {func.functionParameters.length} tham số
                                                                                    </div>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </CardContent>
                                                            </Card>
                                                        )}

                                                        {/* Function Parameters Selection */}
                                                        {selectedDeviceFunctions[index] &&
                                                            selectedDeviceFunctions[index]!.functionParameters.length > 0 && (
                                                                <Card className="border-dashed">
                                                                    <CardHeader className="pb-3">
                                                                        <CardTitle className="text-sm flex items-center gap-2">
                                                                            <Zap className="h-4 w-4" />
                                                                            Bước 4: Chọn tham số chức năng
                                                                        </CardTitle>
                                                                    </CardHeader>
                                                                    <CardContent>
                                                                        <div className="space-y-3">
                                                                            {selectedDeviceFunctions[index]!.functionParameters.map((param) => (
                                                                                <div key={param.functionParameterId} className="flex items-start space-x-3">
                                                                                    <Checkbox
                                                                                        id={`param-${index}-${param.functionParameterId}`}
                                                                                        checked={(step.selectedFunctionParameters || []).includes(
                                                                                            param.functionParameterId,
                                                                                        )}
                                                                                        onCheckedChange={() =>
                                                                                            handleFunctionParameterToggle(index, param.functionParameterId)
                                                                                        }
                                                                                        className="mt-1"
                                                                                    />
                                                                                    <Label
                                                                                        htmlFor={`param-${index}-${param.functionParameterId}`}
                                                                                        className="text-sm cursor-pointer flex-1"
                                                                                    >
                                                                                        <div className="font-medium">{param.name}</div>
                                                                                        <div className="text-xs text-muted-foreground">
                                                                                            <span className="font-mono bg-muted px-1 rounded">{param.type}</span>
                                                                                            {param.description && ` • ${param.description}`}
                                                                                            {param.default && ` • Mặc định: ${param.default}`}
                                                                                        </div>
                                                                                        {param.options && param.options.length > 0 && (
                                                                                            <div className="text-xs text-muted-foreground mt-1">
                                                                                                <span>Tùy chọn: </span>
                                                                                                {param.options.map((option, i) => (
                                                                                                    <span key={i} className="font-mono bg-muted px-1 rounded mr-1">
                                                                                                        {option}
                                                                                                    </span>
                                                                                                ))}
                                                                                            </div>
                                                                                        )}
                                                                                    </Label>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </CardContent>
                                                                </Card>
                                                            )}

                                                        {/* Other fields */}
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <Label htmlFor={`step-maxRetries-${index}`}>Số lần thử lại tối đa</Label>
                                                                <Input
                                                                    id={`step-maxRetries-${index}`}
                                                                    type="number"
                                                                    value={step.maxRetries}
                                                                    onChange={(e) =>
                                                                        handleStepChange(index, "maxRetries", Number.parseInt(e.target.value))
                                                                    }
                                                                    disabled={loading}
                                                                    className={errors.steps?.[index]?.maxRetries ? "border-red-500" : ""}
                                                                />
                                                                {errors.steps?.[index]?.maxRetries && (
                                                                    <p className="text-red-500 text-sm">{errors.steps[index].maxRetries[0]}</p>
                                                                )}
                                                            </div>

                                                            <div className="space-y-2">
                                                                <Label htmlFor={`step-callbackWorkflowId-${index}`}>Quy trình callback</Label>
                                                                <Select
                                                                    value={step.callbackWorkflowId}
                                                                    onValueChange={(value) => handleStepChange(index, "callbackWorkflowId", value)}
                                                                    disabled={loading || loadingWorkflows}
                                                                >
                                                                    <SelectTrigger id={`step-callbackWorkflowId-${index}`}>
                                                                        <SelectValue
                                                                            placeholder={
                                                                                loadingWorkflows ? "Đang tải quy trình..." : "Chọn quy trình callback"
                                                                            }
                                                                        />
                                                                    </SelectTrigger>
                                                                    <SelectContent className="max-h-[300px]">
                                                                        <InfiniteScroll
                                                                            dataLength={workflows.length}
                                                                            next={() => fetchWorkflows(workflowPage + 1)}
                                                                            hasMore={hasMoreWorkflows}
                                                                            loader={<div className="p-2 text-center text-sm">Đang tải thêm...</div>}
                                                                            scrollableTarget="select-content"
                                                                        >
                                                                            {workflows.map((workflow) => (
                                                                                <SelectItem key={workflow.workflowId} value={workflow.workflowId}>
                                                                                    {workflow.name}
                                                                                </SelectItem>
                                                                            ))}
                                                                        </InfiniteScroll>
                                                                    </SelectContent>
                                                                </Select>
                                                                {errors.steps?.[index]?.callbackWorkflowId && (
                                                                    <p className="text-red-500 text-sm">{errors.steps[index].callbackWorkflowId[0]}</p>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* JSON Parameters */}
                                                        <div className="space-y-2">
                                                            <Label htmlFor={`step-parameters-${index}`}>Tham số JSON</Label>
                                                            <JsonEditorComponent
                                                                value={step.parameters}
                                                                onChange={(value) => handleStepChange(index, "parameters", value)}
                                                                disabled={loading}
                                                                height="250px"
                                                            />
                                                            {errors.steps?.[index]?.parameters && (
                                                                <p className="text-red-500 text-sm">{errors.steps[index].parameters[0]}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>
                                        ))}
                                    </Accordion>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </form>
        </div>
    )
}

export default CreateWorkflow
