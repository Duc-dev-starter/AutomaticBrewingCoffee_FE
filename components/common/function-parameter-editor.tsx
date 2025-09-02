"use client"

import type React from "react"
import { useEffect, useMemo, useCallback } from "react"
import type { DeviceModel, OptionParamter } from "@/interfaces/device"
import JsonEditorComponent from "./json-editor"
import { EFunctionParameterTypeViMap } from "@/enum/device"

interface FunctionParameter {
    functionParameterId: string
    deviceFunctionId: string
    name: string
    type: string
    options: OptionParamter[]
    default: string
    description?: string
    min?: string
    max?: string
}

// Interface này không thay đổi
interface FunctionParameterEditorProps {
    deviceFunctionId: string
    deviceModels: DeviceModel[]
    value: string
    onChange: (value: string) => void
    disabled: boolean
}

const FunctionParameterEditor: React.FC<FunctionParameterEditorProps> = ({
    deviceFunctionId,
    deviceModels,
    value,
    onChange,
    disabled,
}) => {
    //@ts-ignore
    const functionParameters: FunctionParameter[] = useMemo(() => {
        if (!deviceFunctionId) return []

        for (const deviceModel of deviceModels) {
            const deviceFunction = deviceModel.deviceFunctions?.find((df) => df.deviceFunctionId === deviceFunctionId)
            if (deviceFunction && deviceFunction.functionParameters) {
                const params = deviceFunction.functionParameters
                // Lọc ra những tham số hợp lệ (có ID) để đảm bảo an toàn kiểu dữ liệu
                return params.filter(
                    (p: any): p is FunctionParameter => p && typeof p.functionParameterId === "string",
                )
            }
        }
        return []
    }, [deviceFunctionId, deviceModels])

    // Bọc hàm này trong useCallback để nó không bị tạo lại trên mỗi lần render,
    // giúp ổn định các hook phụ thuộc vào nó.
    const generateParameterObject = useCallback(() => {
        const parameterObject: Record<string, any> = {}

        functionParameters.forEach((param) => {
            let defaultValue: string | number | boolean | null = param.default

            if (defaultValue === null || defaultValue === undefined || defaultValue === "") {
                switch (param.type.toLowerCase()) {
                    case "text": defaultValue = ""; break
                    case "integer": case "int": defaultValue = 0; break
                    case "double": defaultValue = 0.0; break
                    case "boolean": defaultValue = false; break
                    default: defaultValue = null; break
                }
            } else {
                switch (param.type.toLowerCase()) {
                    case "integer": case "int":
                        defaultValue = Number.parseInt(String(defaultValue), 10) || 0
                        break
                    case "double":
                        defaultValue = Number.parseFloat(String(defaultValue)) || 0.0
                        break
                    case "boolean":
                        defaultValue = String(defaultValue).toLowerCase() === "true"
                        break
                    case "text": default:
                        defaultValue = String(defaultValue)
                        break
                }
            }
            parameterObject[param.name] = defaultValue
        })
        return parameterObject
    }, [functionParameters])

    useEffect(() => {
        if (functionParameters.length > 0) {
            const defaultParams = generateParameterObject()
            const newJsonValue = JSON.stringify(defaultParams, null, 2)
            let isInvalid = false;
            try {
                JSON.parse(value)
            } catch {
                isInvalid = true;
            }
            if (isInvalid || value === "{}" || value.trim() === "" || value === undefined) {
                onChange(newJsonValue)
            }
        } else {
            if (value !== "{}") {
                onChange("{}")
            }
        }
    }, [functionParameters, generateParameterObject, onChange])

    if (!deviceFunctionId || functionParameters.length === 0) {
        return <JsonEditorComponent value={value} onChange={onChange} disabled={disabled} height="250px" />
    }

    // Render đầy đủ giao diện khi có tham số
    return (
        <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
                <strong>Chức năng này có ({functionParameters.length}) tham số:</strong>
                <div className="flex flex-wrap gap-1 mt-1">
                    {functionParameters.map((param) => (
                        <span
                            key={param.functionParameterId}
                            className="inline-flex items-center px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs border border-blue-200"
                        >
                            {param.description || param.name} ({EFunctionParameterTypeViMap[param.type]})
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
                <strong>Lưu ý:</strong> Hiển thị tất cả parameters của function dưới dạng key-value pairs.
            </div>
        </div>
    )
}

export default FunctionParameterEditor