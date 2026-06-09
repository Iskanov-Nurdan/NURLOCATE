import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminLayout } from "./components/layout/AdminLayout";
import { OwnerLayout } from "./components/layout/OwnerLayout";
import { SuperAdminLayout } from "./components/layout/SuperAdminLayout";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { AdminDashboardPage } from "./pages/admin/AdminDashboardPage";
import { AdminDevicesPage } from "./pages/admin/AdminDevicesPage";
import { AdminSubscriptionsPage } from "./pages/admin/AdminSubscriptionsPage";
import { AdminUsersPage } from "./pages/admin/AdminUsersPage";
import { AnimalProfilePage } from "./pages/owner/AnimalProfilePage";
import { BillingPage } from "./pages/owner/BillingPage";
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

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/app" element={<OwnerLayout />}>
              <Route index element={<Navigate to="map" replace />} />
              <Route path="map" element={<MapLivePage />} />
              <Route path="animals/:id" element={<AnimalProfilePage />} />
              <Route path="history" element={<HistoryPage />} />
              <Route path="geofences" element={<GeofencesPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="billing" element={<BillingPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute requireStaff />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboardPage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="devices" element={<AdminDevicesPage />} />
              <Route path="subscriptions" element={<AdminSubscriptionsPage />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute requireSuperAdmin />}>
            <Route path="/super-admin" element={<SuperAdminLayout />}>
              <Route index element={<SuperOverviewPage />} />
              <Route path="admins" element={<SuperAdminsPage />} />
              <Route path="finance" element={<SuperFinancePage />} />
              <Route path="system" element={<SuperSystemPage />} />
              <Route path="audit" element={<SuperAuditPage />} />
              <Route path="settings" element={<SuperSettingsPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
