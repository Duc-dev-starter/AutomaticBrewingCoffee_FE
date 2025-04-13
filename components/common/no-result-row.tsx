import { TableCell, TableRow } from "../ui/table";

interface NoResultsRowProps {
    columns: any[];
}

export const NoResultsRow = ({ columns }: NoResultsRowProps) => {
    return (
        <TableRow>
            <TableCell colSpan={columns.length} className="h-24 text-center">
                Không có kết quả.
            </TableCell>
        </TableRow>
    );
};