import { EBaseStatus } from "@/enum/base";
import { EDeviceStatus, EFunctionParameterType } from "@/enum/device";

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
