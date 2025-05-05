"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Loader2, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { LocationTypeDialogProps } from "@/types/dialog";
import { createLocationType, updateLocationType } from "@/services/locationType";

const initialFormData = {
    name: "",
    description: "",
};

const LocationTypeDialog = ({ open, onOpenChange, onSuccess, locationType }: LocationTypeDialogProps) => {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState(initialFormData);

    // Populate form data when editing
    useEffect(() => {
        if (locationType) {
            setFormData({
                name: locationType.name,
                description: locationType.description,
            });
        }
    }, [locationType]);

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
                description: "Vui lòng nhập tên location",
                variant: "destructive",
            });
            return;
        }

        try {
            setIsSubmitting(true);
            if (locationType) {
                await updateLocationType(locationType.locationTypeId, formData);
                toast({
                    title: "Thành công",
                    description: "Cập nhật location thành công",
                });
            } else {
                await createLocationType(formData);
                toast({
                    title: "Thành công",
                    description: "Thêm location mới thành công",
                });
            }
            onSuccess?.();
            onOpenChange(false);
        } catch (error) {
            console.error("Lỗi khi xử lý location:", error);
            toast({
                title: "Lỗi",
                description: "Có lỗi xảy ra khi xử lý location. Vui lòng thử lại sau.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const isUpdate = !!locationType;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center">
                        {isUpdate ? (
                            <>
                                <Edit className="mr-2 h-5 w-5" />
                                Cập nhật location
                            </>
                        ) : (
                            <>
                                <PlusCircle className="mr-2 h-5 w-5" />
                                Thêm location mới
                            </>
                        )}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="required">
                                Tên location
                            </Label>
                            <Input
                                id="name"
                                placeholder="Nhập tên location"
                                value={formData.name}
                                onChange={(e) => handleChange("name", e.target.value)}
                                disabled={isSubmitting}
                                required
                            />
                        </div>


                        <div className="space-y-2">
                            <Label htmlFor="description">Mô tả</Label>
                            <Textarea
                                id="description"
                                placeholder="Nhập mô tả location"
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
                                    Cập nhật location
                                </>
                            ) : (
                                <>
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Thêm location
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default LocationTypeDialog;