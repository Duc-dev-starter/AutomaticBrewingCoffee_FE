import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Info, Calendar, FileText, Package } from "lucide-react";
import { IngredientType } from "@/interfaces/ingredient";
import { formatDate } from "@/utils/date";

const IngredientTypeDetailDialog = ({
    ingredientType,
    open,
    onOpenChange,
}: { ingredientType: IngredientType | null; open: boolean; onOpenChange: (open: boolean) => void }) => {
    if (!ingredientType) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-xl font-bold flex items-center">
                            <Package className="mr-2 h-5 w-5" />
                            Chi tiết loại nguyên liệu
                        </DialogTitle>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground mt-2">
                        <div className="flex items-center">
                            <FileText className="mr-1 h-4 w-4" />
                            Mã loại nguyên liệu: <span className="font-medium ml-1">{ingredientType.ingredientTypeId}</span>
                        </div>
                    </div>
                </DialogHeader>

                <ScrollArea className="flex-1 pr-4">
                    <div className="space-y-6 py-2">
                        <Card>
                            <CardContent className="p-4">
                                <h3 className="font-semibold text-sm flex items-center mb-3">
                                    <Info className="mr-2 h-4 w-4" />
                                    Thông tin loại nguyên liệu
                                </h3>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div className="flex flex-col">
                                        <span className="text-muted-foreground">Tên loại nguyên liệu</span>
                                        <span className="font-medium">{ingredientType.name}</span>
                                    </div>
                                    <div className="col-span-2 flex flex-col">
                                        <span className="text-muted-foreground">Mô tả</span>
                                        <span className="font-medium">{ingredientType.description || "Không có"}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-muted-foreground">Trạng thái</span>
                                        <span className="font-medium">{ingredientType.status}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
};

export default IngredientTypeDetailDialog;