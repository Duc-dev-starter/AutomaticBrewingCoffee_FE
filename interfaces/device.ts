import { EBaseStatus } from "@/enum/base";
import { EDeviceStatus, EFunctionParameterType } from "@/enum/device";
import { EIngredientAction } from "@/enum/ingredient.enum";
import { EIngredientType } from "@/enum/product";

export interface Device {
    deviceId: string;
    deviceModelId: string;
    name: string;
    description: string;
    status: EDeviceStatus;
    createdDate: string;
    updatedDate: string | null;
    deviceModel: DeviceModel;
    serialNumber: string;
    deviceIngredientStates: DeviceIngredientStates[];
    deviceIngredientHistories: DeviceIngredientHistory[];
}

export interface DeviceIngredientHistory {
    deviceIngredientHistoryId: string;
    deviceIngredientStateId: string;
    deviceId: string;
    deltaAmount: number;
    oldCapacity: number;
    newCapacity: number;
    performedBy: string;
    action: EIngredientAction;
}


export interface DeviceType {
    name: string;
    description: string;
    deviceTypeId: string;
    status: EBaseStatus;
    isMobileDevice: boolean;
    createdDate: string;
    updatedDate: string | null;
}

export interface DeviceModel {
    modelName: string;
    manufacturer: string;
    deviceModelId: string;
    deviceTypeId: string;
    deviceType: DeviceType;
    status: EBaseStatus;
    createdDate: string;
    updatedDate: string | null;
    deviceFunctions: DeviceFunction[];
    deviceIngredients: DeviceIngredient[];
}

export interface DeviceFunction {
    name: string;
    deviceFunctionId?: string;
    label: string;
    functionParameters: FunctionParameters[];
    status: EBaseStatus;
}

export interface DeviceIngredient {
    label: string;
    ingredientType: string;
    description: string | null;
    maxCapacity: number;
    minCapacity: number;
    warningPercent: number;
    unit: string;
    isRenewable: boolean;
    status: EBaseStatus;
    isPrimary: boolean;
    deviceFunctionName: string | null,
    ingredientSelectorParameter: string | null,
    ingredientSelectorValue: string | null,
    targetOverrideParameter: string | null,
}

export interface FunctionParameters {
    name: string;
    deviceFunctionId?: string;
    functionParameterId?: string;
    min: string | null;
    options: string[] | null;
    max: string | null,
    description: string | null,
    type: EFunctionParameterType,
    default: string
}


export interface DeviceIngredientStates {
    deviceIngredientStateId: string;
    deviceId: string;
    maxCapacity: number;
    minCapacity: number;
    warningPercent: number;
    ingredientType: string;
    capacityLevel: string;
    currentCapacity: number;
    unit: EIngredientType;
    isWarning: boolean;
    isRenewable: boolean;
    isPrimary: boolean;
}
