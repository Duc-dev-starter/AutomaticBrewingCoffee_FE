import { Ingredient } from "./ingredient"

export type Step = {
    id: string
    title: string
    ingredients: Ingredient[]
    instructions: string
}