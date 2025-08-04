import { ENotificationType, EReferenceType, ESeverity } from "@/enum/notification";
import { Account } from "./account";

export interface Notification {
    notificationId: string;
    title: string;
    message: string;
    notificationType: ENotificationType;
    referenceId: string;
    referenceType: EReferenceType;
    severity: ESeverity;
    createdBy: string;
    notificationRecipients: NotificationRecipient[];
    createdDate: string;
    isRead: boolean;
}

export interface NotificationRecipient {
    notificationRecipientId: string;
    notificationId: string;
    notification: Omit<Notification, "notificationRecipients">;
    accountRole: string;
    accountId: string;
    account: Account;
    isRead: boolean;
    readDate?: string;
}
