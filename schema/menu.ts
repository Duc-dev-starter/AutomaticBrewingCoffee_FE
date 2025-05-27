import { EBaseStatus } from "@/enum/base";
import { z } from "zod";

export const menuSchema = z.object({
    name: z.string().trim().min(1, "Tên menu không được để trống."),
    kioskId: z.string().min(1, "Vui lòng chọn kiosk."),
    status: z.enum([EBaseStatus.Active, EBaseStatus.Inactive], { message: "Vui lòng chọn trạng thái cho menu." }),
    description: z.string().trim().optional(),
});
