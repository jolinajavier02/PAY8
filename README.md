# PAY8

> Your money, your commute, one tap.

PAY8 is an all-in-one mobile e-wallet built for Filipinos — send and receive money, pay by QR, transfer to any Philippine bank via InstaPay/PESONet, pay bills, and tap-to-pay on transit with the PAY8 Card.

Built with Next.js 16, TypeScript, Tailwind CSS 4, and shadcn/ui. Ships as a PWA (installable on Android home screen) and is ready to package as a Play Store APK via Capacitor or Bubblewrap TWA — see `CAPACITOR_README.md` for the full path.

## Features

- **Onboarding** — splash screen, phone registration (PH / JP / IN), OTP verification, 6-digit PIN setup
- **Home** — wallet balance card with hide/show, 8 quick actions (Send, Cash In, Load, Bills, Save, Borrow, Commute, Rewards), dual cards section (My Card + PAY8 transit Card), promo carousel, sponsored ads
- **QR Hub** — three modes:
  - **Generate QR** — your receive code, with Personal / Request-amount modes
  - **Pay by QR** — live camera scanning via the BarcodeDetector API + getUserMedia
  - **Upload QR** — decode a QR image from the gallery
- **Send Money** — to PAY8 user (mobile) or to bank account, review sheet, PIN confirmation
- **Bank Transfer** — 18 Philippine banks + e-wallets, InstaPay (₱25) / PESONet (₱15), account validation
- **Cash In** — Linked Bank / Debit-Credit Card / Over-the-Counter (7-Eleven, Cebuana, Palawan, etc.)
- **PAY8 Card** — transit card (Beep-style), top-up from wallet, freeze/unfreeze, auto-reload config, transit transaction history
- **Pay Bills** — 15 billers (MERALCO, Maynilad, PLDT, Globe, SSS, BIR, etc.)
- **KYC Verification** — 6-step wizard: Personal info → ID type (10 PH IDs) → ID front → ID back → Selfie → Review
- **Inbox** — transaction confirmations only (sent / received / paid)
- **Transactions** — full activity log with filters, search, date grouping, detail sheet
- **Profile** — Account / App / Session sections, biometrics, linked bank accounts
- **PWA** — manifest, icons (192, 512, maskable, 180), theme color, installable on Android home screen

## Tech stack

- **Framework:** Next.js 16 with App Router
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4 + shadcn/ui (New York)
- **State:** Zustand (with localStorage persistence)
- **Animations:** Framer Motion
- **QR codes:** qrcode.react + native BarcodeDetector API
- **Icons:** lucide-react
- **Database:** Prisma ORM (SQLite client) — schema in `prisma/schema.prisma`

## Brand

- **Primary color:** deep navy (`#1E3A8A` → `#0B2447`)
- **Background:** pure white
- **Accent:** emerald, reserved strictly for success states
- **Logo:** navy gradient + white "8" — see `/public/logo.svg` and `/public/icons/`

## Local development

```bash
bun install        # install dependencies
bun run dev        # start dev server on http://localhost:3000
bun run lint       # ESLint check
bun run db:push    # apply Prisma schema to local SQLite
```

### Default demo credentials

- Splash auto-plays for ~2.2 seconds
- Use the country picker to select PH / JP / IN
- OTP: `1234`
- PIN: any 6-digit (e.g. `123456`) — must confirm
- Log out via Profile → Session → Log out to return to the login flow

## Project structure

```
├── public/                  # static assets — icons, manifest, logo
│   └── icons/                # PWA icons (192, 512, maskable, 180, 32)
├── scripts/                  # icon + feature-graphic generation
│   ├── gen-icons.ts
│   └── gen-feature-graphic.ts
├── src/
│   ├── app/                  # Next.js App Router — layout, page, globals.css
│   ├── components/
│   │   ├── ui/               # shadcn/ui components
│   │   └── pay8/             # PAY8-specific components
│   │       └── screens/      # screen components (Home, Login, QRHub, etc.)
│   ├── hooks/                # use-mobile, use-toast
│   └── lib/                  # types, stores, utilities
│       ├── types.ts
│       ├── pay8-store.ts     # Zustand wallet state (persisted)
│       ├── pay8-ui-store.ts  # Zustand UI/navigation state
│       └── pay8-utils.ts     # formatters, bank/biller catalogs
├── prisma/                  # Prisma schema
├── AGENTS.md                 # project conventions
├── CAPACITOR_README.md       # Play Store packaging guide (TWA / Capacitor / Tauri)
└── .env.example              # environment variable template
```

## Play Store packaging

See `CAPACITOR_README.md` for the full path from PWA to signed Android App Bundle (.aab) ready for Google Play Store. Three options documented:

1. **Bubblewrap TWA** (lightest APK)
2. **Capacitor** (with native plugins for camera, biometrics, NFC)
3. **Tauri Mobile** (smallest binary)

Includes the Play Store pre-launch checklist with BSP-specific notes.

## License

Proprietary — All rights reserved.
