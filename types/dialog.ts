import { Device, DeviceIngredientHistory, DeviceIngredientStates, DeviceModel, DeviceType } from "@/interfaces/device";
import { Product } from "../interfaces/product";
import { Kiosk, KioskType, KioskVersion } from "@/interfaces/kiosk";
import { Menu } from "@/interfaces/menu";
import { Order } from "@/interfaces/order";
import { Workflow } from "@/interfaces/workflow";
import { LocationType } from "@/interfaces/location";
import { Organization } from "@/interfaces/organization";
import { Store } from "@/interfaces/store";
import { Category } from "@/interfaces/category";
import { Account } from "@/interfaces/account";
import { IngredientType } from "@/interfaces/ingredient";
import { SyncEvent, SyncTask } from "@/interfaces/sync";

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
    kioskType?: KioskType | null;
    kioskVersion?: KioskVersion | null;
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

export type WebhookDialogProps = BaseDialogProps & {
    kioskId: string;
}

export type CategoryDialogProps = BaseDialogProps & {
    category?: Category | null;
}

export type AccountDialogProps = BaseDialogProps & {
    account?: Account | null;
}

export type IngredientTypeDialogProps = BaseDialogProps & {
    ingredientType?: IngredientType | null;
}

export type SyncEventDialogProps = BaseDialogProps & {
    syncEvent?: SyncEvent | null;
}

export type SyncTaskDialogProps = BaseDialogProps & {
    syncTask?: SyncTask | null;
}

export type DeviceIngredientStatesDialogProps = BaseDialogProps & {
    deviceIngredientStates: DeviceIngredientStates[];
}

export type DeviceIngredientHistoryDialogProps = BaseDialogProps & {
    deviceIngredientHistory: DeviceIngredientHistory[];
}