"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import { Reminder } from "@/types"


interface ReminderFormProps {
    initialData: Reminder | null
    onSave: (reminder: Reminder) => void
    onCancel: () => void
    selectedDate?: Date
}

export default function ReminderForm({ initialData, onSave, onCancel, selectedDate }: ReminderFormProps) {
    const [title, setTitle] = useState(initialData?.title || "")
    const [description, setDescription] = useState(initialData?.description || "")
    const [date, setDate] = useState(
        initialData?.date || (selectedDate ? format(selectedDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd")),
    )
    const [time, setTime] = useState(initialData?.time || format(new Date(), "HH:mm"))
    const [priority, setPriority] = useState<"low" | "medium" | "high">(initialData?.priority || "medium")

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        const reminder: Reminder = {
            id: initialData?.id || crypto.randomUUID(),
            title,
            description,
            date,
            time,
            priority,
        }

        onSave(reminder)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-xl font-bold mb-4">{initialData ? "Chỉnh sửa nhắc nhở" : "Thêm nhắc nhở mới"}</h2>

            <div className="space-y-2">
                <Label htmlFor="title">Tiêu đề</Label>
                <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Nhập tiêu đề nhắc nhở"
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Nhập mô tả chi tiết"
                    rows={3}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="date">Ngày</Label>
                    <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="time">Thời gian</Label>
                    <Input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="priority">Mức độ ưu tiên</Label>
                <Select value={priority} onValueChange={(value: "low" | "medium" | "high") => setPriority(value)}>
                    <SelectTrigger>
                        <SelectValue placeholder="Chọn mức độ ưu tiên" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="low">Thấp</SelectItem>
                        <SelectItem value="medium">Trung bình</SelectItem>
                        <SelectItem value="high">Cao</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Hủy bỏ
                </Button>
                <Button type="submit">{initialData ? "Cập nhật" : "Thêm mới"}</Button>
            </div>
        </form>
    )
}

