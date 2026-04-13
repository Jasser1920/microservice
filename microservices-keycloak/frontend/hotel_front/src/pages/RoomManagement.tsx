import { useMemo, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Room, RoomType, RoomStatus } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Search, Plus, Grid3X3, List, MoreVertical } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { bookingsApi, roomsApi, usersApi } from '@/services/api';

const allAmenities = ['WiFi', 'TV', 'AC', 'Minibar', 'Jacuzzi', 'Kitchen', 'Balcony'];

const statusClass: Record<RoomStatus, string> = {
  AVAILABLE: 'status-available', OCCUPIED: 'status-occupied', MAINTENANCE: 'status-maintenance', RESERVED: 'status-pending'
};

const typeClass: Record<RoomType, string> = {
  SINGLE: 'bg-blue-100 text-blue-800', DOUBLE: 'bg-indigo-100 text-indigo-800', SUITE: 'bg-purple-100 text-purple-800', DELUXE: 'bg-emerald-100 text-emerald-800'
};

const RoomManagement = () => {
  const { hasPermission, user } = useAuth();
  const queryClient = useQueryClient();
  const { data: rooms = [], isLoading } = useQuery({ queryKey: ['rooms'], queryFn: roomsApi.list });
  const isClient = user?.role === 'CLIENT';
  const { data: clientUser } = useQuery({
    queryKey: ['userMe'],
    queryFn: usersApi.getMe,
    enabled: isClient,
  });
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<RoomType | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<RoomStatus | 'ALL'>('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [editRoom, setEditRoom] = useState<Room | null>(null);
  const [form, setForm] = useState({ roomNumber: '', type: 'SINGLE' as RoomType, floor: 1, pricePerNight: 80, status: 'AVAILABLE' as RoomStatus, capacity: 1, amenities: [] as string[], description: '' });
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingRoom, setBookingRoom] = useState<Room | null>(null);
  const [bookingForm, setBookingForm] = useState({ checkInDate: '', checkOutDate: '', guests: 1, specialRequests: '' });

  const createRoom = useMutation({
    mutationFn: roomsApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rooms'] }),
  });

  const updateRoom = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Room> }) => roomsApi.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rooms'] }),
  });

  const deleteRoomMutation = useMutation({
    mutationFn: roomsApi.remove,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rooms'] }),
  });

  const createBooking = useMutation({
    mutationFn: bookingsApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bookings'] }),
  });

  const openCreate = () => {
    setForm({ roomNumber: '', type: 'SINGLE', floor: 1, pricePerNight: 80, status: 'AVAILABLE', capacity: 1, amenities: [], description: '' });
    setEditRoom(null);
    setModalOpen(true);
  };

  const openEdit = (r: Room) => {
    setForm({ roomNumber: r.roomNumber, type: r.type, floor: r.floor, pricePerNight: r.pricePerNight, status: r.status, capacity: r.capacity || 1, amenities: [...r.amenities], description: r.description });
    setEditRoom(r);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.roomNumber) { toast.error('Room number required'); return; }
    try {
      if (editRoom) {
        await updateRoom.mutateAsync({ id: editRoom.id, payload: form });
        toast.success('Room updated!');
      } else {
        await createRoom.mutateAsync(form);
        toast.success('Room created!');
      }
      setModalOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to save room');
    }
  };

  const deleteRoom = async (id: string) => {
    try {
      await deleteRoomMutation.mutateAsync(id);
      toast.success('Room deleted');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to delete room');
    }
  };

  const toggleAmenity = (a: string) => {
    setForm(f => ({ ...f, amenities: f.amenities.includes(a) ? f.amenities.filter(x => x !== a) : [...f.amenities, a] }));
  };

  const clientUserId = useMemo(() => {
    if (!isClient) return undefined;
    return clientUser?.id;
  }, [clientUser, isClient]);

  const openBooking = (room: Room) => {
    if (!isClient) return;
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    setBookingRoom(room);
    setBookingForm({
      checkInDate: today.toISOString().split('T')[0],
      checkOutDate: tomorrow.toISOString().split('T')[0],
      guests: Math.min(room.capacity || 1, 1),
      specialRequests: '',
    });
    setBookingModalOpen(true);
  };

  const handleCreateBooking = async () => {
    if (!bookingRoom) return;
    if (!clientUserId) {
      toast.error('User account not found. Please contact support.');
      return;
    }
    if (!bookingForm.checkInDate || !bookingForm.checkOutDate) {
      toast.error('Check-in and check-out dates are required');
      return;
    }
    const checkIn = new Date(bookingForm.checkInDate);
    const checkOut = new Date(bookingForm.checkOutDate);
    const diffDays = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) {
      toast.error('Check-out date must be after check-in date');
      return;
    }
    const totalPrice = diffDays * bookingRoom.pricePerNight;
    try {
      await createBooking.mutateAsync({
        userId: Number(clientUserId),
        roomId: Number(bookingRoom.id),
        checkInDate: bookingForm.checkInDate,
        checkOutDate: bookingForm.checkOutDate,
        status: 'PENDING',
        totalPrice,
        numberOfGuests: bookingForm.guests,
        specialRequests: bookingForm.specialRequests,
      });
      toast.success('Booking created! Awaiting confirmation.');
      setBookingModalOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to create booking');
    }
  };

  const filtered = useMemo(() => rooms.filter(r => {
    const ms = r.roomNumber.includes(search) || r.description.toLowerCase().includes(search.toLowerCase());
    const mt = typeFilter === 'ALL' || r.type === typeFilter;
    const ms2 = statusFilter === 'ALL' || r.status === statusFilter;
    return ms && mt && ms2;
  }), [rooms, search, typeFilter, statusFilter]);

  return (
    <AppLayout breadcrumb="Room Management">
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Rooms</h2>
          <div className="flex gap-2">
            <div className="flex border rounded-lg overflow-hidden">
              <button onClick={() => setView('grid')} className={`p-2 ${view === 'grid' ? 'bg-primary text-primary-foreground' : 'bg-card'}`}><Grid3X3 className="w-4 h-4" /></button>
              <button onClick={() => setView('list')} className={`p-2 ${view === 'list' ? 'bg-primary text-primary-foreground' : 'bg-card'}`}><List className="w-4 h-4" /></button>
            </div>
            {hasPermission(['ADMIN', 'MANAGER']) && (
              <Button onClick={openCreate} className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                <Plus className="w-4 h-4 mr-2" /> Create Room
              </Button>
            )}
          </div>
        </div>

        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search rooms..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={typeFilter} onValueChange={v => setTypeFilter(v as any)}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Types</SelectItem>
              <SelectItem value="SINGLE">Single</SelectItem>
              <SelectItem value="DOUBLE">Double</SelectItem>
              <SelectItem value="SUITE">Suite</SelectItem>
              <SelectItem value="DELUXE">Deluxe</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={v => setStatusFilter(v as any)}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="AVAILABLE">Available</SelectItem>
              <SelectItem value="OCCUPIED">Occupied</SelectItem>
              <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
              <SelectItem value="RESERVED">Reserved</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading && <div className="text-sm text-muted-foreground">Loading rooms...</div>}

        {view === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(r => (
              <div key={r.id} className="bg-card rounded-xl border overflow-hidden hover:shadow-md transition-shadow">
                <div className="h-32 bg-muted flex items-center justify-center">
                  <span className="text-4xl font-bold text-muted-foreground/30">{r.roomNumber}</span>
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-lg">Room {r.roomNumber}</span>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="p-1 rounded hover:bg-muted"><MoreVertical className="w-4 h-4" /></DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {hasPermission(['ADMIN', 'MANAGER']) && <DropdownMenuItem onClick={() => openEdit(r)}>Edit Room</DropdownMenuItem>}
                        {hasPermission(['ADMIN']) && <DropdownMenuItem onClick={() => deleteRoom(r.id)} className="text-destructive">Delete</DropdownMenuItem>}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="flex gap-2">
                    <span className={`status-badge ${typeClass[r.type]}`}>{r.type}</span>
                    <span className={`status-badge ${statusClass[r.status]}`}>{r.status}</span>
                  </div>
                  <p className="text-lg font-semibold text-secondary">{r.pricePerNight.toFixed(2)}€ <span className="text-xs font-normal text-muted-foreground">/ night</span></p>
                  <p className="text-xs text-muted-foreground">Floor {r.floor} • Capacity: {r.capacity}</p>
                  <div className="flex flex-wrap gap-1">
                    {r.amenities.slice(0, 4).map(a => <span key={a} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{a}</span>)}
                    {r.amenities.length > 4 && <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">+{r.amenities.length - 4}</span>}
                  </div>
                  {isClient && r.status === 'AVAILABLE' && (
                    <Button size="sm" className="w-full mt-2 bg-secondary hover:bg-secondary/90 text-secondary-foreground" onClick={() => openBooking(r)}>
                      Book Now
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-card rounded-xl border overflow-hidden">
            <table className="data-table">
              <thead><tr><th>Room #</th><th>Type</th><th>Floor</th><th>Price/Night</th><th>Status</th><th>Capacity</th><th>Amenities</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r.id}>
                    <td className="font-bold">{r.roomNumber}</td>
                    <td><span className={`status-badge ${typeClass[r.type]}`}>{r.type}</span></td>
                    <td>{r.floor}</td>
                    <td>{r.pricePerNight.toFixed(2)}€</td>
                    <td><span className={`status-badge ${statusClass[r.status]}`}>{r.status}</span></td>
                    <td>{r.capacity}</td>
                    <td className="text-xs">{r.amenities.join(', ')}</td>
                    <td>
                      {hasPermission(['ADMIN', 'MANAGER']) && (
                        <Button size="sm" variant="ghost" onClick={() => openEdit(r)}>Edit</Button>
                      )}
                      {isClient && r.status === 'AVAILABLE' && (
                        <Button size="sm" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground" onClick={() => openBooking(r)}>
                          Book
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editRoom ? `Edit Room #${editRoom.roomNumber}` : 'Create New Room'}</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm font-medium mb-1 block">Room Number *</label><Input value={form.roomNumber} onChange={e => setForm(f => ({ ...f, roomNumber: e.target.value }))} /></div>
              <div><label className="text-sm font-medium mb-1 block">Type</label>
                <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v as RoomType }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="SINGLE">Single</SelectItem><SelectItem value="DOUBLE">Double</SelectItem><SelectItem value="SUITE">Suite</SelectItem><SelectItem value="DELUXE">Deluxe</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><label className="text-sm font-medium mb-1 block">Floor</label><Input type="number" value={form.floor} onChange={e => setForm(f => ({ ...f, floor: +e.target.value }))} /></div>
              <div><label className="text-sm font-medium mb-1 block">Price/Night (€)</label><Input type="number" value={form.pricePerNight} onChange={e => setForm(f => ({ ...f, pricePerNight: +e.target.value }))} /></div>
              <div><label className="text-sm font-medium mb-1 block">Capacity</label><Input type="number" value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: +e.target.value }))} /></div>
            </div>
            <div><label className="text-sm font-medium mb-1 block">Status</label>
              <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v as RoomStatus }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="AVAILABLE">Available</SelectItem><SelectItem value="OCCUPIED">Occupied</SelectItem><SelectItem value="MAINTENANCE">Maintenance</SelectItem><SelectItem value="RESERVED">Reserved</SelectItem></SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Amenities</label>
              <div className="flex flex-wrap gap-2">
                {allAmenities.map(a => (
                  <button key={a} onClick={() => toggleAmenity(a)} className={`filter-chip ${form.amenities.includes(a) ? 'selected' : ''}`}>{a}</button>
                ))}
              </div>
            </div>
            <div><label className="text-sm font-medium mb-1 block">Description</label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
            <Button onClick={handleSave} className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground">
              {editRoom ? 'Update Room' : 'Save Room'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={bookingModalOpen} onOpenChange={setBookingModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Book Room {bookingRoom?.roomNumber}</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Check-In *</label>
                <Input type="date" value={bookingForm.checkInDate} onChange={e => setBookingForm(f => ({ ...f, checkInDate: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Check-Out *</label>
                <Input type="date" value={bookingForm.checkOutDate} onChange={e => setBookingForm(f => ({ ...f, checkOutDate: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Guests</label>
              <Input type="number" min={1} max={bookingRoom?.capacity || 1} value={bookingForm.guests} onChange={e => setBookingForm(f => ({ ...f, guests: Number(e.target.value) }))} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Special Requests</label>
              <Textarea value={bookingForm.specialRequests} onChange={e => setBookingForm(f => ({ ...f, specialRequests: e.target.value }))} />
            </div>
            <Button onClick={handleCreateBooking} className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground" disabled={createBooking.isPending}>
              {createBooking.isPending ? 'Booking...' : 'Confirm Booking'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default RoomManagement;
