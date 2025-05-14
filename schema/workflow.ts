import { z } from "zod";
import { EWorkflowStepType, EWorkflowType } from "@/enum/workflow";

const stepSchema = z.object({
    name: z.string().min(1, "Tên bước không được để trống."),
    type: z.nativeEnum(EWorkflowStepType, { message: "Loại bước không hợp lệ." }),
    deviceId: z.string().min(1, "Thiết bị không được để trống."),
    maxRetries: z.number().nonnegative("Số lần thử lại phải lớn hơn hoặc bằng 0."),
    callbackWorkflowId: z.string().min(1, "Workflow callback không được để trống."),
    parameters: z.string().min(1, "Tham số không được để trống."),
});

export const workflowSchema = z.object({
    name: z.string().min(1, "Tên sản phẩm không được để trống."),
    productId: z.string().min(1, "Vui lòng chọn sản phẩm."),
    description: z.string().optional(),
    type: z.nativeEnum(EWorkflowType, { message: "Loại workflow không hợp lệ." }),
    steps: z.array(stepSchema).min(1, "Phải có ít nhất một bước."),
});
