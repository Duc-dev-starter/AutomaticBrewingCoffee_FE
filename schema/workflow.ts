import { z } from "zod";
import { EWorkflowType } from "@/enum/workflow";

const stepSchema = z.object({
    name: z.string().trim().min(1, "Tên bước không được để trống."),
    type: z.string().min(1, "Vui lòng chọn loại thiết bị."),
    deviceModelId: z.string().optional().nullable(),
    maxRetries: z.number().int().nonnegative("Số lần thử lại phải là số nguyên không âm."),
    callbackWorkflowId: z.string().optional().or(z.literal("")).nullable(),
    parameters: z.string().optional().or(z.literal("")).nullable(),
});

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