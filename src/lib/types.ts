// PAY8 — core type definitions for the e-wallet domain

export type ScreenId =
  | "home"
  | "inbox"
  | "qrhub"
  | "transactions"
  | "profile"
  // secondary screens (pushed on top)
  | "send"
  | "bank"
  | "card"
  | "save8"
  | "commute"
  | "verify"
  | "cashin"
  | "paybills"
  | "settings"
  | "notifications";

export type AccountLevel = "basic" | "verified" | "premium";
export type VerificationStatus = "unverified" | "pending" | "verified" | "rejected";

export type TransactionType =
  | "send"        // money sent out to another PAY8 user
  | "receive"     // money received from another PAY8 user
  | "cashin"      // cash in from bank/card/OTC
  | "cashout"     // cash out to ATM/partner
  | "bankout"     // transfer to external bank
  | "bankin"      // transfer in from external bank
  | "bills"       // bill payment
  | "qrpay"       // paid a merchant via QR
  | "cardload"    // loaded PAY8 transit card
  | "cardspend"   // spent from PAY8 transit card
  | "topup";      // mobile load purchase

export type TransactionStatus = "completed" | "pending" | "failed";

export interface Transaction {
  id: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;        // always positive number; direction is implied by type
  counterparty: string;  // name or bank label
  counterpartyHandle?: string; // mobile number / account number / masked
  reference: string;
  note?: string;
  createdAt: string;    // ISO string
  fee?: number;
}

export interface Pay8Card {
  id: string;
  number: string;        // last 4 visible, e.g. "5678"
  fullNumber: string;   // mock full PAN
  expiry: string;       // "MM/YY"
  cvv: string;
  balance: number;
  status: "active" | "frozen";
  autoReload: boolean;
  autoReloadThreshold: number;
  autoReloadAmount: number;
  issuedAt: string;
  transactions: CardTransaction[];
}

export interface CardTransaction {
  id: string;
  title: string;          // e.g. "MRT-3 North Ave → Taft"
  station?: string;
  amount: number;         // positive = spent, negative = top-up
  type: "transit" | "topup" | "refund";
  createdAt: string;
}

export interface UserProfile {
  firstName: string;
  middleName?: string;
  lastName: string;
  suffix?: string;
  mobile: string;
  email: string;
  birthdate: string;      // ISO date
  sex?: "male" | "female" | "other";
  address: string;
  city: string;
  province: string;
  postalCode: string;
  occupation: string;
  sourceOfFunds?: string;
  pay8Id: string;         // unique PAY8 handle
  avatarColor: string;    // for generated avatar
  avatarCharacter?: "simple_girl" | "simple_boy" | "girly" | "boyish";
}

export interface Verification {
  status: VerificationStatus;
  level: AccountLevel;
  idType?: IdType;
  idNumber?: string;
  submittedAt?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  stepsCompleted: {
    personalInfo: boolean;
    idTypeSelected: boolean;
    idFrontUploaded: boolean;
    idBackUploaded: boolean;
    selfieCaptured: boolean;
    reviewConfirmed: boolean;
  };
}

export type IdType =
  | "PhilSys ID"
  | "Driver's License"
  | "Passport"
  | "UMID"
  | "SSS ID"
  | "GSIS ID"
  | "TIN ID"
  | "Postal ID"
  | "Voter's ID"
  | "PRC ID";

export interface BankInfo {
  code: string;
  name: string;
  shortName: string;
  color: string;       // hex for tile accent
  instapay: boolean;
  pesonet: boolean;
}

export interface LinkedBankAccount {
  id: string;
  bankCode: string;
  accountNumber: string; // masked
  accountName: string;
  accountType: "savings" | "checking";
  nickname?: string;
}

export interface Payee {
  id: string;
  name: string;
  accountNumber: string;
  bankCode: string;
  type: "bank" | "bill";
  category?: string;     // for bills: Electricity, Water, Internet, etc.
  nickname?: string;
}

export interface Biller {
  code: string;
  name: string;
  category: "Electricity" | "Water" | "Internet" | "Cable" | "Telecom" | "Credit Card" | "Government" | "Insurance" | "Education" | "Other";
  color: string;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  type: "transaction" | "promo" | "system" | "verification";
  read: boolean;
  createdAt: string;
}
