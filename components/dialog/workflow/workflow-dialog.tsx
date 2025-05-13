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
import { getProducts } from "@/services/product"; // Import service để lấy sản phẩm
import { Product } from "@/interfaces/product"; // Interface cho sản phẩm
import InfiniteScroll from "react-infinite-scroll-component"; // Thêm InfiniteScroll

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
    const [products, setProducts] = useState<Product[]>([]); // State cho danh sách sản phẩm
    const [page, setPage] = useState(1); // Quản lý trang hiện tại
    const [hasMore, setHasMore] = useState(true); // Kiểm tra còn dữ liệu để tải thêm không

    // Hàm fetch danh sách sản phẩm từ API
    const fetchProducts = async (pageNumber: number) => {
        try {
            const response = await getProducts({ page: pageNumber, size: 10 });
            if (pageNumber === 1) {
                setProducts(response.items); // Nếu là trang đầu, thay thế danh sách
            } else {
                setProducts((prev) => [...prev, ...response.items]); // Thêm vào danh sách hiện có
            }
            if (response.items.length < 10) {
                setHasMore(false); // Nếu ít hơn 10 sản phẩm, không còn dữ liệu để tải
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

    // Fetch sản phẩm khi dialog mở
    useEffect(() => {
        if (open) {
            fetchProducts(1); // Lấy trang đầu tiên
        }
    }, [open]);

    // Điền dữ liệu form khi chỉnh sửa workflow
    useEffect(() => {
        if (workflow) {
            setFormData({
                name: workflow.name,
                description: workflow.description,
                type: workflow.type,
                productId: workflow.productId,
            });
        } else {
            setFormData(initialFormData);
        }
    }, [workflow, open]);

    // Reset form và state khi dialog đóng
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

        if (!formData.name.trim()) {
            toast({
                title: "Lỗi",
                description: "Vui lòng nhập tên quy trình",
                variant: "destructive",
            });
            return;
        }

        if (!formData.productId) {
            toast({
                title: "Lỗi",
                description: "Vui lòng chọn sản phẩm",
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

    // Tải thêm sản phẩm khi cuộn
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
                                disabled={isSubmitting}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="productId" className="required">
                                Sản phẩm
                            </Label>
                            <Select
                                value={formData.productId}
                                onValueChange={(value) => handleChange("productId", value)}
                                disabled={isSubmitting}
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