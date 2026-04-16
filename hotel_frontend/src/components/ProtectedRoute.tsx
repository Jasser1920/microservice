import { Navigate, Outlet, useLocation } from "react-router-dom";

function getUser() {
  try {
    return JSON.parse(localStorage.getItem("user_info") || "null");
  } catch {
    return null;
  }
}

export function ProtectedRoute({ allowedRoles }: { allowedRoles?: string[] }) {
  const user = getUser();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location, error: "You must be logged in." }} replace />;
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" state={{ from: location, error: `You are not allowed to access this page as ${user.role}.` }} replace />;
  }
  return <Outlet />;
}
