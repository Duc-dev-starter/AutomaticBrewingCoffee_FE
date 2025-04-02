"use client"

import { useState } from "react"
import {
    DndContext,
    type DragEndEvent,
    DragOverlay,
    type DragStartEvent,
    KeyboardSensor,
    PointerSensor,
    closestCenter,
    useSensor,
    useSensors,
} from "@dnd-kit/core"
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, GripVertical, Plus, Save } from 'lucide-react'
import type { ErrorAction, Ingredient, Machine, Step } from "@/types"
import { DraggableErrorAction, DraggableIngredient, SortableStep } from "@/components/recipe"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const RecipeBuilder = () => {
    // Danh sách các máy/thiết bị
    const [machines, setMachines] = useState<Machine[]>([
        { id: "machine-1", name: "Máy đánh trứng" },
        { id: "machine-2", name: "Lò nướng" },
        { id: "machine-3", name: "Bếp từ" },
        { id: "machine-4", name: "Nồi cơm điện" },
        { id: "machine-5", name: "Máy xay sinh tố" },
        { id: "machine-6", name: "Máy trộn bột" },
    ])

    const [ingredients, setIngredients] = useState<Ingredient[]>([
        { id: "ing-1", name: "Bột mì", amount: "", unit: "" },
        { id: "ing-2", name: "Đường", amount: "", unit: "" },
        { id: "ing-3", name: "Trứng", amount: "", unit: "" },
        { id: "ing-4", name: "Sữa", amount: "", unit: "" },
        { id: "ing-5", name: "Bơ", amount: "", unit: "" },
        { id: "ing-6", name: "Tinh chất vani", amount: "", unit: "" },
    ])

    const [errorActions, setErrorActions] = useState<ErrorAction[]>([
        { id: "err-1", description: "Bột quá khô, thêm nước" },
        { id: "err-2", description: "Bột quá ướt, thêm bột" },
        { id: "err-3", description: "Nhiệt độ quá cao, giảm lửa" },
    ])

    const [steps, setSteps] = useState<Step[]>([
        {
            id: "step-1",
            title: "Bước 1",
            ingredients: [],
            instructions: "Tập hợp tất cả nguyên liệu và đo lường chính xác.",
            errorActions: [],
            machine: undefined,
        },
    ])

    const [activeId, setActiveId] = useState<string | null>(null)
    const [activeItem, setActiveItem] = useState<any>(null)

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    )

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event
        setActiveId(active.id as string)
        setActiveItem(active.data.current)
    }

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event

        // Nếu thả ra ngoài (không vào bước nào)
        if (!over) {
            return
        }

        // Xử lý kéo thả nguyên liệu
        if (active.data.current?.type === "ingredient" && over.id && (over.id as string).startsWith("step-drop-")) {
            const stepId = over.data.current.stepId
            const ingredient = active.data.current.ingredient

            // Tìm nguyên liệu trong danh sách có sẵn
            const ingredientFromList = ingredients.find(ing => ing.id === ingredient.id)

            // Tìm nguyên liệu trong các bước
            let ingredientFromStep: Ingredient | undefined
            let sourceStepId: string | undefined

            steps.forEach(step => {
                const found = step.ingredients.find(ing => ing.id === ingredient.id)
                if (found && step.id !== stepId) {
                    ingredientFromStep = found
                    sourceStepId = step.id
                }
            })

            // Tạo bản sao của nguyên liệu để thêm vào bước
            const ingredientCopy = ingredientFromList
                ? { ...ingredientFromList }
                : ingredientFromStep
                    ? { ...ingredientFromStep }
                    : { ...ingredient }

            // Nếu nguyên liệu đến từ bước khác, xóa nó khỏi bước đó
            if (sourceStepId) {
                setSteps(
                    steps.map((step) =>
                        step.id === sourceStepId
                            ? { ...step, ingredients: step.ingredients.filter((ing) => ing.id !== ingredient.id) }
                            : step
                    )
                )
            }

            // Thêm nguyên liệu vào bước mới
            setSteps(
                steps.map((step) =>
                    step.id === stepId
                        ? {
                            ...step,
                            ingredients: [...step.ingredients.filter((ing) => ing.id !== ingredient.id), ingredientCopy],
                        }
                        : step,
                ),
            )
        }

        // Xử lý kéo thả hành động lỗi
        if (active.data.current?.type === "errorAction" && over.id && (over.id as string).startsWith("error-drop-")) {
            const stepId = over.data.current.stepId
            const errorAction = active.data.current.errorAction

            // Kiểm tra xem hành động lỗi đã có trong bước nào chưa
            const stepWithErrorAction = steps.find((step) => step.errorActions.some((err) => err.id === errorAction.id))

            // Nếu hành động lỗi đã có trong một bước khác, xóa nó khỏi bước đó
            if (stepWithErrorAction && stepWithErrorAction.id !== stepId) {
                setSteps(
                    steps.map((step) =>
                        step.id === stepWithErrorAction.id
                            ? { ...step, errorActions: step.errorActions.filter((err) => err.id !== errorAction.id) }
                            : step,
                    ),
                )
            }
            // Nếu hành động lỗi đang ở trong danh sách hành động lỗi có sẵn, xóa nó khỏi danh sách đó
            else if (!stepWithErrorAction) {
                setErrorActions(errorActions.filter((err) => err.id !== errorAction.id))
            }

            // Thêm hành động lỗi vào bước mới
            setSteps(
                steps.map((step) =>
                    step.id === stepId
                        ? {
                            ...step,
                            errorActions: [...step.errorActions.filter((err) => err.id !== errorAction.id), errorAction],
                        }
                        : step,
                ),
            )
        }

        setActiveId(null)
        setActiveItem(null)
    }

    const addStep = () => {
        const newStep: Step = {
            id: `step-${steps.length + 1}-${Date.now()}`,
            title: `Bước ${steps.length + 1}`,
            ingredients: [],
            instructions: "",
            errorActions: [],
            machine: undefined,
        }
        setSteps([...steps, newStep])
    }

    const removeStep = (id: string) => {
        const stepToRemove = steps.find((step) => step.id === id)
        if (stepToRemove) {
            // Trả lại hành động lỗi vào danh sách có sẵn
            setErrorActions([...errorActions, ...stepToRemove.errorActions])
        }
        setSteps(steps.filter((step) => step.id !== id))
    }

    const updateStepTitle = (id: string, title: string) => {
        setSteps(steps.map((step) => (step.id === id ? { ...step, title } : step)))
    }

    const updateStepInstructions = (id: string, instructions: string) => {
        setSteps(steps.map((step) => (step.id === id ? { ...step, instructions } : step)))
    }

    const updateStepMachine = (id: string, machineId: string) => {
        setSteps(steps.map((step) => (step.id === id ? { ...step, machine: machineId } : step)))
    }

    const moveStepUp = (index: number) => {
        if (index > 0) {
            setSteps(arrayMove(steps, index, index - 1))
        }
    }

    const moveStepDown = (index: number) => {
        if (index < steps.length - 1) {
            setSteps(arrayMove(steps, index, index + 1))
        }
    }

    // Xóa nguyên liệu từ bước
    const removeIngredientFromStep = (ingredientId: string) => {
        setSteps(
            steps.map((step) => {
                if (step.ingredients.some((ing) => ing.id === ingredientId)) {
                    return {
                        ...step,
                        ingredients: step.ingredients.filter((ing) => ing.id !== ingredientId),
                    }
                }
                return step
            }),
        )
    }

    // Cập nhật số lượng và đơn vị của nguyên liệu trong bước
    const updateIngredientInStep = (stepId: string, ingredientId: string, amount: string, unit: string) => {
        setSteps(
            steps.map((step) => {
                if (step.id === stepId) {
                    return {
                        ...step,
                        ingredients: step.ingredients.map((ing) => (ing.id === ingredientId ? { ...ing, amount, unit } : ing)),
                    }
                }
                return step
            }),
        )
    }

    // Thêm hành động lỗi vào bước
    const addErrorActionToStep = (stepId: string, description: string) => {
        const newErrorAction: ErrorAction = {
            id: `err-step-${Date.now()}`,
            description,
        }

        setSteps(
            steps.map((step) =>
                step.id === stepId ? { ...step, errorActions: [...step.errorActions, newErrorAction] } : step,
            ),
        )
    }

    // Xóa hành động lỗi từ bước và đưa trở lại danh sách có sẵn
    const removeErrorActionFromStep = (stepId: string, errorActionId: string) => {
        let removedErrorAction: ErrorAction | undefined

        setSteps(
            steps.map((step) => {
                if (step.id === stepId) {
                    removedErrorAction = step.errorActions.find((err) => err.id === errorActionId)
                    return {
                        ...step,
                        errorActions: step.errorActions.filter((err) => err.id !== errorActionId),
                    }
                }
                return step
            }),
        )

        if (removedErrorAction) {
            setErrorActions([...errorActions, removedErrorAction])
        }
    }

    // Xóa nguyên liệu từ "Nguyên Liệu Có Sẵn"
    const removeIngredient = (id: string) => {
        setIngredients(ingredients.filter((ing) => ing.id !== id))
    }

    // Xóa hành động lỗi từ danh sách có sẵn
    const removeErrorAction = (id: string) => {
        setErrorActions(errorActions.filter((err) => err.id !== id))
    }

    const saveRecipe = () => {
        const recipe = { title: "Công Thức Của Tôi", steps, ingredients, errorActions, machines }
        console.log("Lưu công thức:", recipe)
        alert("Đã lưu công thức! Kiểm tra console để xem chi tiết.")
    }

    const addAllIngredientsToStep = (stepId: string) => {
        if (ingredients.length === 0) return

        // Tạo bản sao của tất cả nguyên liệu
        const ingredientCopies = ingredients.map((ing) => ({ ...ing }))

        setSteps(
            steps.map((step) =>
                step.id === stepId ? { ...step, ingredients: [...step.ingredients, ...ingredientCopies] } : step,
            ),
        )
    }

    const removeAllIngredientsFromStep = (stepId: string) => {
        setSteps(steps.map((step) => (step.id === stepId ? { ...step, ingredients: [] } : step)))
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="container mx-auto py-8">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-3xl font-bold">Trình Tạo Công Thức</h1>
                    <Button onClick={saveRecipe}>
                        <Save className="mr-2 h-4 w-4" />
                        Lưu Công Thức
                    </Button>
                </div>

                <div className="grid gap-8 md:grid-cols-3">
                    <div className="md:col-span-1 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Nguyên Liệu</CardTitle>
                                <CardDescription>Kéo nguyên liệu vào các bước công thức</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Accordion type="single" collapsible className="w-full">
                                    <AccordionItem value="ingredients" className="border-0">
                                        <AccordionTrigger className="py-0">Danh sách nguyên liệu</AccordionTrigger>
                                        <AccordionContent>
                                            <SortableContext items={ingredients.map((ing) => ing.id)} strategy={verticalListSortingStrategy}>
                                                <div className="space-y-2 max-h-[300px] overflow-y-auto p-1">
                                                    {ingredients.map((ingredient) => (
                                                        <DraggableIngredient
                                                            key={ingredient.id}
                                                            ingredient={ingredient}
                                                            onRemove={() => removeIngredient(ingredient.id)}
                                                        />
                                                    ))}
                                                </div>
                                            </SortableContext>
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                                    Xử Lý Lỗi
                                </CardTitle>
                                <CardDescription>Kéo hành động xử lý lỗi vào các bước</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Accordion type="single" collapsible className="w-full">
                                    <AccordionItem value="errorActions" className="border-0">
                                        <AccordionTrigger className="py-0">Danh sách xử lý lỗi</AccordionTrigger>
                                        <AccordionContent>
                                            <SortableContext items={errorActions.map((err) => err.id)} strategy={verticalListSortingStrategy}>
                                                <div className="space-y-2 max-h-[200px] overflow-y-auto p-1">
                                                    {errorActions.map((errorAction) => (
                                                        <DraggableErrorAction
                                                            key={errorAction.id}
                                                            errorAction={errorAction}
                                                            onRemove={() => removeErrorAction(errorAction.id)}
                                                        />
                                                    ))}
                                                </div>
                                            </SortableContext>
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                            </CardContent>
                        </Card>

                        {/* Card quản lý máy/thiết bị */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Thiết Bị/Máy</CardTitle>
                                <CardDescription>Danh sách thiết bị/máy sử dụng trong công thức</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Accordion type="single" collapsible className="w-full">
                                    <AccordionItem value="machines" className="border-0">
                                        <AccordionTrigger className="py-0">Danh sách thiết bị</AccordionTrigger>
                                        <AccordionContent>
                                            <div className="space-y-2 max-h-[200px] overflow-y-auto p-1">
                                                {machines.map((machine) => (
                                                    <div key={machine.id} className="flex items-center justify-between p-2 border rounded-md">
                                                        <span>{machine.name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="md:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Các Bước Công Thức</CardTitle>
                                <CardDescription>Kéo nguyên liệu và hành động xử lý lỗi vào từng bước</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <SortableContext items={steps.map((step) => step.id)} strategy={verticalListSortingStrategy}>
                                    <div>
                                        {steps.map((step, index) => (
                                            <SortableStep
                                                key={step.id}
                                                step={step}
                                                index={index}
                                                machines={machines}
                                                onRemove={() => removeStep(step.id)}
                                                onUpdate={(title) => updateStepTitle(step.id, title)}
                                                onMoveUp={() => moveStepUp(index)}
                                                onMoveDown={() => moveStepDown(index)}
                                                canMoveUp={index > 0}
                                                canMoveDown={index < steps.length - 1}
                                                onRemoveIngredient={(ingredientId) => removeIngredientFromStep(ingredientId)}
                                                onUpdateInstructions={(instructions) => updateStepInstructions(step.id, instructions)}
                                                addAllIngredientsToStep={addAllIngredientsToStep}
                                                removeAllIngredientsFromStep={removeAllIngredientsFromStep}
                                                onUpdateIngredient={updateIngredientInStep}
                                                onAddErrorAction={addErrorActionToStep}
                                                onRemoveErrorAction={removeErrorActionFromStep}
                                                onUpdateMachine={updateStepMachine}
                                            />
                                        ))}
                                    </div>
                                </SortableContext>

                                <Button onClick={addStep} className="mt-4 w-full">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Thêm Bước
                                </Button>
                            </CardContent>
                            <CardFooter>
                                <Button onClick={saveRecipe} className="w-full">
                                    <Save className="mr-2 h-4 w-4" />
                                    Lưu Công Thức
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </div>

            <DragOverlay>
                {activeId && activeItem?.type === "ingredient" && (
                    <div className="flex items-center gap-2 rounded-md border p-2 bg-card opacity-80">
                        <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <div className="flex flex-1 items-center gap-2">
                            <span className="font-medium">{activeItem.ingredient.name}</span>
                            {activeItem.ingredient.amount && (
                                <span className="text-sm text-muted-foreground">
                                    {activeItem.ingredient.amount} {activeItem.ingredient.unit}
                                </span>
                            )}
                        </div>
                    </div>
                )}
                {activeId && activeItem?.type === "errorAction" && (
                    <div className="flex items-center gap-2 rounded-md border p-2 bg-red-50 opacity-80">
                        <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <div className="flex flex-1 items-center gap-2">
                            <span className="font-medium text-red-700">{activeItem.errorAction.description}</span>
                        </div>
                    </div>
                )}
            </DragOverlay>
        </DndContext>
    )
}

export default RecipeBuilder
