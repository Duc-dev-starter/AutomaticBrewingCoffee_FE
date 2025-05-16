import { EBaseStatus } from "@/enum/base";
import { z } from "zod";

export const organizationSchema = z.object({
    name: z.string().min(1, "Tên loại thiết bị không được để trống."),
    status: z.enum([EBaseStatus.Active, EBaseStatus.Inactive], { message: "Vui lòng chọn trạng thái cho loại thiết bị." }),
    description: z.string().optional(),
    contactPhone: z.string().min(1, "Số điện thoại không được để trống."),
    contactEmail: z.string().min(1, "Email không được để trống."),
    logoBase64: z.string().optional(),
    taxId: z.string().min(1, "Mã số thuế không được để trống."),
});