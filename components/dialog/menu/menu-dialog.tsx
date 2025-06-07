"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Loader2, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { EBaseStatus, EBaseStatusViMap } from "@/enum/base";
import { createMenu, updateMenu } from "@/services/menu";
import { Kiosk } from "@/interfaces/kiosk";
import { getKiosks } from "@/services/kiosk";
import { getOrganizations } from "@/services/organization";
import { getStores } from "@/services/store";
import InfiniteScroll from "react-infinite-scroll-component";
import { MenuDialogProps } from "@/types/dialog";
import { ErrorResponse } from "@/types/error";
import { menuSchema } from "@/schema/menu";
import { Organization } from "@/interfaces/organization";
import { Store } from "@/interfaces/store";

const initialFormData = {
    organizationId: "",
    storeId: "",
    kioskId: "",
    name: "",
    description: "",
    status: EBaseStatus.Active,
};

const MenuDialog = ({ open, onOpenChange, onSuccess, menu }: MenuDialogProps) => {
    const { toast } = useToast();
    const [formData, setFormData] = useState(initialFormData);
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [stores, setStores] = useState<Store[]>([]);
    const [kiosks, setKiosks] = useState<Kiosk[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [noKiosks, setNoKiosks] = useState(false);
    const [errors, setErrors] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(false);

    const fetchOrganizations = async () => {
        try {
            const response = await getOrganizations();
            setOrganizations(response.items);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách tổ chức:", error);
        }
    };

    const fetchStores = async (organizationId: string) => {
        try {
            const response = await getStores({ organizationId });
            setStores(response.items);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách cửa hàng:", error);
        }
    };

    const fetchKiosks = async (storeId: string, pageNumber: number) => {
        try {
            const response = await getKiosks({ storeId, page: pageNumber, size: 10, hasMenu: false });
            if (response.items.length === 0 && pageNumber === 1) {
                setNoKiosks(true);
                setHasMore(false);
            } else {
                setNoKiosks(false);
                if (pageNumber === 1) {
                    setKiosks(response.items);
                } else {
                    setKiosks((prev) => [...prev, ...response.items]);
                }
                if (response.items.length < 10) {
                    setHasMore(false);
                }
            }
        } catch (error) {
            console.error("Lỗi khi lấy danh sách kiosk:", error);
            setNoKiosks(true);
            setHasMore(false);
        }
    };

    useEffect(() => {
        if (open) {
            fetchOrganizations();
        }
    }, [open]);

    useEffect(() => {
        if (formData.organizationId) {
            fetchStores(formData.organizationId);
            setFormData((prev) => ({ ...prev, storeId: "", kioskId: "" }));
        } else {
            setStores([]);
            setKiosks([]);
            setHasMore(true);
            setNoKiosks(false);
        }
    }, [formData.organizationId]);

    useEffect(() => {
        if (formData.storeId) {
            fetchKiosks(formData.storeId, 1);
            setFormData((prev) => ({ ...prev, kioskId: "" }));
        } else {
            setKiosks([]);
            setHasMore(true);
            setNoKiosks(false);
        }
    }, [formData.storeId]);

    useEffect(() => {
        if (menu) {
            setFormData({
                organizationId: menu.kiosk?.store?.organization.organizationId || "",
                storeId: menu.kiosk?.storeId || "",
                kioskId: menu.kioskId,
                name: menu.name,
                description: menu.description ?? "",
                status: menu.status,
            });
        }
    }, [menu]);

    useEffect(() => {
        if (!open) {
            setFormData(initialFormData);
            setPage(1);
            setKiosks([]);
            setStores([]);
            setOrganizations([]);
            setHasMore(true);
            setNoKiosks(false);
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
        e.stopPropagation();

        const validationResult = menuSchema.safeParse(formData);
        if (!validationResult.success) {
            const { fieldErrors } = validationResult.error.flatten();
            setErrors(fieldErrors);
            return;
        }

        setErrors({});
        setLoading(true);

        try {
            const data = {
                name: formData.name,
                description: formData.description || undefined,
                kioskId: formData.kioskId || undefined,
                status: formData.status,
            };
            if (menu) {
                await updateMenu(menu.menuId, data);
                toast({
                    title: "Thành công",
                    description: "Cập nhật menu thành công",
                });
            } else {
                await createMenu(data);
                toast({
                    title: "Thành công",
                    description: "Thêm menu mới thành công",
                });
            }
            onSuccess?.();
            onOpenChange(false);
        } catch (error) {
            const err = error as ErrorResponse;
            console.error("Lỗi khi xử lý menu:", error);
            toast({
                title: "Lỗi khi xử lý menu",
                description: err.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const loadMoreKiosks = async () => {
        const nextPage = page + 1;
        await fetchKiosks(formData.storeId, nextPage);
        setPage(nextPage);
    };

    const isUpdate = !!menu;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center">
                        {isUpdate ? (
                            <>
                                <Edit className="mr-2 h-5 w-5" />
                                Cập nhật menu
                            </>
                        ) : (
                            <>
                                <PlusCircle className="mr-2 h-5 w-5" />
                                Thêm menu mới
                            </>
                        )}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    <div className="space-y-4">
                        {/* Chọn Organization */}
                        <div className="space-y-2">
                            <Label htmlFor="organizationId" className="asterisk">
                                Tổ chức
                            </Label>
                            <Select
                                value={formData.organizationId}
                                onValueChange={(value) => handleChange("organizationId", value)}
                                disabled={loading || organizations.length === 0}
                            >
                                <SelectTrigger id="organizationId">
                                    <SelectValue placeholder={organizations.length === 0 ? "Không có tổ chức" : "Chọn tổ chức"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {organizations.map((org) => (
                                        <SelectItem key={org.organizationId} value={org.organizationId}>
                                            {org.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.organizationId && <p className="text-red-500 text-sm">{errors.organizationId}</p>}
                        </div>

                        {/* Chọn Store */}
                        <div className="space-y-2">
                            <Label htmlFor="storeId" className="asterisk">
                                Cửa hàng
                            </Label>
                            <Select
                                value={formData.storeId}
                                onValueChange={(value) => handleChange("storeId", value)}
                                disabled={loading || stores.length === 0 || !formData.organizationId}
                            >
                                <SelectTrigger id="storeId">
                                    <SelectValue placeholder={stores.length === 0 ? "Không có cửa hàng" : "Chọn cửa hàng"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {stores.map((store) => (
                                        <SelectItem key={store.storeId} value={store.storeId}>
                                            {store.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.storeId && <p className="text-red-500 text-sm">{errors.storeId}</p>}
                        </div>

                        {/* Chọn Kiosk */}
                        <div className="space-y-2">
                            <Label htmlFor="kioskId" className="asterisk">
                                Kiosk
                            </Label>
                            <Select
                                value={formData.kioskId}
                                onValueChange={(value) => handleChange("kioskId", value)}
                                disabled={loading || noKiosks || !formData.storeId}
                            >
                                <SelectTrigger id="kioskId">
                                    <SelectValue placeholder={noKiosks ? "Không có kiosk" : "Chọn kiosk"} />
                                </SelectTrigger>
                                <SelectContent className="max-h-[300px] overflow-y-auto">
                                    {noKiosks ? (
                                        <div className="p-2 text-center text-sm text-gray-500">Không có kiosk</div>
                                    ) : (
                                        <InfiniteScroll
                                            dataLength={kiosks.length}
                                            next={loadMoreKiosks}
                                            hasMore={hasMore}
                                            loader={<div className="p-2 text-center text-sm">Đang tải thêm...</div>}
                                            scrollableTarget="select-content"
                                            style={{ overflow: "hidden" }}
                                        >
                                            {kiosks.map((kiosk) => (
                                                <SelectItem key={kiosk.kioskId} value={kiosk.kioskId}>
                                                    {kiosk.location}
                                                </SelectItem>
                                            ))}
                                        </InfiniteScroll>
                                    )}
                                </SelectContent>
                            </Select>
                            {errors.kioskId && <p className="text-red-500 text-sm">{errors.kioskId}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="name" className="asterisk">
                                Tên menu
                            </Label>
                            <Input
                                id="name"
                                placeholder="Nhập tên menu"
                                value={formData.name}
                                onChange={(e) => handleChange("name", e.target.value)}
                                disabled={loading}
                            />
                            {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status" className="asterisk">
                                Trạng thái
                            </Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value) => handleChange("status", value)}
                                disabled={loading}
                            >
                                <SelectTrigger id="status">
                                    <SelectValue placeholder="Chọn trạng thái" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.values(EBaseStatus).map((status) => (
                                        <SelectItem key={status} value={status}>
                                            {EBaseStatusViMap[status]}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.status && <p className="text-red-500 text-sm">{errors.status}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Mô tả</Label>
                            <Textarea
                                id="description"
                                placeholder="Nhập mô tả menu"
                                value={formData.description}
                                onChange={(e) => handleChange("description", e.target.value)}
                                disabled={loading}
                                className="min-h-[100px]"
                            />
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
                                    Cập nhật menu
                                </>
                            ) : (
                                <>
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Thêm menu
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default MenuDialog;