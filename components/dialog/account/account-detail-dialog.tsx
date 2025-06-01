import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Info, Mail, User, Calendar, FileText, Shield, Phone, Building2 } from "lucide-react";
import { format } from "date-fns";
import { Account } from "@/interfaces/account";


type AccountDetailDialogProps = {
    account: Account | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

const AccountDetailDialog = ({
    account,
    open,
    onOpenChange,
}: AccountDetailDialogProps) => {
    if (!account) return null;
    const org = account.organization;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-xl font-bold flex items-center">
                            <User className="mr-2 h-5 w-5" />
                            Chi tiết tài khoản
                        </DialogTitle>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground mt-2">
                        <div className="flex items-center">
                            <FileText className="mr-1 h-4 w-4" />
                            Mã tài khoản: <span className="font-medium ml-1">{account.accountId}</span>
                        </div>
                        {org?.createdDate && (
                            <div className="flex items-center">
                                <Calendar className="mr-1 h-4 w-4" />
                                {format(new Date(org.createdDate), "dd/MM/yyyy HH:mm")}
                            </div>
                        )}
                    </div>
                </DialogHeader>

                <ScrollArea className="flex-1 pr-4">
                    <div className="space-y-6 py-2">
                        <Card>
                            <CardContent className="p-4">
                                <h3 className="font-semibold text-sm flex items-center mb-3">
                                    <Info className="mr-2 h-4 w-4" />
                                    Thông tin tài khoản
                                </h3>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div className="flex flex-col">
                                        <span className="text-muted-foreground">Họ tên</span>
                                        <span className="font-medium">{account.fullName}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-muted-foreground">Email</span>
                                        <span className="font-medium flex items-center">
                                            <Mail className="mr-1 h-4 w-4" />
                                            {account.email}
                                        </span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-muted-foreground">Vai trò</span>
                                        <span className="font-medium flex items-center">
                                            <Shield className="mr-1 h-4 w-4" />
                                            {account.roleName}
                                        </span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-muted-foreground">Trạng thái</span>
                                        <span className="font-medium">{account.status}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-muted-foreground">Bị khoá?</span>
                                        <span className="font-medium">{account.isBanned ? "Có" : "Không"}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-muted-foreground">Mã tham chiếu</span>
                                        <span className="font-medium">{account.referenceId}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {org && (
                            <Card>
                                <CardContent className="p-4">
                                    <h3 className="font-semibold text-sm flex items-center mb-3">
                                        <Building2 className="mr-2 h-4 w-4" />
                                        Thông tin tổ chức
                                    </h3>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div className="flex flex-col">
                                            <span className="text-muted-foreground">Tên tổ chức</span>
                                            <span className="font-medium">{org.name}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-muted-foreground">Mã tổ chức</span>
                                            <span className="font-medium">{org.organizationCode}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-muted-foreground">Email liên hệ</span>
                                            <span className="font-medium">{org.contactEmail}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-muted-foreground">Điện thoại liên hệ</span>
                                            <span className="font-medium flex items-center">
                                                <Phone className="mr-1 h-4 w-4" />
                                                {org.contactPhone}
                                            </span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-muted-foreground">Mã số thuế</span>
                                            <span className="font-medium">{org.taxId || "Không có"}</span>
                                        </div>
                                        <div className="col-span-2 flex flex-col">
                                            <span className="text-muted-foreground">Mô tả</span>
                                            <span className="font-medium">{org.description || "Không có"}</span>
                                        </div>
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