import { EProductSize, EProductStatus, EProductType } from "@/enum/product";
import { z } from "zod";

export const productSchema = z.object({
    name: z.string().trim().min(1, "Tên sản phẩm không được để trống.").max(100, "Tên sản phẩm không được quá 100 ký tự."),
    price: z.string()
        .min(1, "Giá không được để trống.")
        .regex(/^\d+$/, "Giá phải là số dương hợp lệ."),
    parentId: z.string().optional(),
    size: z.nativeEnum(EProductSize),
    type: z.nativeEnum(EProductType),
    status: z.nativeEnum(EProductStatus),
    imageUrl: z.string().optional(),
    productCategoryId: z.string().trim().min(1, "Danh mục là bắt buộc"),
    description: z.string().trim().max(450, "Mô tả không được quá 450 ký tự.").optional(),
}).superRefine((data, ctx) => {
    if (data.type === EProductType.Child && !data.parentId) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Sản phẩm con phải có sản phẩm cha.",
            path: ["parentId"],
        });
    }
});
