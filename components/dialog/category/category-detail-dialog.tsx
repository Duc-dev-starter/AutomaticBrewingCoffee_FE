"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { Category } from "@/interfaces/category"
import { format } from "date-fns"
import { EBaseStatusViMap } from "@/enum/base"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Calendar, Clock, FileText, Info } from "lucide-react"
import clsx from "clsx"
import { getBaseStatusColor } from "@/utils/color"
import { CategoryDialogProps } from "@/types/dialog"

const CategoryDetailDialog = ({ category, open, onOpenChange }: CategoryDialogProps) => {
    if (!category) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-auto flex flex-col">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-xl font-bold flex items-center">
                            <Info className="mr-2 h-5 w-5" />
                            Chi tiết danh mục
                        </DialogTitle>
                        <Badge className={clsx("mr-4", getBaseStatusColor(category.status))}>
                            {EBaseStatusViMap[category.status]}
                        </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground mt-2">
                        <div className="flex items-center">
                            <FileText className="mr-1 h-4 w-4" />
                            Mã danh mục: <span className="font-medium ml-1">{category.productCategoryId}</span>
                        </div>
                    </div>
                </DialogHeader>

                <ScrollArea className="flex-1 overflow-y-auto pr-4 hide-scrollbar">
                    <div className="space-y-6 py-2">
                        {/* Thông tin cơ bản */}
                        <Card>
                            <CardContent className="p-4">
                                <h3 className="font-semibold text-sm flex items-center mb-3">
                                    <Info className="mr-2 h-4 w-4" />
                                    Thông tin cơ bản
                                </h3>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div className="flex flex-col">
                                        <span className="text-muted-foreground">Tên danh mục</span>
                                        <span className="font-medium">{category.name || "Không có"}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-muted-foreground">Trạng thái</span>
                                        <Badge variant="outline" className="mt-1 w-fit">
                                            {EBaseStatusViMap[category.status]}
                                        </Badge>
                                    </div>
                                </div>

                                <Separator className="my-3" />

                                <div className="col-span-2">
                                    <span className="text-muted-foreground">Mô tả</span>
                                    <p className="mt-1 text-sm">{category.description || "Không có mô tả"}</p>
                                </div>
                            </CardContent>
                        </Card>


                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}

export default CategoryDetailDialog