"use client"

import type { Ingredient } from "@/types"
import { useSortable } from "@dnd-kit/sortable"
import { GripVertical, Trash2 } from "lucide-react"
import { Button } from "../ui/button"
import { CSS } from "@dnd-kit/utilities"
import { Input } from "../ui/input"
import { useState, useEffect } from "react" // Thêm useEffect
import type React from "react";
import { TooltipContent, TooltipTrigger } from "../ui/tooltip"

const DraggableIngredient = ({
    ingredient,
    onRemove,
    isInStep = false,
    onUpdateAmount,
}: {
    ingredient: Ingredient
    onRemove: () => void
    isInStep?: boolean
    onUpdateAmount?: (amount: string, unit: string) => void
}) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: ingredient.id,
        data: { type: "ingredient", ingredient },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        touchAction: 'none', // Giúp tối ưu hóa kéo thả trên màn hình cảm ứng
    };

    const [amount, setAmount] = useState(ingredient.amount);
    const [unit, setUnit] = useState(ingredient.unit);

    // Cập nhật state nội bộ nếu props từ bên ngoài thay đổi
    // Quan trọng khi kéo thả giữa các danh sách hoặc khi có cập nhật từ cha
    useEffect(() => {
        setAmount(ingredient.amount);
        setUnit(ingredient.unit);
    }, [ingredient.amount, ingredient.unit]);

    const handleAmountChange = (value: string) => {
        setAmount(value);
        if (onUpdateAmount) {
            onUpdateAmount(value, unit);
        }
    };

    const handleUnitChange = (value: string) => {
        setUnit(value);
        if (onUpdateAmount) {
            onUpdateAmount(amount, value);
        }
    };

    // Hàm xử lý click xóa, NGĂN sự kiện lan truyền lên div cha
    const handleRemoveClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation(); // Rất quan trọng!
        onRemove();
    };

    // Hàm ngăn chặn sự kiện pointer down lan truyền từ input/button
    // Giúp ngăn việc click vào input/button bắt đầu kéo thả
    const stopPropagation = (event: React.PointerEvent<HTMLInputElement> | React.PointerEvent<HTMLButtonElement>) => {
        event.stopPropagation();
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`flex items-center gap-2 rounded-md border p-2 bg-card ${isInStep ? "mb-2" : ""}`}
            {...attributes} // Attributes cho dnd-kit
            {...listeners} // Listeners đặt lại vào div chính để kéo thả
        >
            {/* Icon Grip chỉ để trang trí và báo hiệu có thể kéo */}
            <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0 cursor-grab" />

            <div className="flex flex-1 items-center gap-2">
                <span className="font-medium">{ingredient.name}</span>
                {isInStep ? (
                    <div className="flex items-center gap-2 ml-2">
                        <Input
                            value={amount}
                            onChange={(e) => handleAmountChange(e.target.value)}
                            onPointerDown={stopPropagation} // Ngăn kéo thả khi click vào input
                            className="w-20 h-7 text-sm"
                            placeholder="Số lượng"
                        />
                        <Input
                            value={unit}
                            onChange={(e) => handleUnitChange(e.target.value)}
                            onPointerDown={stopPropagation} // Ngăn kéo thả khi click vào input
                            className="w-16 h-7 text-sm"
                            placeholder="Đơn vị"
                        />
                    </div>
                ) : ingredient.amount ? (
                    <span className="text-sm text-muted-foreground">
                        {ingredient.amount} {ingredient.unit}
                    </span>
                ) : null}
            </div>
            <TooltipTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleRemoveClick} // onClick vẫn có stopPropagation riêng
                    onPointerDown={stopPropagation} // Ngăn kéo thả khi click vào nút xóa
                    className="h-6 w-6"
                    aria-label={`Remove ${ingredient.name}`}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </TooltipTrigger>
            <TooltipContent>
                <p>Xóa nguyên liệu này</p>
            </TooltipContent>
        </div>
    );
};

export default DraggableIngredient;