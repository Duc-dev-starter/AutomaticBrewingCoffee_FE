import { EBaseStatus } from "@/enum/base";
import { EDeviceStatus } from "@/enum/device";
import { z } from "zod";

export const deviceTypeSchema = z.object({
    name: z.string().min(1, "Tên loại thiết bị không được để trống."),
    status: z.enum([EBaseStatus.Active, EBaseStatus.Inactive], { message: "Vui lòng chọn trạng thái cho loại thiết bị." }),
    description: z.string().optional(),
});

export const deviceModelSchema = z.object({
    modelName: z.string().min(1, "Tên mẫu thiết bị không được để trống."),
    status: z.enum([EBaseStatus.Active, EBaseStatus.Inactive], { message: "Vui lòng chọn trạng thái cho mẫu thiết bị." }),
    deviceTypeId: z.string().min(1, "Vui lòng chọn loại thiết bị."),
    manufacturer: z.string().min(1, "Tên nhà sản xuất không được để trống ."),
});

export const deviceSchema = z.object({
    name: z.string().min(1, "Tên loại thiết bị không được để trống."),
    status: z.enum([EDeviceStatus.Maintain, EDeviceStatus.Stock, EDeviceStatus.Working], { message: "Vui lòng chọn trạng thái cho thiết bị." }),
    serialNumber: z.string().min(1, "Số serial không được để trống."),
    deviceModelId: z.string().min(1, "Vui lòng chọn mẫu thiết bị."),
    description: z.string().optional(),
});
