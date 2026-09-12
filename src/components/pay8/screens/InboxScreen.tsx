"use client";

import { useState } from "react";
import { usePay8 } from "@/lib/pay8-store";
import { usePay8Ui } from "@/lib/pay8-ui-store";
import { formatCurrency, formatDateTime, dateGroupKey } from "@/lib/pay8-utils";
import type { Notification, Transaction } from "@/lib/types";
import { ArrowDownLeft, ArrowUpRight, BellOff, Download, Receipt, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Inbox — transaction-only feed.
 * Shows confirmation codes, money sent, and money received.
 * Promo / verification / system notifications are filtered OUT.
 */
export function InboxScreen() {
  const notifications = usePay8((s) => s.notifications);
  const transactions = usePay8((s) => s.transactions);
  const markAllRead = usePay8((s) => s.markAllNotificationsRead);
  const markRead = usePay8((s) => s.markNotificationRead);
  const navigate = usePay8Ui((s) => s.navigate);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  // Only transaction-related notifications
  const txNotifications = notifications.filter((n) => n.type === "transaction");
  const unread = txNotifications.filter((n) => !n.read).length;

  // Recent transaction confirmations — sent and received only
  const recentTxLogs = transactions
    .filter((t) => ["send", "receive", "bankout", "bankin", "cashin", "qrpay", "bills"].includes(t.type))
    .slice(0, 8);

  return (
    <div className="space-y-4 px-4 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Inbox</h1>
          <p className="text-xs text-muted-foreground">Transaction confirmations · {unread} unread</p>
        </div>
        {unread > 0 && (
          <button
            onClick={markAllRead}
            className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-muted"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* Recent transactions (sent + received) */}
      <section>
        <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Recent transactions</h2>
        <div className="space-y-2">
          {recentTxLogs.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
              No transactions yet.
            </div>
          ) : (
            recentTxLogs.map((t) => {
              const isReceive = ["receive", "bankin", "cashin"].includes(t.type);
              return (
                <button
                  key={t.id}
                  onClick={() => setSelectedTx(t)}
                  className={cn(
                    "w-full rounded-2xl border bg-card p-3 text-left pay8-elev-1",
                    isReceive ? "border-accent/20" : "border-border",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-full",
                      isReceive ? "bg-accent/10 text-accent" : "bg-destructive/10 text-destructive",
                    )}>
                      {isReceive ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="truncate text-sm font-semibold text-foreground">{t.counterparty}</div>
                      <div className="text-xs text-muted-foreground">{formatDateTime(t.createdAt, false)}</div>
                    </div>
                    <div className={cn("font-mono text-sm font-bold", isReceive ? "text-accent" : "text-foreground")}>
                      {isReceive ? "+" : "−"}{formatCurrency(t.amount).replace("₱", "₱")}
                    </div>
                  </div>
                  <div className="mt-2 text-[10px] text-muted-foreground">Ref {t.reference}</div>
                </button>
              );
            })
          )}
        </div>
      </section>

      {/* All transaction notifications (confirmation codes) */}
      <section>
        <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">All confirmations</h2>
        {txNotifications.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
            <BellOff className="mx-auto mb-2 h-8 w-8 opacity-50" />
            No transaction confirmations yet.
          </div>
        ) : (
          <NotificationList notifications={txNotifications} onRead={markRead} onSelect={() => navigate("transactions")} />
        )}
      </section>

      {selectedTx && <InboxTransactionSheet tx={selectedTx} onClose={() => setSelectedTx(null)} />}
    </div>
  );
}

function InboxTransactionSheet({ tx, onClose }: { tx: Transaction; onClose: () => void }) {
  const outflow = !["receive", "bankin", "cashin"].includes(tx.type);
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-t-3xl border-t border-border bg-card p-5 pb-8 shadow-2xl">
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-muted" />
        <div className="text-center">
          <div className="font-mono text-2xl font-bold text-foreground">
            {outflow ? "−" : "+"}{formatCurrency(tx.amount)}
          </div>
          <div className="mt-1 text-sm text-muted-foreground">{tx.counterparty}</div>
        </div>
        <div className="mt-5 space-y-2 rounded-2xl border border-border bg-background p-4 text-sm">
          <DetailRow label="Reference" value={tx.reference} />
          <DetailRow label="Timestamp" value={new Date(tx.createdAt).toLocaleString("en-PH")} />
          <DetailRow label="Full name" value={tx.counterparty} />
          {tx.counterpartyHandle && <DetailRow label="Account / Number" value={tx.counterpartyHandle} />}
          <DetailRow label="Amount" value={formatCurrency(tx.amount)} />
          <DetailRow label="Status" value={tx.status} />
          {tx.note && <DetailRow label="Note" value={tx.note} />}
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <button className="rounded-2xl border border-border bg-background py-3 text-sm font-medium hover:bg-muted">
            <Share2 className="mr-1 inline h-4 w-4" /> Share
          </button>
          <button className="rounded-2xl border border-border bg-background py-3 text-sm font-medium hover:bg-muted">
            <Download className="mr-1 inline h-4 w-4" /> Save
          </button>
          <button onClick={onClose} className="rounded-2xl bg-primary py-3 text-sm font-semibold text-primary-foreground">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="break-all text-right font-mono text-foreground">{value}</span>
    </div>
  );
}

function NotificationList({ notifications, onRead, onSelect }: { notifications: Notification[]; onRead: (id: string) => void; onSelect: () => void }) {
  const groups = notifications.reduce<Record<string, Notification[]>>((acc, n) => {
    const key = dateGroupKey(n.createdAt);
    if (!acc[key]) acc[key] = [];
    acc[key].push(n);
    return acc;
  }, {});

  return (
    <div className="space-y-3">
      {Object.entries(groups).map(([label, list]) => (
        <div key={label}>
          <div className="mb-1 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
          <div className="divide-y divide-border rounded-2xl border border-border bg-card">
            {list.map((n) => {
              const isReceive = /received/i.test(n.title);
              const isSend = /sent|paid/i.test(n.title);
              return (
                <button
                  key={n.id}
                  onClick={() => {
                    onRead(n.id);
                    onSelect();
                  }}
                  className={cn(
                    "flex w-full items-start gap-3 px-3 py-3 text-left transition-colors hover:bg-muted/50",
                    !n.read && "bg-primary/[0.03]",
                  )}
                >
                  <div className={cn(
                    "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                    isReceive
                      ? "bg-accent/10 text-accent"
                      : isSend
                        ? "bg-destructive/10 text-destructive"
                        : "bg-primary/10 text-primary",
                  )}>
                    {isReceive ? <ArrowDownLeft className="h-4 w-4" /> : isSend ? <ArrowUpRight className="h-4 w-4" /> : <Receipt className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={cn("text-sm font-medium", !n.read ? "text-foreground" : "text-muted-foreground")}>{n.title}</div>
                    <div className="mt-0.5 text-xs text-muted-foreground">{n.body}</div>
                    <div className="mt-0.5 text-[10px] text-muted-foreground">{formatDateTime(n.createdAt)}</div>
                  </div>
                  {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
