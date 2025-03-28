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
import {
    SortableContext,
    arrayMove,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { GripVertical, Plus, Save } from "lucide-react"
import { Ingredient, Step } from "@/types"
import { DraggableIngredient, SortableStep } from "@/components/recipe"


const RecipeBuilder = () => {
    const [ingredients, setIngredients] = useState<Ingredient[]>([
        { id: "ing-1", name: "Bột mì", amount: "500", unit: "g" },
        { id: "ing-2", name: "Đường", amount: "200", unit: "g" },
        { id: "ing-3", name: "Trứng", amount: "3", unit: "" },
        { id: "ing-4", name: "Sữa", amount: "250", unit: "ml" },
        { id: "ing-5", name: "Bơ", amount: "100", unit: "g" },
        { id: "ing-6", name: "Tinh chất vani", amount: "1", unit: "tsp" },
    ])

    const [steps, setSteps] = useState<Step[]>([
        {
            id: "step-1",
            title: "Chuẩn bị nguyên liệu",
            ingredients: [],
            instructions: "Tập hợp tất cả nguyên liệu và đo lường chính xác.",
        },
    ])

    const [newIngredient, setNewIngredient] = useState<Omit<Ingredient, "id">>({
        name: "",
        amount: "",
        unit: "",
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
            if (active.data.current?.type === "ingredient") {
                setIngredients([...ingredients, active.data.current.ingredient]);
            }
            return;
        }

        if (active.data.current?.type === "ingredient" && over.id && (over.id as string).startsWith("step-drop-")) {
            const stepId = over.data.current.stepId
            const ingredient = active.data.current.ingredient

            setIngredients(ingredients.filter((ing) => ing.id !== ingredient.id))
            setSteps(
                steps.map((step) =>
                    step.id === stepId
                        ? { ...step, ingredients: [...step.ingredients, ingredient] }
                        : step
                )
            )
        }

        if (active.data.current?.type === "ingredient" && over.id && (over.id as string).startsWith("step-drop-")) {
            const stepId = over.data.current.stepId
            const ingredient = active.data.current.ingredient
            const currentStep = steps.find((step) => step.ingredients.some((ing) => ing.id === ingredient.id))

            if (currentStep && currentStep.id !== stepId) {
                setSteps(
                    steps.map((step) =>
                        step.id === currentStep.id
                            ? { ...step, ingredients: step.ingredients.filter((ing) => ing.id !== ingredient.id) }
                            : step
                    )
                )
                setSteps(
                    steps.map((step) =>
                        step.id === stepId
                            ? { ...step, ingredients: [...step.ingredients, ingredient] }
                            : step
                    )
                )
            }
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
        }
        setSteps([...steps, newStep])
    }

    const removeStep = (id: string) => {
        setSteps(steps.filter((step) => step.id !== id))
    }

    const updateStepTitle = (id: string, title: string) => {
        setSteps(steps.map((step) => (step.id === id ? { ...step, title } : step)))
    }

    const updateStepInstructions = (id: string, instructions: string) => {
        setSteps(steps.map((step) => (step.id === id ? { ...step, instructions } : step)))
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
    const removeIngredientFromStep = (stepId: string, ingredientId: string) => {
        const removedIngredient = steps
            .find(step => step.id === stepId)
            ?.ingredients.find(ing => ing.id === ingredientId);
        if (removedIngredient) {
            setIngredients([...ingredients, removedIngredient]);
        }
        setSteps(steps.map(step =>
            step.id === stepId
                ? { ...step, ingredients: step.ingredients.filter(ing => ing.id !== ingredientId) }
                : step
        ));
    };
    const addNewIngredient = () => {
        if (newIngredient.name.trim() === "") return

        const ingredient: Ingredient = {
            id: `ing-${ingredients.length + 1}-${Date.now()}`,
            ...newIngredient,
        }
        setIngredients([...ingredients, ingredient])
        setNewIngredient({ name: "", amount: "", unit: "" })
    }

    // Xóa nguyên liệu từ "Nguyên Liệu Có Sẵn"
    const removeIngredient = (id: string) => {
        setIngredients(ingredients.filter(ing => ing.id !== id));
    };

    const saveRecipe = () => {
        const recipe = { title: "Công Thức Của Tôi", steps, ingredients }
        console.log("Lưu công thức:", recipe)
        alert("Đã lưu công thức! Kiểm tra console để xem chi tiết.")
    }

    const addAllIngredientsToStep = (stepId: string) => {
        setSteps(
            steps.map((step) =>
                step.id === stepId
                    ? { ...step, ingredients: [...step.ingredients, ...ingredients] }
                    : step
            )
        )
        setIngredients([])
    }

    const removeAllIngredientsFromStep = (stepId: string) => {
        const removedIngredients = steps.find((step) => step.id === stepId)?.ingredients || []
        setIngredients([...ingredients, ...removedIngredients])
        setSteps(
            steps.map((step) =>
                step.id === stepId
                    ? { ...step, ingredients: [] }
                    : step
            )
        )
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
                    <div className="md:col-span-1">
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
                                        <div className="grid grid-cols-2 gap-2">
                                            <Input
                                                placeholder="Số lượng"
                                                value={newIngredient.amount}
                                                onChange={(e) => setNewIngredient({ ...newIngredient, amount: e.target.value })}
                                            />
                                            <Input
                                                placeholder="Đơn vị"
                                                value={newIngredient.unit}
                                                onChange={(e) => setNewIngredient({ ...newIngredient, unit: e.target.value })}
                                            />
                                        </div>
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
                                        <div className="space-y-2 max-h-[400px] overflow-y-auto p-1">
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
                    </div>

                    <div className="md:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Các Bước Công Thức</CardTitle>
                                <CardDescription>Kéo nguyên liệu từ bảng bên trái vào từng bước</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <SortableContext items={steps.map((step) => step.id)} strategy={verticalListSortingStrategy}>
                                    <div>
                                        {steps.map((step, index) => (
                                            <SortableStep
                                                key={step.id}
                                                step={step}
                                                index={index}
                                                onRemove={() => removeStep(step.id)}
                                                onUpdate={(title) => updateStepTitle(step.id, title)}
                                                onMoveUp={() => moveStepUp(index)}
                                                onMoveDown={() => moveStepDown(index)}
                                                canMoveUp={index > 0}
                                                canMoveDown={index < steps.length - 1}
                                                onRemoveIngredient={(ingredientId) => removeIngredientFromStep(step.id, ingredientId)}
                                                onUpdateInstructions={(instructions) => updateStepInstructions(step.id, instructions)}
                                                addAllIngredientsToStep={addAllIngredientsToStep}
                                                removeAllIngredientsFromStep={removeAllIngredientsFromStep}
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
                            <span className="text-sm text-muted-foreground">
                                {activeItem.ingredient.amount} {activeItem.ingredient.unit}
                            </span>
                        </div>
                    </div>
                )}
            </DragOverlay>
        </DndContext>
    )
}

export default RecipeBuilder