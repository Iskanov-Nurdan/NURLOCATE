import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { UserRole } from "../types";

type Props = {
  roles?: UserRole[];
  requireStaff?: boolean;
  requireSuperAdmin?: boolean;
};

export function ProtectedRoute({ roles, requireStaff, requireSuperAdmin }: Props) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas text-muted">
        Загрузка...
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (requireSuperAdmin && !user.is_superuser) {
    return <Navigate to="/app/map" replace />;
  }

  if (requireStaff && !user.is_staff) {
    return <Navigate to="/app/map" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/app/map" replace />;
  }

  return <Outlet />;
}
