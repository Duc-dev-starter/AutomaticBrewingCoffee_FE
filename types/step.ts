import { ErrorAction } from "./error-action"
import { Ingredient } from "./ingredient"

export interface Step {
    id: string
    title: string
    ingredients: Ingredient[]
    instructions: string
    errorActions: ErrorAction[]
    machine?: string
}