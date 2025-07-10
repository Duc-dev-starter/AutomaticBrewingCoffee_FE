import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info, Mail, User, Calendar, FileText, Shield, Phone, Building2, CheckCircle, XCircle } from 'lucide-react';
import { format } from "date-fns";
import { AccountDialogProps } from "@/types/dialog";

const AccountDetailDialog = ({
    account,
    open,
    onOpenChange,
}: AccountDialogProps) => {
    if (!account) return null;

    const org = account.organization;

    const getStatusBadge = (status: string, isBanned: boolean) => {
        if (isBanned) {
            return (
                <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-200">
                    <XCircle className="mr-1 h-3 w-3" />
                    Bị khoá
                </Badge>
            );
        }

        const isActive = status?.toLowerCase() === 'active';
        return (
            <Badge className={isActive
                ? "bg-primary-100 text-primary-600 border-primary-200 hover:bg-primary-200"
                : "bg-gray-100 text-gray-600 border-gray-200"
            }>
                <CheckCircle className="mr-1 h-3 w-3" />
                {isActive ? "Hoạt động" : status}
            </Badge>
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[650px] bg-white backdrop-blur-xl shadow-2xl max-h-[90vh] overflow-y-auto hide-scrollbar">
                <DialogHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-xl font-bold flex items-center text-primary-600">
                            <div className="p-2 bg-primary-100 rounded-lg mr-3">
                                <User className="h-5 w-5 text-primary-500" />
                            </div>
                            Chi tiết tài khoản
                        </DialogTitle>
                        {getStatusBadge(account.status, account.isBanned)}
                    </div>

                    <div className="flex items-center justify-between text-sm bg-primary-50 p-3 rounded-lg border border-primary-100">
                        <div className="flex items-center text-primary-600">
                            <FileText className="mr-2 h-4 w-4" />
                            <span>Mã tài khoản:</span>
                            <span className="font-mono font-semibold ml-2">{account.accountId}</span>
                        </div>
                        {org?.createdDate && (
                            <div className="flex items-center text-primary-500">
                                <Calendar className="mr-1 h-4 w-4" />
                                {format(new Date(org.createdDate), "dd/MM/yyyy HH:mm")}
                            </div>
                        )}
                    </div>
                </DialogHeader>

                <ScrollArea className="flex-1 pr-4">
                    <div className="space-y-5 py-2">
                        {/* Account Information */}
                        <Card className="border-primary-200 shadow-sm">
                            <CardContent className="p-5">
                                <h3 className="font-semibold text-base flex items-center mb-4 text-primary-600">
                                    <div className="p-1.5 bg-primary-100 rounded-md mr-2">
                                        <Info className="h-4 w-4 text-primary-500" />
                                    </div>
                                    Thông tin tài khoản
                                </h3>

                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="space-y-1">
                                        <div className="flex items-center text-primary-400">
                                            <User className="mr-1.5 h-4 w-4" />
                                            <span>Họ tên</span>
                                        </div>
                                        <p className="font-semibold text-gray-900 pl-5">{account.fullName}</p>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="flex items-center text-primary-400">
                                            <Mail className="mr-1.5 h-4 w-4" />
                                            <span>Email</span>
                                        </div>
                                        <p className="font-medium text-primary-600 pl-5 hover:text-primary-500 cursor-pointer">
                                            {account.email}
                                        </p>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="flex items-center text-primary-400">
                                            <Shield className="mr-1.5 h-4 w-4" />
                                            <span>Vai trò</span>
                                        </div>
                                        <div className="pl-5">
                                            <Badge className="bg-primary-200 text-primary-700 border-primary-300 hover:bg-primary-300">
                                                {account.roleName}
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="flex items-center text-primary-400">
                                            <span>Trạng thái</span>
                                        </div>
                                        <p className="font-medium text-gray-700 pl-5">{account.status}</p>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="flex items-center text-primary-400">
                                            <FileText className="mr-1.5 h-4 w-4" />
                                            <span>Mã tham chiếu</span>
                                        </div>
                                        <p className="font-mono text-xs bg-primary-50 text-primary-600 px-2 py-1 rounded border border-primary-100 ml-5 inline-block">
                                            {account.referenceId}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Organization Information */}
                        {org && (
                            <Card className="border-primary-300 shadow-sm">
                                <CardContent className="p-5">
                                    <h3 className="font-semibold text-base flex items-center mb-4 text-primary-600">
                                        <div className="p-1.5 bg-primary-200 rounded-md mr-2">
                                            <Building2 className="h-4 w-4 text-primary-600" />
                                        </div>
                                        Thông tin tổ chức
                                    </h3>

                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div className="space-y-1">
                                            <div className="flex items-center text-primary-400">
                                                <Building2 className="mr-1.5 h-4 w-4" />
                                                <span>Tên tổ chức</span>
                                            </div>
                                            <p className="font-semibold text-gray-900 pl-5">{org.name}</p>
                                        </div>

                                        <div className="space-y-1">
                                            <div className="flex items-center text-primary-400">
                                                <span>Mã tổ chức</span>
                                            </div>
                                            <p className="font-mono text-xs bg-primary-100 text-primary-600 px-2 py-1 rounded border border-primary-200 ml-5 inline-block">
                                                {org.organizationCode}
                                            </p>
                                        </div>

                                        <div className="space-y-1">
                                            <div className="flex items-center text-primary-400">
                                                <Mail className="mr-1.5 h-4 w-4" />
                                                <span>Email liên hệ</span>
                                            </div>
                                            <p className="font-medium text-primary-600 pl-5 hover:text-primary-500 cursor-pointer">
                                                {org.contactEmail}
                                            </p>
                                        </div>

                                        <div className="space-y-1">
                                            <div className="flex items-center text-primary-400">
                                                <Phone className="mr-1.5 h-4 w-4" />
                                                <span>Điện thoại</span>
                                            </div>
                                            <p className="font-medium text-gray-700 pl-5">{org.contactPhone}</p>
                                        </div>

                                        <div className="space-y-1">
                                            <div className="flex items-center text-primary-400">
                                                <FileText className="mr-1.5 h-4 w-4" />
                                                <span>Mã số thuế</span>
                                            </div>
                                            <p className="font-medium text-gray-700 pl-5">
                                                {org.taxId || <span className="text-gray-400 italic">Không có</span>}
                                            </p>
                                        </div>

                                        {org.description && (
                                            <div className="col-span-2 space-y-1 pt-2">
                                                <div className="flex items-center text-primary-400">
                                                    <Info className="mr-1.5 h-4 w-4" />
                                                    <span>Mô tả</span>
                                                </div>
                                                <div className="bg-primary-50 p-3 rounded-lg border border-primary-100 ml-5">
                                                    <p className="text-sm text-gray-700 leading-relaxed">{org.description}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
};

export default AccountDetailDialog;