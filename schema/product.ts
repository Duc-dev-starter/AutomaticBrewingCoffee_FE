import { EProductSize, EProductStatus, EProductType } from "@/enum/product";
import { z } from "zod";

export const productSchema = z.object({
    name: z.string().min(1, "Tên sản phẩm không được để trống."),
    price: z.string()
        .min(1, "Giá không được để trống.")
        .regex(/^\d+$/, "Giá phải là số dương hợp lệ."),
    parentId: z.string().optional(),
    size: z.nativeEnum(EProductSize),
    type: z.nativeEnum(EProductType),
    status: z.nativeEnum(EProductStatus),
    imageUrl: z.string().optional(),
    isActive: z.boolean(),
    description: z.string().optional(),
});
