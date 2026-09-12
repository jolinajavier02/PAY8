"use client";

import { BookOpen, Bus, Coffee, Gift, ShoppingBag, ShieldCheck, Store, Tag, Train, Utensils } from "lucide-react";
import { cn } from "@/lib/utils";

type Pay8CardArtworkProps = {
  compact?: boolean;
  balance?: string;
  status?: "active" | "frozen";
  showBack?: boolean;
  holder?: string;
  number?: string;
  expiry?: string;
  cvv?: string;
  reveal?: boolean;
  className?: string;
};

export function Pay8CardArtwork({
  compact = false,
  balance,
  status = "active",
  showBack = true,
  holder = "ALEX PAY8",
  number = "•••• •••• •••• 3419",
  expiry = "12/28",
  cvv = "123",
  reveal = false,
  className,
}: Pay8CardArtworkProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="relative aspect-[1.6/1] overflow-hidden rounded-[1.35rem] border border-white/10 bg-[#061a42] p-5 text-white shadow-xl shadow-primary/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_25%,rgba(255,255,255,0.15),transparent_24%),linear-gradient(135deg,rgba(255,255,255,0.08),transparent_42%)]" />
        <div className="absolute -right-16 bottom-[-5.8rem] h-52 w-52 rounded-full border border-white/24" />
        <div className="absolute -right-10 bottom-[-3.7rem] h-40 w-40 rounded-full border border-white/16" />
        <div className="absolute bottom-7 right-5 h-px w-32 rotate-[-18deg] bg-white/22" />
        <div className="absolute bottom-11 right-6 h-px w-28 rotate-[-8deg] bg-white/18" />
        <div className="absolute bottom-4 right-8 h-px w-24 rotate-[8deg] bg-white/16" />

        <div className="relative flex items-start justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo-white.jpeg" alt="PAY8 logo" className="pay8-logo h-9 w-9 border border-white/30 shadow-sm" />
            <div>
              <div className="text-base font-bold tracking-wide">PAY8</div>
              <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/65">E-wallet bank</div>
            </div>
          </div>
          <div className="rounded-full border border-white/25 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-white/80">
            {status}
          </div>
        </div>

        <div className="relative mt-7 h-9 w-11 rounded-lg border border-black/15 bg-gradient-to-br from-stone-100 via-stone-300 to-stone-500 shadow-inner">
          <div className="absolute inset-x-1 top-1/2 h-px bg-black/20" />
          <div className="absolute inset-y-1 left-1/2 w-px bg-black/20" />
        </div>

        {!compact && (
          <div className="relative mt-5 space-y-1">
            <div className="text-[10px] uppercase tracking-[0.18em] text-white/45">Cardholder name</div>
            <div className="font-mono text-sm uppercase tracking-[0.2em] text-white/75">{holder}</div>
            <div className="font-mono text-sm tracking-[0.18em] text-white/70">{number}</div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-white/55">Exp {expiry}</div>
          </div>
        )}

        {compact && balance && (
          <div className="relative mt-7">
            <div className="text-[10px] uppercase tracking-[0.16em] text-white/55">MyCard balance</div>
            <div className="font-mono text-2xl font-bold">{balance}</div>
          </div>
        )}

        <div className="absolute bottom-5 right-5 rounded-lg bg-white px-2.5 py-1 text-[10px] font-black italic tracking-tight text-[#173a86] shadow-sm">
          PAY8
        </div>
      </div>

      {showBack && !compact && <Pay8CardBack cvv={reveal ? cvv : "•••"} />}
    </div>
  );
}

