"use client";

import { formatCurrency, formatDateTime, dateGroupKey } from "@/lib/pay8-utils";
import type { Transaction } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ArrowDownLeft, ArrowUpRight, Banknote, CreditCard, Coins, Lightbulb, QrCode, Smartphone, Wallet } from "lucide-react";

function iconFor(type: Transaction["type"]) {
  switch (type) {
    case "send": return { icon: ArrowUpRight, color: "text-destructive bg-destructive/10" };
    case "receive": return { icon: ArrowDownLeft, color: "text-accent bg-accent/10" };
    case "cashin": return { icon: Wallet, color: "text-accent bg-accent/10" };
    case "cashout": return { icon: Banknote, color: "text-amber-600 bg-amber-100" };
    case "bankout": return { icon: ArrowUpRight, color: "text-destructive bg-destructive/10" };
    case "bankin": return { icon: ArrowDownLeft, color: "text-accent bg-accent/10" };
    case "bills": return { icon: Lightbulb, color: "text-primary bg-primary/10" };
    case "qrpay": return { icon: QrCode, color: "text-primary bg-primary/10" };
    case "cardload": return { icon: CreditCard, color: "text-accent bg-accent/10" };
    case "cardspend": return { icon: CreditCard, color: "text-destructive bg-destructive/10" };
    case "topup": return { icon: Smartphone, color: "text-primary bg-primary/10" };
    default: return { icon: Coins, color: "text-muted-foreground bg-muted" };
  }
}

export function TransactionItem({ tx, onClick }: { tx: Transaction; onClick?: () => void }) {
  const { icon: Icon, color } = iconFor(tx.type);
  const inflow = tx.type === "receive" || tx.type === "cashin" || tx.type === "bankin";
  const signed = inflow ? tx.amount : -tx.amount;

  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors hover:bg-muted/50"
    >
      <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", color)}>
        <Icon className="h-5 w-5" strokeWidth={2.2} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="truncate text-sm font-medium text-foreground">{tx.counterparty}</div>
        <div className="truncate text-xs text-muted-foreground">
          {tx.counterpartyHandle ? `${tx.counterpartyHandle} · ` : ""}{formatDateTime(tx.createdAt)}
        </div>
      </div>
      <div className="text-right">
        <div className={cn("font-mono text-sm font-semibold", inflow ? "text-accent" : "text-foreground")}>
          {formatCurrency(signed, { showSign: true })}
        </div>
        <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{tx.status}</div>
      </div>
    </button>
  );
}

export function TransactionGroup({ transactions, onSelect }: { transactions: Transaction[]; onSelect?: (tx: Transaction) => void }) {
  const groups = transactions.reduce<Record<string, Transaction[]>>((acc, tx) => {
    const key = dateGroupKey(tx.createdAt);
    if (!acc[key]) acc[key] = [];
    acc[key].push(tx);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {Object.entries(groups).map(([label, items]) => (
        <div key={label}>
          <div className="mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
          <div className="divide-y divide-border rounded-2xl border border-border bg-card">
            {items.map((tx) => (
              <TransactionItem key={tx.id} tx={tx} onClick={() => onSelect?.(tx)} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
