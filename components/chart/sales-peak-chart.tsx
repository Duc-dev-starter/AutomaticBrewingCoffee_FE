import React from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    ReferenceDot,
    CartesianGrid,
} from "recharts";
import { Card, CardHeader, CardContent } from "../ui/card"; // nếu dùng shadcn/ui

interface SalesData {
    time: string;
    sales: number;
}

const mockData: SalesData[] = [
    { time: "06:00", sales: 10 },
    { time: "07:00", sales: 20 },
    { time: "08:00", sales: 45 },
    { time: "09:00", sales: 80 },
    { time: "10:00", sales: 65 },
    { time: "11:00", sales: 90 },
    { time: "12:00", sales: 50 },
    { time: "13:00", sales: 70 },
    { time: "14:00", sales: 120 },
    { time: "15:00", sales: 90 },
    { time: "16:00", sales: 60 },
    { time: "17:00", sales: 40 },
    { time: "18:00", sales: 20 },
    { time: "19:00", sales: 15 },
    { time: "20:00", sales: 5 },
];

const SalesPeakChart: React.FC = () => {
    const peak = mockData.reduce((prev, curr) =>
        curr.sales > prev.sales ? curr : prev
    );

    return (
        <Card className="w-full">
            <CardHeader className="text-xl font-semibold">Doanh số bán hàng cao nhất mỗi giờ</CardHeader>
            <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={mockData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="sales" stroke="#8884d8" strokeWidth={2} />
                        <ReferenceDot
                            x={peak.time}
                            y={peak.sales}
                            r={6}
                            fill="red"
                            stroke="white"
                            strokeWidth={2}
                            label={{
                                position: "top",
                                value: `🔥 Peak: ${peak.sales}`,
                                fill: "red",
                                fontSize: 12,
                            }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};

export default SalesPeakChart;
