"use client";

import { usePay8 } from "@/lib/pay8-store";
import { usePay8Ui } from "@/lib/pay8-ui-store";
import { BalanceCard } from "../BalanceCard";
import { formatCurrency, PROMOS } from "@/lib/pay8-utils";
import { motion } from "framer-motion";
import {
  Send, Lightbulb, Coins, Train, Gift, ChevronRight, Zap, Megaphone, TrendingUp,
  Compass, Grid3X3, Wallet, Sparkles, TicketPercent,
} from "lucide-react";
import type { ScreenId } from "@/lib/types";
import { Pay8CardArtwork } from "../CardArtwork";

const ADS = [
  {
    id: "ad1",
    title: "Save with PAY8 Save8",
    body: "Up to 2.5% APY on automated savings — no minimum balance.",
    badge: "Sponsored",
    tint: "from-primary/10 to-primary/5",
  },
  {
    id: "ad2",
    title: "Borrow up to ₱25,000 instantly",
    body: "Loan8 — apply in 60 seconds, money in your wallet in 5 minutes.",
    badge: "Sponsored",
    tint: "from-emerald-500/10 to-emerald-500/5",
  },
];

const STOCK_HIGHLIGHTS = [
  { symbol: "PSEi", name: "Philippine Stock Exchange", price: "6,482.15", move: "+0.84%" },
  { symbol: "BDO", name: "BDO Unibank", price: "₱148.20", move: "+1.12%" },
  { symbol: "AC", name: "Ayala Corp", price: "₱621.00", move: "-0.35%" },
];

export function HomeScreen() {
  const card = usePay8((s) => s.card);
  const verification = usePay8((s) => s.verification);
  const navigate = usePay8Ui((s) => s.navigate);

  // Hide verification banner once verified
  const showVerifyBanner = verification.status !== "verified";

  // 9 quick actions in the requested PAY8 order.
  const quickActions: Array<{ id: ScreenId; label: string; icon: typeof Send; sub?: string }> = [
    { id: "verify", label: "Borrow", icon: Coins },    // GLoan
    { id: "paybills", label: "Paybills", icon: Lightbulb },
    { id: "paybills", label: "Load8", icon: Zap },     // mobile prepaid load
    { id: "verify", label: "Invest8", icon: TrendingUp },
    { id: "transactions", label: "Explore8", icon: Compass },
    { id: "commute", label: "Commute", icon: Train },     // transit
    { id: "transactions", label: "Rewards", icon: Gift }, // loyalty
    { id: "settings", label: "Others", icon: Grid3X3 },
  ];

  return (
    <div className="space-y-5 px-4 py-4">
      <BalanceCard />

      {showVerifyBanner && (
        <VerifyBanner level={verification.level} onContinue={() => navigate("verify")} />
      )}

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

      <section>
        <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Money tools</h2>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate("save8")}
            className="relative flex min-h-40 items-center justify-center overflow-hidden rounded-2xl border border-amber-200/80 bg-gradient-to-br from-white via-amber-50 to-[#fff7d8] p-4 pay8-elev-1 transition-all active:scale-[0.98]"
            aria-label="Open Save8"
          >
            <SavingsJarPreview />
          </button>

          <button
            onClick={() => navigate("card")}
            className="relative flex min-h-40 items-center justify-center overflow-hidden rounded-2xl bg-[#061a42] p-3 text-white pay8-elev-1 transition-all active:scale-[0.98]"
            aria-label="Open MyCard"
          >
            <Pay8CardArtwork compact balance={formatCurrency(card.balance)} status={card.status} showBack={false} className="w-full" />
          </button>
        </div>
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between px-1">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">For your investment</h2>
          <button onClick={() => navigate("verify")} className="text-[10px] font-semibold text-primary">Invest8</button>
        </div>
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pay8-scroll-snap">
          {STOCK_HIGHLIGHTS.map((stock) => {
            const isUp = stock.move.startsWith("+");
            return (
              <button
                key={stock.symbol}
                onClick={() => navigate("verify")}
                className="pay8-scroll-snap-item min-w-[260px] overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-white via-slate-50 to-primary/10 p-4 text-left transition-all hover:bg-muted/50 active:scale-[0.99]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-xs font-bold text-primary-foreground shadow-sm">
                    {stock.symbol.slice(0, 3)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-foreground">{stock.symbol}</div>
                    <div className="truncate text-xs text-muted-foreground">{stock.name}</div>
                  </div>
                </div>
                <div className="mt-3 flex items-end justify-between">
                  <div className="font-mono text-lg font-semibold text-foreground">{stock.price}</div>
                  <div className={isUp ? "text-sm font-semibold text-accent" : "text-sm font-semibold text-destructive"}>{stock.move}</div>
                </div>
              </button>
            );
          })}
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
              className="pay8-scroll-snap-item relative min-w-[260px] overflow-hidden rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50 via-white to-primary/10 p-4"
            >
              <TicketPercent className="absolute -right-2 -top-3 h-16 w-16 rotate-12 text-amber-300/50" />
              <div className="text-sm font-semibold text-foreground">{p.title}</div>
              <div className="mt-1 text-xs text-muted-foreground">{p.subtitle}</div>
            </div>
          ))}
        </div>
      </section>

      <FeatureCarousel
        title="Deals"
        items={[
          { title: "Explore8", subtitle: "Nearby food, transport, and PAY8 partner rewards.", tone: "blue" },
          { title: "Paybills", subtitle: "Bill payment deals for utilities, government, and telecom.", tone: "green" },
          { title: "Load8", subtitle: "Mobile load and data bundle promos.", tone: "amber" },
        ]}
      />

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

function FeatureCarousel({ title, items }: { title: string; items: Array<{ title: string; subtitle: string; tone?: "blue" | "green" | "amber" }> }) {
  return (
    <section>
      <div className="mb-2 flex items-center justify-between px-1">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h2>
      </div>
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pay8-scroll-snap">
        {items.map((item) => {
          const tone =
            item.tone === "green"
              ? "border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-emerald-100/70"
              : item.tone === "amber"
                ? "border-amber-200 bg-gradient-to-br from-amber-50 via-white to-amber-100/80"
                : "border-primary/20 bg-gradient-to-br from-primary/10 via-white to-sky-50";
          return (
          <button
            key={item.title}
            className={`pay8-scroll-snap-item relative min-w-[260px] overflow-hidden rounded-2xl border p-4 text-left ${tone}`}
          >
            <Sparkles className="absolute -right-2 -top-2 h-14 w-14 text-primary/15" />
            <div className="text-sm font-semibold text-foreground">{item.title}</div>
            <div className="mt-1 text-xs text-muted-foreground">{item.subtitle}</div>
          </button>
        )})}
      </div>
    </section>
  );
}

function SavingsJarPreview() {
  return (
    <div className="relative flex h-32 w-full items-center justify-center">
      <div className="absolute -left-8 -top-8 h-24 w-24 rounded-full bg-amber-300/25 blur-2xl" />
      <div className="absolute -right-8 bottom-0 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
      <img src="/Save8.png" alt="Save8 jar" className="relative h-24 w-auto object-contain drop-shadow-md" />
      <div className="absolute bottom-0 left-2 rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-primary-foreground">
        Save8
      </div>
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
