// @ts-nocheck
"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { PlusCircle, Loader2, Trash2, ChevronDown, ChevronUp, Info, AlertTriangle, Settings, Save, Eye } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createWorkflow, getWorkflows } from "@/services/workflow.service"
import { getProducts } from "@/services/product.service"
import { getDeviceModels } from "@/services/device.service"
import InfiniteScroll from "react-infinite-scroll-component"
import type { Product } from "@/interfaces/product"
import type { DeviceModel } from "@/interfaces/device"
import type { Workflow } from "@/interfaces/workflow"
import type { ErrorResponse } from "@/types/error"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { EWorkflowType, EWorkflowTypeViMap, EExpressionType, EOperation, EConditionName, EExpressionTypeViMap, EOperationViMap, EConditionNameViMap } from "@/enum/workflow"
import { workflowSchema } from "@/schema/workflow.schema"
import { useRouter } from "next/navigation"
import { Path } from "@/constants/path.constant"
import type { KioskVersion } from "@/interfaces/kiosk"
import { getKioskVersions } from "@/services/kiosk.service"
import { FunctionParameterEditor } from "@/components/common"
import ReactFlow, {
    addEdge,
    Background,
    BackgroundVariant,
    type Connection,
    Controls,
    type Edge,
    type Node,
    type NodeTypes,
    Position,
    useEdgesState,
    useNodesState,
} from "reactflow"
import "reactflow/dist/style.css"
import WorkflowStepNode from "@/components/common/workflow-step-node"

const styles = `
  .react-flow__attribution {
    display: none;
  }
  .react-flow__node-workflowStep .react-flow__handle-left,
  .react-flow__node-workflowStep .react-flow__handle-right {
    display: flex;
  }
  .react-flow__handle-top { top: -20px; width: 15px; height: 15px; }
  .react-flow__handle-bottom { bottom: -20px; width: 15px; height: 15px; }
  .react-flow__handle.hidden {
    display: none;
  }
`

const initialFormData = {
    name: "",
    description: "",
    type: EWorkflowType.Activity,
    productId: null,
    steps: [
        {
            stepCode: Math.random().toString(36).substring(2, 14),
            name: "Bước 1",
            type: "",
            deviceModelId: "",
            deviceFunctionId: "",
            maxRetries: 0,
            sequence: 1,
            callbackWorkflowId: "",
            callbackStepCode: null,
            parameters: "",
            conditions: [],
        },
    ],
}

const nodeTypes: NodeTypes = {
    workflowStep: WorkflowStepNode,
}

const generateUniqueStepCode = (existingSteps: any[]): string => {
    const existingCodes = new Set(existingSteps.map(s => s.stepCode));
    let newCode: string;
    do {
        newCode = Math.random().toString(36).substring(2, 14);
    } while (existingCodes.has(newCode));
    return newCode;
};

