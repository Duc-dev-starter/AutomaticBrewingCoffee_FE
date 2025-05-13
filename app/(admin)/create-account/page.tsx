"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, Controller } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/hooks/use-toast"
import { createAccount } from "@/services/auth"
import { getOrganizations } from "@/services/organization"
import { createAccountSchema } from "@/schema/auth"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import InfiniteScroll from "react-infinite-scroll-component"
import { Organization } from "@/interfaces/organization"

type FormValues = z.infer<typeof createAccountSchema>

export default function CreateAccountPage() {
    const [mounted, setMounted] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [organizationList, setOrganizationList] = useState<Organization[]>([])
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        if (mounted) {
            fetchOrganizations(1)
        }
    }, [mounted])

    const form = useForm<FormValues>({
        resolver: zodResolver(createAccountSchema),
        defaultValues: {
            fullName: "",
            email: "",
            password: "",
            roleName: "Organization",
            referenceId: "",
        },
    })

    const fetchOrganizations = async (pageNumber: number) => {
        try {
            const response = await getOrganizations({ page: pageNumber, size: 10 })
            if (pageNumber === 1) {
                setOrganizationList(response.items)
            } else {
                setOrganizationList(prev => [...prev, ...response.items])
            }
            if (response.items.length < 10) {
                setHasMore(false)
            }
        } catch (error) {
            console.error("Error fetching organizations:", error)
            toast({
                title: "Lỗi",
                description: "Không tải được danh sách tổ chức.",
                variant: "destructive",
            })
        }
    }

    const loadMoreOrganizations = async () => {
        const nextPage = page + 1
        await fetchOrganizations(nextPage)
        setPage(nextPage)
    }

    async function onSubmit(data: FormValues) {
        setIsSubmitting(true)
        try {
            const result = await createAccount(data)

            if (result.isSuccess) {
                toast({
                    title: "Thành công!",
                    description: result.message,
                })
                form.reset()
            } else {
                toast({
                    title: "Lỗi!",
                    description: result.message,
                    variant: "destructive",
                })
            }
        } catch (error) {
            toast({
                title: "Lỗi!",
                description: "Đã xảy ra lỗi không mong muốn. Vui lòng thử lại sau.",
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!mounted) {
        return null
    }

    return (
        <div className="w-full p-4 sm:p-6">
            <div className="ml-5">
                <h1 className="text-2xl font-bold mb-1">Tạo Tài Khoản Mới</h1>
                <p className="text-gray-500 mb-6">Tạo tài khoản người dùng mới trong hệ thống</p>
            </div>
            <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-md border p-6">
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                        <div>
                            <div className="mb-1.5">Họ và tên</div>
                            <Input placeholder="Nhập họ và tên" {...form.register("fullName")} />
                            {form.formState.errors.fullName && (
                                <p className="text-red-500 text-sm mt-1">{form.formState.errors.fullName.message}</p>
                            )}
                        </div>

                        <div>
                            <div className="mb-1.5">Email</div>
                            <Input type="email" placeholder="email@example.com" {...form.register("email")} />
                            {form.formState.errors.email && (
                                <p className="text-red-500 text-sm mt-1">{form.formState.errors.email.message}</p>
                            )}
                        </div>

                        <div>
                            <div className="mb-1.5">Mật khẩu</div>
                            <Input type="password" placeholder="••••••••" {...form.register("password")} />
                            {form.formState.errors.password && (
                                <p className="text-red-500 text-sm mt-1">{form.formState.errors.password.message}</p>
                            )}
                        </div>

                        <div>
                            <div className="mb-1.5">Vai trò</div>
                            <Input
                                disabled
                                value="Tổ chức"
                                className="bg-gray-100 text-gray-700 cursor-not-allowed"
                            />
                        </div>

                        <div>
                            <div className="mb-1.5">
                                Tổ chức <span className="text-gray-400 text-sm">(tùy chọn)</span>
                            </div>
                            <Controller
                                name="referenceId"
                                control={form.control}
                                render={({ field }) => (
                                    <Select
                                        value={field.value}
                                        onValueChange={field.onChange}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn tổ chức" />
                                        </SelectTrigger>
                                        <SelectContent className="max-h-[300px] overflow-y-auto">
                                            <InfiniteScroll
                                                dataLength={organizationList.length}
                                                next={loadMoreOrganizations}
                                                hasMore={hasMore}
                                                loader={<div className="p-2 text-center text-sm">Đang tải thêm...</div>}
                                                scrollableTarget="select-content"
                                                style={{ overflow: "hidden" }}
                                            >
                                                {organizationList.map((org) => (
                                                    <SelectItem key={org.organizationId} value={org.organizationId}>
                                                        {org.name}
                                                    </SelectItem>
                                                ))}
                                            </InfiniteScroll>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>

                        <Button
                            type="submit"
                            className="bg-primary hover:bg-primary-400 text-white mt-4 h-10 px-4 py-2"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Đang xử lý..." : "Tạo tài khoản"}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    )
}