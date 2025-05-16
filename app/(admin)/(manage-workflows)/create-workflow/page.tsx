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
    Save,
    ArrowLeft,
    Info,
    AlertTriangle,
    Settings,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createWorkflow, updateWorkflow } from "@/services/workflow"
import { getProducts } from "@/services/product"
import { getDeviceTypes } from "@/services/device"
import { getWorkflows } from "@/services/workflow"
import InfiniteScroll from "react-infinite-scroll-component"
import type { Product } from "@/interfaces/product"
import type { DeviceType } from "@/interfaces/device"
import type { Workflow } from "@/interfaces/workflow"
import type { ErrorResponse } from "@/types/error"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { EWorkflowStepType, EWorkflowStepTypeViMap, EWorkflowType, EWorkflowTypeViMap } from "@/enum/workflow"
import { useRouter } from "next/navigation"

// Initial form data
const initialFormData = {
    name: "",
    description: "",
    type: EWorkflowType.Activity,
    productId: "",
    steps: [
        {
            name: "Bước 1",
            type: EWorkflowStepType.AlertCancellationCommand,
            deviceTypeId: "",
            maxRetries: 0,
            callbackWorkflowId: "",
            parameters: "",
        },
    ],
}

const CreateWorkflow = ({ workflow }: { workflow?: any }) => {
    const { toast } = useToast()
    const router = useRouter();
    const [errors, setErrors] = useState<Record<string, any>>({})
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState(initialFormData)
    const [products, setProducts] = useState<Product[]>([])
    const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([])
    const [workflows, setWorkflows] = useState<Workflow[]>([])
    const [page, setPage] = useState(1)
    const [deviceTypePage, setDeviceTypePage] = useState(1)
    const [workflowPage, setWorkflowPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const [hasMoreDeviceTypes, setHasMoreDeviceTypes] = useState(true)
    const [hasMoreWorkflows, setHasMoreWorkflows] = useState(true)
    const [expandedStep, setExpandedStep] = useState<number | null>(0)
    const [loadingProducts, setLoadingProducts] = useState(true)
    const [loadingDeviceTypes, setLoadingDeviceTypes] = useState(false)
    const [loadingWorkflows, setLoadingWorkflows] = useState(false)

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

    // Fetch device types
    const fetchDeviceTypes = async (pageNumber: number) => {
        setLoadingDeviceTypes(true)
        try {
            const response = await getDeviceTypes({ page: pageNumber, size: 10 })
            if (pageNumber === 1) {
                setDeviceTypes(response.items)
            } else {
                setDeviceTypes((prev) => [...prev, ...response.items])
            }
            setDeviceTypePage(pageNumber)
            if (response.items.length < 10) {
                setHasMoreDeviceTypes(false)
            }
        } catch (error) {
            console.error("Error fetching device types:", error)
            toast({
                title: "Lỗi",
                description: "Không tải được các loại thiết bị.",
                variant: "destructive",
            })
        } finally {
            setLoadingDeviceTypes(false)
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

    useEffect(() => {
        fetchProducts(1)
        fetchDeviceTypes(1)
        fetchWorkflows(1)
    }, [])

    // Fill form data when editing workflow
    useEffect(() => {
        if (workflow) {
            setFormData({
                name: workflow.name,
                description: workflow.description ?? "",
                type: workflow.type,
                productId: workflow.productId,
                steps: workflow.steps ?? initialFormData.steps,
            })
        } else {
            setFormData(initialFormData)
        }
    }, [workflow])

    // Handle form field changes
    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }))

        // Clear error for this field if it exists
        if (errors[field]) {
            setErrors((prev) => {
                const newErrors = { ...prev }
                delete newErrors[field]
                return newErrors
            })
        }
    }

    // Handle step field changes
    const handleStepChange = (index: number, field: string, value: string | number) => {
        setFormData((prev) => {
            const newSteps = [...prev.steps]
            newSteps[index] = { ...newSteps[index], [field]: value }
            return { ...prev, steps: newSteps }
        })

        // Clear error for this step field if it exists
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

    // Add a new step
    const addStep = () => {
        setFormData((prev) => ({
            ...prev,
            steps: [
                ...prev.steps,
                {
                    name: `Bước ${prev.steps.length + 1}`,
                    type: EWorkflowStepType.AlertCancellationCommand,
                    deviceTypeId: "",
                    maxRetries: 0,
                    callbackWorkflowId: "",
                    parameters: "",
                },
            ],
        }))
        // Expand the newly added step
        setExpandedStep(formData.steps.length)
    }

    // Remove a step
    const removeStep = (index: number) => {
        setFormData((prev) => {
            const newSteps = prev.steps.filter((_, i) => i !== index)
            // Rename steps to maintain sequential numbering
            return {
                ...prev,
                steps: newSteps.map((step, i) => ({
                    ...step,
                    name: `Bước ${i + 1}`,
                })),
            }
        })
        setExpandedStep(null)
    }

    // Move step up
    const moveStepUp = (index: number) => {
        if (index === 0) return
        setFormData((prev) => {
            const newSteps = [...prev.steps]
            const temp = newSteps[index]
            newSteps[index] = newSteps[index - 1]
            newSteps[index - 1] = temp
            // Rename steps to maintain sequential numbering
            return {
                ...prev,
                steps: newSteps.map((step, i) => ({
                    ...step,
                    name: `Bước ${i + 1}`,
                })),
            }
        })
        setExpandedStep(index - 1)
    }

    // Move step down
    const moveStepDown = (index: number) => {
        if (index === formData.steps.length - 1) return
        setFormData((prev) => {
            const newSteps = [...prev.steps]
            const temp = newSteps[index]
            newSteps[index] = newSteps[index + 1]
            newSteps[index + 1] = temp
            // Rename steps to maintain sequential numbering
            return {
                ...prev,
                steps: newSteps.map((step, i) => ({
                    ...step,
                    name: `Bước ${i + 1}`,
                })),
            }
        })
        setExpandedStep(index + 1)
    }

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        e.stopPropagation()

        // Simple validation (replace with your actual validation logic)
        const newErrors: Record<string, any> = {}
        if (!formData.name) newErrors.name = "Tên quy trình là bắt buộc"
        if (!formData.productId) newErrors.productId = "Sản phẩm là bắt buộc"
        if (!formData.type) newErrors.type = "Loại quy trình là bắt buộc"

        formData.steps.forEach((step, index) => {
            if (!step.name) {
                if (!newErrors.steps) newErrors.steps = {}
                if (!newErrors.steps[index]) newErrors.steps[index] = {}
                newErrors.steps[index].name = "Tên bước là bắt buộc"
            }
        })

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
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
                steps: formData.steps,
            } as Partial<Workflow>

            if (workflow) {
                await updateWorkflow(workflow.workflowId, data)
                toast({
                    title: "Thành công",
                    description: "Cập nhật quy trình thành công",
                })
            } else {
                await createWorkflow(data)
                toast({
                    title: "Thành công",
                    description: "Thêm quy trình mới thành công",
                })
                // Reset form after successful creation
                setFormData(initialFormData)
                setExpandedStep(0)
            }
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

    const isUpdate = !!workflow

    return (
        <div className="container mx-auto p-6 space-y-8">
            <div className="flex items-center">
                <Button variant="outline" size="icon" className="mr-4" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-2xl font-bold flex items-center">
                    <Info className="mr-2 h-5 w-5" />
                    Tạo quy trình
                </h1>
            </div>
            <form onSubmit={handleSubmit}>
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
                                            {errors.name}
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
                                                    <div className="flex items-center">
                                                        {EWorkflowTypeViMap[type]}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.type && (
                                        <p className="text-red-500 text-sm flex items-center">
                                            <AlertTriangle className="h-3 w-3 mr-1" />
                                            {errors.type}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="productId" className="flex items-center">
                                        Sản phẩm
                                        <span className="text-red-500 ml-1">*</span>
                                    </Label>
                                    <Select
                                        value={formData.productId}
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
                                            {errors.productId}
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
                                                                {index + 1}
                                                            </Badge>
                                                            <span className="font-medium">{step.name}</span>
                                                            {step.type && (
                                                                <Badge variant="secondary" className="ml-3">
                                                                    {EWorkflowStepTypeViMap[step.type]}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center space-x-1 mr-4">
                                                            <div
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    moveStepUp(index);
                                                                }}
                                                                className={`h-7 w-7 rounded-full flex items-center justify-center ${loading || index === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
                                                            >
                                                                <ChevronUp className="h-4 w-4" />
                                                            </div>
                                                            <div
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    moveStepDown(index);
                                                                }}
                                                                className={`h-7 w-7 rounded-full flex items-center justify-center ${loading || index === formData.steps.length - 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
                                                            >
                                                                <ChevronDown className="h-4 w-4" />
                                                            </div>
                                                            <div
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    removeStep(index);
                                                                }}
                                                                className={`h-7 w-7 rounded-full flex items-center justify-center ${loading ? 'opacity-50 cursor-not-allowed' : 'text-red-500 hover:text-red-700 hover:bg-red-50'}`}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </AccordionTrigger>
                                                <AccordionContent className="px-4 pb-4 pt-2">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                                                    {Object.values(EWorkflowStepType).map((type) => (
                                                                        <SelectItem key={type} value={type}>
                                                                            {EWorkflowStepTypeViMap[type]}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                            {errors.steps?.[index]?.type && (
                                                                <p className="text-red-500 text-sm">{errors.steps[index].type}</p>
                                                            )}
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label htmlFor={`step-maxRetries-${index}`}>Số lần thử lại tối đa</Label>
                                                            <Input
                                                                id={`step-maxRetries-${index}`}
                                                                type="number"
                                                                value={step.maxRetries}
                                                                onChange={(e) => handleStepChange(index, "maxRetries", Number.parseInt(e.target.value))}
                                                                disabled={loading}
                                                            />
                                                            {errors.steps?.[index]?.maxRetries && (
                                                                <p className="text-red-500 text-sm">{errors.steps[index].maxRetries}</p>
                                                            )}
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label htmlFor={`step-deviceTypeId-${index}`}>Loại thiết bị</Label>
                                                            <Select
                                                                value={step.deviceTypeId}
                                                                onValueChange={(value) => handleStepChange(index, "deviceTypeId", value)}
                                                                disabled={loading || loadingDeviceTypes}
                                                            >
                                                                <SelectTrigger id={`step-deviceTypeId-${index}`}>
                                                                    <SelectValue placeholder={loadingDeviceTypes ? "Đang tải loại thiết bị..." : "Chọn loại thiết bị"} />
                                                                </SelectTrigger>
                                                                <SelectContent className="max-h-[300px]">
                                                                    <InfiniteScroll
                                                                        dataLength={deviceTypes.length}
                                                                        next={() => fetchDeviceTypes(deviceTypePage + 1)}
                                                                        hasMore={hasMoreDeviceTypes}
                                                                        loader={<div className="p-2 text-center text-sm">Đang tải thêm...</div>}
                                                                        scrollableTarget="select-content"
                                                                    >
                                                                        {deviceTypes.map((deviceType) => (
                                                                            <SelectItem key={deviceType.deviceTypeId} value={deviceType.deviceTypeId}>
                                                                                {deviceType.name}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </InfiniteScroll>
                                                                </SelectContent>
                                                            </Select>
                                                            {errors.steps?.[index]?.deviceTypeId && (
                                                                <p className="text-red-500 text-sm">{errors.steps[index].deviceTypeId}</p>
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
                                                                    <SelectValue placeholder={loadingWorkflows ? "Đang tải quy trình..." : "Chọn quy trình callback"} />
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
                                                                <p className="text-red-500 text-sm">{errors.steps[index].callbackWorkflowId}</p>
                                                            )}
                                                        </div>

                                                        <div className="space-y-2 md:col-span-2">
                                                            <Label htmlFor={`step-parameters-${index}`}>Tham số</Label>
                                                            <Textarea
                                                                id={`step-parameters-${index}`}
                                                                value={step.parameters}
                                                                onChange={(e) => handleStepChange(index, "parameters", e.target.value)}
                                                                disabled={loading}
                                                                placeholder="Nhập tham số dưới dạng JSON"
                                                                className="min-h-[80px]"
                                                            />
                                                            {errors.steps?.[index]?.parameters && (
                                                                <p className="text-red-500 text-sm">{errors.steps[index].parameters}</p>
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

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 mt-6">
                    <Button type="button" variant="outline" onClick={() => window.history.back()} disabled={loading}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Hủy
                    </Button>
                    <Button type="submit" disabled={loading} className="bg-blue-500 hover:bg-blue-600">
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Đang xử lý...
                            </>
                        ) : isUpdate ? (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Cập nhật quy trình
                            </>
                        ) : (
                            <>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Thêm quy trình
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    )
}

export default CreateWorkflow