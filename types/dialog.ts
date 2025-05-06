import { Device } from "@/interfaces/device";
import { Product } from "../interfaces/product";
import { Franchise } from "@/interfaces/franchise";
import { Kiosk } from "@/interfaces/kiosk";
import { Menu } from "@/interfaces/menu";
import { Order } from "@/interfaces/order";
import { Workflow } from "@/interfaces/workflow";
import { LocationType } from "@/interfaces/location";
import { Organization } from "@/interfaces/organization";

type BaseDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
};

export type DeviceDialogProps = BaseDialogProps & {
    device?: Device | null;
}

export type FranchiseDialogProps = BaseDialogProps & {
    franchise?: Franchise | null;
}

export type KioskDialogProps = BaseDialogProps & {
    kiosk?: Kiosk | null;
}

export type MenuDialogProps = BaseDialogProps & {
    menu?: Menu | null;
}

export type ProductDialogProps = BaseDialogProps & {
    product?: Product | null;
};

export type OrderDialogProps = BaseDialogProps & {
    order?: Order | null;
}

export type WorkflowDialogProps = BaseDialogProps & {
    workflow?: Workflow | null;
}

export type LocationTypeDialogProps = BaseDialogProps & {
    locationType?: LocationType | null;
}

export type OrganizationDialogProps = BaseDialogProps & {
    organization?: Organization | null;
}