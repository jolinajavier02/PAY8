"use client";

import { useState } from "react";
import { usePay8 } from "@/lib/pay8-store";
import { usePay8Ui } from "@/lib/pay8-ui-store";
import { formatCurrency, formatDateTime, dateGroupKey } from "@/lib/pay8-utils";
import type { CardTransaction } from "@/lib/types";
import { ArrowDownLeft, CreditCard, Eye, EyeOff, Plus, Snowflake, Wifi, Smartphone, ShieldCheck, Train, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { SuccessPanel } from "./SendScreen";

export function Pay8CardScreen() {
  const card = usePay8((s) => s.card);
  const balance = usePay8((s) => s.balance);
  const loadCard = usePay8((s) => s.loadCard);
  const toggleFreeze = usePay8((s) => s.toggleCardFreeze);
  const updateCard = usePay8((s) => s.updateCard);
  const openPinPad = usePay8Ui((s) => s.openPinPad);
  const showToast = usePay8Ui((s) => s.showToast);
  const navigate = usePay8Ui((s) => s.navigate);

  const [showNumber, setShowNumber] = useState(false);
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [loadAmount, setLoadAmount] = useState("");
  const [done, setDone] = useState(false);

  const amt = parseFloat(loadAmount) || 0;
  const canLoad = amt > 0 && amt <= balance;

  const confirmLoad = () => {
    openPinPad(`Load ${formatCurrency(amt)} to PAY8 Card`, () => {
      loadCard(amt);
      showToast({ title: "Card loaded", description: formatCurrency(amt) + " added to PAY8 Card", variant: "success" });
      setLoadAmount("");
      setShowAddFunds(false);
      setDone(true);
    });
  };

  if (done) {
    return (
      <SuccessPanel
        title="Card loaded"
        subtitle={`${formatCurrency(amt)} added to MyCard`}
        reference={usePay8.getState().transactions[0]?.reference ?? ""}
        onDone={() => {
          setDone(false);
          navigate("profile");
        }}
      />
    );
  }

  return (
    <div className="space-y-5 px-4 py-4">
      <section>
        <div className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Physical and online cards</div>
        <motion.div
        initial={{ opacity: 0, y: 12, rotateX: 12 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative"
        style={{ perspective: 1000 }}
      >
        <div className="relative aspect-[1.6/1] w-full overflow-hidden rounded-3xl shadow-lg shadow-primary/20">
          <div className="absolute inset-0 pay8-gradient-navy" />
          <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -left-10 -bottom-14 h-32 w-32 rounded-full bg-amber-400/15 blur-3xl" />

          <div className="absolute right-5 top-5 h-8 w-10 rounded-md bg-gradient-to-br from-amber-200 to-amber-500 shadow-inner" />

          {card.status === "frozen" && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 backdrop-blur-md">
              <div className="rounded-2xl bg-black/40 px-4 py-2 text-sm font-semibold text-cyan-200">
                <Snowflake className="mr-1.5 inline h-4 w-4" /> Card frozen
              </div>
            </div>
          )}

          <div className="relative flex h-full flex-col justify-between p-5 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 font-bold text-xs">8</div>
                <span className="text-xs font-medium uppercase tracking-wider text-white/80">MyCard</span>
              </div>
              <span className="text-[10px] uppercase tracking-wider text-white/60">Physical · Online</span>
            </div>

            <div>
              <div className="text-[10px] uppercase tracking-wider text-white/70">Card balance</div>
              <div className="font-mono text-3xl font-bold">{formatCurrency(card.balance)}</div>
            </div>

            <div className="flex items-end justify-between">
              <div>
                <div className="font-mono text-sm tracking-widest text-white/90">
                  {showNumber
                    ? `•••• ${card.number} •••• ${card.number} •••• ${card.number}`
                    : `•••• •••• •••• ${card.number}`}
                </div>
                <div className="mt-1 text-[10px] uppercase tracking-wider text-white/60">
                  EXP {card.expiry} · CVV {showNumber ? card.cvv : "•••"}
                </div>
              </div>
              <button
                onClick={() => setShowNumber((s) => !s)}
                className="rounded-full bg-white/10 p-1.5 hover:bg-white/20"
                aria-label="Toggle card details"
              >
                {showNumber ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
        </div>
        </motion.div>
      </section>

      <div className="grid grid-cols-3 gap-2">
        <CardAction label="Add funds" icon={Plus} onClick={() => setShowAddFunds(true)} tint="bg-primary/10 text-primary" />
        <CardAction
          label={card.status === "active" ? "Freeze" : "Unfreeze"}
          icon={Snowflake}
          onClick={() => {
            toggleFreeze();
            showToast({
              title: card.status === "active" ? "Card frozen" : "Card unfrozen",
              description: card.status === "active" ? "Tap-to-pay paused" : "Card ready for use",
              variant: "warning",
            });
          }}
          tint="bg-primary/10 text-primary"
        />
        <CardAction
          label="Auto-reload"
          icon={Zap}
          onClick={() => {
            updateCard({ autoReload: !card.autoReload });
            showToast({ title: `Auto-reload ${card.autoReload ? "off" : "on"}` });
          }}
          tint={card.autoReload ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"}
          active={card.autoReload}
        />
      </div>

      <section>
        <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Card options</h2>
        <div className="grid grid-cols-2 gap-2">
          <InfoTile icon={CreditCard} title="Physical card" body="Tap, swipe, and ATM-ready" />
          <InfoTile icon={Smartphone} title="Online card" body="Use for apps and checkout" />
          <InfoTile icon={Wifi} title="Contactless" body="NFC payments enabled" />
          <InfoTile icon={ShieldCheck} title="Protected" body="Freeze anytime" />
        </div>
      </section>

      <section>
        <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Card details</h2>
        <div className="divide-y divide-border rounded-2xl border border-border bg-card">
          <DetailRow label="Card number" value={showNumber ? card.fullNumber.replace(/(.{4})/g, "$1 ").trim() : `•••• •••• •••• ${card.number}`} />
          <DetailRow label="Expiry" value={card.expiry} />
          <DetailRow label="CVV" value={showNumber ? card.cvv : "•••"} />
          <DetailRow label="Status" value={card.status === "active" ? "Active" : "Frozen"} />
        </div>
      </section>

      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-foreground">Auto-reload</div>
            <div className="text-xs text-muted-foreground">
              When balance drops below {formatCurrency(card.autoReloadThreshold)}, load {formatCurrency(card.autoReloadAmount)} from your wallet.
            </div>
          </div>
          <button
            onClick={() => {
              const next = card.autoReloadAmount === 500 ? 1000 : card.autoReloadAmount === 1000 ? 2000 : 500;
              updateCard({ autoReloadAmount: next, autoReloadThreshold: Math.floor(next / 5) });
              showToast({ title: "Auto-reload updated", description: `Now loads ${formatCurrency(next)}` });
            }}
            className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted"
          >
            ₱{card.autoReloadAmount}
          </button>
        </div>
      </div>

      <section>
        <div className="mb-2 flex items-center justify-between px-1">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Card activity</h2>
          <span className="text-xs text-muted-foreground">{card.transactions.length} transactions</span>
        </div>
        <CardTransactionList items={card.transactions} />
      </section>

      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Train className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-semibold text-foreground">Tap-to-pay at transit</div>
            <div className="text-xs text-muted-foreground">MRT-3, LRT-1, LRT-2, P2P buses, and partner merchants.</div>
          </div>
        </div>
      </div>

      {showAddFunds && (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowAddFunds(false)}>
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-t-3xl border-t border-border bg-card p-5 pb-8 shadow-2xl"
          >
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-muted" />
            <h3 className="text-center text-lg font-semibold text-foreground">Load MyCard</h3>
            <p className="mt-1 text-center text-xs text-muted-foreground">From your wallet balance {formatCurrency(balance)}</p>

            <div className="mt-4 rounded-2xl border border-border bg-background p-3">
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-semibold text-muted-foreground">₱</span>
                <input
                  inputMode="decimal"
                  placeholder="0.00"
                  value={loadAmount}
                  onChange={(e) => setLoadAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                  className="flex-1 bg-transparent font-mono text-2xl font-bold outline-none placeholder:text-muted-foreground"
                />
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              {[100, 200, 500, 1000].map((q) => (
                <button
                  key={q}
                  onClick={() => setLoadAmount(String(q))}
                  className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium hover:bg-muted"
                >
                  +₱{q}
                </button>
              ))}
            </div>

            <button
              disabled={!canLoad}
              onClick={confirmLoad}
              className={cn(
                "mt-5 w-full rounded-2xl px-4 py-3.5 text-sm font-semibold transition-all",
                canLoad ? "bg-primary text-primary-foreground pay8-elev-1 active:scale-[0.99]" : "cursor-not-allowed bg-muted text-muted-foreground",
              )}
            >
              Load {amt > 0 ? formatCurrency(amt) : ""}
            </button>
            <button onClick={() => setShowAddFunds(false)} className="mt-2 w-full py-2 text-center text-sm text-muted-foreground hover:text-foreground">
              Cancel
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function CardAction({
  label,
  icon: Icon,
  onClick,
  tint,
  active,
}: {
  label: string;
  icon: typeof Plus;
  onClick: () => void;
  tint: string;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1.5 rounded-2xl border p-3 transition-all active:scale-95",
        active ? "border-accent/30" : "border-border bg-card hover:bg-muted",
      )}
    >
      <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", tint)}>
        <Icon className="h-5 w-5" strokeWidth={2.2} />
      </div>
      <span className="text-[11px] font-medium">{label}</span>
    </button>
  );
}

function InfoTile({ icon: Icon, title, body }: { icon: typeof Plus; title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-4 w-4" strokeWidth={2.2} />
      </div>
      <div className="mt-2 text-sm font-semibold text-foreground">{title}</div>
      <div className="mt-0.5 text-xs text-muted-foreground">{body}</div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 px-3 py-3">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-right font-mono text-sm font-semibold text-foreground">{value}</span>
    </div>
  );
}

function CardTransactionList({ items }: { items: CardTransaction[] }) {
  const groups = items.reduce<Record<string, CardTransaction[]>>((acc, it) => {
    const key = dateGroupKey(it.createdAt);
    if (!acc[key]) acc[key] = [];
    acc[key].push(it);
    return acc;
  }, {});

  return (
    <div className="space-y-3">
      {Object.entries(groups).map(([label, list]) => (
        <div key={label}>
          <div className="mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
          <div className="divide-y divide-border rounded-2xl border border-border bg-card">
            {list.map((it) => {
              const isTopup = it.type === "topup" || it.amount < 0;
              return (
                <div key={it.id} className="flex items-center gap-3 px-3 py-2.5">
                  <div
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-xl",
                      isTopup ? "bg-accent/10 text-accent" : "bg-primary/10 text-primary",
                    )}
                  >
                    {isTopup ? <ArrowDownLeft className="h-4 w-4" /> : <Train className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="truncate text-sm font-medium text-foreground">{it.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {it.station ?? "Transit"} · {formatDateTime(it.createdAt)}
                    </div>
                  </div>
                  <div className={cn("font-mono text-sm font-semibold", isTopup ? "text-accent" : "text-foreground")}>
                    {formatCurrency(it.amount, { showSign: true })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
