import { create } from "zustand";
import { persist } from "zustand/middleware";

import { createAsyncStorageAdapter } from "./createAsyncStorageAdapter";

const adModes = ["ad debt", "snooze"] as const;
type AdMode = (typeof adModes)[number];

type AdModeStore = {
  adMode: AdMode;
  setAdMode: (adMode: AdMode) => void;
};

export const useAdMode = create<AdModeStore>()(
  persist(
    (set) => ({
      adMode: "snooze",
      setAdMode: (adMode) => set({ adMode }),
    }),
    {
      name: "ad-mode-storage",
      storage: createAsyncStorageAdapter<AdModeStore>(),
    },
  ),
);
