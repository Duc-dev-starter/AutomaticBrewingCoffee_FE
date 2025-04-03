import { ChevronDownIcon, Clock } from "lucide-react"
import { Badge } from "../ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { Button } from "../ui/button"
import { useRouter } from "next/navigation"

// Định nghĩa cột cho bảng
export const columns = [
    {
        id: "name",
        header: "Tên công thức",
        cell: ({ row }: { row: any }) => {
            const recipe = row.original
            return (
                <div className="flex items-center space-x-3">
                    <img
                        src={recipe.imageUrl || "/placeholder.svg"}
                        alt={recipe.name}
                        className="h-10 w-10 rounded-md object-cover"
                    />
                    <div>
                        <div className="font-medium">{recipe.name}</div>
                        <div className="text-xs text-muted-foreground truncate max-w-[200px]">{recipe.description}</div>
                    </div>
                </div>
            )
        },
    },
    {
        id: "category",
        header: "Danh mục",
        cell: ({ row }: { row: any }) => row.original.category,
    },
    {
        id: "difficulty",
        header: "Độ khó",
        cell: ({ row }: { row: any }) => {
            const difficulty = row.original.difficulty
            return (
                <div className="flex items-center">
                    {difficulty === "Dễ" ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Dễ
                        </Badge>
                    ) : difficulty === "Trung bình" ? (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            Trung bình
                        </Badge>
                    ) : (
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                            Khó
                        </Badge>
                    )}
                </div>
            )
        },
    },
    {
        id: "time",
        header: "Thời gian",
        cell: ({ row }: { row: any }) => {
            const recipe = row.original
            return (
                <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span>{recipe.prepTime + recipe.cookTime} phút</span>
                </div>
            )
        },
    },
    {
        id: "status",
        header: "Trạng thái",
        cell: ({ row }: { row: any }) => {
            const status = row.original.status
            return (
                <div>
                    {status === "Đã xuất bản" ? (
                        <Badge className="bg-green-500">Đã xuất bản</Badge>
                    ) : status === "Nháp" ? (
                        <Badge variant="outline">Nháp</Badge>
                    ) : (
                        <Badge className="bg-yellow-500">Đang xét duyệt</Badge>
                    )}
                </div>
            )
        },
    },
    {
        id: "actions",
        header: "",
        cell: ({ row }: { row: any }) => {
            const router = useRouter()
            const recipe = row.original

            const handleEdit = () => {
                router.push(`/recipe?id=${recipe.id}`)
            }

            const handleDelete = (e: React.MouseEvent) => {
                e.stopPropagation()
                if (confirm("Bạn có chắc chắn muốn xóa công thức này không?")) {
                    // Xử lý xóa công thức
                    console.log("Xóa công thức:", recipe.id)
                }
            }

            return (
                <div className="text-right">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <ChevronDownIcon className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={handleEdit}>Chỉnh sửa</DropdownMenuItem>
                            <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                                Xóa
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )
        },
    },
]