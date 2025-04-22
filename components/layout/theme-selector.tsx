"use client"

import * as React from "react"
import { Monitor, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"

type ThemeOption = {
    value: string
    label: string
    icon: React.ReactNode
}

export function ThemeSelector() {
    const { theme, setTheme, resolvedTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    const themes: ThemeOption[] = [
        {
            value: "system",
            label: "Hệ thống",
            icon: <Monitor className="h-4 w-4" />,
        },
        {
            value: "light",
            label: "Sáng",
            icon: <Sun className="h-4 w-4" />,
        },
        {
            value: "dark",
            label: "Tối",
            icon: <Moon className="h-4 w-4" />,
        },
    ]

    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return null
    }

    return (
        <div className="flex items-center justify-between">
            <p className="mr-16">Theme</p>
            <div className="flex flex-1 justify-end">
                <div className="flex items-center gap-1 rounded-md border p-1">
                    {themes.map((option) => (
                        <TooltipProvider key={option.value}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className={cn(
                                            "h-8 w-8 rounded-md",
                                            theme === option.value && "bg-muted"
                                        )}
                                        onClick={() => setTheme(option.value)}
                                    >
                                        {option.icon}
                                        <span className="sr-only">{option.label}</span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom">
                                    <p>{option.label}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    ))}
                </div>
            </div>
        </div>

    )
}
