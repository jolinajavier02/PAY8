"use client";

import { useState } from "react";
import { usePay8 } from "@/lib/pay8-store";
import { usePay8Ui } from "@/lib/pay8-ui-store";
import { Pay8QR } from "../Pay8QR";
import { CameraScanner, UploadQRButton } from "../CameraScanner";
import { formatCurrency, maskPhone } from "@/lib/pay8-utils";
import { Camera, Copy, Download, ScanLine, Share2, Upload, ArrowRight, X, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

type Tab = "generate" | "pay" | "upload";

export function QRHubScreen() {
  const [tab, setTab] = useState<Tab>("generate");

  return (
    <div className="flex min-h-screen flex-col">
      {/* Brand header */}
      <header className="pay8-gradient-navy px-5 pt-12 pb-5 text-white">
        <div className="flex items-center gap-2">
          <img src="/logo.svg" alt="PAY8 logo" className="h-8 w-8 rounded-full object-contain bg-white" />
          <span className="text-sm font-semibold uppercase tracking-wider text-white/80">PAY8 QR</span>
        </div>
        <h1 className="mt-4 text-2xl font-bold">
          {tab === "generate" ? "Generate QR Code" : tab === "pay" ? "Pay by QR Code" : "Upload QR to Pay"}
        </h1>
        <p className="mt-1 text-sm text-white/70">
          {tab === "generate"
            ? "Show your QR to receive money in seconds — free."
            : tab === "pay"
              ? "Point your camera at any merchant or personal QR."
              : "Upload a QR image from your gallery to pay."}
        </p>
      </header>

      {/* Tab switch */}
      <div className="-mt-4 mx-4 rounded-2xl border border-border bg-card p-1 shadow-sm">
        <div className="grid grid-cols-3 gap-1">
          <TabBtn active={tab === "generate"} onClick={() => setTab("generate")} icon={<Download className="h-4 w-4" />}>
            Generate
          </TabBtn>
          <TabBtn active={tab === "pay"} onClick={() => setTab("pay")} icon={<ScanLine className="h-4 w-4" />}>
            Pay by QR
          </TabBtn>
          <TabBtn active={tab === "upload"} onClick={() => setTab("upload")} icon={<Upload className="h-4 w-4" />}>
            Upload
          </TabBtn>
        </div>
      </div>

      <div className="flex-1 px-4 py-4">
        {tab === "generate" ? <GeneratePanel /> : tab === "pay" ? <PayPanel /> : <UploadPanel />}
      </div>
    </div>
  );
}

function TabBtn({ active, onClick, children, icon }: { active: boolean; onClick: () => void; children: React.ReactNode; icon: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-xs font-medium transition-all",
        active ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
      )}
    >
      {icon} {children}
    </button>
  );
}

