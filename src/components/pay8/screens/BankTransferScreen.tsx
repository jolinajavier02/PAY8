"use client";

import { useState } from "react";
import { usePay8 } from "@/lib/pay8-store";
import { usePay8Ui } from "@/lib/pay8-ui-store";
import { CATALOG } from "@/lib/pay8-store";
import { formatCurrency, maskAccount } from "@/lib/pay8-utils";
import { ArrowRight, Banknote, ChevronRight, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { ReviewSheet, SuccessPanel } from "./SendScreen";

type Mode = "instapay" | "pesonet";

export function BankTransferScreen() {
  const banks = CATALOG.banks;
  const [bankCode, setBankCode] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("instapay");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountType, setAccountType] = useState<"savings" | "checking">("savings");
  const [amount, setAmount] = useState("");
  const [step, setStep] = useState<"select" | "details" | "review" | "done">("select");

  const balance = usePay8((s) => s.balance);
  const addTxn = usePay8((s) => s.addTransaction);
  const adjustBalance = usePay8((s) => s.adjustBalance);
  const addNotification = usePay8((s) => s.addNotification);
  const openPinPad = usePay8Ui((s) => s.openPinPad);
  const showToast = usePay8Ui((s) => s.showToast);
  const navigate = usePay8Ui((s) => s.navigate);

  const [search, setSearch] = useState("");
  const filteredBanks = banks.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase()) || b.shortName.toLowerCase().includes(search.toLowerCase()),
  );

  const selectedBank = banks.find((b) => b.code === bankCode);
  const amt = parseFloat(amount) || 0;
  const fee = mode === "instapay" ? 25 : 15;
  const total = amt + fee;
  const canProceed = !!selectedBank && accountNumber.length >= 4 && accountName.trim().length > 1 && amt > 0 && total <= balance;

  const confirm = () => {
    if (!selectedBank) return;
    openPinPad(`Transfer ${formatCurrency(amt)} to ${selectedBank.shortName}`, () => {
      const tx = addTxn({
        type: "bankout",
        status: "completed",
        amount: amt,
        counterparty: selectedBank.shortName,
        counterpartyHandle: maskAccount(accountNumber),
        note: `${mode.toUpperCase()} transfer · ${accountType}`,
        fee,
      });
      adjustBalance(-total);
      addNotification({
        title: `Sent ${formatCurrency(amt)}`,
        body: `To ${selectedBank.shortName} · Ref ${tx.reference}`,
        type: "transaction",
      });
      setStep("done");
      showToast({ title: "Transfer successful", description: formatCurrency(amt) + " to " + selectedBank.shortName, variant: "success" });
    });
  };

  if (step === "done" && selectedBank) {
    return (
      <SuccessPanel
        title="Bank transfer sent"
        subtitle={`${formatCurrency(amt)} to ${selectedBank.shortName} ${maskAccount(accountNumber)}`}
        reference={usePay8.getState().transactions[0]?.reference ?? ""}
        onDone={() => navigate("home")}
        onSecondary={() => navigate("transactions")}
        secondaryLabel="View activity"
      />
    );
  }

  if ((step === "details" || step === "review") && selectedBank) {
    return (
      <div className="space-y-4 px-4 py-4">
        <button onClick={() => setStep("select")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ChevronRight className="h-4 w-4 rotate-180" /> Change bank
        </button>

        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl text-xs font-bold text-white"
            style={{ backgroundColor: selectedBank.color }}
          >
            {selectedBank.shortName.slice(0, 3)}
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-foreground">{selectedBank.shortName}</div>
            <div className="text-xs text-muted-foreground">{selectedBank.name}</div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-1">
          <div className="grid grid-cols-2 gap-1">
            <button
              onClick={() => setMode("instapay")}
              disabled={!selectedBank.instapay}
              className={cn(
                "rounded-xl px-3 py-3 text-center transition-all disabled:opacity-40",
                mode === "instapay" ? "bg-primary text-primary-foreground" : "hover:bg-muted",
              )}
            >
              <div className="text-sm font-semibold">InstaPay</div>
              <div className="text-[10px] text-muted-foreground">Real-time · ₱25</div>
            </button>
            <button
              onClick={() => setMode("pesonet")}
              disabled={!selectedBank.pesonet}
              className={cn(
                "rounded-xl px-3 py-3 text-center transition-all disabled:opacity-40",
                mode === "pesonet" ? "bg-primary text-primary-foreground" : "hover:bg-muted",
              )}
            >
              <div className="text-sm font-semibold">PESONet</div>
              <div className="text-[10px] text-muted-foreground">Same-day · ₱15</div>
            </button>
          </div>
        </div>

        <Field label="Account number">
          <input
            inputMode="numeric"
            placeholder="0000 0000 0000"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value.replace(/[^\d]/g, ""))}
            className="w-full bg-transparent text-sm font-mono outline-none placeholder:text-muted-foreground"
          />
        </Field>

        <Field label="Account name">
          <input
            placeholder="JUAN DELA CRUZ"
            value={accountName}
            onChange={(e) => setAccountName(e.target.value.toUpperCase())}
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </Field>

        <div className="grid grid-cols-2 gap-1 rounded-xl border border-border bg-background p-1">
          {(["savings", "checking"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setAccountType(t)}
              className={cn(
                "rounded-lg py-2 text-xs font-medium capitalize transition-all",
                accountType === t ? "bg-primary text-primary-foreground" : "text-muted-foreground",
              )}
            >
              {t}
            </button>
          ))}
        </div>

        <Field label="Amount">
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-semibold text-muted-foreground">₱</span>
            <input
              inputMode="decimal"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
              className="flex-1 bg-transparent font-mono text-xl font-bold outline-none placeholder:text-muted-foreground"
            />
          </div>
        </Field>
        <div className="px-3 text-xs text-muted-foreground">
          Available: {formatCurrency(balance)} · Fee ₱{fee}
        </div>

        <button
          disabled={!canProceed}
          onClick={() => setStep("review")}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-sm font-semibold transition-all",
            canProceed ? "bg-primary text-primary-foreground pay8-elev-1 active:scale-[0.99]" : "cursor-not-allowed bg-muted text-muted-foreground",
          )}
        >
          Review transfer <ArrowRight className="h-4 w-4" />
        </button>

        {step === "review" && (
          <ReviewSheet
            title={`${mode === "instapay" ? "InstaPay" : "PESONet"} Transfer`}
            rows={[
              { label: "Bank", value: selectedBank.shortName },
              { label: "Account", value: maskAccount(accountNumber) },
              { label: "Account name", value: accountName },
              { label: "Type", value: accountType },
              { label: "Amount", value: formatCurrency(amt) },
              { label: "Fee", value: formatCurrency(fee) },
              { label: "Total", value: formatCurrency(total), highlight: true },
            ]}
            onConfirm={confirm}
            onCancel={() => setStep("details")}
            confirmLabel="Confirm & Transfer"
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3 px-4 py-4">
      <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          placeholder="Search bank or e-wallet"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        {filteredBanks.map((b) => (
          <button
            key={b.code}
            onClick={() => {
              setBankCode(b.code);
              setStep("details");
            }}
            className="flex items-center gap-2 rounded-2xl border border-border bg-card p-3 text-left transition-all hover:bg-muted active:scale-[0.98]"
          >
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold text-white"
              style={{ backgroundColor: b.color }}
            >
              {b.shortName.slice(0, 3)}
            </div>
            <div className="min-w-0">
              <div className="truncate text-xs font-semibold text-foreground">{b.shortName}</div>
              <div className="truncate text-[10px] text-muted-foreground">
                {b.instapay && b.pesonet ? "InstaPay · PESONet" : b.instapay ? "InstaPay" : "PESONet"}
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card p-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-2 font-medium text-foreground">
          <Banknote className="h-4 w-4 text-primary" /> About transfers
        </div>
        <p className="mt-1">
          InstaPay transfers arrive within seconds (₱25 fee, up to ₱50,000 per transaction). PESONet batches clear the same business day (₱15 fee, up to ₱500,000).
        </p>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-3">
      <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</label>
      <div className="mt-2 rounded-xl border border-border bg-background px-3 py-2.5">{children}</div>
    </div>
  );
}
