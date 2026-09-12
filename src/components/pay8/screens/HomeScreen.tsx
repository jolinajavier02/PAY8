"use client";

import { usePay8 } from "@/lib/pay8-store";
import { usePay8Ui } from "@/lib/pay8-ui-store";
import { BalanceCard } from "../BalanceCard";
import { formatCurrency, PROMOS } from "@/lib/pay8-utils";
import { motion } from "framer-motion";
import {
  Send, Lightbulb, Coins, Train, Gift, ChevronRight, CreditCard, Zap, Megaphone, TrendingUp,
  Compass, Grid3X3, FolderPlus, Wallet,
} from "lucide-react";
import type { ScreenId } from "@/lib/types";

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
            className="relative overflow-hidden rounded-2xl border border-border bg-card p-4 text-left pay8-elev-1 transition-all hover:bg-muted active:scale-[0.98]"
          >
            <SavingsJarPreview />
            <div className="mt-3 text-[10px] uppercase tracking-wider text-muted-foreground">Save8</div>
            <div className="mt-0.5 text-sm font-bold text-foreground">Create savings folders</div>
            <div className="mt-1 text-[10px] text-muted-foreground">Fill jars with coins and bills</div>
          </button>

          <button
            onClick={() => navigate("card")}
            className="relative overflow-hidden rounded-2xl p-4 text-left text-white pay8-gradient-navy pay8-elev-1 transition-all active:scale-[0.98]"
          >
            <StackedCardPreview />
            <div className="relative mt-3 text-[10px] uppercase tracking-wider text-white/70">MyCard</div>
            <div className="mt-0.5 font-mono text-lg font-bold text-white">{formatCurrency(card.balance)}</div>
            <div className="mt-1 text-[10px] text-white/70">Virtual and physical card</div>
          </button>
        </div>
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between px-1">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Invest8 highlights</h2>
          <button onClick={() => navigate("verify")} className="text-[10px] font-semibold text-primary">Invest8</button>
        </div>
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pay8-scroll-snap">
          {STOCK_HIGHLIGHTS.map((stock) => {
            const isUp = stock.move.startsWith("+");
            return (
              <button
                key={stock.symbol}
                onClick={() => navigate("verify")}
                className="pay8-scroll-snap-item min-w-[260px] rounded-2xl border border-border bg-card p-4 text-left transition-all hover:bg-muted/50 active:scale-[0.99]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-xs font-bold text-primary">
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
              className="pay8-scroll-snap-item relative min-w-[260px] overflow-hidden rounded-2xl border border-primary/15 bg-primary/[0.04] p-4"
            >
              <div className="text-sm font-semibold text-foreground">{p.title}</div>
              <div className="mt-1 text-xs text-muted-foreground">{p.subtitle}</div>
            </div>
          ))}
        </div>
      </section>

      <FeatureCarousel
        title="Explore8"
        items={[
          { title: "Nearby deals", subtitle: "Food, transport, and PAY8 partner rewards." },
          { title: "Travel perks", subtitle: "Find promos for trips and city passes." },
        ]}
      />

      <FeatureCarousel
        title="Paybills"
        items={[
          { title: "Utilities", subtitle: "MERALCO, Maynilad, PLDT, Globe, and more." },
          { title: "Government", subtitle: "Pay SSS, BIR, PhilHealth, and Pag-IBIG." },
        ]}
      />

      <FeatureCarousel
        title="Load8"
        items={[
          { title: "Mobile load", subtitle: "Globe, Smart, DITO, TNT, and TM." },
          { title: "Data bundles", subtitle: "Daily, weekly, and gaming packs." },
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

function FeatureCarousel({ title, items }: { title: string; items: Array<{ title: string; subtitle: string }> }) {
  return (
    <section>
      <div className="mb-2 flex items-center justify-between px-1">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h2>
      </div>
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pay8-scroll-snap">
        {items.map((item) => (
          <button
            key={item.title}
            className="pay8-scroll-snap-item min-w-[260px] rounded-2xl border border-primary/15 bg-primary/[0.04] p-4 text-left"
          >
            <div className="text-sm font-semibold text-foreground">{item.title}</div>
            <div className="mt-1 text-xs text-muted-foreground">{item.subtitle}</div>
          </button>
        ))}
      </div>
    </section>
  );
}

function SavingsJarPreview() {
  return (
    <div className="relative h-16">
      <div className="absolute left-2 top-1 h-14 w-12 rounded-b-2xl rounded-t-lg border-2 border-primary/25 bg-primary/5">
        <div className="absolute left-2 right-2 top-[-7px] h-2 rounded-t-md border-2 border-primary/25 border-b-0 bg-card" />
        <div className="absolute bottom-2 left-1 right-1 h-5 rounded-b-xl bg-primary/15" />
        <div className="absolute bottom-3 left-2 h-2 w-2 rounded-full bg-amber-400" />
        <div className="absolute bottom-4 right-2 h-2 w-2 rounded-full bg-amber-300" />
        <div className="absolute bottom-6 left-4 h-2 w-2 rounded-full bg-amber-500" />
      </div>
      <div className="absolute bottom-2 right-1 flex h-8 w-11 rotate-[-8deg] items-center justify-center rounded-md border border-primary/20 bg-emerald-50 text-[10px] font-bold text-primary">
        ₱
      </div>
      <FolderPlus className="absolute right-1 top-0 h-4 w-4 text-primary" />
    </div>
  );
}

function StackedCardPreview() {
  return (
    <div className="relative h-16">
      <div className="absolute right-0 top-1 h-11 w-20 rotate-6 rounded-xl bg-white/18" />
      <div className="absolute left-0 top-3 h-11 w-20 -rotate-6 rounded-xl bg-white/12" />
      <div className="absolute left-2 top-1 h-12 w-24 rounded-xl bg-white/20 p-2">
        <div className="h-3 w-4 rounded-sm bg-gradient-to-br from-amber-200 to-amber-500" />
        <div className="mt-3 h-1.5 w-14 rounded-full bg-white/60" />
        <div className="mt-1 h-1 w-9 rounded-full bg-white/35" />
      </div>
      <CreditCard className="absolute right-1 top-0 h-4 w-4 text-white/80" />
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