function Pay8CardBack({ cvv }: { cvv: string }) {
  return (
    <div className="relative aspect-[1.6/1] overflow-hidden rounded-[1.15rem] border border-border bg-[#151b24] p-4 text-white shadow-lg">
      <div className="absolute inset-x-0 top-5 h-10 bg-black/80" />
      <div className="relative mt-16 flex items-center gap-3">
        <div className="h-9 flex-1 rounded bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.92)_0_4px,rgba(255,255,255,0.65)_4px_8px)]" />
        <div className="font-mono text-xs text-white/85">CVV {cvv}</div>
      </div>
      <div className="relative mt-3 text-[8px] font-semibold uppercase tracking-wide text-white/65">
        Authorised signature required. Security information protected by PAY8.
      </div>
      <div className="absolute bottom-4 left-4 flex items-center gap-2">
        <img src="/logo-white.jpeg" alt="PAY8 logo" className="pay8-logo h-9 w-9 border border-white/20" />
        <ShieldCheck className="h-8 w-8 rounded-lg bg-white/10 p-1.5 text-white/75" />
      </div>
      <div className="absolute bottom-4 right-4 rounded-lg border border-white/25 px-3 py-2 text-xs font-bold text-white/70">HOLO</div>
    </div>
  );
}

type CommuteCardArtworkProps = {
  compact?: boolean;
  balance?: string;
  className?: string;
};

export function CommuteCardArtwork({ compact = false, balance, className }: CommuteCardArtworkProps) {
  const icons = [Coffee, ShoppingBag, Gift, Utensils, Store, BookOpen, Tag, Train];
  return (
    <div className={cn("space-y-3", className)}>
      <div className="relative aspect-[0.68/1] overflow-hidden rounded-[1.6rem] border border-white/10 bg-[#10246b] p-5 text-white shadow-xl shadow-primary/15">
        <div className="relative z-10 flex items-center gap-2">
          <img src="/logo-white.jpeg" alt="PAY8 logo" className="pay8-logo h-9 w-9 border border-white/25" />
          <div>
            <div className="text-base font-bold tracking-wide">PAY8</div>
            <div className="text-[9px] uppercase tracking-[0.18em] text-white/60">Commute</div>
          </div>
        </div>
        <TransitLineArt className="absolute inset-x-5 top-28 text-white/10" />
        <Bus className="absolute bottom-24 left-7 h-20 w-20 text-white/10" strokeWidth={1.2} />
        <Store className="absolute bottom-8 right-8 h-20 w-20 text-white/10" strokeWidth={1.2} />
        {compact && balance && (
          <div className="absolute bottom-5 left-5 right-5 rounded-2xl bg-white/10 p-3 backdrop-blur">
            <div className="text-[10px] uppercase tracking-[0.16em] text-white/60">Transit balance</div>
            <div className="font-mono text-2xl font-bold">{balance}</div>
          </div>
        )}
      </div>

      {!compact && (
        <div className="relative aspect-[1.6/1] overflow-hidden rounded-[1.25rem] bg-[#10246b] p-4 text-white shadow-lg shadow-primary/15">
          <div className="absolute inset-x-0 top-0 h-9 bg-black/75" />
          <div className="relative mt-12 grid grid-cols-4 gap-2">
            {icons.map((Icon, index) => (
              <div key={index} className="flex aspect-square items-center justify-center rounded-xl border border-white/35 text-white/80">
                <Icon className="h-5 w-5" strokeWidth={1.6} />
              </div>
            ))}
          </div>
          <div className="absolute bottom-4 right-5 text-right font-mono text-xs leading-5 text-white/80">
            <div>Card Number: 7890 1234 5612</div>
            <div>Expires: AUG 2028</div>
          </div>
        </div>
      )}
    </div>
  );
}

function TransitLineArt({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 220 90" fill="none" aria-hidden="true">
      <rect x="10" y="12" width="128" height="52" rx="15" stroke="currentColor" strokeWidth="4" />
      <path d="M32 12v52M86 12v52M118 22h20M22 75h105" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      <circle cx="42" cy="68" r="6" stroke="currentColor" strokeWidth="4" />
      <circle cx="106" cy="68" r="6" stroke="currentColor" strokeWidth="4" />
      <rect x="150" y="22" width="58" height="36" rx="10" stroke="currentColor" strokeWidth="4" />
      <path d="M160 68h38M165 34h28" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}
