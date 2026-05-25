# MinoOrder Enterprise Restaurant SaaS Platform
Owned by **PlatePixels** | Product Domain: [minoorder.com](https://minoorder.com)

Welcome to the official codebase of **MinoOrder**, a production-grade, multi-tenant restaurant SaaS platform tailored for high-performance self-ordering kiosks, cashier point-of-sale (POS) terminals, and comprehensive web administrative consoles.

This repository features strict multi-tenant database isolation, Belgium VAT / FDM compliance engines, serverless Edge APIs, offline transaction queues, and automated test pipelines.

---

## 📂 Codebase Directory Overview

```
/plate_pixels
├── PlatePixels kiosk project.txt       # Master Architectural Specification Blueprint
├── README.md                           # Root Quickstart & Operational Manual
├── /supabase                           # Supabase Backend Configuration
│   ├── config.toml                     # Local CLI development configuration
│   └── /migrations
│       └── 20260525000000_init_schema.sql  # 26-table DDL, Indexes, and Row Level Security
│   └── /functions                      # Serverless Deno Edge Functions
│       ├── /calculate-cart             # Computes VAT splits & Combo discount allocations
│       ├── /create-order               # Idempotent orders insertion & serial generators
│       └── /fiscal-sign-order          # Secure TSS signature routing (Fiskaly/FDM)
├── /minoorder-web-back-office         # Next.js Web Back Office Portals
│   ├── /src/app/page.tsx               # Main Portal Login Gateway (React state)
│   ├── /src/app/super-admin/page.tsx   # PlatePixels Global Chain Administrator
│   ├── /src/app/store-admin/menu/page.tsx # Restaurant Menu Architect & VAT Combo Sandbox
│   └── /src/styles/globals.css         # Ambient glowing theme and glassmorphic tokens
├── /minoorder_mobile                  # Flutter POS & Kiosk Mobile Codebase
│   ├── /lib/main_pos.dart              # Cashier POS Dashboard, Carts, & FDM signed receipt popup
│   ├── /lib/main_kiosk.dart            # Kiosk welcome loop, step combo wizards, card terminal sims
│   ├── /lib/core/network               # Offline Outbox queue, sync observers, backoff retries
│   ├── /lib/shared_business_engine     # Shared engines (VAT, Combo allocations, ESC/POS formatters)
│   └── /test                           # Compliance Unit Test Verification suite
└── /.github/workflows                  # DevOps CI/CD Automation Layer
    └── ci.yml                          # Automated GitHub Actions test runners
```

---

## 🛠️ Quickstart Installation & Local Execution

### 1. Database & Serverless Backend (Supabase)
To start the local database and Deno serverless runtimes:
1.  **Prerequisites**: Ensure you have [Docker](https://www.docker.com/) and the [Supabase CLI](https://supabase.com/docs/guides/cli) installed.
2.  Navigate to the directory:
    ```bash
    cd supabase
    ```
3.  Boot up the local Supabase environment (this automatically runs all DDL database tables, enums, and RLS security rules):
    ```bash
    supabase start
    ```
4.  Deploy your serverless edge functions:
    ```bash
    supabase functions deploy calculate-cart
    supabase functions deploy create-order
    supabase functions deploy fiscal-sign-order
    ```

### 2. Next.js Web Back Office
To run the administrative portals and the **Proportional VAT Combo Sandbox**:
1.  **Prerequisites**: Ensure [Node.js](https://nodejs.org/) (version 18+) is installed.
2.  Navigate to the directory:
    ```bash
    cd minoorder-web-back-office
    ```
3.  Install dependencies:
    ```bash
    npm install
    ```
4.  Start the local hot-reloaded development server:
    ```bash
    npm run dev
    ```
5.  Open [http://localhost:3000](http://localhost:3000) in your browser. You can:
    *   Tweak and test login gateways.
    *   Navigate to `/super-admin` to provision chains and authorize hardware bindings.
    *   Navigate to `/store-admin/menu` to compile menus and simulate combo discounts!

### 3. Flutter POS & Kiosk Mobile Node
To run the mobile self-ordering kiosk and cashier POS tablets:
1.  **Prerequisites**: Install the [Flutter SDK](https://docs.flutter.dev/get-started/install) (version 3.19+) and configure Android Studio or VS Code.
2.  Navigate to the directory:
    ```bash
    cd minoorder_mobile
    ```
3.  Fetch all packages (BLoC, Drift SQLite, Sembast, Supabase):
    ```bash
    flutter pub get
    ```
4.  Run the **Cashier POS app**:
    ```bash
    flutter run -t lib/main_pos.dart
    ```
5.  Run the **Self-Ordering Kiosk app**:
    ```bash
    flutter run -t lib/main_kiosk.dart
    ```
6.  Execute the automated compliance unit tests to verify tax math:
    ```bash
    flutter test test/shared_business_engine_test.dart
    ```

---

## ⚙️ Core Compliance Logic Details

### Belgium Proportional VAT Combo Discount Algorithm
Belgium tax guidelines require that combo package discounts are distributed proportionally across the items' target VAT rate brackets (e.g. 6% takeaway food vs. 21% drinks/alcohol). This prevents tax optimization disputes.

*   **Formula Applied**:
    $$\text{Discount Ratio} = \frac{\text{Total Normal Gross Price} - \text{Fixed Combo Price}}{\text{Total Normal Gross Price}}$$
    $$\text{Allocated Component Price}_i = \text{Normal Gross Price}_i \times (1 - \text{Discount Ratio})$$
    $$\text{Extracted Net Price}_i = \frac{\text{Allocated Component Price}_i}{1 + \text{VAT Rate}_i}$$
    $$\text{Extracted VAT Amount}_i = \text{Allocated Component Price}_i - \text{Extracted Net Price}_i$$
*   This exact calculation is implemented in three locations:
    1.  **TypeScript/React Sandbox:** [`store-admin/menu/page.tsx`](file:///c:/Users/yasir/OneDrive/Desktop/plate_pixels/minoorder-web-back-office/src/app/store-admin/menu/page.tsx)
    2.  **Dart Mobile Engine:** [`combo_engine.dart`](file:///c:/Users/yasir/OneDrive/Desktop/plate_pixels/minoorder_mobile/lib/shared_business_engine/combo_engine.dart)
    3.  **Deno Serverless API:** [`supabase/functions/calculate-cart/index.ts`](file:///c:/Users/yasir/OneDrive/Desktop/plate_pixels/supabase/functions/calculate-cart/index.ts)

---

## 🛡️ DevOps CI/CD Workflows
Our GitHub Actions pipeline [`ci.yml`](file:///c:/Users/yasir/OneDrive/Desktop/plate_pixels/.github/workflows/ci.yml) validates all additions automatically upon push:
1.  **Schema Check:** Validates PostgreSQL syntax limits.
2.  **TypeScript Check:** Type-checks the Next.js portal pages (`npx tsc --noEmit`).
3.  **Flutter Test Runner:** Executes the entire unit testing suite to confirm tax mathematics remain correct.

---
© 2026 PlatePixels Corp. All rights reserved. MinoOrder is a licensed restaurant SaaS platform.
