"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Loader2, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createKioskVersion, updateKioskVersion, getKioskTypes } from "@/services/kiosk"; // Cập nhật services
import { KioskType } from "@/interfaces/kiosk";
import InfiniteScroll from "react-infinite-scroll-component";
import { EBaseStatus, EBaseStatusViMap } from "@/enum/base";
import { KioskDialogProps } from "@/types/dialog";

// Dữ liệu khởi tạo cho form
const initialFormData = {
    kioskTypeId: "",
    versionTitle: "",
    description: "",
    versionNumber: "",
    status: EBaseStatus.Active,
};

const KioskVersionDialog = ({ open, onOpenChange, onSuccess, kioskVersion }: KioskDialogProps) => {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState(initialFormData);
    const [kioskTypes, setKioskTypes] = useState<KioskType[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    // Hàm lấy danh sách kiosk types
    const fetchKioskTypes = async (pageNumber: number) => {
        try {
            const response = await getKioskTypes({ page: pageNumber, size: 10 });
            if (pageNumber === 1) {
                setKioskTypes(response.items);
            } else {
                setKioskTypes((prev) => [...prev, ...response.items]);
            }
            if (response.items.length < 10) {
                setHasMore(false);
            }
        } catch (error) {
            console.error("Error fetching kiosk types:", error);
            toast({
                title: "Lỗi",
                description: "Không tải được các loại kiosk.",
                variant: "destructive",
            });
        }
    };

    // Gọi API khi dialog mở
    useEffect(() => {
        if (open) {
            fetchKioskTypes(1);
        }
    }, [open]);

    // Cập nhật form khi có dữ liệu kioskVersion (chế độ chỉnh sửa)
    useEffect(() => {
        if (kioskVersion) {
            setFormData({
                kioskTypeId: kioskVersion.kioskTypeId || "",
                versionTitle: kioskVersion.versionTitle || "",
                description: kioskVersion.description || "",
                versionNumber: kioskVersion.versionNumber || "",
                status: kioskVersion.status || EBaseStatus.Active,
            });
        } else {
            setFormData(initialFormData);
        }
    }, [kioskVersion, open]);

    // Reset form khi đóng dialog
    useEffect(() => {
        if (!open) {
            setFormData(initialFormData);
            setPage(1);
            setKioskTypes([]);
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

        if (!formData.versionTitle.trim()) {
            toast({
                title: "Lỗi",
                description: "Vui lòng nhập tiêu đề phiên bản.",
                variant: "destructive",
            });
            return;
        }

        if (!formData.kioskTypeId) {
            toast({
                title: "Lỗi",
                description: "Vui lòng chọn loại kiosk.",
                variant: "destructive",
            });
            return;
        }

        try {
            setIsSubmitting(true);
            const payload = { ...formData };
            if (kioskVersion) {
                await updateKioskVersion(kioskVersion.kioskVersionId, payload);
                toast({
                    title: "Thành công",
                    description: "Cập nhật phiên bản kiosk thành công.",
                });
            } else {
                await createKioskVersion(payload);
                toast({
                    title: "Thành công",
                    description: "Thêm phiên bản kiosk thành công.",
                });
            }
            onSuccess?.();
            onOpenChange(false);
        } catch (error) {
            console.error("Error processing kiosk version:", error);
            toast({
                title: "Lỗi",
                description: "Đã xảy ra lỗi trong khi xử lý phiên bản kiosk. Vui lòng thử lại sau.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Tải thêm kiosk types khi cuộn
    const loadMoreKioskTypes = async () => {
        const nextPage = page + 1;
        await fetchKioskTypes(nextPage);
        setPage(nextPage);
    };

    const isUpdate = !!kioskVersion;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center">
                        {isUpdate ? (
                            <>
                                <Edit className="mr-2 h-5 w-5" />
                                Cập nhật phiên bản kiosk
                            </>
                        ) : (
                            <>
                                <PlusCircle className="mr-2 h-5 w-5" />
                                Thêm phiên bản kiosk
                            </>
                        )}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="versionTitle" className="required">
                                Tiêu đề phiên bản
                            </Label>
                            <Input
                                id="versionTitle"
                                placeholder="Nhập tiêu đề phiên bản"
                                value={formData.versionTitle}
                                onChange={(e) => handleChange("versionTitle", e.target.value)}
                                disabled={isSubmitting}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Mô tả</Label>
                            <Input
                                id="description"
                                placeholder="Nhập mô tả"
                                value={formData.description}
                                onChange={(e) => handleChange("description", e.target.value)}
                                disabled={isSubmitting}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="versionNumber">Số phiên bản</Label>
                            <Input
                                id="versionNumber"
                                placeholder="Nhập số phiên bản"
                                value={formData.versionNumber}
                                onChange={(e) => handleChange("versionNumber", e.target.value)}
                                disabled={isSubmitting}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="kioskTypeId" className="required">
                                Loại kiosk
                            </Label>
                            <Select
                                value={formData.kioskTypeId}
                                onValueChange={(value) => handleChange("kioskTypeId", value)}
                                disabled={isSubmitting}
                            >
                                <SelectTrigger id="kioskTypeId">
                                    <SelectValue placeholder="Chọn loại kiosk" />
                                </SelectTrigger>
                                <SelectContent className="max-h-[300px] overflow-y-auto">
                                    <InfiniteScroll
                                        dataLength={kioskTypes.length}
                                        next={loadMoreKioskTypes}
                                        hasMore={hasMore}
                                        loader={<div className="p-2 text-center text-sm">Đang tải thêm...</div>}
                                        scrollableTarget="select-content"
                                        style={{ overflow: "hidden" }}
                                    >
                                        {kioskTypes.map((kioskType) => (
                                            <SelectItem key={kioskType.kioskTypeId} value={kioskType.kioskTypeId}>
                                                {kioskType.name}
                                            </SelectItem>
                                        ))}
                                    </InfiniteScroll>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status" className="required">
                                Trạng thái
                            </Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value) => handleChange("status", value)}
                                disabled={isSubmitting}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn trạng thái" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(EBaseStatusViMap).map(([key, value]) => (
                                        <SelectItem key={key} value={key}>
                                            {value}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting}
                        >
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
                                    Cập nhật phiên bản kiosk
                                </>
                            ) : (
                                <>
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Thêm phiên bản kiosk
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default KioskVersionDialog;