// Định nghĩa kiểu dữ liệu cho công thức
export interface Recipe {
    id: string
    name: string
    description: string
    category: string
    difficulty: "Dễ" | "Trung bình" | "Khó"
    prepTime: number
    cookTime: number
    servings: number
    createdAt: string
    updatedAt: string
    imageUrl: string
    status: "Đã xuất bản" | "Nháp" | "Đang xét duyệt"
}