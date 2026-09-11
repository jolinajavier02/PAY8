"use client";

import { usePay8 } from "@/lib/pay8-store";
import { usePay8Ui } from "@/lib/pay8-ui-store";
import { BalanceCard } from "../BalanceCard";
import { formatCurrency, PROMOS } from "@/lib/pay8-utils";
import { motion } from "framer-motion";
import {
  Inbox, Plus, Send, Banknote, Lightbulb, Wallet, Coins, Train, Gift, ChevronRight, CreditCard, Zap, Megaphone, TrendingUp,
} from "lucide-react";
import type { ScreenId } from "@/lib/types";

const ADS = [
  {
    id: "ad1",
    title: "Save with PAY8 GSave",
    body: "Up to 2.5% APY on automated savings — no minimum balance.",
    badge: "Sponsored",
    tint: "from-primary/10 to-primary/5",
  },
  {
    id: "ad2",
    title: "Borrow up to ₱25,000 instantly",
    body: "GLoan — apply in 60 seconds, money in your wallet in 5 minutes.",
    badge: "Sponsored",
    tint: "from-emerald-500/10 to-emerald-500/5",
  },
];

export function HomeScreen() {
  const transactions = usePay8((s) => s.transactions);
  const card = usePay8((s) => s.card);
  const verification = usePay8((s) => s.verification);
  const profile = usePay8((s) => s.profile);
  const balance = usePay8((s) => s.balance);
  const notifications = usePay8((s) => s.notifications);
  const navigate = usePay8Ui((s) => s.navigate);
  const unread = notifications.filter((n) => !n.read).length;

  // Hide verification banner once verified
  const showVerifyBanner = verification.status !== "verified";

  // 8 quick actions in 2 rows × 4 columns
  const quickActions: Array<{ id: ScreenId; label: string; icon: typeof Send; sub?: string }> = [
    { id: "send", label: "Send", icon: Send },
    { id: "cashin", label: "Cash In", icon: Plus },
    { id: "paybills", label: "Load", icon: Zap },     // mobile prepaid load
    { id: "paybills", label: "Bills", icon: Lightbulb },
    { id: "verify", label: "Save", icon: Wallet },     // savings
    { id: "verify", label: "Borrow", icon: Coins },    // GLoan
    { id: "card", label: "Commute", icon: Train },     // transit
    { id: "transactions", label: "Rewards", icon: Gift }, // loyalty
  ];

  return (
    <div className="space-y-5 px-4 py-4">
      {/* Top bar */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl pay8-gradient-navy font-bold text-white pay8-elev-1">8</div>
          <div>
            <div className="text-base font-bold text-foreground leading-tight">PAY8</div>
            <div className="text-[10px] text-muted-foreground leading-tight">Hello, {profile.firstName}</div>
          </div>
        </div>
        <button
          onClick={() => navigate("inbox")}
          className="relative rounded-full border border-border bg-card p-2 text-muted-foreground hover:bg-muted"
          aria-label="Inbox"
        >
          <Inbox className="h-5 w-5" />
          {unread > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white">
              {unread}
            </span>
          )}
        </button>
      </header>

      <BalanceCard />

      {showVerifyBanner && (
        <VerifyBanner level={verification.level} onContinue={() => navigate("verify")} />
      )}

      {/* Quick actions — 2 rows × 4 columns */}
      <section>
        <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Quick actions</h2>
        <div className="grid grid-cols-4 gap-2">
          {quickActions.map((qa) => (
            <button
              key={qa.label}
              onClick={() => navigate(qa.id)}
              className="group flex flex-col items-center gap-1.5 rounded-2xl border border-border bg-card p-2 transition-all hover:bg-muted active:scale-95"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <qa.icon className="h-5 w-5" strokeWidth={2.2} />
              </div>
              <span className="text-[11px] font-medium text-muted-foreground group-hover:text-foreground">{qa.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Dual cards section: My Card (left) + PAY8 transit card (right) */}
      <section>
        <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">My cards</h2>
        <div className="grid grid-cols-2 gap-3">
          {/* Left: My Card (account wallet card) */}
          <button
            onClick={() => navigate("transactions")}
            className="relative overflow-hidden rounded-2xl border border-border bg-card p-4 text-left pay8-elev-1 transition-all hover:bg-muted active:scale-[0.98]"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Wallet className="h-4 w-4" strokeWidth={2.2} />
              </div>
              <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <div className="mt-3 text-[10px] uppercase tracking-wider text-muted-foreground">My Card</div>
            <div className="mt-0.5 font-mono text-lg font-bold text-foreground">{formatCurrency(balance)}</div>
            <div className="mt-1 text-[10px] text-muted-foreground">Available balance</div>
          </button>

          {/* Right: PAY8 Card (transit / Beep-style) */}
          <button
            onClick={() => navigate("profile")}
            className="relative overflow-hidden rounded-2xl p-4 text-left text-white pay8-gradient-navy pay8-elev-1 transition-all active:scale-[0.98]"
          >
            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -left-6 -bottom-6 h-20 w-20 rounded-full bg-amber-400/15 blur-2xl" />
            <div className="relative flex items-center justify-between">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15 text-white">
                <Train className="h-4 w-4" strokeWidth={2.2} />
              </div>
              <div className="h-5 w-6 rounded-sm bg-gradient-to-br from-amber-200 to-amber-500" />
            </div>
            <div className="relative mt-3 text-[10px] uppercase tracking-wider text-white/70">PAY8 Card</div>
            <div className="mt-0.5 font-mono text-lg font-bold text-white">{formatCurrency(card.balance)}</div>
            <div className="mt-1 text-[10px] text-white/70">Tap-to-pay transit</div>
          </button>
        </div>
      </section>

      {/* Promos carousel */}
      <section>
        <div className="mb-2 flex items-center justify-between px-1">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Promos for you</h2>
        </div>
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pay8-scroll-snap">
          {PROMOS.map((p) => (
            <div
              key={p.id}
              className="pay8-scroll-snap-item relative min-w-[260px] overflow-hidden rounded-2xl border border-primary/15 bg-primary/[0.04] p-4"
            >
              <div className="text-sm font-semibold text-foreground">{p.title}</div>
              <div className="mt-1 text-xs text-muted-foreground">{p.subtitle}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Ads / sponsored section */}
      <section>
        <div className="mb-2 flex items-center justify-between px-1">
          <h2 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Megaphone className="h-3.5 w-3.5" /> For you
          </h2>
          <span className="text-[10px] text-muted-foreground">Sponsored</span>
        </div>
        <div className="space-y-2">
          {ADS.map((ad) => (
            <button
              key={ad.id}
              onClick={() => navigate("verify")}
              className={`flex w-full items-center gap-3 rounded-2xl border border-border bg-gradient-to-br ${ad.tint} p-3 text-left transition-all hover:bg-muted active:scale-[0.99]`}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-card text-primary pay8-elev-1">
                {ad.id === "ad1" ? <TrendingUp className="h-5 w-5" /> : <Coins className="h-5 w-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-foreground">{ad.title}</div>
                <div className="text-xs text-muted-foreground">{ad.body}</div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function VerifyBanner({ level, onContinue }: { level: "basic" | "verified" | "premium"; onContinue: () => void }) {
  const message =
    level === "basic"
      ? "Verify your identity to unlock higher limits, bank transfers, and the PAY8 Card."
      : "Complete premium verification for higher transaction limits.";
  return (
    <motion.button
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onContinue}
      className="relative w-full overflow-hidden rounded-2xl border border-primary/15 bg-primary/[0.04] p-3 text-left"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Wallet className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <div className="text-xs font-semibold text-primary">Verification needed</div>
          <div className="text-[11px] text-muted-foreground">{message}</div>
        </div>
        <ChevronRight className="h-4 w-4 text-primary" />
      </div>
    </motion.button>
  );
}
