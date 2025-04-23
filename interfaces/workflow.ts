import { EWorkflowStepType, EWorkflowType } from "@/enum/workflow";

export interface WorkflowStep {
    name: string;
    type: EWorkflowStepType;
    deviceId: string;
    maxRetries: number;
    callbackWorkflowId: string;
    parameters: string;
}

export interface Workflow {
    workflowId: string;
    productId: string;
    name: string;
    description: string;
    type: EWorkflowType;
    steps: WorkflowStep[];
}