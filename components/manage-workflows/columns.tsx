import { type ColumnDef } from "@tanstack/react-table";
import { EWorkflowType, EWorkflowTypeViMap } from "@/enum/workflow";
import { ActionDropdown } from "@/components/common";
import { Workflow } from "@/interfaces/workflow";
import { PhoneCall, SprayCan, Workflow as WorkflowIcon } from "lucide-react";
import { Badge } from "../ui/badge";
import clsx from "clsx";

export const columns = ({
    onViewDetails,
    onEdit,
    onDelete,
}: {
    onViewDetails: (workflow: Workflow) => void;
    onEdit: (workflow: Workflow) => void;
    onDelete: (workflow: Workflow) => void;
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

                const typeColorMap: Record<EWorkflowType, string> = {
                    [EWorkflowType.Activity]: "bg-blue-500",
                    [EWorkflowType.Callback]: "bg-yellow-500",
                    [EWorkflowType.Clean]: "bg-green-500",
                };

                const typeIconMap: Record<EWorkflowType, JSX.Element> = {
                    [EWorkflowType.Activity]: <WorkflowIcon className="w-4 h-4 mr-1" />,
                    [EWorkflowType.Callback]: <PhoneCall className="w-4 h-4 mr-1" />,
                    [EWorkflowType.Clean]: <SprayCan className="w-4 h-4 mr-1" />,
                };

                return (
                    <div className="flex justify-center">
                        <Badge
                            className={clsx(typeColorMap[type] ?? "bg-gray-400", "text-white flex items-center")}
                        >
                            {typeIconMap[type]}
                            {typeText}
                        </Badge>
                    </div>
                );
            },
            enableSorting: false,
        },
        {
            id: "steps",
            header: "Số bước",
            cell: ({ row }) => {
                const stepsCount = row.original.steps?.length || 0;
                return (
                    <div className="text-center">{stepsCount || 0}</div>
                );
            },
            enableSorting: false,
        },
        {
            id: "description",
            accessorKey: "description",
            header: "Mô tả",
            cell: ({ row }) => (
                <div className="text-center">{row.original.description || "Chưa có"}</div>
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