import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:9090/api/reviews";


interface Review {
  id?: string;
  userId?: string;
  rating: number;
  comment: string;
  createdAt?: string;
}

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [editing, setEditing] = useState<Review | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);

  function fetchReviews() {
    setLoading(true);
    const token = localStorage.getItem("access_token");
    axios.get(API, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setReviews(res.data))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchReviews(); }, []);

  function handleCreate(r: any) {
    const token = localStorage.getItem("access_token");
    axios.post(API, r, { headers: { Authorization: `Bearer ${token}` } })
      .then(() => { fetchReviews(); setShowForm(false); })
      .catch(e => setError(e.message));
  }
  function handleUpdate(r: any) {
    const token = localStorage.getItem("access_token");
    axios.put(`${API}/${r.id}`, r, { headers: { Authorization: `Bearer ${token}` } })
      .then(() => { fetchReviews(); setEditing(null); })
      .catch(e => setError(e.message));
  }
  function handleDelete(id: string) {
    if (!window.confirm("Delete this review?")) return;
    const token = localStorage.getItem("access_token");
    axios.delete(`${API}/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(() => fetchReviews())
      .catch(e => setError(e.message));
  }

  return (
    <div style={{ background: "#F3F6FA", minHeight: "100vh", padding: 40, fontFamily: "Inter, sans-serif" }}>
      <div style={{
        maxWidth: 900,
        margin: "0 auto",
        background: "#fff",
        borderRadius: 16,
        boxShadow: "0 2px 8px rgba(30,58,138,0.06)",
        padding: 32
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
          <h1 style={{ fontSize: 26, fontWeight: 700 }}>Reviews</h1>
          {!showForm && !editing && (
            <button
              onClick={() => setShowForm(true)}
              style={{
                background: "#1E3A8A", color: "#fff", border: "none", borderRadius: 8,
                padding: "10px 22px", fontWeight: 600, fontSize: 16, cursor: "pointer", boxShadow: "0 1px 4px #e0e7ff"
              }}
            >+ Add Review</button>
          )}
        </div>

        {showForm && (
          <div style={{ marginBottom: 32 }}>
            <ReviewForm onSubmit={handleCreate} />
          </div>
        )}
        {editing && (
          <div style={{ marginBottom: 32 }}>
            <ReviewForm onSubmit={handleUpdate} initial={editing} />
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
                  <th style={{ padding: 12, textAlign: "left" }}>Rating</th>
                  <th style={{ padding: 12, textAlign: "left" }}>Comment</th>
                  <th style={{ padding: 12, textAlign: "left", borderRadius: "0 8px 0 0" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((r: any, i) => (
                  <tr key={r.id} style={{ background: i % 2 === 0 ? "#fff" : "#F8FAFC" }}>
                    <td style={{ padding: 12 }}>{r.id}</td>
                    <td style={{ padding: 12 }}>{r.userId}</td>
                    <td style={{ padding: 12 }}>{r.roomId}</td>
                    <td style={{ padding: 12 }}>{r.rating}</td>
                    <td style={{ padding: 12 }}>{r.comment}</td>
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
        )}
      </div>
    </div>
  );
}

function ReviewForm({ onSubmit, initial }: { onSubmit: (r: any) => void, initial?: any }) {
  const [form, setForm] = useState(initial || {
    userId: "",
    roomId: "",
    rating: 5,
    comment: ""
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: name === "rating" ? Number(value) : value }));
  }
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({ ...form, userId: Number(form.userId), roomId: Number(form.roomId) });
  }
  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
      <input name="userId" value={form.userId} onChange={handleChange} placeholder="User ID" required />{' '}
      <input name="roomId" value={form.roomId} onChange={handleChange} placeholder="Room ID" required />{' '}
      <input name="rating" type="number" min={1} max={5} value={form.rating} onChange={handleChange} required />{' '}
      <textarea name="comment" value={form.comment} onChange={handleChange} placeholder="Comment" required />{' '}
      <button type="submit">{initial ? "Update" : "Create"} Review</button>
    </form>
  );
}
