# InfyPOS Frontend

A full-featured Point of Sale system built with React + TypeScript + Vite + TailwindCSS.

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.x
- npm >= 9.x (or yarn / pnpm)

### Install & Run

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev
```

App runs at **http://localhost:3000**

### Demo Login
- **Email:** admin@infy-pos.com
- **Password:** 123456

---

## 📁 Project Structure

```
src/
├── api/           # All API modules (axios-based)
├── assets/styles/ # Global CSS, variables, themes, print
├── components/    # Shared UI components
│   ├── common/    # Button, Input, Table, Modal, Pagination, etc.
│   └── layout/    # Sidebar, Header
├── config/        # App configuration
├── constants/     # Barcodes, roles, modules, permissions
├── hooks/         # Custom React hooks
├── layouts/       # MainLayout, AuthLayout, POSLayout
├── lib/           # axios, queryClient, socket, logger
├── pages/         # All page components
│   ├── auth/         LoginPage, ForgotPasswordPage
│   ├── dashboard/    DashboardPage (charts, stats)
│   ├── sales/        POSPage, SalesListPage, SalesDetailsPage
│   ├── products/     ProductListPage, AddProductPage, Categories, Brands, Units
│   ├── purchases/    PurchasesPage, AddPurchasePage, SuppliersPage
│   ├── customers/    CustomersPage
│   ├── barcode/      BarcodePrintPage (print labels)
│   ├── reports/      SalesReport, PurchaseReport, StockReport
│   ├── settings/     SettingsPage, WarehousesPage
│   ├── users/        UsersPage
│   └── expenses/     ExpensesPage
├── providers/     # Redux + React Query + Toast provider
├── routes/        # React Router v6 setup
├── store/         # Redux Toolkit slices
├── types/         # TypeScript interfaces
└── utils/         # currency, date, formatter, calculation, barcode, print
```

## 🔧 Environment Variables

Create `.env` in root:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_APP_NAME=InfyPOS
```

## 📦 Build for Production

```bash
npm run build
# Output in /dist
```

## 🔗 Backend Connection

This frontend connects to a Node/Express/MongoDB backend.

Set `VITE_API_URL` to your backend URL. The Vite proxy (`/api` → `localhost:5000`) handles requests in development.

## 🖥️ Features

| Feature | Description |
|---|---|
| 🛒 POS Screen | Full point-of-sale with barcode scanner, cart, checkout |
| 📦 Products | CRUD with image upload, SKU/barcode generation |
| 🏷️ Barcode Print | A4/A5/Letter/Thermal label printing with JsBarcode |
| 🛍️ Purchases | Purchase orders, supplier management |
| 💰 Sales | Invoice management, payment tracking |
| 👥 Customers | Customer ledger and history |
| 📊 Reports | Sales, purchase, stock charts and exports |
| ⚙️ Settings | Company info, tax, currency, invoice config |
| 🏭 Warehouses | Multi-warehouse inventory |
| 👤 Users | Role-based access (Admin / Manager / Cashier) |
| 💸 Expenses | Track operational costs |
| 🌙 Dark Mode | Toggle via header |

## 🛠️ Tech Stack

- **React 18** + **TypeScript**
- **Vite 5** (build tool)
- **TailwindCSS 3** (styling)
- **Redux Toolkit** (state)
- **React Query v5** (server state)
- **React Router v6** (routing)
- **Recharts** (charts)
- **JsBarcode** (barcode generation)
- **React-to-Print** (print support)
- **react-hot-toast** (notifications)
- **Axios** (HTTP client)
- **Socket.io-client** (real-time)
- **date-fns** (date utilities)
- **Framer Motion** (animations)
- **Zod + React Hook Form** (form validation)

## 📜 Available Scripts

```bash
npm run dev       # Start dev server (port 3000)
npm run build     # Build for production
npm run preview   # Preview production build
npm run lint      # Run ESLint
npm run format    # Format with Prettier
```

## 🐳 Docker

```bash
docker-compose up --build
```

---

**Demo credentials:** admin@infy-pos.com / 123456
