import React, { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { MainLayout, AuthLayout, PrintLayout, PrivateRoute } from '@/layouts'
import { PageLoader } from '@/components/common'

// ── Lazy page imports ─────────────────────────────────────────
const LoginPage          = lazy(() => import('@/pages/auth/LoginPage'))
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'))
const DashboardPage      = lazy(() => import('@/pages/dashboard/DashboardPage'))
const POSPage            = lazy(() => import('@/pages/sales/POSPage'))
const ProductListPage    = lazy(() => import('@/pages/products/ProductListPage'))
const AddProductPage     = lazy(() => import('@/pages/products/AddProductPage'))
const EditProductPage    = lazy(() => import('@/pages/products/EditProductPage'))
const CategoriesPage          = lazy(() => import('@/pages/products/CategoriesPage'))
const ParentCategoriesPage       = lazy(() => import('@/pages/products/ParentCategoriesPage'))
const ProductDistributionPage    = lazy(() => import('@/pages/products/ProductDistributionPage'))
const AddDistributionPage        = lazy(() => import('@/pages/products/AddDistributionPage'))
const BrandsPage         = lazy(() => import('@/pages/products/BrandsPage'))
const UnitsPage          = lazy(() => import('@/pages/products/UnitsPage'))
const PurchasesPage      = lazy(() => import('@/pages/purchases/PurchasesPage'))
const AddPurchasePage    = lazy(() => import('@/pages/purchases/AddPurchasePage'))
const SuppliersPage      = lazy(() => import('@/pages/purchases/SuppliersPage'))
const SalesListPage      = lazy(() => import('@/pages/sales/SalesListPage'))
const SalesDetailsPage   = lazy(() => import('@/pages/sales/SalesDetailsPage'))
const CustomersPage      = lazy(() => import('@/pages/customers/CustomersPage'))
const BarcodePrintPage   = lazy(() => import('@/pages/barcode/BarcodePrintPage'))
const SalesReportPage    = lazy(() => import('@/pages/reports/SalesReportPage'))
const PurchaseReportPage = lazy(() => import('@/pages/reports/PurchaseReportPage'))
const StockReportPage    = lazy(() => import('@/pages/reports/StockReportPage'))
const SettingsPage       = lazy(() => import('@/pages/settings/SettingsPage'))
const WarehousesPage     = lazy(() => import('@/pages/settings/WarehousesPage'))
const UsersPage          = lazy(() => import('@/pages/users/UsersPage'))
const ExpensesPage       = lazy(() => import('@/pages/expenses/ExpensesPage'))
const ExpenseCategoriesPage = lazy(() => import('@/pages/expenses/ExpenseCategoriesPage'))
const VariationsPage     = lazy(() => import('@/pages/products/VariationsPage'))
const BaseUnitsPage      = lazy(() => import('@/pages/products/BaseUnitsPage'))
const PaymentMethodsPage = lazy(() => import('@/pages/settings/PaymentMethodsPage'))
const AdjustmentsPage    = lazy(() => import('@/pages/adjustments/AdjustmentsPage'))
const AddAdjustmentPage  = lazy(() => import('@/pages/adjustments/AddAdjustmentPage'))
const TransfersPage      = lazy(() => import('@/pages/transfers/TransfersPage'))
const AddTransferPage    = lazy(() => import('@/pages/transfers/AddTransferPage'))
const QuotationsPage     = lazy(() => import('@/pages/quotations/QuotationsPage'))
const AddQuotationPage   = lazy(() => import('@/pages/quotations/AddQuotationPage'))
const PurchaseReturnsPage    = lazy(() => import('@/pages/purchases/PurchaseReturnsPage'))
const AddPurchaseReturnPage  = lazy(() => import('@/pages/purchases/AddPurchaseReturnPage'))
const SaleReturnsPage    = lazy(() => import('@/pages/sales/SaleReturnsPage'))
const AddSaleReturnPage  = lazy(() => import('@/pages/sales/AddSaleReturnPage'))
const HoldsPage              = lazy(() => import('@/pages/sales/HoldsPage'))
const LanguagesPage          = lazy(() => import('@/pages/languages/LanguagesPage'))
const TranslationManagerPage = lazy(() => import('@/pages/languages/TranslationManagerPage'))
const VoucherTypePage        = lazy(() => import('@/pages/settings/VoucherTypePage'))
const BranchesPage           = lazy(() => import('@/pages/settings/BranchesPage'))
const SalesOrderPage         = lazy(() => import('@/pages/sales/SalesOrderPage'))
const AddSalesOrderPage      = lazy(() => import('@/pages/sales/AddSalesOrderPage'))
const DeliveryNotePage       = lazy(() => import('@/pages/sales/DeliveryNotePage'))
const AddDeliveryNotePage    = lazy(() => import('@/pages/sales/AddDeliveryNotePage'))
const PurchaseOrderPage      = lazy(() => import('@/pages/purchases/PurchaseOrderPage'))
const AddPurchaseOrderPage   = lazy(() => import('@/pages/purchases/AddPurchaseOrderPage'))
const GRNPage                = lazy(() => import('@/pages/purchases/GRNPage'))
const AddGRNPage             = lazy(() => import('@/pages/purchases/AddGRNPage'))

// ── Voucher print pages ───────────────────────────────────────
const PurchaseVoucherPage       = lazy(() => import('@/pages/vouchers/PurchaseVoucherPage'))
const PurchaseOrderVoucherPage  = lazy(() => import('@/pages/vouchers/PurchaseOrderVoucherPage'))
const GRNVoucherPage            = lazy(() => import('@/pages/vouchers/GRNVoucherPage'))
const PurchaseReturnVoucherPage = lazy(() => import('@/pages/vouchers/PurchaseReturnVoucherPage'))
const SalesVoucherPage          = lazy(() => import('@/pages/vouchers/SalesVoucherPage'))
const SalesOrderVoucherPage     = lazy(() => import('@/pages/vouchers/SalesOrderVoucherPage'))
const DeliveryNoteVoucherPage   = lazy(() => import('@/pages/vouchers/DeliveryNoteVoucherPage'))
const SaleReturnVoucherPage     = lazy(() => import('@/pages/vouchers/SaleReturnVoucherPage'))
const HoldVoucherPage           = lazy(() => import('@/pages/vouchers/HoldVoucherPage'))

const L = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<PageLoader />}>{children}</Suspense>
)

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Auth ── */}
        <Route element={<AuthLayout />}>
          <Route path="/login"           element={<L><LoginPage /></L>} />
          <Route path="/forgot-password" element={<L><ForgotPasswordPage /></L>} />
        </Route>

        {/* ── Protected ── */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <MainLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />

          {/* Dashboard */}
          <Route path="dashboard" element={<L><DashboardPage /></L>} />

          {/* POS */}
          <Route path="pos" element={<L><POSPage /></L>} />

          {/* Products */}
          <Route path="products"               element={<L><ProductListPage /></L>} />
          <Route path="products/create"        element={<L><AddProductPage /></L>} />
          <Route path="products/edit/:id"      element={<L><EditProductPage /></L>} />
          <Route path="products/parent-categories"      element={<L><ParentCategoriesPage /></L>} />
          <Route path="products/categories"            element={<L><CategoriesPage /></L>} />
          <Route path="products/distribution"          element={<L><ProductDistributionPage /></L>} />
          <Route path="products/distribution/create"   element={<L><AddDistributionPage /></L>} />
          <Route path="products/distribution/edit/:id" element={<L><AddDistributionPage /></L>} />
          <Route path="products/brands"        element={<L><BrandsPage /></L>} />
          <Route path="products/units"         element={<L><UnitsPage /></L>} />
          <Route path="products/variations"    element={<L><VariationsPage /></L>} />
          <Route path="products/base-units"    element={<L><BaseUnitsPage /></L>} />

          {/* Purchases */}
          <Route path="purchases"                      element={<L><PurchasesPage /></L>} />
          <Route path="purchases/create"               element={<L><AddPurchasePage /></L>} />
          <Route path="purchases/suppliers"            element={<L><SuppliersPage /></L>} />
          <Route path="purchases/orders"               element={<L><PurchaseOrderPage /></L>} />
          <Route path="purchases/orders/create"        element={<L><AddPurchaseOrderPage /></L>} />
          <Route path="purchases/grn"                  element={<L><GRNPage /></L>} />
          <Route path="purchases/grn/create"           element={<L><AddGRNPage /></L>} />
          <Route path="purchase-return"                element={<L><PurchaseReturnsPage /></L>} />
          <Route path="purchase-return/create"         element={<L><AddPurchaseReturnPage /></L>} />

          {/* Sales */}
          <Route path="sales"                          element={<L><SalesListPage /></L>} />
          <Route path="sales/:id"                      element={<L><SalesDetailsPage /></L>} />
          <Route path="sales/customers"                element={<L><CustomersPage /></L>} />
          <Route path="customers"                      element={<L><CustomersPage /></L>} />
          <Route path="sales/orders"                   element={<L><SalesOrderPage /></L>} />
          <Route path="sales/orders/create"            element={<L><AddSalesOrderPage /></L>} />
          <Route path="sales/delivery-notes"           element={<L><DeliveryNotePage /></L>} />
          <Route path="sales/delivery-notes/create"    element={<L><AddDeliveryNotePage /></L>} />
          <Route path="sale-return"                    element={<L><SaleReturnsPage /></L>} />
          <Route path="sale-return/create"             element={<L><AddSaleReturnPage /></L>} />
          <Route path="holds"                          element={<L><HoldsPage /></L>} />

          {/* Adjustments */}
          <Route path="adjustments"            element={<L><AdjustmentsPage /></L>} />
          <Route path="adjustments/create"     element={<L><AddAdjustmentPage /></L>} />

          {/* Transfers */}
          <Route path="transfers"              element={<L><TransfersPage /></L>} />
          <Route path="transfers/create"       element={<L><AddTransferPage /></L>} />

          {/* Quotations */}
          <Route path="quotations"             element={<L><QuotationsPage /></L>} />
          <Route path="quotations/create"      element={<L><AddQuotationPage /></L>} />

          {/* Barcode */}
          <Route path="barcode"                element={<L><BarcodePrintPage /></L>} />

          {/* Reports */}
          <Route path="reports/sales"          element={<L><SalesReportPage /></L>} />
          <Route path="reports/purchases"      element={<L><PurchaseReportPage /></L>} />
          <Route path="reports/stock"          element={<L><StockReportPage /></L>} />

          {/* Settings */}
          <Route path="settings"               element={<L><SettingsPage /></L>} />
          <Route path="settings/warehouses"    element={<L><WarehousesPage /></L>} />
          <Route path="settings/users"         element={<L><UsersPage /></L>} />
          <Route path="settings/payment-methods"  element={<L><PaymentMethodsPage /></L>} />
          <Route path="settings/voucher-types"    element={<L><VoucherTypePage /></L>} />
          <Route path="settings/branches"         element={<L><BranchesPage /></L>} />

          {/* Expenses */}
          <Route path="expenses"               element={<L><ExpensesPage /></L>} />
          <Route path="expenses/categories"    element={<L><ExpenseCategoriesPage /></L>} />

          {/* Languages */}
          <Route path="languages"                          element={<L><LanguagesPage /></L>} />
          <Route path="languages/:id/translations"         element={<L><TranslationManagerPage /></L>} />
        </Route>

        {/* ── Voucher print pages (no sidebar) ── */}
        <Route
          element={
            <PrivateRoute>
              <PrintLayout />
            </PrivateRoute>
          }
        >
          <Route path="purchases/:id/print"       element={<L><PurchaseVoucherPage /></L>} />
          <Route path="purchases/orders/:id/print" element={<L><PurchaseOrderVoucherPage /></L>} />
          <Route path="purchases/grn/:id/print"   element={<L><GRNVoucherPage /></L>} />
          <Route path="purchase-return/:id/print" element={<L><PurchaseReturnVoucherPage /></L>} />
          <Route path="sales/:id/print"           element={<L><SalesVoucherPage /></L>} />
          <Route path="sales/orders/:id/print"    element={<L><SalesOrderVoucherPage /></L>} />
          <Route path="sales/delivery-notes/:id/print" element={<L><DeliveryNoteVoucherPage /></L>} />
          <Route path="sale-return/:id/print"     element={<L><SaleReturnVoucherPage /></L>} />
          <Route path="holds/:id/print"           element={<L><HoldVoucherPage /></L>} />
        </Route>

        {/* ── Catch-all ── */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
