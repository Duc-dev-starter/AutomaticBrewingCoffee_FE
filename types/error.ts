import { HttpStatus } from "@/enum/http"

export type ErrorResponse = {
    isSuccess: boolean,
    message: string,
    statusCode: HttpStatus,
    request: string,
    response: null,
}