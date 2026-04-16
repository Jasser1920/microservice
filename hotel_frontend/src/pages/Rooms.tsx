import { useEffect, useState } from "react";
import axios from "axios";
import RoomForm from "../components/RoomForm";


export default function Rooms() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<any | null>(null);
  const [showForm, setShowForm] = useState(false);

  function fetchRooms() {
    setLoading(true);
    const token = localStorage.getItem("access_token");
    axios.get("http://localhost:9090/api/rooms", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setRooms(res.data))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchRooms();
  }, []);

  function handleCreate(room: any) {
    const token = localStorage.getItem("access_token");
    axios.post("http://localhost:9090/api/rooms", room, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => {
        fetchRooms();
        setShowForm(false);
      })
      .catch(e => setError(e.message));
  }

  function handleUpdate(room: any) {
    const token = localStorage.getItem("access_token");
    axios.put(`http://localhost:9090/api/rooms/${room.id}` , room, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => {
        fetchRooms();
        setEditing(null);
      })
      .catch(e => setError(e.message));
  }

  function handleDelete(id: string) {
    if (!window.confirm("Delete this room?")) return;
    const token = localStorage.getItem("access_token");
    axios.delete(`http://localhost:9090/api/rooms/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => fetchRooms())
      .catch(e => setError(e.message));
  }

  if (loading) return <div style={{ padding: 32 }}>Loading rooms...</div>;
  if (error) return <div style={{ color: 'red', padding: 32 }}>{error}</div>;

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
          <h1 style={{ fontSize: 26, fontWeight: 700 }}>Room Management</h1>
          {!showForm && !editing && (
            <button
              onClick={() => setShowForm(true)}
              style={{
                background: "#1E3A8A", color: "#fff", border: "none", borderRadius: 8,
                padding: "10px 22px", fontWeight: 600, fontSize: 16, cursor: "pointer", boxShadow: "0 1px 4px #e0e7ff"
              }}
            >+ Add Room</button>
          )}
        </div>

        {showForm && (
          <div style={{ marginBottom: 32 }}>
            <RoomForm onSubmit={handleCreate} />
          </div>
        )}
        {editing && (
          <div style={{ marginBottom: 32 }}>
            <RoomForm onSubmit={handleUpdate} initial={editing} />
          </div>
        )}

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
                <th style={{ padding: 12, textAlign: "left" }}>Room Number</th>
                <th style={{ padding: 12, textAlign: "left" }}>Type</th>
                <th style={{ padding: 12, textAlign: "left" }}>Status</th>
                <th style={{ padding: 12, textAlign: "left" }}>Capacity</th>
                <th style={{ padding: 12, textAlign: "left" }}>Price/Night</th>
                <th style={{ padding: 12, textAlign: "left" }}>Floor</th>
                <th style={{ padding: 12, textAlign: "left", borderRadius: "0 8px 0 0" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((r: any, i) => (
                <tr key={r.id} style={{ background: i % 2 === 0 ? "#fff" : "#F8FAFC" }}>
                  <td style={{ padding: 12 }}>{r.id}</td>
                  <td style={{ padding: 12 }}>{r.roomNumber}</td>
                  <td style={{ padding: 12 }}>{r.type}</td>
                  <td style={{ padding: 12 }}>{r.status}</td>
                  <td style={{ padding: 12 }}>{r.capacity}</td>
                  <td style={{ padding: 12 }}>{r.pricePerNight}</td>
                  <td style={{ padding: 12 }}>{r.floor}</td>
                  <td style={{ padding: 12 }}>
                    <button
                      onClick={() => setEditing(r)}
                      style={{
                        background: "#E0E7FF", color: "#1E3A8A", border: "none", borderRadius: 6,
                        padding: "6px 14px", fontWeight: 600, marginRight: 8, cursor: "pointer"
                      }}
                    >Edit</button>
                    <button
                      onClick={() => handleDelete(r.id)}
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
      </div>
    </div>
  );
}
