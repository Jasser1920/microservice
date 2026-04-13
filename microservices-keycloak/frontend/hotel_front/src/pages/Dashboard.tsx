import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Building, CalendarDays, Star, AlertTriangle, TrendingUp } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { bookingsApi, reviewsApi, roomsApi, stockApi, usersApi } from '@/services/api';

const daysBack = 14;

const buildTrend = (dates: string[]) => {
  const today = new Date();
  const days = Array.from({ length: daysBack }).map((_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (daysBack - 1 - index));
    return date;
  });

  return days.map(day => {
    const label = day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const dayKey = day.toISOString().split('T')[0];
    const count = dates.filter(date => date.startsWith(dayKey)).length;
    return { day: label, bookings: count };
  });
};

const Dashboard = () => {
  const { user } = useAuth();
  const isClient = user?.role === 'CLIENT';
  const { data: clientUser } = useQuery({
    queryKey: ['userMe'],
    queryFn: usersApi.getMe,
    enabled: isClient,
  });
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', isClient, clientUser?.id],
    enabled: !isClient || !!clientUser?.id,
    queryFn: async () => {
      if (isClient && clientUser?.id) {
        const [rooms, bookings, reviews] = await Promise.all([
          roomsApi.listRaw(),
          bookingsApi.listByUser(String(clientUser.id)),
          reviewsApi.listByUser(String(clientUser.id)),
        ]);
        return { rooms, bookings, reviews, stock: [], users: [] };
      }
      const [rooms, bookings, reviews, stock, users] = await Promise.all([
        roomsApi.listRaw(),
        bookingsApi.list(),
        reviewsApi.list(),
        stockApi.list(),
        usersApi.listRaw(),
      ]);
      return { rooms, bookings, reviews, stock, users };
    },
  });

  const rooms = data?.rooms || [];
  const bookings = data?.bookings || [];
  const reviews = data?.reviews || [];
  const stock = data?.stock || [];
  const users = data?.users || [];

  const totalRooms = rooms.length;
  const activeRooms = rooms.filter(r => r.status !== 'MAINTENANCE').length;
  const pendingBookings = bookings.filter(b => b.status === 'PENDING').length;
  const confirmedBookings = bookings.filter(b => b.status === 'CONFIRMED').length;
  const cancelledBookings = bookings.filter(b => b.status === 'CANCELLED').length;
  const bookingsThisMonth = bookings.filter(b => {
    const date = new Date(b.createdAt || b.checkInDate);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }).length;
  const averageRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';
  const lowStockItems = stock.filter(item => item.quantity < item.minQuantity).length;

  const metrics = [
    { label: 'Total Rooms', value: totalRooms, sub: `${activeRooms} active`, icon: Building, color: 'text-secondary' },
    { label: 'Bookings This Month', value: bookingsThisMonth, sub: `Pending: ${pendingBookings}`, icon: CalendarDays, color: 'text-info' },
    { label: 'Average Rating', value: `${averageRating}/5`, sub: `Based on ${reviews.length} reviews`, icon: Star, color: 'text-accent' },
    { label: 'Low Stock Items', value: lowStockItems, sub: 'Require reordering', icon: AlertTriangle, color: 'text-warning' },
  ];

  const bookingTrendData = buildTrend(bookings.map(b => b.createdAt || b.checkInDate));
  const roomTypeData = Object.entries(
    rooms.reduce<Record<string, number>>((acc, room) => {
      acc[room.type] = (acc[room.type] || 0) + 1;
      return acc;
    }, {})
  ).map(([type, count]) => ({ type, count }));

  const bookingStatusData = [
    { name: 'Confirmed', value: confirmedBookings, fill: 'hsl(160, 84%, 30%)' },
    { name: 'Pending', value: pendingBookings, fill: 'hsl(43, 96%, 50%)' },
    { name: 'Cancelled', value: cancelledBookings, fill: 'hsl(0, 84%, 60%)' },
  ];

  const recentReviews = reviews.slice(0, 4).map(review => {
    const room = rooms.find(r => r.id === review.roomId);
    const userMatch = users.find(u => u.id === review.userId);
    const fallbackName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Guest';
    return {
      id: review.id,
      guestName: userMatch ? `${userMatch.firstName} ${userMatch.lastName}` : fallbackName,
      roomNumber: room?.roomNumber || '-',
      rating: review.rating,
      comment: review.comment || '',
    };
  });

  return (
    <AppLayout breadcrumb="Home">
      <div className="space-y-6 animate-fade-in">
        {/* Welcome */}
        <div>
          <h1 className="text-2xl font-bold">Welcome, {user?.firstName}!</h1>
          <p className="text-muted-foreground">Your role: <span className="font-medium text-foreground">{user?.role}</span> — {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        {isLoading && (
          <div className="text-sm text-muted-foreground">Loading dashboard data...</div>
        )}

        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map(m => {
            const Icon = m.icon;
            return (
              <div key={m.label} className="metric-card">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{m.label}</p>
                    <p className="text-3xl font-bold mt-1">{m.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{m.sub}</p>
                  </div>
                  <div className={`p-2.5 rounded-lg bg-muted ${m.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bookings Trend */}
          <div className="metric-card">
            <h3 className="font-semibold mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Bookings Trend</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={bookingTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="hsl(220,9%,46%)" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(220,9%,46%)" />
                <Tooltip />
                <Line type="monotone" dataKey="bookings" stroke="hsl(160,84%,30%)" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Room Types */}
          <div className="metric-card">
            <h3 className="font-semibold mb-4">Rooms by Type</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={roomTypeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" />
                <XAxis dataKey="type" tick={{ fontSize: 12 }} stroke="hsl(220,9%,46%)" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(220,9%,46%)" />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(215,28%,17%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Booking Status */}
          <div className="metric-card">
            <h3 className="font-semibold mb-4">Booking Status</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={bookingStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {bookingStatusData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Recent Reviews */}
          <div className="metric-card">
            <h3 className="font-semibold mb-4">Recent Reviews</h3>
            <div className="space-y-3">
              {recentReviews.map(r => (
                <div key={r.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                    <Star className="w-4 h-4 text-secondary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{r.guestName}</span>
                      <span className="text-xs text-muted-foreground">Room {r.roomNumber}</span>
                    </div>
                    <div className="flex gap-0.5 my-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < r.rating ? 'text-accent fill-accent' : 'text-muted-foreground'}`} />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">{r.comment}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
