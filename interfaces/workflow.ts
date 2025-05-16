import { EWorkflowStepType, EWorkflowType } from "@/enum/workflow";
import { Product } from "./product";

export interface WorkflowStep {
    name: string;
    type: EWorkflowStepType;
    deviceTypeId: string;
    maxRetries: number;
    callbackWorkflowId: string;
    parameters: string;
}

export interface Workflow {
    workflowId: string;
    productId: string;
    product: Product;
    name: string;
    description: string;
    type: EWorkflowType;
    steps: WorkflowStep[];
}