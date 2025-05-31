import { EBaseStatus } from "@/enum/base";
import { EDeviceStatus, EFunctionParameterType } from "@/enum/device";
import { z } from "zod";

export const deviceTypeSchema = z.object({
    name: z.string().trim().min(1, "Tên không được để trống.").max(100, "Tên không được quá 100 ký tự."),
    description: z.string().trim().max(450, "Mô tả không được quá 450 ký tự.").optional(),
    status: z.enum([EBaseStatus.Active, EBaseStatus.Inactive], { message: "Vui lòng chọn trạng thái cho loại thiết bị." }),
});


export const deviceModelSchema = z.object({
    modelName: z.string().trim().min(1, "Tên mẫu thiết bị là bắt buộc"),
    manufacturer: z.string().trim().min(1, "Nhà sản xuất là bắt buộc"),
    deviceTypeId: z.string().trim().min(1, "Loại thiết bị là bắt buộc"),
    status: z.nativeEnum(EBaseStatus),
    deviceFunctions: z.array(
        z.object({
            name: z.string().trim().min(1, "Tên chức năng là bắt buộc"),
            status: z.nativeEnum(EBaseStatus),
            functionParameters: z.array(
                z.object({
                    name: z.string().trim().min(1, "Tên tham số là bắt buộc"),
                    min: z.string().nullable().optional(),
                    max: z.string().nullable().optional(),
                    options: z.array(z.string()).nullable().optional(),
                    description: z.string().trim().max(450, "Mô tả tham số của hàm không được quá 450 ký tự.").optional(),
                    type: z.nativeEnum(EFunctionParameterType),
                    default: z.string().trim().min(1, "Giá trị mặc định là bắt buộc"),
                })
            ).optional(),
        })
    ).optional(),
});

export const deviceSchema = z.object({
    name: z.string().trim().min(1, "Tên loại thiết bị không được để trống."),
    status: z.enum([EDeviceStatus.Maintain, EDeviceStatus.Stock, EDeviceStatus.Working], { message: "Vui lòng chọn trạng thái cho thiết bị." }),
    serialNumber: z.string().trim().min(1, "Số serial không được để trống."),
    deviceModelId: z.string().min(1, "Vui lòng chọn mẫu thiết bị."),
    description: z.string().trim().max(450, "Mô tả thiết bị không được quá 450 ký tự.").optional(),
});
