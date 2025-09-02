import { EBaseStatus } from "@/enum/base";
import { z } from "zod";

export const organizationSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, "Tên tổ chức không được để trống.")
        .max(100, "Tên tổ chức không được quá 100 ký tự.")
        .transform((val) => val.replace(/\s+/g, " ")),
    status: z.enum([EBaseStatus.Active, EBaseStatus.Inactive], { message: "Vui lòng chọn trạng thái cho loại thiết bị." }),
    description: z.string().trim().max(450, "Mô tả không được quá 450 ký tự.").optional().transform((val) => val?.replace(/\s+/g, " ")),
    contactPhone: z.string().trim().superRefine((val, ctx) => {
        if (!val) {
            ctx.addIssue({
                code: "custom",
                message: "Số điện thoại không được để trống."
            })
        } else if (!/^[0-9]+$/.test(val)) {
            ctx.addIssue({
                code: "custom",
                message: "Số điện thoại chỉ được chứa số."
            })
        }
    }),

    contactEmail: z.string().trim().superRefine((val, ctx) => {
        if (!val) {
            ctx.addIssue({
                code: "custom",
                message: "Email không được để trống."
            })
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
            ctx.addIssue({
                code: "custom",
                message: "Email không hợp lệ."
            })
        }
    }),
    logoBase64: z.string().optional(),
    taxId: z.string().min(1, "Mã số thuế không được để trống."),
});