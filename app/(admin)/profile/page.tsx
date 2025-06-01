"use client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { BellRing, Key, Lock, Mail, Shield, User, UserCog } from "lucide-react"

import React, { useState } from 'react'
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ChangePasswordFormData, changePasswordSchema } from "@/schema/auth"
import { changePassword } from "@/services/auth"
import { toast } from "@/hooks/use-toast"


const user = {
    firstName: "Admin",
    lastName: "User",
    role: "Quản trị viên",
    email: "admin@example.com",
    phone: "+1 (555) 123-4567",
    jobTitle: "Quản trị hệ thống",
    department: "it",
    bio: "Quản trị hệ thống với chuyên môn về bảo mật mạng và hạ tầng đám mây.",
    lastLogin: "Hôm nay, 10:30 AM",
    memberSince: "15 Tháng 1, 2023",
    avatar: "/placeholder.svg?height=96&width=96"
}

const Profile = () => {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset
    } = useForm<ChangePasswordFormData>({
        resolver: zodResolver(changePasswordSchema)
    });


    const onChangePassword = async (data: ChangePasswordFormData) => {
        try {
            await changePassword({
                oldPassword: data.currentPassword,
                newPassword: data.newPassword
            });
            toast({
                title: "Thành công",
                description: `Đổi mật khẩu thành công`,
            });
        } catch (err) {
            console.error(err);
            toast({
                title: "Lỗi",
                description: "Không thể tải danh sách location.",
                variant: "destructive",
            });
        } finally {
            reset();
        }
    };

    return (
        <div className="container mx-auto py-8">
            <div className="grid gap-8 md:grid-cols-4">
                <div className="md:col-span-1">
                    <Card>
                        <CardHeader className="pb-2">
                            <div className="flex flex-col items-center">
                                <Avatar className="h-24 w-24">
                                    <AvatarImage src={user.avatar} alt={`${user.firstName} ${user.lastName}`} />
                                    <AvatarFallback>
                                        {`${user.firstName[0]}${user.lastName[0]}`}
                                    </AvatarFallback>
                                </Avatar>
                                <CardTitle className="mt-4 text-xl">
                                    {`${user.firstName} ${user.lastName}`}
                                </CardTitle>
                                <CardDescription>{user.role}</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="text-center">
                            <div className="mt-2 text-sm text-muted-foreground">
                                <p>Đăng nhập cuối: {user.lastLogin}</p>
                                <p>Thành viên từ: {user.memberSince}</p>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-center">
                            <Button variant="outline" size="sm">
                                <Shield className="mr-2 h-4 w-4" />
                                Bảng Điều Khiển
                            </Button>
                        </CardFooter>
                    </Card>
                </div>

                <div className="md:col-span-3">
                    <Tabs defaultValue="account" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="account">
                                <User className="mr-2 h-4 w-4" />
                                Cập Nhật Tài Khoản
                            </TabsTrigger>
                            <TabsTrigger value="password">
                                <Key className="mr-2 h-4 w-4" />
                                Đổi Mật Khẩu
                            </TabsTrigger>
                            <TabsTrigger value="settings">
                                <UserCog className="mr-2 h-4 w-4" />
                                Cấu Hình Tài Khoản
                            </TabsTrigger>
                        </TabsList>

                        {/* Tab Cập nhật tài khoản */}
                        <TabsContent value="account" className="mt-6 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Thông Tin Cá Nhân</CardTitle>
                                    <CardDescription>
                                        Cập nhật chi tiết tài khoản và thông tin cá nhân của bạn
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="firstName">Tên</Label>
                                            <Input id="firstName" defaultValue={user.firstName} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="lastName">Họ</Label>
                                            <Input id="lastName" defaultValue={user.lastName} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input id="email" type="email" defaultValue={user.email} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Số Điện Thoại</Label>
                                        <Input id="phone" type="tel" defaultValue={user.phone} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="jobTitle">Chức Danh Công Việc</Label>
                                        <Input id="jobTitle" defaultValue={user.jobTitle} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="department">Phòng Ban</Label>
                                        <Select defaultValue={user.department}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Chọn phòng ban" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="it">Phòng CNTT</SelectItem>
                                                <SelectItem value="hr">Nhân Sự</SelectItem>
                                                <SelectItem value="finance">Tài Chính</SelectItem>
                                                <SelectItem value="operations">Vận Hành</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="bio">Giới Thiệu Bản Thân</Label>
                                        <Textarea
                                            id="bio"
                                            defaultValue={user.bio}
                                        />
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button effect="gooeyRight" type="submit">Lưu Thay Đổi</Button>
                                </CardFooter>
                            </Card>
                        </TabsContent>

                        {/* Tab Đổi mật khẩu */}
                        <TabsContent value="password" className="mt-6 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Đổi Mật Khẩu</CardTitle>
                                    <CardDescription>
                                        Cập nhật mật khẩu để bảo mật tài khoản của bạn
                                    </CardDescription>
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
                                            {errors.newPassword && (
                                                <p className="text-destructive text-xs">{errors.newPassword.message}</p>
                                            )}
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

                        {/* Tab Cấu hình tài khoản */}
                        <TabsContent value="settings" className="mt-6 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Cài Đặt Tài Khoản</CardTitle>
                                    <CardDescription>
                                        Quản lý sở thích và cài đặt tài khoản của bạn
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-medium">Cài Đặt Bảo Mật</h3>
                                        <div className="flex items-center justify-between rounded-lg border p-4">
                                            <div className="space-y-0.5">
                                                <div className="flex items-center">
                                                    <Lock className="mr-2 h-4 w-4 text-muted-foreground" />
                                                    <Label htmlFor="twoFactor">Xác Thực Hai Yếu Tố</Label>
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    Thêm một lớp bảo mật cho tài khoản của bạn
                                                </p>
                                            </div>
                                            <Switch id="twoFactor" />
                                        </div>
                                        <div className="flex items-center justify-between rounded-lg border p-4">
                                            <div className="space-y-0.5">
                                                <div className="flex items-center">
                                                    <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                                                    <Label htmlFor="loginAlerts">Cảnh Báo Đăng Nhập</Label>
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    Nhận thông báo qua email khi có lần đăng nhập mới
                                                </p>
                                            </div>
                                            <Switch id="loginAlerts" defaultChecked />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-lg font-medium">Tùy Chọn Thông Báo</h3>
                                        <div className="flex items-center justify-between rounded-lg border p-4">
                                            <div className="space-y-0.5">
                                                <div className="flex items-center">
                                                    <BellRing className="mr-2 h-4 w-4 text-muted-foreground" />
                                                    <Label htmlFor="emailNotifications">Thông Báo Email</Label>
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    Nhận cảnh báo và thông báo hệ thống qua email
                                                </p>
                                            </div>
                                            <Switch id="emailNotifications" defaultChecked />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-lg font-medium">Cài Đặt Hiển Thị</h3>
                                        <div className="space-y-2">
                                            <Label htmlFor="timezone">Múi Giờ</Label>
                                            <Select defaultValue="utc-8">
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Chọn múi giờ" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="utc-8">Giờ Thái Bình Dương (UTC-8)</SelectItem>
                                                    <SelectItem value="utc-5">Giờ Miền Đông (UTC-5)</SelectItem>
                                                    <SelectItem value="utc+0">UTC</SelectItem>
                                                    <SelectItem value="utc+1">Giờ Trung Âu (UTC+1)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="language">Ngôn Ngữ</Label>
                                            <Select defaultValue="en">
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Chọn ngôn ngữ" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="en">Tiếng Anh</SelectItem>
                                                    <SelectItem value="es">Tiếng Tây Ban Nha</SelectItem>
                                                    <SelectItem value="fr">Tiếng Pháp</SelectItem>
                                                    <SelectItem value="de">Tiếng Đức</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button>Lưu Cài Đặt</Button>
                                </CardFooter>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    )
}

export default Profile