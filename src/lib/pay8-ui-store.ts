import { create } from "zustand";
import type { ScreenId, TransactionType } from "./types";

interface Pay8UiState {
  // Navigation
  screen: ScreenId;
  screenStack: ScreenId[];
  navigate: (screen: ScreenId) => void;
  goBack: () => void;
  resetToHome: () => void;

  // Modals
  pinPadOpen: boolean;
  pinPadPurpose: string;
  pinPadOnSuccess: (() => void) | null;
  openPinPad: (purpose: string, onSuccess: () => void) => void;
  closePinPad: () => void;

  // Toast
  toastQueue: Array<{ id: string; title: string; description?: string; variant?: "default" | "success" | "error" | "warning" }>;
  showToast: (t: { title: string; description?: string; variant?: "default" | "success" | "error" | "warning" }) => void;
  dismissToast: (id: string) => void;

  // Send Money / Bank Transfer draft (so multiple steps can share state)
  draft: {
    recipientName?: string;
    recipientHandle?: string;
    bankCode?: string;
    amount?: number;
    note?: string;
    fee?: number;
    reference?: string;
    txnType?: TransactionType;
  };
  setDraft: (patch: Pay8UiState["draft"]) => void;
  clearDraft: () => void;

  // Active transaction filter
  txFilter: TransactionType | "all";
  setTxFilter: (f: TransactionType | "all") => void;
}

export const usePay8Ui = create<Pay8UiState>((set, get) => ({
  screen: "home",
  screenStack: ["home"],
  navigate: (screen) =>
    set((s) => ({
      screen,
      screenStack: [...s.screenStack.filter((x) => x !== screen), screen],
    })),
  goBack: () =>
    set((s) => {
      if (s.screenStack.length <= 1) return s;
      const next = [...s.screenStack];
      next.pop();
      return { screenStack: next, screen: next[next.length - 1] };
    }),
  resetToHome: () => set({ screen: "home", screenStack: ["home"] }),

  pinPadOpen: false,
  pinPadPurpose: "",
  pinPadOnSuccess: null,
  openPinPad: (purpose, onSuccess) =>
    set({ pinPadOpen: true, pinPadPurpose: purpose, pinPadOnSuccess: onSuccess }),
  closePinPad: () => set({ pinPadOpen: false, pinPadPurpose: "", pinPadOnSuccess: null }),

  toastQueue: [],
  showToast: (t) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    set((s) => ({ toastQueue: [...s.toastQueue, { id, ...t }] }));
    setTimeout(() => {
      get().dismissToast(id);
    }, 3500);
  },
  dismissToast: (id) =>
    set((s) => ({ toastQueue: s.toastQueue.filter((t) => t.id !== id) })),

  draft: {},
  setDraft: (patch) => set((s) => ({ draft: { ...s.draft, ...patch } })),
  clearDraft: () => set({ draft: {} }),

  txFilter: "all",
  setTxFilter: (f) => set({ txFilter: f }),
}));
