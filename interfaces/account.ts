import { EBaseStatus } from "@/enum/base";

export interface Account {
    accountId: string,
    fullName: string,
    email: string,
    roleName: string,
    status: EBaseStatus,
    isBanned: boolean,
    referenceId: string,
}