import type { FC } from "react"
import type { NodeProps } from "reactflow"
import { Handle, Position } from "reactflow"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Settings, Trash2, AlertTriangle } from "lucide-react"

interface WorkflowStepNodeData {
    step: {
        sequence: number
        name: string
        type: string
    }
    onEdit: () => void
    onDelete: () => void
    errors: Record<string, any>
}

const WorkflowStepNode: FC<NodeProps<WorkflowStepNodeData>> = ({ data }) => {
    const { step, onEdit, onDelete, errors } = data
    const hasError = Object.keys(errors).length > 0

    return (
        <>
            {/* Điểm nối vào (phía trên) */}
            <Handle type="target" position={Position.Top} className="!bg-primary" />

            <Card className={`w-full ${hasError ? "border-red-500 shadow-md shadow-red-500/20" : ""}`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 bg-muted/50">
                    <CardTitle className="text-sm font-medium flex items-center">
                        <Badge variant="secondary" className="mr-2">
                            {step.sequence}
                        </Badge>
                        <span className="truncate" title={step.name}>
                            {step.name}
                        </span>
                    </CardTitle>
                    {hasError && <AlertTriangle className="h-4 w-4 text-red-500" />}
                </CardHeader>
                <CardContent className="p-3 text-xs text-muted-foreground">
                    <div className="flex justify-between items-center">
                        <span className="truncate" title={step.type || "Chưa có loại"}>
                            Loại: {step.type || "Chưa xác định"}
                        </span>
                        <div className="flex items-center space-x-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onEdit}>
                                <Settings className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-600" onClick={onDelete}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Điểm nối ra (phía dưới) */}
            <Handle type="source" position={Position.Bottom} className="!bg-primary" />
        </>
    )
}

export default WorkflowStepNode