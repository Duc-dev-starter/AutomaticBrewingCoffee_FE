"use client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Key, User } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { type ChangePasswordFormData, changePasswordSchema } from "@/schema/auth.schema"
import { changePassword } from "@/services/auth.service"
import { toast } from "@/hooks/use-toast"
import { useAppStore } from "@/stores/use-app-store"

const Profile = () => {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<ChangePasswordFormData>({
        resolver: zodResolver(changePasswordSchema),
    })

    const { account } = useAppStore()

    const getInitials = (fullName: string) => {
        const names = fullName.split(" ")
        return names.length >= 2 ? `${names[0][0]}${names[names.length - 1][0]}` : fullName.substring(0, 2)
    }

    const formatRoleName = (roleName: string) => {
        switch (roleName) {
            case "Organization":
                return "Tổ chức"
            case "Admin":
                return "Quản trị viên"
            default:
                return roleName
        }
    }

    const onChangePassword = async (data: ChangePasswordFormData) => {
        try {
            await changePassword({
                oldPassword: data.currentPassword,
                newPassword: data.newPassword,
            })
            toast({
                title: "Thành công",
                description: `Đổi mật khẩu thành công`,
            })
        } catch (err) {
            console.error(err)
            toast({
                title: "Lỗi",
                description: "Không thể đổi mật khẩu.",
                variant: "destructive",
            })
        } finally {
            reset()
        }
    }

    if (!account) {
        return (
            <div className="container mx-auto py-8">
                <div className="flex items-center justify-center">
                    <p>Đang tải thông tin tài khoản...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-8">
            <div className="grid gap-8 md:grid-cols-4">
                <div className="md:col-span-1">
                    <Card>
                        <CardHeader className="pb-2">
                            <div className="flex flex-col items-center">
                                <Avatar className="h-24 w-24">
                                    <AvatarImage src="/placeholder.svg?height=96&width=96" alt={account.fullName} />
                                    <AvatarFallback>{getInitials(account.fullName)}</AvatarFallback>
                                </Avatar>
                                <CardTitle className="mt-4 text-xl">{account.fullName}</CardTitle>
                                <CardDescription>{formatRoleName(account.roleName)}</CardDescription>
                                <div className="mt-2">
                                    <span
                                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${account.status === "Active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                            }`}
                                    >
                                        {account.status === "Active" ? "Hoạt động" : "Không hoạt động"}
                                    </span>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="text-center">
                            <div className="mt-2 text-sm text-muted-foreground">
                                <p>ID: {account.accountId}</p>
                                {account.isBanned && <p className="text-red-600 font-medium">Tài khoản bị cấm</p>}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="md:col-span-3">
                    <Tabs defaultValue="account" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="account">
                                <User className="mr-2 h-4 w-4" />
                                Cập Nhật Tài Khoản
                            </TabsTrigger>
                            <TabsTrigger value="password">
                                <Key className="mr-2 h-4 w-4" />
                                Đổi Mật Khẩu
                            </TabsTrigger>
                        </TabsList>

                        {/* Tab Cập nhật tài khoản */}
                        <TabsContent value="account" className="mt-6 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Thông Tin Cá Nhân</CardTitle>
                                    <CardDescription>Cập nhật chi tiết tài khoản và thông tin cá nhân của bạn</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="fullName">Họ và Tên</Label>
                                        <Input id="fullName" defaultValue={account.fullName} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input id="email" type="email" defaultValue={account.email} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="role">Vai trò</Label>
                                        <Input id="role" defaultValue={formatRoleName(account.roleName)} disabled />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="accountId">ID Tài khoản</Label>
                                        <Input id="accountId" defaultValue={account.accountId} disabled />
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button effect="gooeyRight" type="submit">
                                        Lưu Thay Đổi
                                    </Button>
                                </CardFooter>
                            </Card>
                        </TabsContent>

                        {/* Tab Đổi mật khẩu */}
                        <TabsContent value="password" className="mt-6 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Đổi Mật Khẩu</CardTitle>
                                    <CardDescription>Cập nhật mật khẩu để bảo mật tài khoản của bạn</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <form onSubmit={handleSubmit(onChangePassword)} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="currentPassword">Mật Khẩu Hiện Tại</Label>
                                            <Input
                                                id="currentPassword"
                                                type="password"
                                                autoComplete="current-password"
                                                {...register("currentPassword")}
                                                disabled={isSubmitting}
                                            />
                                            {errors.currentPassword && (
                                                <p className="text-destructive text-xs">{errors.currentPassword.message}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="newPassword">Mật Khẩu Mới</Label>
                                            <Input
                                                id="newPassword"
                                                type="password"
                                                autoComplete="new-password"
                                                {...register("newPassword")}
                                                disabled={isSubmitting}
                                            />
                                            {errors.newPassword && <p className="text-destructive text-xs">{errors.newPassword.message}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="confirmPassword">Xác Nhận Mật Khẩu Mới</Label>
                                            <Input
                                                id="confirmPassword"
                                                type="password"
                                                autoComplete="new-password"
                                                {...register("confirmPassword")}
                                                disabled={isSubmitting}
                                            />
                                            {errors.confirmPassword && (
                                                <p className="text-destructive text-xs">{errors.confirmPassword.message}</p>
                                            )}
                                        </div>
                                        <div className="rounded-lg border p-3">
                                            <h4 className="mb-2 text-sm font-medium">Yêu Cầu Mật Khẩu:</h4>
                                            <ul className="space-y-1 text-xs text-muted-foreground">
                                                <li>Ít nhất 4 ký tự</li>
                                            </ul>
                                        </div>
                                        <Button type="submit" disabled={isSubmitting}>
                                            {isSubmitting ? "Đang cập nhật..." : "Cập Nhật Mật Khẩu"}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </TabsContent>

                    </Tabs>
                </div>
            </div>
        </div>
    )
}

export default Profile
