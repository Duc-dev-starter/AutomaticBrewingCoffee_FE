import { create, StateCreator } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

type CreateStoreOptions = {
    name: string;
    storage?: Storage;
    enableDevtools?: boolean;
};

export function createStore<T>(
    initializer: StateCreator<
        T,
        [["zustand/immer", never]],
        [],
        T
    >,
    options: CreateStoreOptions
) {
    const base = persist(
        immer(initializer),
        {
            name: options.name,
            storage: createJSONStorage(() => options.storage ?? localStorage),
        }
    );

    if (options.enableDevtools) {
        return create<
            T,
            [["zustand/devtools", never], ["zustand/persist", unknown], ["zustand/immer", never]]
        >(devtools(base, { name: options.name }));
    }

    return create<
        T,
        [["zustand/persist", unknown], ["zustand/immer", never]]
    >(base);
}
