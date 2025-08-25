"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { getWorkflow } from "@/services/workflow.service"
import type { Workflow } from "@/interfaces/workflow"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Clock, Edit, Trash2, WorkflowIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { EWorkflowTypeViMap } from "@/enum/workflow"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { WorkflowStepCard } from "@/components/manage-workflows/workflow-step-card"
import type { ErrorResponse } from "@/types/error"

const WorkflowDetail = () => {
    const { slug } = useParams()
    const router = useRouter()
    const { toast } = useToast()
    const [workflow, setWorkflow] = useState<Workflow | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchWorkflow = async () => {
            try {
                setLoading(true)
                const response = await getWorkflow(slug as string)

                // Sort steps by sequence to ensure correct order
                const workflowData = {
                    ...response.response,
                    steps: response.response.steps.sort((a, b) => a.sequence - b.sequence),
                }

                setWorkflow(workflowData)
            } catch (error: unknown) {
                const err = error as ErrorResponse
                console.error("Lỗi khi lấy thông tin quy trinh:", err)
                toast({
                    title: "Lỗi khi thông tin quy trình",
                    description: err.message,
                    variant: "destructive",
                })
            } finally {
                setLoading(false)
            }
        }

        if (slug) {
            fetchWorkflow()
        }
    }, [slug, toast])

    const handleBack = () => {
        router.back()
    }

    const handleEdit = () => {
        router.push(`/update-workflow/${workflow?.workflowId}`)
    }

    return (
        <div className="flex flex-col min-h-screen">
            <main className="flex-1 p-6 bg-gradient-to-r from-[#e1f9f9] to-white dark:from-[#1a3333] dark:to-[#121212]">
                <div className="max-w-5xl mx-auto">
                    {/* Header with back button */}
                    <div className="flex items-center mb-6">
                        <Button variant="ghost" onClick={handleBack} className="mr-4">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Quay lại
                        </Button>
                        <h1 className="text-2xl font-bold text-[#295959] dark:text-[#68e0df]">Chi tiết quy trình</h1>
                    </div>

                    {loading ? (
                        <WorkflowDetailSkeleton />
                    ) : workflow ? (
                        <>
                            {/* Workflow Info Card */}
                            <Card className="mb-6 border-[#e1f9f9] dark:border-[#1a3333] shadow-md bg-white/90 dark:bg-[#121212]/90 backdrop-blur-sm">
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center">
                                            <WorkflowIcon className="h-6 w-6 mr-2 text-[#68e0df]" />
                                            <div>
                                                <CardTitle className="text-xl text-[#295959] dark:text-[#68e0df]">{workflow.name}</CardTitle>
                                                <CardDescription>{workflow.description || "Chưa có mô tả"}</CardDescription>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                onClick={handleEdit}
                                                variant="outline"
                                                size="sm"
                                                className="border-[#68e0df] text-[#3f8786] hover:bg-[#e1f9f9]"
                                            >
                                                <Edit className="h-4 w-4 mr-2" />
                                                Chỉnh sửa
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="border-red-300 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                                            >
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Xóa
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                        <div className="space-y-2">
                                            <div className="flex gap-2">
                                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Tên quy trình:</span>
                                                <span className="text-sm font-medium">{workflow.name}</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Sản phẩm:</span>
                                                <span className="text-sm font-medium">
                                                    {workflow.product ? (
                                                        workflow.product.name
                                                    ) : (
                                                        <span className="text-gray-400 italic">Chưa có sản phẩm</span>
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex gap-4">
                                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Loại quy trình:</span>
                                                <Badge className="bg-[#68e0df] hover:bg-[#3f8786] text-white">
                                                    {EWorkflowTypeViMap[workflow.type] || workflow.type}
                                                </Badge>
                                            </div>
                                            <div className="flex gap-4">
                                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Số bước:</span>
                                                <Badge variant="outline" className="border-[#68e0df] text-[#3f8786]">
                                                    {workflow.steps.length} bước
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Workflow Steps */}
                            <div className="mb-6">
                                <div className="flex items-center mb-4">
                                    <Clock className="h-5 w-5 mr-2 text-[#68e0df]" />
                                    <h2 className="text-lg font-semibold text-[#295959] dark:text-[#68e0df]">Các bước quy trình</h2>
                                </div>

                                <div className="space-y-4">
                                    {workflow.steps.map((step, index) => (
                                        <WorkflowStepCard key={`step-${step.sequence}-${index}`} step={step} index={index} />
                                    ))}
                                </div>
                            </div>
                        </>
                    ) : (
                        <Card className="border-[#e1f9f9] dark:border-[#1a3333] shadow-md">
                            <CardContent className="flex flex-col items-center justify-center py-10">
                                <p className="text-lg text-gray-500 dark:text-gray-400">Không tìm thấy thông tin quy trình</p>
                                <Button variant="secondary" className="mt-4" onClick={handleBack}>
                                    Quay lại danh sách
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </main>
        </div>
    )
}

function WorkflowDetailSkeleton() {
    return (
        <>
            <Card className="mb-6 border-[#e1f9f9] dark:border-[#1a3333]">
                <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center">
                            <Skeleton className="h-6 w-6 mr-2 rounded-full" />
                            <div>
                                <Skeleton className="h-6 w-48 mb-2" />
                                <Skeleton className="h-4 w-72" />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Skeleton className="h-9 w-24" />
                            <Skeleton className="h-9 w-20" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-4 w-32" />
                            </div>
                            <div className="flex justify-between">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-4 w-32" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-6 w-20 rounded-full" />
                            </div>
                            <div className="flex justify-between">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-6 w-16 rounded-full" />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="mb-6">
                <div className="flex items-center mb-4">
                    <Skeleton className="h-5 w-5 mr-2 rounded-full" />
                    <Skeleton className="h-6 w-40" />
                </div>

                <div className="space-y-4">
                    {[1, 2, 3].map((index) => (
                        <Card key={index} className="border-[#e1f9f9] dark:border-[#1a3333]">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center">
                                        <Skeleton className="h-8 w-8 rounded-full mr-3" />
                                        <div>
                                            <Skeleton className="h-5 w-32 mb-1" />
                                            <Skeleton className="h-4 w-24" />
                                        </div>
                                    </div>
                                    <Skeleton className="h-6 w-16 rounded-full" />
                                </div>
                                <Separator className="my-4" />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-full" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </>
    )
}

export default WorkflowDetail
