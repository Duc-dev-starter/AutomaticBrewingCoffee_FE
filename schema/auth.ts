import { z } from "zod";

export const createAccountSchema = z.object({
    fullName: z.string().min(2, { message: "Tên phải có ít nhất 2 ký tự" }),
    email: z.string().email({ message: "Email không hợp lệ" }),
    password: z
        .string()
        .min(8, { message: "Mật khẩu phải có ít nhất 8 ký tự" })
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])/,
            {
                message:
                    "Mật khẩu phải chứa ít nhất một chữ hoa, một chữ thường, một số và một ký tự đặc biệt",
            }
        ),
    roleName: z.string().refine((val) => val === "Organization", {
        message: "Vai trò không hợp lệ",
    }),
    referenceId: z.string(),
})
