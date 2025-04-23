import { type ColumnDef } from "@tanstack/react-table";
import { EWorkflowType, EWorkflowTypeViMap } from "@/enum/workflow";
import { ActionDropdown } from "@/components/common";
import Link from "next/link";
import { Workflow } from "@/interfaces/workflow";
import { Workflow as WorkflowIcon } from "lucide-react";

export const columns = ({
    onViewDetails,
    onEdit,
    onDelete,
    onViewSteps,
}: {
    onViewDetails: (workflow: Workflow) => void;
    onEdit: (workflow: Workflow) => void;
    onDelete: (workflow: Workflow) => void;
    onViewSteps: (workflow: Workflow) => void;
}): ColumnDef<Workflow>[] => [
        {
            id: "workflowId",
            header: "Mã quy trình",
            cell: ({ row }) => {
                const workflowId = row.original.workflowId || "";
                const shortId = workflowId.replace(/-/g, "").substring(0, 8);
                return <div className="font-medium text-center">WF-{shortId}</div>;
            },
            enableSorting: false,
        },
        {
            id: "name",
            header: "Tên quy trình",
            cell: ({ row }) => (
                <div className="flex items-center justify-center gap-2">
                    <WorkflowIcon className="h-4 w-4 text-muted-foreground" />
                    <span>{row.original.name}</span>
                </div>
            ),
            enableSorting: true,
        },
        {
            id: "type",
            header: "Loại",
            cell: ({ row }) => {
                const type: EWorkflowType = row.original.type;
                const typeText = EWorkflowTypeViMap[type] ?? "Không rõ";
                return <div className="text-center">{typeText}</div>;
            },
            enableSorting: false,
        },
        {
            id: "description",
            accessorKey: "description",
            header: "Mô tả",
            cell: ({ row }) => (
                <div className="text-center">{row.original.description || "Không có"}</div>
            ),
            enableSorting: false,
        },
        {
            id: "steps",
            header: "Bước",
            cell: ({ row }) => (
                <div className="text-center">
                    <Link
                        href={`/manage-workflows/${row.original.workflowId}/steps`}
                        className="text-blue-600 hover:underline"
                        onClick={() => onViewSteps(row.original)}
                    >
                        Xem bước
                    </Link>
                </div>
            ),
            enableSorting: false,
        },
        {
            id: "actions",
            header: "Hành động",
            cell: ({ row }) => (
                <ActionDropdown
                    item={row.original}
                    onCopy={(item) => navigator.clipboard.writeText(item.workflowId)}
                    onViewDetails={(item) => onViewDetails(item)}
                    onEdit={(item) => onEdit(item)}
                    onDelete={(item) => onDelete(item)}
                />
            ),
            enableSorting: false,
        },
    ];