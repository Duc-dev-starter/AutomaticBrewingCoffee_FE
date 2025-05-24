"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import JSONEditor, { type JSONEditorOptions } from "jsoneditor"
import "jsoneditor/dist/jsoneditor.css"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    Copy,
    Code,
    FileJson,
    Check,
    RefreshCw,
    Download,
    Upload,
    Maximize,
    Minimize,
    ChevronRight,
    ChevronDown,
    Braces,
    Database,
    Settings,
    Eye,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { JSX } from "react/jsx-runtime"

// Dữ liệu JSON ban đầu
const initialJson = {
    Version: "2012-10-17",
    Statement: [
        {
            Sid: "VisualEditor0",
            Effect: "Allow",
            Action: [
                "iam:GetRole",
                "iam:GetRolePolicy",
                "iam:PassRole",
                "iam:DetachRolePolicy",
                "iam:DeleteRole",
                "iam:CreateRole",
                "iam:AttachRolePolicy",
                "iam:PutRolePolicy",
            ],
            Resource: "arn:aws:iam::*:role/*",
        },
    ],
}

// CSS tùy chỉnh với thiết kế hiện đại
const customStyles = `
    .jsoneditor {
        border: 1px solid #e2e8f0;
        border-radius: 0.5rem;
        background-color: #ffffff;
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    
    .jsoneditor-tree {
        background-color: #ffffff;
        color: #1e293b;
        font-size: 14px;
        line-height: 1.5;
    }
    
    .jsoneditor-field {
        color: #059669;
        font-weight: 600;
        font-size: 14px;
    }
    
    .jsoneditor-value {
        color: #dc2626;
        font-weight: 500;
    }
    
    .jsoneditor-value.jsoneditor-string {
        color: #7c3aed;
    }
    
    .jsoneditor-value.jsoneditor-number {
        color: #2563eb;
    }
    
    .jsoneditor-value.jsoneditor-boolean {
        color: #ea580c;
    }
    
    .jsoneditor-value.jsoneditor-null {
        color: #6b7280;
    }
    
    .jsoneditor-button {
        background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
        color: #ffffff;
        border: none;
        border-radius: 0.375rem;
        padding: 0.25rem 0.5rem;
        font-size: 12px;
        font-weight: 500;
        transition: all 0.2s ease;
        box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    }
    
    .jsoneditor-button:hover {
        background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
        transform: translateY(-1px);
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    
    .jsoneditor-expandable .jsoneditor-button {
        background: transparent;
        color: #6b7280;
        border: 1px solid #e5e7eb;
        padding: 0.125rem;
        border-radius: 0.25rem;
    }
    
    .jsoneditor-expandable .jsoneditor-button:hover {
        background-color: #f3f4f6;
        color: #374151;
        transform: none;
        box-shadow: none;
    }
    
    .jsoneditor-tree .jsoneditor-node {
        border-left: 2px solid transparent;
        transition: border-color 0.2s ease;
    }
    
    .jsoneditor-tree .jsoneditor-node:hover {
        border-left-color: #3b82f6;
        background-color: #f8fafc;
    }
    
    .jsoneditor-tree .jsoneditor-selected {
        background-color: #eff6ff !important;
        border-left-color: #3b82f6 !important;
    }
    
    .jsoneditor-contextmenu {
        border-radius: 0.5rem;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        border: 1px solid #e5e7eb;
    }
    
    .jsoneditor-contextmenu .jsoneditor-menu button {
        padding: 0.5rem 0.75rem;
        font-size: 14px;
        transition: background-color 0.2s ease;
    }
    
    .jsoneditor-contextmenu .jsoneditor-menu button:hover {
        background-color: #f3f4f6;
    }
`

// Chèn CSS tùy chỉnh vào tài liệu
if (typeof document !== "undefined") {
    const existingStyle = document.getElementById("json-editor-custom-styles")
    if (!existingStyle) {
        const styleSheet = document.createElement("style")
        styleSheet.id = "json-editor-custom-styles"
        styleSheet.innerText = customStyles
        document.head.appendChild(styleSheet)
    }
}

