import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:9090/api/transport";

function formatDate(dt: string) {
  return dt ? new Date(dt).toLocaleString() : "";
}

interface Booking {
  id?: string;
  userId: number;
  vehicleId: number;
  pickupLocation: string;
  dropoffLocation: string;
  pickupTime: string;
  dropoffTime: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

interface User {
  id: number;
  firstName: string;
  lastName: string;
}


export default function TransportBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [editing, setEditing] = useState<Booking | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);

  function fetchBookings() {
    setLoading(true);
    const token = localStorage.getItem("access_token");
    axios.get(API, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setBookings(res.data))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }

  function fetchUsers() {
    const token = localStorage.getItem("access_token");
    axios.get("http://localhost:9090/api/users", { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setUsers(res.data))
      .catch(() => {});
  }

  useEffect(() => { fetchBookings(); fetchUsers(); }, []);

  function handleCreate(b: any) {
    const token = localStorage.getItem("access_token");
    axios.post(API, b, { headers: { Authorization: `Bearer ${token}` } })
      .then(() => { fetchBookings(); setShowForm(false); })
      .catch(e => setError(e.message));
  }
  function handleUpdate(b: any) {
    const token = localStorage.getItem("access_token");
    const { id, createdAt, updatedAt, ...payload } = b;
    axios.patch(`${API}/${b.id}`, payload, { headers: { Authorization: `Bearer ${token}` } })
      .then(() => { fetchBookings(); setEditing(null); })
      .catch(e => setError(e.message));
  }
  function handleDelete(id: string) {
    if (!window.confirm("Delete this booking?")) return;
    const token = localStorage.getItem("access_token");
    axios.delete(`${API}/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(() => fetchBookings())
      .catch(e => setError(e.message));
  }

  function getUserName(userId: number) {
    const user = users.find((u: any) => u.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : userId;
  }

  return (
    <div style={{ background: "#F3F6FA", minHeight: "100vh", padding: 40, fontFamily: "Inter, sans-serif" }}>
      <div style={{
        maxWidth: 1200,
        margin: "0 auto",
        background: "#fff",
        borderRadius: 16,
        boxShadow: "0 2px 8px rgba(30,58,138,0.06)",
        padding: 32
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
          <h1 style={{ fontSize: 26, fontWeight: 700 }}>Transport Bookings</h1>
          {!showForm && !editing && (
            <button
              onClick={() => setShowForm(true)}
              style={{
                background: "#1E3A8A", color: "#fff", border: "none", borderRadius: 8,
                padding: "10px 22px", fontWeight: 600, fontSize: 16, cursor: "pointer", boxShadow: "0 1px 4px #e0e7ff"
              }}
            >+ Add Booking</button>
          )}
        </div>

        {showForm && (
          <div style={{ marginBottom: 32 }}>
            <TransportBookingForm onSubmit={handleCreate} users={users} />
          </div>
        )}
        {editing && (
          <div style={{ marginBottom: 32 }}>
            <TransportBookingForm onSubmit={handleUpdate} initial={editing} users={users} />
          </div>
        )}

        {loading ? <div>Loading...</div> : error ? <div style={{ color: 'red' }}>{error}</div> : (
          <div style={{ overflowX: "auto" }}>
            <table style={{
              width: "100%",
              borderCollapse: "separate",
              borderSpacing: 0,
              fontSize: 15,
              background: "#fff"
            }}>
              <thead>
                <tr style={{ background: "#F1F5F9" }}>
                  <th style={{ padding: 12, textAlign: "left", borderRadius: "8px 0 0 0" }}>ID</th>
                  <th style={{ padding: 12, textAlign: "left" }}>Client</th>
                  <th style={{ padding: 12, textAlign: "left" }}>Booking ID</th>
                  <th style={{ padding: 12, textAlign: "left" }}>Pickup Location</th>
                  <th style={{ padding: 12, textAlign: "left" }}>Dropoff Location</th>
                  <th style={{ padding: 12, textAlign: "left" }}>Pickup Time</th>
                  <th style={{ padding: 12, textAlign: "left" }}>Type</th>
                  <th style={{ padding: 12, textAlign: "left" }}>Status</th>
                  <th style={{ padding: 12, textAlign: "left", borderRadius: "0 8px 0 0" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b: any, i) => (
                  <tr key={b.id} style={{ background: i % 2 === 0 ? "#fff" : "#F8FAFC" }}>
                    <td style={{ padding: 12 }}>{b.id}</td>
                    <td style={{ padding: 12 }}>{getUserName(b.clientId)}</td>
                    <td style={{ padding: 12 }}>{b.bookingId}</td>
                    <td style={{ padding: 12 }}>{b.pickupLocation}</td>
                    <td style={{ padding: 12 }}>{b.dropoffLocation}</td>
                    <td style={{ padding: 12 }}>{formatDate(b.pickupTime)}</td>
                    <td style={{ padding: 12 }}>{b.type}</td>
                    <td style={{ padding: 12 }}>{b.status}</td>
                    <td style={{ padding: 12 }}>
                      <button
                        onClick={() => setEditing(b)}
                        style={{
                          background: "#E0E7FF", color: "#1E3A8A", border: "none", borderRadius: 6,
                          padding: "6px 14px", fontWeight: 600, marginRight: 8, cursor: "pointer"
                        }}
                      >Edit</button>
                      <button
                        onClick={() => handleDelete(b.id)}
                        style={{
                          background: "#F87171", color: "#fff", border: "none", borderRadius: 6,
                          padding: "6px 14px", fontWeight: 600, cursor: "pointer"
                        }}
                      >Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function TransportBookingForm({ onSubmit, initial, users }: { onSubmit: (b: any) => void, initial?: any, users: any[] }) {
  const [form, setForm] = useState(initial || {
    clientId: "",
    bookingId: "",
    pickupLocation: "",
    dropoffLocation: "",
    pickupTime: "",
    type: "SHUTTLE",
    status: "PENDING"
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({ ...form, clientId: Number(form.clientId), bookingId: form.bookingId ? Number(form.bookingId) : null });
  }
  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
      <select name="clientId" value={form.clientId} onChange={handleChange} required>
        <option value="">Select Client</option>
        {users.filter(u => u.role === "CLIENT").map(u => (
          <option key={u.id} value={u.id}>{u.firstName} {u.lastName} ({u.email})</option>
        ))}
      </select>{' '}
      <input name="bookingId" value={form.bookingId} onChange={handleChange} placeholder="Booking ID (optional)" />{' '}
      <input name="pickupLocation" value={form.pickupLocation} onChange={handleChange} placeholder="Pickup Location" required />{' '}
      <input name="dropoffLocation" value={form.dropoffLocation} onChange={handleChange} placeholder="Dropoff Location" required />{' '}
      <input name="pickupTime" type="datetime-local" value={form.pickupTime} onChange={handleChange} required />{' '}
      <select name="type" value={form.type} onChange={handleChange}>
        <option value="SHUTTLE">SHUTTLE</option>
        <option value="TAXI">TAXI</option>
        <option value="AIRPORT_TRANSFER">AIRPORT_TRANSFER</option>
      </select>{' '}
      <select name="status" value={form.status} onChange={handleChange}>
        <option value="PENDING">PENDING</option>
        <option value="CONFIRMED">CONFIRMED</option>
        <option value="CANCELLED">CANCELLED</option>
        <option value="COMPLETED">COMPLETED</option>
      </select>{' '}
      <button type="submit">{initial ? "Update" : "Create"} Booking</button>
    </form>
  );
}
