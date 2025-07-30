import { Account } from "./account";

export interface Notification {
    notificationId: string;
    title: string;
    message: string;
    notificationType: string;
    referenceId: string;
    referenceType: string;
    severity: string;
    createdBy: string;
    notificationRecipients: NotificationRecipient[];
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
