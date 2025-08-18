import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Order } from "@/interfaces/order";
import { formatDate } from "@/utils/date";

export default function RecentSalesCard({ data }: { data?: Order[] }) {
    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle>Giao dịch gần đây</CardTitle>
                <p className="text-sm text-muted-foreground">{data?.length} đơn gần nhất.</p>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {data?.map((sale) => (
                        <div key={sale.orderId} className="flex flex-col border-b pb-3">
                            <div className="flex justify-between items-center">
                                <p className="font-medium">{sale.orderCode}</p>
                                <p className="font-semibold text-green-600">+{sale.finalAmount}</p>
                            </div>
                            <div className="text-sm text-muted-foreground flex justify-between">
                                <span>{formatDate(sale.createdDate)}</span>
                                <span>{sale.paymentGateway}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
