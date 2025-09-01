"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Path } from "@/constants/path.constant"


const pathNames: Record<string, string> = {
    [Path.DASHBOARD]: "Trang chủ",
    [Path.MANAGE_ORDERS]: "Quản lý đơn hàng",
    [Path.MANAGE_DEVICES]: "Quản lý thiết bị",
    [Path.MANAGE_KIOSKS]: "Quản lý kiosk",
    [Path.MANAGE_PRODUCTS]: "Quản lý sản phẩm",
    [Path.MANAGE_WORKFLOWS]: "Quản lý quy trình",
    [Path.MANAGE_MENUS]: "Quản lý menu",
    [Path.MANAGE_ORGANIZATIONS]: "Quản lý tổ chức",
    [Path.MANAGE_STORES]: "Quản lý cửa hàng",
    [Path.PROFILE]: "Hồ sơ cá nhân",
    [Path.MANAGE_LOCATION_TYPES]: "Quản lý loại vị trí",
    [Path.MANAGE_DEVICE_TYPES]: "Quản lý loại thiết bị",
    [Path.MANAGE_DEVICE_MODELS]: "Quản lý mẫu thiết bị",
    [Path.MANAGE_KIOSK_VERSIONS]: "Quản lý phiên bản kiosk",
    [Path.MANAGE_KIOSK_TYPES]: "Quản lý loại kiosk",
    [Path.CREATE_WORKFLOW]: "Tạo quy trình",
    [Path.UPDATE_WORKFLOW]: "Cập nhật quy trình",
    [Path.MANAGE_ACCOUNTS]: "Quản lý tài khoản",
    [Path.MANAGE_SYNC_EVENT]: "Quản lý sự kiện đồng bộ",
    [Path.MANAGE_SYNC_TASKS]: "Quản lý tác vụ đồng bộ",
    [Path.MANAGE_CATEGORIES]: "Quản lý danh mục",
    [Path.MANAGE_INGREDIENT_TYPE]: "Quản lý loại nguyên liệu",
    [Path.MANAGE_NOTIFICATIONS]: "Quản lý thông báo",
}

interface Suggestion {
    path: string
    name: string
}

const highlightText = (text: string, query: string) => {
    if (!query) return text

    const regex = new RegExp(`(${query})`, "gi")
    const parts = text.split(regex)

    return parts.map((part, index) =>
        regex.test(part) ? (
            <span key={index} className="bg-blue-200 text-blue-800 font-medium">
                {part}
            </span>
        ) : (
            part
        ),
    )
}

const AdminSearchbar = () => {
    const [query, setQuery] = useState("")
    const [isOpen, setIsOpen] = useState(false)
    const [selectedIndex, setSelectedIndex] = useState(-1)
    const inputRef = useRef<HTMLInputElement>(null)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const router = useRouter()

    const suggestions: Suggestion[] = Object.entries(pathNames).map(([path, name]) => ({
        path,
        name,
    }))

    const filteredSuggestions = suggestions.filter((suggestion) =>
        suggestion.name.toLowerCase().includes(query.toLowerCase()),
    )

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setQuery(value)
        setIsOpen(value.length > 0)
        setSelectedIndex(-1)
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen) return

        switch (e.key) {
            case "ArrowDown":
                e.preventDefault()
                setSelectedIndex((prev) => (prev < filteredSuggestions.length - 1 ? prev + 1 : prev))
                break
            case "ArrowUp":
                e.preventDefault()
                setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
                break
            case "Enter":
                e.preventDefault()
                if (selectedIndex >= 0) {
                    handleSelect(filteredSuggestions[selectedIndex])
                }
                break
            case "Escape":
                setIsOpen(false)
                setSelectedIndex(-1)
                break
        }
    }

    const handleSelect = (suggestion: Suggestion) => {
        setQuery(suggestion.name)
        setIsOpen(false)
        setSelectedIndex(-1)
        router.push(suggestion.path)
    }

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
                setSelectedIndex(-1)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    return (
        <div className="min-w-[60%] relative flex items-center border rounded-full" ref={dropdownRef}>
            <Button
                type="submit"
                size="sm"
                variant="ghost"
                className="absolute left-0 h-full rounded-l-none bg-transparent hover:bg-transparent z-10"
            >
                <Search className="size-4" />
                <span className="sr-only">Tìm kiếm</span>
            </Button>

            <Input
                ref={inputRef}
                type="text"
                placeholder="Tìm kiếm trang..."
                className="flex-grow bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 ml-6"
                value={query}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                autoComplete="off"
            />

            {isOpen && filteredSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                    {filteredSuggestions.map((suggestion, index) => (
                        <div
                            key={suggestion.path}
                            className={`px-4 py-2 cursor-pointer hover:bg-gray-50 ${index === selectedIndex ? "bg-blue-50 border-l-2 border-blue-500" : ""
                                }`}
                            onClick={() => handleSelect(suggestion)}
                        >
                            <div className="text-sm font-medium text-gray-900">{highlightText(suggestion.name, query)}</div>
                            <div className="text-xs text-gray-500 mt-1">{suggestion.path}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default AdminSearchbar
