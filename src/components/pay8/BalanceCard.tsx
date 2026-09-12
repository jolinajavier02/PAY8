"use client";

import { useState } from "react";
import { usePay8 } from "@/lib/pay8-store";
import { usePay8Ui } from "@/lib/pay8-ui-store";
import { ArrowUpRight, BadgeCheck, Eye, EyeOff, Landmark, Plus } from "lucide-react";
import { formatCurrency } from "@/lib/pay8-utils";
import { motion } from "framer-motion";
import type { TransactionType } from "@/lib/types";

export function BalanceCard() {
  const balance = usePay8((s) => s.balance);
  const profile = usePay8((s) => s.profile);
  const verification = usePay8((s) => s.verification);
  const navigate = usePay8Ui((s) => s.navigate);
  const [hidden, setHidden] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-3xl shadow-lg shadow-primary/10"
    >
      <div className="pay8-gradient-navy absolute inset-0 rounded-3xl" />
      <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -left-10 -bottom-14 h-32 w-32 rounded-full bg-amber-400/15 blur-3xl" />

      <div className="relative rounded-3xl p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs text-white/70">
              <span>Available balance</span>
              <button onClick={() => setHidden((h) => !h)} className="rounded-full p-0.5 hover:bg-white/10">
                {hidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
            <div className="mt-1 font-mono text-3xl font-bold tracking-tight text-white">
              {hidden ? "₱ • • • • • •. • •" : formatCurrency(balance)}
            </div>
            <div className="mt-1 text-xs text-white/70">{profile.firstName} · {profile.pay8Id}</div>
          </div>
          <button
            onClick={() => navigate("profile")}
            className="flex shrink-0 items-center gap-1.5 rounded-full bg-white/12 px-2.5 py-1.5 text-[10px] font-semibold uppercase text-white"
          >
            <BadgeCheck className={verification.status === "verified" ? "h-3.5 w-3.5 text-emerald-300" : "h-3.5 w-3.5 text-amber-300"} />
            {verification.level}
          </button>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-2">
          <QuickAction label="Send" icon={ArrowUpRight} onClick={() => navigate("send")} />
          <QuickAction label="Cash In" icon={Plus} onClick={() => navigate("cashin")} />
          <QuickAction label="Transfer" icon={Landmark} onClick={() => navigate("bank")} />
        </div>
      </div>
    </motion.div>
  );
}

function QuickAction({ label, icon: Icon, onClick }: { label: string; icon: typeof Eye; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group flex flex-col items-center gap-1.5 rounded-2xl bg-white/10 px-2 py-2.5 text-white transition-all hover:bg-white/20 active:scale-95"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
        <Icon className="h-5 w-5 transition-transform group-active:scale-90" strokeWidth={label === "Send" ? 3 : 2.5} />
      </span>
      <span className="text-[11px] font-medium">{label}</span>
    </button>
  );
}

export function getTxMeta(type: TransactionType, amount: number) {
  const inflow = type === "receive" || type === "cashin" || type === "bankin";
  const label =
    type === "send" ? "Sent"
    : type === "receive" ? "Received"
    : type === "cashin" ? "Cash In"
    : type === "cashout" ? "Cash Out"
    : type === "bankout" ? "Bank Out"
    : type === "bankin" ? "Bank In"
    : type === "bills" ? "Bills"
    : type === "qrpay" ? "QR Payment"
    : type === "cardload" ? "Card Load"
    : type === "cardspend" ? "Card Spend"
    : "Load Purchase";

  return { inflow, label, signed: inflow ? amount : -amount };
}
