"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EWorkflowType, EWorkflowTypeViMap } from "@/enum/workflow";
import { PlusCircle, Loader2, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createWorkflow, updateWorkflow } from "@/services/workflow";
import { WorkflowDialogProps } from "@/types/dialog";
import { ErrorResponse } from "@/types/error";


const initialFormData = {
    name: "",
    description: "",
    type: EWorkflowType.Activity,
    productId: "",
};

const WorkflowDialog = ({ open, onOpenChange, onSuccess, workflow }: WorkflowDialogProps) => {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState(initialFormData);

    // Populate form data when editing
    useEffect(() => {
        if (workflow) {
            setFormData({
                name: workflow.name,
                description: workflow.description,
                type: workflow.type,
                productId: workflow.productId,
            });
        }
    }, [workflow]);

    // Reset form data when dialog closes
    useEffect(() => {
        if (!open) {
            setFormData(initialFormData);
        }
    }, [open]);

    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            toast({
                title: "Lỗi",
                description: "Vui lòng nhập tên quy trình",
                variant: "destructive",
            });
            return;
        }

        if (!formData.productId.trim()) {
            toast({
                title: "Lỗi",
                description: "Vui lòng nhập mã sản phẩm",
                variant: "destructive",
            });
            return;
        }

        try {
            setIsSubmitting(true);
            if (workflow) {
                await updateWorkflow(workflow.workflowId, formData);
                toast({
                    title: "Thành công",
                    description: "Cập nhật quy trình thành công",
                });
            } else {
                await createWorkflow(formData);
                toast({
                    title: "Thành công",
                    description: "Thêm quy trình mới thành công",
                });
            }
            onSuccess?.();
            onOpenChange(false);
        } catch (error) {
            const err = error as ErrorResponse;
            console.error("Lỗi khi xử lý quy trình:", error);
            toast({
                title: "Lỗi khi xử lý quy trình",
                description: err.message,
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const isUpdate = !!workflow;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center">
                        {isUpdate ? (
                            <>
                                <Edit className="mr-2 h-5 w-5" />
                                Cập nhật quy trình
                            </>
                        ) : (
                            <>
                                <PlusCircle className="mr-2 h-5 w-5" />
                                Thêm quy trình mới
                            </>
                        )}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="required">
                                Tên quy trình
                            </Label>
                            <Input
                                id="name"
                                placeholder="Nhập tên quy trình"
                                value={formData.name}
                                onChange={(e) => handleChange("name", e.target.value)}
                                disabled={isSubmitting}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="productId" className="required">
                                Mã sản phẩm
                            </Label>
                            <Input
                                id="productId"
                                placeholder="Nhập mã sản phẩm"
                                value={formData.productId}
                                onChange={(e) => handleChange("productId", e.target.value)}
                                disabled={isSubmitting}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="type" className="required">
                                Loại quy trình
                            </Label>
                            <Select
                                value={formData.type}
                                onValueChange={(value) => handleChange("type", value)}
                                disabled={isSubmitting}
                            >
                                <SelectTrigger id="type">
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
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Mô tả</Label>
                            <Textarea
                                id="description"
                                placeholder="Nhập mô tả quy trình"
                                value={formData.description}
                                onChange={(e) => handleChange("description", e.target.value)}
                                disabled={isSubmitting}
                                className="min-h-[100px]"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                            Hủy
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Đang xử lý...
                                </>
                            ) : isUpdate ? (
                                <>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Cập nhật quy trình
                                </>
                            ) : (
                                <>
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Thêm quy trình
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default WorkflowDialog;