"use client";

import { usePay8 } from "@/lib/pay8-store";
import { usePay8Ui } from "@/lib/pay8-ui-store";
import { CATALOG } from "@/lib/pay8-store";
import { formatCurrency, formatDateTime } from "@/lib/pay8-utils";
import { motion } from "framer-motion";
import { ArrowRight, BellOff, Check, ChevronRight, Lightbulb, Plus, Search } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { SuccessPanel } from "./SendScreen";

export function NotificationsScreen() {
  const notifications = usePay8((s) => s.notifications);
  const markAllRead = usePay8((s) => s.markAllNotificationsRead);
  const markRead = usePay8((s) => s.markNotificationRead);

  return (
    <div className="space-y-3 px-4 py-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">{notifications.filter((n) => !n.read).length} unread</div>
        <button
          onClick={markAllRead}
          className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-muted"
        >
          Mark all read
        </button>
      </div>

      <div className="divide-y divide-border rounded-2xl border border-border bg-card">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            <BellOff className="mx-auto mb-2 h-8 w-8 opacity-50" />
            No notifications yet.
          </div>
        ) : (
          notifications.map((n) => (
            <button
              key={n.id}
              onClick={() => markRead(n.id)}
              className={cn(
                "flex w-full items-start gap-3 px-3 py-3 text-left transition-colors hover:bg-muted/50",
                !n.read && "bg-primary/[0.03]",
              )}
            >
              <div className={cn(
                "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                n.type === "transaction" ? "bg-accent/10 text-accent" :
                n.type === "promo" ? "bg-primary/10 text-primary" :
                n.type === "verification" ? "bg-primary/10 text-primary" :
                "bg-muted text-muted-foreground",
              )}>
                {n.type === "transaction" ? <Check className="h-4 w-4" /> :
                 n.type === "promo" ? <Lightbulb className="h-4 w-4" /> :
                 n.type === "verification" ? <Check className="h-4 w-4" /> :
                 <Check className="h-4 w-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className={cn("text-sm font-medium", !n.read ? "text-foreground" : "text-muted-foreground")}>{n.title}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">{n.body}</div>
                <div className="mt-0.5 text-[10px] text-muted-foreground">{formatDateTime(n.createdAt)}</div>
              </div>
              {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />}
            </button>
          ))
        )}
      </div>
    </div>
  );
}

