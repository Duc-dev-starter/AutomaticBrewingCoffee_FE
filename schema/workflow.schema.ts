import { z } from "zod";
import { EExpressionType, EOperation, EWorkflowType } from "@/enum/workflow";

const conditionSchema = z.object({
    name: z.string().min(1, "Tên điều kiện là bắt buộc").max(100, "Tên điều kiện không được quá 100 ký tự.").transform((val) => val.replace(/\s+/g, " ")),
    description: z.string().max(450, "Mô tả không được quá 450 ký tự.").optional(),
    expression: z.object({
        left: z.object({
            type: z.nativeEnum(EExpressionType),
            value: z.any(),
        }),
        operator: z.nativeEnum(EOperation),
        right: z.object({
            type: z.nativeEnum(EExpressionType),
            value: z.any(),
        }),
    }),
})

const stepSchema = z.object({
    name: z.string().min(1, "Tên bước là bắt buộc").max(100, "Tên bước không được quá 100 ký tự.").transform((val) => val.replace(/\s+/g, " ")),
    type: z.string().min(1, "Loại bước là bắt buộc"),
    deviceModelId: z.string().optional(),
    deviceFunctionId: z.string().optional(),
    maxRetries: z.coerce
        .number({ invalid_type_error: "Số lần thử lại phải là một số." })
        .min(0, "Số lần thử lại phải lớn hơn hoặc bằng 0."),

    sequence: z.coerce
        .number({ invalid_type_error: "Thứ tự phải là một số." })
        .min(1, "Thứ tự phải là số nguyên lớn hơn 0."),
    callbackWorkflowId: z.string().nullable().optional(),
    callbackStepCode: z.string().optional().nullable(),
    stepCode: z.string().min(1, "Step code là bắt buộc"),
    parameters: z.string().optional(),
    conditions: z.array(conditionSchema).optional(),
})

export const workflowSchema = z.object({
    name: z.string().trim().min(1, "Tên quy trình không được để trống.").max(100, "Tên quy trình không được quá 100 ký tự.").transform((val) => val.replace(/\s+/g, " ")),
    productId: z.string().trim().optional().nullable(),
    description: z.string().trim().max(450, "Mô tả không được quá 450 ký tự.").optional().nullable(),
    type: z.nativeEnum(EWorkflowType, {
        errorMap: () => ({ message: "Loại quy trình không hợp lệ." }),
    }),
    steps: z.array(stepSchema).min(1, "Quy trình phải có ít nhất một bước."),
    kioskVersionId: z.string().optional()
});

export type WorkflowFormData = z.infer<typeof workflowSchema>;