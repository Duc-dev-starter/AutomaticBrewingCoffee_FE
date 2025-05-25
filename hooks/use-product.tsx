"use client";

import { useState, useEffect } from "react";
import { getProducts } from "@/services/product";
import { useToast } from "@/hooks/use-toast";
import { Product } from "@/interfaces/product";

export const useProducts = () => {
    const { toast } = useToast();
    const [products, setProducts] = useState<Product[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(true);

    const fetchProducts = async (pageNumber: number) => {
        setLoading(true);
        try {
            const response = await getProducts({ page: pageNumber, size: 10 });
            setProducts((prev) => (pageNumber === 1 ? response.items : [...prev, ...response.items]));
            setHasMore(response.items.length === 10);
        } catch (error) {
            toast({
                title: "Lỗi",
                description: "Không tải được danh sách sản phẩm.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts(1);
    }, []);

    const loadMore = () => {
        const nextPage = page + 1;
        fetchProducts(nextPage);
        setPage(nextPage);
    };

    return { products, hasMore, loading, loadMore };
};
