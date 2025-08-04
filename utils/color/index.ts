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
            return "bg-gray-500"
        case EOrderStatus.Preparing:
            return "bg-blue-500"
        case EOrderStatus.Failed:
            return "bg-red-600"
        default:
            return "bg-gray-500"
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
        case EDeviceStatus.Stock:
            return "bg-green-500"
        case EDeviceStatus.Working:
            return "bg-primary-300"
        case EDeviceStatus.Maintain:
            return "bg-yellow-500"
        default:
            return "bg-gray-500"
    }
}


export const getBaseStatusColor = (status: string) => {
    switch (status) {
        case "Active":
            return "bg-green-100 text-green-800 border-green-200"
        case "Inactive":
            return "bg-red-100 text-red-800 border-red-200"
        default:
            return "bg-gray-100 text-gray-800 border-gray-200"
    }
}