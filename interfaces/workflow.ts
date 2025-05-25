import { EWorkflowStepType, EWorkflowType } from "@/enum/workflow";
import { Product } from "./product";

export interface WorkflowStep {
    name: string;
    type: string;
    deviceModelId: string;
    maxRetries: number;
    callbackWorkflowId: string;
    parameters: string;
    sequence: number;
}

export interface Workflow {
    workflowId: string;
    productId: string | null;
    product: Product;
    name: string;
    description: string;
    type: EWorkflowType;
    steps: WorkflowStep[];
}