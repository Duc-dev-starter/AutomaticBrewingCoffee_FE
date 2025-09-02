import { type ColumnDef } from "@tanstack/react-table";
import { EBaseStatus, EBaseStatusViMap } from "@/enum/base";
import { ActionDropdown } from "../common";
import BaseFilterBadgesTable from "../common/base-filter-badges-table";
import { Account } from "@/interfaces/account";
import { Switch } from "../ui/switch";
import { RoleViMap } from "@/enum/role";

export const columns = ({
    onViewDetails,
    handleToggle
}: {
    onViewDetails: (account: Account) => void;
    handleToggle: (account: Account) => void;
}): ColumnDef<Account>[] => [
        {
            id: "accountId",
            header: "Mã tài khoản",
            cell: ({ row }) => {
                const accountId = row.original.accountId || "";
                const shortId = accountId.replace(/-/g, "").substring(0, 8);
                return <div className="font-medium text-center">ACC-{shortId}</div>;
            },
            enableSorting: false,
        },
        {
            id: "fullName",
            header: "Tên tài khoản",
            cell: ({ row }) => (
                <div className="text-center">
                    {row.original.fullName || "Chưa có"}
                </div>
            ),
            enableSorting: false,
        },
        {
            id: "roleName",
            header: "Vai trò",
            cell: ({ row }) => (
                <div className="text-center">
                    {RoleViMap[row.original.roleName] || "Chưa có"}
                </div>
            ),
            enableSorting: false,
        },
        {
            id: "status",
            header: "Trạng thái",
            cell: ({ row }) => {
                const status: EBaseStatus = row.original.status;
                const statusText = EBaseStatusViMap[status] ?? "Không rõ";
                return (
                    <BaseFilterBadgesTable status={status} statusText={statusText} />
                );
            },
            enableSorting: false,
        },
        {
            id: "isBanned",
            header: "Khóa tài khoản",
            cell: ({ row }) => (
                <div className="text-center">
                    <Switch
                        checked={row.original.isBanned}
                        onCheckedChange={() => handleToggle(row.original)}
                    />
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
                    onCopy={(item) => navigator.clipboard.writeText(item.accountId)}
                    onViewDetails={(item) => onViewDetails(item)}

                />
            ),
            enableSorting: false,
        },
    ];