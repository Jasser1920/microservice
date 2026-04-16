import { useLocation, Link } from "react-router-dom";

const navItems = [
  {
    id: 1,
    label: "Dashboard",
    icon: "📊",
    path: "/admin",
  },
  {
    id: 2,
    label: "Reservations",
    icon: "📅",
    path: "/bookings",
  },
  {
    id: 3,
    label: "Rooms",
    icon: "🛏️",
    path: "/rooms",
  },
  {
    id: 4,
    label: "Customers",
    icon: "👥",
    path: "/users",
  },
  {
    id: 5,
    label: "Payments",
    icon: "💳",
    path: "/payments",
  },
  {
    id: 6,
    label: "Reports",
    icon: "📈",
    path: "/reports",
  },
  {
    id: 7,
    label: "Settings",
    icon: "⚙️",
    path: "/settings",
  },
];

export default function Sidebar() {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  return (
    <aside className="app-sidebar">
      <div className="nav-brand">
        <h1 className="nav-brand h1">🏨 LuxeStay</h1>
      </div>

      <nav>
        <ul className="nav-menu">
          {navItems.map((item) => (
            <li key={item.id} className="nav-item">
              <Link
                to={item.path}
                className={`nav-link ${isActive(item.path) ? "active" : ""}`}
              >
                <span className="nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="nav-footer">
        <button className="logout-btn">
          <span className="logout-icon">🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
