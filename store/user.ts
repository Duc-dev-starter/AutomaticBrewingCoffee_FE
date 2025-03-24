import { create } from "zustand";

export const useUserStore = create((set) => ({
    user: {
        full_name: 'Duc'
    }
}))