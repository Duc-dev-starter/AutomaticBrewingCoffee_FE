"use client"

import type React from "react"
import { useEffect, useState } from "react"
import AceEditor from "react-ace"
import "ace-builds/src-noconflict/mode-json"
import "ace-builds/src-noconflict/theme-cloud9_day"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface FunctionParameter {
    functionParameterId: string
    deviceFunctionId: string
    name: string
    type: string
    options: any[]
    default: string
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
    const [selectedTab, setSelectedTab] = useState("ui")
    const [json, setJson] = useState(() => {
        try {
            return value ? JSON.parse(value) : {}
        } catch {
            return {}
        }
    })
    const [stringView, setStringView] = useState("") // String View độc lập, không tự động cập nhật
    const [selectedType, setSelectedType] = useState<string>("text")
    const [error, setError] = useState<string | null>(null)
    const [forceUpdate, setForceUpdate] = useState(0)

    const availableTypes = [
        { value: "text", label: "Text" },
        { value: "integer", label: "Integer" },
        { value: "double", label: "Double" },
        { value: "boolean", label: "Boolean" },
    ]

    useEffect(() => {
        try {
            const parsed = value ? JSON.parse(value) : {}
            setJson(parsed)
            setError(null)
        } catch {
            setError("Dữ liệu JSON không hợp lệ")
        }
    }, [value])

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
        setStringView(newValue) // Chỉ cập nhật khi người dùng nhập vào String View

        if (!newValue.trim()) {
            setError(null)
            return
        }

        const validation = validateValueByType(newValue, selectedType)
        if (validation.isValid) {
            // Convert raw input to proper JSON value based on type
            let jsonValue: any

            switch (selectedType) {
                case "text":
                    jsonValue = newValue // Keep as string
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

            // Update the JSON with the converted value
            const jsonString = JSON.stringify(jsonValue)
            setJson(jsonValue)
            onChange(jsonString)
            setError(null)
        } else {
            setError(validation.error)
        }
    }

    const handleJsonChange = (newValue: string) => {
        try {
            const parsed = JSON.parse(newValue)
            const originalKeys = Object.keys(json)
            const newKeys = Object.keys(parsed)

            // Kiểm tra xem key có bị thay đổi không
            const keysChanged = originalKeys.length !== newKeys.length || !originalKeys.every((key) => newKeys.includes(key))

            if (keysChanged) {
                setError("Không được phép thay đổi tên parameter (key)")
                // Không cập nhật JSON, giữ nguyên giá trị cũ
                setTimeout(() => {
                    setError(null)
                    // Force reset AceEditor về giá trị cũ
                    setJson({ ...json })
                }, 0)
                return
            }

            setJson(parsed)
            onChange(JSON.stringify(parsed, null, 2))
            setError(null)
        } catch {
            setError("JSON không hợp lệ")
            // Reset về giá trị cũ sau 2 giây
            setTimeout(() => {
                setError(null)
                setJson({ ...json })
            }, 0)
        }
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
                                        const newJson = Array.isArray(json) ? newData : { ...json, [index]: newData }
                                        setJson(newJson)
                                        onChange(JSON.stringify(newJson, null, 2))
                                    } catch {
                                        setError("Giá trị không hợp lệ")
                                    }
                                }}
                                className="text-green-600 font-medium border rounded p-1 ml-2"
                                disabled={disabled}
                            />
                        )}
                    </div>,
                )
            })
        } else if (typeof data === "object" && data !== null) {
            Object.entries(data).forEach(([key, value], i) => {
                const param = functionParameters.find((p) => p.name === key)
                const paramType = param?.type || "unknown"

                items.push(
                    <div key={i} className="py-1 border-l-2 border-gray-100 pl-2 my-1">
                        {spacing(indent)}
                        <div className="flex items-center gap-2">
                            <span className="text-blue-600 font-semibold">{key}</span>
                            <span className="text-xs bg-gray-100 text-gray-600 px-1 rounded">{paramType}</span>
                            <span className="text-gray-500">:</span>
                            {typeof value === "object" ? (
                                <div className="ml-2">{renderUIView(value, indent + 1)}</div>
                            ) : (
                                <input
                                    type="text"
                                    value={JSON.stringify(value)}
                                    onChange={(e) => {
                                        try {
                                            const newValue = JSON.parse(e.target.value)
                                            const newJson = { ...json, [key]: newValue }
                                            setJson(newJson)
                                            onChange(JSON.stringify(newJson, null, 2))
                                        } catch {
                                            setError("Giá trị không hợp lệ")
                                        }
                                    }}
                                    className="text-green-600 font-medium border rounded p-1"
                                    disabled={disabled}
                                />
                            )}
                        </div>
                    </div>,
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

    const resetToOriginal = () => {
        setForceUpdate((prev) => prev + 1)
        setTimeout(() => setError(null), 100)
    }

    return (
        <div className="border rounded-md">
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                <TabsList className="w-full">
                    <TabsTrigger value="ui">UI View</TabsTrigger>
                    <TabsTrigger value="json">JSON View</TabsTrigger>
                    <TabsTrigger value="string">String View</TabsTrigger>
                </TabsList>

                <TabsContent value="ui" className="mt-0">
                    <div className="bg-gray-50 p-4 text-sm rounded border overflow-auto" style={{ height }}>
                        {Object.keys(json).length > 0 ? (
                            <div className="space-y-1">{renderUIView(json)}</div>
                        ) : (
                            <div className="text-gray-500 text-center py-8">Chưa có dữ liệu để hiển thị</div>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="json" className="mt-0">
                    <div className="bg-white border rounded p-2 overflow-auto" style={{ height }}>
                        <AceEditor
                            mode="json"
                            theme="cloud9_day"
                            value={JSON.stringify(json, null, 2)}
                            onChange={handleJsonChange}
                            name={`json-editor-${forceUpdate}`} // Force re-render khi có lỗi
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
            </Tabs>
        </div>
    )
}

export default JsonEditorComponent
