import { useState } from "react";

interface TopNavbarProps {
  title?: string;
}

export default function TopNavbar({ title = "Dashboard" }: TopNavbarProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const user = JSON.parse(localStorage.getItem("user_info") || "null");
  const userInitials = user
    ? `${user.firstName?.[0] || "U"}${user.lastName?.[0] || "U"}`.toUpperCase()
    : "U";

  return (
    <div className="app-navbar">
      <div className="navbar-left-section">
        <h1 className="navbar-page-title">{title}</h1>
      </div>

      <div className="navbar-search">
        <input
          type="text"
          placeholder="Search rooms, bookings, guests..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="navbar-actions">
        <button className="icon-btn" title="Notifications">
          🔔
        </button>

        <div className="navbar-profile-container">
          <button
            className="user-profile"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            <div className="user-avatar">{userInitials}</div>
            <div className="navbar-profile-info">
              <div className="navbar-profile-name">
                {user?.firstName} {user?.lastName}
              </div>
              <div className="navbar-profile-role">{user?.role || "User"}</div>
            </div>
          </button>

          {showProfileMenu && (
            <div className="navbar-profile-menu">
              <a href="/profile" className="navbar-menu-item">
                👤 Profile
              </a>
              <a href="/settings" className="navbar-menu-item">
                ⚙️ Settings
              </a>
              <hr className="navbar-menu-divider" />
              <button
                onClick={() => {
                  localStorage.removeItem("access_token");
                  localStorage.removeItem("refresh_token");
                  localStorage.removeItem("user_info");
                  window.location.href = "/login";
                }}
                className="navbar-logout-item"
              >
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
