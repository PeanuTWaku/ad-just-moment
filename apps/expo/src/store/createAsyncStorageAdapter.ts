import AsyncStorage from "@react-native-async-storage/async-storage";
import { type PersistStorage, type StorageValue } from "zustand/middleware";

export const createAsyncStorageAdapter = <S>(): PersistStorage<S> => {
  return {
    getItem: async (key: string) => {
      const value = await AsyncStorage.getItem(key);
      return value ? (JSON.parse(value) as StorageValue<S>) : null;
    },
    setItem: async (key: string, value: StorageValue<S>) => {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    },
    removeItem: async (key: string) => {
      await AsyncStorage.removeItem(key);
    },
  };
};
