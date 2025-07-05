import { createStore } from './store';
import { AccountSlice, createAccountSlice } from './slices/account.slice';

const isClient = typeof window !== 'undefined';

export const useAppStore = createStore<AccountSlice>(
    (...args) => ({
        ...createAccountSlice(...args),
    }),
    {
        name: 'app-store',
        storage: isClient ? sessionStorage : undefined,
        enableDevtools: true,
    }
);
