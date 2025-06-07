import { useState, useEffect, useCallback, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EBaseStatus } from "@/enum/base";
import { useToast } from "@/hooks/use-toast";
import { createStore, updateStore } from "@/services/store";
import { getOrganizations } from "@/services/organization";
import { StoreDialogProps } from "@/types/dialog";
import { Organization } from "@/interfaces/organization";
import { LocationType } from "@/interfaces/location";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { getLocationTypes } from "@/services/locationType";
import { ErrorResponse } from "@/types/error";
import { storeSchema } from "@/schema/stores";

const StoreDialog = ({ open, onOpenChange, onSuccess, store }: StoreDialogProps) => {
    const { toast } = useToast();
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        contactPhone: "",
        locationAddress: "",
        status: EBaseStatus.Active,
        locationTypeId: "",
        organizationId: "",
    });
    const [errors, setErrors] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(false);
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [locationTypes, setLocationTypes] = useState<LocationType[]>([]);
    const [orgPage, setOrgPage] = useState(1);
    const [locPage, setLocPage] = useState(1);
    const [hasMoreOrgs, setHasMoreOrgs] = useState(true);
    const [hasMoreLocs, setHasMoreLocs] = useState(true);
    const [isLoadingOrgs, setIsLoadingOrgs] = useState(false);
    const [isLoadingLocs, setIsLoadingLocs] = useState(false);

    const orgObserver = useRef<IntersectionObserver>();
    const locObserver = useRef<IntersectionObserver>();

    const lastOrgElementRef = useCallback(
        (node: HTMLDivElement) => {
            if (isLoadingOrgs) return;
            if (orgObserver.current) orgObserver.current.disconnect();
            orgObserver.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && hasMoreOrgs) {
                    setOrgPage((prev) => prev + 1);
                }
            });
            if (node) orgObserver.current.observe(node);
        },
        [isLoadingOrgs, hasMoreOrgs]
    );

    const lastLocElementRef = useCallback(
        (node: HTMLDivElement) => {
            if (isLoadingLocs) return;
            if (locObserver.current) locObserver.current.disconnect();
            locObserver.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && hasMoreLocs) {
                    setLocPage((prev) => prev + 1);
                }
            });
            if (node) locObserver.current.observe(node);
        },
        [isLoadingLocs, hasMoreLocs]
    );

    const fetchOrganizations = useCallback(async () => {
        try {
            setIsLoadingOrgs(true);
            const response = await getOrganizations({ page: orgPage, size: 20 });
            setOrganizations((prev) => [...prev, ...response.items]);
            setHasMoreOrgs(response.items.length === 20);
        } catch (error) {
            console.error("Error fetching organizations:", error);
            toast({
                title: "Lỗi",
                description: "Không thể tải danh sách tổ chức.",
                variant: "destructive",
            });
        } finally {
            setIsLoadingOrgs(false);
        }
    }, [orgPage, toast]);

    const fetchLocationTypes = useCallback(async () => {
        try {
            setIsLoadingLocs(true);
            const response = await getLocationTypes({ page: locPage, size: 20 });
            setLocationTypes((prev) => [...prev, ...response.items]);
            setHasMoreLocs(response.items.length === 20);
        } catch (error) {
            console.error("Error fetching location types:", error);
            toast({
                title: "Lỗi",
                description: "Không thể tải danh sách loại địa điểm.",
                variant: "destructive",
            });
        } finally {
            setIsLoadingLocs(false);
        }
    }, [locPage, toast]);

    useEffect(() => {
        if (open) {
            fetchOrganizations();
            fetchLocationTypes();
        }
    }, [orgPage, locPage, open, fetchOrganizations, fetchLocationTypes]);

    useEffect(() => {
        if (store) {
            setFormData({
                name: store.name,
                description: store.description,
                contactPhone: store.contactPhone,
                locationAddress: store.locationAddress,
                status: store.status,
                locationTypeId: store.locationTypeId,
                organizationId: store.organization?.organizationId || "",
            });
        } else {
            setFormData({
                name: "",
                description: "",
                contactPhone: "",
                locationAddress: "",
                status: EBaseStatus.Active,
                locationTypeId: "",
                organizationId: "",
            });
            setOrganizations([]);
            setLocationTypes([]);
            setOrgPage(1);
            setLocPage(1);
            setHasMoreOrgs(true);
            setHasMoreLocs(true);
        }
    }, [store]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const validationResult = storeSchema.safeParse(formData);
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
                status: formData.status,
                contactPhone: formData.contactPhone,
                organizationId: formData.organizationId,
                locationTypeId: formData.locationTypeId,
                locationAddress: formData.locationAddress
            };
            if (store) {
                await updateStore(store.storeId, data);
                toast({
                    title: "Thành công",
                    description: "Cửa hàng đã được cập nhật.",
                });
            } else {
                await createStore(data);
                toast({
                    title: "Thành công",
                    description: "Cửa hàng đã được tạo mới.",
                });
            }
            onSuccess?.();
        } catch (error) {
            const err = error as ErrorResponse;
            console.error("Lỗi khi xử lý cửa hàng:", error);
            toast({
                title: "Lỗi khi xử lý cửa hàng",
                description: err.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{store ? "Chỉnh sửa cửa hàng" : "Thêm cửa hàng mới"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="asterisk">
                                Tên cửa hàng
                            </Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                            {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="contactPhone">Số điện thoại</Label>
                            <Input
                                id="contactPhone"
                                value={formData.contactPhone}
                                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                            />
                            {errors.contactPhone && <p className="text-red-500 text-sm">{errors.contactPhone}</p>}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="locationAddress" className="asterisk">
                                Địa chỉ
                            </Label>
                            <Input
                                id="locationAddress"
                                value={formData.locationAddress}
                                onChange={(e) => setFormData({ ...formData, locationAddress: e.target.value })}
                            />
                            {errors.locationAddress && <p className="text-red-500 text-sm">{errors.locationAddress}</p>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="status" className="asterisk">
                                Trạng thái
                            </Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value) => setFormData({ ...formData, status: value as EBaseStatus })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn trạng thái" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={EBaseStatus.Active}>Hoạt động</SelectItem>
                                    <SelectItem value={EBaseStatus.Inactive}>Không hoạt động</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.status && <p className="text-red-500 text-sm">{errors.status}</p>}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="organizationId" className="asterisk">
                                Tổ chức
                            </Label>
                            <Select
                                value={formData.organizationId}
                                onValueChange={(value) => setFormData({ ...formData, organizationId: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn tổ chức" />
                                </SelectTrigger>
                                <SelectContent>
                                    <ScrollArea className="h-[200px]">
                                        {organizations.map((org, index) => (
                                            <SelectItem
                                                key={org.organizationId}
                                                value={org.organizationId}
                                                ref={index === organizations.length - 1 ? lastOrgElementRef : null}
                                            >
                                                {org.name}
                                            </SelectItem>
                                        ))}
                                        {isLoadingOrgs && (
                                            <div className="flex justify-center p-2">
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            </div>
                                        )}
                                    </ScrollArea>
                                </SelectContent>
                            </Select>
                            {errors.organizationId && <p className="text-red-500 text-sm">{errors.organizationId}</p>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="locationTypeId" className="asterisk">
                                Loại địa điểm
                            </Label>
                            <Select
                                value={formData.locationTypeId}
                                onValueChange={(value) => setFormData({ ...formData, locationTypeId: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn loại địa điểm" />
                                </SelectTrigger>
                                <SelectContent>
                                    <ScrollArea className="h-[200px]">
                                        {locationTypes.map((loc, index) => (
                                            <SelectItem
                                                key={loc.locationTypeId}
                                                value={loc.locationTypeId}
                                                ref={index === locationTypes.length - 1 ? lastLocElementRef : null}
                                            >
                                                {loc.name}
                                            </SelectItem>
                                        ))}
                                        {isLoadingLocs && (
                                            <div className="flex justify-center p-2">
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            </div>
                                        )}
                                    </ScrollArea>
                                </SelectContent>
                            </Select>
                            {errors.locationTypeId && <p className="text-red-500 text-sm">{errors.locationTypeId}</p>}
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="description">Mô tả</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                </form>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Hủy
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading ? "Đang xử lý..." : "Lưu"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default StoreDialog;