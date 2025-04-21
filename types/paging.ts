
export interface PagingParams {
    filterBy?: string;
    filterQuery?: string;
    page?: number;
    size?: number;
    sortBy?: string;
    isAsc?: boolean;
    status?: string;
    franchiseId?: string;
    orderType?: string;
    paymentGateway?: string;
    productId?: string;
    type?: string;
    productType?: string;
    productSize?: string;
}

export interface PagingResponse<T> {
    size: number;
    page: number;
    total: number;
    totalPages: number;
    items: T[];
}
