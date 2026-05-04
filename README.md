# Family Ledger

A lightweight, privacy-first personal finance tracker that runs entirely in your browser — no server, no account, no data leaves your device.

## Features

- **Multi-currency** — track expenses and income in RMB, USD, or CAD
- **Card management** — assign transactions to specific debit or credit cards
- **Monthly summary** — cumulative income, expense, and balance view per month
- **Balance carry-over** — roll the previous month's surplus into the next month as an income entry
- **Internationalization** — UI auto-detects your system language (English / Chinese)
- **Offline-first** — all data is stored locally in IndexedDB via Dexie.js; works without an internet connection

## Tech Stack

| Layer     | Library                                        |
| --------- | ---------------------------------------------- |
| Framework | [Next.js 16](https://nextjs.org/) (App Router) |
| Language  | TypeScript                                     |
| State     | [Zustand 5](https://zustand-demo.pmnd.rs/)     |
| Storage   | [Dexie.js 4](https://dexie.org/) (IndexedDB)   |
| Styling   | [Tailwind CSS 4](https://tailwindcss.com/)     |
| i18n      | Custom React context (no external library)     |

## Getting Started

### Prerequisites

- Node.js 18+
- Yarn (or npm)

### Install & Run

```bash
# Install dependencies
yarn install

# Start development server
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
yarn build
yarn start
```

## Project Structure

```
src/
├── app/
│   ├── page.tsx          # Home — monthly transaction list
│   └── summary/
│       └── page.tsx      # Monthly summary & carry-over
├── components/
│   ├── CardManager.tsx   # Add / delete cards
│   ├── MonthPicker.tsx   # Month navigation
│   ├── MonthlySummary.tsx
│   ├── TransactionForm.tsx
│   └── TransactionList.tsx
├── db/
│   └── db.ts             # Dexie schema (v1–v4 migrations)
├── hooks/                # useLiveQuery wrappers
├── i18n/
│   ├── translations.ts   # zh / en string dictionaries
│   └── LocaleContext.tsx # Provider + useT() hook
├── store/
│   └── useLedgerStore.ts # Zustand store with CRUD actions
└── types/                # Shared TypeScript types
```

## Data & Privacy

All data is stored in your browser's IndexedDB. Nothing is sent to any server. Clearing browser site data will erase all records — export or back up your data before doing so.

## License

ISC
