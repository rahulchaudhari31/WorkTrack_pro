import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../layouts/DashboardLayout';

const Login          = lazy(() => import('../pages/auth/Login'));
const ForgotPassword = lazy(() => import('../pages/auth/ForgotPassword'));
const ResetPassword  = lazy(() => import('../pages/auth/ResetPassword'));
const Dashboard      = lazy(() => import('../pages/Dashboard'));
const Employees      = lazy(() => import('../pages/Employees'));
const Attendance     = lazy(() => import('../pages/Attendance'));
const Payments       = lazy(() => import('../pages/Payments'));
const Reports        = lazy(() => import('../pages/Reports'));
const Profile        = lazy(() => import('../pages/Profile'));

const Protected = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex h-screen items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" /></div>;
  return user ? children : <Navigate to="/login" replace />;
};

const AppRoutes = () => (
  <BrowserRouter>
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" /></div>}>
      <Routes>
        <Route path="/login"           element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password"  element={<ResetPassword />} />

        <Route path="/" element={<Protected><DashboardLayout /></Protected>}>
          <Route index                   element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard"        element={<Dashboard />} />
          <Route path="employees"        element={<Employees />} />
          <Route path="attendance"       element={<Attendance />} />
          <Route path="payments"         element={<Payments />} />
          <Route path="reports"          element={<Reports />} />
          <Route path="profile"          element={<Profile />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  </BrowserRouter>
);

export default AppRoutes;
