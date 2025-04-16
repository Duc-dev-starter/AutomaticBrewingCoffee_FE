export enum EBaseStatus {
    Active = "Active",
    Inactive = "Inactive",
}


export const EBaseStatusViMap: Record<string, string> = {
    [EBaseStatus.Active]: "Hoạt động",
    [EBaseStatus.Inactive]: "Không hoạt động",
};