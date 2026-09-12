"use client";

import { useEffect, useState } from "react";
import { usePay8 } from "@/lib/pay8-store";
import { usePay8Ui } from "@/lib/pay8-ui-store";
import { SplashScreen } from "@/components/pay8/screens/SplashScreen";
import { LoginScreen } from "@/components/pay8/screens/LoginScreen";
import { AppShell } from "@/components/pay8/AppShell";
import { HomeScreen } from "@/components/pay8/screens/HomeScreen";
import { SendScreen } from "@/components/pay8/screens/SendScreen";
import { QRHubScreen } from "@/components/pay8/screens/QRHubScreen";
import { BankTransferScreen } from "@/components/pay8/screens/BankTransferScreen";
import { CashInScreen } from "@/components/pay8/screens/CashInScreen";
import { Pay8CardScreen } from "@/components/pay8/screens/Pay8CardScreen";
import { ProfileScreen } from "@/components/pay8/screens/ProfileScreen";
import { VerifyScreen } from "@/components/pay8/screens/VerifyScreen";
import { TransactionsScreen } from "@/components/pay8/screens/TransactionsScreen";
import { InboxScreen } from "@/components/pay8/screens/InboxScreen";
import { CommuteScreen, NotificationsScreen, PayBillsScreen, Save8Screen, SettingsScreen } from "@/components/pay8/screens/MiscScreens";

export default function Home() {
  const isAuthed = usePay8((s) => s.isAuthed);
  const setAuthed = usePay8((s) => s.setAuthed);
  const resetToHome = usePay8Ui((s) => s.resetToHome);
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("login") === "1") {
      setAuthed(false);
      resetToHome();
      window.setTimeout(() => setSplashDone(true), 0);
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [resetToHome, setAuthed]);

  // Boot sequence: Splash → Login (if not authed) → App
  if (!splashDone) {
    return <SplashScreen onDone={() => setSplashDone(true)} />;
  }
  if (!isAuthed) {
    return <LoginScreen />;
  }
  return <AuthedApp />;
}

function AuthedApp() {
  const screen = usePay8Ui((s) => s.screen);

  return (
    <AppShell>
      <ScreenRouter screen={screen} />
    </AppShell>
  );
}

function ScreenRouter({ screen }: { screen: string }) {
  switch (screen) {
    case "home": return <HomeScreen />;
    case "inbox": return <InboxScreen />;
    case "qrhub": return <QRHubScreen />;
    case "send": return <SendScreen />;
    case "bank": return <BankTransferScreen />;
    case "cashin": return <CashInScreen />;
    case "card": return <Pay8CardScreen />;
    case "save8": return <Save8Screen />;
    case "commute": return <CommuteScreen />;
    case "profile": return <ProfileScreen />;
    case "verify": return <VerifyScreen />;
    case "transactions": return <TransactionsScreen />;
    case "notifications": return <NotificationsScreen />;
    case "paybills": return <PayBillsScreen />;
    case "settings": return <SettingsScreen />;
    default: return <HomeScreen />;
  }
}
