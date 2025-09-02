import { EBaseStatus } from "@/enum/base";
import { z } from "zod";

export const ingredientTypeSchema = z.object({
    name: z.string().trim().min(1, "Tên loại nguyên liệu không được để trống.").max(100, "Tên loại nguyên liệu không được quá 100 ký tự.").transform((val) => val.replace(/\s+/g, " ")),
    description: z.string().trim().max(450, "Mô tả nguyên liệu không được quá 450 ký tự.").optional(),
    status: z.nativeEnum(EBaseStatus),
});