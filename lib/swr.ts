import useSWR, { KeyedMutator, SWRConfiguration } from "swr";
import { useEffect } from "react";
import { toast } from "@/hooks/use-toast";

/**
 * Hook base đồng bộ cache giữa các tab bằng localStorage event.
 * @param key: string | array - SWR key
 * @param fetcher: () => Promise<T> - Hàm fetch data
 * @param options: SWR config
 */
export function useCrossTabSWR<T>(
    key: string | any[],
    fetcher: () => Promise<T>,
    options?: SWRConfiguration
): { data: T | undefined; error: any; isLoading: boolean; mutate: KeyedMutator<T> } {
    const { data, error, isLoading, mutate } = useSWR<T>(
        key,
        fetcher,
        {
            ...options,
            revalidateOnMount: true,
            revalidateOnFocus: false,
            refreshInterval: 60 * 1000,
            onError: (err) => toast({ title: "Lỗi", description: err.message })
        }
    );

    useEffect(() => {
        const storageKey = typeof key === "string" ? key : JSON.stringify(key);
        function handleStorage(e: StorageEvent) {
            if (e.key === "swr-broadcast" && e.newValue) {
                try {
                    const { swrKey } = JSON.parse(e.newValue);
                    if (swrKey === storageKey) {
                        mutate();
                    }
                } catch { }
            }
        }
        window.addEventListener("storage", handleStorage);
        return () => window.removeEventListener("storage", handleStorage);
    }, [key, mutate]);

    const crossTabMutate: KeyedMutator<T> = async (...args) => {
        const storageKey = typeof key === "string" ? key : JSON.stringify(key);
        localStorage.setItem(
            "swr-broadcast",
            JSON.stringify({ swrKey: storageKey, timestamp: Date.now() })
        );
        return mutate(...args);
    };

    return { data, error, isLoading, mutate: crossTabMutate };
}