const CreateWorkflow = () => {
    const router = useRouter()
    const { toast } = useToast()
    const [errors, setErrors] = useState<Record<string, any>>({})
    const [loading, setLoading] = useState<boolean>(false)
    const [formData, setFormData] = useState(initialFormData)
    const [showWorkflowInfo, setShowWorkflowInfo] = useState(false)
    const [isConfirming, setIsConfirming] = useState(false)

    const [products, setProducts] = useState<Product[]>([])
    const [productPage, setProductPage] = useState<number>(1)
    const [hasMoreProducts, setHasMoreProducts] = useState(true)
    const [loadingProducts, setLoadingProducts] = useState(true)

    const [deviceModels, setDeviceModels] = useState<DeviceModel[]>([])
    const [deviceModelPage, setDeviceModelPage] = useState<number>(1)
    const [hasMoreDeviceModels, setHasMoreDeviceModels] = useState(true)
    const [loadingDeviceModels, setLoadingDeviceModels] = useState(false)

    const [workflows, setWorkflows] = useState<Workflow[]>([])
    const [workflowPage, setWorkflowPage] = useState<number>(1)
    const [hasMoreWorkflows, setHasMoreWorkflows] = useState(true)
    const [loadingWorkflows, setLoadingWorkflows] = useState(true)

    const [kioskVersions, setKioskVersions] = useState<KioskVersion[]>([])
    const [kioskVersionPage, setKioskVersionPage] = useState(1)
    const [hasMoreKioskVersion, setHasMoreKioskVersion] = useState(true)
    const [selectedKioskVersion, setSelectedKioskVersion] = useState<string>("")
    const [loadingKioskVersions, setLoadingKioskVersions] = useState(true)
    const [kioskVersionError, setKioskVersionError] = useState<string | null>(null)

    const [editingStepIndex, setEditingStepIndex] = useState<number | null>(null)

    const [nodes, setNodes, onNodesChange] = useNodesState([])
    const [edges, setEdges, onEdgesChange] = useEdgesState([])

    const fetchKioskVersions = useCallback(
        async (pageNumber: number) => {
            if (pageNumber === 1) setLoadingKioskVersions(true)
            setKioskVersionError(null)
            try {
                const response = await getKioskVersions({ page: pageNumber, size: 10 })
                if (!response || !response.items) {
                    throw new Error("Invalid response format for Kiosk Versions")
                }
                setKioskVersions((prev) => (pageNumber === 1 ? response.items : [...prev, ...response.items]))
                setKioskVersionPage(pageNumber)
                setHasMoreKioskVersion(response.items.length >= 10)
            } catch (error) {
                const err = error as ErrorResponse
                console.error("Error fetching kiosk versions:", error)
                setKioskVersionError(err.message || "Lỗi khi tải phiên bản kiosk")
            } finally {
                if (pageNumber === 1 || !hasMoreKioskVersion) setLoadingKioskVersions(false)
            }
        },
        [toast]
    )

    const loadMoreKioskVersions = useCallback(async () => {
        if (loadingKioskVersions || !hasMoreKioskVersion) return
        await fetchKioskVersions(kioskVersionPage + 1)
    }, [loadingKioskVersions, hasMoreKioskVersion, kioskVersionPage, fetchKioskVersions])

    const fetchProducts = useCallback(
        async (pageNumber: number) => {
            if (pageNumber === 1) setLoadingProducts(true)
            try {
                const response = await getProducts({ page: pageNumber, size: 100, isHasWorkflow: false, productType: "Child" })
                setProducts((prev) => (pageNumber === 1 ? response.items : [...prev, ...response.items]))
                setProductPage(pageNumber)
                setHasMoreProducts(response.items.length >= 10)
            } catch (error) {
                console.error("Error fetching products:", error)
                toast({ title: "Lỗi", description: "Không tải được danh sách sản phẩm.", variant: "destructive" })
            } finally {
                if (pageNumber === 1 || !hasMoreProducts) setLoadingProducts(false)
            }
        },
        [toast]
    )

    const fetchDeviceModels = useCallback(
        async (pageNumber: number) => {
            if (!selectedKioskVersion) return
            if (pageNumber === 1) setLoadingDeviceModels(true)
            try {
                const response = await getDeviceModels({ kioskVersionId: selectedKioskVersion, page: pageNumber, size: 10 })
                setDeviceModels((prev) => (pageNumber === 1 ? response.items : [...prev, ...response.items]))
                setDeviceModelPage(pageNumber)
                setHasMoreDeviceModels(response.items.length >= 10)
            } catch (error) {
                console.error("Error fetching device models:", error)
                toast({ title: "Lỗi", description: "Không tải được các loại thiết bị.", variant: "destructive" })
            } finally {
                if (pageNumber === 1 || !hasMoreDeviceModels) setLoadingDeviceModels(false)
            }
        },
        [selectedKioskVersion, toast]
    )

    const fetchWorkflows = useCallback(
        async (pageNumber: number) => {
            if (pageNumber === 1) setLoadingWorkflows(true)
            try {
                const response = await getWorkflows({ page: pageNumber, size: 10 })
                setWorkflows((prev) => (pageNumber === 1 ? response.items : [...prev, ...response.items]))
                setWorkflowPage(pageNumber)
                setHasMoreWorkflows(response.items.length >= 10)
            } catch (error) {
                console.error("Error fetching workflows:", error)
                toast({ title: "Lỗi", description: "Không tải được các quy trình.", variant: "destructive" })
            } finally {
                if (pageNumber === 1 || !hasMoreWorkflows) setLoadingWorkflows(false)
            }
        },
        [toast]
    )

    useEffect(() => {
        fetchProducts(1)
        fetchWorkflows(1)
        fetchKioskVersions(1)
    }, [fetchProducts, fetchWorkflows, fetchKioskVersions])

    useEffect(() => {
        if (selectedKioskVersion) {
            setDeviceModels([])
            setDeviceModelPage(1)
            setHasMoreDeviceModels(true)
            fetchDeviceModels(1)
        } else {
            setDeviceModels([])
        }
    }, [selectedKioskVersion, fetchDeviceModels])

    const getDeviceFunctionsForModel = useCallback(
        (deviceModelId: string) => {
            const deviceModel = deviceModels.find((dm) => dm.deviceModelId === deviceModelId)
            return deviceModel?.deviceFunctions || []
        },
        [deviceModels]
    )

    const handleChange = useCallback(
        (field: string, value: string | null) => {
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
        },
        [errors]
    )

    const handleStepChange = useCallback(
        (index: number, field: string, value: string | number | null) => {
            setFormData((prev) => {
                const newSteps = [...prev.steps]
                const currentStep = { ...newSteps[index] }

                if (field === "sequence") {
                    currentStep.sequence = Number(value)
                } else if (field === "name") {
                    currentStep.name = String(value || "")
                } else if (field === "deviceModelId") {
                    currentStep.deviceModelId = (value as string) || ""
                    currentStep.deviceFunctionId = ""
                    currentStep.type = ""
                    currentStep.parameters = ""
                } else if (field === "deviceFunctionId") {
                    currentStep.deviceFunctionId = (value as string) || ""
                    if (currentStep.deviceFunctionId && currentStep.deviceModelId) {
                        const deviceModel = deviceModels.find((dm) => dm.deviceModelId === currentStep.deviceModelId)
                        const selectedFunction = deviceModel?.deviceFunctions?.find(
                            (df) => df.deviceFunctionId === currentStep.deviceFunctionId || df.name === currentStep.deviceFunctionId
                        )
                        if (selectedFunction && typeof selectedFunction.name === "string" && selectedFunction.name.trim() !== "") {
                            currentStep.type = selectedFunction.name.trim()
                        } else {
                            currentStep.type = ""
                        }
                    }
                } else if (field === "parameters") {
                    currentStep.parameters = (value as string) || ""
                } else if (field === "maxRetries") {
                    const numValue = Number(value)
                    currentStep.maxRetries = Number.isNaN(numValue) ? 0 : Math.max(0, numValue)
                } else if (field === "callbackStepCode") {
                    currentStep.callbackStepCode = value === "" ? null : value
                } else {
                    currentStep[field] = value
                    if (field === "callbackWorkflowId") {
                        currentStep.callbackWorkflowId = value === "" ? null : value
                    }
                }

                newSteps[index] = currentStep
                return { ...prev, steps: newSteps }
            })

            if (errors.steps?.[index]?.[field]) {
                setErrors((prevErrors) => {
                    const newErrors = { ...prevErrors }
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
        },
        [deviceModels, errors]
    )

    const addStep = useCallback(() => {
        setFormData((prev) => {
            const newStepCode = generateUniqueStepCode(prev.steps)
            const newSequence = prev.steps.length > 0 ? Math.max(...prev.steps.map(s => s.sequence)) + 1 : 1
            return {
                ...prev,
                steps: [
                    ...prev.steps,
                    {
                        stepCode: newStepCode,
                        name: `Bước ${newSequence}`,
                        type: "",
                        deviceModelId: "",
                        deviceFunctionId: "",
                        maxRetries: 0,
                        sequence: newSequence,
                        callbackWorkflowId: "",
                        callbackStepCode: null,
                        parameters: "",
                        conditions: [],
                    },
                ],
            }
        })
    }, [])

    const removeStep = useCallback(
        (index: number) => {
            setFormData((prev) => {
                const removedStepCode = prev.steps[index].stepCode
                const newSteps = prev.steps
                    .filter((_, i) => i !== index)
                    .map(step => {
                        if (step.callbackStepCode === removedStepCode) {
                            return { ...step, callbackStepCode: null }
                        }
                        return step
                    })
                return { ...prev, steps: newSteps }
            })
            if (editingStepIndex === index) setEditingStepIndex(null)
            else if (editingStepIndex && editingStepIndex > index) setEditingStepIndex(editingStepIndex - 1)
        },
        [editingStepIndex]
    )

    const moveStepUp = useCallback((index: number) => {
        if (index === 0) return
        setFormData((prev) => {
            const newSteps = [...prev.steps]
            const temp = newSteps[index]
            newSteps[index] = newSteps[index - 1]
            newSteps[index - 1] = temp
            return { ...prev, steps: newSteps }
        })
        setEditingStepIndex(index - 1)
    }, [])

    const moveStepDown = useCallback(
        (index: number) => {
            if (index === formData.steps.length - 1) return
            setFormData((prev) => {
                const newSteps = [...prev.steps]
                const temp = newSteps[index]
                newSteps[index] = newSteps[index + 1]
                newSteps[index + 1] = temp
                return { ...prev, steps: newSteps }
            })
            setEditingStepIndex(index + 1)
        },
        [formData.steps.length]
    )

    const handleConditionChange = useCallback(
        (stepIndex: number, conditionIndex: number, field: string, value: any) => {
            setFormData((prev) => {
                const newSteps = [...prev.steps]
                const currentStep = { ...newSteps[stepIndex] }
                const newConditions = [...(currentStep.conditions || [])]
                const currentCondition = { ...newConditions[conditionIndex] }

                if (field === "name") {
                    currentCondition.name = value
                } else if (field === "description") {
                    currentCondition.description = value
                } else if (field === "expression") {
                    currentCondition.expression = value
                } else if (field === "leftType") {
                    currentCondition.expression.left.type = value
                } else if (field === "leftValue") {
                    currentCondition.expression.left.value = value
                } else if (field === "operator") {
                    currentCondition.expression.operator = value
                } else if (field === "rightType") {
                    currentCondition.expression.right.type = value
                } else if (field === "rightValue") {
                    currentCondition.expression.right.value = value
                }

                newConditions[conditionIndex] = currentCondition
                currentStep.conditions = newConditions
                newSteps[stepIndex] = currentStep
                return { ...prev, steps: newSteps }
            })
        },
        []
    )

    const addCondition = useCallback((stepIndex: number) => {
        setFormData((prev) => {
            const newSteps = [...prev.steps]
            const currentStep = { ...newSteps[stepIndex] }
            const newConditions = [
                ...(currentStep.conditions || []),
                {
                    name: EConditionName.Side,
                    description: "",
                    expression: {
                        left: { type: EExpressionType.Variable, value: "" },
                        operator: EOperation.Equal,
                        right: { type: EExpressionType.Literal, value: "" },
                    },
                },
            ]
            currentStep.conditions = newConditions
            newSteps[stepIndex] = currentStep
            return { ...prev, steps: newSteps }
        })
    }, [])

    const removeCondition = useCallback((stepIndex: number, conditionIndex: number) => {
        setFormData((prev) => {
            const newSteps = [...prev.steps]
            const currentStep = { ...newSteps[stepIndex] }
            const newConditions = (currentStep.conditions || []).filter((_, i) => i !== conditionIndex)
            currentStep.conditions = newConditions
            newSteps[stepIndex] = currentStep
            return { ...prev, steps: newSteps }
        })
    }, [])

    const handleValidationAndPreview = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault()
            e.stopPropagation()

            const sortedSteps = [...formData.steps].sort((a, b) => a.sequence - b.sequence)
            const dataToValidate = { ...formData, steps: sortedSteps }
            const result = workflowSchema.safeParse(dataToValidate)

            if (!result.success) {
                const newErrors = result.error.flatten().fieldErrors
                setErrors(newErrors)
                toast({
                    title: "Lỗi xác thực",
                    description: "Vui lòng kiểm tra lại thông tin đã nhập",
                    variant: "destructive",
                })
                if (newErrors.name || newErrors.type || newErrors.description) {
                    setShowWorkflowInfo(true)
                }
                return
            }

            setErrors({})
            setIsConfirming(true)
        },
        [formData, toast]
    )

    const handleCreateWorkflow = useCallback(
        async () => {
            setLoading(true)
            try {
                const result = workflowSchema.safeParse(formData)
                if (!result.success) {
                    throw new Error("Dữ liệu không hợp lệ, vui lòng kiểm tra lại.")
                }
                const validatedData = result.data
                const operationMap: Record<string, string> = {
                    [EOperation.Equal]: "Equal",
                    [EOperation.NotEqual]: "NotEqual",
                    [EOperation.GreaterThan]: "GreaterThan",
                    [EOperation.GreaterThanOrEqual]: "GreaterThanOrEqual",
                    [EOperation.LessThan]: "LessThan",
                    [EOperation.LessThanOrEqual]: "LessThanOrEqual",
                }

                const dataToSend = {
                    name: validatedData.name,
                    description: validatedData.description || undefined,
                    type: validatedData.type,
                    productId: validatedData.productId || null,
                    kioskVersionId: selectedKioskVersion || undefined,
                    steps: validatedData.steps.map((step) => ({
                        ...step,
                        parameters: step.parameters || undefined,
                        callbackWorkflowId: step.callbackWorkflowId || undefined,
                        callbackStepCode: step.callbackStepCode || null,
                        deviceModelId: step.deviceModelId || undefined,
                        deviceFunctionId: step.deviceFunctionId || undefined,
                        sequence: step.sequence || 1,
                        conditions: (step.conditions || []).map((condition) => ({
                            ...condition,
                            expression: {
                                ...condition.expression,
                                operator: operationMap[condition.expression.operator] || condition.expression.operator,
                            },
                        })),
                    })),
                }

                await createWorkflow(dataToSend as any)
                toast({
                    title: "Thành công",
                    description: "Thêm quy trình mới thành công",
                })
                setIsConfirming(false)
                router.push(Path.MANAGE_WORKFLOWS)
            } catch (error) {
                const err = error as ErrorResponse
                console.error("Lỗi khi xử lý quy trình:", error)
                toast({
                    title: "Lỗi khi xử lý quy trình",
                    description: err.message || "Đã xảy ra lỗi không mong muốn.",
                    variant: "destructive",
                })
            } finally {
                setLoading(false)
            }
        },
        [formData, selectedKioskVersion, toast, router]
    )


    const loadMoreProducts = useCallback(async () => {
        if (loadingProducts || !hasMoreProducts) return
        await fetchProducts(productPage + 1)
    }, [productPage, fetchProducts, loadingProducts, hasMoreProducts])

    const onConnect = useCallback(
        (params: Edge | Connection) => {
            const sourceNodeId = params.source
            const targetNodeId = params.target

            if (sourceNodeId === targetNodeId) {
                toast({
                    title: "Lỗi",
                    description: "Không thể tạo cạnh từ node đến chính nó.",
                    variant: "destructive",
                })
                return
            }

            const existingLoop = edges.some(
                (edge) => edge.source === targetNodeId && edge.target === sourceNodeId
            )

            if (existingLoop) {
                toast({
                    title: "Lỗi",
                    description: "Không thể tạo vòng lặp trực tiếp giữa hai bước.",
                    variant: "destructive",
                })
                return
            }

            const existingEdgesFromSource = edges.filter((edge) => edge.source === sourceNodeId)
            if (existingEdgesFromSource.length >= 1) {
                toast({
                    title: "Lỗi",
                    description: "Mỗi bước chỉ có thể có một kết nối ra.",
                    variant: "destructive",
                })
                return
            }

            setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: "#3b82f6" } }, eds))
        },
        [edges, setEdges, toast]
    )

    const updateFlowFromSteps = useCallback(() => {
        const sortedSteps = [...formData.steps].sort((a, b) => a.sequence - b.sequence)

        const sequenceGroups: Record<number, any[]> = {}
        sortedSteps.forEach((step, index) => {
            const originalIndex = formData.steps.findIndex(s => s.stepCode === step.stepCode);
            const sequence = step.sequence
            if (!sequenceGroups[sequence]) {
                sequenceGroups[sequence] = []
            }
            sequenceGroups[sequence].push({ ...step, originalIndex: originalIndex })
        })

        const sequences = Object.keys(sequenceGroups).map(Number).sort((a, b) => a - b)

        const newNodes: Node[] = []
        const newEdges: Edge[] = []

        let yOffset = 0
        sequences.forEach((sequence, seqIndex) => {
            const stepsInSequence = sequenceGroups[sequence]
            const xOffset = 100
            const y = yOffset

            stepsInSequence.forEach((step, stepIndex) => {
                const nodeId = `step-${step.originalIndex}`
                const x = xOffset + stepIndex * 250
                newNodes.push({
                    id: nodeId,
                    type: "workflowStep",
                    position: { x, y },
                    data: {
                        step,
                        onEdit: () => setEditingStepIndex(step.originalIndex),
                        onDelete: () => removeStep(step.originalIndex),
                        errors: errors.steps?.[step.originalIndex] || {},
                    },
                })

                if (seqIndex > 0) {
                    const prevSequence = sequences[seqIndex - 1]
                    const prevSteps = sequenceGroups[prevSequence]
                    prevSteps.forEach((prevStep) => {
                        const prevNodeId = `step-${prevStep.originalIndex}`
                        const sourceHasCallbackToTarget = prevStep.callbackStepCode === step.stepCode
                        const targetHasCallbackToSource = step.callbackStepCode === prevStep.stepCode

                        // Don't draw the regular edge if a callback edge already exists between these two
                        if (!sourceHasCallbackToTarget && !targetHasCallbackToSource) {
                            newEdges.push({
                                id: `edge-${prevNodeId}-${nodeId}`,
                                source: prevNodeId,
                                target: nodeId,
                                animated: true,
                                style: { stroke: "#3b82f6" },
                                zIndex: 1100,
                            })
                        }
                    })
                }
            })

            yOffset += 200
        })

        formData.steps.forEach((step, index) => {
            if (step.callbackStepCode) {
                const callbackStepIndex = formData.steps.findIndex(s => s.stepCode === step.callbackStepCode)
                if (callbackStepIndex !== -1) {
                    const sourceNodeId = `step-${index}`
                    const targetNodeId = `step-${callbackStepIndex}`
                    newEdges.push({
                        id: `callback-edge-${sourceNodeId}-${targetNodeId}`,
                        source: sourceNodeId,
                        target: targetNodeId,
                        animated: true,
                        type: 'smoothstep',
                        style: { stroke: "red", strokeWidth: 2 },
                        markerEnd: { type: "arrowclosed", color: "red" },
                        zIndex: 1000,
                        label: 'callback'
                    })
                }
            }
        })


        setNodes(newNodes)
        setEdges(newEdges)
    }, [formData, errors.steps, removeStep, setNodes, setEdges])

    useEffect(() => {
        updateFlowFromSteps()
    }, [updateFlowFromSteps])

    return (
        <div className="container mx-auto p-6 space-y-8">
            <style>{styles}</style>
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold flex items-center">
                    Tạo quy trình mới
                </h1>
                <Button type="button" disabled={loading} className="bg-primary hover:bg-primary-200" onClick={handleValidationAndPreview}>
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Đang xử lý...
                        </>
                    ) : (
                        <>
                            <Eye className="mr-2 h-4 w-4" />
                            Xem lại & Tạo
                        </>
                    )}
                </Button>
            </div>

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Settings className="mr-2 h-5 w-5" />
                        Chọn phiên bản Kiosk (Tùy chọn)
                    </CardTitle>
                    <CardDescription>Chọn nếu quy trình cần tương tác với các thiết bị cụ thể theo phiên bản.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <Label htmlFor="kioskVersion" className="flex items-center">
                            Phiên bản Kiosk
                        </Label>
                        <Select
                            value={selectedKioskVersion}
                            onValueChange={setSelectedKioskVersion}
                            disabled={loadingKioskVersions && kioskVersions.length === 0 && !kioskVersionError}
                        >
                            <SelectTrigger id="kioskVersion">
                                <SelectValue
                                    placeholder={
                                        loadingKioskVersions && kioskVersions.length === 0 && !kioskVersionError
                                            ? "Đang tải..."
                                            : "Chọn phiên bản kiosk (nếu cần)"
                                    }
                                />
                            </SelectTrigger>
                            <SelectContent id="kiosk-version-scroll-content" className="max-h-[300px]">
                                {kioskVersionError ? (
                                    <div className="p-4 text-center text-red-500">
                                        <p className="text-sm">{kioskVersionError}</p>
                                        <Button variant="outline" size="sm" className="mt-2" onClick={() => fetchKioskVersions(1)}>
                                            Thử lại
                                        </Button>
                                    </div>
                                ) : loadingKioskVersions && kioskVersions.length === 0 ? (
                                    <div className="p-4 text-center">
                                        <div className="flex items-center justify-center space-x-2">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            <span className="text-sm">Đang tải...</span>
                                        </div>
                                    </div>
                                ) : !loadingKioskVersions && kioskVersions.length === 0 ? (
                                    <div className="p-4 text-center text-gray-500">
                                        <p className="text-sm">Chưa có phiên bản kiosk nào</p>
                                    </div>
                                ) : (
                                    <ScrollArea className="h-[200px]">
                                        <InfiniteScroll
                                            dataLength={kioskVersions.length}
                                            next={loadMoreKioskVersions}
                                            hasMore={hasMoreKioskVersion && !loadingKioskVersions}
                                            loader={
                                                <div className="p-2 text-center text-sm flex items-center justify-center space-x-2">
                                                    <Loader2 className="h-3 w-3 animate-spin" />
                                                    <span>Đang tải thêm...</span>
                                                </div>
                                            }
                                            scrollableTarget="kiosk-version-scroll-content"
                                        >
                                            {kioskVersions.map((version) => (
                                                <SelectItem key={version.kioskVersionId} value={version.kioskVersionId}>
                                                    {version.versionTitle}
                                                </SelectItem>
                                            ))}
                                        </InfiniteScroll>
                                    </ScrollArea>
                                )}
                            </SelectContent>
                        </Select>
                        {selectedKioskVersion && kioskVersions.find((v) => v.kioskVersionId === selectedKioskVersion) && (
                            <div className="mt-2">
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                    Đã chọn: {kioskVersions.find((v) => v.kioskVersionId === selectedKioskVersion)?.versionTitle}
                                </Badge>
                            </div>
                        )}
                        {errors.kioskVersionId && (
                            <p className="text-red-500 text-sm flex items-center">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                {errors.kioskVersionId[0]}
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>

            <div className="w-full">
                <Card className="mb-6">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Sơ đồ quy trình</CardTitle>
                                <CardDescription>Click vào bước để sửa, hoặc kéo thả tay cầm để nối các bước.</CardDescription>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Dialog open={showWorkflowInfo} onOpenChange={setShowWorkflowInfo}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" className="w-full">
                                            <Info className="mr-2 h-4 w-4" />
                                            Xem thông tin quy trình
                                        </Button>
                                    </DialogTrigger>
                                </Dialog>

                                <Button type="button" onClick={addStep} disabled={loading} className="bg-primary hover:bg-primary-200">
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Thêm bước
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="h-[600px] p-0">
                        <ReactFlow
                            nodes={nodes}
                            edges={edges}
                            onNodesChange={onNodesChange}
                            onEdgesChange={onEdgesChange}
                            onConnect={onConnect}
                            nodeTypes={nodeTypes}
                            // fitView
                            defaultViewport={{ zoom: 0.75, x: 400, y: 50 }}
                            className="bg-gray-50"
                        >
                            <Controls />
                            <Background variant={BackgroundVariant.Dots} gap={12} size={1} />

                        </ReactFlow>
                    </CardContent>
                </Card>
            </div>

            {/* Workflow Info Dialog */}
            <Dialog open={showWorkflowInfo} onOpenChange={setShowWorkflowInfo}>
                <DialogContent className="sm:max-w-[650px] p-7 border-0 bg-white backdrop-blur-xl shadow-2xl max-h-[90vh] overflow-y-auto hide-scrollbar">
                    <DialogHeader>
                        <DialogTitle>Thông tin quy trình</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
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
                            <Select value={formData.type} onValueChange={(value) => handleChange("type", value)} disabled={loading}>
                                <SelectTrigger id="type" className={errors.type ? "border-red-500 focus-visible:ring-red-500" : ""}>
                                    <SelectValue placeholder="Chọn loại quy trình" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.values(EWorkflowType).map((type) => (
                                        <SelectItem key={type} value={type}>
                                            {EWorkflowTypeViMap[type]}
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

                        {formData.type === EWorkflowType.Activity && (
                            <div className="space-y-2">
                                <Label htmlFor="productId" className="flex items-center">
                                    Sản phẩm (Tùy chọn)
                                </Label>
                                <Select
                                    value={formData.productId || ""}
                                    onValueChange={(value) => handleChange("productId", value || null)}
                                    disabled={loading || (loadingProducts && products.length === 0)}
                                >
                                    <SelectTrigger id="productId" className={errors.productId ? "border-red-500 focus-visible:ring-red-500" : ""}>
                                        <SelectValue
                                            placeholder={loadingProducts && products.length === 0 ? "Đang tải sản phẩm..." : "Chọn sản phẩm"}
                                        />
                                    </SelectTrigger>
                                    <SelectContent id="product-scroll-content" className="max-h-[300px]">
                                        <ScrollArea id="product-scroll-area" className="h-[200px]">
                                            <InfiniteScroll
                                                dataLength={products.length}
                                                next={loadMoreProducts}
                                                hasMore={hasMoreProducts && !loadingProducts}
                                                loader={<div className="p-2 text-center text-sm">Đang tải thêm...</div>}
                                                scrollableTarget="product-scroll-area"
                                            >
                                                {products.map((product) => (
                                                    <SelectItem key={product.productId} value={product.productId}>
                                                        {product.name}
                                                    </SelectItem>
                                                ))}
                                                {!loadingProducts && products.length === 0 && (
                                                    <div className="p-2 text-center text-sm text-gray-500">Chưa có sản phẩm.</div>
                                                )}
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
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="description" className="flex items-center">
                                Mô tả (Tùy chọn)
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
                            {errors.description && (
                                <p className="text-red-500 text-sm flex items-center">
                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                    {errors.description[0]}
                                </p>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Confirmation Dialog */}
            <Dialog open={isConfirming} onOpenChange={setIsConfirming}>
                <DialogContent className="sm:max-w-[850px] p-0 border-0 bg-white backdrop-blur-xl shadow-2xl max-h-[90vh] flex flex-col">
                    <DialogHeader className="p-6 pb-0">
                        <DialogTitle className="text-xl">Xem lại và Xác nhận Quy trình</DialogTitle>
                        <CardDescription>
                            Vui lòng kiểm tra lại các bước trước khi tạo. Bạn có thể nhấp vào bánh răng để chỉnh sửa lần cuối.
                        </CardDescription>
                    </DialogHeader>
                    <div className="flex-grow overflow-y-auto px-6">
                        {errors.steps && typeof errors.steps === "string" && (
                            <p className="text-red-500 text-sm flex items-center mb-2">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                {errors.steps}
                            </p>
                        )}
                        {formData.steps.length === 0 ? (
                            <div className="text-center py-12 border-2 border-dashed rounded-lg">
                                <Settings className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                                <p className="text-gray-500">Quy trình phải có ít nhất một bước.</p>
                                <Button type="button" onClick={addStep} variant="outline" className="mt-4">
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Thêm bước đầu tiên
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {formData.steps.map((step, index) => (
                                    <div
                                        key={step.stepCode}
                                        className={`border rounded-md p-4 flex items-center justify-between bg-white dark:bg-gray-800 ${errors.steps?.[index] ? "border-red-500" : "border-gray-200 dark:border-gray-700"}`}
                                    >
                                        <div className="flex items-center flex-grow min-w-0">
                                            <Badge variant="outline" className="mr-3 bg-blue-50 text-blue-700 border-blue-200">
                                                {step.sequence}
                                            </Badge>
                                            <span
                                                className="font-medium truncate"
                                                title={step.name || `Bước ${step.sequence}`}
                                            >
                                                {step.name || `Bước ${step.sequence}`}
                                            </span>
                                            {step.type && (
                                                <Badge variant="secondary" className="ml-3 hidden sm:inline-flex flex-shrink-0">
                                                    {step.type}
                                                </Badge>
                                            )}
                                            {errors.steps?.[index] && (
                                                <AlertTriangle className="h-4 w-4 text-red-500 ml-2 flex-shrink-0" />
                                            )}
                                        </div>
                                        <div className="flex items-center space-x-1 flex-shrink-0 ml-4">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7"
                                                onClick={() => setEditingStepIndex(index)}
                                            >
                                                <Settings className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 text-red-500 hover:text-red-600"
                                                onClick={() => removeStep(index)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <DialogFooter className="p-6 pt-4 border-t bg-gray-50 rounded-b-lg">
                        <Button variant="outline" onClick={() => setIsConfirming(false)} disabled={loading}>
                            Quay lại
                        </Button>
                        <Button onClick={handleCreateWorkflow} disabled={loading} className="bg-primary hover:bg-primary-200">
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Đang tạo...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Xác nhận & Tạo
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Step Editing Dialog */}
            <Dialog open={editingStepIndex !== null} onOpenChange={(open) => !open && setEditingStepIndex(null)}>
                <DialogContent className="sm:max-w-[650px] p-7 border-0 bg-white backdrop-blur-xl shadow-2xl max-h-[90vh] overflow-y-auto hide-scrollbar">
                    <DialogHeader>
                        <DialogTitle>Chỉnh sửa bước {formData.steps[editingStepIndex ?? 0]?.sequence}</DialogTitle>
                    </DialogHeader>
                    {editingStepIndex !== null && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor={`step-sequence-${editingStepIndex}`}>Thứ tự (Sequence)</Label>
                                    <Input
                                        id={`step-sequence-${editingStepIndex}`}
                                        type="number"
                                        value={formData.steps[editingStepIndex].sequence}
                                        onChange={(e) => handleStepChange(editingStepIndex, "sequence", Number.parseInt(e.target.value))}
                                        disabled={loading}
                                        className={errors.steps?.[editingStepIndex]?.sequence ? "border-red-500" : ""}
                                    />
                                    {errors.steps?.[editingStepIndex]?.sequence && (
                                        <p className="text-red-500 text-sm">{errors.steps[editingStepIndex].sequence[0]}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor={`step-name-${editingStepIndex}`}>Tên bước</Label>
                                    <Input
                                        id={`step-name-${editingStepIndex}`}
                                        value={formData.steps[editingStepIndex].name}
                                        onChange={(e) => handleStepChange(editingStepIndex, "name", e.target.value)}
                                        disabled={loading}
                                        className={errors.steps?.[editingStepIndex]?.name ? "border-red-500" : ""}
                                        placeholder="Nhập tên bước"
                                    />
                                    {errors.steps?.[editingStepIndex]?.name && (
                                        <p className="text-red-500 text-sm">{errors.steps[editingStepIndex].name[0]}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor={`step-type-${editingStepIndex}`}>Loại bước (tự động)</Label>
                                    <Input
                                        id={`step-type-${editingStepIndex}`}
                                        value={formData.steps[editingStepIndex].type}
                                        readOnly={true}
                                        disabled={loading}
                                        className={`${errors.steps?.[editingStepIndex]?.type ? "border-red-500" : ""} bg-gray-50`}
                                        placeholder="Loại sẽ tự động cập nhật"
                                    />
                                    {errors.steps?.[editingStepIndex]?.type && (
                                        <p className="text-red-500 text-sm">{errors.steps[editingStepIndex].type[0]}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor={`step-maxRetries-${editingStepIndex}`}>Số lần thử lại tối đa</Label>
                                    <Input
                                        id={`step-maxRetries-${editingStepIndex}`}
                                        type="number"
                                        min="0"
                                        value={formData.steps[editingStepIndex].maxRetries}
                                        onChange={(e) =>
                                            handleStepChange(editingStepIndex, "maxRetries", Number.parseInt(e.target.value) >= 0 ? Number.parseInt(e.target.value) : 0)
                                        }
                                        disabled={loading}
                                        className={errors.steps?.[editingStepIndex]?.maxRetries ? "border-red-500" : ""}
                                    />
                                    {errors.steps?.[editingStepIndex]?.maxRetries && (
                                        <p className="text-red-500 text-sm">{errors.steps[editingStepIndex].maxRetries[0]}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor={`step-deviceModelId-${editingStepIndex}`}>Mẫu thiết bị</Label>
                                    <Select
                                        value={formData.steps[editingStepIndex].deviceModelId}
                                        onValueChange={(value) => handleStepChange(editingStepIndex, "deviceModelId", value)}
                                        disabled={loading || !selectedKioskVersion || (loadingDeviceModels && deviceModels.length === 0)}
                                    >
                                        <SelectTrigger
                                            id={`step-deviceModelId-${editingStepIndex}`}
                                            className={errors.steps?.[editingStepIndex]?.deviceModelId ? "border-red-500" : ""}
                                        >
                                            <SelectValue
                                                placeholder={
                                                    !selectedKioskVersion
                                                        ? "Chọn phiên bản kiosk trước"
                                                        : loadingDeviceModels && deviceModels.length === 0
                                                            ? "Đang tải mẫu thiết bị..."
                                                            : "Chọn mẫu thiết bị"
                                                }
                                            />
                                        </SelectTrigger>
                                        <SelectContent id={`device-model-scroll-content-${editingStepIndex}`} className="max-h-[300px]">
                                            {selectedKioskVersion && (
                                                <ScrollArea id={`device-model-scroll-area-${editingStepIndex}`} className="h-[200px]">
                                                    <InfiniteScroll
                                                        dataLength={deviceModels.length}
                                                        next={() => fetchDeviceModels(deviceModelPage + 1)}
                                                        hasMore={hasMoreDeviceModels && !loadingDeviceModels}
                                                        loader={<div className="p-2 text-center text-sm">Đang tải thêm...</div>}
                                                        scrollableTarget={`device-model-scroll-area-${editingStepIndex}`}
                                                    >
                                                        {deviceModels.map((deviceModel) => (
                                                            <SelectItem key={deviceModel.deviceModelId} value={deviceModel.deviceModelId}>
                                                                {deviceModel.modelName}
                                                            </SelectItem>
                                                        ))}
                                                        {!loadingDeviceModels && deviceModels.length === 0 && (
                                                            <div className="p-2 text-center text-sm text-gray-500">Chưa có mẫu thiết bị.</div>
                                                        )}
                                                    </InfiniteScroll>
                                                </ScrollArea>
                                            )}
                                        </SelectContent>
                                    </Select>
                                    {errors.steps?.[editingStepIndex]?.deviceModelId && (
                                        <p className="text-red-500 text-sm">{errors.steps[editingStepIndex].deviceModelId[0]}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor={`step-deviceFunctionId-${editingStepIndex}`}>Chức năng thiết bị</Label>
                                    <Select
                                        value={formData.steps[editingStepIndex].deviceFunctionId}
                                        onValueChange={(value) => handleStepChange(editingStepIndex, "deviceFunctionId", value)}
                                        disabled={
                                            loading ||
                                            !formData.steps[editingStepIndex].deviceModelId ||
                                            getDeviceFunctionsForModel(formData.steps[editingStepIndex].deviceModelId).length === 0
                                        }
                                    >
                                        <SelectTrigger
                                            id={`step-deviceFunctionId-${editingStepIndex}`}
                                            className={errors.steps?.[editingStepIndex]?.deviceFunctionId ? "border-red-500" : ""}
                                        >
                                            <SelectValue
                                                placeholder={
                                                    !formData.steps[editingStepIndex].deviceModelId
                                                        ? "Chọn mẫu thiết bị trước"
                                                        : getDeviceFunctionsForModel(formData.steps[editingStepIndex].deviceModelId).length === 0
                                                            ? "Chưa có chức năng"
                                                            : "Chọn chức năng"
                                                }
                                            />
                                        </SelectTrigger>
                                        <SelectContent className="max-h-[300px]">
                                            {getDeviceFunctionsForModel(formData.steps[editingStepIndex].deviceModelId).map((df) => (
                                                <SelectItem key={df.deviceFunctionId || df.name} value={df.deviceFunctionId || df.name}>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{df.label}</span>
                                                        {df.functionParameters && df.functionParameters.length > 0 && (
                                                            <span className="text-xs text-muted-foreground">{df.functionParameters.length} tham số</span>
                                                        )}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.steps?.[editingStepIndex]?.deviceFunctionId && (
                                        <p className="text-red-500 text-sm">{errors.steps[editingStepIndex].deviceFunctionId[0]}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor={`step-callbackWorkflowId-${editingStepIndex}`}>Quy trình callback (Tùy chọn)</Label>
                                    <Select
                                        value={formData.steps[editingStepIndex].callbackWorkflowId || ""}
                                        onValueChange={(value) => handleStepChange(editingStepIndex, "callbackWorkflowId", value)}
                                        disabled={loading || (loadingWorkflows && workflows.length === 0)}
                                    >
                                        <SelectTrigger
                                            id={`step-callbackWorkflowId-${editingStepIndex}`}
                                            className={errors.steps?.[editingStepIndex]?.callbackWorkflowId ? "border-red-500" : ""}
                                        >
                                            <SelectValue
                                                placeholder={loadingWorkflows && workflows.length === 0 ? "Đang tải quy trình..." : "Chọn quy trình callback"}
                                            />
                                        </SelectTrigger>
                                        <SelectContent id={`workflow-callback-scroll-content-${editingStepIndex}`} className="max-h-[300px]">
                                            <ScrollArea className="h-[200px]">
                                                <InfiniteScroll
                                                    dataLength={workflows.length}
                                                    next={() => fetchWorkflows(workflowPage + 1)}
                                                    hasMore={hasMoreWorkflows && !loadingWorkflows}
                                                    loader={<div className="p-2 text-center text-sm">Đang tải thêm...</div>}
                                                    scrollableTarget={`workflow-callback-scroll-content-${editingStepIndex}`}
                                                >
                                                    {workflows.map((wf) => (
                                                        <SelectItem key={wf.workflowId} value={wf.workflowId}>
                                                            {wf.name}
                                                        </SelectItem>
                                                    ))}
                                                    {!loadingWorkflows && workflows.length === 0 && (
                                                        <div className="p-2 text-center text-sm text-gray-500">Chưa có quy trình.</div>
                                                    )}
                                                </InfiniteScroll>
                                            </ScrollArea>
                                        </SelectContent>
                                    </Select>
                                    {errors.steps?.[editingStepIndex]?.callbackWorkflowId && (
                                        <p className="text-red-500 text-sm">{errors.steps[editingStepIndex].callbackWorkflowId[0]}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor={`step-callbackStepCode-${editingStepIndex}`}>Bước callback (Tùy chọn)</Label>
                                    <Select
                                        value={formData.steps[editingStepIndex].callbackStepCode ?? ""}
                                        onValueChange={(value) => handleStepChange(editingStepIndex, "callbackStepCode", value)}
                                        disabled={loading}
                                    >
                                        <SelectTrigger
                                            id={`step-callbackStepCode-${editingStepIndex}`}
                                            className={errors.steps?.[editingStepIndex]?.callbackStepCode ? "border-red-500" : ""}
                                        >
                                            <SelectValue placeholder="Chọn bước callback trong quy trình này" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {formData.steps
                                                .filter((_, idx) => idx !== editingStepIndex)
                                                .map((s) => (
                                                    <SelectItem key={s.stepCode} value={s.stepCode}>
                                                        {s.name || `Bước ${s.sequence}`} (Sequence: {s.sequence})
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.steps?.[editingStepIndex]?.callbackStepCode && (
                                        <p className="text-red-500 text-sm">{errors.steps[editingStepIndex].callbackStepCode[0]}</p>
                                    )}
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor={`step-parameters-${editingStepIndex}`}>Tham số (JSON)</Label>
                                    <FunctionParameterEditor
                                        deviceFunctionId={formData.steps[editingStepIndex].deviceFunctionId}
                                        deviceModels={deviceModels}
                                        value={formData.steps[editingStepIndex].parameters}
                                        onChange={(value) => handleStepChange(editingStepIndex, "parameters", value)}
                                        disabled={loading || !formData.steps[editingStepIndex].deviceFunctionId}
                                    />
                                    {errors.steps?.[editingStepIndex]?.parameters && (
                                        <p className="text-red-500 text-sm">{errors.steps[editingStepIndex].parameters[0]}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label>Điều kiện (Conditions)</Label>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => addCondition(editingStepIndex)}
                                        disabled={loading}
                                    >
                                        <PlusCircle className="h-4 w-4 mr-2" />
                                        Thêm điều kiện
                                    </Button>
                                </div>
                                {formData.steps[editingStepIndex].conditions?.length === 0 ? (
                                    <p className="text-gray-500 text-sm">Chưa có điều kiện nào được thêm.</p>
                                ) : (
                                    <div className="space-y-4">
                                        {formData.steps[editingStepIndex].conditions?.map((condition, conditionIndex) => (
                                            <div key={conditionIndex} className="border p-4 rounded-md space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="font-medium">Điều kiện {conditionIndex + 1}</h4>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeCondition(editingStepIndex, conditionIndex)}
                                                        disabled={loading}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-red-500" />
                                                    </Button>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>Tên điều kiện</Label>
                                                    <Select
                                                        value={condition.name}
                                                        onValueChange={(value) => handleConditionChange(editingStepIndex, conditionIndex, "name", value)}
                                                        disabled={loading}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Chọn tên điều kiện" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {Object.values(EConditionName).map((name) => (
                                                                <SelectItem key={name} value={name}>
                                                                    {EConditionNameViMap[name]}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>Mô tả</Label>
                                                    <Input
                                                        value={condition.description || ""}
                                                        onChange={(e) => handleConditionChange(editingStepIndex, conditionIndex, "description", e.target.value)}
                                                        disabled={loading}
                                                        placeholder="Nhập mô tả điều kiện"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>Biểu thức (Expression)</Label>
                                                    <div className="grid grid-cols-1 gap-4">
                                                        <div className="space-y-2">
                                                            <Label>Phần trái</Label>
                                                            <Select
                                                                value={condition.expression.left.type}
                                                                onValueChange={(value) => handleConditionChange(editingStepIndex, conditionIndex, "leftType", value)}
                                                                disabled={loading}
                                                            >
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Chọn loại" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {Object.values(EExpressionType).map((type) => (
                                                                        <SelectItem key={type} value={type}>
                                                                            {EExpressionTypeViMap[type]}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                            <Input
                                                                value={condition.expression.left.value}
                                                                onChange={(e) => handleConditionChange(editingStepIndex, conditionIndex, "leftValue", e.target.value)}
                                                                disabled={loading}
                                                                placeholder={condition.expression.left.type === EExpressionType.Variable ? "Tên biến" : "Giá trị"}
                                                            />
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label>Toán tử</Label>
                                                            <Select
                                                                value={condition.expression.operator}
                                                                onValueChange={(value) => handleConditionChange(editingStepIndex, conditionIndex, "operator", value)}
                                                                disabled={loading}
                                                            >
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Chọn toán tử" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {Object.values(EOperation).map((op) => (
                                                                        <SelectItem key={op} value={op}>
                                                                            {EOperationViMap[op]} ({op})
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label>Phần phải</Label>
                                                            <Select
                                                                value={condition.expression.right.type}
                                                                onValueChange={(value) => handleConditionChange(editingStepIndex, conditionIndex, "rightType", value)}
                                                                disabled={loading}
                                                            >
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Chọn loại" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {Object.values(EExpressionType).map((type) => (
                                                                        <SelectItem key={type} value={type}>
                                                                            {EExpressionTypeViMap[type]}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                            <Input
                                                                value={condition.expression.right.value}
                                                                onChange={(e) => handleConditionChange(editingStepIndex, conditionIndex, "rightValue", e.target.value)}
                                                                disabled={loading}
                                                                placeholder={condition.expression.right.type === EExpressionType.Variable ? "Tên biến" : "Giá trị"}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

        </div>
    )
}

export default CreateWorkflow