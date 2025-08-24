"use client"

import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { ReminderForm, ReminderList } from "@/components/reminder"

export default function Home() {
    const [date, setDate] = useState<Date | undefined>(new Date())
    const [showForm, setShowForm] = useState(false)
    const [editingReminder, setEditingReminder] = useState<Reminder | null>(null)
    const [reminders, setReminders] = useState<Reminder[]>([])

    const handleDateSelect = (date: Date | undefined) => {
        setDate(date)
    }

    const handleAddReminder = () => {
        setEditingReminder(null)
        setShowForm(true)
    }

    const handleEditReminder = (reminder: Reminder) => {
        setEditingReminder(reminder)
        setShowForm(true)
    }

    const handleDeleteReminder = (id: string) => {
        setReminders(reminders.filter((reminder) => reminder.id !== id))
    }

    const handleSaveReminder = (reminder: Reminder) => {
        if (editingReminder) {
            setReminders(reminders.map((r) => (r.id === editingReminder.id ? reminder : r)))
        } else {
            setReminders([...reminders, reminder])
        }
        setShowForm(false)
        setEditingReminder(null)
    }

    const handleCancelForm = () => {
        setShowForm(false)
        setEditingReminder(null)
    }

    const filteredReminders = date
        ? reminders.filter((reminder) => new Date(reminder.date).toDateString() === date.toDateString())
        : []

    const formattedDate = date ? format(date, "EEEE, dd MMMM yyyy", { locale: vi }) : ""

    return (
        <main className="container mx-auto p-4 max-w-5xl">
            <h1 className="text-3xl font-bold mb-6 text-center">Ứng dụng Nhắc nhở</h1>

            <Tabs defaultValue="month" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="month">Xem tháng</TabsTrigger>
                    <TabsTrigger value="week">Xem tuần</TabsTrigger>
                </TabsList>

                <TabsContent value="month" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={handleDateSelect}
                                className="rounded-md border"
                                locale={vi}
                            />
                        </div>

                        <div className="space-y-4">
                            {date && (
                                <>
                                    <div className="flex justify-between items-center">
                                        <h2 className="text-xl font-semibold">{formattedDate}</h2>
                                        <button
                                            onClick={handleAddReminder}
                                            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
                                        >
                                            Thêm nhắc nhở
                                        </button>
                                    </div>

                                    <ReminderList
                                        reminders={filteredReminders}
                                        onEdit={handleEditReminder}
                                        onDelete={handleDeleteReminder}
                                    />
                                </>
                            )}
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="week" className="space-y-4">
                    <WeekView
                        reminders={reminders}
                        onAddReminder={handleAddReminder}
                        onEditReminder={handleEditReminder}
                        onDeleteReminder={handleDeleteReminder}
                        onSelectDate={handleDateSelect}
                        selectedDate={date}
                    />
                </TabsContent>
            </Tabs>

            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-background p-6 rounded-lg w-full max-w-md">
                        <ReminderForm
                            initialData={editingReminder}
                            onSave={handleSaveReminder}
                            onCancel={handleCancelForm}
                            selectedDate={date}
                        />
                    </div>
                </div>
            )}
        </main>
    )
}

interface Reminder {
    id: string
    title: string
    description: string
    date: string
    time: string
    priority: "low" | "medium" | "high"
}

interface WeekViewProps {
    reminders: Reminder[]
    onAddReminder: () => void
    onEditReminder: (reminder: Reminder) => void
    onDeleteReminder: (id: string) => void
    onSelectDate: (date: Date) => void
    selectedDate?: Date
}

function WeekView({
    reminders,
    onAddReminder,
    onEditReminder,
    onDeleteReminder,
    onSelectDate,
    selectedDate,
}: WeekViewProps) {
    const today = new Date()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay())

    const weekDays = Array.from({ length: 7 }, (_, i) => {
        const day = new Date(startOfWeek)
        day.setDate(startOfWeek.getDate() + i)
        return day
    })

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-7 gap-2">
                {weekDays.map((day, index) => {
                    const isSelected = selectedDate && day.toDateString() === selectedDate.toDateString()
                    const dayReminders = reminders.filter(
                        (reminder) => new Date(reminder.date).toDateString() === day.toDateString(),
                    )

                    return (
                        <div
                            key={index}
                            className={`border rounded-md p-2 cursor-pointer min-h-[120px] ${isSelected ? "border-primary bg-primary/10" : ""
                                }`}
                            onClick={() => onSelectDate(day)}
                        >
                            <div className="text-center mb-2">
                                <div className="text-sm text-muted-foreground">{format(day, "EEEE", { locale: vi })}</div>
                                <div className="font-semibold">{format(day, "d", { locale: vi })}</div>
                            </div>

                            <div className="space-y-1">
                                {dayReminders.length > 0 ? (
                                    dayReminders.slice(0, 2).map((reminder) => (
                                        <div
                                            key={reminder.id}
                                            className="text-xs truncate bg-secondary p-1 rounded"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                onEditReminder(reminder)
                                            }}
                                        >
                                            {reminder.title}
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-xs text-muted-foreground text-center">Chưa có nhắc nhở</div>
                                )}

                                {dayReminders.length > 2 && (
                                    <div className="text-xs text-center text-muted-foreground">
                                        +{dayReminders.length - 2} nhắc nhở khác
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>

            {selectedDate && (
                <div className="mt-4">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold">{format(selectedDate, "EEEE, dd MMMM yyyy", { locale: vi })}</h3>
                        <button
                            onClick={onAddReminder}
                            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
                        >
                            Thêm nhắc nhở
                        </button>
                    </div>

                    <ReminderList
                        reminders={reminders.filter(
                            (reminder) => new Date(reminder.date).toDateString() === selectedDate.toDateString(),
                        )}
                        onEdit={onEditReminder}
                        onDelete={onDeleteReminder}
                    />
                </div>
            )}
        </div>
    )
}

