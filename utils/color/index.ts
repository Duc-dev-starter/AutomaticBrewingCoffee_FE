import { EOrderStatus, EPaymentGateway } from "@/enum/order"

// Xác định màu sắc cho trạng thái đơn hàng
export const getOrderStatusColor = (status: string) => {
    switch (status) {
        case EOrderStatus.Completed:
            return "bg-green-500"
        case EOrderStatus.Pending:
            return "bg-yellow-500"
        case EOrderStatus.Cancelled:
            return "bg-red-500"
        case EOrderStatus.Preparing:
            return "bg-blue-500"
        case EOrderStatus.Ready:
            return "bg-purple-500"
        case EOrderStatus.Failed:
            return "bg-red-700"
        default:
            return "bg-gray-500"
    }
}

// Xác định màu sắc cho loại thanh toán
export const getPaymentColor = (method: string) => {
    switch (method) {
        case EPaymentGateway.MoMo:
            return "bg-gradient-to-r from-white to-pink-400 text-black"
        case EPaymentGateway.VNPay:
            return "bg-gradient-to-r from-red-500 to-blue-500 text-white"
        default:
            return "bg-gray-500 text-white"
    }
}

