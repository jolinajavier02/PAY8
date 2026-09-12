"use client";

import { usePay8 } from "@/lib/pay8-store";
import { usePay8Ui } from "@/lib/pay8-ui-store";
import {
  BadgeCheck, ChevronRight, Fingerprint, HelpCircle, KeyRound, Link2, LogOut,
  Bell, Settings, ShieldCheck, User, Banknote, FileText, ScrollText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ScreenId } from "@/lib/types";

const AVATAR_STYLES: Record<string, { label: string; tone: string; icon: string }> = {
  simple_girl: { label: "Simple girl", tone: "bg-rose-50 text-rose-700 border-rose-100", icon: "SG" },
  simple_boy: { label: "Simple boy", tone: "bg-sky-50 text-sky-700 border-sky-100", icon: "SB" },
  girly: { label: "Girly", tone: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-100", icon: "GR" },
  boyish: { label: "Boyish", tone: "bg-indigo-50 text-indigo-700 border-indigo-100", icon: "BY" },
};

export function ProfileScreen() {
  const profile = usePay8((s) => s.profile);
  const verification = usePay8((s) => s.verification);
  const logout = usePay8((s) => s.logout);
  const resetAll = usePay8((s) => s.resetAll);
  const navigate = usePay8Ui((s) => s.navigate);
  const showToast = usePay8Ui((s) => s.showToast);

  const level = verification.level;
  const verified = verification.status === "verified";
  const avatar = AVATAR_STYLES[profile.avatarCharacter ?? "simple_boy"];

  const menuGroups: Array<{
    title: string;
    items: Array<{
      label: string;
      sub?: string;
      icon: typeof User;
      onClick?: () => void;
      screen?: ScreenId;
      danger?: boolean;
    }>;
  }> = [
    {
      title: "Account",
      items: [
        { label: "Account verification", sub: `${level.toUpperCase()} · ${verification.status}`, icon: ShieldCheck, screen: "verify" },
        { label: "Personal information", sub: `${profile.firstName} ${profile.lastName}`, icon: User, onClick: () => showToast({ title: "Edit profile (mock)" }) },
        { label: "Change PIN", icon: KeyRound, onClick: () => showToast({ title: "Change PIN (mock)" }) },
        { label: "Biometrics", sub: "Fingerprint enabled", icon: Fingerprint, onClick: () => showToast({ title: "Biometrics enabled" }) },
        { label: "Linked bank accounts", sub: "1 account · BPI", icon: Link2, screen: "settings" },
        { label: "Bank certificate", sub: "Request account certification", icon: FileText, onClick: () => showToast({ title: "Bank certificate (mock)" }) },
        { label: "Bank statement", sub: "Download monthly statements", icon: ScrollText, onClick: () => showToast({ title: "Bank statement (mock)" }) },
        { label: "Transaction history", sub: "All activity", icon: Banknote, screen: "transactions" },
      ],
    },
    {
      title: "App",
      items: [
        { label: "Inbox", icon: Bell, screen: "inbox" },
        { label: "Settings", icon: Settings, screen: "settings" },
        { label: "Help & support", icon: HelpCircle, onClick: () => showToast({ title: "Opening help (mock)" }) },
      ],
    },
    {
      title: "Session",
      items: [
        {
          label: "Log out",
          icon: LogOut,
          danger: true,
          onClick: () => {
            logout();
            showToast({ title: "Logged out", variant: "warning" });
          },
        },
        {
          label: "Reset demo data",
          icon: LogOut,
          danger: true,
          onClick: () => {
            resetAll();
            showToast({ title: "Demo data reset", variant: "warning" });
          },
        },
      ],
    },
  ];

  return (
    <div className="space-y-5 px-4 py-4">
      {/* Header card */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-5 pay8-elev-1">
        <div className="flex items-center gap-4">
          <div className={cn("flex h-16 w-16 shrink-0 items-center justify-center rounded-full border text-lg font-black pay8-elev-1", avatar.tone)}>
            {avatar.icon}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-1.5">
              <h2 className="text-lg font-bold text-foreground">{profile.firstName} {profile.lastName}</h2>
              {verified && <BadgeCheck className="h-5 w-5 text-accent" />}
            </div>
            <div className="text-xs text-muted-foreground">{profile.email}</div>
            <div className="mt-0.5 text-xs text-muted-foreground">{profile.mobile}</div>
            <div className="mt-1 text-[10px] text-muted-foreground">Profile character: {avatar.label} · locked</div>
          </div>
        </div>

        <button
          onClick={() => navigate("verify")}
          className={cn(
            "mt-3 w-full rounded-2xl px-4 py-2.5 text-left text-sm border",
            verified
              ? "bg-accent/10 border-accent/20"
              : "bg-primary/[0.06] border-primary/15",
          )}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className={cn("font-semibold", verified ? "text-accent" : "text-primary")}>Verification: {level.toUpperCase()}</div>
              <div className={cn("text-xs", verified ? "text-accent/80" : "text-muted-foreground")}>
                {verified ? "Your account is verified" : verification.status === "pending" ? "Under review" : "Tap to complete verification"}
              </div>
            </div>
            <ChevronRight className={cn("h-4 w-4", verified ? "text-accent" : "text-primary")} />
          </div>
        </button>
      </div>

      {/* Menu groups — Account, App, Session only (PAY8 Card moved out) */}
      {menuGroups.map((g) => (
        <section key={g.title}>
          <h2 className="mb-1 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{g.title}</h2>
          <div className="divide-y divide-border rounded-2xl border border-border bg-card">
            {g.items.map((it) => (
              <button
                key={it.label}
                onClick={() => {
                  if (it.onClick) it.onClick();
                  else if (it.screen) navigate(it.screen);
                }}
                className="flex w-full items-center gap-3 px-3 py-3 text-left hover:bg-muted/50"
              >
                <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl", it.danger ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary")}>
                  <it.icon className="h-4 w-4" strokeWidth={2.2} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className={cn("text-sm font-medium", it.danger ? "text-destructive" : "text-foreground")}>{it.label}</div>
                  {it.sub && <div className="truncate text-xs text-muted-foreground">{it.sub}</div>}
                </div>
                <ChevronRight className={cn("h-4 w-4", it.danger ? "text-destructive/60" : "text-muted-foreground")} />
              </button>
            ))}
          </div>
        </section>
      ))}

      <div className="pb-2 text-center text-xs text-muted-foreground">
        PAY8 · v1.0.0 · Built for Filipinos, by Filipinos.
      </div>
    </div>
  );
}
