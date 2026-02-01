import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoadingSpinner } from '@/components/ui';
import { useI18n } from '@/store/I18nContext';
import { ProtectedRoute } from './ProtectedRoute';

const HomePage = lazy(() => import('@/pages/HomePage').then((m) => ({ default: m.HomePage })));
const LoginPage = lazy(() => import('@/pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('@/pages/RegisterPage').then((m) => ({ default: m.RegisterPage })));
const AccountOverview = lazy(() => import('@/pages/AccountOverview').then((m) => ({ default: m.AccountOverview })));
const Transfer = lazy(() => import('@/pages/Transfer').then((m) => ({ default: m.Transfer })));
const BatchTransfer = lazy(() => import('@/pages/BatchTransfer').then((m) => ({ default: m.BatchTransfer })));
const ScheduledTransfer = lazy(() => import('@/pages/ScheduledTransfer').then((m) => ({ default: m.ScheduledTransfer })));
const BillPayment = lazy(() => import('@/pages/BillPayment').then((m) => ({ default: m.BillPayment })));
const TransactionHistory = lazy(() => import('@/pages/TransactionHistory').then((m) => ({ default: m.TransactionHistory })));
const AdminDashboard = lazy(() => import('@/pages/AdminDashboard').then((m) => ({ default: m.AdminDashboard })));

/** 根路径重定向 */
const RootRedirect = () => <Navigate to="/home" replace />;

function PageFallback() {
  const { t } = useI18n();
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-surface-2">
      <LoadingSpinner size="lg" text={t('common.loading')} />
    </div>
  );
}

export function AppRoutes() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/accounts" element={<ProtectedRoute><AccountOverview /></ProtectedRoute>} />
        <Route path="/transfer" element={<ProtectedRoute><Transfer /></ProtectedRoute>} />
        <Route path="/batch-transfer" element={<ProtectedRoute><BatchTransfer /></ProtectedRoute>} />
        <Route path="/scheduled-transfer" element={<ProtectedRoute><ScheduledTransfer /></ProtectedRoute>} />
        <Route path="/bill-payment" element={<ProtectedRoute><BillPayment /></ProtectedRoute>} />
        <Route path="/transactions" element={<ProtectedRoute><TransactionHistory /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
      </Routes>
    </Suspense>
  );
}
