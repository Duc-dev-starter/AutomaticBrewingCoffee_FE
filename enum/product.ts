export enum EProductSize {
    S = "S",
    M = "M",
    L = "L"
}

export enum EProductType {
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
    [EProductType.Parent]: "Cha",
    [EProductType.Child]: "Con",
};


export enum EBaseUnit {
    Seconds = "Seconds",
    Milliliters = "Milliliters",
    Grams = "Grams",
    Piece = "Piece"
}

export const EBaseUnitViMap: Record<EBaseUnit, string> = {
    [EBaseUnit.Seconds]: "Giây",
    [EBaseUnit.Milliliters]: "Mililit",
    [EBaseUnit.Grams]: "Gam",
    [EBaseUnit.Piece]: "Cái"
};


export enum EIngredientType {
    Sugar = "Sugar",
    CondensedMilk = "CondensedMilk",
    Ice = "Ice",
    Coffee = "Coffee",
    Water = "Water",
    Milk = "Milk",
    Cup = "Cup",
}

export const EIngredientTypeViMap: Record<EIngredientType, string> = {
    [EIngredientType.Sugar]: "Đường",
    [EIngredientType.CondensedMilk]: "Sữa đặc",
    [EIngredientType.Ice]: "Đá",
    [EIngredientType.Coffee]: "Cà phê",
    [EIngredientType.Water]: "Nước",
    [EIngredientType.Milk]: "Sữa",
    [EIngredientType.Cup]: "Cốc",
};
