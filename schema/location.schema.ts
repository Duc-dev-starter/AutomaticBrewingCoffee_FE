import { z } from "zod";

export const locationSchema = z.object({
    name: z.string().trim().min(1, "Tên loại địa điểm không được để trống.").max(100, "Tên loại địa điểm không được quá 100 ký tự."),
    description: z.string().trim().max(450, "Mô tả loại địa điểm không được quá 450 ký tự.").optional(),
});