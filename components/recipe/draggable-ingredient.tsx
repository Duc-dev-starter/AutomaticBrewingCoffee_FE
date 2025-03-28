import { Ingredient } from "@/types"
import { useSortable } from "@dnd-kit/sortable"
import { GripVertical, Trash2 } from "lucide-react"
import { Button } from "../ui/button"
import { CSS } from "@dnd-kit/utilities"

// Component nguyên liệu kéo thả
const DraggableIngredient = ({
    ingredient,
    onRemove,
    isInStep = false,
}: {
    ingredient: Ingredient
    onRemove: () => void
    isInStep?: boolean
}) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: ingredient.id,
        data: { type: "ingredient", ingredient },
    })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`flex items-center gap-2 rounded-md border p-2 bg-card ${isInStep ? "mb-2" : ""}`}
            {...attributes}
            {...listeners}
        >
            <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <div className="flex flex-1 items-center gap-2">
                <span className="font-medium">{ingredient.name}</span>
                <span className="text-sm text-muted-foreground">
                    {ingredient.amount} {ingredient.unit}
                </span>
            </div>
            <Button variant="ghost" size="icon" onClick={onRemove} className="h-6 w-6">
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
    )
}

export default DraggableIngredient