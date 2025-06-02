import { Path } from "@/constants/path";
import { Roles } from "@/enum/role";

type ToastOptions = {
    title: string;
    description?: string;
    variant?: "default" | "destructive";
};


export const cleanParams = (params: any) => {
    for (const key in params) {
        if (params[key] === '' && params[key] !== 0) {
            delete params[key];
        }
    }
    return params;
};

export const scrollToTop = (position = 0, behavior: ScrollBehavior = 'smooth') => {
    window.scrollTo({
        top: position,
        behavior,
    });
};

export const getVietnameseStatus = (status: string, type: string) => {
    const statusMap: Record<string, Record<string, string>> = {
        product: {
            published: 'Công khai',
            inactive: 'Ngưng bán',
            draft: 'Nháp',
        },
        category: {
            published: 'Công khai',
            inactive: 'Ẩn',
            draft: 'Nháp',
        },
        blog: {
            published: 'Công khai',
            inactive: 'Ẩn',
            draft: 'Nháp',
        },
        client: {
            active: 'Hoạt động',
            inactive: 'Ngưng hoạt động',
            banned: 'Bị cấm'
        },
        foster: {
            active: 'Hoạt động',
            inactive: 'Ngưng hoạt động',
            banned: 'Bị cấm'
        }
    };

    return statusMap[type]?.[status] || 'Nháp';
};



export const firstLetterCapitialize = (value: string) => {
    return value.charAt(0).toUpperCase() + value.slice(1);
}


let showToast: ((options: ToastOptions) => void) | null = null;

export const registerToast = (fn: typeof showToast) => {
    showToast = fn;
};

export const toastService = {
    show: (options: ToastOptions) => {
        if (showToast) showToast(options);
    },
};


// Hàm định dạng tiền tệ (thêm vào lib/utils.ts nếu chưa có)
export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};