export function PayBillsScreen() {
  const billers = CATALOG.billers;
  const balance = usePay8((s) => s.balance);
  const addTxn = usePay8((s) => s.addTransaction);
  const adjustBalance = usePay8((s) => s.adjustBalance);
  const addNotification = usePay8((s) => s.addNotification);
  const openPinPad = usePay8Ui((s) => s.openPinPad);
  const showToast = usePay8Ui((s) => s.showToast);
  const navigate = usePay8Ui((s) => s.navigate);

  const [selected, setSelected] = useState<string | null>(null);
  const [accountRef, setAccountRef] = useState("");
  const [amount, setAmount] = useState("");
  const [step, setStep] = useState<"select" | "details" | "done">("select");
  const [search, setSearch] = useState("");
  const [doneData, setDoneData] = useState<{ amount: number; biller: string; ref: string } | null>(null);

  const selectedBiller = billers.find((b) => b.code === selected);
  const amt = parseFloat(amount) || 0;
  const canPay = !!selectedBiller && accountRef.trim().length >= 4 && amt > 0 && amt <= balance;

  const filtered = search.trim()
    ? billers.filter((b) => b.name.toLowerCase().includes(search.toLowerCase()))
    : billers;

  const confirm = () => {
    if (!selectedBiller) return;
    openPinPad(`Pay ${formatCurrency(amt)} to ${selectedBiller.name}`, () => {
      const tx = addTxn({
        type: "bills",
        status: "completed",
        amount: amt,
        counterparty: selectedBiller.name,
        counterpartyHandle: `Acct ${accountRef}`,
        note: selectedBiller.category,
        fee: 0,
      });
      adjustBalance(-amt);
      addNotification({
        title: `Paid ${formatCurrency(amt)}`,
        body: `To ${selectedBiller.name} · Ref ${tx.reference}`,
        type: "transaction",
      });
      setDoneData({ amount: amt, biller: selectedBiller.name, ref: tx.reference });
      setStep("done");
      showToast({ title: "Bill paid", description: formatCurrency(amt) + " to " + selectedBiller.name, variant: "success" });
    });
  };

  if (step === "done" && doneData) {
    return (
      <SuccessPanel
        title="Bill paid successfully"
        subtitle={`${formatCurrency(doneData.amount)} to ${doneData.biller}`}
        reference={doneData.ref}
        onDone={() => navigate("home")}
        onSecondary={() => navigate("transactions")}
        secondaryLabel="View activity"
      />
    );
  }

  if (step === "details" && selectedBiller) {
    return (
      <div className="space-y-4 px-4 py-4">
        <button onClick={() => setStep("select")} className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to billers
        </button>

        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl text-xs font-bold text-white" style={{ backgroundColor: selectedBiller.color }}>
            {selectedBiller.name.slice(0, 3)}
          </div>
          <div>
            <div className="text-sm font-semibold text-foreground">{selectedBiller.name}</div>
            <div className="text-xs text-muted-foreground">{selectedBiller.category}</div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-3">
          <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Account / Reference number</label>
          <input
            inputMode="numeric"
            placeholder="0000 0000 0000"
            value={accountRef}
            onChange={(e) => setAccountRef(e.target.value)}
            className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2.5 font-mono text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>

        <div className="rounded-2xl border border-border bg-card p-3">
          <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Amount due</label>
          <div className="mt-2 flex items-baseline gap-1 rounded-xl border border-border bg-background px-3 py-3">
            <span className="text-lg font-semibold text-muted-foreground">₱</span>
            <input
              inputMode="decimal"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
              className="flex-1 bg-transparent font-mono text-xl font-bold outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div className="mt-2 text-xs text-muted-foreground">Balance: {formatCurrency(balance)}</div>
        </div>

        <button
          disabled={!canPay}
          onClick={confirm}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-sm font-semibold transition-all",
            canPay ? "bg-primary text-primary-foreground pay8-elev-1 active:scale-[0.99]" : "cursor-not-allowed bg-muted text-muted-foreground",
          )}
        >
          Pay {amt > 0 ? formatCurrency(amt) : ""} <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3 px-4 py-4">
      <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          placeholder="Search biller"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>

      {Object.entries(
        filtered.reduce<Record<string, typeof billers>>((acc, b) => {
          if (!acc[b.category]) acc[b.category] = [];
          acc[b.category].push(b);
          return acc;
        }, {}),
      ).map(([category, list]) => (
        <section key={category}>
          <h2 className="mb-1 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{category}</h2>
          <div className="divide-y divide-border rounded-2xl border border-border bg-card">
            {list.map((b) => (
              <button
                key={b.code}
                onClick={() => {
                  setSelected(b.code);
                  setStep("details");
                }}
                className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-muted/50"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg text-[10px] font-bold text-white" style={{ backgroundColor: b.color }}>
                  {b.name.slice(0, 3)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="truncate text-sm font-medium text-foreground">{b.name}</div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        </section>
      ))}

      <div className="rounded-2xl border border-border bg-card p-3">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Lightbulb className="h-4 w-4 text-primary" /> Don't see your biller?
        </div>
        <p className="mt-1 text-xs text-muted-foreground">Tap the + button at the top to manually enter account details for any biller.</p>
      </div>
    </div>
  );
}

export function SettingsScreen() {
  const linkedAccounts = usePay8((s) => s.linkedAccounts);
  const addLinkedAccount = usePay8((s) => s.addLinkedAccount);
  const removeLinkedAccount = usePay8((s) => s.removeLinkedAccount);
  const showToast = usePay8Ui((s) => s.showToast);

  const [showAdd, setShowAdd] = useState(false);
  const [newAcc, setNewAcc] = useState({ bankCode: "BPI", accountNumber: "", accountName: "", accountType: "savings" as const, nickname: "" });

  return (
    <div className="space-y-4 px-4 py-4">
      <section>
        <h2 className="mb-1 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Linked bank accounts</h2>
        <div className="divide-y divide-border rounded-2xl border border-border bg-card">
          {linkedAccounts.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">No linked bank accounts yet.</div>
          ) : (
            linkedAccounts.map((a) => {
              const bank = CATALOG.banks.find((b) => b.code === a.bankCode);
              return (
                <div key={a.id} className="flex items-center gap-3 px-3 py-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg text-[10px] font-bold text-white" style={{ backgroundColor: bank?.color ?? "#444" }}>
                    {bank?.shortName.slice(0, 3)}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-foreground">{bank?.shortName ?? a.bankCode}</div>
                    <div className="text-xs text-muted-foreground">{a.accountNumber} · {a.accountName}{a.nickname ? ` · ${a.nickname}` : ""}</div>
                  </div>
                  <button
                    onClick={() => {
                      removeLinkedAccount(a.id);
                      showToast({ title: "Account removed", variant: "warning" });
                    }}
                    className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-destructive"
                  >
                    <Plus className="h-4 w-4 rotate-45" />
                  </button>
                </div>
              );
            })
          )}
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="mt-2 w-full rounded-2xl border border-dashed border-border py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          + Link new account
        </button>
      </section>

      <section>
        <h2 className="mb-1 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Preferences</h2>
        <div className="divide-y divide-border rounded-2xl border border-border bg-card">
          {[
            { label: "Biometric login", on: true },
            { label: "Push notifications", on: true },
            { label: "Email receipts", on: true },
            { label: "Promo alerts", on: false },
          ].map((row) => (
            <div key={row.label} className="flex items-center justify-between px-3 py-3">
              <div className="text-sm font-medium text-foreground">{row.label}</div>
              <ToggleSwitch initial={row.on} onChange={(v) => showToast({ title: `${row.label} ${v ? "on" : "off"}` })} />
            </div>
          ))}
        </div>
      </section>

      {showAdd && (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowAdd(false)}>
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-t-3xl border-t border-border bg-card p-5 pb-8 shadow-2xl"
          >
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-muted" />
            <h3 className="text-center text-lg font-semibold text-foreground">Link bank account</h3>

            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Bank</label>
                <select
                  value={newAcc.bankCode}
                  onChange={(e) => setNewAcc({ ...newAcc, bankCode: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none"
                >
                  {CATALOG.banks.map((b) => (
                    <option key={b.code} value={b.code} className="bg-card text-foreground">{b.shortName}</option>
                  ))}
                </select>
              </div>
              <FieldInput label="Account number" value={newAcc.accountNumber} onChange={(v) => setNewAcc({ ...newAcc, accountNumber: v })} placeholder="0000 0000 0000" />
              <FieldInput label="Account name" value={newAcc.accountName} onChange={(v) => setNewAcc({ ...newAcc, accountName: v.toUpperCase() })} placeholder="JUAN DELA CRUZ" />
              <FieldInput label="Nickname (optional)" value={newAcc.nickname} onChange={(v) => setNewAcc({ ...newAcc, nickname: v })} placeholder="Payroll" />
            </div>

            <button
              onClick={() => {
                if (!newAcc.accountNumber || !newAcc.accountName) {
                  showToast({ title: "Please fill all fields", variant: "warning" });
                  return;
                }
                addLinkedAccount({
                  bankCode: newAcc.bankCode,
                  accountNumber: "•••• " + newAcc.accountNumber.slice(-4),
                  accountName: newAcc.accountName,
                  accountType: newAcc.accountType,
                  nickname: newAcc.nickname || undefined,
                });
                showToast({ title: "Account linked", description: "Ready to use for cash-in and transfers", variant: "success" });
                setShowAdd(false);
                setNewAcc({ bankCode: "BPI", accountNumber: "", accountName: "", accountType: "savings", nickname: "" });
              }}
              className="mt-5 w-full rounded-2xl bg-primary px-4 py-3.5 text-sm font-semibold text-primary-foreground pay8-elev-1 active:scale-[0.99]"
            >
              Link account
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function FieldInput({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground"
      />
    </div>
  );
}

function ToggleSwitch({ initial, onChange }: { initial: boolean; onChange: (v: boolean) => void }) {
  const [on, setOn] = useState(initial);
  return (
    <button
      onClick={() => {
        const v = !on;
        setOn(v);
        onChange(v);
      }}
      className={cn(
        "relative h-6 w-11 rounded-full transition-colors",
        on ? "bg-primary" : "bg-muted",
      )}
    >
      <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform", on ? "translate-x-5" : "translate-x-0.5")} />
    </button>
  );
}
