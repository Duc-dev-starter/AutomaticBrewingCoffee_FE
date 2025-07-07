import { EBaseStatus } from "@/enum/base";
import { z } from "zod";

export const categorySchema = z.object({
    name: z.string().trim().min(1, "Tên không được để trống.").max(100, "Tên không được quá 100 ký tự."),
    description: z.string().trim().max(450, "Mô tả không được quá 450 ký tự.").optional(),
    imageBase64: z.string().optional(),
    status: z.enum([EBaseStatus.Active, EBaseStatus.Inactive], { message: "Vui lòng chọn trạng thái cho loại thiết bị." }),
});
