import { create } from 'zustand'

interface User {
    id: string
    name: string
    email: string
}

interface AuthState {
    accessToken: string | null
    currentUser: User | null
    setAuth: (token: string, user: User) => void
    logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
    accessToken: null,
    currentUser: null,
    setAuth: (token, user) => set({ accessToken: token, currentUser: user }),
    logout: () => set({ accessToken: null, currentUser: null }),
}))
