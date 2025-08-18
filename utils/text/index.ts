export const textPieChart = (value: string) => {
    switch (value) {
        case "completed":
            return "Hoàn tất"
        case "cancelled":
            return "Hủy đơn"
        case "pending":
            return "Đang đợi"
        case "preparing":
            return "Đang chuẩn bị"
        case "failed":
            return "Thất bại"
        default:
            return "Chưa rõ"
    }
}


export function truncateText(text: string | null | undefined, maxLength: number): string {
    if (!text) return "";
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
}
