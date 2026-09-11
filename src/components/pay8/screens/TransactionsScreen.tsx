"use client";

import { useMemo, useState } from "react";
import { usePay8 } from "@/lib/pay8-store";
import { usePay8Ui } from "@/lib/pay8-ui-store";
import { TransactionGroup } from "../TransactionItem";
import { formatCurrency } from "@/lib/pay8-utils";
import type { Transaction, TransactionType } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

const FILTERS: { id: TransactionType | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "receive", label: "In" },
  { id: "send", label: "Out" },
  { id: "cashin", label: "Cash In" },
  { id: "qrpay", label: "QR Pay" },
  { id: "bills", label: "Bills" },
  { id: "cardload", label: "Card" },
];

export function TransactionsScreen() {
  const transactions = usePay8((s) => s.transactions);
  const [filter, setFilter] = useState<TransactionType | "all">("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Transaction | null>(null);

  const filtered = useMemo(() => {
    let out = transactions;
    if (filter !== "all") {
      if (filter === "send") out = out.filter((t) => ["send", "bankout", "qrpay", "bills", "topup"].includes(t.type));
      else if (filter === "receive") out = out.filter((t) => ["receive", "bankin", "cashin"].includes(t.type));
      else if (filter === "cardload") out = out.filter((t) => t.type === "cardload" || t.type === "cardspend");
      else out = out.filter((t) => t.type === filter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      out = out.filter((t) =>
        t.counterparty.toLowerCase().includes(q) ||
        (t.counterpartyHandle ?? "").toLowerCase().includes(q) ||
        (t.note ?? "").toLowerCase().includes(q) ||
        t.reference.toLowerCase().includes(q),
      );
    }
    return out;
  }, [transactions, filter, search]);

  const totalIn = filtered.filter((t) => ["receive", "bankin", "cashin"].includes(t.type)).reduce((s, t) => s + t.amount, 0);
  const totalOut = filtered.filter((t) => ["send", "bankout", "bills", "qrpay", "cardload", "cardspend", "topup"].includes(t.type)).reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-4 px-4 py-4">
      <h1 className="text-2xl font-bold text-foreground">Activity</h1>

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-2xl border border-border bg-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Total in</div>
          <div className="mt-1 font-mono text-lg font-bold text-accent">+{formatCurrency(totalIn)}</div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Total out</div>
          <div className="mt-1 font-mono text-lg font-bold text-foreground">−{formatCurrency(totalOut)}</div>
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-2xl border border-border bg-card px-3 py-2.5">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          placeholder="Search by name, ref, or note"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        {search && (
          <button onClick={() => setSearch("")} className="rounded-full p-1 hover:bg-muted">
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={cn(
              "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-all",
              filter === f.id ? "bg-primary text-primary-foreground" : "border border-border bg-card text-muted-foreground hover:bg-muted",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          No transactions match your filter.
        </div>
      ) : (
        <TransactionGroup transactions={filtered} onSelect={(tx) => setSelected(tx)} />
      )}

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
            className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-t-3xl border-t border-border bg-card p-5 pb-8 shadow-2xl"
            >
              <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-muted" />

              <div className="flex flex-col items-center text-center">
                <div
                  className={cn(
                    "flex h-14 w-14 items-center justify-center rounded-full",
                    ["receive", "bankin", "cashin"].includes(selected.type)
                      ? "bg-accent/10 text-accent"
                      : "bg-destructive/10 text-destructive",
                  )}
                >
                  <span className="text-2xl font-bold">{["receive", "bankin", "cashin"].includes(selected.type) ? "+" : "−"}</span>
                </div>
                <div className="mt-2 font-mono text-2xl font-bold text-foreground">
                  {formatCurrency(selected.amount, { showSign: true })}
                </div>
                <div className="text-sm text-muted-foreground">{selected.counterparty}</div>
              </div>

              <div className="mt-5 space-y-2 rounded-2xl border border-border bg-background p-4 text-sm">
                <Row label="Reference" value={selected.reference} />
                <Row label="Date" value={new Date(selected.createdAt).toLocaleString("en-PH")} />
                <Row label="Type" value={selected.type} />
                <Row label="Status" value={selected.status} />
                {selected.counterpartyHandle && <Row label="Account/Mobile" value={selected.counterpartyHandle} />}
                {selected.note && <Row label="Note" value={selected.note} />}
                {selected.fee ? <Row label="Fee" value={formatCurrency(selected.fee)} /> : null}
              </div>

              <div className="mt-4 flex gap-2">
                <button className="flex-1 rounded-2xl border border-border bg-background py-3 text-sm font-medium hover:bg-muted">
                  <Share2 className="mr-1.5 inline h-4 w-4" /> Share receipt
                </button>
                <button onClick={() => setSelected(null)} className="flex-1 rounded-2xl bg-primary py-3 text-sm font-semibold text-primary-foreground">
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-mono text-foreground break-all">{value}</span>
    </div>
  );
}
