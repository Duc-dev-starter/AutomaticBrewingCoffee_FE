"use client"

import type { ErrorAction } from "@/types"
import { useSortable } from "@dnd-kit/sortable"
import { GripVertical, Trash2 } from "lucide-react"
import { Button } from "../ui/button"
import { CSS } from "@dnd-kit/utilities"
import type React from "react";
import { TooltipContent, TooltipTrigger } from "../ui/tooltip"

const DraggableErrorAction = ({
  errorAction,
  onRemove,
}: {
  errorAction: ErrorAction
  onRemove: () => void
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: errorAction.id,
    data: { type: "errorAction", errorAction },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    touchAction: 'none', // Giúp tối ưu hóa kéo thả trên màn hình cảm ứng
  };

  // Hàm xử lý click xóa, NGĂN sự kiện lan truyền lên div cha
  const handleRemoveClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation(); // Rất quan trọng!
    onRemove();
  };

  // Hàm ngăn chặn sự kiện pointer down lan truyền từ button
  const stopPropagation = (event: React.PointerEvent<HTMLButtonElement>) => {
    event.stopPropagation();
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 rounded-md border p-2 bg-card mb-2 bg-red-50"
      {...attributes} // Attributes cho dnd-kit
      {...listeners} // Listeners đặt lại vào div chính để kéo thả
    >
      {/* Icon Grip chỉ để trang trí */}
      <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0 cursor-grab" />

      <div className="flex flex-1 items-center gap-2">
        <span className="font-medium text-red-700">{errorAction.description}</span>
      </div>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleRemoveClick} // onClick có stopPropagation riêng
          onPointerDown={stopPropagation} // Ngăn kéo thả khi click vào nút xóa
          className="h-6 w-6"
          aria-label={`Remove error action: ${errorAction.description}`}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Xóa hành động này</p>
      </TooltipContent>
    </div>
  );
};

export default DraggableErrorAction;