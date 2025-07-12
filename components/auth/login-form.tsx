"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, Coffee, Lock, LogIn, Mail } from "lucide-react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

import { login, getCurrentUser } from "@/services/auth.service";
import { handleToken } from "@/utils/cookie";
import { ErrorResponse } from "@/types/error";
import { Path } from "@/constants/path.constant";
import { useAppStore } from "@/stores/use-app-store";

export function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
    const router = useRouter();
    const { toast } = useToast();

    const setAccount = useAppStore((state) => state.setAccount);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!email || !password) {
            setError("Vui lòng nhập đầy đủ thông tin đăng nhập");
            return;
        }

        setIsLoading(true);
        try {
            const response = await login({ email, password });

            if (response.isSuccess && response.statusCode === 200) {
                const accessToken = response.response.accessToken;
                const refreshToken = response.response.refreshToken;

                toast({
                    title: "Đăng nhập thành công",
                    description: "Chuẩn bị điều hướng...",
                });

                handleToken(accessToken, refreshToken);

                const userResponse = await getCurrentUser();
                if (userResponse.isSuccess && userResponse.response) {
                    setAccount(userResponse.response);
                }

                const redirect = new URLSearchParams(window.location.search).get("redirect");
                setTimeout(() => {
                    router.push(redirect || Path.DASHBOARD);
                }, 100);
            } else {
                setError("Email hoặc mật khẩu không chính xác");
            }
        } catch (err) {
            const typedError = err as ErrorResponse;
            setError(typedError.message || "Lỗi không xác định");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <div className="flex flex-col items-center justify-center mb-2">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-sky-600 mb-4">
                    <Coffee className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-center text-sky-900">Automatic Brewing Coffee</h1>
                <p className="text-sky-700 text-sm">Hệ thống quản trị</p>
            </div>

            <Card className="border-0 shadow-lg">
                <CardHeader className="space-y-1 pb-4">
                    <CardTitle className="text-2xl text-center">Đăng nhập quản trị</CardTitle>
                    <CardDescription className="text-center">
                        Khu vực hạn chế - Chỉ dành cho quản trị viên
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    {error && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription className="mt-[4px]">{error}</AlertDescription>
                        </Alert>
                    )}
                    <form onSubmit={handleSubmit}>
                        <div className="flex flex-col gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        className="pl-9"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        autoComplete="email"
                                    />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="password">Mật khẩu</Label>
                                    <Link
                                        href="/forgot-password"
                                        className="ml-auto inline-block text-sm text-sky-600 hover:text-sky-800"
                                    >
                                        Quên mật khẩu?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        type="password"
                                        className="pl-9"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        autoComplete="current-password"
                                    />
                                </div>
                            </div>

                            <Button type="submit" className="w-full bg-sky-600 hover:bg-sky-700" disabled={isLoading}>
                                {isLoading ? (
                                    <div className="flex items-center">
                                        <svg
                                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            ></circle>
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            ></path>
                                        </svg>
                                        Đang xử lý...
                                    </div>
                                ) : (
                                    <div className="flex items-center">
                                        <LogIn className="mr-2 h-4 w-4" /> Đăng nhập
                                    </div>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>

                <CardFooter className="flex flex-col">
                    <div className="text-center text-sm text-muted-foreground mt-2">
                        <span>Khu vực bảo mật - Chỉ dành cho nhân viên được ủy quyền</span>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
