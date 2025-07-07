import { z } from "zod";
import { EBaseStatus } from "@/enum/base";

export const kioskSchema = z.object({
    deviceIds: z.array(z.string()).optional(),
    location: z.string().trim().min(1, "Địa chỉ kiosk không được để trống."),
    status: z.nativeEnum(EBaseStatus, { errorMap: () => ({ message: "Vui lòng chọn trạng thái." }) }),
    installedDate: z.string().min(1, "Vui lòng chọn ngày lắp đặt.").regex(/^\d{4}-\d{2}-\d{2}$/, "Ngày lắp đặt không hợp lệ."),
});

export const kioskVersionSchema = z.object({
    kioskTypeId: z.string().min(1, "Vui lòng chọn loại kiosk."),
    versionTitle: z.string().trim().min(1, "Tên loại kiosk không được để trống."),
    description: z.string().trim().optional(),
    versionNumber: z.string().trim().min(1, "Tên loại kiosk không được để trống."),
    status: z.enum([EBaseStatus.Active, EBaseStatus.Inactive], { message: "Vui lòng chọn trạng thái cho menu." }),
});

export const kioskTypeSchema = z.object({
    name: z.string().trim().min(1, "Tên loại kiosk không được để trống."),
    status: z.enum([EBaseStatus.Active, EBaseStatus.Inactive], { message: "Vui lòng chọn trạng thái cho menu." }),
    description: z.string().trim().max(450, "Mô tả không được quá 450 ký tự.").optional(),
});