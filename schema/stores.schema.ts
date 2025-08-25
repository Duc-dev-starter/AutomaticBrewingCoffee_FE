import { EBaseStatus } from "@/enum/base";
import { z } from "zod";

export const storeSchema = z.object({
    name: z.string().trim().min(1, "Tên sản phẩm không được để trống.").max(100, "Tên cửa hàng không được quá 100 ký tự."),
    organizationId: z.string().min(1, "Vui lòng chọn tổ chức."),
    status: z.enum([EBaseStatus.Active, EBaseStatus.Inactive], { message: "Vui lòng chọn trạng thái cho thực đơn." }),
    description: z.string().trim().max(450, "Mô tả không được quá 450 ký tự.").optional(),
    contactPhone: z.string().trim().min(1, "Số điện thoại không được để trống"),
    locationAddress: z.string().trim().min(1, "Địa chỉ không được để trống").max(100, "Địa chỉ địa điểm không được quá 100 ký tự."),
    locationTypeId: z.string().min(1, "Vui lòng chọn loại location.")
});
