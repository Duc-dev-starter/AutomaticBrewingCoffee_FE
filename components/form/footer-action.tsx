import React from "react";
import { Button } from "@/components/ui/button";
import { Save, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
interface FormFooterActionsProps {
    onCancel: () => void;
    onSubmit: (e: React.FormEvent) => void;
    loading?: boolean;
    isUpdate?: boolean;
}

const FormFooterActions: React.FC<FormFooterActionsProps> = ({
    onCancel,
    onSubmit,
    loading = false,
    isUpdate = false,
}) => {
    return (
        <div className="flex justify-between items-center pt-2">
            <div className="flex items-center space-x-2 text-xs text-gray-400">
                <Zap className="w-3 h-3" />
                <span>Ctrl+Enter để lưu • Esc để đóng</span>
            </div>
            <div className="flex space-x-3">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={loading}
                    className="h-11 px-6 border-2 border-gray-300 hover:bg-gray-50 transition-all duration-200"
                >
                    Hủy
                </Button>
                <Button
                    type="button"
                    onClick={onSubmit}
                    disabled={loading}
                    className={cn(
                        "h-11 px-8 bg-primary text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105",
                        loading && "opacity-60 cursor-not-allowed hover:scale-100"
                    )}
                >
                    {loading ? (
                        "Đang xử lý..."
                    ) : (
                        <>
                            <Save className="mr-2 w-4 h-4" />
                            {isUpdate ? "Cập nhật" : "Tạo"}
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
};

export default FormFooterActions;