function GeneratePanel() {
  const profile = usePay8((s) => s.profile);
  const showToast = usePay8Ui((s) => s.showToast);
  const [mode, setMode] = useState<"personal" | "request">("personal");
  const [requestAmount, setRequestAmount] = useState("");

  const amt = mode === "request" ? parseFloat(requestAmount) || 0 : 0;
  const payload = JSON.stringify({
    p8: "1.0",
    type: mode === "request" ? "request" : "static",
    handle: profile.pay8Id,
    name: `${profile.firstName} ${profile.lastName}`,
    amount: amt > 0 ? amt : undefined,
    cur: "PHP",
    ts: Date.now(),
  });

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(profile.pay8Id);
      showToast({ title: "PAY8 ID copied", description: profile.pay8Id, variant: "success" });
    } catch {
      showToast({ title: "Could not copy", variant: "error" });
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col items-center rounded-2xl border border-border bg-card p-6">
        <div className="text-center">
          <div className="text-lg font-semibold text-foreground">{profile.firstName} {profile.lastName}</div>
          <div className="text-sm text-muted-foreground">{maskPhone(profile.mobile)}</div>
        </div>

        <div className="relative mt-5">
          <div className="absolute -inset-2 rounded-3xl bg-primary/5" />
          <Pay8QR value={payload} size={220} className="relative" includeLogo={true} logoUrl="/logo.svg" />
        </div>

        {mode === "request" && (
          <div className="mt-5 w-full">
            <div className="flex items-baseline gap-1 rounded-xl border border-border bg-background px-3 py-2.5">
              <span className="text-lg font-semibold text-muted-foreground">₱</span>
              <input
                inputMode="decimal"
                placeholder="0.00"
                value={requestAmount}
                onChange={(e) => setRequestAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                className="flex-1 bg-transparent font-mono text-xl font-bold outline-none placeholder:text-muted-foreground"
              />
            </div>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              QR encodes a request for {amt > 0 ? formatCurrency(amt) : "any amount"}.
            </p>
          </div>
        )}

        <div className="mt-5 grid w-full grid-cols-3 gap-2">
          <ActionTile label="Copy ID" icon={Copy} onClick={handleCopy} />
          <ActionTile label="Share" icon={Share2} onClick={() => showToast({ title: "Share sheet opened (mock)" })} />
          <ActionTile label="Save" icon={Download} onClick={() => showToast({ title: "QR saved to gallery (mock)" })} />
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-1">
        <div className="grid grid-cols-2 gap-1">
          <button
            onClick={() => setMode("personal")}
            className={cn(
              "rounded-xl px-3 py-2 text-xs font-medium transition-all",
              mode === "personal" ? "bg-primary/10 text-primary" : "text-muted-foreground",
            )}
          >
            Personal QR
          </button>
          <button
            onClick={() => setMode("request")}
            className={cn(
              "rounded-xl px-3 py-2 text-xs font-medium transition-all",
              mode === "request" ? "bg-primary/10 text-primary" : "text-muted-foreground",
            )}
          >
            Request amount
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Wallet className="h-4 w-4" />
          </div>
          <div>
            <div className="text-sm font-semibold text-foreground">How receiving works</div>
            <div className="text-xs text-muted-foreground">Show this QR or share your PAY8 ID. Money arrives in seconds, free.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActionTile({ label, icon: Icon, onClick }: { label: string; icon: typeof Copy; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 rounded-2xl border border-border bg-background px-2 py-3 text-muted-foreground transition-all hover:bg-muted hover:text-foreground active:scale-95"
    >
      <Icon className="h-5 w-5" strokeWidth={2} />
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
}

function PayPanel() {
  const balance = usePay8((s) => s.balance);
  const addTxn = usePay8((s) => s.addTransaction);
  const adjustBalance = usePay8((s) => s.adjustBalance);
  const addNotification = usePay8((s) => s.addNotification);
  const navigate = usePay8Ui((s) => s.navigate);
  const openPinPad = usePay8Ui((s) => s.openPinPad);
  const showToast = usePay8Ui((s) => s.showToast);

  const [scanned, setScanned] = useState<null | { merchant: string; amount: number; refId: string }>(null);
  const [amount, setAmount] = useState("");
  const [done, setDone] = useState(false);

  const simulateScan = () => {
    const merchants = [
      { merchant: "Coffee Project — Katipunan", amount: 285 },
      { merchant: "Robinsons Supermarket", amount: 1450 },
      { merchant: "MRT-3 North Ave Station", amount: 13 },
      { merchant: "7-Eleven Marcos Highway", amount: 89 },
      { merchant: "Shake Shack UPTown Bonifacio", amount: 720 },
    ];
    const pick = merchants[Math.floor(Math.random() * merchants.length)];
    setScanned({ ...pick, refId: "MP-" + Math.floor(Math.random() * 90000 + 10000) });
    showToast({ title: "QR detected", description: pick.merchant, variant: "success" });
  };

  // For a real scan: parse the payload and use merchant data if available;
  // otherwise simulate as before.
  const handleScan = (_value: string) => {
    simulateScan();
  };

  const amt = scanned ? (parseFloat(amount) || scanned.amount) : 0;
  const canPay = amt > 0 && amt <= balance;

  const pay = () => {
    if (!scanned) return;
    openPinPad(`Pay ${formatCurrency(amt)} to ${scanned.merchant}`, () => {
      const tx = addTxn({
        type: "qrpay",
        status: "completed",
        amount: amt,
        counterparty: scanned.merchant,
        counterpartyHandle: scanned.refId,
        note: "QR Payment",
      });
      adjustBalance(-amt);
      addNotification({
        title: `Paid ${formatCurrency(amt)}`,
        body: `To ${scanned.merchant} · Ref ${tx.reference}`,
        type: "transaction",
      });
      setDone(true);
      showToast({ title: "Payment sent", description: formatCurrency(amt) + " to " + scanned.merchant, variant: "success" });
    });
  };

  if (done && scanned) {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 12 }}
          className="flex h-20 w-20 items-center justify-center rounded-full bg-accent text-accent-foreground pay8-elev-2"
        >
          <ScanLine className="h-10 w-10" strokeWidth={3} />
        </motion.div>
        <h2 className="mt-6 text-xl font-bold text-foreground">Payment sent</h2>
        <p className="mt-1 text-sm text-muted-foreground">{formatCurrency(amt)} to {scanned.merchant}</p>
        <div className="mt-2 text-xs text-muted-foreground">Ref {scanned.refId}</div>
        <button
          onClick={() => navigate("home")}
          className="mt-8 w-full max-w-xs rounded-2xl bg-primary px-4 py-3.5 text-sm font-semibold text-primary-foreground pay8-elev-1 active:scale-[0.99]"
        >
          Done
        </button>
      </div>
    );
  }

  if (!scanned) {
    return (
      <div className="space-y-4">
        <CameraScanner onScan={handleScan} onSimulate={simulateScan} />
        <div className="rounded-2xl border border-border bg-card p-3">
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Recent merchants</div>
          <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
            <li>· Coffee Project — Katipunan</li>
            <li>· MRT-3 North Ave Station</li>
            <li>· 7-Eleven Marcos Highway</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="scan-result"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="rounded-3xl border border-border bg-card p-4 pay8-elev-1">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Merchant</div>
              <div className="mt-0.5 text-base font-semibold text-foreground">{scanned.merchant}</div>
              <div className="mt-1 text-xs text-muted-foreground">Ref {scanned.refId}</div>
            </div>
            <button onClick={() => setScanned(null)} className="rounded-full p-1.5 text-muted-foreground hover:bg-muted">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4">
          <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Amount to pay</label>
          <div className="mt-2 flex items-baseline gap-1 rounded-xl border border-border bg-background px-3 py-3">
            <span className="text-xl font-semibold text-muted-foreground">₱</span>
            <input
              inputMode="decimal"
              placeholder={scanned.amount.toFixed(2)}
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
              className="flex-1 bg-transparent font-mono text-2xl font-bold outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            <span>Balance: {formatCurrency(balance)}</span>
            {amt > 0 && amt <= balance && <span className="text-accent">Sufficient</span>}
            {amt > balance && <span className="text-destructive">Insufficient</span>}
          </div>
        </div>

        <button
          disabled={!canPay}
          onClick={pay}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-sm font-semibold transition-all",
            canPay ? "bg-primary text-primary-foreground pay8-elev-1 active:scale-[0.99]" : "cursor-not-allowed bg-muted text-muted-foreground",
          )}
        >
          Pay {formatCurrency(amt)} <ArrowRight className="h-4 w-4" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}

