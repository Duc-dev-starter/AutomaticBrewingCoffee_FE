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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { AlertTriangle, GripVertical, Plus, Save } from "lucide-react"
import type { ErrorAction, Ingredient, Machine, Step } from "@/types"
import { DraggableErrorAction, DraggableIngredient, SortableStep } from "@/components/recipe"

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
            title: "Chuẩn bị nguyên liệu",
            ingredients: [],
            instructions: "Tập hợp tất cả nguyên liệu và đo lường chính xác.",
            errorActions: [],
            machine: undefined,
        },
    ])

    const [newIngredient, setNewIngredient] = useState<Omit<Ingredient, "id">>({
        name: "",
        amount: "",
        unit: "",
    })

    const [newErrorAction, setNewErrorAction] = useState<string>("")
    const [newMachine, setNewMachine] = useState<Omit<Machine, "id">>({
        name: "",
    })

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

            // Kiểm tra xem nguyên liệu đã có trong bước nào chưa
            const stepWithIngredient = steps.find((step) => step.ingredients.some((ing) => ing.id === ingredient.id))

            // Nếu nguyên liệu đã có trong một bước khác, xóa nó khỏi bước đó
            if (stepWithIngredient && stepWithIngredient.id !== stepId) {
                setSteps(
                    steps.map((step) =>
                        step.id === stepWithIngredient.id
                            ? { ...step, ingredients: step.ingredients.filter((ing) => ing.id !== ingredient.id) }
                            : step,
                    ),
                )
            }
            // Nếu nguyên liệu đang ở trong danh sách nguyên liệu có sẵn, xóa nó khỏi danh sách đó
            else if (!stepWithIngredient) {
                setIngredients(ingredients.filter((ing) => ing.id !== ingredient.id))
            }

            // Thêm nguyên liệu vào bước mới
            setSteps(
                steps.map((step) =>
                    step.id === stepId
                        ? {
                            ...step,
                            ingredients: [...step.ingredients.filter((ing) => ing.id !== ingredient.id), ingredient],
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
            // Trả lại nguyên liệu vào danh sách có sẵn
            setIngredients([...ingredients, ...stepToRemove.ingredients])
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

    // Xóa nguyên liệu từ bước và đưa trở lại "Nguyên Liệu Có Sẵn"
    const removeIngredientFromStep = (ingredientId: string) => {
        let removedIngredient: Ingredient | undefined

        setSteps(
            steps.map((step) => {
                const foundIngredient = step.ingredients.find((ing) => ing.id === ingredientId)
                if (foundIngredient) {
                    removedIngredient = foundIngredient
                    // Reset amount và unit khi trả về danh sách có sẵn
                    removedIngredient = {
                        ...removedIngredient,
                        amount: "",
                        unit: "",
                    }
                    return {
                        ...step,
                        ingredients: step.ingredients.filter((ing) => ing.id !== ingredientId),
                    }
                }
                return step
            }),
        )

        if (removedIngredient) {
            setIngredients([...ingredients, removedIngredient])
        }
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

    // Thêm máy mới
    const addNewMachine = () => {
        if (newMachine.name.trim() === "") return

        const machine: Machine = {
            id: `machine-${machines.length + 1}-${Date.now()}`,
            name: newMachine.name,
        }
        setMachines([...machines, machine])
        setNewMachine({ name: "" })
    }

    // Thêm hành động lỗi mới vào danh sách có sẵn
    const addNewErrorAction = () => {
        if (newErrorAction.trim() === "") return

        const errorAction: ErrorAction = {
            id: `err-${errorActions.length + 1}-${Date.now()}`,
            description: newErrorAction,
        }
        setErrorActions([...errorActions, errorAction])
        setNewErrorAction("")
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

    const addNewIngredient = () => {
        if (newIngredient.name.trim() === "") return

        const ingredient: Ingredient = {
            id: `ing-${ingredients.length + 1}-${Date.now()}`,
            name: newIngredient.name,
            amount: "",
            unit: "",
        }
        setIngredients([...ingredients, ingredient])
        setNewIngredient({ name: "", amount: "", unit: "" })
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

        setSteps(
            steps.map((step) =>
                step.id === stepId ? { ...step, ingredients: [...step.ingredients, ...ingredients] } : step,
            ),
        )
        setIngredients([])
    }

    const removeAllIngredientsFromStep = (stepId: string) => {
        const stepToUpdate = steps.find((step) => step.id === stepId)
        if (!stepToUpdate || stepToUpdate.ingredients.length === 0) return

        // Reset amount và unit khi trả về danh sách có sẵn
        const resetIngredients = stepToUpdate.ingredients.map((ing) => ({
            ...ing,
            amount: "",
            unit: "",
        }))

        setIngredients([...ingredients, ...resetIngredients])
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
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Thêm Nguyên Liệu Mới</Label>
                                    <div className="grid gap-2">
                                        <Input
                                            placeholder="Tên nguyên liệu"
                                            value={newIngredient.name}
                                            onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })}
                                        />
                                        <Button onClick={addNewIngredient}>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Thêm Nguyên Liệu
                                        </Button>
                                    </div>
                                </div>

                                <Separator />

                                <div>
                                    <Label className="mb-2 block">Nguyên Liệu Có Sẵn</Label>
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
                                </div>
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
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Thêm Hành Động Xử Lý Lỗi</Label>
                                    <div className="grid gap-2">
                                        <Input
                                            placeholder="Mô tả hành động xử lý lỗi"
                                            value={newErrorAction}
                                            onChange={(e) => setNewErrorAction(e.target.value)}
                                        />
                                        <Button onClick={addNewErrorAction}>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Thêm Hành Động
                                        </Button>
                                    </div>
                                </div>

                                <Separator />

                                <div>
                                    <Label className="mb-2 block">Hành Động Xử Lý Lỗi Có Sẵn</Label>
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
                                </div>
                            </CardContent>
                        </Card>

                        {/* Thêm card quản lý máy/thiết bị */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Thiết Bị/Máy</CardTitle>
                                <CardDescription>Quản lý các thiết bị/máy sử dụng trong công thức</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Thêm Thiết Bị/Máy Mới</Label>
                                    <div className="grid gap-2">
                                        <Input
                                            placeholder="Tên thiết bị/máy"
                                            value={newMachine.name}
                                            onChange={(e) => setNewMachine({ ...newMachine, name: e.target.value })}
                                        />
                                        <Button onClick={addNewMachine}>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Thêm Thiết Bị/Máy
                                        </Button>
                                    </div>
                                </div>

                                <Separator />

                                <div>
                                    <Label className="mb-2 block">Thiết Bị/Máy Có Sẵn</Label>
                                    <div className="space-y-2 max-h-[200px] overflow-y-auto p-1">
                                        {machines.map((machine) => (
                                            <div key={machine.id} className="flex items-center justify-between p-2 border rounded-md">
                                                <span>{machine.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
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

