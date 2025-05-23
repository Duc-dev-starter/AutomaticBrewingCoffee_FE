import { z } from "zod";

export const locationSchema = z.object({
    name: z.string().min(1, "Tên loại location không được để trống."),
    description: z.string().min(1, "Mô tả location không được để trống."),
});