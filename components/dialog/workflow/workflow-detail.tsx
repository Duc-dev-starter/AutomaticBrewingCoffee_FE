import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Workflow } from "@/interfaces/workflow";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info, Workflow as WorkflowIcon, FileText } from "lucide-react";
import clsx from "clsx";
import { EWorkflowTypeViMap } from "@/enum/workflow";
import { WorkflowDialogProps } from "@/types/dialog";


const WorkflowDetailDialog = ({ workflow, open, onOpenChange }: WorkflowDialogProps) => {
    if (!workflow) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-xl font-bold flex items-center">
                            <WorkflowIcon className="mr-2 h-5 w-5" />
                            Chi tiết quy trình
                        </DialogTitle>
                        <Badge className={clsx("mr-4", workflow.type === "Activity" ? "bg-blue-500" : "bg-green-500")}>
                            {EWorkflowTypeViMap[workflow.type] || "Không rõ"}
                        </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground mt-2">
                        <div className="flex items-center">
                            <FileText className="mr-1 h-4 w-4" />
                            Mã quy trình: <span className="font-medium ml-1">{workflow.workflowId}</span>
                        </div>
                    </div>
                </DialogHeader>

                <ScrollArea className="flex-1 pr-4">
                    <div className="space-y-6 py-2">
                        <Card>
                            <CardContent className="p-4">
                                <h3 className="font-semibold text-sm flex items-center mb-3">
                                    <Info className="mr-2 h-4 w-4" />
                                    Thông tin quy trình
                                </h3>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div className="flex flex-col">
                                        <span className="text-muted-foreground">Tên quy trình</span>
                                        <span className="font-medium">{workflow.name}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-muted-foreground">Loại</span>
                                        <span className="font-medium">{EWorkflowTypeViMap[workflow.type]}</span>
                                    </div>
                                    <div className="col-span-2 flex flex-col">
                                        <span className="text-muted-foreground">Mô tả</span>
                                        <span className="font-medium">{workflow.description || "Không có"}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-muted-foreground">Sản phẩm liên kết</span>
                                        <span className="font-medium">{workflow.productId}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-muted-foreground">Số bước</span>
                                        <span className="font-medium">{workflow.steps.length}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
};

export default WorkflowDetailDialog;