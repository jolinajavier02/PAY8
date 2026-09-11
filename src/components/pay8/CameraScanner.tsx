"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Camera, X, Zap, AlertTriangle, Image as ImageIcon } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Live camera scanner using the native BarcodeDetector API.
 * - If BarcodeDetector + getUserMedia available → live scan
 * - Else → fallback "Simulate scan" button
 *
 * For production packaging with Capacitor, you'd replace this with
 * @capacitor-community/barcode-scanner (ML Kit under the hood) —
 * the rest of the QR hub flow stays the same.
 */

type BarcodeResult = string;

interface CameraScannerProps {
  onScan: (value: BarcodeResult) => void;
  onSimulate: () => void;
  onClose?: () => void;
}

export function CameraScanner({ onScan, onSimulate, onClose }: CameraScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectorRef = useRef<any>(null);
  const rafRef = useRef<number | null>(null);
  const onScanRef = useRef(onScan);
  const [status, setStatus] = useState<"requesting" | "live" | "denied" | "unsupported">("requesting");
  const [error, setError] = useState<string | null>(null);

  // keep latest onScan in a ref so the effect doesn't restart on callback identity changes
  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  const stop = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  // Auto-start on mount — inlined (not depending on a callback that calls setState)
  useEffect(() => {
    let cancelled = false;

    const begin = async () => {
      if (cancelled) return;
      setStatus("requesting");
      setError(null);
      try {
        const hasBarcodeDetector = typeof (window as any).BarcodeDetector !== "undefined";
        const hasMedia = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);

        if (!hasMedia) {
          if (!cancelled) setStatus("unsupported");
          return;
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => undefined);
        }

        if (hasBarcodeDetector) {
          const DetectorCtor = (window as any).BarcodeDetector;
          detectorRef.current = new DetectorCtor({
            formats: ["qr_code", "code_128", "code_39", "ean_13", "ean_8"],
          });
          setStatus("live");

          const detectLoop = async () => {
            if (cancelled || !videoRef.current || !detectorRef.current) return;
            try {
              const codes = await detectorRef.current.detect(videoRef.current);
              if (codes && codes.length > 0 && codes[0].rawValue) {
                stop();
                onScanRef.current(codes[0].rawValue as BarcodeResult);
                return;
              }
            } catch {
              // ignore single-frame detection errors
            }
            rafRef.current = requestAnimationFrame(detectLoop);
          };
          rafRef.current = requestAnimationFrame(detectLoop);
        } else {
          setStatus("live");
        }
      } catch (err: any) {
        if (cancelled) return;
        if (err?.name === "NotAllowedError" || err?.name === "SecurityError") {
          setStatus("denied");
          setError("Camera permission denied. Tap Simulate to continue, or enable camera in your browser settings.");
        } else {
          setStatus("unsupported");
          setError(err?.message ?? "Could not start camera.");
        }
      }
    };

    begin();
    return () => {
      cancelled = true;
      stop();
    };
  }, [stop]);

  // Cleanup on unmount
  useEffect(() => () => stop(), [stop]);

  return (
    <div className="relative aspect-square w-full max-w-sm mx-auto overflow-hidden rounded-3xl border border-border bg-foreground/5">
      <video
        ref={videoRef}
        playsInline
        muted
        className={cn(
          "absolute inset-0 h-full w-full object-cover",
          status === "live" ? "opacity-100" : "opacity-0",
        )}
      />

      {/* Scan frame overlay */}
      <div className="absolute inset-8 pointer-events-none">
        <div className="absolute -left-1 -top-1 h-10 w-10 border-l-4 border-t-4 border-primary rounded-tl-lg" />
        <div className="absolute -right-1 -top-1 h-10 w-10 border-r-4 border-t-4 border-primary rounded-tr-lg" />
        <div className="absolute -left-1 -bottom-1 h-10 w-10 border-l-4 border-b-4 border-primary rounded-bl-lg" />
        <div className="absolute -right-1 -bottom-1 h-10 w-10 border-r-4 border-b-4 border-primary rounded-br-lg" />
        {status === "live" && (
          <motion.div
            initial={{ y: 0 }}
            animate={{ y: [0, 200, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute left-0 right-0 top-0 h-0.5 bg-primary shadow-[0_0_15px_2px_var(--primary)]"
          />
        )}
      </div>

      {/* Center status / button */}
      {status !== "live" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
          {status === "requesting" && (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Camera className="h-10 w-10 text-primary" />
              </motion.div>
              <div className="text-sm text-muted-foreground">Starting camera…</div>
            </>
          )}
          {status === "denied" && (
            <>
              <AlertTriangle className="h-10 w-10 text-amber-600" />
              <div className="text-sm font-medium text-foreground">Camera blocked</div>
              <div className="text-xs text-muted-foreground">{error}</div>
            </>
          )}
          {status === "unsupported" && (
            <>
              <Camera className="h-10 w-10 text-muted-foreground opacity-50" />
              <div className="text-sm font-medium text-foreground">Camera not available</div>
              <div className="text-xs text-muted-foreground">{error ?? "This browser doesn't support camera scanning. Use Simulate."}</div>
            </>
          )}
        </div>
      )}

      {/* Bottom control bar */}
      <div className="absolute inset-x-0 bottom-0 p-3">
        <div className="flex gap-2">
          <button
            onClick={onSimulate}
            className="flex-1 rounded-xl bg-primary px-3 py-2.5 text-xs font-semibold text-primary-foreground pay8-elev-1 active:scale-95"
          >
            <Zap className="mr-1.5 inline h-3.5 w-3.5" /> Simulate scan
          </button>
          {onClose && (
            <button
              onClick={() => {
                stop();
                onClose();
              }}
              className="rounded-xl border border-border bg-card px-3 py-2.5 text-muted-foreground hover:bg-muted"
              aria-label="Close scanner"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Upload-based QR decoder. Reads a file via FileReader → creates an image →
 * uses BarcodeDetector.detect(image) if available; otherwise returns null
 * (and the caller falls back to simulate).
 */
export async function decodeImageFile(file: File): Promise<string | null> {
  const hasBarcodeDetector = typeof (window as any).BarcodeDetector !== "undefined";
  if (!hasBarcodeDetector) return null;
  try {
    const DetectorCtor = (window as any).BarcodeDetector;
    const detector = new DetectorCtor({ formats: ["qr_code", "code_128", "code_39"] });
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.src = url;
    await img.decode();
    URL.revokeObjectURL(url);
    const codes = await detector.detect(img);
    if (codes && codes.length > 0 && codes[0].rawValue) return codes[0].rawValue as string;
    return null;
  } catch {
    return null;
  }
}

export function UploadQRButton({ onResult, onSimulate }: { onResult: (value: string) => void; onSimulate: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const handle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setBusy(true);
    const v = await decodeImageFile(f);
    setBusy(false);
    if (v) onResult(v);
    else onSimulate();
  };

  return (
    <>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handle} />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card px-4 py-3.5 text-sm font-semibold text-foreground hover:bg-muted active:scale-[0.99]"
      >
        <ImageIcon className="h-4 w-4" /> {busy ? "Decoding…" : "Upload QR image"}
      </button>
    </>
  );
}
