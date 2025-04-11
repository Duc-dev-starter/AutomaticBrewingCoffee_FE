import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Coffee } from "lucide-react"

export default function ForgotPasswordPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-sky-400 to-sky-200 p-4">
            <div className="w-full max-w-md">
                <div className="flex flex-col items-center justify-center mb-6">
                    <div className="flex items-center justify-center h-16 w-16 rounded-full bg-sky-600 mb-4">
                        <Coffee className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-center text-sky-900">Automatic Brewing Coffee</h1>
                    <p className="text-sky-700 text-sm">Hệ thống quản trị</p>
                </div>

                <Card className="border-0 shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-2xl text-center">Khôi phục mật khẩu</CardTitle>
                        <CardDescription className="text-center">
                            Nhập email của bạn để nhận hướng dẫn đặt lại mật khẩu
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form>
                            <div className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" placeholder="admin@example.com" required />
                                </div>
                                <Button className="w-full bg-sky-600 hover:bg-sky-700">Gửi hướng dẫn đặt lại</Button>
                            </div>
                        </form>
                    </CardContent>
                    <CardFooter>
                        <div className="text-center w-full">
                            <Link href="/login" className="flex items-center justify-center text-sm text-sky-600 hover:text-sky-800">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Quay lại trang đăng nhập
                            </Link>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}

