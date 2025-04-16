export const textPieChart = (value: string) => {
    switch (value) {
        case "finished":
            return "Hoàn tất"
        case "rejected":
            return "Hủy đơn"
        case "pending":
            return "Đang đợi"
        default:
            return "Chưa rõ"
    }
}


export function truncateText(text: string | null | undefined, maxLength: number): string {
    if (!text) return "";
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
}
