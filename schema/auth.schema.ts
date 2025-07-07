import { z } from "zod";

export const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, "Mật khẩu hiện tại không được để trống."),
    newPassword: z.string()
        .min(4, "Mật khẩu mới phải có ít nhất 4 ký tự."),
    confirmPassword: z.string()
}).refine(
    (data) => data.newPassword === data.confirmPassword,
    {
        message: "Xác nhận mật khẩu không khớp.",
        path: ["confirmPassword"]
    }
);

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;