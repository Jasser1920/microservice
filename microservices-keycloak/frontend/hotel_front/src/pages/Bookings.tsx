import { useMemo, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Booking, BookingStatus } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, LayoutGrid, List, MoreVertical, Copy } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BookingApi, bookingsApi, mapBookingList, roomsApi, usersApi } from '@/services/api';

const statusColumns: BookingStatus[] = ['PENDING', 'CONFIRMED', 'COMPLETED'];
const statusClass: Record<BookingStatus, string> = {
  PENDING: 'status-pending', CONFIRMED: 'status-confirmed', CANCELLED: 'status-cancelled',
  COMPLETED: 'status-checked-out',
};

const Bookings = () => {
  const { hasPermission, user } = useAuth();
  const queryClient = useQueryClient();
  const isClientView = user?.role === 'CLIENT';
  const { data, isLoading } = useQuery({
    queryKey: ['bookings', isClientView],
    enabled: !!user,
    queryFn: async () => {
      if (isClientView) {
        const clientUser = await usersApi.getMe();
        const [bookings, rooms] = await Promise.all([
          bookingsApi.listByUser(String(clientUser.id)),
          roomsApi.listRaw(),
        ]);
        return { bookings, rooms, users: [clientUser] };
      }
      const [bookings, rooms, users] = await Promise.all([
        bookingsApi.list(),
        roomsApi.listRaw(),
        usersApi.listRaw(),
      ]);
      return { bookings, rooms, users };
    },
  });

  const bookingList = useMemo(() => {
    if (!data) return [];
    return mapBookingList(data.bookings, data.rooms, data.users);
  }, [data]);

  const bookingMap = useMemo(() => {
    const map = new Map<string, BookingApi>();
    if (data?.bookings) {
      data.bookings.forEach(booking => map.set(String(booking.id), booking));
    }
    return map;
  }, [data]);

  const updateBooking = useMutation({
    mutationFn: ({ id, status }: { id: string; status: BookingStatus }) => {
      const booking = bookingMap.get(id);
      if (!booking) throw new Error('Booking data not available');
      return bookingsApi.update(id, { ...booking, status });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bookings'] }),
  });

  const cancelBookingMutation = useMutation({
    mutationFn: (id: string) => bookingsApi.cancel(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bookings'] }),
  });
  const [view, setView] = useState<'kanban' | 'list'>('kanban');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'ALL'>('ALL');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const visibleBookings = isClientView ? bookingList.filter(b => b.guestEmail === user.email) : bookingList;

  const filtered = visibleBookings.filter(b => {
    const ms = b.guestName.toLowerCase().includes(search.toLowerCase()) || b.roomNumber.includes(search);
    const mst = statusFilter === 'ALL' || b.status === statusFilter;
    return ms && mst;
  });

  const updateStatus = async (id: string, status: BookingStatus) => {
    try {
      if (status === 'CANCELLED') {
        await cancelBookingMutation.mutateAsync(id);
      } else {
        await updateBooking.mutateAsync({ id, status });
      }
      toast.success(`Booking status changed to ${status}`);
      if (selectedBooking?.id === id) setSelectedBooking(prev => prev ? { ...prev, status } : null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to update booking');
    }
  };

  const cancelBooking = (id: string) => updateStatus(id, 'CANCELLED');

  return (
    <AppLayout breadcrumb="Bookings">
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">{isClientView ? 'My Bookings' : 'All Bookings'}</h2>
          <div className="flex gap-2">
            <div className="flex border rounded-lg overflow-hidden">
              <button onClick={() => setView('kanban')} className={`p-2 ${view === 'kanban' ? 'bg-primary text-primary-foreground' : 'bg-card'}`}><LayoutGrid className="w-4 h-4" /></button>
              <button onClick={() => setView('list')} className={`p-2 ${view === 'list' ? 'bg-primary text-primary-foreground' : 'bg-card'}`}><List className="w-4 h-4" /></button>
            </div>
          </div>
        </div>

        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search by guest or room..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={statusFilter} onValueChange={v => setStatusFilter(v as any)}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              {[...statusColumns, 'CANCELLED' as BookingStatus].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {isLoading && <div className="text-sm text-muted-foreground">Loading bookings...</div>}

        {view === 'kanban' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {statusColumns.map(status => {
              const items = filtered.filter(b => b.status === status);
              return (
                <div key={status} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm">{status.replace('_', ' ')}</h3>
                    <span className="status-badge bg-muted text-muted-foreground">{items.length}</span>
                  </div>
                  <div className="space-y-2">
                    {items.map(b => (
                      <div key={b.id} onClick={() => setSelectedBooking(b)}
                        className="bg-card rounded-lg border p-4 cursor-pointer hover:shadow-md transition-shadow space-y-2">
                        <div className="flex items-start justify-between">
                          <span className="font-semibold text-sm">{b.guestName}</span>
                          <DropdownMenu>
                            <DropdownMenuTrigger onClick={e => e.stopPropagation()} className="p-1 rounded hover:bg-muted">
                              <MoreVertical className="w-4 h-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={e => { e.stopPropagation(); setSelectedBooking(b); }}>View Details</DropdownMenuItem>
                              {hasPermission(['ADMIN', 'MANAGER']) && b.status === 'PENDING' && (
                                <DropdownMenuItem onClick={e => { e.stopPropagation(); updateStatus(b.id, 'CONFIRMED'); }}>Confirm</DropdownMenuItem>
                              )}
                              {hasPermission(['ADMIN', 'MANAGER', 'STAFF']) && b.status === 'CONFIRMED' && (
                                <DropdownMenuItem onClick={e => { e.stopPropagation(); updateStatus(b.id, 'COMPLETED'); }}>Mark Completed</DropdownMenuItem>
                              )}
                              {(hasPermission(['ADMIN', 'MANAGER']) || (isClientView && ['PENDING', 'CONFIRMED'].includes(b.status))) && (
                                <DropdownMenuItem onClick={e => { e.stopPropagation(); cancelBooking(b.id); }} className="text-destructive">Cancel</DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <p className="text-xs text-muted-foreground">Room {b.roomNumber} ({b.roomType})</p>
                        <p className="text-xs text-muted-foreground">{b.checkIn} → {b.checkOut}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">{b.guests} guest{b.guests > 1 ? 's' : ''}</span>
                          <span className="font-semibold text-sm text-secondary">{b.totalPrice.toFixed(2)}€</span>
                        </div>
                      </div>
                    ))}
                    {items.length === 0 && <p className="text-xs text-muted-foreground text-center py-8">No bookings</p>}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-card rounded-xl border overflow-hidden">
            <table className="data-table">
              <thead><tr><th>Guest</th><th>Room</th><th>Check-In</th><th>Check-Out</th><th>Status</th><th>Price</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map(b => (
                  <tr key={b.id} onClick={() => setSelectedBooking(b)} className="cursor-pointer">
                    <td className="font-medium">{b.guestName}</td>
                    <td>{b.roomNumber} ({b.roomType})</td>
                    <td>{b.checkIn}</td>
                    <td>{b.checkOut}</td>
                    <td><span className={`status-badge ${statusClass[b.status]}`}>{b.status}</span></td>
                    <td className="font-semibold">{b.totalPrice.toFixed(2)}€</td>
                    <td><Button size="sm" variant="ghost" onClick={e => { e.stopPropagation(); setSelectedBooking(b); }}>View</Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Booking Detail Modal */}
      <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Booking Details</DialogTitle></DialogHeader>
          {selectedBooking && (
            <Tabs defaultValue="details">
              <TabsList className="w-full">
                <TabsTrigger value="details" className="flex-1">Details</TabsTrigger>
                <TabsTrigger value="timeline" className="flex-1">Timeline</TabsTrigger>
              </TabsList>
              <TabsContent value="details" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-muted-foreground">Guest</span><p className="font-medium">{selectedBooking.guestName}</p></div>
                  <div><span className="text-muted-foreground">Room</span><p className="font-medium">{selectedBooking.roomNumber} ({selectedBooking.roomType})</p></div>
                  <div><span className="text-muted-foreground">Check-In</span><p className="font-medium">{selectedBooking.checkIn}</p></div>
                  <div><span className="text-muted-foreground">Check-Out</span><p className="font-medium">{selectedBooking.checkOut}</p></div>
                  <div><span className="text-muted-foreground">Guests</span><p className="font-medium">{selectedBooking.guests}</p></div>
                  <div><span className="text-muted-foreground">Total Price</span><p className="font-semibold text-secondary">{selectedBooking.totalPrice.toFixed(2)}€</p></div>
                  <div><span className="text-muted-foreground">Status</span><p><span className={`status-badge ${statusClass[selectedBooking.status]}`}>{selectedBooking.status}</span></p></div>
                  <div>
                    <span className="text-muted-foreground">Confirmation</span>
                    <div className="flex items-center gap-1">
                      <p className="font-mono font-medium">{selectedBooking.confirmationCode}</p>
                      <button onClick={() => { navigator.clipboard.writeText(selectedBooking.confirmationCode); toast.success('Copied!'); }} className="p-1 rounded hover:bg-muted"><Copy className="w-3 h-3" /></button>
                    </div>
                  </div>
                </div>
                {selectedBooking.specialRequests && (
                  <div><span className="text-sm text-muted-foreground">Special Requests</span><p className="text-sm mt-1 p-2 rounded bg-muted">{selectedBooking.specialRequests}</p></div>
                )}
                <div className="flex gap-2 flex-wrap">
                  {hasPermission(['ADMIN', 'MANAGER']) && selectedBooking.status === 'PENDING' && (
                    <Button size="sm" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground" onClick={() => updateStatus(selectedBooking.id, 'CONFIRMED')}>Confirm</Button>
                  )}
                  {hasPermission(['ADMIN', 'MANAGER', 'STAFF']) && selectedBooking.status === 'CONFIRMED' && (
                    <Button size="sm" className="bg-info text-info-foreground" onClick={() => updateStatus(selectedBooking.id, 'COMPLETED')}>Mark Completed</Button>
                  )}
                  {(hasPermission(['ADMIN', 'MANAGER']) || (isClientView && ['PENDING', 'CONFIRMED'].includes(selectedBooking.status))) && selectedBooking.status !== 'CANCELLED' && (
                    <Button size="sm" variant="destructive" onClick={() => cancelBooking(selectedBooking.id)}>Cancel</Button>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="timeline" className="mt-4">
                <div className="space-y-4">
                  {[
                    { label: 'Created', date: selectedBooking.createdAt, done: true },
                    { label: 'Confirmed', date: selectedBooking.status !== 'PENDING' && selectedBooking.status !== 'CANCELLED' ? selectedBooking.createdAt : null, done: ['CONFIRMED', 'COMPLETED'].includes(selectedBooking.status) },
                    { label: 'Completed', date: null, done: selectedBooking.status === 'COMPLETED' },
                  ].map((step, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${step.done ? 'bg-secondary' : 'bg-border'}`} />
                      <div>
                        <p className={`text-sm font-medium ${step.done ? '' : 'text-muted-foreground'}`}>{step.label}</p>
                        {step.date && <p className="text-xs text-muted-foreground">{step.date}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Bookings;
