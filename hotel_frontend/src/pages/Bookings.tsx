import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:9090/api/bookings";

function formatDate(dt: string) {
  return dt ? new Date(dt).toLocaleString() : "";
}


export default function Bookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<any | null>(null);
  const [showForm, setShowForm] = useState(false);

  function fetchBookings() {
    setLoading(true);
    const token = localStorage.getItem("access_token");
    axios.get(API, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setBookings(res.data))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchBookings(); }, []);

  function handleCreate(b: any) {
    const token = localStorage.getItem("access_token");
    axios.post(API, b, { headers: { Authorization: `Bearer ${token}` } })
      .then(() => { fetchBookings(); setShowForm(false); })
      .catch(e => setError(e.message));
  }
  function handleUpdate(b: any) {
    const token = localStorage.getItem("access_token");
    const id = editing?.id || b.id;
    const payload = {
      userId: Number(b.userId),
      roomId: Number(b.roomId),
      checkInDate: b.checkInDate,
      checkOutDate: b.checkOutDate,
      status: b.status,
      totalPrice: Number(b.totalPrice),
      numberOfGuests: Number(b.numberOfGuests),
      specialRequests: b.specialRequests
    };
    axios.put(`${API}/${id}`, payload, { headers: { Authorization: `Bearer ${token}` } })
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

  return (
    <div style={{ background: "#F3F6FA", minHeight: "100vh", padding: 40, fontFamily: "Inter, sans-serif" }}>
      <div style={{
        maxWidth: 1100,
        margin: "0 auto",
        background: "#fff",
        borderRadius: 16,
        boxShadow: "0 2px 8px rgba(30,58,138,0.06)",
        padding: 32
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
          <h1 style={{ fontSize: 26, fontWeight: 700 }}>Bookings</h1>
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
            <BookingForm onSubmit={handleCreate} />
          </div>
        )}
        {editing && (
          <div style={{ marginBottom: 32 }}>
            <BookingForm onSubmit={handleUpdate} initial={editing} />
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
                  <th style={{ padding: 12, textAlign: "left" }}>User ID</th>
                  <th style={{ padding: 12, textAlign: "left" }}>Room ID</th>
                  <th style={{ padding: 12, textAlign: "left" }}>Check-in</th>
                  <th style={{ padding: 12, textAlign: "left" }}>Check-out</th>
                  <th style={{ padding: 12, textAlign: "left" }}>Status</th>
                  <th style={{ padding: 12, textAlign: "left" }}>Total Price</th>
                  <th style={{ padding: 12, textAlign: "left" }}>Guests</th>
                  <th style={{ padding: 12, textAlign: "left", borderRadius: "0 8px 0 0" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b: any, i) => (
                  <tr key={b.id} style={{ background: i % 2 === 0 ? "#fff" : "#F8FAFC" }}>
                    <td style={{ padding: 12 }}>{b.id}</td>
                    <td style={{ padding: 12 }}>{b.userId}</td>
                    <td style={{ padding: 12 }}>{b.roomId}</td>
                    <td style={{ padding: 12 }}>{formatDate(b.checkInDate)}</td>
                    <td style={{ padding: 12 }}>{formatDate(b.checkOutDate)}</td>
                    <td style={{ padding: 12 }}>{b.status}</td>
                    <td style={{ padding: 12 }}>{b.totalPrice}</td>
                    <td style={{ padding: 12 }}>{b.numberOfGuests}</td>
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

function BookingForm({ onSubmit, initial }: { onSubmit: (b: any) => void, initial?: any }) {
  const [form, setForm] = useState(initial ? {
    userId: initial.userId || "",
    roomId: initial.roomId || "",
    checkInDate: initial.checkInDate || "",
    checkOutDate: initial.checkOutDate || "",
    status: initial.status || "PENDING",
    totalPrice: initial.totalPrice || 0,
    numberOfGuests: initial.numberOfGuests || 1,
    specialRequests: initial.specialRequests || ""
  } : {
    userId: "",
    roomId: "",
    checkInDate: "",
    checkOutDate: "",
    status: "PENDING",
    totalPrice: 0,
    numberOfGuests: 1,
    specialRequests: ""
  });
  const [users, setUsers] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const token = localStorage.getItem("access_token");
      try {
        const [usersRes, roomsRes] = await Promise.all([
          axios.get("http://localhost:9090/api/users", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("http://localhost:9090/api/rooms", { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setUsers(usersRes.data);
        setRooms(roomsRes.data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value, type } = e.target;
    setForm(f => ({
      ...f,
      [name]: type === "number" ? Number(value) : value
    }));
  }
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Send correct fields to parent handler
    onSubmit({
      userId: form.userId,
      roomId: form.roomId,
      checkInDate: form.checkInDate,
      checkOutDate: form.checkOutDate,
      status: form.status,
      totalPrice: form.totalPrice,
      numberOfGuests: form.numberOfGuests,
      specialRequests: form.specialRequests
    });
  }
  if (loading) return <div>Loading users and rooms...</div>;
  if (error) return <div style={{color:'red'}}>{error}</div>;
  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
      <select name="userId" value={form.userId} onChange={handleChange} required>
        <option value="">Select Client</option>
        {users.filter((u: any) => u.role === "CLIENT").map((u: any) => (
          <option key={u.id} value={u.id}>{u.firstName} {u.lastName} ({u.email})</option>
        ))}
      </select>{' '}
      <select name="roomId" value={form.roomId} onChange={handleChange} required>
        <option value="">Select Room</option>
        {rooms.map((r: any) => (
          <option key={r.id} value={r.id}>Room {r.roomNumber}</option>
        ))}
      </select>{' '}
      <input name="checkInDate" type="date" value={form.checkInDate} onChange={handleChange} required />{' '}
      <input name="checkOutDate" type="date" value={form.checkOutDate} onChange={handleChange} required />{' '}
      <input name="totalPrice" type="number" value={form.totalPrice} onChange={handleChange} placeholder="Total Price" min={0} required />{' '}
      <input name="numberOfGuests" type="number" value={form.numberOfGuests} onChange={handleChange} placeholder="Guests" min={1} required />{' '}
      <textarea name="specialRequests" value={form.specialRequests} onChange={handleChange} placeholder="Special Requests" rows={2} />{' '}
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
