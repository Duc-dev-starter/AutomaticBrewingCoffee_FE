"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Plus } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { OptionParamter } from "@/interfaces/device"



interface DynamicOptionsInputProps {
    label: string
    value: OptionParamter[] | null
    onChange: (options: OptionParamter[] | null) => void
    placeholder?: string
    disabled?: boolean
}

export function DynamicOptionsInput({
    label,
    value,
    onChange,
    placeholder = "Nhập tên tùy chọn",
    disabled = false,
}: DynamicOptionsInputProps) {
    const [inputValue, setInputValue] = useState("")
    const options = value || []

    const addOption = () => {
        const trimmed = inputValue.trim()
        if (trimmed && !options.some(opt => opt.name === trimmed)) {
            const newOptions = [...options, { name: trimmed, description: "" }]
            onChange(newOptions.length > 0 ? newOptions : null)
            setInputValue("")
        }
    }

    const removeOption = (name: string) => {
        const newOptions = options.filter(option => option.name !== name)
        onChange(newOptions.length > 0 ? newOptions : null)
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault()
            addOption()
        }
    }

    const updateDescription = (name: string, desc: string) => {
        const newOptions = options.map(opt =>
            opt.name === name ? { ...opt, description: desc } : opt
        )
        onChange(newOptions)
    }

    return (
        <div className="space-y-2">
            <Label>{label}</Label>

            {/* Display existing options */}
            {options.length > 0 && (
                <div className="flex flex-col gap-2 p-2 border rounded-md bg-muted/20">
                    {options.map((option, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <Badge variant="secondary" className="flex items-center gap-1">
                                {option.name}
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                                    onClick={() => removeOption(option.name)}
                                    disabled={disabled}
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            </Badge>
                            <Input
                                className="flex-1"
                                placeholder="Mô tả..."
                                value={option.description || ""}
                                onChange={(e) => updateDescription(option.name, e.target.value)}
                                disabled={disabled}
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* Input for new option */}
            <div className="flex gap-2">
                <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={placeholder}
                    disabled={disabled}
                />
                <Button
                    type="button"
                    onClick={addOption}
                    disabled={
                        disabled ||
                        !inputValue.trim() ||
                        options.some(opt => opt.name === inputValue.trim())
                    }
                    size="sm"
                >
                    <Plus className="h-4 w-4" />
                </Button>
            </div>

            {inputValue.trim() &&
                options.some(opt => opt.name === inputValue.trim()) && (
                    <p className="text-sm text-amber-600">Tùy chọn này đã tồn tại</p>
                )}
        </div>
    )
}
