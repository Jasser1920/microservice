import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';


import App from './App.tsx';
import Login from './pages/Login';
import { ProtectedRoute } from './components/ProtectedRoute';
import AdminDashboard from './pages/AdminDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import StaffDashboard from './pages/StaffDashboard';
import ClientDashboard from './pages/ClientDashboard';
import Users from './pages/Users';
import Rooms from './pages/Rooms';
import { Navigate } from 'react-router-dom';

import TransportBookings from './pages/TransportBookings';
import Bookings from './pages/Bookings';
import Events from './pages/Events';
import Reviews from './pages/Reviews';
import Stock from './pages/Stock';
import Profile from './pages/Profile';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        {/* All protected and main pages nested under App for Navbar */}
        <Route path="/" element={<App />}>
          {/* ADMIN: full access, MANAGER: read-only users */}
          <Route element={<ProtectedRoute allowedRoles={["ADMIN","MANAGER"]} />}>
            <Route path="admin" element={<AdminDashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="rooms" element={<Rooms />} />
            <Route path="bookings" element={<Bookings />} />
            <Route path="events" element={<Events />} />
            <Route path="reviews" element={<Reviews />} />
            <Route path="stock" element={<Stock />} />
            <Route path="transport-bookings" element={<TransportBookings />} />
            <Route path="profile" element={<Profile />} />
          </Route>
          {/* MANAGER: all except user CRUD (users is read-only in UI) */}
          <Route element={<ProtectedRoute allowedRoles={["MANAGER"]} />}>
            <Route path="manager" element={<ManagerDashboard />} />
            <Route path="rooms" element={<Rooms />} />
            <Route path="bookings" element={<Bookings />} />
            <Route path="events" element={<Events />} />
            <Route path="reviews" element={<Reviews />} />
            <Route path="stock" element={<Stock />} />
            <Route path="transport-bookings" element={<TransportBookings />} />
            <Route path="profile" element={<Profile />} />
          </Route>
          {/* STAFF: limited CRUD */}
          <Route element={<ProtectedRoute allowedRoles={["STAFF"]} />}>
            <Route path="staff" element={<StaffDashboard />} />
            <Route path="bookings" element={<Bookings />} />
            <Route path="events" element={<Events />} />
            <Route path="reviews" element={<Reviews />} />
            <Route path="stock" element={<Stock />} />
            <Route path="transport-bookings" element={<TransportBookings />} />
            <Route path="profile" element={<Profile />} />
          </Route>
          {/* CLIENT: only own data */}
          <Route element={<ProtectedRoute allowedRoles={["CLIENT"]} />}>
            <Route path="client" element={<ClientDashboard />} />
            <Route path="bookings" element={<Bookings />} />
            <Route path="events" element={<Events />} />
            <Route path="reviews" element={<Reviews />} />
            <Route path="transport-bookings" element={<TransportBookings />} />
            <Route path="profile" element={<Profile />} />
          </Route>
          <Route path="logout" element={<Logout />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);

// Simple logout component
function Logout() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user_info");
  window.location.href = "/login";
  return null;
}
