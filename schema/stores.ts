import { EBaseStatus } from "@/enum/base";
import { z } from "zod";

export const storeSchema = z.object({
    name: z.string().min(1, "Tên sản phẩm không được để trống."),
    organizationId: z.string().min(1, "Vui lòng chọn tổ chức."),
    status: z.enum([EBaseStatus.Active, EBaseStatus.Inactive], { message: "Vui lòng chọn trạng thái cho menu." }),
    description: z.string().optional(),
    contactPhone: z.string().min(1, "Số điện thoại không được để trống"),
    locationAddress: z.string().min(1, "Địa chỉ không được để trống"),
    locationTypeId: z.string().min(1, "Vui lòng chọn loại location.")
});
