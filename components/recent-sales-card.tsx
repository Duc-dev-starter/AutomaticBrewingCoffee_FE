import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const salesData = [
    { product: "Trà đào", amount: "25.000đ", time: "23/03/2025 10:45", paymentMethod: "Momo" },
    { product: "Cà phê sữa", amount: "20.000đ", time: "23/03/2025 10:50", paymentMethod: "Tiền mặt" },
    { product: "Nước cam", amount: "30.000đ", time: "23/03/2025 11:00", paymentMethod: "Thẻ" },
    { product: "Sữa tươi trân châu", amount: "35.000đ", time: "23/03/2025 11:15", paymentMethod: "ZaloPay" },
];

export default function RecentSalesCard() {
    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle>Giao dịch gần đây</CardTitle>
                <p className="text-sm text-muted-foreground">{salesData.length} đơn gần nhất.</p>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {salesData.map((sale, index) => (
                        <div key={index} className="flex flex-col border-b pb-3">
                            <div className="flex justify-between items-center">
                                <p className="font-medium">{sale.product}</p>
                                <p className="font-semibold text-green-600">+{sale.amount}</p>
                            </div>
                            <div className="text-sm text-muted-foreground flex justify-between">
                                <span>{sale.time}</span>
                                <span>{sale.paymentMethod}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
