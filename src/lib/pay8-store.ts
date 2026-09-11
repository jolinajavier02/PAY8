import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  AccountLevel,
  Biller,
  CardTransaction,
  LinkedBankAccount,
  Notification,
  Pay8Card,
  Payee,
  Transaction,
  UserProfile,
  Verification,
} from "./types";
import {
  BANKS,
  BILLERS,
  CASHIN_PARTNERS,
  generateId,
  generatePan,
  generateReference,
} from "./pay8-utils";

/** Build a set of demo transactions so the wallet feels alive on first load. */
function seedTransactions(cardId: string): Transaction[] {
  const now = Date.now();
  const entries: Array<Partial<Transaction> & { type: Transaction["type"]; amount: number; counterparty: string }> = [
    { type: "receive", amount: 2500, counterparty: "Maria Santos", counterpartyHandle: "0917 234 5678", note: "Split — dinner last night", t: now - 1000 * 60 * 35 },
    { type: "qrpay", amount: 285, counterparty: "Coffee Project — Katipunan", counterpartyHandle: "MP-8821", note: "Iced latte + croissant", t: now - 1000 * 60 * 60 * 4 },
    { type: "cardload", amount: 500, counterparty: "PAY8 Card", counterpartyHandle: `•••• ${cardId}`, note: "Auto-reload triggered", t: now - 1000 * 60 * 60 * 6 },
    { type: "send", amount: 1200, counterparty: "Juan Dela Cruz", counterpartyHandle: "0918 765 4321", note: "Squad contribution", t: now - 1000 * 60 * 60 * 26 },
    { type: "bills", amount: 1874.5, counterparty: "MERALCO", counterpartyHandle: "Acct 5512 9087", note: "Electricity — Aug", t: now - 1000 * 60 * 60 * 50 },
    { type: "bankout", amount: 3500, counterparty: "BPI", counterpartyHandle: "•••• 4521", note: "Tuition top-up", t: now - 1000 * 60 * 60 * 75 },
    { type: "cashin", amount: 5000, counterparty: "7-Eleven (CLiQQ)", counterpartyHandle: "Ref CL8X-2284", t: now - 1000 * 60 * 60 * 100 },
    { type: "receive", amount: 800, counterparty: "Andrea Lim", counterpartyHandle: "0920 111 2222", note: "Birthday gift", t: now - 1000 * 60 * 60 * 120 },
    { type: "topup", amount: 99, counterparty: "Globe Prepaid", counterpartyHandle: "0917 234 5678", note: "GoSURF 99", t: now - 1000 * 60 * 60 * 144 },
    { type: "qrpay", amount: 1450, counterparty: "Robinsons Supermarket", counterpartyHandle: "MP-1182", note: "Groceries", t: now - 1000 * 60 * 60 * 168 },
  ];

  return entries.map((e, i) => ({
    id: `seed_tx_${i}`,
    type: e.type,
    status: "completed" as const,
    amount: e.amount,
    counterparty: e.counterparty,
    counterpartyHandle: e.counterpartyHandle,
    reference: generateReference(),
    note: e.note,
    createdAt: new Date(e.t ?? now).toISOString(),
    fee: e.type === "bankout" ? 25 : e.type === "qrpay" ? 0 : 0,
  }));
}

function seedCardTransactions(): CardTransaction[] {
  const now = Date.now();
  return [
    { id: "ct1", title: "MRT-3 Quezon Ave → Taft Ave", station: "MRT-3", amount: 13, type: "transit", createdAt: new Date(now - 1000 * 60 * 60 * 8).toISOString() },
    { id: "ct2", title: "7-Eleven Quezon City", station: "QC", amount: 89, type: "transit", createdAt: new Date(now - 1000 * 60 * 60 * 30).toISOString() },
    { id: "ct3", title: "Card top-up via wallet", station: "PAY8", amount: -500, type: "topup", createdAt: new Date(now - 1000 * 60 * 60 * 30).toISOString() },
    { id: "ct4", title: "LRT-2 Recto → Santolan", station: "LRT-2", amount: 25, type: "transit", createdAt: new Date(now - 1000 * 60 * 60 * 50).toISOString() },
    { id: "ct5", title: "Ministop snack run", station: "Makati", amount: 145, type: "transit", createdAt: new Date(now - 1000 * 60 * 60 * 72).toISOString() },
  ];
}

function seedCard(): Pay8Card {
  const pan = generatePan();
  const expiry = `${String(((new Date().getMonth() + 8) % 12) + 1).padStart(2, "0")}/${String((new Date().getFullYear() + 2) % 100).padStart(2, "0")}`;
  return {
    id: pan.last4,
    number: pan.last4,
    fullNumber: pan.full,
    expiry,
    cvv: "8" + Math.floor(Math.random() * 900 + 100).toString().slice(0, 2),
    balance: 325.5,
    status: "active",
    autoReload: true,
    autoReloadThreshold: 100,
    autoReloadAmount: 500,
    issuedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    transactions: seedCardTransactions(),
  };
}

