import { create } from 'zustand';
import { StoreSettings } from '../types';
import { INITIAL_SETTINGS } from '../data/mockData';

interface ShopState {
  settings: StoreSettings;
  setSettings: (settings: StoreSettings) => void;
  updateSettings: (settings: Partial<StoreSettings>) => void;
}

const getStoredSettings = (): StoreSettings => {
  const saved = localStorage.getItem('shopify_mock_settings');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      return { ...INITIAL_SETTINGS, ...parsed };
    } catch (e) {
      return INITIAL_SETTINGS;
    }
  }
  return INITIAL_SETTINGS;
};

export const useShopStore = create<ShopState>((set, get) => ({
  settings: getStoredSettings(),
  setSettings: (settings) => {
    set({ settings });
    localStorage.setItem('shopify_mock_settings', JSON.stringify(settings));
  },
  updateSettings: (updated) => {
    const fresh = { ...get().settings, ...updated };
    set({ settings: fresh });
    localStorage.setItem('shopify_mock_settings', JSON.stringify(fresh));
  },
}));
