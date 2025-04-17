import { EOrderType, EPaymentGateway } from "@/enum/order";
import { z } from "zod";

// Define the form schema for validation
export const orderSchema = z.object({
    discount: z.string().refine(
        (val) => val === "" || (/^\d+$/.test(val) && Number(val) >= 0),
        "Giảm giá phải là số không âm."
    ),
    feeAmount: z.string().refine(
        (val) => val === "" || (/^\d+$/.test(val) && Number(val) >= 0),
        "Phí phải là số không âm."
    ),
    feeDescription: z.string().optional(),
    orderType: z.enum([EOrderType.Immediate, EOrderType.PreOrder], { message: "Vui lòng chọn loại đơn hàng." }),
    paymentGateway: z.enum([EPaymentGateway.MoMo, EPaymentGateway.VNPay], {
        message: "Vui lòng chọn phương thức thanh toán.",
    }),
    sessionId: z.string().min(1, "Session ID là bắt buộc."),
    callbackUrl: z.string().url("Callback URL phải là URL hợp lệ.").optional().or(z.literal("")),
    orderDetails: z
        .array(
            z.object({
                productName: z.string().min(1, "Tên sản phẩm là bắt buộc."),
                productDescription: z.string().optional(),
                quantity: z.number().min(1, "Số lượng phải lớn hơn 0."),
                sellingPrice: z.number().min(0, "Giá bán phải không âm."),
            })
        )
        .min(1, "Đơn hàng phải có ít nhất một sản phẩm."),
});