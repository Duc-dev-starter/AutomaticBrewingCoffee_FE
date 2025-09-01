import { EEntityType, ESyncEventType } from "@/enum/sync";
import { Kiosk } from "./kiosk";

export interface SyncEventTasks {
    syncTaskId: string;
    syncEventId: string;
    kioskId: string;
    createdAt: string;
    isSynced: boolean;
}

export interface SyncEvent {
    syncEventId: string;
    syncEventType: ESyncEventType;
    entityId: string;
    createdDate: string;
    entityType: EEntityType;
    syncTasks: SyncEventTasks[];
}

export interface SyncTask {
    syncTaskId: string;
    syncEventId: string;
    kioskId: string;
    syncEvent: SyncEvent;
    createdDate: string;
    isSynced: boolean;
    kiosk: Kiosk
}