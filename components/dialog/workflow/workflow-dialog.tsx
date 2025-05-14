"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EWorkflowStepType, EWorkflowType, EWorkflowTypeViMap } from "@/enum/workflow";
import { EBaseStatus, EBaseStatusViMap } from "@/enum/base";
import { PlusCircle, Loader2, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createWorkflow, updateWorkflow } from "@/services/workflow";
import { WorkflowDialogProps } from "@/types/dialog";
import { ErrorResponse } from "@/types/error";
import { getProducts } from "@/services/product";
import { Product } from "@/interfaces/product";
import InfiniteScroll from "react-infinite-scroll-component";
import { workflowSchema } from "@/schema/workflow";

// Khởi tạo formData với tất cả các trường cần thiết theo schema
const initialFormData = {
    name: "",
    description: "",
    type: EWorkflowType.Activity,
    productId: "",
    steps: [
        {
            name: "",
            type: EWorkflowStepType.AlertCancellationCommand,
            deviceId: "",
            maxRetries: 0,
            callbackWorkflowId: "",
            parameters: "",
        },
    ],
};

const WorkflowDialog = ({ open, onOpenChange, onSuccess, workflow }: WorkflowDialogProps) => {
    const { toast } = useToast();
    const [errors, setErrors] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState(initialFormData);
    const [products, setProducts] = useState<Product[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    // Hàm fetch danh sách sản phẩm từ API
    const fetchProducts = async (pageNumber: number) => {
        try {
            const response = await getProducts({ page: pageNumber, size: 10 });
            if (pageNumber === 1) {
                setProducts(response.items);
            } else {
                setProducts((prev) => [...prev, ...response.items]);
            }
            if (response.items.length < 10) {
                setHasMore(false);
            }
        } catch (error) {
            console.error("Error fetching products:", error);
            toast({
                title: "Lỗi",
                description: "Không tải được danh sách sản phẩm.",
                variant: "destructive",
            });
        }
    };

    useEffect(() => {
        if (open) {
            fetchProducts(1);
        }
    }, [open]);

    // Điền dữ liệu khi chỉnh sửa workflow
    useEffect(() => {
        if (workflow) {
            setFormData({
                name: workflow.name,
                description: workflow.description ?? "",
                type: workflow.type,
                productId: workflow.productId,
                steps: workflow.steps ?? initialFormData.steps,
            });
        } else {
            setFormData(initialFormData);
        }
    }, [workflow, open]);

    // Reset form khi đóng dialog
    useEffect(() => {
        if (!open) {
            setFormData(initialFormData);
            setProducts([]);
            setPage(1);
            setHasMore(true);
        }
    }, [open]);

    // Xử lý thay đổi giá trị trong form
    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    // Xử lý submit form
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        e.stopPropagation();

        // Validate dữ liệu theo schema
        const validationResult = workflowSchema.safeParse(formData);
        if (!validationResult.success) {
            const { fieldErrors } = validationResult.error.flatten();
            console.log("Validation errors:", fieldErrors);
            setErrors(fieldErrors);
            return;
        }

        setErrors({});
        setLoading(true);
        try {
            // Xây dựng đối tượng data khớp với workflowSchema
            const data = {
                name: formData.name,
                description: formData.description || undefined,
                type: formData.type,
                productId: formData.productId,
                steps: formData.steps,
            };

            if (workflow) {
                await updateWorkflow(workflow.workflowId, data);
                toast({
                    title: "Thành công",
                    description: "Cập nhật quy trình thành công",
                });
            } else {
                await createWorkflow(data);
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
            setLoading(false);
        }
    };

    // Tải thêm sản phẩm
    const loadMoreProducts = async () => {
        const nextPage = page + 1;
        await fetchProducts(nextPage);
        setPage(nextPage);
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
                                disabled={loading}
                            />
                            {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="productId" className="required">
                                Sản phẩm
                            </Label>
                            <Select
                                value={formData.productId}
                                onValueChange={(value) => handleChange("productId", value)}
                                disabled={loading}
                            >
                                <SelectTrigger id="productId">
                                    <SelectValue placeholder="Chọn sản phẩm" />
                                </SelectTrigger>
                                <SelectContent className="max-h-[300px] overflow-y-auto">
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
                                </SelectContent>
                            </Select>
                            {errors.productId && <p className="text-red-500 text-sm">{errors.productId}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="type" className="required">
                                Loại quy trình
                            </Label>
                            <Select
                                value={formData.type}
                                onValueChange={(value) => handleChange("type", value)}
                                disabled={loading}
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
                            {errors.type && <p className="text-red-500 text-sm">{errors.type}</p>}
                        </div>


                        <div className="space-y-2">
                            <Label htmlFor="description">Mô tả</Label>
                            <Textarea
                                id="description"
                                placeholder="Nhập mô tả quy trình"
                                value={formData.description}
                                onChange={(e) => handleChange("description", e.target.value)}
                                disabled={loading}
                                className="min-h-[100px]"
                            />
                            {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                            Hủy
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? (
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