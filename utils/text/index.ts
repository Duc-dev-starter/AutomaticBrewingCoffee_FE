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

// truncate ở giữa: giữ đầu 8 ký tự, cuối 6 ký tự
export const truncateMiddle = (str: string, front: number = 8, back: number = 6) => {
    if (!str) return ""
    if (str.length <= front + back) return str
    return `${str.slice(0, front)}...${str.slice(-back)}`
}

