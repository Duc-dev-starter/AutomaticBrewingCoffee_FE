import { z } from "zod";
import { EExpressionType, EOperation, EWorkflowType } from "@/enum/workflow";

const conditionSchema = z.object({
    name: z.string().min(1, "Tên điều kiện là bắt buộc"),
    description: z.string().optional(),
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
    name: z.string().min(1, "Tên bước là bắt buộc"),
    type: z.string().min(1, "Loại bước là bắt buộc"),
    deviceModelId: z.string().optional(),
    deviceFunctionId: z.string().optional(),
    maxRetries: z.number().min(0),
    sequence: z.number().min(1),
    callbackWorkflowId: z.string().nullable().optional(),
    parameters: z.string().optional(),
    conditions: z.array(conditionSchema).optional(),
})

export const workflowSchema = z.object({
    name: z.string().trim().min(1, "Tên quy trình không được để trống."),
    productId: z.string().trim().optional().nullable(),
    description: z.string().trim().optional().nullable(),
    type: z.nativeEnum(EWorkflowType, {
        errorMap: () => ({ message: "Loại quy trình không hợp lệ." }),
    }),
    steps: z.array(stepSchema).min(1, "Quy trình phải có ít nhất một bước."),
    kioskVersionId: z.string().optional()
});

export type WorkflowFormData = z.infer<typeof workflowSchema>;