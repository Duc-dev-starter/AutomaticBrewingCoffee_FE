import { Step } from "@/types"
import { useDroppable } from "@dnd-kit/core"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card"
import { ChevronDown, ChevronUp, GripVertical, Trash2 } from "lucide-react"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { Label } from "../ui/label"
import DraggableIngredient from "./draggable-ingredient"


// Component bước công thức kéo thả
const SortableStep = ({
    step,
    index,
    onRemove,
    onUpdate,
    onMoveUp,
    onMoveDown,
    canMoveUp,
    canMoveDown,
    onRemoveIngredient,
    onUpdateInstructions,
    addAllIngredientsToStep,
    removeAllIngredientsFromStep,
}: {
    step: Step
    index: number
    onRemove: () => void
    onUpdate: (title: string) => void
    onMoveUp: () => void
    onMoveDown: () => void
    canMoveUp: boolean
    canMoveDown: boolean
    onRemoveIngredient: (ingredientId: string) => void
    onUpdateInstructions: (instructions: string) => void
    addAllIngredientsToStep: (stepId: string) => void
    removeAllIngredientsFromStep: (stepId: string) => void
}) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
        id: step.id,
        data: { type: "step", step },
    })

    const { setNodeRef: setDroppableNodeRef } = useDroppable({
        id: `step-drop-${step.id}`,
        data: { stepId: step.id },
    })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    return (
        <Card ref={setNodeRef} style={style} className="mb-4">
            <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                    <div {...attributes} {...listeners} className="cursor-grab">
                        <GripVertical className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                        <Input
                            value={step.title}
                            onChange={(e) => onUpdate(e.target.value)}
                            className="text-lg font-semibold"
                            placeholder={`Bước ${index + 1}`}
                        />
                    </div>
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={onMoveUp} disabled={!canMoveUp} className="h-8 w-8">
                            <ChevronUp className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={onMoveDown} disabled={!canMoveDown} className="h-8 w-8">
                            <ChevronDown className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={onRemove} className="h-8 w-8 text-destructive">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <Label className="mb-2 block">Nguyên liệu</Label>
                    <div
                        ref={setDroppableNodeRef}
                        id={`step-container-${step.id}`}
                        className="min-h-20 rounded-md border border-dashed p-3"
                    >
                        {step.ingredients.length === 0 ? (
                            <p className="text-center text-sm text-muted-foreground py-6">Kéo nguyên liệu vào đây</p>
                        ) : (
                            <div className="space-y-2">
                                {step.ingredients.map((ingredient) => (
                                    <DraggableIngredient
                                        key={ingredient.id}
                                        ingredient={ingredient}
                                        onRemove={() => onRemoveIngredient(ingredient.id)}
                                        isInStep
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                <div>
                    <Label htmlFor={`instructions-${step.id}`} className="mb-2 block">
                        Hướng dẫn
                    </Label>
                    <textarea
                        id={`instructions-${step.id}`}
                        value={step.instructions}
                        onChange={(e) => onUpdateInstructions(e.target.value)}
                        className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        placeholder="Mô tả hướng dẫn cho bước này..."
                    />
                </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
                <Button onClick={() => addAllIngredientsToStep(step.id)}>
                    Thêm Tất Cả Nguyên Liệu
                </Button>
                <Button onClick={() => removeAllIngredientsFromStep(step.id)} variant="destructive">
                    Bỏ Tất Cả Nguyên Liệu
                </Button>
            </CardFooter>
        </Card>
    )
}

export default SortableStep