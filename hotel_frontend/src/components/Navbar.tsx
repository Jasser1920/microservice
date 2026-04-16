
import { Link, useLocation } from "react-router-dom";

const icons = {
  home: "🏠",
  profile: "👤",
  admin: "🛡️",
  users: "👥",
  rooms: "🛏️",
  bookings: "📅",
  events: "🎉",
  reviews: "⭐",
  stock: "📦",
  transport: "🚌",
  manager: "🧑‍💼",
  staff: "🧑‍🔧",
  client: "🧑‍💼",
  logout: "🚪"
};

export default function Navbar() {
  const user = JSON.parse(localStorage.getItem("user_info") || "null");
  const location = useLocation();

  // Role-based nav config
  const navItems = [
    { to: "/", label: "Home", icon: icons.home, roles: ["ADMIN", "MANAGER", "STAFF", "CLIENT"] },
    user && { to: "/profile", label: "Profile", icon: icons.profile, roles: ["ADMIN", "MANAGER", "STAFF", "CLIENT"] },
    user?.role === "ADMIN" && { to: "/admin", label: "Admin", icon: icons.admin },
    user?.role === "ADMIN" && { to: "/users", label: "Users", icon: icons.users },
    (user?.role === "ADMIN" || user?.role === "MANAGER") && { to: "/rooms", label: "Rooms", icon: icons.rooms },
    (user?.role === "ADMIN" || user?.role === "MANAGER" || user?.role === "STAFF" || user?.role === "CLIENT") && { to: "/bookings", label: "Bookings", icon: icons.bookings },
    (user?.role === "ADMIN" || user?.role === "MANAGER" || user?.role === "STAFF" || user?.role === "CLIENT") && { to: "/events", label: "Events", icon: icons.events },
    (user?.role === "ADMIN" || user?.role === "MANAGER" || user?.role === "STAFF" || user?.role === "CLIENT") && { to: "/reviews", label: "Reviews", icon: icons.reviews },
    (user?.role === "ADMIN" || user?.role === "MANAGER" || user?.role === "STAFF") && { to: "/stock", label: "Stock", icon: icons.stock },
    (user?.role === "ADMIN" || user?.role === "MANAGER" || user?.role === "STAFF" || user?.role === "CLIENT") && { to: "/transport-bookings", label: "Transport Bookings", icon: icons.transport },
    user?.role === "MANAGER" && { to: "/manager", label: "Manager", icon: icons.manager },
    user?.role === "STAFF" && { to: "/staff", label: "Staff", icon: icons.staff },
    user?.role === "CLIENT" && { to: "/client", label: "Client", icon: icons.client },
    user && { to: "/logout", label: "Logout", icon: icons.logout, bottom: true }
  ].filter(Boolean);

  return (
    <aside style={{
      width: 220,
      background: "#1E3A8A",
      color: "#fff",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      padding: 24,
      boxSizing: "border-box",
      position: "fixed",
      left: 0,
      top: 0,
      zIndex: 1000
    }}>
      <h2 style={{ fontWeight: 700, fontSize: 22, marginBottom: 32, letterSpacing: 1 }}>Hotel Admin</h2>
      <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
        {navItems.filter(item => !item.bottom).map(item => (
          <Link
            key={item.to}
            to={item.to}
            style={{
              display: "flex", alignItems: "center", gap: 12, padding: "10px 0 10px 12px", borderRadius: 8,
              textDecoration: "none", color: location.pathname === item.to ? "#FBBF24" : "#fff",
              background: location.pathname === item.to ? "#274690" : "transparent",
              fontWeight: location.pathname === item.to ? 700 : 500,
              fontSize: 16,
              transition: "background 0.2s, color 0.2s"
            }}
          >
            <span style={{ fontSize: 20 }}>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
      {/* Bottom nav (logout) */}
      <div style={{ marginTop: 32 }}>
        {navItems.filter(item => item.bottom).map(item => (
          <Link
            key={item.to}
            to={item.to}
            style={{
              display: "flex", alignItems: "center", gap: 12, padding: "10px 0 10px 12px", borderRadius: 8,
              textDecoration: "none", color: "#fff",
              fontWeight: 500, fontSize: 16
            }}
          >
            <span style={{ fontSize: 20 }}>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    </aside>
  );
}
