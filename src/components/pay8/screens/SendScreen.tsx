"use client";

import { useState } from "react";
import { usePay8 } from "@/lib/pay8-store";
import { usePay8Ui } from "@/lib/pay8-ui-store";
import { formatCurrency, maskPhone } from "@/lib/pay8-utils";
import { ArrowRight, Check, Contact, Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function SendScreen() {
  return (
    <div className="space-y-4 px-4 py-4">
      <SendToPay8 />
    </div>
  );
}

function SendToPay8() {
  const payees = usePay8((s) => s.payees).filter((p) => p.type === "bank");
  const profile = usePay8((s) => s.profile);
  const balance = usePay8((s) => s.balance);
  const addTxn = usePay8((s) => s.addTransaction);
  const adjustBalance = usePay8((s) => s.adjustBalance);
  const addNotification = usePay8((s) => s.addNotification);
  const navigate = usePay8Ui((s) => s.navigate);
  const openPinPad = usePay8Ui((s) => s.openPinPad);
  const showToast = usePay8Ui((s) => s.showToast);

  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [step, setStep] = useState<"input" | "review" | "done">("input");
  const [completedTxn, setCompletedTxn] = useState<{ ref: string; amount: number; recipient: string; sender: string } | null>(null);

  const amt = parseFloat(amount) || 0;
  const canProceed = recipient.length >= 10 && amt > 0 && amt <= balance;
  const matchedPayee = payees.find((p) => p.accountNumber.replace(/\D/g, "") === recipient.replace(/\D/g, ""));
  const receiverName = matchedPayee?.name ?? "PAY8 User";
  const receiverAccount = matchedPayee?.accountNumber ?? recipient;
  const senderName = `${profile.firstName} ${profile.lastName}`;

  const confirm = () => {
    openPinPad(`Send ${formatCurrency(amt)} to ${receiverName}`, () => {
      const tx = addTxn({
        type: "send",
        status: "completed",
        amount: amt,
        counterparty: receiverName,
        counterpartyHandle: maskPhone(receiverAccount),
        note: note ? `${note} · From ${senderName}` : `From ${senderName}`,
      });
      adjustBalance(-amt);
      const timestamp = new Date(tx.createdAt).toLocaleString("en-PH");
      addNotification({
        title: `Sent ${formatCurrency(amt)} to ${receiverName}`,
        body: `From ${senderName} to ${receiverName} (${maskPhone(receiverAccount)}) · ${timestamp} · Ref ${tx.reference}`,
        type: "transaction",
      });
      setCompletedTxn({ ref: tx.reference, amount: amt, recipient: receiverName, sender: senderName });
      setStep("done");
      showToast({ title: "Money sent", description: formatCurrency(amt) + " to " + receiverName, variant: "success" });
    });
  };

  if (step === "done" && completedTxn) {
    return (
      <SuccessPanel
        title="Money sent successfully"
        subtitle={`${formatCurrency(completedTxn.amount)} from ${completedTxn.sender} to ${completedTxn.recipient}`}
        reference={completedTxn.ref}
        onDone={() => navigate("home")}
        onSecondary={() => navigate("transactions")}
        secondaryLabel="View activity"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-card p-4">
        <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Recipient mobile or PAY8 ID</label>
        <div className="mt-2 flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2.5">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            inputMode="tel"
            placeholder="0917 234 5678"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>

        <div className="mt-3 text-xs text-muted-foreground">Your PAY8 ID: {profile.pay8Id}</div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4">
        <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Amount</label>
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
        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>Available: {formatCurrency(balance)}</span>
          {amt > 0 && amt <= balance && <span className="text-accent">Sufficient</span>}
          {amt > balance && <span className="text-destructive">Insufficient</span>}
        </div>

        <div className="mt-3 flex gap-2">
          {[100, 500, 1000].map((q) => (
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

      <div className="rounded-2xl border border-border bg-card p-4">
        <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Note (optional)</label>
        <input
          maxLength={80}
          placeholder="What's this for?"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>

      {payees.length > 0 && (
        <div>
          <div className="mb-1 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Saved recipients</div>
          <div className="divide-y divide-border rounded-2xl border border-border bg-card">
            {payees.map((p) => (
              <button
                key={p.id}
                onClick={() => setRecipient(p.accountNumber)}
                className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-muted/50"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Contact className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-foreground">{p.name}</div>
                  <div className="text-xs text-muted-foreground">{p.accountNumber}</div>
                </div>
                <Plus className="h-4 w-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        disabled={!canProceed}
        onClick={() => setStep("review")}
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-sm font-semibold transition-all",
          canProceed
            ? "bg-primary text-primary-foreground pay8-elev-1 active:scale-[0.99]"
            : "cursor-not-allowed bg-muted text-muted-foreground",
        )}
      >
        Continue <ArrowRight className="h-4 w-4" />
      </button>

      {step === "review" && (
        <ReviewSheet
          title={`Confirm send to ${receiverName}`}
          rows={[
            { label: "Receiver full name", value: receiverName },
            { label: "Receiver account", value: maskPhone(receiverAccount) },
            { label: "Sender", value: senderName },
            { label: "Amount", value: formatCurrency(amt) },
            { label: "Note", value: note || "—" },
            { label: "Fee", value: "Free" },
            { label: "Total", value: formatCurrency(amt), highlight: true },
          ]}
          onConfirm={confirm}
          onCancel={() => setStep("input")}
        />
      )}
    </div>
  );
}

export function ReviewSheet({
  title,
  rows,
  onConfirm,
  onCancel,
  confirmLabel = "Confirm & Send",
}: {
  title: string;
  rows: Array<{ label: string; value: string; highlight?: boolean }>;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 backdrop-blur-sm"
      onClick={onCancel}
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
        <h3 className="text-center text-lg font-semibold text-foreground">{title}</h3>
        <p className="mt-1 text-center text-xs text-muted-foreground">Review the details before confirming.</p>

        <div className="mt-5 space-y-2 rounded-2xl border border-border bg-background p-4">
          {rows.map((r) => (
            <div key={r.label} className="flex items-center justify-between gap-3 text-sm">
              <span className="text-muted-foreground">{r.label}</span>
              <span className={cn("font-medium", r.highlight ? "text-primary" : "text-foreground")}>{r.value}</span>
            </div>
          ))}
        </div>

        <button
          onClick={onConfirm}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3.5 text-sm font-semibold text-primary-foreground pay8-elev-1 active:scale-[0.99]"
        >
          <Check className="h-4 w-4" /> {confirmLabel}
        </button>
        <button onClick={onCancel} className="mt-2 w-full py-2 text-center text-sm text-muted-foreground hover:text-foreground">
          Cancel
        </button>
      </motion.div>
    </motion.div>
  );
}

export function SuccessPanel({
  title,
  subtitle,
  reference,
  onDone,
  onSecondary,
  secondaryLabel,
}: {
  title: string;
  subtitle: string;
  reference: string;
  onDone: () => void;
  onSecondary?: () => void;
  secondaryLabel?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center px-6 py-12 text-center"
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 12 }}
        className="flex h-20 w-20 items-center justify-center rounded-full bg-accent text-accent-foreground pay8-elev-2"
      >
        <Check className="h-10 w-10" strokeWidth={3} />
      </motion.div>
      <h2 className="mt-6 text-xl font-bold text-foreground">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      <div className="mt-4 rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
        Ref {reference}
      </div>
      <button
        onClick={onDone}
        className="mt-8 w-full max-w-xs rounded-2xl bg-primary px-4 py-3.5 text-sm font-semibold text-primary-foreground pay8-elev-1 active:scale-[0.99]"
      >
        Done
      </button>
      {onSecondary && (
        <button onClick={onSecondary} className="mt-2 w-full max-w-xs py-2 text-sm text-muted-foreground hover:text-foreground">
          {secondaryLabel}
        </button>
      )}
    </motion.div>
  );
}
