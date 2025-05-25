import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface UseEntityProps<T> {
    createEntity: (data: T) => Promise<void>;
    updateEntity: (id: string, data: T) => Promise<void>;
    onSuccess?: () => void;
    onError?: (error: string) => void;
}

export const useEntity = <T,>(props: UseEntityProps<T>) => {
    const { createEntity, updateEntity, onSuccess, onError } = props;

    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (data: T, id?: string) => {
        setLoading(true);
        setError(null);

        try {
            if (id) {
                await updateEntity(id, data);
                toast({
                    title: "Thành công",
                    description: "Dữ liệu đã được cập nhật.",
                });
            } else {
                await createEntity(data);
                toast({
                    title: "Thành công",
                    description: "Dữ liệu đã được tạo.",
                });
            }
            onSuccess?.();
        } catch (err) {
            const errorMessage = (err as Error).message || "Có lỗi xảy ra";
            setError(errorMessage);
            onError?.(errorMessage);
            toast({
                title: "Lỗi",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        error,
        handleSubmit,
    };
};
