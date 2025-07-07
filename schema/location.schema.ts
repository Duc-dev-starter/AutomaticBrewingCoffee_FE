import { z } from "zod";

export const locationSchema = z.object({
    name: z.string().trim().min(1, "Tên loại location không được để trống."),
    description: z.string().trim().max(450, "Mô tả location không được quá 450 ký tự.").optional(),
});