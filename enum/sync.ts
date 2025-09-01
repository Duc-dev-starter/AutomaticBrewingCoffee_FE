export enum ESyncEventType {
    Create = "Create",
    Update = "Update",
    Delete = "Delete"
}


export enum EEntityType {
    Product = "Product",
    Workflow = "Workflow",
    Step = "Step",
    Menu = "Menu",
    MenuProductMapping = "MenuProductMapping"
}

export const ESyncEventTypeViMap: Record<ESyncEventType, string> = {
    [ESyncEventType.Create]: "Tạo mới",
    [ESyncEventType.Update]: "Cập nhật",
    [ESyncEventType.Delete]: "Xoá",
};
