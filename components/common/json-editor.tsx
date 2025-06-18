// @ts-nocheck
"use client"

import type React from "react"
import { useEffect, useState, useRef, useMemo } from "react"
import AceEditor from "react-ace"
import "ace-builds/src-noconflict/mode-json"
import "ace-builds/src-noconflict/theme-cloud9_day"
import "ace-builds/src-noconflict/ext-language_tools"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronDown, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

interface FunctionParameter {
    functionParameterId: string
    deviceFunctionId: string
    name: string
    type: string
    options: any[]
    default: string
    description?: string
    min?: string
    max?: string
}

interface JsonEditorComponentProps {
    value: string
    onChange: (value: string) => void
    disabled?: boolean
    height?: string
    functionParameters?: FunctionParameter[]
}

const JsonEditorComponent: React.FC<JsonEditorComponentProps> = ({
    value,
    onChange,
    disabled = false,
    height = "300px",
    functionParameters = [],
}) => {
    const [selectedTab, setSelectedTab] = useState("ui");
    const [error, setError] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [selectedType, setSelectedType] = useState("text");
    const [stringView, setStringView] = useState("");
    const aceEditorRef = useRef<any>(null);

    const availableTypes = [
        { value: "text", label: "Text" },
        { value: "integer", label: "Integer" },
        { value: "double", label: "Double" },
        { value: "boolean", label: "Boolean" },
    ]

    const parsedJson = useMemo(() => {
        try {
            return value ? JSON.parse(value) : {};
        } catch {
            return {};
        }
    }, [value]);

    // Validate all parameters against their constraints
    const validateAllParameters = (data: any) => {
        const errors: Record<string, string> = {}

        functionParameters.forEach((param) => {
            const paramValue = data[param.name]
            if (paramValue !== undefined && paramValue !== null) {
                const validation = validateParameterValue(paramValue, param)
                if (!validation.isValid) {
                    errors[param.name] = validation.error || "Giá trị không hợp lệ"
                }
            }
        })

        setValidationErrors(errors)
    }

    // Validate a single parameter value against its constraints
    const validateParameterValue = (value: any, param: FunctionParameter) => {
        const type = param.type.toLowerCase()

        if (type === "integer" || type === "int") {
            if (!Number.isInteger(value)) {
                return { isValid: false, error: "Giá trị phải là số nguyên" }
            }
        } else if (type === "double" || type === "float") {
            if (typeof value !== "number" || isNaN(value)) {
                return { isValid: false, error: "Giá trị phải là số thập phân" }
            }
        } else if (type === "boolean") {
            if (typeof value !== "boolean") {
                return { isValid: false, error: "Giá trị phải là true hoặc false" }
            }
        }

        if ((type === "integer" || type === "int" || type === "double" || type === "float") && typeof value === "number") {
            if (param.min !== undefined && param.min !== null && param.min !== "") {
                const minValue = Number.parseFloat(param.min)
                if (value < minValue) {
                    return { isValid: false, error: `Giá trị phải >= ${minValue}` }
                }
            }

            if (param.max !== undefined && param.max !== null && param.max !== "") {
                const maxValue = Number.parseFloat(param.max)
                if (value > maxValue) {
                    return { isValid: false, error: `Giá trị phải <= ${maxValue}` }
                }
            }
        }

        return { isValid: true }
    }

    // Setup autocomplete for AceEditor
    useEffect(() => {
        if (aceEditorRef.current && functionParameters.length > 0) {
            const editor = aceEditorRef.current.editor

            const customCompleter = {
                getCompletions: (editor: any, session: any, pos: any, prefix: any, callback: any) => {
                    const completions: any[] = []
                    const currentLine = session.getLine(pos.row)

                    functionParameters.forEach((param) => {
                        if (param.options && param.options.length > 0) {
                            if (currentLine.includes(`"${param.name}"`)) {
                                param.options.forEach((option) => {
                                    completions.push({
                                        caption: option,
                                        value: `"${option}"`,
                                        meta: `${param.name} option`,
                                        score: 1000,
                                    })
                                })
                            }
                        }
                    })

                    callback(null, completions)
                },
            }

            editor.completers = [customCompleter]
        }
    }, [functionParameters])

    const validateValueByType = (val: string, type: string) => {
        if (!val.trim()) return { isValid: true }

        switch (type) {
            case "integer":
                const intVal = Number.parseInt(val)
                return {
                    isValid: !isNaN(intVal) && intVal.toString() === val.trim() && Number.isInteger(intVal),
                    error: "Giá trị phải là số nguyên (ví dụ: 42)",
                }
            case "double":
                const floatVal = Number.parseFloat(val)
                return {
                    isValid: !isNaN(floatVal) && !isNaN(Number(val)),
                    error: "Giá trị phải là số thập phân (ví dụ: 12.5)",
                }
            case "boolean":
                return {
                    isValid: val.trim() === "true" || val.trim() === "false",
                    error: "Giá trị phải là true hoặc false",
                }
            case "text":
                return { isValid: true }
            default:
                return { isValid: false, error: "Kiểu dữ liệu không hợp lệ" }
        }
    }

    const handleStringViewChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value
        setStringView(newValue)

        if (!newValue.trim()) {
            setError(null)
            return
        }

        const validation = validateValueByType(newValue, selectedType)
        if (validation.isValid) {
            let jsonValue: any

            switch (selectedType) {
                case "text":
                    jsonValue = newValue
                    break
                case "integer":
                    jsonValue = Number.parseInt(newValue)
                    break
                case "double":
                    jsonValue = Number.parseFloat(newValue)
                    break
                case "boolean":
                    jsonValue = newValue.trim() === "true"
                    break
                default:
                    jsonValue = newValue
            }

            const jsonString = JSON.stringify(jsonValue)
            onChange(jsonString)
            setError(null)
        } else {
            setError(validation.error)
        }
    }

    const handleJsonChange = (newValue: string) => {
        try {
            const parsed = JSON.parse(newValue);
            const originalKeys = Object.keys(parsedJson);
            const newKeys = Object.keys(parsed);

            if (originalKeys.length !== newKeys.length || !originalKeys.every((key) => newKeys.includes(key))) {
                setError("Không được phép thay đổi tên parameter (key)");
                setTimeout(() => setError(null), 2000);
                return;
            }

            onChange(JSON.stringify(parsed, null, 2));
            setError(null);
            validateAllParameters(parsed);
        } catch {
            setError("JSON không hợp lệ");
            setTimeout(() => setError(null), 2000);
        }
    };

    // Component for parameter value input with validation
    const ParameterValueInput: React.FC<{
        paramKey: string
        value: any
        param: FunctionParameter | undefined
        onChange: (newValue: any) => void
    }> = ({ paramKey, value, param, onChange }) => {
        const hasError = validationErrors[paramKey]

        if (param && param.options && param.options.length > 0) {
            return (
                <div className="flex items-center gap-2">
                    <Select
                        value={value !== undefined && value !== null ? String(value) : ""}
                        onValueChange={(newValue) => {
                            onChange(newValue)
                        }}
                        disabled={disabled}
                    >
                        <SelectTrigger
                            className={cn(
                                "w-32 flex items-center justify-between px-2 py-1 text-sm border rounded",
                                hasError && "border-red-500 bg-red-50"
                            )}
                        >
                            <span className="text-green-600 font-medium">
                                {value !== undefined && value !== null ? String(value) : "Chọn giá trị"}
                            </span>
                        </SelectTrigger>
                        <SelectContent>
                            {param.options.map((option) => (
                                <SelectItem key={option} value={String(option)}>
                                    {option}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {param.description && (
                        <span className="text-xs text-gray-400" title={param.description}>
                            ℹ️
                        </span>
                    )}
                    {hasError && (
                        <span className="text-xs text-red-500" title={hasError}>
                            <AlertTriangle className="h-3 w-3" />
                        </span>
                    )}
                </div>
            )
        }

        const isNumeric = param && ["integer", "int", "double", "float"].includes(param.type.toLowerCase())
        const placeholder = isNumeric && param ? `${param.min || "∞"} - ${param.max || "∞"}` : param?.description || ""

        return (
            <div className="flex items-center gap-2">
                <input
                    type="text"
                    value={value !== undefined && value !== null ? JSON.stringify(value) : ""}
                    onChange={(e) => {
                        try {
                            const newValue = JSON.parse(e.target.value)
                            onChange(newValue)
                        } catch {
                            // Không cập nhật nếu JSON không hợp lệ
                        }
                    }}
                    className={cn("text-green-600 font-medium border rounded p-1", hasError && "border-red-500 bg-red-50")}
                    disabled={disabled}
                    placeholder={placeholder}
                    title={param?.description || ""}
                />
                {hasError && (
                    <span className="text-xs text-red-500 flex items-center gap-1" title={hasError}>
                        <AlertTriangle className="h-3 w-3" />
                    </span>
                )}
            </div>
        )
    }

    const renderUIView = (data: any, indent = 0): React.JSX.Element[] => {
        const items: React.JSX.Element[] = []
        const spacing = (level: number) => <span style={{ paddingLeft: `${level * 20}px` }} />

        if (Array.isArray(data)) {
            data.forEach((item, index) => {
                items.push(
                    <div key={index} className="py-1">
                        {spacing(indent)}
                        <span className="text-blue-600 font-medium">[{index}]</span>
                        {typeof item === "object" ? (
                            <div>{renderUIView(item, indent + 1)}</div>
                        ) : (
                            <input
                                type="text"
                                value={JSON.stringify(item)}
                                onChange={(e) => {
                                    try {
                                        const newItem = JSON.parse(e.target.value)
                                        const newData = [...data]
                                        newData[index] = newItem
                                        const newJson = Array.isArray(parsedJson) ? newData : { ...parsedJson, [index]: newData }
                                        onChange(JSON.stringify(newJson, null, 2))
                                    } catch {
                                        setError("Giá trị không hợp lệ")
                                    }
                                }}
                                className="text-green-600 font-medium border rounded p-1 ml-2"
                                disabled={disabled}
                            />
                        )}
                    </div>
                )
            })
        } else if (typeof data === "object" && data !== null) {
            Object.entries(data).forEach(([key, value], i) => {
                const param = functionParameters.find((p) => p.name === key)
                const paramType = param?.type || "unknown"
                const hasError = validationErrors[key]
                const isNumeric = param && ["integer", "int", "double", "float"].includes(param.type.toLowerCase())
                const hasConstraints = isNumeric && (param?.min !== undefined || param?.max !== undefined)

                items.push(
                    <div
                        key={i}
                        className={cn("py-1 border-l-2 pl-2 my-1", hasError ? "border-red-300 bg-red-50" : "border-gray-100")}
                    >
                        {spacing(indent)}
                        <div className="flex items-center gap-2">
                            <span className="text-blue-600 font-semibold">{key}</span>
                            <span className="text-xs bg-gray-100 text-gray-600 px-1 rounded">{paramType}</span>
                            {hasConstraints && (
                                <span className="text-xs bg-orange-100 text-orange-600 px-1 rounded">
                                    {param?.min || "∞"} - {param?.max || "∞"}
                                </span>
                            )}
                            {param?.options && param.options.length > 0 && (
                                <span className="text-xs bg-blue-100 text-blue-600 px-1 rounded">{param.options.length} lựa chọn</span>
                            )}
                            <span className="text-gray-500">:</span>
                            {typeof value === "object" ? (
                                <div className="ml-2">{renderUIView(value, indent + 1)}</div>
                            ) : (
                                <ParameterValueInput
                                    paramKey={key}
                                    value={value}
                                    param={param}
                                    onChange={(newValue) => {
                                        const newJson = { ...parsedJson, [key]: newValue }
                                        onChange(JSON.stringify(newJson, null, 2))
                                    }}
                                />
                            )}
                        </div>
                        {hasError && (
                            <div className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                {hasError}
                            </div>
                        )}
                    </div>
                )
            })
        }

        return items
    }

    if (disabled) {
        return (
            <div className="bg-muted p-3 rounded-md">
                <Textarea
                    value={value}
                    readOnly
                    className="font-mono bg-transparent border-none resize-none"
                    style={{ height }}
                />
            </div>
        )
    }

    const showStringView = functionParameters.length < 2
    const hasValidationErrors = Object.keys(validationErrors).length > 0

    return (
        <div className="border rounded-md">
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                <TabsList className="w-full">
                    <TabsTrigger value="ui" className="flex items-center gap-2">
                        Trực quan
                        {hasValidationErrors && <AlertTriangle className="h-3 w-3 text-red-500" />}
                    </TabsTrigger>
                    <TabsTrigger value="json" className="flex items-center gap-2">
                        Dạng JSON
                        {hasValidationErrors && <AlertTriangle className="h-3 w-3 text-red-500" />}
                    </TabsTrigger>
                    {showStringView && <TabsTrigger value="string">Dạng chuỗi</TabsTrigger>}
                </TabsList>

                <TabsContent value="ui" className="mt-0">
                    <div className="bg-gray-50 p-4 text-sm rounded border overflow-auto" style={{ height }}>
                        {Object.keys(parsedJson).length > 0 ? (
                            <div className="space-y-1">{renderUIView(parsedJson)}</div>
                        ) : (
                            <div className="text-gray-500 text-center py-8">Chưa có dữ liệu để hiển thị</div>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="json" className="mt-0">
                    <div className="bg-white border rounded p-2 overflow-auto" style={{ height }}>
                        <AceEditor
                            ref={aceEditorRef}
                            mode="json"
                            theme="cloud9_day"
                            value={value}
                            onChange={handleJsonChange}
                            name="json-editor"
                            editorProps={{ $blockScrolling: true }}
                            setOptions={{
                                enableBasicAutocompletion: true,
                                enableLiveAutocompletion: true,
                                enableSnippets: true,
                                showLineNumbers: true,
                                tabSize: 2,
                            }}
                            style={{ width: "100%", height: "100%" }}
                            readOnly={disabled}
                        />
                    </div>
                </TabsContent>

                {showStringView && (
                    <TabsContent value="string" className="mt-0">
                        <div className="space-y-2 p-2">
                            <div className="flex items-center gap-2">
                                <Label htmlFor="type-select" className="text-sm">
                                    Kiểu dữ liệu:
                                </Label>
                                <Select value={selectedType} onValueChange={setSelectedType} disabled={disabled}>
                                    <SelectTrigger id="type-select" className="w-40">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableTypes.map((type) => (
                                            <SelectItem key={type.value} value={type.value}>
                                                {type.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Textarea
                                value={stringView}
                                onChange={handleStringViewChange}
                                className="font-mono"
                                style={{ height: `calc(${height} - 60px)` }}
                                placeholder={
                                    selectedType === "text"
                                        ? "Nhập text (ví dụ: Hello World)"
                                        : selectedType === "integer"
                                            ? "Nhập số nguyên (ví dụ: 42)"
                                            : selectedType === "double"
                                                ? "Nhập số thập phân (ví dụ: 12.5)"
                                                : selectedType === "boolean"
                                                    ? "Nhập true hoặc false"
                                                    : "Nhập giá trị..."
                                }
                                disabled={disabled}
                            />
                            {error && <p className="text-sm text-red-500">{error}</p>}
                            <div className="text-xs text-blue-600">
                                <strong>Lưu ý:</strong> Nhập giá trị thô, không cần format JSON.
                                {selectedType === "text" && " Ví dụ: Hello World"}
                                {selectedType === "integer" && " Ví dụ: 42"}
                                {selectedType === "double" && " Ví dụ: 12.5"}
                                {selectedType === "boolean" && " Ví dụ: true"}
                            </div>
                        </div>
                    </TabsContent>
                )}
            </Tabs>

            {(error || hasValidationErrors) && (
                <div className="p-2 bg-red-50 border-t border-red-200">
                    {error && <p className="text-sm text-red-600 mb-1">{error}</p>}
                    {hasValidationErrors && (
                        <div className="text-sm text-red-600">
                            <p className="font-medium mb-1">Lỗi validation:</p>
                            <ul className="list-disc list-inside space-y-1">
                                {Object.entries(validationErrors).map(([key, errorMsg]) => (
                                    <li key={key}>
                                        <strong>{key}:</strong> {errorMsg}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default JsonEditorComponent