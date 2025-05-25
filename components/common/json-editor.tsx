"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import JSONEditor, { type JSONEditorOptions } from "jsoneditor"
import "jsoneditor/dist/jsoneditor.css"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import type { JSX } from "react/jsx-runtime" // Import JSX to fix the undeclared variable error

// CSS tùy chỉnh để ghi đè kiểu của JSONEditor
const customStyles = `
    .jsoneditor {
        border: 1px solid #a5edec; /* primary-200 */
        border-radius: 0.375rem;
        background-color: #e1f9f9; /* primary-100 */
    }
    .jsoneditor-tree {
        font-family: 'Inter', sans-serif;
        color: #295959; /* primary-500 */
    }
    .jsoneditor-field {
        color: #3f8786; /* primary-400 */
        font-weight: 600;
    }
    .jsoneditor-value {
        color: #68e0df; /* primary-300 */
    }
    .jsoneditor-button {
        background-color: #3f8786; /* primary-400 */
        color: #ffffff; /* primary-foreground */
        border-radius: 0.25rem;
        padding: 0.25rem 0.5rem;
    }
    .jsoneditor-button:hover {
        background-color: #295959; /* primary-500 */
    }
    .jsoneditor-expandable .jsoneditor-button {
        background-color: transparent;
        color: #3f8786; /* primary-400 */
    }
    .jsoneditor-expandable .jsoneditor-button:hover {
        color: #295959; /* primary-500 */
    }
`

// Chèn CSS tùy chỉnh vào tài liệu
if (typeof document !== "undefined") {
    const styleSheet = document.createElement("style")
    styleSheet.innerText = customStyles
    document.head.appendChild(styleSheet)
}

interface JsonEditorComponentProps {
    value: string
    onChange: (value: string) => void
    disabled?: boolean
    height?: string
}

const JsonEditorComponent: React.FC<JsonEditorComponentProps> = ({
    value,
    onChange,
    disabled = false,
    height = "300px",
}) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const editorRef = useRef<JSONEditor | null>(null)
    const [selectedTab, setSelectedTab] = useState("editor")
    const [json, setJson] = useState(() => {
        try {
            return value ? JSON.parse(value) : {}
        } catch {
            return {}
        }
    })
    const [stringView, setStringView] = useState(value || "{}")
    const [error, setError] = useState<string | null>(null)

    // Khởi tạo JSONEditor
    useEffect(() => {
        if (containerRef.current && !disabled) {
            const options: JSONEditorOptions = {
                mode: "tree",
                mainMenuBar: false,
                navigationBar: false,
                statusBar: false,
                onChangeJSON: (updatedJson) => {
                    setJson(updatedJson)
                    const jsonString = JSON.stringify(updatedJson, null, 2)
                    setStringView(jsonString)
                    onChange(jsonString)
                    setError(null)
                },
                onEditable: () => ({ field: false, value: true }),
            }

            editorRef.current = new JSONEditor(containerRef.current, options)
            editorRef.current.set(json)
        }

        return () => {
            editorRef.current?.destroy()
        }
    }, [disabled])

    // Cập nhật khi value prop thay đổi
    useEffect(() => {
        try {
            const parsedJson = value ? JSON.parse(value) : {}
            setJson(parsedJson)
            setStringView(value || "{}")
            if (editorRef.current) {
                editorRef.current.set(parsedJson)
            }
        } catch {
            // Ignore invalid JSON
        }
    }, [value])

    // Xử lý thay đổi trong String View
    const handleStringViewChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value
        setStringView(newValue)
        try {
            const parsedJson = JSON.parse(newValue)
            setJson(parsedJson)
            onChange(newValue)
            setError(null)
        } catch (err) {
            setError("JSON không hợp lệ")
        }
    }

    // Hàm hiển thị dạng MongoDB-style view
    const renderMongoView = (data: any, indent = 0): JSX.Element[] => {
        const items: JSX.Element[] = []

        const spacing = (level: number) => <span style={{ paddingLeft: `${level * 20}px` }} />

        if (Array.isArray(data)) {
            data.forEach((item, index) => {
                items.push(
                    <div key={index}>
                        {spacing(indent)}
                        <span className="text-primary-400">[{index}]</span>
                        {typeof item === "object" ? (
                            <>{renderMongoView(item, indent + 1)}</>
                        ) : (
                            <>
                                : <span className="text-primary-300">{JSON.stringify(item)}</span>
                            </>
                        )}
                    </div>,
                )
            })
        } else if (typeof data === "object" && data !== null) {
            Object.entries(data).forEach(([key, value], i) => {
                items.push(
                    <div key={i}>
                        {spacing(indent)}
                        <strong className="text-primary-400">{key}</strong>
                        {typeof value === "object" ? (
                            <>:{renderMongoView(value, indent + 1)}</>
                        ) : (
                            <>
                                : <span className="text-primary-300">{JSON.stringify(value)}</span>
                            </>
                        )}
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
                    value={stringView}
                    readOnly
                    className="font-mono bg-transparent border-none resize-none"
                    style={{ height }}
                />
            </div>
        )
    }

    return (
        <div className="border rounded-md">
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                <TabsList className="w-full">
                    <TabsTrigger value="editor">JSON Editor</TabsTrigger>
                    <TabsTrigger value="string">String View</TabsTrigger>
                    <TabsTrigger value="mongo">Mongo View</TabsTrigger>
                </TabsList>

                <TabsContent value="editor" className="mt-0">
                    <div ref={containerRef} style={{ height }} />
                </TabsContent>

                <TabsContent value="string" className="mt-0">
                    <div className="space-y-2 p-2">
                        <Textarea
                            value={stringView}
                            onChange={handleStringViewChange}
                            className="font-mono"
                            style={{ height }}
                            placeholder="Nhập JSON tại đây"
                        />
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                    </div>
                </TabsContent>

                <TabsContent value="mongo" className="mt-0">
                    <div
                        className="bg-primary-100 p-4 text-sm font-mono rounded border border-primary-200 overflow-auto text-primary-500"
                        style={{ height }}
                    >
                        {renderMongoView(json)}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}

export default JsonEditorComponent
