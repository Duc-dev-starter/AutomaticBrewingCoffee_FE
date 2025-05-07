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
import { createDeviceModel, updateDeviceModel, getDeviceTypes } from "@/services/device";
import { DeviceDialogProps } from "@/types/dialog";
import { DeviceType } from "@/interfaces/device";
import InfiniteScroll from "react-infinite-scroll-component";
import { EBaseStatus, EBaseStatusViMap } from "@/enum/base";

const initialFormData = {
    modelName: "",
    manufacturer: "",
    deviceTypeId: "",
    status: EBaseStatus.Active,
};

const DeviceModelDialog = ({ open, onOpenChange, onSuccess, deviceModel }: DeviceDialogProps) => {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState(initialFormData);
    const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const fetchDeviceTypes = async (pageNumber: number) => {
        try {
            const response = await getDeviceTypes({ page: pageNumber, size: 10 });
            if (pageNumber === 1) {
                setDeviceTypes(response.items);
            } else {
                setDeviceTypes(prev => [...prev, ...response.items]);
            }
            if (response.items.length < 10) {
                setHasMore(false);
            }
        } catch (error) {
            console.error("Error fetching device types:", error);
            toast({
                title: "Error",
                description: "Failed to load device types.",
                variant: "destructive",
            });
        }
    };

    useEffect(() => {
        if (open) {
            fetchDeviceTypes(1);
        }
    }, [open]);

    useEffect(() => {
        if (deviceModel) {
            setFormData({
                modelName: deviceModel.modelName || "",
                manufacturer: deviceModel.manufacturer || "",
                deviceTypeId: deviceModel.deviceTypeId || "",
                status: deviceModel.status || EBaseStatus.Active,
            });
        } else {
            setFormData(initialFormData);
        }
    }, [deviceModel, open]);

    useEffect(() => {
        if (!open) {
            setFormData(initialFormData);
            setPage(1);
            setDeviceTypes([]);
            setHasMore(true);
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

        if (!formData.modelName.trim()) {
            toast({
                title: "Error",
                description: "Please enter the device model name.",
                variant: "destructive",
            });
            return;
        }

        if (!formData.deviceTypeId) {
            toast({
                title: "Error",
                description: "Please select a device type.",
                variant: "destructive",
            });
            return;
        }

        if (!formData.status) {
            toast({
                title: "Error",
                description: "Please select a status.",
                variant: "destructive",
            });
            return;
        }

        try {
            setIsSubmitting(true);
            const payload = { ...formData };
            if (deviceModel) {
                await updateDeviceModel(deviceModel.deviceModelId, payload);
                toast({
                    title: "Success",
                    description: "Device model updated successfully.",
                });
            } else {
                await createDeviceModel(payload);
                toast({
                    title: "Success",
                    description: "New device model added successfully.",
                });
            }
            onSuccess?.();
            onOpenChange(false);
        } catch (error) {
            console.error("Error processing device model:", error);
            toast({
                title: "Error",
                description: "An error occurred while processing the device model. Please try again later.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const loadMoreDeviceTypes = async () => {
        const nextPage = page + 1;
        await fetchDeviceTypes(nextPage);
        setPage(nextPage);
    };

    const isUpdate = !!deviceModel;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center">
                        {isUpdate ? (
                            <>
                                <Edit className="mr-2 h-5 w-5" />
                                Update Device Model
                            </>
                        ) : (
                            <>
                                <PlusCircle className="mr-2 h-5 w-5" />
                                Add New Device Model
                            </>
                        )}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="modelName" className="required">
                                Device Model Name
                            </Label>
                            <Input
                                id="modelName"
                                placeholder="Enter device model name"
                                value={formData.modelName}
                                onChange={(e) => handleChange("modelName", e.target.value)}
                                disabled={isSubmitting}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="manufacturer">Manufacturer</Label>
                            <Input
                                id="manufacturer"
                                placeholder="Enter manufacturer"
                                value={formData.manufacturer}
                                onChange={(e) => handleChange("manufacturer", e.target.value)}
                                disabled={isSubmitting}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="deviceTypeId" className="required">
                                Device Type
                            </Label>
                            <Select
                                value={formData.deviceTypeId}
                                onValueChange={(value) => handleChange("deviceTypeId", value)}
                                disabled={isSubmitting}
                            >
                                <SelectTrigger id="deviceTypeId">
                                    <SelectValue placeholder="Select device type" />
                                </SelectTrigger>
                                <SelectContent className="max-h-[300px] overflow-y-auto">
                                    <InfiniteScroll
                                        dataLength={deviceTypes.length}
                                        next={loadMoreDeviceTypes}
                                        hasMore={hasMore}
                                        loader={<div className="p-2 text-center text-sm">Loading more...</div>}
                                        scrollableTarget="select-content"
                                        style={{ overflow: "hidden" }}
                                    >
                                        {deviceTypes.map((deviceType) => (
                                            <SelectItem key={deviceType.deviceTypeId} value={deviceType.deviceTypeId}>
                                                {deviceType.name}
                                            </SelectItem>
                                        ))}
                                    </InfiniteScroll>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status" className="required">
                                Status
                            </Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value) => handleChange("status", value)}
                                disabled={isSubmitting}
                            >
                                <SelectTrigger id="status">
                                    <SelectValue placeholder="Select status" />
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
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Processing...
                                </>
                            ) : isUpdate ? (
                                <>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Update Device Model
                                </>
                            ) : (
                                <>
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Add Device Model
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default DeviceModelDialog;