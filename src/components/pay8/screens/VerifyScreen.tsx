"use client";

import { useState } from "react";
import { usePay8 } from "@/lib/pay8-store";
import { usePay8Ui } from "@/lib/pay8-ui-store";
import type { IdType, Verification } from "@/lib/types";
import {
  ArrowRight, Check, FileText, IdCard, Info, ShieldCheck, Upload, User, UserCircle, Loader2, Camera,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const ID_OPTIONS: IdType[] = [
  "PhilSys ID",
  "Driver's License",
  "Passport",
  "UMID",
  "SSS ID",
  "GSIS ID",
  "TIN ID",
  "Postal ID",
  "Voter's ID",
  "PRC ID",
];

type StepId = "personal" | "idtype" | "front" | "back" | "selfie" | "review" | "submitting" | "done";

export function VerifyScreen() {
  const verification = usePay8((s) => s.verification);
  const profile = usePay8((s) => s.profile);
  const setProfile = usePay8((s) => s.setProfile);
  const updateVerification = usePay8((s) => s.updateVerification);
  const addNotification = usePay8((s) => s.addNotification);
  const showToast = usePay8Ui((s) => s.showToast);
  const navigate = usePay8Ui((s) => s.navigate);

  const steps: { id: StepId; label: string; icon: typeof User }[] = [
    { id: "personal", label: "Personal", icon: User },
    { id: "idtype", label: "ID Type", icon: IdCard },
    { id: "front", label: "ID Front", icon: FileText },
    { id: "back", label: "ID Back", icon: FileText },
    { id: "selfie", label: "Selfie", icon: UserCircle },
    { id: "review", label: "Review", icon: ShieldCheck },
  ];

  const completedFromState = (v: Verification): StepId[] => {
    const done: StepId[] = [];
    if (v.stepsCompleted.personalInfo) done.push("personal");
    if (v.stepsCompleted.idTypeSelected) done.push("idtype");
    if (v.stepsCompleted.idFrontUploaded) done.push("front");
    if (v.stepsCompleted.idBackUploaded) done.push("back");
    if (v.stepsCompleted.selfieCaptured) done.push("selfie");
    if (v.stepsCompleted.reviewConfirmed) done.push("review");
    return done;
  };
  const completed = completedFromState(verification);

  const initialStep: StepId =
    verification.status === "verified" || verification.status === "pending"
      ? "review"
      : !completed.length
        ? "personal"
        : (completed[completed.length - 1] as StepId);

  const [step, setStep] = useState<StepId>(initialStep);
  const [profileForm, setProfileForm] = useState({
    firstName: profile.firstName,
    middleName: profile.middleName ?? "",
    lastName: profile.lastName,
    suffix: profile.suffix ?? "",
    birthdate: profile.birthdate,
    sex: profile.sex ?? "male",
    address: profile.address,
    city: profile.city,
    province: profile.province,
    postalCode: profile.postalCode,
    occupation: profile.occupation,
    sourceOfFunds: profile.sourceOfFunds ?? "Salary",
  });
  const [idType, setIdType] = useState<IdType | undefined>(verification.idType);
  const [idNumber, setIdNumber] = useState(verification.idNumber ?? "");
  const [frontUploaded, setFrontUploaded] = useState(verification.stepsCompleted.idFrontUploaded);
  const [backUploaded, setBackUploaded] = useState(verification.stepsCompleted.idBackUploaded);
  const [selfieCaptured, setSelfieCaptured] = useState(verification.stepsCompleted.selfieCaptured);

  if (verification.status === "verified") {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 12 }}
          className="flex h-20 w-20 items-center justify-center rounded-full bg-accent text-accent-foreground pay8-elev-2"
        >
          <ShieldCheck className="h-10 w-10" strokeWidth={3} />
        </motion.div>
        <h2 className="mt-6 text-xl font-bold text-foreground">Your account is verified</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Level: {verification.level.toUpperCase()}. Higher limits, bank transfers, and card perks unlocked.
        </p>
        <button
          onClick={() => navigate("profile")}
          className="mt-8 w-full max-w-xs rounded-2xl bg-primary px-4 py-3.5 text-sm font-semibold text-primary-foreground pay8-elev-1 active:scale-[0.99]"
        >
          Back to profile
        </button>
      </div>
    );
  }

  if (verification.status === "pending") {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 12 }}
          className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-primary-foreground pay8-elev-2"
        >
          <Loader2 className="h-10 w-10 animate-spin" />
        </motion.div>
        <h2 className="mt-6 text-xl font-bold text-foreground">Verification under review</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          We're reviewing your submission. You'll get a notification within 1-2 business days.
        </p>
        <div className="mt-6 w-full max-w-xs rounded-2xl border border-border bg-card p-4 text-left text-xs text-muted-foreground">
          <div className="flex justify-between"><span>ID Type</span><span className="text-foreground">{verification.idType}</span></div>
          <div className="mt-1 flex justify-between"><span>ID Number</span><span className="text-foreground">{verification.idNumber}</span></div>
          <div className="mt-1 flex justify-between"><span>Submitted</span><span className="text-foreground">{verification.submittedAt ? new Date(verification.submittedAt).toLocaleDateString("en-PH") : "—"}</span></div>
        </div>
        <button
          onClick={() => navigate("profile")}
          className="mt-8 w-full max-w-xs rounded-2xl bg-primary px-4 py-3.5 text-sm font-semibold text-primary-foreground pay8-elev-1 active:scale-[0.99]"
        >
          Back to profile
        </button>
      </div>
    );
  }

  const currentIdx = steps.findIndex((s) => s.id === step);
  const progress = ((currentIdx + 1) / steps.length) * 100;

  const goNext = () => {
    const next = steps[currentIdx + 1];
    if (next) setStep(next.id);
  };

  const onSubmit = () => {
    setStep("submitting");
    setTimeout(() => {
      updateVerification({
        status: "pending",
        level: "verified",
        idType,
        idNumber,
        submittedAt: new Date().toISOString(),
        stepsCompleted: {
          personalInfo: true,
          idTypeSelected: true,
          idFrontUploaded: true,
          idBackUploaded: true,
          selfieCaptured: true,
          reviewConfirmed: true,
        },
      });
      setProfile({
        firstName: profileForm.firstName,
        middleName: profileForm.middleName,
        lastName: profileForm.lastName,
        suffix: profileForm.suffix,
        birthdate: profileForm.birthdate,
        sex: profileForm.sex as "male" | "female" | "other",
        address: profileForm.address,
        city: profileForm.city,
        province: profileForm.province,
        postalCode: profileForm.postalCode,
        occupation: profileForm.occupation,
        sourceOfFunds: profileForm.sourceOfFunds,
      });
      addNotification({
        title: "Verification submitted",
        body: `We received your ${idType ?? "ID"}. Review takes 1-2 business days.`,
        type: "verification",
      });
      showToast({ title: "Submitted", description: "Verification under review", variant: "success" });
      setStep("done");
      setTimeout(() => navigate("profile"), 1400);
    }, 1800);
  };

  if (step === "submitting" || step === "done") {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 12 }}
          className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-primary-foreground pay8-elev-2"
        >
          {step === "submitting" ? <Loader2 className="h-10 w-10 animate-spin" /> : <Check className="h-10 w-10" strokeWidth={3} />}
        </motion.div>
        <h2 className="mt-6 text-xl font-bold text-foreground">{step === "submitting" ? "Submitting verification…" : "Submitted!"}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {step === "submitting" ? "Securing your data and uploading documents." : "Redirecting back to your profile…"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 px-4 py-4">
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Step {currentIdx + 1} of {steps.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full rounded-full bg-primary"
          />
        </div>
        <div className="mt-3 grid grid-cols-6 gap-1">
          {steps.map((s, i) => {
            const isDone = completed.includes(s.id) || i < currentIdx;
            const isCurrent = s.id === step;
            return (
              <button
                key={s.id}
                onClick={() => isDone && setStep(s.id)}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-lg p-1.5 transition-all",
                  isCurrent ? "bg-primary/10" : "hover:bg-muted",
                )}
              >
                <div
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold",
                    isDone ? "bg-accent/15 text-accent" : isCurrent ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                  )}
                >
                  {isDone ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </div>
                <span className="text-[10px] text-muted-foreground">{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.2 }}
        >
          {step === "personal" && (
            <div className="space-y-3">
              <Header
                icon={<User className="h-4 w-4" />}
                title="Personal information"
                sub="Please enter your legal name and details exactly as they appear on your ID."
              />
              <div className="grid grid-cols-2 gap-2">
                <FormField label="First name" value={profileForm.firstName} onChange={(v) => setProfileForm({ ...profileForm, firstName: v })} />
                <FormField label="Middle name" value={profileForm.middleName} onChange={(v) => setProfileForm({ ...profileForm, middleName: v })} />
                <FormField label="Last name" value={profileForm.lastName} onChange={(v) => setProfileForm({ ...profileForm, lastName: v })} />
                <FormField label="Suffix" value={profileForm.suffix} onChange={(v) => setProfileForm({ ...profileForm, suffix: v })} placeholder="Jr / Sr / III" />
              </div>
              <FormField label="Birthdate" type="date" value={profileForm.birthdate} onChange={(v) => setProfileForm({ ...profileForm, birthdate: v })} />
              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Sex</label>
                <div className="mt-1 grid grid-cols-3 gap-1 rounded-xl border border-border bg-background p-1">
                  {(["male", "female", "other"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setProfileForm({ ...profileForm, sex: s })}
                      className={cn("rounded-lg py-2 text-xs font-medium capitalize transition-all", profileForm.sex === s ? "bg-primary text-primary-foreground" : "text-muted-foreground")}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <FormField label="Address" value={profileForm.address} onChange={(v) => setProfileForm({ ...profileForm, address: v })} />
              <div className="grid grid-cols-2 gap-2">
                <FormField label="City" value={profileForm.city} onChange={(v) => setProfileForm({ ...profileForm, city: v })} />
                <FormField label="Province" value={profileForm.province} onChange={(v) => setProfileForm({ ...profileForm, province: v })} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <FormField label="Postal code" value={profileForm.postalCode} onChange={(v) => setProfileForm({ ...profileForm, postalCode: v })} />
                <FormField label="Occupation" value={profileForm.occupation} onChange={(v) => setProfileForm({ ...profileForm, occupation: v })} />
              </div>
              <FormField label="Source of funds" value={profileForm.sourceOfFunds} onChange={(v) => setProfileForm({ ...profileForm, sourceOfFunds: v })} />
              <PrimaryButton
                onClick={() => {
                  updateVerification({ stepsCompleted: { ...verification.stepsCompleted, personalInfo: true } });
                  goNext();
                }}
              >
                Continue <ArrowRight className="h-4 w-4" />
              </PrimaryButton>
            </div>
          )}

          {step === "idtype" && (
            <div className="space-y-3">
              <Header
                icon={<IdCard className="h-4 w-4" />}
                title="Select an ID"
                sub="Choose one government-issued ID to upload. Make sure it's valid and not expired."
              />
              <FormField label="ID Number" value={idNumber} onChange={setIdNumber} placeholder={idType === "Passport" ? "P1234567A" : "0000-0000-0000"} />
              <div className="grid grid-cols-2 gap-2">
                {ID_OPTIONS.map((id) => (
                  <button
                    key={id}
                    onClick={() => {
                      setIdType(id);
                      updateVerification({ idType: id, stepsCompleted: { ...verification.stepsCompleted, idTypeSelected: true } });
                    }}
                    className={cn(
                      "rounded-2xl border px-3 py-3 text-left text-xs font-medium transition-all",
                      idType === id ? "border-primary bg-primary/5 text-primary" : "border-border bg-card hover:bg-muted",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-foreground">{id}</span>
                      {idType === id && <Check className="h-3.5 w-3.5" />}
                    </div>
                  </button>
                ))}
              </div>
              <PrimaryButton disabled={!idType || !idNumber.trim()} onClick={goNext}>
                Continue <ArrowRight className="h-4 w-4" />
              </PrimaryButton>
            </div>
          )}

          {(step === "front" || step === "back" || step === "selfie") && (
            <UploadStep
              step={step}
              frontUploaded={frontUploaded}
              backUploaded={backUploaded}
              selfieCaptured={selfieCaptured}
              onUpload={() => {
                if (step === "front") {
                  setFrontUploaded(true);
                  updateVerification({ stepsCompleted: { ...verification.stepsCompleted, idFrontUploaded: true } });
                  goNext();
                } else if (step === "back") {
                  setBackUploaded(true);
                  updateVerification({ stepsCompleted: { ...verification.stepsCompleted, idBackUploaded: true } });
                  goNext();
                } else {
                  setSelfieCaptured(true);
                  updateVerification({ stepsCompleted: { ...verification.stepsCompleted, selfieCaptured: true } });
                  goNext();
                }
              }}
            />
          )}

          {step === "review" && (
            <div className="space-y-4">
              <Header
                icon={<ShieldCheck className="h-4 w-4" />}
                title="Review & submit"
                sub="Confirm the details below. You won't be able to edit after submission."
              />
              <div className="space-y-2 rounded-2xl border border-border bg-card p-4 text-sm">
                <Row label="Name" value={`${profileForm.firstName} ${profileForm.middleName} ${profileForm.lastName} ${profileForm.suffix}`.trim()} />
                <Row label="Birthdate" value={profileForm.birthdate} />
                <Row label="Address" value={`${profileForm.address}, ${profileForm.city}, ${profileForm.province} ${profileForm.postalCode}`} />
                <Row label="Occupation" value={profileForm.occupation} />
                <Row label="ID Type" value={idType ?? "—"} />
                <Row label="ID Number" value={idNumber || "—"} />
                <Row label="Documents" value={[frontUploaded && "Front", backUploaded && "Back", selfieCaptured && "Selfie"].filter(Boolean).join(" · ")} />
              </div>

              <div className="rounded-2xl bg-primary/[0.06] border border-primary/15 p-3 text-xs text-primary">
                <Info className="mr-1.5 inline h-3.5 w-3.5" /> By submitting, you agree to PAY8's verification terms. Your data is encrypted and stored securely.
              </div>

              <PrimaryButton onClick={onSubmit}>
                Submit verification <ShieldCheck className="h-4 w-4" />
              </PrimaryButton>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function Header({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">{icon}</div>
      <div>
        <div className="text-sm font-semibold text-foreground">{title}</div>
        <div className="text-xs text-muted-foreground">{sub}</div>
      </div>
    </div>
  );
}

function FormField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-3">
      <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1.5 w-full bg-transparent text-sm font-medium outline-none placeholder:text-muted-foreground"
      />
    </div>
  );
}

function PrimaryButton({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-sm font-semibold transition-all",
        disabled ? "cursor-not-allowed bg-muted text-muted-foreground" : "bg-primary text-primary-foreground pay8-elev-1 active:scale-[0.99]",
      )}
    >
      {children}
    </button>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-foreground">{value}</span>
    </div>
  );
}

function UploadStep({
  step,
  frontUploaded,
  backUploaded,
  selfieCaptured,
  onUpload,
}: {
  step: StepId;
  frontUploaded: boolean;
  backUploaded: boolean;
  selfieCaptured: boolean;
  onUpload: () => void;
}) {
  const config =
    step === "front"
      ? { title: "Upload ID front", sub: "Place the front of your ID on a flat surface. Ensure all corners are visible.", icon: FileText }
      : step === "back"
        ? { title: "Upload ID back", sub: "Place the back of your ID. Make sure text is clearly readable.", icon: FileText }
        : { title: "Selfie verification", sub: "Look straight at the camera. Make sure lighting is good and your face is centered.", icon: UserCircle };

  const alreadyDone = step === "front" ? frontUploaded : step === "back" ? backUploaded : selfieCaptured;

  const [uploading, setUploading] = useState(false);

  const handleUpload = () => {
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      onUpload();
    }, 1500);
  };

  return (
    <div className="space-y-3">
      <Header icon={<config.icon className="h-4 w-4" />} title={config.title} sub={config.sub} />

      <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border-2 border-dashed border-border bg-card">
        {alreadyDone ? (
          <div className="flex h-full flex-col items-center justify-center text-accent">
            <Check className="h-12 w-12" strokeWidth={3} />
            <div className="mt-2 text-sm font-semibold">Captured</div>
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
            {uploading ? (
              <>
                <Loader2 className="h-12 w-12 animate-spin" />
                <div className="mt-2 text-sm">Uploading…</div>
              </>
            ) : (
              <>
                {step === "selfie" ? (
                  <div className="h-24 w-24 rounded-full border-2 border-dashed border-border flex items-center justify-center">
                    <Camera className="h-8 w-8" />
                  </div>
                ) : (
                  <Upload className="h-12 w-12" />
                )}
                <div className="mt-2 text-sm">Tap to {step === "selfie" ? "capture" : "upload"}</div>
              </>
            )}
          </div>
        )}
      </div>

      <PrimaryButton disabled={uploading} onClick={handleUpload}>
        {alreadyDone ? (
          <>Continue <ArrowRight className="h-4 w-4" /></>
        ) : uploading ? (
          <>Uploading…</>
        ) : (
          <>{step === "selfie" ? "Capture selfie" : "Upload photo"} {step !== "selfie" && <Upload className="h-4 w-4" />}</>
        )}
      </PrimaryButton>
    </div>
  );
}
