import { FilterFn } from "@tanstack/react-table";


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