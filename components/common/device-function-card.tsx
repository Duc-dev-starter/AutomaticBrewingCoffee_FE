"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Trash2, Plus, ChevronDown, ChevronRight, Settings } from 'lucide-react'
import { DeviceFunction } from "@/interfaces/device"
import { EBaseStatus, EBaseStatusViMap } from "@/enum/base"
import { EFunctionParameterType } from "@/enum/device"
import { DynamicOptionsInput } from "./dynamic-option-input"

interface DeviceFunctionCardProps {
    func: DeviceFunction
    index: number
    onUpdate: (index: number, field: string, value: any) => void
    onRemove: (index: number) => void
    onAddParameter: (functionIndex: number) => void
    onRemoveParameter: (functionIndex: number, paramIndex: number) => void
    onUpdateParameter: (functionIndex: number, paramIndex: number, field: string, value: any) => void
}

export function DeviceFunctionCard({
    func,
    index,
    onUpdate,
    onRemove,
    onAddParameter,
    onRemoveParameter,
    onUpdateParameter,
}: DeviceFunctionCardProps) {
    const [isOpen, setIsOpen] = useState(true)

    return (
        <Card className="border-l-4 border-l-primary">
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CollapsibleTrigger asChild>
                            <Button variant="ghost" className="p-0 h-auto font-semibold text-left">
                                <div className="flex items-center gap-2">
                                    {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                    <Settings className="h-4 w-4" />
                                    <CardTitle className="text-base">
                                        {func.name || `Chức năng ${index + 1}`}
                                    </CardTitle>
                                </div>
                            </Button>
                        </CollapsibleTrigger>
                        <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => onRemove(index)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </CardHeader>

                <CollapsibleContent>
                    <CardContent className="space-y-4">
                        {/* Function Name */}
                        <div className="space-y-2">
                            <Label htmlFor={`func-name-${index}`}>
                                Tên chức năng
                                <span className="text-red-500 ml-1">*</span>
                            </Label>
                            <Input
                                id={`func-name-${index}`}
                                value={func.name}
                                onChange={(e) => onUpdate(index, "name", e.target.value)}
                                placeholder="Nhập tên chức năng"
                            />
                        </div>

                        {/* Function Status */}
                        <div className="space-y-2">
                            <Label htmlFor={`func-status-${index}`}>Trạng thái</Label>
                            <Select
                                value={func.status}
                                onValueChange={(value) => onUpdate(index, "status", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn trạng thái" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(EBaseStatusViMap).map(([key, value]) => (
                                        <SelectItem key={key} value={key}>
                                            {value}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Function Parameters */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium">Tham số chức năng</Label>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onAddParameter(index)}
                                >
                                    <Plus className="h-4 w-4 mr-1" />
                                    Thêm tham số
                                </Button>
                            </div>

                            {func.functionParameters.length === 0 ? (
                                <div className="text-center py-4 text-muted-foreground border-2 border-dashed rounded-md">
                                    Chưa có tham số nào. Nhấn "Thêm tham số" để bắt đầu.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {func.functionParameters.map((param, paramIndex) => (
                                        <Card key={paramIndex} className="bg-muted/30">
                                            <CardHeader className="pb-2">
                                                <div className="flex items-center justify-between">
                                                    <CardTitle className="text-sm">
                                                        {param.name || `Tham số ${paramIndex + 1}`}
                                                    </CardTitle>
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => onRemoveParameter(index, paramIndex)}
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="space-y-3">
                                                <div className="grid grid-cols-2 gap-3">
                                                    {/* Parameter Name */}
                                                    <div className="space-y-2">
                                                        <Label htmlFor={`param-name-${index}-${paramIndex}`}>
                                                            Tên tham số
                                                            <span className="text-red-500 ml-1">*</span>
                                                        </Label>
                                                        <Input
                                                            id={`param-name-${index}-${paramIndex}`}
                                                            value={param.name}
                                                            onChange={(e) =>
                                                                onUpdateParameter(index, paramIndex, "name", e.target.value)
                                                            }
                                                            placeholder="Nhập tên tham số"
                                                        />
                                                    </div>

                                                    {/* Parameter Type */}
                                                    <div className="space-y-2">
                                                        <Label htmlFor={`param-type-${index}-${paramIndex}`}>Kiểu tham số</Label>
                                                        <Select
                                                            value={param.type}
                                                            onValueChange={(value) =>
                                                                onUpdateParameter(index, paramIndex, "type", value)
                                                            }
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Chọn kiểu" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {Object.values(EFunctionParameterType).map((type) => (
                                                                    <SelectItem key={type} value={type}>
                                                                        {type}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-3">
                                                    {/* Default Value */}
                                                    <div className="space-y-2">
                                                        <Label htmlFor={`param-default-${index}-${paramIndex}`}>Giá trị mặc định</Label>
                                                        {param.type === EFunctionParameterType.Boolean ? (
                                                            <Select
                                                                value={
                                                                    typeof param.default === "string"
                                                                        ? param.default
                                                                        : param.default === true
                                                                            ? "true"
                                                                            : param.default === false
                                                                                ? "false"
                                                                                : ""
                                                                }
                                                                onValueChange={(value) =>
                                                                    onUpdateParameter(index, paramIndex, "default", value === "true")
                                                                }
                                                            >
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Chọn true/false" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="true">True</SelectItem>
                                                                    <SelectItem value="false">False</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        ) : (
                                                            <Input
                                                                id={`param-default-${index}-${paramIndex}`}
                                                                value={param.default || ""}
                                                                onChange={(e) =>
                                                                    onUpdateParameter(index, paramIndex, "default", e.target.value)
                                                                }
                                                                placeholder="Nhập giá trị mặc định"
                                                            />
                                                        )}
                                                    </div>

                                                    {/* Description */}
                                                    <div className="space-y-2">
                                                        <Label htmlFor={`param-description-${index}-${paramIndex}`}>Mô tả</Label>
                                                        <Input
                                                            id={`param-description-${index}-${paramIndex}`}
                                                            value={param.description || ""}
                                                            onChange={(e) =>
                                                                onUpdateParameter(index, paramIndex, "description", e.target.value || null)
                                                            }
                                                            placeholder="Nhập mô tả"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Min/Max Values */}
                                                {(param.type === EFunctionParameterType.Double || param.type === EFunctionParameterType.Integer) && (
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div className="space-y-2">
                                                            <Label htmlFor={`param-min-${index}-${paramIndex}`}>Giá trị tối thiểu</Label>
                                                            <Input
                                                                id={`param-min-${index}-${paramIndex}`}
                                                                value={param.min || ""}
                                                                onChange={(e) =>
                                                                    onUpdateParameter(index, paramIndex, "min", e.target.value || null)
                                                                }
                                                                placeholder="Tùy chọn"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label htmlFor={`param-max-${index}-${paramIndex}`}>Giá trị tối đa</Label>
                                                            <Input
                                                                id={`param-max-${index}-${paramIndex}`}
                                                                value={param.max || ""}
                                                                onChange={(e) =>
                                                                    onUpdateParameter(index, paramIndex, "max", e.target.value || null)
                                                                }
                                                                placeholder="Tùy chọn"
                                                            />
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Dynamic Options Input */}
                                                <DynamicOptionsInput
                                                    label="Tùy chọn"
                                                    value={param.options}
                                                    onChange={(options) => onUpdateParameter(index, paramIndex, "options", options)}
                                                    placeholder="Nhập tùy chọn và nhấn Enter hoặc nút +"
                                                />
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </CollapsibleContent>
            </Collapsible>
        </Card>
    )
}
