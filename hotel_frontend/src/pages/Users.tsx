import { useEffect, useState } from "react";
import axios from "axios";
import UserForm from "../components/UserForm";


export default function Users() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<any | null>(null);
  const [showForm, setShowForm] = useState(false);
  const user = JSON.parse(localStorage.getItem("user_info") || "null");

  function fetchUsers() {
    setLoading(true);
    const token = localStorage.getItem("access_token");
    axios.get("http://localhost:9090/api/users", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setUsers(res.data))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  function handleCreate(newUser: any) {
    if (user?.role !== "ADMIN") return;
    const token = localStorage.getItem("access_token");
    axios.post("http://localhost:9090/api/users", newUser, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => {
        fetchUsers();
        setShowForm(false);
      })
      .catch(e => setError(e.message));
  }

  function handleUpdate(userToUpdate: any) {
    if (user?.role !== "ADMIN") return;
    const token = localStorage.getItem("access_token");
    axios.put(`http://localhost:9090/api/users/${userToUpdate.id}` , userToUpdate, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => {
        fetchUsers();
        setEditing(null);
      })
      .catch(e => setError(e.message));
  }

  function handleDelete(id: string) {
    if (user?.role !== "ADMIN") return;
    if (!window.confirm("Delete this user?")) return;
    const token = localStorage.getItem("access_token");
    axios.delete(`http://localhost:9090/api/users/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => fetchUsers())
      .catch(e => setError(e.message));
  }

  if (loading) return <div style={{ padding: 32 }}>Loading users...</div>;
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
          <h1 style={{ fontSize: 26, fontWeight: 700 }}>User Management</h1>
          {user?.role === "ADMIN" && !showForm && !editing && (
            <button
              onClick={() => setShowForm(true)}
              style={{
                background: "#1E3A8A", color: "#fff", border: "none", borderRadius: 8,
                padding: "10px 22px", fontWeight: 600, fontSize: 16, cursor: "pointer", boxShadow: "0 1px 4px #e0e7ff"
              }}
            >+ Add User</button>
          )}
        </div>

        {user?.role === "ADMIN" && showForm && (
          <div style={{ marginBottom: 32 }}>
            <UserForm onSubmit={handleCreate} />
          </div>
        )}
        {user?.role === "ADMIN" && editing && (
          <div style={{ marginBottom: 32 }}>
            <UserForm onSubmit={handleUpdate} initial={editing} />
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
                <th style={{ padding: 12, textAlign: "left" }}>Email</th>
                <th style={{ padding: 12, textAlign: "left" }}>Name</th>
                <th style={{ padding: 12, textAlign: "left" }}>Role</th>
                <th style={{ padding: 12, textAlign: "left" }}>Status</th>
                {user?.role === "ADMIN" && <th style={{ padding: 12, textAlign: "left", borderRadius: "0 8px 0 0" }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {users.map((u: any, i) => (
                <tr key={u.id} style={{ background: i % 2 === 0 ? "#fff" : "#F8FAFC" }}>
                  <td style={{ padding: 12 }}>{u.id}</td>
                  <td style={{ padding: 12 }}>{u.email}</td>
                  <td style={{ padding: 12 }}>{u.firstName} {u.lastName}</td>
                  <td style={{ padding: 12 }}>{u.role}</td>
                  <td style={{ padding: 12 }}>
                    <span style={{
                      background: u.active ? "#DBEAFE" : "#FDE68A",
                      color: u.active ? "#1E3A8A" : "#92400E",
                      borderRadius: 8, padding: "4px 10px", fontWeight: 600
                    }}>{u.active ? "Active" : "Inactive"}</span>
                  </td>
                  {user?.role === "ADMIN" && (
                    <td style={{ padding: 12 }}>
                      <button
                        onClick={() => setEditing(u)}
                        style={{
                          background: "#E0E7FF", color: "#1E3A8A", border: "none", borderRadius: 6,
                          padding: "6px 14px", fontWeight: 600, marginRight: 8, cursor: "pointer"
                        }}
                      >Edit</button>
                      <button
                        onClick={() => handleDelete(u.id)}
                        style={{
                          background: "#F87171", color: "#fff", border: "none", borderRadius: 6,
                          padding: "6px 14px", fontWeight: 600, cursor: "pointer"
                        }}
                      >Delete</button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
