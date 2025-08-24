"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ChevronRight, Code2, Hash, Type, ToggleLeft, AlertTriangle, Copy, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

interface ParametersDisplayProps {
    parameters: string
    className?: string
    compact?: boolean
}

export function ParametersDisplay({ parameters, className, compact = false }: ParametersDisplayProps) {
    const [isOpen, setIsOpen] = useState(!compact)
    const [copied, setCopied] = useState(false)
    const { toast } = useToast()

    // Parse JSON parameters
    const parseParameters = () => {
        try {
            return JSON.parse(parameters)
        } catch {
            return null
        }
    }

    const parsedParams = parseParameters()

    // Copy to clipboard
    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(parameters)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
            toast({
                title: "Đã sao chép",
                description: "Parameters đã được sao chép vào clipboard",
            })
        } catch {
            toast({
                title: "Lỗi",
                description: "Không thể sao chép parameters",
                variant: "destructive",
            })
        }
    }

    // Get icon for parameter type
    const getTypeIcon = (value: any) => {
        if (typeof value === "string") return <Type className="h-3 w-3" />
        if (typeof value === "number") return <Hash className="h-3 w-3" />
        if (typeof value === "boolean") return <ToggleLeft className="h-3 w-3" />
        return <Code2 className="h-3 w-3" />
    }

    // Get type color
    const getTypeColor = (value: any) => {
        if (typeof value === "string") return "text-blue-600 bg-blue-50 border-blue-200"
        if (typeof value === "number") return "text-green-600 bg-green-50 border-green-200"
        if (typeof value === "boolean") return "text-purple-600 bg-purple-50 border-purple-200"
        return "text-gray-600 bg-gray-50 border-gray-200"
    }

    // Format value display
    const formatValue = (value: any) => {
        if (typeof value === "string") return `"${value}"`
        if (typeof value === "boolean") return value ? "true" : "false"
        return String(value)
    }

    if (!parsedParams) {
        return (
            <Card className={cn("border-red-200 bg-red-50", className)}>
                <CardContent className="p-3">
                    <div className="flex items-center gap-2 text-red-600">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="text-sm font-medium">JSON không hợp lệ</span>
                    </div>
                    <pre className="text-xs text-red-500 mt-2 whitespace-pre-wrap break-all">{parameters}</pre>
                </CardContent>
            </Card>
        )
    }

    const paramEntries = Object.entries(parsedParams)

    if (paramEntries.length === 0) {
        return (
            <Card className={cn("border-gray-200 bg-gray-50", className)}>
                <CardContent className="p-3">
                    <div className="flex items-center gap-2 text-gray-500">
                        <Code2 className="h-4 w-4" />
                        <span className="text-sm">Chưa có tham số</span>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className={cn("border-blue-200 bg-blue-50/30", className)}>
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                <div className="p-3 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Code2 className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-700">Tham số ({paramEntries.length})</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 hover:bg-blue-200"
                            onClick={handleCopy}
                        >
                            {copied ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3 text-blue-600" />}
                        </Button>
                        <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-blue-200">
                                {isOpen ? <ChevronDown className="h-4 w-4 text-blue-600" /> : <ChevronRight className="h-4 w-4 text-blue-600" />}
                            </Button>
                        </CollapsibleTrigger>
                    </div>
                </div>
                <CollapsibleContent>
                    <div className="px-3 pb-3 space-y-2">
                        {paramEntries.map(([key, value], index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between p-2 bg-white rounded-md border border-gray-200 hover:border-blue-300 transition-colors"
                            >
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                    <Badge variant="outline" className={cn("text-xs", getTypeColor(value))}>
                                        {getTypeIcon(value)}
                                        <span className="ml-1">
                                            {typeof value === "string"
                                                ? "Text"
                                                : typeof value === "number"
                                                    ? "Number"
                                                    : typeof value === "boolean"
                                                        ? "Boolean"
                                                        : "Object"}
                                        </span>
                                    </Badge>
                                    <span className="font-medium text-gray-700 truncate">{key}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <code className="text-sm bg-gray-100 px-2 py-1 rounded text-gray-800 max-w-[200px] truncate">
                                        {formatValue(value)}
                                    </code>
                                </div>
                            </div>
                        ))}
                    </div>
                </CollapsibleContent>
            </Collapsible>
        </Card>
    )
}