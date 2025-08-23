export const formatDate = (dateString: string) => {
    if (!dateString) return "Chưa có"
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date)
}

// Format time to display in a readable format
export const formatTime = (date: Date): string => {
    return new Intl.DateTimeFormat("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
    }).format(date)
}