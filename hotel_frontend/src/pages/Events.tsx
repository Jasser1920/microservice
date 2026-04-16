import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:9090/api/events";

function formatDate(dt: string) {
  return dt ? new Date(dt).toLocaleString() : "";
}


export default function Events() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<any | null>(null);
  const [showForm, setShowForm] = useState(false);

  function fetchEvents() {
    setLoading(true);
    const token = localStorage.getItem("access_token");
    axios.get(API, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setEvents(res.data))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchEvents(); }, []);

  function handleCreate(evn: any) {
    const token = localStorage.getItem("access_token");
    axios.post(API, evn, { headers: { Authorization: `Bearer ${token}` } })
      .then(() => { fetchEvents(); setShowForm(false); })
      .catch(e => setError(e.message));
  }
  function handleUpdate(evn: any) {
    const token = localStorage.getItem("access_token");
    axios.put(`${API}/${evn.id}`, evn, { headers: { Authorization: `Bearer ${token}` } })
      .then(() => { fetchEvents(); setEditing(null); })
      .catch(e => setError(e.message));
  }
  function handleDelete(id: string) {
    if (!window.confirm("Delete this event?")) return;
    const token = localStorage.getItem("access_token");
    axios.delete(`${API}/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(() => fetchEvents())
      .catch(e => setError(e.message));
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
          <h1 style={{ fontSize: 26, fontWeight: 700 }}>Events</h1>
          {!showForm && !editing && (
            <button
              onClick={() => setShowForm(true)}
              style={{
                background: "#1E3A8A", color: "#fff", border: "none", borderRadius: 8,
                padding: "10px 22px", fontWeight: 600, fontSize: 16, cursor: "pointer", boxShadow: "0 1px 4px #e0e7ff"
              }}
            >+ Add Event</button>
          )}
        </div>

        {showForm && (
          <div style={{ marginBottom: 32 }}>
            <EventForm onSubmit={handleCreate} />
          </div>
        )}
        {editing && (
          <div style={{ marginBottom: 32 }}>
            <EventForm onSubmit={handleUpdate} initial={editing} />
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
                  <th style={{ padding: 12, textAlign: "left" }}>Name</th>
                  <th style={{ padding: 12, textAlign: "left" }}>Type</th>
                  <th style={{ padding: 12, textAlign: "left" }}>Start</th>
                  <th style={{ padding: 12, textAlign: "left" }}>End</th>
                  <th style={{ padding: 12, textAlign: "left" }}>Venue</th>
                  <th style={{ padding: 12, textAlign: "left" }}>Expected Attendees</th>
                  <th style={{ padding: 12, textAlign: "left" }}>Organizer ID</th>
                  <th style={{ padding: 12, textAlign: "left" }}>Status</th>
                  <th style={{ padding: 12, textAlign: "left" }}>Total Cost</th>
                  <th style={{ padding: 12, textAlign: "left" }}>Description</th>
                  <th style={{ padding: 12, textAlign: "left" }}>Services</th>
                  <th style={{ padding: 12, textAlign: "left" }}>Created At</th>
                  <th style={{ padding: 12, textAlign: "left" }}>Updated At</th>
                  <th style={{ padding: 12, textAlign: "left", borderRadius: "0 8px 0 0" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map((evn: any, i) => (
                  <tr key={evn.id} style={{ background: i % 2 === 0 ? "#fff" : "#F8FAFC" }}>
                    <td style={{ padding: 12 }}>{evn.id}</td>
                    <td style={{ padding: 12 }}>{evn.name}</td>
                    <td style={{ padding: 12 }}>{evn.type}</td>
                    <td style={{ padding: 12 }}>{formatDate(evn.startDateTime)}</td>
                    <td style={{ padding: 12 }}>{formatDate(evn.endDateTime)}</td>
                    <td style={{ padding: 12 }}>{evn.venue}</td>
                    <td style={{ padding: 12 }}>{evn.expectedAttendees}</td>
                    <td style={{ padding: 12 }}>{evn.organizerId}</td>
                    <td style={{ padding: 12 }}>{evn.status}</td>
                    <td style={{ padding: 12 }}>{evn.totalCost}</td>
                    <td style={{ padding: 12 }}>{evn.description}</td>
                    <td style={{ padding: 12 }}>{evn.services}</td>
                    <td style={{ padding: 12 }}>{formatDate(evn.createdAt)}</td>
                    <td style={{ padding: 12 }}>{formatDate(evn.updatedAt)}</td>
                    <td style={{ padding: 12 }}>
                      <button
                        onClick={() => setEditing(evn)}
                        style={{
                          background: "#E0E7FF", color: "#1E3A8A", border: "none", borderRadius: 6,
                          padding: "6px 14px", fontWeight: 600, marginRight: 8, cursor: "pointer"
                        }}
                      >Edit</button>
                      <button
                        onClick={() => handleDelete(evn.id)}
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

function EventForm({ onSubmit, initial }: { onSubmit: (evn: any) => void, initial?: any }) {
  const [form, setForm] = useState(initial ? {
    name: initial.name || "",
    type: initial.type || "CONFERENCE",
    startDateTime: initial.startDateTime ? initial.startDateTime.slice(0, 16) : "",
    endDateTime: initial.endDateTime ? initial.endDateTime.slice(0, 16) : "",
    venue: initial.venue || "",
    expectedAttendees: initial.expectedAttendees || 0,
    organizerId: initial.organizerId || "",
    status: initial.status || "PLANNED",
    totalCost: initial.totalCost || 0,
    description: initial.description || "",
    services: initial.services || ""
  } : {
    name: "",
    type: "CONFERENCE",
    startDateTime: "",
    endDateTime: "",
    venue: "",
    expectedAttendees: 0,
    organizerId: "",
    status: "PLANNED",
    totalCost: 0,
    description: "",
    services: ""
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    setForm(f => ({ ...f, [name]: type === "number" ? Number(value) : value }));
  }
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Convert datetime-local to ISO string for backend
    const payload = {
      ...form,
      startDateTime: form.startDateTime ? new Date(form.startDateTime).toISOString() : "",
      endDateTime: form.endDateTime ? new Date(form.endDateTime).toISOString() : "",
      expectedAttendees: Number(form.expectedAttendees),
      totalCost: Number(form.totalCost),
      organizerId: Number(form.organizerId)
    };
    onSubmit(payload);
  }
  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
      <input name="name" value={form.name} onChange={handleChange} placeholder="Name" required />{' '}
      <select name="type" value={form.type} onChange={handleChange} required>
        <option value="CONFERENCE">CONFERENCE</option>
        <option value="SEMINAR">SEMINAR</option>
        <option value="WEDDING">WEDDING</option>
        <option value="PARTY">PARTY</option>
        <option value="MEETING">MEETING</option>
        <option value="OTHER">OTHER</option>
      </select>{' '}
      <input name="startDateTime" type="datetime-local" value={form.startDateTime} onChange={handleChange} required />{' '}
      <input name="endDateTime" type="datetime-local" value={form.endDateTime} onChange={handleChange} required />{' '}
      <input name="venue" value={form.venue} onChange={handleChange} placeholder="Venue" required />{' '}
      <input name="expectedAttendees" type="number" value={form.expectedAttendees} onChange={handleChange} placeholder="Expected Attendees" min={0} required />{' '}
      <input name="organizerId" type="number" value={form.organizerId} onChange={handleChange} placeholder="Organizer ID" required />{' '}
      <select name="status" value={form.status} onChange={handleChange} required>
        <option value="PLANNED">PLANNED</option>
        <option value="CONFIRMED">CONFIRMED</option>
        <option value="CANCELLED">CANCELLED</option>
        <option value="COMPLETED">COMPLETED</option>
      </select>{' '}
      <input name="totalCost" type="number" value={form.totalCost} onChange={handleChange} placeholder="Total Cost" min={0} required />{' '}
      <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" required />{' '}
      <input name="services" value={form.services} onChange={handleChange} placeholder="Services (comma separated)" />{' '}
      <button type="submit">{initial ? "Update" : "Create"} Event</button>
    </form>
  );
}
