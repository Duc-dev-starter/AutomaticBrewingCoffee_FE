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