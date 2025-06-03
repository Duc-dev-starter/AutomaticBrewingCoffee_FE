import { Account } from '@/interfaces/account';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';


type AccountStore = {
    account: Account | null;
    setAccount: (account: Account | null) => void;
    clearAccount: () => void;
};

export const useAccountStore = create<AccountStore>()(
    persist(
        (set) => ({
            account: null,
            setAccount: (account) => set({ account }),
            clearAccount: () => set({ account: null }),
        }),
        {
            name: 'account-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);