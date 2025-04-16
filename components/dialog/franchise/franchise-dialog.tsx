"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Franchise } from "@/types/franchise";
import { EBaseStatus } from "@/enum/base";
import { useToast } from "@/hooks/use-toast";
import { createFranchise, updateFranchise } from "@/services/franchise";

interface FranchiseDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    franchise?: Franchise;
}

const initialFormData = {
    name: "",
    description: "",
    status: EBaseStatus.Active,
};

const FranchiseDialog = ({ open, onOpenChange, onSuccess, franchise }: FranchiseDialogProps) => {
    const { toast } = useToast();
    const [formData, setFormData] = useState(initialFormData);
    const [loading, setLoading] = useState(false);

    // Populate form data when editing
    useEffect(() => {
        if (franchise) {
            setFormData({
                name: franchise.name || "",
                description: franchise.description || "",
                status: franchise.status || EBaseStatus.Active,
            });
        }
    }, [franchise]);

    // Reset form data when dialog closes
    useEffect(() => {
        if (!open) {
            setFormData(initialFormData);
        }
    }, [open]);

    const handleSubmit = async () => {
        if (!formData.name.trim()) {
            toast({
                title: "Lỗi",
                description: "Tên chi nhánh không được để trống.",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);
        try {
            if (franchise) {
                await updateFranchise(franchise.franchiseId, {
                    name: formData.name,
                    description: formData.description,
                    status: formData.status,
                });
                toast({
                    title: "Thành công",
                    description: `Chi nhánh "${formData.name}" đã được cập nhật.`,
                });
            } else {
                await createFranchise({
                    name: formData.name,
                    description: formData.description,
                    status: formData.status,
                });
                toast({
                    title: "Thành công",
                    description: `Chi nhánh "${formData.name}" đã được tạo.`,
                });
            }
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            console.error("Lỗi:", error);
            toast({
                title: "Lỗi",
                description: franchise ? "Không thể cập nhật chi nhánh." : "Không thể tạo chi nhánh.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{franchise ? "Chỉnh sửa chi nhánh" : "Thêm chi nhánh mới"}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Tên chi nhánh</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Nhập tên chi nhánh"
                            disabled={loading}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="description">Mô tả</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Nhập mô tả chi nhánh"
                            disabled={loading}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="status">Trạng thái</Label>
                        <Select
                            value={formData.status}
                            onValueChange={(value) => setFormData({ ...formData, status: value as EBaseStatus })}
                            disabled={loading}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn trạng thái" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={EBaseStatus.Active}>Hoạt động</SelectItem>
                                <SelectItem value={EBaseStatus.Inactive}>Không hoạt động</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                        Hủy
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {franchise ? "Cập nhật" : "Thêm"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default FranchiseDialog;