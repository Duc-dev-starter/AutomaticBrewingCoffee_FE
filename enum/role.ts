export enum Roles {
    ADMIN = 'Admin',
    ORGANIZATION = 'Organization'
}

export const RoleViMap: Record<string, string> = {
    [Roles.ADMIN]: 'Quản trị viên',
    [Roles.ORGANIZATION]: 'Tổ chức'
}