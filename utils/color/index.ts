import { EDeviceStatus } from "@/enum/device"
import { EOrderStatus, EPaymentGateway } from "@/enum/order"
import { EProductSize, EProductStatus, EProductType } from "@/enum/product"

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

// Xác định màu sắc cho trạng thái sản phẩm
export const getProductStatusColor = (status: EProductStatus) => {
    switch (status) {
        case EProductStatus.Selling:
            return "bg-green-500"
        case EProductStatus.UnSelling:
            return "bg-red-500"
        default:
            return "bg-gray-500"
    }
}

// Xác định màu sắc cho loại sản phẩm
export const getProductTypeColor = (type: EProductType) => {
    switch (type) {
        case EProductType.Single:
            return "bg-blue-500"
        case EProductType.Parent:
            return "bg-purple-500"
        case EProductType.Child:
            return "bg-amber-500"
        default:
            return "bg-gray-500"
    }
}

// Xác định màu sắc cho kích thước sản phẩm
export const getProductSizeColor = (size: EProductSize) => {
    switch (size) {
        case EProductSize.S:
            return "bg-green-500"
        case EProductSize.M:
            return "bg-blue-500"
        case EProductSize.L:
            return "bg-purple-500"
        default:
            return "bg-gray-500"
    }
}


// Xác định màu sắc cho trạng thái thiết bị
export const getDeviceStatusColor = (status: EDeviceStatus) => {
    switch (status) {
        case EDeviceStatus.Idle:
            return "bg-green-500"
        case EDeviceStatus.Working:
            return "bg-blue-500"
        case EDeviceStatus.Repair:
            return "bg-yellow-500"
        case EDeviceStatus.Broken:
            return "bg-red-500"
        default:
            return "bg-gray-500"
    }
}
