# InfyPOS Backend API

Node.js + Express + MongoDB REST API for the InfyPOS Point of Sale System.

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.x
- MongoDB (local or Atlas)

### Install & Run

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env .env.local
# Edit .env — set your MONGO_URI

# 3. Seed the database (creates demo data + admin user)
npm run seed

# 4. Start development server
npm run dev
```

API runs at **http://localhost:5000**

---

## 🔑 Demo Credentials

| Role    | Email                    | Password |
|---------|--------------------------|----------|
| Admin   | admin@infy-pos.com       | 123456   |
| Manager | manager@infy-pos.com     | 123456   |
| Cashier | cashier@infy-pos.com     | 123456   |

---

## 🌐 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login | Login |
| GET  | /api/auth/me | Get current user |
| POST | /api/auth/logout | Logout |
| PUT  | /api/auth/change-password | Change password |
| POST | /api/auth/forgot-password | Forgot password |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | /api/products | List (paginated, searchable) |
| GET    | /api/products/:id | Get one |
| POST   | /api/products | Create (multipart) |
| PUT    | /api/products/:id | Update |
| DELETE | /api/products/:id | Delete |
| GET    | /api/products/:id/stock | Product stock |

### Sales
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET  | /api/sales | List with filters |
| GET  | /api/sales/:id | Get one |
| POST | /api/sales | Create (deducts stock) |
| PUT  | /api/sales/:id | Update |
| DELETE | /api/sales/:id | Delete (restores stock) |
| POST | /api/sales/:id/payment | Add payment |

### Purchases
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET  | /api/purchases | List |
| POST | /api/purchases | Create (adds stock if received) |
| PUT  | /api/purchases/:id | Update |
| DELETE | /api/purchases/:id | Delete |
| POST | /api/purchases/:id/payment | Add payment |

### Other Resources
All support GET (list), GET /:id, POST, PUT /:id, DELETE /:id:
- `/api/categories`
- `/api/brands`
- `/api/units`
- `/api/warehouses`
- `/api/customers`
- `/api/suppliers`
- `/api/expenses`
- `/api/users` (admin only)

### Stock
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET  | /api/stock | All stock levels |
| POST | /api/stock/adjust | Manual adjustment |
| POST | /api/stock/transfer | Transfer between warehouses |
| GET  | /api/stock/low-stock | Low stock items |

### Reports
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/reports/sales | Sales report |
| GET | /api/reports/purchases | Purchase report |
| GET | /api/reports/stock | Stock report |
| GET | /api/reports/profit-loss | P&L report |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/dashboard/stats | All stats |
| GET | /api/dashboard/sales-chart | Monthly chart data |

### Settings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/settings | Get settings |
| PUT | /api/settings | Update settings |

---

## 📁 Project Structure

```
src/
├── config/
│   ├── db.js          # MongoDB connection
│   └── multer.js      # File upload config
├── controllers/
│   ├── auth.controller.js
│   ├── crud.controller.js    # Generic CRUD factory
│   ├── product.controller.js
│   ├── sale.controller.js
│   ├── purchase.controller.js
│   ├── stock.controller.js
│   ├── dashboard.controller.js
│   ├── report.controller.js
│   ├── setting.controller.js
│   └── user.controller.js
├── middleware/
│   ├── auth.js        # JWT protect + role authorize
│   └── error.js       # Global error handler
├── models/
│   ├── User.js
│   ├── Category.js    # Category, Brand, Unit, Tax, Warehouse
│   ├── Product.js
│   ├── Stock.js
│   ├── Customer.js    # Customer + Supplier
│   ├── Sale.js
│   ├── Purchase.js
│   └── Expense.js     # Expense + Notification + Setting
├── routes/
│   ├── auth.routes.js
│   └── index.js       # All routes
├── seeds/
│   └── index.js       # Database seeder
├── utils/
│   └── helpers.js
└── server.js          # Main entry point
```

## ⚙️ Environment Variables

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/infypos
JWT_SECRET=REC_SAM_POS_17052026_1102_21
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:3000
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=2097152
```

## 🛠️ Scripts

```bash
npm run dev      # Start with nodemon (auto-reload)
npm start        # Production start
npm run seed     # Seed demo data
npm run seed -- --fresh   # Drop all data and re-seed
```

## 🔒 Authentication

All routes (except `/api/auth/login`) require a JWT token:

```
Authorization: Bearer <token>
```

## 🏭 Role Permissions

| Feature | Admin | Manager | Cashier |
|---------|-------|---------|---------|
| Create Sale | ✅ | ✅ | ✅ |
| Delete Sale | ✅ | ❌ | ❌ |
| Create Product | ✅ | ✅ | ❌ |
| Delete Product | ✅ | ❌ | ❌ |
| Manage Users | ✅ | ❌ | ❌ |
| View Reports | ✅ | ✅ | ❌ |
| App Settings | ✅ | ❌ | ❌ |
