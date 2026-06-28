import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminLayout } from "./components/layout/AdminLayout";
import { OwnerLayout } from "./components/layout/OwnerLayout";
import { SuperAdminLayout } from "./components/layout/SuperAdminLayout";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { AdminDashboardPage } from "./pages/admin/AdminDashboardPage";
import { AdminDevicesPage } from "./pages/admin/AdminDevicesPage";
import { AdminSubscriptionsPage } from "./pages/admin/AdminSubscriptionsPage";
import { AdminUsersPage } from "./pages/admin/AdminUsersPage";
import { AnimalProfilePage } from "./pages/owner/AnimalProfilePage";
import { BillingPage } from "./pages/owner/BillingPage";
import { PaymentPage } from "./pages/owner/PaymentPage";
import { GeofencesPage } from "./pages/owner/GeofencesPage";
import { HistoryPage } from "./pages/owner/HistoryPage";
import { MapLivePage } from "./pages/owner/MapLivePage";
import { NotificationsPage } from "./pages/owner/NotificationsPage";
import { SettingsPage } from "./pages/owner/SettingsPage";
import { SuperAdminsPage } from "./pages/superadmin/SuperAdminsPage";
import { SuperAuditPage } from "./pages/superadmin/SuperAuditPage";
import { SuperFinancePage } from "./pages/superadmin/SuperFinancePage";
import { SuperOverviewPage } from "./pages/superadmin/SuperOverviewPage";
import { SuperSettingsPage } from "./pages/superadmin/SuperSettingsPage";
import { SuperSystemPage } from "./pages/superadmin/SuperSystemPage";

function HomeRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.is_superuser) return <Navigate to="/super-admin" replace />;
  if (user.is_staff) return <Navigate to="/admin" replace />;
  return <Navigate to="/app/map" replace />;
}

const router = createBrowserRouter(
  [
    { path: "/", element: <HomeRedirect /> },
    { path: "/login", element: <LoginPage /> },
    { path: "/register", element: <RegisterPage /> },
    {
      element: <ProtectedRoute />,
      children: [
        { path: "/billing/pay/:paymentId", element: <PaymentPage /> }
      ]
    },
    {
      element: <ProtectedRoute />,
      children: [
        {
          path: "/app",
          element: <OwnerLayout />,
          children: [
            { index: true, element: <Navigate to="map" replace /> },
            { path: "map", element: <MapLivePage /> },
            { path: "animals/:id", element: <AnimalProfilePage /> },
            { path: "history", element: <HistoryPage /> },
            { path: "geofences", element: <GeofencesPage /> },
            { path: "notifications", element: <NotificationsPage /> },
            { path: "billing", element: <BillingPage /> },
            { path: "settings", element: <SettingsPage /> }
          ]
        }
      ]
    },
    {
      element: <ProtectedRoute requireStaff />,
      children: [
        {
          path: "/admin",
          element: <AdminLayout />,
          children: [
            { index: true, element: <AdminDashboardPage /> },
            { path: "users", element: <AdminUsersPage /> },
            { path: "devices", element: <AdminDevicesPage /> },
            { path: "subscriptions", element: <AdminSubscriptionsPage /> }
          ]
        }
      ]
    },
    {
      element: <ProtectedRoute requireSuperAdmin />,
      children: [
        {
          path: "/super-admin",
          element: <SuperAdminLayout />,
          children: [
            { index: true, element: <SuperOverviewPage /> },
            { path: "admins", element: <SuperAdminsPage /> },
            { path: "finance", element: <SuperFinancePage /> },
            { path: "system", element: <SuperSystemPage /> },
            { path: "audit", element: <SuperAuditPage /> },
            { path: "settings", element: <SuperSettingsPage /> }
          ]
        }
      ]
    },
    { path: "*", element: <Navigate to="/" replace /> }
  ],
  { future: { v7_relativeSplatPath: true } }
);

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RouterProvider router={router} future={{ v7_startTransition: true }} />
      </AuthProvider>
    </ThemeProvider>
  );
}