const JsonEditorPage = () => {
    const containerRef = useRef<HTMLDivElement>(null)
    const editorRef = useRef<JSONEditor | null>(null)
    const [selectedTab, setSelectedTab] = useState("editor")
    const [json, setJson] = useState(initialJson)
    const [editorMode, setEditorMode] = useState<"tree" | "code" | "view" | "form" | "text">("tree")
    const [copied, setCopied] = useState(false)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({})

    useEffect(() => {
        if (containerRef.current) {
            const options: JSONEditorOptions = {
                mode: editorMode,
                mainMenuBar: false,
                navigationBar: false,
                statusBar: false,
                onChangeJSON: (updatedJson) => setJson(updatedJson),
                onEditable: () => ({ field: true, value: true }),
                search: true,
                indentation: 2,
            }

            editorRef.current = new JSONEditor(containerRef.current, options)
            editorRef.current.set(json)
        }

        return () => {
            editorRef.current?.destroy()
        }
    }, [editorMode])

    useEffect(() => {
        if (editorRef.current) {
            editorRef.current.set(json)
        }
    }, [json])

    const handleModeChange = (mode: "tree" | "code" | "view" | "form" | "text") => {
        if (editorRef.current) {
            try {
                const currentJson = editorRef.current.get()
                setJson(currentJson)
                editorRef.current.destroy()
                setEditorMode(mode)
            } catch (error) {
                console.error("Error changing mode:", error)
            }
        }
    }

    const handleCopyJson = () => {
        const jsonString = JSON.stringify(json, null, 2)
        navigator.clipboard.writeText(jsonString)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleFormatJson = () => {
        if (editorRef.current) {
            try {
                const currentJson = editorRef.current.get()
                setJson(currentJson)
            } catch (error) {
                console.error("Error formatting JSON:", error)
            }
        }
    }

    const handleDownloadJson = () => {
        const jsonString = JSON.stringify(json, null, 2)
        const blob = new Blob([jsonString], { type: "application/json" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = "data.json"
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }

    const handleUploadJson = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = (e) => {
                try {
                    const uploadedJson = JSON.parse(e.target?.result as string)
                    setJson(uploadedJson)
                    if (editorRef.current) {
                        editorRef.current.set(uploadedJson)
                    }
                } catch (error) {
                    console.error("Error parsing uploaded JSON:", error)
                }
            }
            reader.readAsText(file)
        }
    }

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen)
    }

    const toggleNodeExpansion = (path: string) => {
        setExpandedNodes((prev) => ({
            ...prev,
            [path]: !prev[path],
        }))
    }

    const isNodeExpanded = (path: string) => {
        return expandedNodes[path] !== false
    }

    // Hàm hiển thị dạng MongoDB-style view với thiết kế cải tiến
    const renderMongoView = (data: any, path = "", indent = 0): JSX.Element[] => {
        const items: JSX.Element[] = []

        if (Array.isArray(data)) {
            const isExpanded = isNodeExpanded(path)
            const hasChildren = data.length > 0

            items.push(
                <div key={`${path}-array`} className="flex items-start group">
                    <div className="flex items-center">
                        {hasChildren && (
                            <button
                                onClick={() => toggleNodeExpansion(path)}
                                className="p-1 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 mr-2 transition-colors"
                            >
                                {isExpanded ? (
                                    <ChevronDown className="h-3.5 w-3.5 text-blue-600" />
                                ) : (
                                    <ChevronRight className="h-3.5 w-3.5 text-blue-600" />
                                )}
                            </button>
                        )}
                        {!hasChildren && <span className="w-6" />}
                        <span className="text-blue-600 font-bold text-lg">[</span>
                    </div>
                    {data.length > 0 && !isExpanded && (
                        <Badge variant="secondary" className="ml-2 text-xs bg-blue-100 text-blue-700 hover:bg-blue-100">
                            {data.length} items
                        </Badge>
                    )}
                    {isExpanded && data.length === 0 && <span className="text-gray-500 ml-2 italic">Empty Array</span>}
                    <span className="text-blue-600 font-bold text-lg">{!isExpanded ? "]" : ""}</span>
                </div>,
            )

            if (isExpanded && data.length > 0) {
                data.forEach((item, index) => {
                    const itemPath = `${path}[${index}]`
                    items.push(
                        <div
                            key={itemPath}
                            className="ml-6 border-l-2 border-blue-200 pl-4 my-2 hover:border-blue-400 transition-colors"
                        >
                            <div className="flex items-start">
                                <Badge variant="outline" className="mr-3 text-xs bg-blue-50 text-blue-700 border-blue-200 font-mono">
                                    {index}
                                </Badge>
                                <div className="flex-1">
                                    {typeof item === "object" && item !== null ? (
                                        renderMongoView(item, itemPath, indent + 1)
                                    ) : (
                                        <RenderValue value={item} />
                                    )}
                                </div>
                            </div>
                        </div>,
                    )
                })

                items.push(
                    <div key={`${path}-array-end`} className="text-blue-600 font-bold text-lg">
                        ]
                    </div>,
                )
            }
        } else if (typeof data === "object" && data !== null) {
            const isExpanded = isNodeExpanded(path)
            const entries = Object.entries(data)
            const hasChildren = entries.length > 0

            items.push(
                <div key={`${path}-object`} className="flex items-start group">
                    <div className="flex items-center">
                        {hasChildren && (
                            <button
                                onClick={() => toggleNodeExpansion(path)}
                                className="p-1 rounded-md hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1 mr-2 transition-colors"
                            >
                                {isExpanded ? (
                                    <ChevronDown className="h-3.5 w-3.5 text-purple-600" />
                                ) : (
                                    <ChevronRight className="h-3.5 w-3.5 text-purple-600" />
                                )}
                            </button>
                        )}
                        {!hasChildren && <span className="w-6" />}
                        <span className="text-purple-600 font-bold text-lg">{"{"}</span>
                    </div>
                    {entries.length > 0 && !isExpanded && (
                        <Badge variant="secondary" className="ml-2 text-xs bg-purple-100 text-purple-700 hover:bg-purple-100">
                            {entries.length} properties
                        </Badge>
                    )}
                    {isExpanded && entries.length === 0 && <span className="text-gray-500 ml-2 italic">Empty Object</span>}
                    <span className="text-purple-600 font-bold text-lg">{!isExpanded ? "}" : ""}</span>
                </div>,
            )

            if (isExpanded && entries.length > 0) {
                entries.forEach(([key, value]) => {
                    const propertyPath = path ? `${path}.${key}` : key
                    items.push(
                        <div
                            key={propertyPath}
                            className="ml-6 border-l-2 border-purple-200 pl-4 my-2 hover:border-purple-400 transition-colors"
                        >
                            <div className="flex items-start">
                                <span className="text-green-700 font-semibold mr-3 bg-green-50 px-2 py-1 rounded-md text-sm">
                                    {key}:
                                </span>
                                <div className="flex-1">
                                    {typeof value === "object" && value !== null ? (
                                        renderMongoView(value, propertyPath, indent + 1)
                                    ) : (
                                        <RenderValue value={value} />
                                    )}
                                </div>
                            </div>
                        </div>,
                    )
                })

                items.push(
                    <div key={`${path}-object-end`} className="text-purple-600 font-bold text-lg">
                        {"}"}
                    </div>,
                )
            }
        }

        return items
    }

    // Component hiển thị giá trị với styling cải tiến
    const RenderValue = ({ value }: { value: any }) => {
        if (typeof value === "string") {
            return <span className="text-amber-600 bg-amber-50 px-2 py-1 rounded-md font-medium">"{value}"</span>
        } else if (typeof value === "number") {
            return <span className="text-blue-600 bg-blue-50 px-2 py-1 rounded-md font-medium">{value}</span>
        } else if (typeof value === "boolean") {
            return <span className="text-orange-600 bg-orange-50 px-2 py-1 rounded-md font-medium">{value.toString()}</span>
        } else if (value === null) {
            return <span className="text-gray-500 bg-gray-50 px-2 py-1 rounded-md font-medium italic">null</span>
        } else {
            return <span className="text-gray-700">{String(value)}</span>
        }
    }

    const getModeIcon = (mode: string) => {
        switch (mode) {
            case "tree":
                return <Braces className="h-4 w-4" />
            case "code":
                return <Code className="h-4 w-4" />
            case "view":
                return <Eye className="h-4 w-4" />
            case "form":
                return <Settings className="h-4 w-4" />
            case "text":
                return <FileJson className="h-4 w-4" />
            default:
                return <Braces className="h-4 w-4" />
        }
    }

    return (
        <TooltipProvider>
            <div className={cn("transition-all duration-300", isFullscreen ? "fixed inset-0 z-50 bg-white p-6" : "p-6")}>
                <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
                    <CardHeader className="pb-4 border-b bg-gradient-to-r from-blue-50 to-purple-50">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-xl flex items-center font-bold text-gray-800">
                                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg mr-3">
                                    <FileJson className="h-5 w-5 text-white" />
                                </div>
                                JSON Editor
                                <Badge variant="secondary" className="ml-3 bg-white/80 text-gray-700">
                                    Advanced
                                </Badge>
                            </CardTitle>
                            <div className="flex items-center gap-2">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={toggleFullscreen}
                                            className="bg-white/80 hover:bg-white border-gray-200"
                                        >
                                            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>{isFullscreen ? "Exit Fullscreen" : "Fullscreen"}</TooltipContent>
                                </Tooltip>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="p-0">
                        {/* Toolbar */}
                        <div className="border-b bg-gray-50/80 p-4 flex items-center justify-between flex-wrap gap-3">
                            <div className="flex items-center gap-3">
                                <Select value={editorMode} onValueChange={(value: any) => handleModeChange(value)}>
                                    <SelectTrigger className="h-9 w-[140px] bg-white border-gray-200">
                                        <div className="flex items-center">
                                            {getModeIcon(editorMode)}
                                            <SelectValue className="ml-2" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="tree">
                                            <div className="flex items-center">
                                                <Braces className="h-4 w-4 mr-2" />
                                                Tree
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="code">
                                            <div className="flex items-center">
                                                <Code className="h-4 w-4 mr-2" />
                                                Code
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="view">
                                            <div className="flex items-center">
                                                <Eye className="h-4 w-4 mr-2" />
                                                View
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="form">
                                            <div className="flex items-center">
                                                <Settings className="h-4 w-4 mr-2" />
                                                Form
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="text">
                                            <div className="flex items-center">
                                                <FileJson className="h-4 w-4 mr-2" />
                                                Text
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="outline" size="sm" onClick={handleFormatJson} className="bg-white border-gray-200">
                                            <RefreshCw className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Format JSON</TooltipContent>
                                </Tooltip>
                            </div>

                            <div className="flex items-center gap-2">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="outline" size="sm" onClick={handleCopyJson} className="bg-white border-gray-200">
                                            {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>{copied ? "Copied!" : "Copy JSON"}</TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleDownloadJson}
                                            className="bg-white border-gray-200"
                                        >
                                            <Download className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Download JSON</TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <label className="cursor-pointer">
                                            <Button variant="outline" size="sm" asChild className="bg-white border-gray-200">
                                                <div>
                                                    <Upload className="h-4 w-4" />
                                                    <input
                                                        type="file"
                                                        accept=".json"
                                                        className="hidden"
                                                        onChange={handleUploadJson}
                                                        onClick={(e) => (e.currentTarget.value = "")}
                                                    />
                                                </div>
                                            </Button>
                                        </label>
                                    </TooltipTrigger>
                                    <TooltipContent>Upload JSON</TooltipContent>
                                </Tooltip>
                            </div>
                        </div>

                        {/* Tabs */}
                        <Tabs defaultValue="editor" value={selectedTab} onValueChange={setSelectedTab} className="w-full">
                            <div className="px-4 pt-4">
                                <TabsList className="grid w-full grid-cols-2 mb-4 bg-gray-100">
                                    <TabsTrigger value="editor" className="flex items-center data-[state=active]:bg-white">
                                        <Code className="mr-2 h-4 w-4" />
                                        JSON Editor
                                    </TabsTrigger>
                                    <TabsTrigger value="mongo" className="flex items-center data-[state=active]:bg-white">
                                        <Database className="mr-2 h-4 w-4" />
                                        Mongo View
                                    </TabsTrigger>
                                </TabsList>
                            </div>

                            <TabsContent value="editor" className="m-0 px-4 pb-4">
                                <div
                                    ref={containerRef}
                                    className="rounded-lg overflow-hidden"
                                    style={{ height: isFullscreen ? "calc(100vh - 280px)" : "500px" }}
                                />
                            </TabsContent>

                            <TabsContent value="mongo" className="m-0 px-4 pb-4">
                                <div
                                    className="bg-white p-6 text-sm font-mono rounded-lg border border-gray-200 overflow-auto shadow-inner"
                                    style={{ height: isFullscreen ? "calc(100vh - 280px)" : "500px" }}
                                >
                                    <div className="space-y-2">{renderMongoView(json)}</div>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </TooltipProvider>
    )
}

export default JsonEditorPage
