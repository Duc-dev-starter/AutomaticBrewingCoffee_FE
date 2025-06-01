import { EBaseStatus } from "@/enum/base";
import { Organization } from "./organization";

export interface Account {
    accountId: string,
    fullName: string,
    email: string,
    roleName: string,
    status: EBaseStatus,
    isBanned: boolean,
    referenceId: string,
    organization?: Organization;
}