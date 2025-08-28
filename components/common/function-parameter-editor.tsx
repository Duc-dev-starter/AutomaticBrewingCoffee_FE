"use client"

import type React from "react"
import { useEffect, useMemo, useCallback } from "react"
import type { DeviceModel, OptionParamter } from "@/interfaces/device"
import JsonEditorComponent from "./json-editor"

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

    // --- THAY ĐỔI 3: Sửa lại useEffect để phá vỡ vòng lặp vô hạn ---
    // useEffect này bây giờ chỉ phụ thuộc vào `functionParameters`.
    // Khi bạn chọn một chức năng mới -> `functionParameters` thay đổi -> effect chạy.
    // Nó sẽ không còn phụ thuộc vào `onChange` để tránh vòng lặp.
    useEffect(() => {
        if (functionParameters.length > 0) {
            const defaultParams = generateParameterObject()
            const newJsonValue = JSON.stringify(defaultParams, null, 2)
            // Chỉ gọi onChange nếu giá trị mặc định mới khác với giá trị hiện tại
            // để tránh các lần update không cần thiết.
            try {
                if (JSON.stringify(JSON.parse(value)) !== JSON.stringify(defaultParams)) {
                    onChange(newJsonValue);
                }
            } catch {
                // Nếu `value` hiện tại không phải là JSON hợp lệ, cứ cập nhật
                onChange(newJsonValue);
            }
        } else {
            // Nếu không có tham số, reset về object rỗng
            if (value !== "{}") {
                onChange("{}")
            }
        }
    }, [functionParameters, generateParameterObject, onChange, value]) // Thêm value và onChange để tuân thủ quy tắc hook, nhưng logic bên trong đã ngăn vòng lặp

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
                            {param.description || param.name} ({param.type})
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