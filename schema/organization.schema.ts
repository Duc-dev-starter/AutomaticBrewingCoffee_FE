import { EBaseStatus } from "@/enum/base";
import { z } from "zod";

export const organizationSchema = z.object({
    name: z.string().trim().min(1, "Tên tổ chức không được để trống.").max(100, "Tên tổ chức không được quá 100 ký tự."),
    status: z.enum([EBaseStatus.Active, EBaseStatus.Inactive], { message: "Vui lòng chọn trạng thái cho loại thiết bị." }),
    description: z.string().trim().max(450, "Mô tả không được quá 450 ký tự.").optional(),
    contactPhone: z.string().trim().min(1, "Số điện thoại không được để trống."),
    contactEmail: z.string().trim().min(1, "Email không được để trống."),
    logoBase64: z.string().optional(),
    taxId: z.string().min(1, "Mã số thuế không được để trống."),
});