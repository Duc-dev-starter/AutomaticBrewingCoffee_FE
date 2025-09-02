import { EBaseStatus } from "@/enum/base";
import { z } from "zod";

export const menuSchema = z.object({
    name: z.string().trim().min(1, "Tên thực đơn không được để trống.").max(100, "Tên thực đơn không được quá 100 ký tự.").transform((val) => val.replace(/\s+/g, " ")),
    organizationId: z.string().min(1, "Vui lòng chọn tổ chức."),
    status: z.enum([EBaseStatus.Active, EBaseStatus.Inactive], { message: "Vui lòng chọn trạng thái cho thực đơn." }),
    description: z.string().trim().max(450, "Mô tả không được quá 450 ký tự.").optional(),
});