const defaultProfile: UserProfile = {
  firstName: "Alex",
  middleName: "Reyes",
  lastName: "Santos",
  mobile: "0917 234 5678",
  email: "alex.santos@email.com",
  birthdate: "1996-04-12",
  sex: "male",
  address: "123 Mahogany St, Brgy. Sto. Niño",
  city: "Quezon City",
  province: "Metro Manila",
  postalCode: "1110",
  occupation: "Software Engineer",
  sourceOfFunds: "Salary",
  pay8Id: "09172345678",
  avatarColor: "violet",
};

const defaultVerification: Verification = {
  status: "unverified",
  level: "basic",
  stepsCompleted: {
    personalInfo: true,
    idTypeSelected: false,
    idFrontUploaded: false,
    idBackUploaded: false,
    selfieCaptured: false,
    reviewConfirmed: false,
  },
};

const defaultCard = seedCard();
const defaultTx = seedTransactions(defaultCard.id);

const defaultNotifications: Notification[] = [
  {
    id: "n1",
    title: "Received ₱2,500.00",
    body: "From Maria Santos · Ref P8-240911-AB12CD",
    type: "transaction",
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
  },
  {
    id: "n2",
    title: "🎉 Lucky payday is live",
    body: "Send money this week to enter the ₱88,888 draw.",
    type: "promo",
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
  },
  {
    id: "n3",
    title: "Verify your account",
    body: "Unlock higher limits, bank transfers, and card perks by completing KYC.",
    type: "verification",
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
];

interface Pay8State {
  // Profile & verification
  profile: UserProfile;
  verification: Verification;
  pin: string; // 6-digit PIN

  // Wallet
  balance: number;
  transactions: Transaction[];

  // PAY8 transit card
  card: Pay8Card;

  // Saved payees / banks
  linkedAccounts: LinkedBankAccount[];
  payees: Payee[];

  // Notifications
  notifications: Notification[];

  // UI state (not persisted)
  isPinSet: boolean;

  // Auth / onboarding
  isAuthed: boolean;
  authCountry: "PH" | "JP" | "IN";   // selected country code during registration
  authPhone: string;                  // full E.164-ish, e.g. +639171234567

  // Actions
  setProfile: (patch: Partial<UserProfile>) => void;
  updateVerification: (patch: Partial<Verification>) => void;
  setPin: (pin: string) => void;
  verifyPin: (pin: string) => boolean;

  // Auth lifecycle
  setAuthCountry: (c: "PH" | "JP" | "IN") => void;
  setAuthPhone: (phone: string) => void;
  setAuthed: (v: boolean) => void;
  logout: () => void;

  addTransaction: (tx: Omit<Transaction, "id" | "reference" | "createdAt"> & Partial<Pick<Transaction, "id" | "reference" | "createdAt">>) => Transaction;
  adjustBalance: (delta: number) => void;
  setBalance: (amount: number) => void;

  loadCard: (amount: number) => void;
  spendCard: (amount: number, title: string, station?: string) => void;
  toggleCardFreeze: () => void;
  updateCard: (patch: Partial<Pay8Card>) => void;

  addLinkedAccount: (acc: Omit<LinkedBankAccount, "id">) => LinkedBankAccount;
  removeLinkedAccount: (id: string) => void;
  addPayee: (p: Omit<Payee, "id">) => Payee;

  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addNotification: (n: Omit<Notification, "id" | "createdAt" | "read">) => void;

  resetAll: () => void;
}

export const usePay8 = create<Pay8State>()(
  persist(
    (set, get) => ({
      profile: defaultProfile,
      verification: defaultVerification,
      pin: "123456",
      balance: 18425.5,
      transactions: defaultTx,
      card: defaultCard,
      linkedAccounts: [
        {
          id: "la1",
          bankCode: "BPI",
          accountNumber: "•••• 4521",
          accountName: "ALEX REYES SANTOS",
          accountType: "savings",
          nickname: "Payroll",
        },
      ],
      payees: [
        {
          id: "py1",
          name: "Juan Dela Cruz",
          accountNumber: "09187654321",
          bankCode: "GXB",
          type: "bank",
          nickname: "Kuya Juan",
        },
        {
          id: "py2",
          name: "Andrea Lim",
          accountNumber: "09201112222",
          bankCode: "MAY",
          type: "bank",
          nickname: "Ands",
        },
      ],
      notifications: defaultNotifications,
      isPinSet: true,

      isAuthed: false,
      authCountry: "PH",
      authPhone: "",

      setProfile: (patch) => set((s) => ({ profile: { ...s.profile, ...patch } })),

      updateVerification: (patch) =>
        set((s) => ({ verification: { ...s.verification, ...patch } })),

      setPin: (pin) => set({ pin }),
      verifyPin: (pin) => pin === get().pin,

      setAuthCountry: (c) => set({ authCountry: c }),
      setAuthPhone: (phone) => set({ authPhone: phone }),
      setAuthed: (v) => set({ isAuthed: v }),
      logout: () => set({ isAuthed: false, authPhone: "" }),

      addTransaction: (tx) => {
        const full: Transaction = {
          id: tx.id ?? generateId("tx"),
          type: tx.type,
          status: tx.status ?? "completed",
          amount: tx.amount,
          counterparty: tx.counterparty,
          counterpartyHandle: tx.counterpartyHandle,
          reference: tx.reference ?? generateReference(),
          note: tx.note,
          createdAt: tx.createdAt ?? new Date().toISOString(),
          fee: tx.fee ?? 0,
        };
        set((s) => ({ transactions: [full, ...s.transactions] }));
        return full;
      },

      adjustBalance: (delta) => set((s) => ({ balance: s.balance + delta })),
      setBalance: (amount) => set({ balance: amount }),

      loadCard: (amount) =>
        set((s) => {
          if (s.balance < amount) return s;
          const cardTx: CardTransaction = {
            id: generateId("ct"),
            title: "Top-up from PAY8 wallet",
            station: "PAY8",
            amount: -amount,
            type: "topup",
            createdAt: new Date().toISOString(),
          };
          return {
            balance: s.balance - amount,
            card: {
              ...s.card,
              balance: s.card.balance + amount,
              transactions: [cardTx, ...s.card.transactions],
            },
          };
        }),

      spendCard: (amount, title, station) =>
        set((s) => {
          if (s.card.balance < amount || s.card.status !== "active") return s;
          const cardTx: CardTransaction = {
            id: generateId("ct"),
            title,
            station,
            amount,
            type: "transit",
            createdAt: new Date().toISOString(),
          };
          return {
            card: {
              ...s.card,
              balance: s.card.balance - amount,
              transactions: [cardTx, ...s.card.transactions],
            },
          };
        }),

      toggleCardFreeze: () =>
        set((s) => ({
          card: {
            ...s.card,
            status: s.card.status === "active" ? "frozen" : "active",
          },
        })),

      updateCard: (patch) => set((s) => ({ card: { ...s.card, ...patch } })),

      addLinkedAccount: (acc) => {
        const newAcc: LinkedBankAccount = { ...acc, id: generateId("la") };
        set((s) => ({ linkedAccounts: [...s.linkedAccounts, newAcc] }));
        return newAcc;
      },

      removeLinkedAccount: (id) =>
        set((s) => ({ linkedAccounts: s.linkedAccounts.filter((a) => a.id !== id) })),

      addPayee: (p) => {
        const newPayee: Payee = { ...p, id: generateId("py") };
        set((s) => ({ payees: [...s.payees, newPayee] }));
        return newPayee;
      },

      markNotificationRead: (id) =>
        set((s) => ({
          notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
        })),

      markAllNotificationsRead: () =>
        set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),

      addNotification: (n) =>
        set((s) => ({
          notifications: [
            { ...n, id: generateId("n"), createdAt: new Date().toISOString(), read: false },
            ...s.notifications,
          ],
        })),

      resetAll: () =>
        set({
          profile: defaultProfile,
          verification: defaultVerification,
          pin: "123456",
          balance: 18425.5,
          transactions: defaultTx,
          card: defaultCard,
          linkedAccounts: [],
          payees: [],
          notifications: defaultNotifications,
          isPinSet: true,
          isAuthed: false,
          authCountry: "PH",
          authPhone: "",
        }),
    }),
    {
      name: "pay8-wallet-v1",
      partialize: (s) => ({
        profile: s.profile,
        verification: s.verification,
        pin: s.pin,
        balance: s.balance,
        transactions: s.transactions,
        card: s.card,
        linkedAccounts: s.linkedAccounts,
        payees: s.payees,
        notifications: s.notifications,
        isPinSet: s.isPinSet,
        isAuthed: s.isAuthed,
        authCountry: s.authCountry,
        authPhone: s.authPhone,
      }),
    },
  ),
);

/** Expose bank/biller/partner catalogs for the UI. */
export const CATALOG = {
  banks: BANKS,
  billers: BILLERS as readonly Biller[],
  cashInPartners: CASHIN_PARTNERS,
};
