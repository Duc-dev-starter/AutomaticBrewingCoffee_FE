import { Product } from "../interfaces/product";

type BaseDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
};

type ProductDialogProps = BaseDialogProps & {
    product?: Product;
};
