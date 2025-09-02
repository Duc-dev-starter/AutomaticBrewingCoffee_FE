import { EBaseStatus } from "@/enum/base";
import { EDeviceStatus, EFunctionParameterType } from "@/enum/device";
import { z } from "zod";

export const deviceTypeSchema = z.object({
    name: z.string().trim().min(1, "Tên không được để trống.").max(100, "Tên không được quá 100 ký tự.").transform((val) => val.replace(/\s+/g, " ")),
    description: z.string().trim().max(450, "Mô tả không được quá 450 ký tự.").optional(),
    isMobileDevice: z.boolean().refine((val) => val !== undefined, {
        message: "Vui lòng chọn loại thiết bị.",
    }),
    status: z.enum([EBaseStatus.Active, EBaseStatus.Inactive], { message: "Vui lòng chọn trạng thái cho loại thiết bị." }),
});

export const deviceModelSchema = z.object({
    modelName: z.string().trim().min(1, "Tên mẫu thiết bị là bắt buộc").max(100, "Tên không được quá 100 ký tự.").transform((val) => val.replace(/\s+/g, " ")),
    manufacturer: z.string().trim().min(1, "Tên nhà sản xuất là bắt buộc").max(100, "Têb nhà sản xuất không được quá 100 ký tự.").transform((val) => val.replace(/\s+/g, " ")),
    deviceTypeId: z.string().trim().min(1, "Loại thiết bị là bắt buộc"),
    status: z.nativeEnum(EBaseStatus),
    deviceFunctions: z.array(
        z.object({
            name: z.string().trim().min(1, "Tên chức năng là bắt buộc").max(100, "Tên không được quá 100 ký tự.").transform((val) => val.replace(/\s+/g, " ")),
            label: z.string().trim().min(1, "Nhãn là bắt buộc").max(100, "Nhãn không được quá 100 ký tự.").transform((val) => val.replace(/\s+/g, " ")),
            status: z.nativeEnum(EBaseStatus),
            functionParameters: z.array(
                z.object({
                    name: z.string().trim().min(1, "Tên tham số là bắt buộc").max(100, "Tên không được quá 100 ký tự.").transform((val) => val.replace(/\s+/g, " ")),
                    min: z.string().nullable().optional(),
                    max: z.string().nullable().optional(),
                    options: z.array(z.object({
                        name: z.string().trim().optional().transform((val) => val?.replace(/\s+/g, " ")),
                        description: z.string().trim().max(450, "Mô tả tùy chọn không được quá 450 ký tự.").optional(),
                    })).nullable().optional(),
                    description: z.string().trim().max(450, "Mô tả tham số của hàm không được quá 450 ký tự.").optional(),
                    type: z.nativeEnum(EFunctionParameterType),
                    default: z.string().trim().min(1, "Giá trị mặc định là bắt buộc"),
                })
            ).default([]),
        }),
    ).default([]),
    deviceIngredients: z.array(
        z.object({
            label: z.string().trim().min(1, "Label là bắt buộc").max(100, "Nhãn không được quá 100 ký tự.").transform((val) => val.replace(/\s+/g, " ")),
            ingredientType: z.string().trim().min(1, "Loại nguyên liệu là bắt buộc"),
            description: z.string().trim().optional(),
            maxCapacity: z.number().min(0, "Dung lượng tối đa phải lớn hơn hoặc bằng 0"),
            minCapacity: z.number().min(0, "Dung lượng tối thiểu phải lớn hơn hoặc bằng 0"),
            warningPercent: z.number().min(0).max(100, "Phần trăm cảnh báo phải từ 0 đến 100"),
            unit: z.string().trim().min(1, "Đơn vị là bắt buộc"),
            isRenewable: z.boolean(),
            status: z.nativeEnum(EBaseStatus),
            deviceFunctionName: z.string().trim().min(1, "Tên chức năng thiết bị là bắt buộc").max(100, "Tên chức năng thiết bị không được quá 100 ký tự."),
            ingredientSelectorParameter: z.string().trim().optional(),
            ingredientSelectorValue: z.string().trim().optional(),
            targetOverrideParameter: z.string().trim().optional(),
        })
    ).default([]),
});

export const deviceSchema = z.object({
    name: z.string().trim().min(1, "Tên thiết bị không được để trống.").max(100, "Tên thiết bị không được quá 100 ký tự.").transform((val) => val.replace(/\s+/g, " ")),
    status: z.enum([EDeviceStatus.Maintain, EDeviceStatus.Stock, EDeviceStatus.Working], { message: "Vui lòng chọn trạng thái cho thiết bị." }),
    serialNumber: z.string().trim().min(1, "Số serial không được để trống.").transform((val) => val.replace(/\s+/g, " ")),
    deviceModelId: z.string().min(1, "Vui lòng chọn mẫu thiết bị."),
    description: z.string().trim().max(450, "Mô tả thiết bị không được quá 450 ký tự.").min(1, "Mô tả không được để trống"),
});
