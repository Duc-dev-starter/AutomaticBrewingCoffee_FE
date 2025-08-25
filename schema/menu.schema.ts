import { EBaseStatus } from "@/enum/base";
import { z } from "zod";

export const menuSchema = z.object({
    name: z.string().trim().min(1, "Tên menu không được để trống.").max(100, "Tên không được quá 100 ký tự."),
    organizationId: z.string().min(1, "Vui lòng chọn tổ chức."),
    status: z.enum([EBaseStatus.Active, EBaseStatus.Inactive], { message: "Vui lòng chọn trạng thái cho menu." }),
    description: z.string().trim().max(450, "Mô tả không được quá 450 ký tự.").optional(),
});
