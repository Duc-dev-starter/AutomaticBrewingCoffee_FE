"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Plus } from 'lucide-react'
import { Badge } from "@/components/ui/badge"

interface DynamicOptionsInputProps {
    label: string
    value: string[] | null
    onChange: (options: string[] | null) => void
    placeholder?: string
    disabled?: boolean
}

export function DynamicOptionsInput({
    label,
    value,
    onChange,
    placeholder = "Nhập tùy chọn",
    disabled = false,
}: DynamicOptionsInputProps) {
    const [inputValue, setInputValue] = useState("")
    const options = value || []

    const addOption = () => {
        if (inputValue.trim() && !options.includes(inputValue.trim())) {
            const newOptions = [...options, inputValue.trim()]
            onChange(newOptions.length > 0 ? newOptions : null)
            setInputValue("")
        }
    }

    const removeOption = (optionToRemove: string) => {
        const newOptions = options.filter(option => option !== optionToRemove)
        onChange(newOptions.length > 0 ? newOptions : null)
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault()
            addOption()
        }
    }

    return (
        <div className="space-y-2">
            <Label>{label}</Label>

            {/* Display existing options */}
            {options.length > 0 && (
                <div className="flex flex-wrap gap-2 p-2 border rounded-md bg-muted/20">
                    {options.map((option, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            {option}
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                                onClick={() => removeOption(option)}
                                disabled={disabled}
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        </Badge>
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
                    disabled={disabled || !inputValue.trim() || options.includes(inputValue.trim())}
                    size="sm"
                >
                    <Plus className="h-4 w-4" />
                </Button>
            </div>

            {inputValue.trim() && options.includes(inputValue.trim()) && (
                <p className="text-sm text-amber-600">Tùy chọn này đã tồn tại</p>
            )}
        </div>
    )
}
