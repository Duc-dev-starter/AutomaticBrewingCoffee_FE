"use client"

import { AlertTriangle, ArrowLeft, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Path } from "@/constants/path"

export default function InvalidRequestPage() {
    const handleBackToDashboard = () => {
        window.location.href = Path.DASHBOARD
    }

    const handleGoHome = () => {
        window.location.href = Path.HOME
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center p-4">
            <Card className="w-full max-w-md mx-auto shadow-lg border-0">
                <CardHeader className="text-center pb-4">
                    <div className="mx-auto w-16 h-16 bg-primary-300 rounded-full flex items-center justify-center mb-4">
                        <AlertTriangle className="w-8 h-8 text-primary-500" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900">Yêu cầu không hợp lệ</CardTitle>
                    <CardDescription className="text-gray-600 mt-2">
                        Bạn đã đăng nhập rồi và không thể truy cập trang đăng nhập
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    <div className="bg-primary-100 border border-primary-300 rounded-lg p-4">
                        <p className="text-sm text-primary-500 text-center">
                            <strong>Thông báo:</strong> Phiên đăng nhập của bạn vẫn còn hiệu lực. Vui lòng quay lại dashboard để tiếp
                            tục sử dụng.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <Button
                            onClick={handleBackToDashboard}
                            className="w-full bg-primary hover:bg-primary-400 text-primary-foreground"
                            size="lg"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Quay lại Dashboard
                        </Button>

                        <Button
                            onClick={handleGoHome}
                            variant="outline"
                            className="w-full border-primary-300 text-primary-500 hover:bg-primary-100"
                            size="lg"
                        >
                            <Home className="w-4 h-4 mr-2" />
                            Về trang chủ
                        </Button>
                    </div>

                    <div className="text-center pt-4">
                        <p className="text-xs text-gray-500">Nếu bạn gặp vấn đề, vui lòng liên hệ bộ phận hỗ trợ</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
