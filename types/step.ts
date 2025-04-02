import { ErrorAction } from "./error-action"
import { Ingredient } from "./ingredient"

export type Step = {
    id: string
    title: string
    ingredients: Ingredient[]
    instructions: string
    errorActions: ErrorAction[]
    machine?: string
}