"use client";

import { usePay8Ui } from "@/lib/pay8-ui-store";
import { usePay8 } from "@/lib/pay8-store";
import { Home, QrCode, Receipt, User, Inbox, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { ToastHost, PinPad } from "./ToastPinPad";
import type { ScreenId } from "@/lib/types";

const BOTTOM_NAV: Array<{ id: ScreenId; label: string; icon: typeof Home; fab?: boolean }> = [
  { id: "home", label: "Home", icon: Home },
  { id: "inbox", label: "Inbox", icon: Inbox },
  { id: "qrhub", label: "QR", icon: QrCode, fab: true },
  { id: "transactions", label: "Activity", icon: Receipt },
  { id: "profile", label: "Profile", icon: User },
];

const SCREEN_TITLES: Partial<Record<ScreenId, string>> = {
  send: "Send Money",
  bank: "Bank Transfer",
  verify: "Account Verification",
  cashin: "Cash In",
  paybills: "Pay Bills",
  settings: "Settings",
  card: "PAY8 Card",
};

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const screen = usePay8Ui((s) => s.screen);
  const screenStack = usePay8Ui((s) => s.screenStack);
  const navigate = usePay8Ui((s) => s.navigate);
  const goBack = usePay8Ui((s) => s.goBack);
  const notifications = usePay8((s) => s.notifications);
  const unreadCount = notifications.filter((n) => !n.read).length;
  const pinPadOpen = usePay8Ui((s) => s.pinPadOpen);
  const pinPadPurpose = usePay8Ui((s) => s.pinPadPurpose);
  const pinPadOnSuccess = usePay8Ui((s) => s.pinPadOnSuccess);
  const closePinPad = usePay8Ui((s) => s.closePinPad);

  // Tab-bar screens (always render bottom nav, no top bar)
  const isTabScreen =
    screen === "home" ||
    screen === "inbox" ||
    screen === "qrhub" ||
    screen === "transactions" ||
    screen === "profile";

  // Screens that are "full bleed" — no top bar shown
  const isFullScreen = screen === "home" || screen === "qrhub";

  const canGoBack = screenStack.length > 1 && !isTabScreen;

  return (
    <div className="relative min-h-screen w-full bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 pay8-gradient-mesh" />

      {/* Phone-frame container — tablet & desktop center the phone; mobile is full screen */}
      <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col">
        {!isFullScreen && (
          <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur-md">
            {canGoBack && (
              <button
                onClick={goBack}
                aria-label="Back"
                className="-ml-1 rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            <h1 className="flex-1 text-base font-semibold text-foreground">
              {SCREEN_TITLES[screen] ?? ""}
            </h1>
            {!isTabScreen && (
              <button
                onClick={() => navigate("inbox")}
                className="relative rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Notifications"
              >
                <Inbox className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </button>
            )}
          </header>
        )}

        <main className={cn("flex-1 overflow-y-auto", isTabScreen ? "pb-24" : "pb-6")}>
          <AnimatePresence mode="wait">
            <motion.div
              key={screen}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="min-h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        {isTabScreen && <BottomNav active={screen} onChange={navigate} inboxCount={unreadCount} />}
      </div>

      <ToastHost />
      {pinPadOpen && (
        <PinPad
          purpose={pinPadPurpose}
          onSuccess={() => {
            closePinPad();
            pinPadOnSuccess?.();
          }}
          onCancel={closePinPad}
        />
      )}
    </div>
  );
}

function BottomNav({
  active,
  onChange,
  inboxCount,
}: {
  active: ScreenId;
  onChange: (s: ScreenId) => void;
  inboxCount: number;
}) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto flex max-w-md items-stretch justify-around border-t border-border bg-background px-2 pb-[env(safe-area-inset-bottom)] pt-1.5 shadow-[0_-2px_12px_-4px_rgba(11,36,71,0.08)]">
      {BOTTOM_NAV.map((item) => {
        const isActive = active === item.id;
        const Icon = item.icon;

        if (item.fab) {
          return (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              className="group relative -mt-6 flex flex-col items-center gap-0.5"
              aria-label={item.label}
            >
              <div
                className={cn(
                  "flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-lg pay8-elev-2 transition-transform group-active:scale-95",
                  isActive ? "ring-4 ring-primary/15" : "",
                )}
                style={{ background: "linear-gradient(135deg, #1E3A8A 0%, #0B2447 100%)" }}
              >
                <Icon className="h-6 w-6" strokeWidth={2.2} />
              </div>
              <span className="text-[10px] font-medium text-muted-foreground">{item.label}</span>
            </button>
          );
        }

        return (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            className="relative flex flex-1 flex-col items-center gap-1 rounded-lg py-1.5"
            aria-label={item.label}
          >
            <div className="relative">
              <Icon
                className={cn(
                  "h-5 w-5 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground",
                )}
                strokeWidth={isActive ? 2.4 : 2}
              />
              {item.id === "inbox" && inboxCount > 0 && (
                <span className="absolute -right-2 -top-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-bold text-white">
                  {inboxCount}
                </span>
              )}
            </div>
            <span
              className={cn(
                "text-[10px] font-medium transition-colors",
                isActive ? "text-primary" : "text-muted-foreground",
              )}
            >
              {item.label}
            </span>
            {isActive && (
              <motion.span
                layoutId="active-tab"
                className="absolute -top-1.5 h-1 w-8 rounded-full bg-primary"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}
