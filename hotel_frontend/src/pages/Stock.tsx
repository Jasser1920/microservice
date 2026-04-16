import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:9090/api/stock";


export default function Stock() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<any | null>(null);
  const [showForm, setShowForm] = useState(false);

  function fetchItems() {
    setLoading(true);
    const token = localStorage.getItem("access_token");
    axios.get(API, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setItems(res.data))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchItems(); }, []);

  function handleCreate(item: any) {
    const token = localStorage.getItem("access_token");
    axios.post(API, item, { headers: { Authorization: `Bearer ${token}` } })
      .then(() => { fetchItems(); setShowForm(false); })
      .catch(e => setError(e.message));
  }
  function handleUpdate(item: any) {
    const token = localStorage.getItem("access_token");
    const payload = {
      itemCode: item.itemCode,
      name: item.name,
      category: item.category,
      quantity: Number(item.quantity),
      minQuantity: Number(item.minQuantity),
      unit: item.unit,
      unitPrice: Number(item.unitPrice),
      supplier: item.supplier
    };
    const id = editing?.id || item.id;
    axios.put(`${API}/${id}`, payload, { headers: { Authorization: `Bearer ${token}` } })
      .then(() => { fetchItems(); setEditing(null); })
      .catch(e => setError(e.message));
  }
  function handleDelete(id: string) {
    if (!window.confirm("Delete this item?")) return;
    const token = localStorage.getItem("access_token");
    axios.delete(`${API}/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(() => fetchItems())
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
          <h1 style={{ fontSize: 26, fontWeight: 700 }}>Stock</h1>
          {!showForm && !editing && (
            <button
              onClick={() => setShowForm(true)}
              style={{
                background: "#1E3A8A", color: "#fff", border: "none", borderRadius: 8,
                padding: "10px 22px", fontWeight: 600, fontSize: 16, cursor: "pointer", boxShadow: "0 1px 4px #e0e7ff"
              }}
            >+ Add Item</button>
          )}
        </div>

        {showForm && (
          <div style={{ marginBottom: 32 }}>
            <StockForm onSubmit={handleCreate} />
          </div>
        )}
        {editing && (
          <div style={{ marginBottom: 32 }}>
            <StockForm onSubmit={handleUpdate} initial={editing} />
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
                  <th style={{ padding: 12, textAlign: "left" }}>Item Code</th>
                  <th style={{ padding: 12, textAlign: "left" }}>Name</th>
                  <th style={{ padding: 12, textAlign: "left" }}>Category</th>
                  <th style={{ padding: 12, textAlign: "left" }}>Quantity</th>
                  <th style={{ padding: 12, textAlign: "left" }}>Min Quantity</th>
                  <th style={{ padding: 12, textAlign: "left" }}>Unit</th>
                  <th style={{ padding: 12, textAlign: "left" }}>Unit Price</th>
                  <th style={{ padding: 12, textAlign: "left" }}>Supplier</th>
                  <th style={{ padding: 12, textAlign: "left" }}>Created At</th>
                  <th style={{ padding: 12, textAlign: "left" }}>Updated At</th>
                  <th style={{ padding: 12, textAlign: "left", borderRadius: "0 8px 0 0" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item: any, i) => (
                  <tr key={item.id} style={{ background: i % 2 === 0 ? "#fff" : "#F8FAFC" }}>
                    <td style={{ padding: 12 }}>{item.id}</td>
                    <td style={{ padding: 12 }}>{item.itemCode}</td>
                    <td style={{ padding: 12 }}>{item.name}</td>
                    <td style={{ padding: 12 }}>{item.category}</td>
                    <td style={{ padding: 12 }}>{item.quantity}</td>
                    <td style={{ padding: 12 }}>{item.minQuantity}</td>
                    <td style={{ padding: 12 }}>{item.unit}</td>
                    <td style={{ padding: 12 }}>{item.unitPrice}</td>
                    <td style={{ padding: 12 }}>{item.supplier}</td>
                    <td style={{ padding: 12 }}>{item.createdAt ? new Date(item.createdAt).toLocaleString() : ''}</td>
                    <td style={{ padding: 12 }}>{item.updatedAt ? new Date(item.updatedAt).toLocaleString() : ''}</td>
                    <td style={{ padding: 12 }}>
                      <button
                        onClick={() => setEditing(item)}
                        style={{
                          background: "#E0E7FF", color: "#1E3A8A", border: "none", borderRadius: 6,
                          padding: "6px 14px", fontWeight: 600, marginRight: 8, cursor: "pointer"
                        }}
                      >Edit</button>
                      <button
                        onClick={() => handleDelete(item.id)}
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

function StockForm({ onSubmit, initial }: { onSubmit: (item: any) => void, initial?: any }) {
  const [form, setForm] = useState(initial ? {
    itemCode: initial.itemCode || "",
    name: initial.name || "",
    category: initial.category || "LINEN",
    quantity: initial.quantity || 0,
    minQuantity: initial.minQuantity || 0,
    unit: initial.unit || "piece",
    unitPrice: initial.unitPrice || 0,
    supplier: initial.supplier || ""
  } : {
    itemCode: "",
    name: "",
    category: "LINEN",
    quantity: 0,
    minQuantity: 0,
    unit: "piece",
    unitPrice: 0,
    supplier: ""
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    setForm(f => ({ ...f, [name]: type === "number" ? Number(value) : value }));
  }
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      ...form,
      quantity: Number(form.quantity),
      minQuantity: Number(form.minQuantity),
      unitPrice: Number(form.unitPrice)
    };
    onSubmit(payload);
  }
  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
      <input name="itemCode" value={form.itemCode} onChange={handleChange} placeholder="Item Code" required />{' '}
      <input name="name" value={form.name} onChange={handleChange} placeholder="Name" required />{' '}
      <select name="category" value={form.category} onChange={handleChange} required>
        <option value="LINEN">LINEN</option>
        <option value="CLEANING">CLEANING</option>
        <option value="MINIBAR">MINIBAR</option>
        <option value="TOILETRIES">TOILETRIES</option>
        <option value="KITCHEN">KITCHEN</option>
        <option value="MAINTENANCE">MAINTENANCE</option>
        <option value="OTHER">OTHER</option>
      </select>{' '}
      <input name="quantity" type="number" value={form.quantity} onChange={handleChange} min={0} required />{' '}
      <input name="minQuantity" type="number" value={form.minQuantity} onChange={handleChange} min={0} required />{' '}
      <input name="unit" value={form.unit} onChange={handleChange} placeholder="Unit" required />{' '}
      <input name="unitPrice" type="number" value={form.unitPrice} onChange={handleChange} min={0} step={0.01} required />{' '}
      <input name="supplier" value={form.supplier} onChange={handleChange} placeholder="Supplier" required />{' '}
      <button type="submit">{initial ? "Update" : "Create"} Item</button>
    </form>
  );
}
