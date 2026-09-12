"use client";

import { useState } from "react";
import { usePay8 } from "@/lib/pay8-store";
import { usePay8Ui } from "@/lib/pay8-ui-store";
import { CATALOG } from "@/lib/pay8-store";
import { formatCurrency } from "@/lib/pay8-utils";
import { ArrowRight, Banknote, CreditCard, Store, Wallet, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { SuccessPanel } from "./SendScreen";

type SourceType = "bank" | "card" | "otc";

export function CashInScreen() {
  const [source, setSource] = useState<SourceType | null>(null);
  const [amount, setAmount] = useState("");
  const [step, setStep] = useState<"select" | "amount" | "review" | "done">("select");
  const [otcPartner, setOtcPartner] = useState<string | null>(null);

  const balance = usePay8((s) => s.balance);
  const addTxn = usePay8((s) => s.addTransaction);
  const adjustBalance = usePay8((s) => s.adjustBalance);
  const addNotification = usePay8((s) => s.addNotification);
  const openPinPad = usePay8Ui((s) => s.openPinPad);
  const showToast = usePay8Ui((s) => s.showToast);
  const navigate = usePay8Ui((s) => s.navigate);

  const amt = parseFloat(amount) || 0;
  const fee = source === "otc" ? 0 : source === "bank" ? 0 : amt * 0.0125;
  const total = source === "card" ? amt + fee : amt;

  const sources: Array<{ id: SourceType; label: string; sub: string; icon: typeof Banknote }> = [
    { id: "bank", label: "Linked Bank", sub: "Free · instant from BPI, BDO, Metrobank", icon: Banknote },
    { id: "card", label: "Global Bank", sub: "1.25% fee · international bank rail", icon: CreditCard },
    { id: "otc", label: "Over-the-Counter", sub: "Free · 7-Eleven, Cebuana, Palawan", icon: Store },
  ];

  const confirm = () => {
    openPinPad(`Cash in ${formatCurrency(amt)}`, () => {
      const counterparty =
        source === "bank"
          ? "BPI •••• 4521"
          : source === "card"
            ? "Global Bank •••• 1234"
            : CATALOG.cashInPartners.find((p) => p.code === otcPartner)?.name ?? "OTC";
      const tx = addTxn({
        type: "cashin",
        status: "completed",
        amount: amt,
        counterparty,
        counterpartyHandle: `Ref ${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
        note: source === "card" ? `Global Bank cash in · fee ${formatCurrency(fee)}` : undefined,
        fee: source === "card" ? fee : 0,
      });
      adjustBalance(amt);
      addNotification({
        title: `Cash in ${formatCurrency(amt)}`,
        body: `From ${counterparty} · Ref ${tx.reference}`,
        type: "transaction",
      });
      setStep("done");
      showToast({ title: "Cash in successful", description: formatCurrency(amt) + " added", variant: "success" });
    });
  };

  if (step === "done") {
    return (
      <SuccessPanel
        title="Cash in successful"
        subtitle={`${formatCurrency(amt)} added to your balance`}
        reference={usePay8.getState().transactions[0]?.reference ?? ""}
        onDone={() => navigate("home")}
        onSecondary={() => navigate("transactions")}
        secondaryLabel="View activity"
      />
    );
  }

  if (step === "amount") {
    return (
      <div className="space-y-4 px-4 py-4">
        <button onClick={() => setStep("select")} className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to sources
        </button>

        <div className="rounded-2xl border border-border bg-card p-4">
          <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Amount to cash in</label>
          <div className="mt-2 flex items-baseline gap-1 rounded-xl border border-border bg-background px-3 py-3">
            <span className="text-xl font-semibold text-muted-foreground">₱</span>
            <input
              inputMode="decimal"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
              className="flex-1 bg-transparent font-mono text-2xl font-bold outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div className="mt-2 text-xs text-muted-foreground">Current balance: {formatCurrency(balance)}</div>

          <div className="mt-3 flex gap-2">
            {[500, 1000, 3000, 5000].map((q) => (
              <button
                key={q}
                onClick={() => setAmount(String(q))}
                className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium hover:bg-muted"
              >
                +₱{q}
              </button>
            ))}
          </div>
        </div>

        {source === "card" && amt > 0 && (
          <div className="rounded-2xl border border-border bg-card p-3 text-xs text-muted-foreground">
            <div className="flex justify-between"><span>Amount</span><span>{formatCurrency(amt)}</span></div>
            <div className="flex justify-between"><span>Card fee (1.25%)</span><span>{formatCurrency(fee)}</span></div>
            <div className="mt-1 flex justify-between font-semibold text-foreground"><span>Total charged</span><span>{formatCurrency(total)}</span></div>
          </div>
        )}

        {source === "otc" && (
          <div>
            <div className="mb-1 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Choose partner</div>
            <div className="grid grid-cols-2 gap-2">
              {CATALOG.cashInPartners.map((p) => (
                <button
                  key={p.code}
                  onClick={() => setOtcPartner(p.code)}
                  className={cn(
                    "flex items-center gap-2 rounded-2xl border p-3 text-left transition-all active:scale-[0.98]",
                    otcPartner === p.code ? "border-primary bg-primary/5" : "border-border bg-card hover:bg-muted",
                  )}
                >
                  <div className="h-9 w-9 shrink-0 rounded-lg" style={{ backgroundColor: p.color }} />
                  <div className="min-w-0">
                    <div className="truncate text-xs font-semibold text-foreground">{p.name.split(" ")[0]}</div>
                    <div className="text-[10px] text-muted-foreground">Free</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          disabled={amt <= 0 || (source === "otc" && !otcPartner)}
          onClick={() => setStep("review")}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-sm font-semibold transition-all",
            amt > 0 && (source !== "otc" || otcPartner)
              ? "bg-primary text-primary-foreground pay8-elev-1 active:scale-[0.99]"
              : "cursor-not-allowed bg-muted text-muted-foreground",
          )}
        >
          Continue <ArrowRight className="h-4 w-4" />
        </button>

        {step === "review" && (
          <ReviewInline
            rows={[
              { label: "Source", value: source === "bank" ? "BPI •••• 4521" : source === "card" ? "Global Bank •••• 1234" : CATALOG.cashInPartners.find((p) => p.code === otcPartner)?.name ?? "" },
              { label: "Amount", value: formatCurrency(amt) },
              ...(source === "card" ? [{ label: "Card fee", value: formatCurrency(fee) }] : []),
              { label: "Total", value: formatCurrency(total), highlight: true },
            ]}
            onConfirm={confirm}
            onCancel={() => setStep("amount")}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3 px-4 py-4">
      <h2 className="px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Choose cash-in source</h2>
      <div className="space-y-2">
        {sources.map((s) => (
          <button
            key={s.id}
            onClick={() => {
              setSource(s.id);
              setStep("amount");
            }}
            className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-3 text-left transition-all hover:bg-muted active:scale-[0.99]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <s.icon className="h-5 w-5" strokeWidth={2.2} />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-foreground">{s.label}</div>
              <div className="text-xs text-muted-foreground">{s.sub}</div>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card p-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-2 font-medium text-foreground">
          <Zap className="h-4 w-4 text-primary" /> Instant cash in
        </div>
        <p className="mt-1">Most cash-in methods reflect within seconds. Bank transfers from BPI, BDO, and Metrobank are free and instant.</p>
      </div>
    </div>
  );
}

function ReviewInline({
  rows,
  onConfirm,
  onCancel,
}: {
  rows: Array<{ label: string; value: string; highlight?: boolean }>;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 backdrop-blur-sm" onClick={onCancel}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-t-3xl border-t border-border bg-card p-5 pb-8 shadow-2xl"
      >
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-muted" />
        <h3 className="text-center text-lg font-semibold text-foreground">Confirm cash in</h3>
        <div className="mt-4 space-y-2 rounded-2xl border border-border bg-background p-4">
          {rows.map((r) => (
            <div key={r.label} className="flex items-center justify-between gap-3 text-sm">
              <span className="text-muted-foreground">{r.label}</span>
              <span className={cn("font-medium", r.highlight ? "text-primary" : "text-foreground")}>{r.value}</span>
            </div>
          ))}
        </div>
        <button
          onClick={onConfirm}
          className="mt-5 w-full rounded-2xl bg-primary px-4 py-3.5 text-sm font-semibold text-primary-foreground pay8-elev-1 active:scale-[0.99]"
        >
          Confirm & Cash In
        </button>
        <button onClick={onCancel} className="mt-2 w-full py-2 text-center text-sm text-muted-foreground hover:text-foreground">
          Cancel
        </button>
      </div>
    </div>
  );
}
