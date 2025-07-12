// @ts-nocheck
import { StateCreator } from 'zustand';
import { Account } from '@/interfaces/account';
import { BaseService } from '@/services/base.service';
import { Api } from '@/constants/api.constant';
import { ApiResponse } from '@/types/api';

export interface AccountSlice {
    account: Account | null;
    loading: boolean;
    error: string | null;
    setAccount: (account: Account | null) => void;
    clearAccount: () => void;
    fetchAccount: () => Promise<void>;
}

export const createAccountSlice: StateCreator<
    AccountSlice,
    [['zustand/immer', never]],
    [],
    AccountSlice
> = (set) => ({
    account: null,
    loading: false,
    error: null,

    setAccount: (account) => {
        set((state) => {
            state.account = account;
            state.error = null;
        });
    },

    clearAccount: () => {
        set((state) => {
            state.account = null;
            state.error = null;
        });
    },

    fetchAccount: async () => {
        set((state) => {
            state.loading = true;
            state.error = null;
        });
        try {
            const res = await BaseService.get<ApiResponse<Account>>({
                url: Api.GET_CURRENT_ACCOUNT,
            });

            if (res.isSuccess && res.statusCode === 200 && res.response) {
                set((state) => {
                    state.account = res.response;
                    state.loading = false;
                });
            } else {
                throw new Error(res.message || 'Không lấy được thông tin tài khoản');
            }
        } catch (error: any) {
            set((state) => {
                state.error = error.message || 'Lỗi không xác định';
                state.loading = false;
            });
        }
    },
});
