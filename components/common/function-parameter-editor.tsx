
"use client";

import React, { useEffect } from "react";
import type { DeviceModel } from "@/interfaces/device";
import JsonEditorComponent from "./json-editor";

interface FunctionParameter {
    functionParameterId: string;
    deviceFunctionId: string;
    name: string;
    type: string;
    options: any[];
    default: string;
}

interface FunctionParameterEditorProps {
    deviceFunctionId: string;
    deviceModels: DeviceModel[];
    value: string;
    onChange: (value: string) => void;
    disabled: boolean;
}

const FunctionParameterEditor: React.FC<FunctionParameterEditorProps> = ({
    deviceFunctionId,
    deviceModels,
    value,
    onChange,
    disabled,
}) => {
    const getFunctionParameters = (): FunctionParameter[] => {
        for (const deviceModel of deviceModels) {
            const deviceFunction = deviceModel.deviceFunctions?.find((df) => df.deviceFunctionId === deviceFunctionId);
            if (deviceFunction) {
                return deviceFunction.functionParameters || [];
            }
        }
        return [];
    };

    const functionParameters = getFunctionParameters();

    const generateParameterObject = () => {
        const parameterObject: Record<string, any> = {};

        functionParameters.forEach((param) => {
            let defaultValue: string | number | boolean = param.default;

            if (defaultValue === null || defaultValue === undefined || defaultValue === "") {
                switch (param.type.toLowerCase()) {
                    case "text":
                        defaultValue = "";
                        break;
                    case "integer":
                        defaultValue = 0;
                        break;
                    case "double":
                        defaultValue = 0.0;
                        break;
                    case "boolean":
                        defaultValue = false;
                        break;
                    default:
                        defaultValue = "";
                }
            } else {
                switch (param.type.toLowerCase()) {
                    case "integer":
                        defaultValue = Number.parseInt(defaultValue as string) || 0;
                        break;
                    case "double":
                        defaultValue = Number.parseFloat(defaultValue as string) || 0.0;
                        break;
                    case "boolean":
                        defaultValue = defaultValue === "true" || defaultValue === true;
                        break;
                    case "text":
                        defaultValue = String(defaultValue);
                        break;
                }
            }

            parameterObject[param.name] = defaultValue;
        });

        return parameterObject;
    };

    useEffect(() => {
        if (deviceFunctionId && functionParameters.length > 0) {
            const parameterObject = generateParameterObject();
            const parameterJson = JSON.stringify(parameterObject, null, 2);
            onChange(parameterJson);
        } else {
            onChange("{}");
        }
    }, [deviceFunctionId, functionParameters.length]);

    if (!deviceFunctionId || functionParameters.length === 0) {
        return <JsonEditorComponent value={value} onChange={onChange} disabled={disabled} height="250px" />;
    }

    return (
        <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
                <strong>Function Parameters ({functionParameters.length}):</strong>
                <div className="flex flex-wrap gap-1 mt-1">
                    {functionParameters.map((param) => (
                        <span
                            key={param.functionParameterId}
                            className="inline-flex items-center px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs border border-blue-200"
                        >
                            {param.name} ({param.type})
                            {param.default && <span className="ml-1 text-blue-500">= {param.default}</span>}
                        </span>
                    ))}
                </div>
            </div>

            <JsonEditorComponent
                value={value}
                onChange={onChange}
                disabled={disabled}
                height="300px"
                functionParameters={functionParameters}
            />

            <div className="text-xs text-muted-foreground">
                <strong>Lưu ý:</strong> Hiển thị tất cả parameters của function dưới dạng key-value pairs. Bạn có thể chỉnh sửa
                các giá trị trong JSON Editor hoặc String View.
            </div>
        </div>
    );
};

export default FunctionParameterEditor;