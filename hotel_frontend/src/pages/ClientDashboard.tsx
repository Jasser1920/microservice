export default function ClientDashboard() {
  const user = JSON.parse(localStorage.getItem("user_info") || "null");
  return (
    <div style={{ padding: 32 }}>
      <h1>Client Dashboard</h1>
      <p>Welcome, {user?.firstName} {user?.lastName} ({user?.email})</p>
      <p>Your role: {user?.role}</p>
    </div>
  );
}