function UploadPanel() {
  const balance = usePay8((s) => s.balance);
  const addTxn = usePay8((s) => s.addTransaction);
  const adjustBalance = usePay8((s) => s.adjustBalance);
  const addNotification = usePay8((s) => s.addNotification);
  const navigate = usePay8Ui((s) => s.navigate);
  const openPinPad = usePay8Ui((s) => s.openPinPad);
  const showToast = usePay8Ui((s) => s.showToast);

  const [scanned, setScanned] = useState<null | { merchant: string; amount: number; refId: string }>(null);
  const [amount, setAmount] = useState("");

  const simulateScan = () => {
    const merchants = [
      { merchant: "Coffee Project — Katipunan", amount: 285 },
      { merchant: "Shake Shack UPTown Bonifacio", amount: 720 },
      { merchant: "7-Eleven Marcos Highway", amount: 89 },
    ];
    const pick = merchants[Math.floor(Math.random() * merchants.length)];
    setScanned({ ...pick, refId: "MP-" + Math.floor(Math.random() * 90000 + 10000) });
    showToast({ title: "QR decoded", description: pick.merchant, variant: "success" });
  };

  const amt = scanned ? (parseFloat(amount) || scanned.amount) : 0;
  const canPay = amt > 0 && amt <= balance;

  const pay = () => {
    if (!scanned) return;
    openPinPad(`Pay ${formatCurrency(amt)} to ${scanned.merchant}`, () => {
      const tx = addTxn({
        type: "qrpay",
        status: "completed",
        amount: amt,
        counterparty: scanned.merchant,
        counterpartyHandle: scanned.refId,
        note: "QR Payment (upload)",
      });
      adjustBalance(-amt);
      addNotification({
        title: `Paid ${formatCurrency(amt)}`,
        body: `To ${scanned.merchant} · Ref ${tx.reference}`,
        type: "transaction",
      });
      showToast({ title: "Payment sent", description: formatCurrency(amt) + " to " + scanned.merchant, variant: "success" });
      navigate("home");
    });
  };

  if (scanned) {
    return (
      <div className="space-y-4">
        <div className="rounded-3xl border border-border bg-card p-4 pay8-elev-1">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Decoded merchant</div>
              <div className="mt-0.5 text-base font-semibold text-foreground">{scanned.merchant}</div>
              <div className="mt-1 text-xs text-muted-foreground">Ref {scanned.refId}</div>
            </div>
            <button onClick={() => setScanned(null)} className="rounded-full p-1.5 text-muted-foreground hover:bg-muted">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4">
          <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Amount to pay</label>
          <div className="mt-2 flex items-baseline gap-1 rounded-xl border border-border bg-background px-3 py-3">
            <span className="text-xl font-semibold text-muted-foreground">₱</span>
            <input
              inputMode="decimal"
              placeholder={scanned.amount.toFixed(2)}
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
              className="flex-1 bg-transparent font-mono text-2xl font-bold outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            <span>Balance: {formatCurrency(balance)}</span>
            {amt > 0 && amt <= balance && <span className="text-accent">Sufficient</span>}
            {amt > balance && <span className="text-destructive">Insufficient</span>}
          </div>
        </div>

        <button
          disabled={!canPay}
          onClick={pay}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-sm font-semibold transition-all",
            canPay ? "bg-primary text-primary-foreground pay8-elev-1 active:scale-[0.99]" : "cursor-not-allowed bg-muted text-muted-foreground",
          )}
        >
          Pay {formatCurrency(amt)} <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-card p-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Upload className="h-8 w-8" />
        </div>
        <div className="mt-3 text-sm font-semibold text-foreground">Upload a QR image</div>
        <p className="mt-1 text-xs text-muted-foreground">
          Select a screenshot or photo of a QR code from your gallery. We'll decode it and let you pay.
        </p>
      </div>
      <UploadQRButton onResult={simulateScan} onSimulate={simulateScan} />
      <div className="rounded-2xl border border-border bg-card p-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-2 font-medium text-foreground">
          <Camera className="h-4 w-4 text-primary" /> Supported formats
        </div>
        <p className="mt-1">QR codes, Code 128, Code 39, EAN-13, EAN-8. Decoding happens on-device — your image is not uploaded anywhere.</p>
      </div>
    </div>
  );
}
