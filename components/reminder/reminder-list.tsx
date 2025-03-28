"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react"

interface Reminder {
    id: string
    title: string
    description: string
    date: string
    time: string
    priority: "low" | "medium" | "high"
}

interface ReminderListProps {
    reminders: Reminder[]
    onEdit: (reminder: Reminder) => void
    onDelete: (id: string) => void
}

export default function ReminderList({ reminders, onEdit, onDelete }: ReminderListProps) {
    if (reminders.length === 0) {
        return <div className="text-center py-8 text-muted-foreground">Không có nhắc nhở nào cho ngày này</div>
    }

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "high":
                return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
            case "medium":
                return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
            default:
                return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
        }
    }

    const getPriorityText = (priority: string) => {
        switch (priority) {
            case "high":
                return "Cao"
            case "medium":
                return "Trung bình"
            default:
                return "Thấp"
        }
    }

    return (
        <div className="space-y-3">
            {reminders.map((reminder) => (
                <Card key={reminder.id} className="overflow-hidden">
                    <CardContent className="p-0">
                        <div className="p-4">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-semibold text-lg">{reminder.title}</h3>
                                <div className="flex space-x-1">
                                    <Button variant="ghost" size="icon" onClick={() => onEdit(reminder)} className="h-8 w-8">
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onDelete(reminder.id)}
                                        className="h-8 w-8 text-destructive"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <p className="text-sm text-muted-foreground mb-2">{reminder.description}</p>

                            <div className="flex flex-wrap gap-2 mt-3">
                                <span className="text-xs px-2 py-1 rounded bg-secondary text-secondary-foreground">
                                    {reminder.time}
                                </span>
                                <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(reminder.priority)}`}>
                                    {getPriorityText(reminder.priority)}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

