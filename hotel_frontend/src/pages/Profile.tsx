import { useEffect, useState } from "react";
import axios from "axios";

interface ProfileForm {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
  active: boolean;
}

export default function Profile() {
  const [form, setForm] = useState<ProfileForm>({
    firstName: "",
    lastName: "",
    email: "",
    role: "",
    active: true
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user_info") || "null");
    if (user) {
      setForm({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        role: user.role || "",
        active: user.active !== false,
        id: user.id
      });
    }
    setLoading(false);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const token = localStorage.getItem("access_token");
      const res = await axios.put(
        `http://localhost:9090/api/users/${form.id}`,
        {
          email: form.email,
          firstName: form.firstName,
          lastName: form.lastName,
          phone: form.phone || "",
          role: form.role,
          active: form.active
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      localStorage.setItem("user_info", JSON.stringify(res.data));
      setSuccess("Profile updated successfully.");
    } catch (e: any) {
      setError(e.response?.data?.message || e.message || "Update failed");
    } finally {
      setSaving(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }

  return (
    <div style={{ background: "#F3F6FA", minHeight: "100vh", padding: 40, fontFamily: "Inter, sans-serif" }}>
      <div style={{
        maxWidth: 480,
        margin: "0 auto",
        background: "#fff",
        borderRadius: 16,
        boxShadow: "0 2px 8px rgba(30,58,138,0.06)",
        padding: 32
      }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 24 }}>Edit Profile</h1>
        {loading ? <div>Loading...</div> : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>First Name</label>
              <input
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                required
                style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 15 }}
              />
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Last Name</label>
              <input
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                required
                style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 15 }}
              />
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Email</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 15 }}
              />
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Phone</label>
              <input
                name="phone"
                value={form.phone || ""}
                onChange={handleChange}
                style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 15 }}
              />
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Role</label>
              <input
                name="role"
                value={form.role}
                disabled
                style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 15, background: "#F1F5F9" }}
              />
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Status</label>
              <input
                name="active"
                value={form.active ? "Active" : "Inactive"}
                disabled
                style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 15, background: "#F1F5F9" }}
              />
            </div>
            {error && <div style={{ color: "#dc2626", marginBottom: 12 }}>{error}</div>}
            {success && <div style={{ color: "#16a34a", marginBottom: 12 }}>{success}</div>}
            <button
              type="submit"
              disabled={saving}
              style={{
                background: "#1E3A8A", color: "#fff", border: "none", borderRadius: 8,
                padding: "12px 28px", fontWeight: 700, fontSize: 16, cursor: saving ? "not-allowed" : "pointer",
                boxShadow: "0 1px 4px #e0e7ff"
              }}
            >{saving ? "Saving..." : "Save Changes"}</button>
          </form>
        )}
      </div>
    </div>
  );
}
