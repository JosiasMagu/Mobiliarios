import { create } from "zustand";

type UIState = {
  menuOpen: boolean;
  setMenuOpen: (v: boolean) => void;
  toggleMenu?: () => void;
};

export const useUIStore = create<UIState>((set, get) => ({
  menuOpen: false,
  setMenuOpen: (v) => set({ menuOpen: v }),
  toggleMenu: () => set({ menuOpen: !get().menuOpen }),
}));
