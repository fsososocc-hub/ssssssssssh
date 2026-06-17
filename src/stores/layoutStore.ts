import { create } from 'zustand';

interface LayoutState {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  isMobile: boolean;
  setIsMobile: (mobile: boolean) => void;
  settingsToast: string | null;
  showSettingsToast: (msg: string) => void;
  clearSettingsToast: () => void;
}

export const useLayoutStore = create<LayoutState>((set) => ({
  currentTab: 'home',
  setCurrentTab: (tab) => set({ currentTab: tab }),
  isMobile: false,
  setIsMobile: (mobile) => set({ isMobile: mobile }),
  settingsToast: null,
  showSettingsToast: (msg) => {
    set({ settingsToast: msg });
    setTimeout(() => {
      set({ settingsToast: null });
    }, 3000);
  },
  clearSettingsToast: () => set({ settingsToast: null }),
}));
