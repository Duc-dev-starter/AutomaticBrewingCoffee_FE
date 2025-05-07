"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Info, Building2, FileText, Mail, ImageIcon } from "lucide-react"
import clsx from "clsx"
import { getBaseStatusColor } from "@/utils/color"
import type { OrganizationDialogProps } from "@/types/dialog"
import { EBaseStatusViMap } from "@/enum/base"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const OrganizationDetailDialog = ({ organization, open, onOpenChange }: OrganizationDialogProps) => {
    if (!organization) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-xl font-bold flex items-center">
                            <Building2 className="mr-2 h-5 w-5" />
                            Chi tiết tổ chức
                        </DialogTitle>
                        <Badge className={clsx("mr-4", getBaseStatusColor(organization.status))}>
                            {EBaseStatusViMap[organization.status] || "Không rõ"}
                        </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground mt-2">
                        <div className="flex items-center">
                            <FileText className="mr-1 h-4 w-4" />
                            Mã tổ chức: <span className="font-medium ml-1">{organization.organizationId}</span>
                        </div>
                    </div>
                </DialogHeader>

                <ScrollArea className="flex-1 overflow-y-auto pr-4 hide-scrollbar">
                    <div className="space-y-6 py-2">
                        <div className="flex items-center space-x-4">
                            <Avatar className="h-24 w-24 rounded-md border">
                                <AvatarImage src={organization.logoUrl || "/placeholder.svg"} alt={organization.name} />
                                <AvatarFallback className="rounded-md bg-primary text-primary-foreground text-xl">
                                    {organization.name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="space-y-1">
                                <h2 className="text-xl font-bold">{organization.name}</h2>
                                <div className="text-sm text-muted-foreground">
                                    {organization.taxId ? (
                                        <div className="flex items-center">
                                            <FileText className="h-3 w-3 mr-1" />
                                            MST: {organization.taxId}
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        </div>

                        <Card>
                            <CardContent className="p-4">
                                <h3 className="font-semibold text-sm flex items-center mb-3">
                                    <Info className="mr-2 h-4 w-4" />
                                    Thông tin tổ chức
                                </h3>
                                <div className="grid grid-cols-1 gap-3 text-sm">
                                    <div className="flex flex-col">
                                        <span className="text-muted-foreground">Mô tả</span>
                                        <span className="font-medium">{organization.description || "Không có"}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4">
                                <h3 className="font-semibold text-sm flex items-center mb-3">
                                    <Mail className="mr-2 h-4 w-4" />
                                    Thông tin liên hệ
                                </h3>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div className="flex flex-col">
                                        <span className="text-muted-foreground">Email</span>
                                        <span className="font-medium">{organization.contactEmail || "Không có"}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-muted-foreground">Số điện thoại</span>
                                        <span className="font-medium">{organization.contactPhone || "Không có"}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Hiển thị logo đầy đủ nếu có */}
                        {organization.logoUrl && (
                            <Card>
                                <CardContent className="p-4">
                                    <h3 className="font-semibold text-sm flex items-center mb-3">
                                        <ImageIcon className="mr-2 h-4 w-4" />
                                        Logo tổ chức
                                    </h3>
                                    <div className="flex justify-center">
                                        <div className="border rounded-md overflow-hidden max-w-[300px]">
                                            <img
                                                src={organization.logoUrl || "/placeholder.svg"}
                                                alt={`Logo ${organization.name}`}
                                                className="w-full h-auto object-contain"
                                                onError={(e) => {
                                                    e.currentTarget.src = "/placeholder.svg?height=200&width=200&text=No+Logo"
                                                }}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}

export default OrganizationDetailDialog
