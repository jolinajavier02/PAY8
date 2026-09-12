"use client";

import { QRCodeCanvas } from "qrcode.react";
import { cn } from "@/lib/utils";

interface Pay8QRProps {
  value: string;
  size?: number;
  className?: string;
  fgColor?: string;
  bgColor?: string;
  includeLogo?: boolean;
  logoUrl?: string;
}

/**
 * PAY8-branded QR code component.
 * Renders a scannable QRCodeCanvas with optional center logo.
 */
export function Pay8QR({
  value,
  size = 220,
  className,
  fgColor = "#1a0a2e",
  bgColor = "#ffffff",
  includeLogo = true,
  logoUrl,
}: Pay8QRProps) {
  return (
    <div
      className={cn(
        "relative rounded-2xl bg-white p-3 shadow-lg",
        className,
      )}
      style={{ width: size + 24, height: size + 24 }}
    >
      <QRCodeCanvas
        value={value}
        size={size}
        fgColor={fgColor}
        bgColor={bgColor}
        level="H"
        marginSize={0}
        imageSettings={
          includeLogo
            ? {
                src: logoUrl ?? "/logo-white.jpeg",
                height: Math.floor(size * 0.18),
                width: Math.floor(size * 0.27),
                excavate: true,
              }
            : undefined
        }
      />
    </div>
  );
}
