// Translate status to Vietnamese
export const translateStatus = (status: string): string => {
    switch (status) {
        case "completed":
            return "Hoàn thành"
        case "pending":
            return "Đang xử lý"
        case "failed":
            return "Thất bại"
        default:
            return status
    }
}