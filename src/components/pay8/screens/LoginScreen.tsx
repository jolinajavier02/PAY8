"use client";

import { useState } from "react";
import { usePay8 } from "@/lib/pay8-store";
import { usePay8Ui } from "@/lib/pay8-ui-store";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronDown, Fingerprint, HelpCircle, IdCard, KeyRound, Mail, RefreshCw, ShieldCheck, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

type Country = "PH" | "JP" | "IN";
type Step = "phone" | "otp" | "details" | "pin-setup" | "pin-confirm";
type AvatarCharacter = "simple_girl" | "simple_boy" | "girly" | "boyish";

const COUNTRIES: Record<Country, { dial: string; flag: string; placeholder: string; maskLen: number }> = {
  PH: { dial: "+63", flag: "🇵🇭", placeholder: "917 123 4567", maskLen: 10 },
  JP: { dial: "+81", flag: "🇯🇵", placeholder: "90 1234 5678", maskLen: 10 },
  IN: { dial: "+91", flag: "🇮🇳", placeholder: "98765 43210", maskLen: 10 },
};

const MOCK_OTP = "1234"; // demo only — auto-fills

const AVATARS: Array<{ id: AvatarCharacter; label: string; tone: string; icon: string }> = [
  { id: "simple_girl", label: "Simple girl", tone: "bg-rose-50 text-rose-700 border-rose-100", icon: "SG" },
  { id: "simple_boy", label: "Simple boy", tone: "bg-sky-50 text-sky-700 border-sky-100", icon: "SB" },
  { id: "girly", label: "Girly", tone: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-100", icon: "GR" },
  { id: "boyish", label: "Boyish", tone: "bg-indigo-50 text-indigo-700 border-indigo-100", icon: "BY" },
];

export function LoginScreen() {
  const setAuthCountry = usePay8((s) => s.setAuthCountry);
  const setAuthPhone = usePay8((s) => s.setAuthPhone);
  const setAuthed = usePay8((s) => s.setAuthed);
  const setPin = usePay8((s) => s.setPin);
  const setProfile = usePay8((s) => s.setProfile);
  const resetToHome = usePay8Ui((s) => s.resetToHome);
  const showToast = usePay8Ui((s) => s.showToast);

  const [step, setStep] = useState<Step>("phone");
  const [country, setCountry] = useState<Country>("PH");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [pin, setPinLocal] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [showCountryMenu, setShowCountryMenu] = useState(false);
  const [details, setDetails] = useState({
    firstName: "",
    lastName: "",
    email: "",
    confirmEmail: "",
    idType: "PhilSys ID",
    idNumber: "",
    biometricsConfirmed: false,
    avatarCharacter: "simple_boy" as AvatarCharacter,
  });

  const fullPhone = `${COUNTRIES[country].dial} ${phone}`;
  const canSubmitPhone = phone.replace(/\D/g, "").length >= 7;
  const canSubmitOtp = otp.length === 4;
  const canSubmitDetails =
    details.firstName.trim().length >= 2 &&
    details.lastName.trim().length >= 2 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.email) &&
    details.email === details.confirmEmail &&
    details.idNumber.trim().length >= 4 &&
    details.biometricsConfirmed;
  const canSubmitPin = pin.length === 6;
  const canConfirmPin = pinConfirm.length === 6 && pin === pinConfirm;

  const handleContinueFromPhone = () => {
    if (!canSubmitPhone) return;
    setAuthCountry(country);
    setAuthPhone(fullPhone);
    setStep("otp");
    showToast({ title: "OTP sent", description: `Use ${MOCK_OTP} to verify (demo)`, variant: "default" });
  };

  const handleVerifyOtp = () => {
    if (otp === MOCK_OTP || otp.length === 4) {
      setStep("details");
    } else {
      showToast({ title: "Invalid OTP", description: "Try 1234 for demo", variant: "error" });
    }
  };

  const handleDetails = () => {
    if (!canSubmitDetails) {
      showToast({ title: "Complete accurate details", description: "Email must match and biometrics must be confirmed.", variant: "warning" });
      return;
    }
    setStep("pin-setup");
  };

  const handleSetPin = () => {
    if (pin.length !== 6) return;
    setStep("pin-confirm");
  };

  const handleConfirmPin = () => {
    if (pin !== pinConfirm) {
      showToast({ title: "PINs don't match", variant: "error" });
      setPinConfirm("");
      return;
    }
    setPin(pin);
    // Set the user's profile mobile from the registered number
    setProfile({
      firstName: details.firstName.trim(),
      lastName: details.lastName.trim(),
      email: details.email.trim(),
      mobile: fullPhone,
      pay8Id: phone.replace(/\D/g, ""),
      avatarCharacter: details.avatarCharacter,
    });
    setAuthed(true);
    resetToHome();
    showToast({ title: "Welcome to PAY8", description: "Account created successfully", variant: "success" });
  };

  return (
    <div className="relative min-h-screen bg-background pt-8">
      {/* Header with logo */}
      <div className="px-5 pt-14 pb-6 text-center">
        <img src="/logo-white.jpeg" alt="PAY8 logo" className="pay8-logo mx-auto h-16 w-16 pay8-elev-1" />
        <h1 className="mt-3 text-2xl font-bold text-foreground">PAY8</h1>
        <p className="text-xs text-muted-foreground">Your money, your commute, one tap.</p>
      </div>

      <div className="px-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.2 }}
          >
            {step === "phone" && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold text-foreground">Get started</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Enter your mobile number. We'll send you a one-time code to verify.</p>
                </div>

                <div className="rounded-2xl border border-border bg-card p-3">
                  <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Mobile number</label>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      onClick={() => setShowCountryMenu((v) => !v)}
                      className="flex items-center gap-1.5 rounded-xl border border-primary/20 bg-background px-3 py-3 text-sm font-medium text-primary hover:border-primary/50 hover:bg-primary/5"
                    >
                      <span className="text-base">{COUNTRIES[country].flag}</span>
                      <span>{COUNTRIES[country].dial}</span>
                      <ChevronDown className="h-3 w-3 text-primary" />
                    </button>
                    <div className="relative flex-1 flex items-center rounded-xl border border-primary/20 bg-background px-3 py-3 focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/10">
                      <input
                        inputMode="tel"
                        placeholder={COUNTRIES[country].placeholder}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/[^\d\s-]/g, ""))}
                        className="flex-1 bg-transparent text-base font-medium outline-none placeholder:text-muted-foreground"
                        autoFocus
                      />
                    </div>
                  </div>
                  {showCountryMenu && (
                    <div className="mt-2 overflow-hidden rounded-xl border border-border bg-card">
                      {(Object.keys(COUNTRIES) as Country[]).map((c) => (
                        <button
                          key={c}
                          onClick={() => {
                            setCountry(c);
                            setShowCountryMenu(false);
                            setPhone("");
                          }}
                          className={cn(
                            "flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-muted",
                            country === c && "bg-primary/5",
                          )}
                        >
                          <span className="text-base">{COUNTRIES[c].flag}</span>
                          <span className="flex-1 text-sm font-medium text-foreground">{c}</span>
                          <span className="text-xs text-muted-foreground">{COUNTRIES[c].dial}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={handleContinueFromPhone}
                  disabled={!canSubmitPhone}
                  className={cn(
                    "flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-sm font-semibold transition-all",
                    canSubmitPhone
                      ? "bg-primary text-primary-foreground pay8-elev-1 active:scale-[0.99]"
                      : "cursor-not-allowed bg-primary/45 text-primary-foreground/80",
                  )}
                >
                  Continue
                </button>

                <div className="grid grid-cols-3 items-center gap-2 pt-2 text-xs">
                  <button
                    onClick={() => showToast({ title: "Help", description: "Email support@pay8.app or call +63 (2) 8888-1234", variant: "default" })}
                    className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
                  >
                    <HelpCircle className="h-3.5 w-3.5" /> Help
                  </button>
                  <button
                    onClick={() => showToast({ title: "Freeze account", description: "Call +63 (2) 8888-1234 to freeze PAY8 after phone theft or SIM loss.", variant: "warning" })}
                    className="text-center font-medium text-primary hover:text-primary/80"
                  >
                    Freeze account
                  </button>
                  <button
                    onClick={() => showToast({ title: "Forgot PIN", description: "Reset via OTP — call support to verify identity", variant: "warning" })}
                    className="flex items-center justify-end gap-1 text-muted-foreground hover:text-foreground"
                  >
                    <KeyRound className="h-3.5 w-3.5" /> Forgot PIN
                  </button>
                </div>

                <p className="text-center text-[10px] text-muted-foreground">
                  By continuing, you agree to PAY8's Terms of Service and Privacy Policy.
                </p>
              </div>
            )}

            {step === "otp" && (
              <div className="space-y-5">
                <button onClick={() => setStep("phone")} className="text-sm text-muted-foreground hover:text-foreground">
                  ← Back
                </button>
                <div>
                  <h2 className="text-xl font-bold text-foreground">Verify your number</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    We sent a 4-digit code to <span className="font-medium text-foreground">{fullPhone}</span>
                  </p>
                </div>

                <OtpInput value={otp} onChange={setOtp} onComplete={handleVerifyOtp} />

                <button
                  onClick={handleVerifyOtp}
                  disabled={!canSubmitOtp}
                  className={cn(
                    "flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-sm font-semibold transition-all",
                    canSubmitOtp
                      ? "bg-primary text-primary-foreground pay8-elev-1 active:scale-[0.99]"
                      : "cursor-not-allowed bg-primary/45 text-primary-foreground/80",
                  )}
                >
                  <ShieldCheck className="h-4 w-4" /> Verify
                </button>

                <button
                  onClick={() => showToast({ title: "OTP resent", description: `Use ${MOCK_OTP} again (demo)`, variant: "default" })}
                  className="flex w-full items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Resend code
                </button>
              </div>
            )}

            {step === "details" && (
              <div className="space-y-4">
                <button onClick={() => setStep("otp")} className="text-sm text-muted-foreground hover:text-foreground">
                  ← Back
                </button>
                <div>
                  <h2 className="text-xl font-bold text-foreground">Account details</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Use accurate details. Email, number, ID, and biometrics are used for verification.</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <RegistrationField label="First name" value={details.firstName} onChange={(v) => setDetails({ ...details, firstName: v })} icon={UserRound} />
                  <RegistrationField label="Last name" value={details.lastName} onChange={(v) => setDetails({ ...details, lastName: v })} icon={UserRound} />
                </div>
                <RegistrationField label="Email" value={details.email} onChange={(v) => setDetails({ ...details, email: v })} icon={Mail} type="email" />
                <RegistrationField label="Confirm email" value={details.confirmEmail} onChange={(v) => setDetails({ ...details, confirmEmail: v })} icon={Mail} type="email" />

                <div className="rounded-2xl border border-border bg-card p-3">
                  <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">ID type</label>
                  <select
                    value={details.idType}
                    onChange={(e) => setDetails({ ...details, idType: e.target.value })}
                    className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none"
                  >
                    {["PhilSys ID", "Driver's License", "Passport", "UMID", "SSS ID"].map((id) => (
                      <option key={id}>{id}</option>
                    ))}
                  </select>
                  <div className="mt-2 flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2.5">
                    <IdCard className="h-4 w-4 text-muted-foreground" />
                    <input
                      placeholder="ID number"
                      value={details.idNumber}
                      onChange={(e) => setDetails({ ...details, idNumber: e.target.value })}
                      className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                    />
                  </div>
                </div>

                <button
                  onClick={() => setDetails({ ...details, biometricsConfirmed: !details.biometricsConfirmed })}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-2xl border p-3 text-left",
                    details.biometricsConfirmed ? "border-primary bg-primary/5 text-primary" : "border-border bg-card text-muted-foreground",
                  )}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Fingerprint className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-foreground">Biometric scan</div>
                    <div className="text-xs text-muted-foreground">Confirm face or fingerprint verification for this demo.</div>
                  </div>
                  {details.biometricsConfirmed && <ShieldCheck className="h-4 w-4" />}
                </button>

                <div>
                  <div className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Choose profile character</div>
                  <div className="grid grid-cols-4 gap-2">
                    {AVATARS.map((avatar) => (
                      <button
                        key={avatar.id}
                        onClick={() => setDetails({ ...details, avatarCharacter: avatar.id })}
                        className={cn(
                          "rounded-2xl border p-2 text-center transition-all",
                          avatar.tone,
                          details.avatarCharacter === avatar.id ? "ring-2 ring-primary" : "",
                        )}
                      >
                        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-white text-xs font-bold">
                          {avatar.icon}
                        </div>
                        <div className="mt-1 text-[10px] font-medium leading-tight">{avatar.label}</div>
                      </button>
                    ))}
                  </div>
                  <p className="mt-2 text-[10px] text-muted-foreground">This character is selected only during registration and cannot be changed later.</p>
                </div>

                <button
                  onClick={handleDetails}
                  disabled={!canSubmitDetails}
                  className={cn(
                    "flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-sm font-semibold transition-all",
                    canSubmitDetails ? "bg-primary text-primary-foreground pay8-elev-1 active:scale-[0.99]" : "cursor-not-allowed bg-primary/45 text-primary-foreground/80",
                  )}
                >
                  Continue <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}

            {step === "pin-setup" && (
              <div className="space-y-5">
                <button onClick={() => setStep("details")} className="text-sm text-muted-foreground hover:text-foreground">
                  ← Back
                </button>
                <div>
                  <h2 className="text-xl font-bold text-foreground">Create your PIN</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Choose a 6-digit PIN. You'll use this to confirm transactions.</p>
                </div>

                <PinDots filled={pin.length} />

                <PinPad
                  onKey={(k) => {
                    if (k === "clear") setPinLocal("");
                    else if (k === "back") setPinLocal((p) => p.slice(0, -1));
                    else if (pin.length < 6) setPinLocal((p) => p + k);
                  }}
                />

                <button
                  onClick={handleSetPin}
                  disabled={!canSubmitPin}
                  className={cn(
                    "flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-sm font-semibold transition-all",
                    canSubmitPin
                      ? "bg-primary text-primary-foreground pay8-elev-1 active:scale-[0.99]"
                      : "cursor-not-allowed bg-primary/45 text-primary-foreground/80",
                  )}
                >
                  Continue <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}

            {step === "pin-confirm" && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold text-foreground">Confirm your PIN</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Re-enter the 6-digit PIN to confirm.</p>
                </div>

                <PinDots filled={pinConfirm.length} />

                <PinPad
                  onKey={(k) => {
                    if (k === "clear") setPinConfirm("");
                    else if (k === "back") setPinConfirm((p) => p.slice(0, -1));
                    else if (pinConfirm.length < 6) setPinConfirm((p) => p + k);
                  }}
                />

                <button
                  onClick={handleConfirmPin}
                  disabled={!canConfirmPin}
                  className={cn(
                    "flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-sm font-semibold transition-all",
                    canConfirmPin
                      ? "bg-primary text-primary-foreground pay8-elev-1 active:scale-[0.99]"
                      : "cursor-not-allowed bg-primary/45 text-primary-foreground/80",
                  )}
                >
                  <ShieldCheck className="h-4 w-4" /> Complete registration
                </button>

                {pinConfirm.length === 6 && pin !== pinConfirm && (
                  <div className="text-center text-xs text-destructive">PINs don't match — re-enter to continue</div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function OtpInput({ value, onChange, onComplete }: { value: string; onChange: (v: string) => void; onComplete: () => void }) {
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "clear", "0", "back"];
  return (
    <div className="space-y-4">
      <div className="flex justify-center gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-xl border-2 text-xl font-bold",
              i < value.length ? "border-primary text-foreground" : "border-border text-muted-foreground",
            )}
          >
            {value[i] ?? ""}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {keys.map((k, idx) => {
          const isAction = k === "clear" || k === "back";
          return (
            <button
              key={`${k}-${idx}`}
              onClick={() => {
                if (k === "clear") onChange("");
                else if (k === "back") onChange(value.slice(0, -1));
                else if (value.length < 4) {
                  const next = value + k;
                  onChange(next);
                  if (next.length === 4) setTimeout(onComplete, 200);
                }
              }}
              className={cn(
                "flex h-12 items-center justify-center rounded-xl text-lg font-medium transition-all active:scale-95",
                isAction ? "bg-muted text-muted-foreground hover:bg-muted/80" : "bg-muted/50 text-foreground hover:bg-muted",
              )}
            >
              {k === "back" ? "⌫" : k === "clear" ? "C" : k}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function RegistrationField({
  label,
  value,
  onChange,
  icon: Icon,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  icon: typeof UserRound;
  type?: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-3">
      <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</label>
      <div className="mt-2 flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2.5">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="min-w-0 flex-1 bg-transparent text-sm outline-none"
        />
      </div>
    </div>
  );
}

function PinDots({ filled }: { filled: number }) {
  return (
    <div className="flex justify-center gap-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-3.5 w-3.5 rounded-full border-2 transition-all",
            i < filled ? "border-primary bg-primary" : "border-border",
          )}
        />
      ))}
    </div>
  );
}

function PinPad({ onKey }: { onKey: (k: string) => void }) {
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "clear", "0", "back"];
  return (
    <div className="grid grid-cols-3 gap-3">
      {keys.map((k, idx) => {
        const isAction = k === "clear" || k === "back";
        return (
          <button
            key={`${k}-${idx}`}
            onClick={() => onKey(k)}
            className={cn(
              "flex h-14 items-center justify-center rounded-2xl text-xl font-medium transition-all active:scale-95",
              isAction ? "bg-muted text-muted-foreground hover:bg-muted/80" : "bg-muted/50 text-foreground hover:bg-muted",
            )}
          >
            {k === "back" ? "⌫" : k === "clear" ? "C" : k}
          </button>
        );
      })}
    </div>
  );
}
