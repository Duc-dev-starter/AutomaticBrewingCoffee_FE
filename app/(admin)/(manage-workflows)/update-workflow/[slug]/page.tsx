// @ts-nocheck
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { PlusCircle, Loader2, Trash2, ChevronDown, ChevronUp, Info, AlertTriangle, Settings, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getWorkflow, updateWorkflow } from "@/services/workflow"
import { getProducts } from "@/services/product"
import { getDeviceModels } from "@/services/device"
import { getWorkflows } from "@/services/workflow"
import InfiniteScroll from "react-infinite-scroll-component"
import type { Product } from "@/interfaces/product"
import type { DeviceModel } from "@/interfaces/device"
import type { Workflow } from "@/interfaces/workflow"
import type { ErrorResponse } from "@/types/error"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { EWorkflowStepType, EWorkflowType, EWorkflowTypeViMap } from "@/enum/workflow"
import { workflowSchema } from "@/schema/workflow"
import { Path } from "@/constants/path"
import type { KioskVersion } from "@/interfaces/kiosk"
import { getKioskVersions } from "@/services/kiosk"
import FunctionParameterEditor from "@/components/common/function-parameter-editor"

const UpdateWorkflow = () => {
    const router = useRouter()
    const { toast } = useToast()
    const params = useParams()
    const slug = params.slug as string
    const [errors, setErrors] = useState<Record<string, any>>({})
    const [loading, setLoading] = useState<boolean>(false)
    const [formData, setFormData] = useState<Workflow | null>(null)
    const [products, setProducts] = useState<Product[]>([])
    const [deviceModels, setDeviceModels] = useState<DeviceModel[]>([])
    const [workflows, setWorkflows] = useState<Workflow[]>([])
    const [page, setPage] = useState<number>(1)
    const [deviceModelPage, setDeviceModelPage] = useState<number>(1)
    const [workflowPage, setWorkflowPage] = useState<number>(1)
    const [hasMore, setHasMore] = useState(true)
    const [hasMoreDeviceModels, setHasMoreDeviceModels] = useState(true)
    const [hasMoreWorkflows, setHasMoreWorkflows] = useState(true)
    const [expandedStep, setExpandedStep] = useState<number | null>(0)
    const [loadingProducts, setLoadingProducts] = useState(true)
    const [loadingDeviceModels, setLoadingDeviceModels] = useState(false)
    const [loadingWorkflows, setLoadingWorkflows] = useState(false)
    const [kioskVersions, setKioskVersions] = useState<KioskVersion[]>([])
    const [KioskVersionPage, setKioskVersionPage] = useState(1)
    const [hasMoreKioskVersion, setHasMoreKioskVersion] = useState(true)
    const [selectedKioskVersion, setSelectedKioskVersion] = useState<string>("")
    const [loadingKioskVersions, setLoadingKioskVersions] = useState(false)
    const [kioskVersionsLoaded, setKioskVersionsLoaded] = useState(false)

    useEffect(() => {
        const fetchWorkflow = async () => {
            try {
                const workflow = await getWorkflow(slug);
                const sortedWorkflow = {
                    ...workflow.response,
                    steps: workflow.response.steps.sort((a, b) => a.sequence - b.sequence),
                };

                const updatedSteps = sortedWorkflow.steps.map((step) => {
                    if (step.deviceModel && step.deviceModel.deviceFunctions) {
                        const matchingFunction = step.deviceModel.deviceFunctions.find(
                            (df) => df.name === step.name || df.name === step.type
                        );
                        if (matchingFunction) {
                            return {
                                ...step,
                                deviceFunctionId: matchingFunction.deviceFunctionId,
                            };
                        }
                    }
                    return step;
                });

                setFormData({
                    ...sortedWorkflow,
                    steps: updatedSteps,
                });

                if (workflow.response.kioskVersionId) {
                    setSelectedKioskVersion(workflow.response.kioskVersionId);
                }

                const uniqueDeviceModels = Array.from(
                    new Map(
                        sortedWorkflow.steps
                            .filter((step) => step.deviceModel)
                            .map((step) => [step.deviceModel.deviceModelId, step.deviceModel])
                    ).values()
                );
                setDeviceModels(uniqueDeviceModels);

                await fetchKioskVersions(1);
            } catch (error) {
                console.error("Error fetching workflow:", error);
                toast({
                    title: "Lỗi",
                    description: "Không tải được dữ liệu quy trình.",
                    variant: "destructive",
                });
            }
        };
        fetchWorkflow();
    }, [slug, toast]);

    const fetchKioskVersions = async (pageNumber: number) => {
        setLoadingKioskVersions(true)
        try {
            const response = await getKioskVersions({ page: pageNumber, size: 10 })
            if (pageNumber === 1) {
                setKioskVersions(response.items)
            } else {
                setKioskVersions((prev) => [...prev, ...response.items])
            }
            setKioskVersionPage(pageNumber)
            if (response.items.length < 10) {
                setHasMoreKioskVersion(false)
            }
            setKioskVersionsLoaded(true)
        } catch (error) {
            const err = error as ErrorResponse
            console.error("Lỗi khi lấy danh sách phiên bản kiosk:", error)
            toast({
                title: "Lỗi khi lấy danh sách phiên bản kiosk",
                description: err.message,
                variant: "destructive",
            })
        } finally {
            setLoadingKioskVersions(false)
        }
    }

    const loadMoreKioskVersions = async () => {
        const nextPage = KioskVersionPage + 1
        await fetchKioskVersions(nextPage)
    }

    const handleKioskVersionOpen = () => {
        if (!kioskVersionsLoaded) {
            fetchKioskVersions(1)
        }
    }

    // Get device functions for selected device model
    const getDeviceFunctionsForModel = (deviceModelId: string) => {
        const deviceModel = deviceModels.find((dm) => dm.deviceModelId === deviceModelId)
        return deviceModel?.deviceFunctions || []
    }

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

    // Fetch device models
    const fetchDeviceModels = async (pageNumber: number) => {
        if (!selectedKioskVersion) {
            return
        }

        setLoadingDeviceModels(true)
        try {
            const response = await getDeviceModels({ kioskVersionId: selectedKioskVersion, page: pageNumber, size: 10 })
            if (pageNumber === 1) {
                setDeviceModels(response.items)
            } else {
                setDeviceModels((prev) => [...prev, ...response.items])
            }
            setDeviceModelPage(pageNumber)
            if (response.items.length < 10) {
                setHasMoreDeviceModels(false)
            }
        } catch (error) {
            console.error("Error fetching device models:", error)
            toast({
                title: "Lỗi",
                description: "Không tải được các mẫu thiết bị.",
                variant: "destructive",
            })
        } finally {
            setLoadingDeviceModels(false)
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
        fetchWorkflows(1)
    }, [])

    // Fetch device models when kiosk version is selected
    useEffect(() => {
        if (selectedKioskVersion) {
            setDeviceModels([])
            setDeviceModelPage(1)
            setHasMoreDeviceModels(true)
            fetchDeviceModels(1)
        } else {
            setDeviceModels([])
        }
    }, [selectedKioskVersion])

    // Handle form field changes
    const handleChange = (field: string, value: string) => {
        if (formData) {
            setFormData((prev: Workflow | null) => {
                if (!prev) return null
                return {
                    ...prev,
                    [field]: value,
                }
            })
        }

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
        if (formData) {
            setFormData((prev: Workflow | null) => {
                if (!prev) return null
                const newSteps = [...prev.steps]

                // If changing device model, clear device function
                if (field === "deviceModelId") {
                    newSteps[index] = {
                        ...newSteps[index],
                        [field]: value,
                        deviceFunctionId: "", // Clear device function when device model changes
                        name: `Bước ${index + 1}`, // Reset to default name
                    }
                }
                // If changing device function, update step name and type automatically
                else if (field === "deviceFunctionId") {
                    const selectedFunction = deviceModels
                        .flatMap((dm) => dm.deviceFunctions || [])
                        .find((df) => df.deviceFunctionId === value)

                    newSteps[index] = {
                        ...newSteps[index],
                        [field]: value,
                        name: selectedFunction ? selectedFunction.name : `Bước ${index + 1}`, // Use function name or fallback
                        type: selectedFunction ? selectedFunction.name : EWorkflowStepType.AlertCancellationCommand,
                    }
                } else {
                    newSteps[index] = { ...newSteps[index], [field]: value }
                }

                return { ...prev, steps: newSteps }
            })
        }

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

    // Add a new step with sequence
    const addStep = () => {
        if (formData) {
            setFormData((prev: Workflow | null) => {
                if (!prev) return null
                const newSequence = prev.steps.length + 1
                const newStep = {
                    name: `Bước ${newSequence}`,
                    type: EWorkflowStepType.AlertCancellationCommand,
                    deviceModelId: "",
                    deviceFunctionId: "",
                    maxRetries: 0,
                    sequence: newSequence,
                    callbackWorkflowId: "",
                    parameters: "",
                }
                return {
                    ...prev,
                    steps: [...prev.steps, newStep],
                }
            })
            setExpandedStep(formData.steps.length)
        }
    }

    // Remove a step and update sequences
    const removeStep = (index: number) => {
        if (formData) {
            setFormData((prev: Workflow | null) => {
                if (!prev) return null
                const newSteps = prev.steps
                    .filter((_, i) => i !== index)
                    .map((step, i) => ({
                        ...step,
                        name: `Bước ${i + 1}`,
                        sequence: i + 1,
                    }))
                return { ...prev, steps: newSteps }
            })
            setExpandedStep(null)
        }
    }

    // Move step up and update sequences
    const moveStepUp = (index: number) => {
        if (index === 0 || !formData) return
        setFormData((prev: Workflow | null) => {
            if (!prev) return null
            const newSteps = [...prev.steps]
            const temp = newSteps[index]
            newSteps[index] = newSteps[index - 1]
            newSteps[index - 1] = temp

            // Update sequences and sort to ensure correct order
            const updatedSteps = newSteps
                .map((step, i) => ({
                    ...step,
                    name: `Bước ${i + 1}`,
                    sequence: i + 1,
                }))
                .sort((a, b) => a.sequence - b.sequence)

            return {
                ...prev,
                steps: updatedSteps,
            }
        })
        setExpandedStep(index - 1)
    }

    // Move step down and update sequences
    const moveStepDown = (index: number) => {
        if (!formData || index === formData.steps.length - 1) return
        setFormData((prev: Workflow | null) => {
            if (!prev) return null
            const newSteps = [...prev.steps]
            const temp = newSteps[index]
            newSteps[index] = newSteps[index + 1]
            newSteps[index + 1] = temp

            // Update sequences and sort to ensure correct order
            const updatedSteps = newSteps
                .map((step, i) => ({
                    ...step,
                    name: `Bước ${i + 1}`,
                    sequence: i + 1,
                }))
                .sort((a, b) => a.sequence - b.sequence)

            return {
                ...prev,
                steps: updatedSteps,
            }
        })
        setExpandedStep(index + 1)
    }

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        e.stopPropagation()

        if (!formData) return

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
                steps: formData.steps,
                kioskVersionId: selectedKioskVersion,
            } as Partial<Workflow>

            await updateWorkflow(slug, data)
            toast({
                title: "Thành công",
                description: "Cập nhật quy trình thành công",
            })
            router.push(Path.MANAGE_WORKFLOWS)
        } catch (error) {
            const err = error as ErrorResponse
            console.error("Lỗi khi cập nhật quy trình:", error)
            toast({
                title: "Lỗi khi cập nhật quy trình",
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

    if (!formData) {
        return (
            <div className="container mx-auto p-6">
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <span className="ml-2">Đang tải dữ liệu quy trình...</span>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto p-6 space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold flex items-center">
                    <Info className="mr-2 h-5 w-5" />
                    Cập nhật quy trình: {formData.name}
                </h1>
                <Button type="submit" disabled={loading} className="bg-blue-500 hover:bg-blue-600" onClick={handleSubmit}>
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Đang xử lý...
                        </>
                    ) : (
                        <>
                            <Save className="mr-2 h-4 w-4" />
                            Cập nhật quy trình
                        </>
                    )}
                </Button>
            </div>

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Settings className="mr-2 h-5 w-5" />
                        Chọn phiên bản Kiosk
                    </CardTitle>
                    <CardDescription>Chọn phiên bản kiosk để áp dụng cho quy trình này</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <Label htmlFor="kioskVersion" className="flex items-center">
                            Phiên bản Kiosk
                            <span className="text-red-500 ml-1">*</span>
                        </Label>
                        <Select
                            value={selectedKioskVersion}
                            onValueChange={setSelectedKioskVersion}
                            onOpenChange={(open) => {
                                if (open) {
                                    handleKioskVersionOpen()
                                }
                            }}
                            disabled={loading}
                        >
                            <SelectTrigger id="kioskVersion">
                                <SelectValue
                                    placeholder={loadingKioskVersions ? "Đang tải phiên bản kiosk..." : "Chọn phiên bản kiosk"}
                                />
                            </SelectTrigger>
                            <SelectContent className="max-h-[300px]">
                                <ScrollArea className="h-[200px]">
                                    <InfiniteScroll
                                        dataLength={kioskVersions.length}
                                        next={loadMoreKioskVersions}
                                        hasMore={hasMoreKioskVersion}
                                        loader={<div className="p-2 text-center text-sm">Đang tải thêm...</div>}
                                        scrollableTarget="select-content"
                                        style={{ overflow: "hidden" }}
                                    >
                                        {kioskVersions.map((version) => (
                                            <SelectItem key={version.kioskVersionId} value={version.kioskVersionId}>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{version.versionTitle}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </InfiniteScroll>
                                </ScrollArea>
                            </SelectContent>
                        </Select>
                        {selectedKioskVersion && (
                            <div className="mt-2">
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                    Đã chọn: {kioskVersions.find((v) => v.kioskVersionId === selectedKioskVersion)?.versionTitle}
                                </Badge>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

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
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Info className="h-3.5 w-3.5 ml-1 text-gray-400" />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Sản phẩm liên quan đến quy trình (tùy chọn)</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
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
                                            <SelectValue
                                                placeholder={loadingProducts ? "Đang tải sản phẩm..." : "Chọn sản phẩm (tùy chọn)"}
                                            />
                                        </SelectTrigger>
                                        <SelectContent className="max-h-[300px]">
                                            <ScrollArea className="h-[200px]">
                                                <SelectItem value="null">
                                                    <span className="text-gray-500 italic">Không chọn sản phẩm</span>
                                                </SelectItem>
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
                                                                className={`h-7 w-7 rounded-full flex items-center justify-center ${loading || index === 0 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"
                                                                    }`}
                                                            >
                                                                <ChevronUp className="h-4 w-4" />
                                                            </div>
                                                            <div
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    moveStepDown(index)
                                                                }}
                                                                className={`h-7 w-7 rounded-full flex items-center justify-center ${loading || index === formData.steps.length - 1
                                                                    ? "opacity-50 cursor-not-allowed"
                                                                    : "hover:bg-gray-100"
                                                                    }`}
                                                            >
                                                                <ChevronDown className="h-4 w-4" />
                                                            </div>
                                                            <div
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    removeStep(index)
                                                                }}
                                                                className={`h-7 w-7 rounded-full flex items-center justify-center ${loading
                                                                    ? "opacity-50 cursor-not-allowed"
                                                                    : "text-red-500 hover:text-red-700 hover:bg-red-50"
                                                                    }`}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </AccordionTrigger>
                                                <AccordionContent className="px-4 pb-4 pt-2">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                                                readOnly={true} // Make it readonly since it's auto-generated
                                                                disabled={loading}
                                                                className={`${errors.steps?.[index]?.name ? "border-red-500" : ""} bg-gray-50`}
                                                                placeholder="Tên sẽ tự động cập nhật khi chọn chức năng thiết bị"
                                                            />
                                                            {errors.steps?.[index]?.name && (
                                                                <p className="text-red-500 text-sm">{errors.steps[index].name[0]}</p>
                                                            )}
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label htmlFor={`step-type-${index}`}>Loại bước</Label>
                                                            <Input
                                                                id={`step-type-${index}`}
                                                                value={step.type}
                                                                readOnly={true} // Make it readonly since it's auto-generated
                                                                disabled={loading}
                                                                className={`${errors.steps?.[index]?.type ? "border-red-500" : ""} bg-gray-50`}
                                                                placeholder="Loại sẽ tự động cập nhật khi chọn chức năng thiết bị"
                                                            />
                                                            {errors.steps?.[index]?.type && (
                                                                <p className="text-red-500 text-sm">{errors.steps[index].type[0]}</p>
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
                                                                className={errors.steps?.[index]?.maxRetries ? "border-red-500" : ""}
                                                            />
                                                            {errors.steps?.[index]?.maxRetries && (
                                                                <p className="text-red-500 text-sm">{errors.steps[index].maxRetries[0]}</p>
                                                            )}
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label htmlFor={`step-deviceModelId-${index}`}>Mẫu thiết bị</Label>
                                                            <Select
                                                                value={step.deviceModelId}
                                                                onValueChange={(value) => handleStepChange(index, "deviceModelId", value)}
                                                                disabled={loading || loadingDeviceModels || !selectedKioskVersion}
                                                            >
                                                                <SelectTrigger id={`step-deviceModelId-${index}`}>
                                                                    <SelectValue
                                                                        placeholder={
                                                                            !selectedKioskVersion
                                                                                ? "Vui lòng chọn phiên bản kiosk trước"
                                                                                : loadingDeviceModels
                                                                                    ? "Đang tải mẫu thiết bị..."
                                                                                    : "Chọn mẫu thiết bị"
                                                                        }
                                                                    />
                                                                </SelectTrigger>
                                                                <SelectContent className="max-h-[300px]">
                                                                    {selectedKioskVersion && (
                                                                        <InfiniteScroll
                                                                            dataLength={deviceModels.length}
                                                                            next={() => fetchDeviceModels(deviceModelPage + 1)}
                                                                            hasMore={hasMoreDeviceModels}
                                                                            loader={<div className="p-2 text-center text-sm">Đang tải thêm...</div>}
                                                                            scrollableTarget="select-content"
                                                                        >
                                                                            {deviceModels.map((deviceModel) => (
                                                                                <SelectItem key={deviceModel.deviceModelId} value={deviceModel.deviceModelId}>
                                                                                    {deviceModel.modelName}
                                                                                </SelectItem>
                                                                            ))}
                                                                        </InfiniteScroll>
                                                                    )}
                                                                </SelectContent>
                                                            </Select>
                                                            {errors.steps?.[index]?.deviceModelId && (
                                                                <p className="text-red-500 text-sm">{errors.steps[index].deviceModelId[0]}</p>
                                                            )}
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label htmlFor={`step-deviceFunctionId-${index}`}>Chức năng thiết bị</Label>
                                                            <Select
                                                                value={step.deviceFunctionId}
                                                                onValueChange={(value) => handleStepChange(index, "deviceFunctionId", value)}
                                                                disabled={loading || !step.deviceModelId}
                                                            >
                                                                <SelectTrigger id={`step-deviceFunctionId-${index}`}>
                                                                    <SelectValue
                                                                        placeholder={
                                                                            !step.deviceModelId
                                                                                ? "Vui lòng chọn mẫu thiết bị trước"
                                                                                : "Chọn chức năng thiết bị"
                                                                        }
                                                                    />
                                                                </SelectTrigger>
                                                                <SelectContent className="max-h-[300px]">
                                                                    {step.deviceModelId &&
                                                                        getDeviceFunctionsForModel(step.deviceModelId).map((deviceFunction) => (
                                                                            <SelectItem
                                                                                key={deviceFunction.deviceFunctionId}
                                                                                value={deviceFunction.deviceFunctionId || deviceFunction.name}
                                                                            >
                                                                                <div className="flex flex-col">
                                                                                    <span className="font-medium">{deviceFunction.name}</span>
                                                                                    {deviceFunction.functionParameters &&
                                                                                        deviceFunction.functionParameters.length > 0 && (
                                                                                            <span className="text-sm text-muted-foreground">
                                                                                                {deviceFunction.functionParameters.length} tham số
                                                                                            </span>
                                                                                        )}
                                                                                </div>
                                                                            </SelectItem>
                                                                        ))}
                                                                    {step.deviceModelId &&
                                                                        getDeviceFunctionsForModel(step.deviceModelId).length === 0 && (
                                                                            <div className="p-2 text-center text-sm text-muted-foreground">
                                                                                Không có chức năng nào cho thiết bị này
                                                                            </div>
                                                                        )}
                                                                </SelectContent>
                                                            </Select>
                                                            {errors.steps?.[index]?.deviceFunctionId && (
                                                                <p className="text-red-500 text-sm">{errors.steps[index].deviceFunctionId[0]}</p>
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
                                                                        placeholder={loadingWorkflows ? "Đang tải quy trình..." : "Chọn quy trình callback"}
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

                                                        <div className="space-y-2 md:col-span-2">
                                                            <Label htmlFor={`step-parameters-${index}`}>Tham số</Label>
                                                            <FunctionParameterEditor
                                                                deviceFunctionId={step.deviceFunctionId}
                                                                deviceModels={deviceModels}
                                                                value={step.parameters}
                                                                onChange={(value) => handleStepChange(index, "parameters", value)}
                                                                disabled={loading}
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

export default UpdateWorkflow
