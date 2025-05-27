"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Cpu, Settings, Repeat, ArrowRight } from "lucide-react"
import type { WorkflowStep } from "@/interfaces/workflow"
import { ParametersDisplay } from "../common/parameter-display"

interface WorkflowStepCardProps {
    step: WorkflowStep
    index: number
}

export function WorkflowStepCard({ step, index }: WorkflowStepCardProps) {
    return (
        <Card className="border-[#e1f9f9] dark:border-[#1a3333] shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#68e0df] text-white font-semibold mr-3">
                            {step.sequence}
                        </div>
                        <div>
                            <h3 className="font-semibold text-[#295959] dark:text-[#68e0df]">{step.name}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{step.type}</p>
                        </div>
                    </div>
                    <Badge className="bg-[#68e0df] hover:bg-[#3f8786] text-white">Bước {step.sequence}</Badge>
                </div>

                <Separator className="my-4" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Cpu className="h-4 w-4 text-[#68e0df]" />
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Thiết bị:</span>
                            <span className="text-sm font-medium">{step.deviceModel?.modelName || "Chưa chọn"}</span>
                        </div>

                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Repeat className="h-4 w-4 text-[#68e0df]" />
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Thử lại:</span>
                            <Badge variant="outline" className="border-[#68e0df] text-[#3f8786]">
                                {step.maxRetries} lần
                            </Badge>
                        </div>

                    </div>
                </div>

                {step.parameters && (
                    <div className="mt-4">
                        <ParametersDisplay parameters={step.parameters} compact={true} />
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
