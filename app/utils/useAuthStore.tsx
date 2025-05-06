// app/utils/useAuthStore.ts
import { create } from "zustand";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";

interface AuthState {
  user: User | null;
  checked: boolean;
  profileStep: number; // <--- new
  setAuthUser: (user: User | null) => void;
  setChecked: (checked: boolean) => void;
  setProfileStep: (step: number) => void; // <--- new
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  checked: false,
  profileStep: 0,
  setAuthUser: (user) => set({ user }),
  setChecked: (checked) => set({ checked }),
  setProfileStep: (step) => set({ profileStep: step }),
}));
