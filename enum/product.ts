export enum EProductSize {
    S = "S",
    M = "M",
    L = "L"
}

export enum EProductType {
    Single = "Single",
    Parent = "Parent",
    Child = "Child"
}

export enum EProductStatus {
    Selling = "Selling",
    UnSelling = "UnSelling"
}

export const EProductStatusViMap: Record<string, string> = {
    [EProductStatus.Selling]: "Đang bán",
    [EProductStatus.UnSelling]: "Ngừng bán",
};

export const EProductSizeViMap: Record<string, string> = {
    [EProductSize.S]: "Nhỏ",
    [EProductSize.M]: "Trung",
    [EProductSize.L]: "Lớn",
};

export const EProductTypeViMap: Record<string, string> = {
    [EProductType.Single]: "Đơn",
    [EProductType.Parent]: "Cha",
    [EProductType.Child]: "Con",
};