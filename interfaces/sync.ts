import { EEntityType, ESyncEventType } from "@/enum/sync";

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
    createdAt: string;
    isSynced: boolean;
}