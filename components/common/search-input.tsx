"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Search, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

type SearchInputProps = {
    loading?: boolean
    placeHolderText?: string
    searchValue: string
    setSearchValue: (value: string) => void
    className?: string
    onSubmit?: () => void
}

export const SearchInput: React.FC<SearchInputProps> = ({
    loading = false,
    placeHolderText = "Tìm kiếm...",
    searchValue,
    setSearchValue,
    className,
    onSubmit,
}) => {
    const [isFocused, setIsFocused] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    const handleClear = () => {
        setSearchValue("")
        if (inputRef.current) {
            inputRef.current.focus()
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && onSubmit) {
            onSubmit()
        }
    }

    return (
        <div
            className={cn(
                "group relative flex h-10 items-center overflow-hidden rounded-full transition-all duration-300",
                isFocused
                    ? "border-[#68e0df] bg-white shadow-[0_0_0_2px_rgba(104,224,223,0.3)] dark:bg-[#1a1a1a]"
                    : "border border-gray-200 bg-white/80 hover:border-[#a5edec] dark:border-gray-700 dark:bg-[#1a1a1a]/80 dark:hover:border-[#295959]",
                className,
            )}
        >
            <div
                className={cn(
                    "flex h-full items-center justify-center pl-3 text-gray-400 transition-colors duration-200",
                    isFocused ? "text-[#68e0df]" : "group-hover:text-[#a5edec] dark:group-hover:text-[#68e0df]",
                )}
            >
                {loading ? (
                    <div className="w-5 h-5">
                        <Skeleton className="h-5 w-5 rounded-full" />
                    </div>
                ) : (
                    <Search className="h-5 w-5" />
                )}
            </div>

            <input
                ref={inputRef}
                type="text"
                placeholder={placeHolderText}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onKeyDown={handleKeyDown}
                className="h-full flex-1 border-0 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-gray-400 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-50"
            />

            {searchValue && !loading && (
                <button
                    onClick={handleClear}
                    className="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-[#e1f9f9] hover:text-[#3f8786] dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-[#1a3333] dark:hover:text-[#68e0df]"
                    type="button"
                >
                    <X className="h-3.5 w-3.5" />
                    <span className="sr-only">Xóa tìm kiếm</span>
                </button>
            )}
        </div>
    )
}
