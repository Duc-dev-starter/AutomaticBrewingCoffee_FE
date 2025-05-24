import JsonEditorPage from "@/components/common/json-editor";

export default function Page() {
    return (
        <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="container mx-auto py-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">JSON Editor</h1>
                    <p className="text-gray-600">Advanced JSON editing with multiple view modes</p>
                </div>
                <JsonEditorPage />
            </div>
        </main>
    )
}