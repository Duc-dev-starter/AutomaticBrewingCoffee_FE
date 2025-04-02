"use client"

import type { Machine, Step } from "@/types"
import { useDroppable } from "@dnd-kit/core"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card"
import { AlertTriangle, ChevronDown, ChevronUp, GripVertical, Plus, Trash2 } from 'lucide-react'
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { Label } from "../ui/label"
import DraggableIngredient from "./draggable-ingredient"
import DraggableErrorAction from "./draggable-error-action"
import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"

// Component bước công thức kéo thả
const SortableStep = ({
    step,
    index,
    machines,
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
    onUpdateIngredient,
    onAddErrorAction,
    onRemoveErrorAction,
    onUpdateMachine,
}: {
    step: Step
    index: number
    machines: Machine[]
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
    onUpdateIngredient: (stepId: string, ingredientId: string, amount: string, unit: string) => void
    onAddErrorAction: (stepId: string, description: string) => void
    onRemoveErrorAction: (stepId: string, errorActionId: string) => void
    onUpdateMachine: (stepId: string, machineId: string) => void
}) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
        id: step.id,
        data: { type: "step", step },
    })

    const { setNodeRef: setIngredientsDroppableNodeRef } = useDroppable({
        id: `step-drop-${step.id}`,
        data: { stepId: step.id, type: "ingredients" },
    })

    const { setNodeRef: setErrorActionsDroppableNodeRef } = useDroppable({
        id: `error-drop-${step.id}`,
        data: { stepId: step.id, type: "errorActions" },
    })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    const [newErrorAction, setNewErrorAction] = useState("")

    const handleAddErrorAction = () => {
        if (newErrorAction.trim()) {
            onAddErrorAction(step.id, newErrorAction)
            setNewErrorAction("")
        }
    }

    const handleMachineChange = (value: string) => {
        onUpdateMachine(step.id, value)
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
                {/* Dropdown chọn máy */}
                <div>
                    <Label htmlFor={`machine-${step.id}`} className="mb-2 block">
                        Thiết bị/Máy
                    </Label>
                    <Select value={step.machine} onValueChange={handleMachineChange}>
                        <SelectTrigger id={`machine-${step.id}`} className="w-full">
                            <SelectValue placeholder="Chọn thiết bị/máy..." />
                        </SelectTrigger>
                        <SelectContent>
                            {machines.map((machine) => (
                                <SelectItem key={machine.id} value={machine.id}>
                                    {machine.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <Label className="mb-2 block">Nguyên liệu</Label>
                    <div
                        ref={setIngredientsDroppableNodeRef}
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
                                        onUpdateAmount={(amount, unit) => onUpdateIngredient(step.id, ingredient.id, amount, unit)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div>
                    <Label className="mb-2 block flex items-center">
                        <AlertTriangle className="h-4 w-4 text-red-500 mr-1" />
                        Xử lý lỗi
                    </Label>
                    <div className="flex gap-2 mb-2">
                        <Input
                            placeholder="Mô tả hành động xử lý lỗi..."
                            value={newErrorAction}
                            onChange={(e) => setNewErrorAction(e.target.value)}
                        />
                        <Button onClick={handleAddErrorAction} className="shrink-0">
                            <Plus className="h-4 w-4 mr-1" />
                            Thêm
                        </Button>
                    </div>
                    <div
                        ref={setErrorActionsDroppableNodeRef}
                        id={`error-container-${step.id}`}
                        className="min-h-20 rounded-md border border-dashed p-3 border-red-200"
                    >
                        {step.errorActions.length === 0 ? (
                            <p className="text-center text-sm text-muted-foreground py-6">Kéo hành động xử lý lỗi vào đây</p>
                        ) : (
                            <div className="space-y-2">
                                {step.errorActions.map((errorAction) => (
                                    <DraggableErrorAction
                                        key={errorAction.id}
                                        errorAction={errorAction}
                                        onRemove={() => onRemoveErrorAction(step.id, errorAction.id)}
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
                <Button onClick={() => addAllIngredientsToStep(step.id)}>Thêm Tất Cả Nguyên Liệu</Button>
                <Button onClick={() => removeAllIngredientsFromStep(step.id)} variant="destructive">
                    Bỏ Tất Cả Nguyên Liệu
                </Button>
            </CardFooter>
        </Card>
    )
}

export default SortableStep
