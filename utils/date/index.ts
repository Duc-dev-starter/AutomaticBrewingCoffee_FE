// Format date to display in a readable format
export const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(date)
}

// Format time to display in a readable format
export const formatTime = (date: Date): string => {
    return new Intl.DateTimeFormat("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
    }).format(date)
}