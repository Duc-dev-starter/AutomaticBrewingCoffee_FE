import { Mail, Phone, FileText } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"
import { type EBaseStatus, EBaseStatusViMap } from "@/enum/base"
import { ActionDropdown, BaseFilterBadgesTable } from "@/components/common"
import type { Organization } from "@/interfaces/organization"

// Cột cho bảng tổ chức
export const columns = ({
    onViewDetails,
    onEdit,
    onDelete,
}: {
    onViewDetails: (organization: Organization) => void
    onEdit: (organization: Organization) => void
    onDelete: (organization: Organization) => void
}): ColumnDef<Organization>[] => [
        {
            id: "organizationId",
            header: "Mã tổ chức",
            cell: ({ row }) => {
                const organizationId = row.original.organizationId || ""
                const shortId = organizationId.replace(/-/g, "").substring(0, 8)
                return <div className="font-medium text-center">ORG-{shortId}</div>
            },
            enableSorting: false,
        },
        {
            id: "logo",
            header: "Logo",
            cell: ({ row }) => {
                const logoUrl = row.original.logoUrl;
                return (
                    <div className="flex justify-center">
                        {logoUrl ? (
                            <img
                                src={logoUrl}
                                alt="Logo"
                                className="w-10 h-10 object-contain rounded"
                            />
                        ) : (
                            <span className="text-muted-foreground">Không có</span>
                        )}
                    </div>
                );
            },
            enableSorting: false,
        },
        {
            id: "name",
            header: "Tên tổ chức",
            accessorKey: "name",
            cell: ({ row }) => {
                const organization = row.original
                return (
                    <div className="flex items-center justify-center gap-2">
                        <span>{organization.name}</span>
                    </div>
                )
            },
        },
        {
            id: "contactInfo",
            header: "Thông tin liên hệ",
            cell: ({ row }) => {
                const { contactEmail, contactPhone } = row.original
                return (
                    <div className="flex flex-col items-center justify-center gap-1 text-sm">
                        {contactEmail && (
                            <div className="flex items-center">
                                <Mail className="h-3 w-3 mr-1 text-muted-foreground" />
                                <span>{contactEmail}</span>
                            </div>
                        )}
                        {contactPhone && (
                            <div className="flex items-center">
                                <Phone className="h-3 w-3 mr-1 text-muted-foreground" />
                                <span>{contactPhone}</span>
                            </div>
                        )}
                        {!contactEmail && !contactPhone && <span className="text-muted-foreground">Không có</span>}
                    </div>
                )
            },
            enableSorting: false,
        },
        {
            id: "taxId",
            header: "Mã số thuế",
            cell: ({ row }) => {
                const taxId = row.original.taxId
                return (
                    <div className="flex items-center justify-center">
                        <FileText className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span>{taxId || "Không có"}</span>
                    </div>
                )
            },
            enableSorting: false,
        },
        {
            id: "status",
            header: "Trạng thái",
            cell: ({ row }) => {
                const status: EBaseStatus = row.original.status
                const statusText = EBaseStatusViMap[status] ?? "Không rõ"
                return (
                    <BaseFilterBadgesTable status={status} statusText={statusText} />
                )
            },
            enableSorting: false,
        },
        {
            id: "actions",
            header: "Hành động",
            cell: ({ row }) => (
                <ActionDropdown
                    item={row.original}
                    onCopy={(item) => navigator.clipboard.writeText(item.organizationId)}
                    onViewDetails={(item) => onViewDetails(item)}
                    onEdit={(item) => onEdit(item)}
                    onDelete={(item) => onDelete(item)}
                />
            ),
            enableSorting: false,
        },
    ]
