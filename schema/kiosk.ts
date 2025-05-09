import { z } from "zod";
import { EBaseStatus } from "@/enum/base";

export const kioskSchema = z.object({
    // franchiseId: z.string().min(1, "Vui lòng chọn franchise."),
    deviceIds: z.array(z.string()).optional(),
    location: z.string().min(1, "Địa chỉ kiosk không được để trống."),
    status: z.nativeEnum(EBaseStatus, { errorMap: () => ({ message: "Vui lòng chọn trạng thái." }) }),
    installedDate: z.string().min(1, "Vui lòng chọn ngày lắp đặt.").regex(/^\d{4}-\d{2}-\d{2}$/, "Ngày lắp đặt không hợp lệ."),
});