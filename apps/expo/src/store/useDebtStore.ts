import { create } from "zustand";
import { persist } from "zustand/middleware";

import { createAsyncStorageAdapter } from "./createAsyncStorageAdapter";

type DebtStore = {
  debt: string[];
  isFull: () => boolean;
  addDebt: (adId: string) => boolean;
  payDebt: () => string | void;
  clearAllDebt: () => void;
};

export const MAX_DEBT = 5;

export const useDebtStore = create<DebtStore>()(
  persist(
    (set, get) => ({
      debt: [],
      isFull: () => get().debt.length >= MAX_DEBT,
      addDebt: (adId) => {
        if (get().debt.length + 1 > MAX_DEBT) return false;
        set((state) => ({ debt: [...state.debt, adId] }));
        return true;
      },
      payDebt: () => {
        if (get().debt.length === 0) return;
        const firstAd = get().debt[0];
        if (!firstAd) return;

        set((state) => ({ debt: state.debt.slice(1) }));
        return firstAd;
      },
      clearAllDebt: () => set({ debt: [] }),
    }),
    {
      name: "debt-storage",
      storage: createAsyncStorageAdapter<DebtStore>(),
    },
  ),
);
