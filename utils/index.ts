import { FilterFn } from "@tanstack/react-table";
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


declare module "@tanstack/table-core" {
    interface FilterFns {
        multiSelect: FilterFn<unknown>
    }
}

export const multiSelectFilter: FilterFn<unknown> = (
    row,
    columnId,
    filterValue: string[]
) => {
    const rowValue = (row.getValue(columnId) as string).toLowerCase();
    const lowerCaseFilterValues = filterValue.map((val) => val.toLowerCase());
    return filterValue.length === 0 || lowerCaseFilterValues.includes(rowValue);
};


export const firstLetterCapitialize = (value: string) => {
    return value.charAt(0).toUpperCase() + value.slice(1);
}