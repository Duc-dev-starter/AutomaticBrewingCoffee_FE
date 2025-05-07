import { Device, DeviceModel, DeviceType } from "@/interfaces/device";
import { Product } from "../interfaces/product";
import { Kiosk } from "@/interfaces/kiosk";
import { Menu } from "@/interfaces/menu";
import { Order } from "@/interfaces/order";
import { Workflow } from "@/interfaces/workflow";
import { LocationType } from "@/interfaces/location";
import { Organization } from "@/interfaces/organization";
import { Store } from "@/interfaces/store";

type BaseDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
};

export type DeviceDialogProps = BaseDialogProps & {
    device?: Device | null;
    deviceType?: DeviceType | null;
    deviceModel?: DeviceModel | null;
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

export type StoreDialogProps = BaseDialogProps & {
    store?: Store | null;
}