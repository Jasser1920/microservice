


import { useEffect, useState } from "react";
import axios from "axios";

const icons = {
  dashboard: "🏠",
  reservations: "📅",
  rooms: "🛏️",
  customers: "👤",
  payments: "💳",
  reports: "📊",
  settings: "⚙️",
  notifications: "🔔",
  user: "👤"
};

interface Metric {
  icon: string;
  label: string;
  value: number;
}

interface Reservation {
  id: string;
  guestName: string;
  checkInDate: string;
  checkOutDate: string;
  roomNumber: string;
  status: string;
}

export default function AdminDashboard() {
  const [search, setSearch] = useState<string>("");
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("access_token");
        // Fetch all in parallel
        const [bookingsRes, roomsRes, usersRes, reviewsRes, eventsRes, stockRes] = await Promise.all([
          axios.get("http://localhost:9090/api/bookings", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("http://localhost:9090/api/rooms", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("http://localhost:9090/api/users", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("http://localhost:9090/api/reviews", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("http://localhost:9090/api/events", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("http://localhost:9090/api/stock", { headers: { Authorization: `Bearer ${token}` } })
        ]);

        // Metrics
        const bookings = bookingsRes.data || [];
        const rooms = roomsRes.data || [];
        const users = usersRes.data || [];
        const reviews = reviewsRes.data || [];
        const events = eventsRes.data || [];
        const stock = stockRes.data || [];

        setMetrics([
          { icon: icons.reservations, label: "Total Bookings", value: bookings.length },
          { icon: icons.rooms, label: "Available Rooms", value: rooms.filter((r:any)=>r.status==="AVAILABLE").length },
          { icon: icons.rooms, label: "Occupied Rooms", value: rooms.filter((r:any)=>r.status==="OCCUPIED").length },
          { icon: icons.customers, label: "Total Users", value: users.length },
          { icon: icons.reports, label: "Reviews", value: reviews.length },
          { icon: icons.events, label: "Events", value: events.length },
          { icon: icons.stock, label: "Stock Items", value: stock.length }
        ]);

        // Recent reservations (show 5 latest by checkInDate desc)
        const sorted = [...bookings].sort((a:any,b:any)=>new Date(b.checkInDate).getTime()-new Date(a.checkInDate).getTime());
        setReservations(sorted.slice(0,5).map((b:any) => ({
          id: b.id,
          guest: users.find((u:any)=>u.id===b.userId)?.firstName+" "+users.find((u:any)=>u.id===b.userId)?.lastName || b.userId,
          room: rooms.find((r:any)=>r.id===b.roomId)?.roomNumber || b.roomId,
          checkIn: b.checkInDate,
          checkOut: b.checkOutDate,
          status: b.status
        })));
      } catch (e:any) {
        setError(e.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F3F6FA", fontFamily: "Inter, sans-serif" }}>
      {/* Sidebar */}
      <aside style={{
        width: 240, background: "#1E3A8A", color: "#fff", display: "flex", flexDirection: "column", padding: 24
      }}>
        <h2 style={{ fontWeight: 700, fontSize: 22, marginBottom: 32 }}>Hotel Admin</h2>
        <nav style={{ flex: 1 }}>
          {[
            { icon: icons.dashboard, label: "Dashboard" },
            { icon: icons.reservations, label: "Reservations" },
            { icon: icons.rooms, label: "Rooms" },
            { icon: icons.customers, label: "Customers" },
            { icon: icons.payments, label: "Payments" },
            { icon: icons.reports, label: "Reports" },
            { icon: icons.settings, label: "Settings" }
          ].map(item => (
            <div key={item.label} style={{
              display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderRadius: 8,
              cursor: "pointer", transition: "background 0.2s", marginBottom: 4
            }}
              onMouseOver={e => e.currentTarget.style.background = "#274690"}
              onMouseOut={e => e.currentTarget.style.background = "transparent"}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Top Navbar */}
        <header style={{
          background: "#fff", padding: "16px 32px", display: "flex", alignItems: "center",
          justifyContent: "space-between", boxShadow: "0 2px 8px rgba(30,58,138,0.04)"
        }}>
          <h1 style={{ fontSize: 24, fontWeight: 600 }}>Dashboard</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                padding: "8px 12px", borderRadius: 8, border: "1px solid #E5E7EB",
                outline: "none", minWidth: 180, fontSize: 15
              }}
            />
            <button style={{
              background: "none", border: "none", fontSize: 22, cursor: "pointer"
            }}>{icons.notifications}</button>
            <div style={{
              width: 36, height: 36, borderRadius: "50%", background: "#E0E7FF",
              display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, cursor: "pointer"
            }}>
              {icons.user}
            </div>
          </div>
        </header>

        {/* Metrics Cards */}
        {loading ? (
          <div style={{ padding: 32 }}>Loading dashboard...</div>
        ) : error ? (
          <div style={{ color: "#dc2626", padding: 32 }}>{error}</div>
        ) : (
          <>
            <div style={{
              display: "flex", gap: 24, padding: 32, flexWrap: "wrap"
            }}>
              {metrics.map((m:any) => (
                <div key={m.label} style={{
                  flex: "1 1 200px", background: "#fff", borderRadius: 16, boxShadow: "0 2px 8px rgba(30,58,138,0.06)",
                  padding: 24, display: "flex", alignItems: "center", gap: 16, transition: "box-shadow 0.2s"
                }}>
                  <span style={{
                    fontSize: 28, background: "#E0E7FF", borderRadius: 12, padding: 10
                  }}>{m.icon}</span>
                  <div>
                    <div style={{ fontSize: 15, color: "#64748B" }}>{m.label}</div>
                    <div style={{ fontSize: 22, fontWeight: 700 }}>{m.value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Reservations Table */}
            {reservations.length > 0 && (
              <div style={{
                background: "#fff", borderRadius: 16, boxShadow: "0 2px 8px rgba(30,58,138,0.06)",
                margin: "0 32px 32px 32px", padding: 24
              }}>
                <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>Recent Reservations</h2>
                <table style={{
                  width: "100%", borderCollapse: "separate", borderSpacing: 0, fontSize: 15
                }}>
                  <thead>
                    <tr style={{ background: "#F1F5F9" }}>
                      <th style={{ padding: 12, textAlign: "left", borderRadius: "8px 0 0 0" }}>Guest</th>
                      <th style={{ padding: 12, textAlign: "left" }}>Room</th>
                      <th style={{ padding: 12, textAlign: "left" }}>Check-In</th>
                      <th style={{ padding: 12, textAlign: "left" }}>Check-Out</th>
                      <th style={{ padding: 12, textAlign: "left" }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservations.map((r:any, i:number) => (
                      <tr key={r.id} style={{
                        background: i % 2 === 0 ? "#fff" : "#F8FAFC"
                      }}>
                        <td style={{ padding: 12 }}>{r.guest}</td>
                        <td style={{ padding: 12 }}>{r.room}</td>
                        <td style={{ padding: 12 }}>{r.checkIn}</td>
                        <td style={{ padding: 12 }}>{r.checkOut}</td>
                        <td style={{ padding: 12 }}>
                          <span style={{
                            background: r.status === "CONFIRMED" ? "#DBEAFE" : "#FDE68A",
                            color: r.status === "CONFIRMED" ? "#1E3A8A" : "#92400E",
                            borderRadius: 8, padding: "4px 10px", fontWeight: 600
                          }}>{r.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
