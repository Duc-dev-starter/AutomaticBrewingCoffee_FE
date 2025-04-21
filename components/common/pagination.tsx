"use client"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { PageSizeSelector } from "@/components/common"

type PaginationProps = {
    loading: boolean
    pageSize: number
    setPageSize: (size: number) => void
    currentPage: number
    setCurrentPage: (page: number) => void
    totalItems: number
    totalPages: number
}

export const Pagination = ({
    loading,
    pageSize,
    setPageSize,
    currentPage,
    setCurrentPage,
    totalItems,
    totalPages,
}: PaginationProps) => {
    const startItem = (currentPage - 1) * pageSize + 1
    const endItem = Math.min(currentPage * pageSize, totalItems)

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0 py-4">
            <div className="flex items-center space-x-2">
                <p className="text-sm font-medium">Hiển thị</p>
                <PageSizeSelector
                    loading={loading}
                    pageSize={pageSize}
                    setCurrentPage={setCurrentPage}
                    setPageSize={setPageSize}
                />
                <p className="text-sm font-medium">mục mỗi trang</p>
            </div>
            {loading ? (
                <Skeleton className="h-5 w-64" />
            ) : (
                <div className="text-sm text-muted-foreground">
                    Đang hiển thị {totalItems > 0 ? startItem : 0} đến {endItem} trong tổng số {totalItems} mục
                </div>
            )}
            <div className="flex items-center space-x-2">
                <Button
                    variant="outline"
                    className="hidden h-8 w-8 p-0 lg:flex"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1 || loading || totalPages === 0}
                >
                    <span className="sr-only">Trang đầu</span>
                    <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                    disabled={currentPage === 1 || loading || totalPages === 0}
                >
                    <span className="sr-only">Trang trước</span>
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                {loading ? (
                    <Skeleton className="h-5 w-16" />
                ) : (
                    <div className="flex items-center gap-1.5">
                        {totalPages === 0 ? (
                            <span className="text-sm text-muted-foreground">Không có dữ liệu</span>
                        ) : (
                            <>
                                <span className="text-sm font-medium">Trang {currentPage}</span>
                                <span className="text-sm text-muted-foreground">/ {totalPages}</span>
                            </>
                        )}
                    </div>
                )}
                <Button
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
                    disabled={currentPage === totalPages || loading || totalPages === 0}
                >
                    <span className="sr-only">Trang sau</span>
                    <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                    variant="outline"
                    className="hidden h-8 w-8 p-0 lg:flex"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages || loading || totalPages === 0}
                >
                    <span className="sr-only">Trang cuối</span>
                    <ChevronsRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}