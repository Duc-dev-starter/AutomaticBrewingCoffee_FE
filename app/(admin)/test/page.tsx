"use client"

import { useState } from "react"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, Upload } from "lucide-react"

const jsonSchema = z.object({
    devices: z.array(
        z.object({
            name: z.string(),
            type: z.enum(["string", "number", "boolean"]),
        })
    ),
    metadata: z.array(
        z.object({
            key: z.string(),
            value: z.string(),
        })
    ),
})

export default function JsonFileValidator() {
    const [fileName, setFileName] = useState("")
    const [isValid, setIsValid] = useState<boolean | null>(null)
    const [errorMessage, setErrorMessage] = useState("")

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setFileName(file.name)

        try {
            const text = await file.text()
            const json = JSON.parse(text)
            jsonSchema.parse(json)

            setIsValid(true)
            setErrorMessage("")
        } catch (err: any) {
            setIsValid(false)
            setErrorMessage(err.message)
        }
    }

    return (
        <div className="max-w-xl mx-auto mt-10 space-y-4">
            <h1 className="text-xl font-bold">Kiểm tra file JSON</h1>

            <input
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="block"
            />

            {fileName && (
                <p className="text-sm text-gray-500">
                    Đã chọn file: <strong>{fileName}</strong>
                </p>
            )}

            {isValid === true && (
                <Alert variant="default">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <AlertTitle>File JSON hợp lệ!</AlertTitle>
                </Alert>
            )}

            {isValid === false && (
                <Alert variant="destructive">
                    <XCircle className="h-5 w-5 text-red-500" />
                    <AlertTitle>File JSON không hợp lệ!</AlertTitle>
                    <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
            )}
        </div>
    )
}
