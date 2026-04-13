import { useMemo, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { HotelEvent, EventType, EventStatus } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Plus, CalendarDays, List, Users, MapPin, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { eventsApi } from '@/services/api';

const eventTypes: EventType[] = ['SEMINAR', 'WEDDING', 'PARTY', 'CONFERENCE', 'OTHER'];
const eventStatuses: EventStatus[] = ['PLANNED', 'CONFIRMED', 'IN_PROGRESS', 'CANCELLED', 'COMPLETED'];

const typeColors: Record<EventType, string> = {
  WEDDING: 'bg-red-100 text-red-800', SEMINAR: 'bg-blue-100 text-blue-800', PARTY: 'bg-purple-100 text-purple-800',
  CONFERENCE: 'bg-teal-100 text-teal-800', OTHER: 'bg-gray-100 text-gray-800',
};

const statusColors: Record<EventStatus, string> = {
  PLANNED: 'status-pending', CONFIRMED: 'status-confirmed', IN_PROGRESS: 'status-checked-in', CANCELLED: 'status-cancelled', COMPLETED: 'status-checked-out',
};

const allServices = ['Catering', 'Decoration', 'Music', 'Photography', 'AV Equipment', 'Projector', 'Microphones', 'Lighting'];

const Events = () => {
  const { hasPermission, user } = useAuth();
  const queryClient = useQueryClient();
  const { data: events = [], isLoading } = useQuery({ queryKey: ['events'], queryFn: eventsApi.list });
  const [view, setView] = useState<'list' | 'timeline'>('list');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<EventType | 'ALL'>('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [editEvent, setEditEvent] = useState<HotelEvent | null>(null);
  const [form, setForm] = useState({
    name: '', type: 'SEMINAR' as EventType, startDate: '', endDate: '', organizer: '', venue: '',
    expectedAttendees: 50, status: 'PLANNED' as EventStatus, isPublic: false, services: [] as string[], totalCost: 0, description: ''
  });

  const isClient = user?.role === 'CLIENT';
  const isManager = user?.role === 'MANAGER';
  const visibleEvents = events;

  const filtered = useMemo(() => visibleEvents.filter(e => {
    const ms = e.name.toLowerCase().includes(search.toLowerCase());
    const mt = typeFilter === 'ALL' || e.type === typeFilter;
    return ms && mt;
  }), [visibleEvents, search, typeFilter]);

  const createEvent = useMutation({
    mutationFn: eventsApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events'] }),
  });

  const updateEvent = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<HotelEvent> }) => eventsApi.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events'] }),
  });

  const registerEvent = useMutation({
    mutationFn: (eventId: string) => {
      // In a real app, this would call an API endpoint for registration
      // For now, we'll just show a success message
      return Promise.resolve();
    },
    onSuccess: () => {
      toast.success('Registered for event!');
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  const openCreate = () => {
    setForm({ name: '', type: 'SEMINAR', startDate: '', endDate: '', organizer: user?.firstName + ' ' + user?.lastName || '', venue: '', expectedAttendees: 50, status: 'PLANNED', isPublic: false, services: [], totalCost: 0, description: '' });
    setEditEvent(null);
    setModalOpen(true);
  };

  const openEdit = (e: HotelEvent) => {
    setForm({ name: e.name, type: e.type, startDate: e.startDate, endDate: e.endDate, organizer: e.organizer, venue: e.venue, expectedAttendees: e.expectedAttendees, status: e.status, isPublic: e.isPublic, services: [...e.services], totalCost: e.totalCost, description: e.description });
    setEditEvent(e);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.startDate) { toast.error('Name and start date required'); return; }
    try {
      if (editEvent) {
        await updateEvent.mutateAsync({ id: editEvent.id, payload: form });
        toast.success('Event updated!');
      } else {
        await createEvent.mutateAsync(form);
        toast.success('Event created!');
      }
      setModalOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to save event');
    }
  };

  const toggleService = (s: string) => {
    setForm(f => ({ ...f, services: f.services.includes(s) ? f.services.filter(x => x !== s) : [...f.services, s] }));
  };

  return (
    <AppLayout breadcrumb="Events">
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">{isClient ? 'Public Events' : 'Events Management'}</h2>
          <div className="flex gap-2">
            <div className="flex border rounded-lg overflow-hidden">
              <button onClick={() => setView('list')} className={`p-2 ${view === 'list' ? 'bg-primary text-primary-foreground' : 'bg-card'}`}><List className="w-4 h-4" /></button>
              <button onClick={() => setView('timeline')} className={`p-2 ${view === 'timeline' ? 'bg-primary text-primary-foreground' : 'bg-card'}`}><CalendarDays className="w-4 h-4" /></button>
            </div>
            {hasPermission(['ADMIN', 'MANAGER']) && (
              <Button onClick={openCreate} className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"><Plus className="w-4 h-4 mr-2" /> Create Event</Button>
            )}
          </div>
        </div>

        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search events..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={typeFilter} onValueChange={v => setTypeFilter(v as any)}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Types</SelectItem>
              {eventTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {isLoading && <div className="text-sm text-muted-foreground">Loading events...</div>}

        {view === 'list' ? (
          <div className="bg-card rounded-xl border overflow-hidden">
            <table className="data-table">
              <thead><tr><th>Event</th><th>Type</th><th>Venue</th><th>Start</th><th>End</th><th>Status</th><th>Attendees</th><th>Cost</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map(e => (
                  <tr key={e.id}>
                    <td>
                      <div>
                        <span className="font-medium">{e.name}</span>
                        {e.isPublic && <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-info/10 text-info">Public</span>}
                      </div>
                    </td>
                    <td><span className={`status-badge ${typeColors[e.type]}`}>{e.type}</span></td>
                    <td>{e.venue}</td>
                    <td>{e.startDate}</td>
                    <td>{e.endDate}</td>
                    <td><span className={`status-badge ${statusColors[e.status]}`}>{e.status}</span></td>
                    <td>{e.expectedAttendees}</td>
                    <td className="font-semibold">{e.totalCost.toLocaleString()}€</td>
                    <td>
                      {hasPermission(['ADMIN', 'MANAGER']) ? (
                        <Button size="sm" variant="ghost" onClick={() => openEdit(e)}>Edit</Button>
                      ) : hasPermission(['CLIENT']) ? (
                        <Button size="sm" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground" onClick={() => registerEvent.mutate(e.id)}>Register</Button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.sort((a, b) => a.startDate.localeCompare(b.startDate)).map(e => (
              <div key={e.id} className="flex gap-4">
                <div className="w-24 text-right flex-shrink-0">
                  <p className="text-sm font-semibold">{e.startDate}</p>
                  <p className="text-xs text-muted-foreground">{e.endDate !== e.startDate ? `→ ${e.endDate}` : 'One day'}</p>
                </div>
                <div className="w-px bg-border relative">
                  <div className={`absolute top-2 -left-1.5 w-3 h-3 rounded-full ${e.status === 'CONFIRMED' ? 'bg-secondary' : e.status === 'CANCELLED' ? 'bg-destructive' : 'bg-accent'}`} />
                </div>
                <div className="bg-card rounded-xl border p-4 flex-1 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{e.name}</span>
                        <span className={`status-badge ${typeColors[e.type]}`}>{e.type}</span>
                        <span className={`status-badge ${statusColors[e.status]}`}>{e.status}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{e.description}</p>
                    </div>
                  </div>
                  <div className="flex gap-6 mt-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {e.venue}</span>
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {e.expectedAttendees}</span>
                    <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" /> {e.totalCost.toLocaleString()}€</span>
                  </div>
                  {e.services.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {e.services.map(s => <span key={s} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{s}</span>)}
                    </div>
                  )}
                  {(isClient || isManager) && (
                    <div className="mt-3">
                      <Button size="sm" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground" onClick={() => registerEvent.mutate(e.id)}>Register</Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editEvent ? `Edit ${editEvent.name}` : 'Create New Event'}</DialogTitle></DialogHeader>
          <Tabs defaultValue="details">
            <TabsList><TabsTrigger value="details">Details</TabsTrigger><TabsTrigger value="services">Services</TabsTrigger></TabsList>
            <TabsContent value="details" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-sm font-medium mb-1 block">Event Name *</label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
                <div><label className="text-sm font-medium mb-1 block">Type</label>
                  <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v as EventType }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{eventTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-sm font-medium mb-1 block">Start Date *</label><Input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} /></div>
                <div><label className="text-sm font-medium mb-1 block">End Date</label><Input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-sm font-medium mb-1 block">Venue</label><Input value={form.venue} onChange={e => setForm(f => ({ ...f, venue: e.target.value }))} /></div>
                <div><label className="text-sm font-medium mb-1 block">Expected Attendees</label><Input type="number" value={form.expectedAttendees} onChange={e => setForm(f => ({ ...f, expectedAttendees: +e.target.value }))} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-sm font-medium mb-1 block">Status</label>
                  <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v as EventStatus }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{eventStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><label className="text-sm font-medium mb-1 block">Total Cost (€)</label><Input type="number" value={form.totalCost} onChange={e => setForm(f => ({ ...f, totalCost: +e.target.value }))} /></div>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox checked={form.isPublic} onCheckedChange={v => setForm(f => ({ ...f, isPublic: !!v }))} />
                <label className="text-sm font-medium">Public Event (visible to clients)</label>
              </div>
              <div><label className="text-sm font-medium mb-1 block">Description</label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
            </TabsContent>
            <TabsContent value="services" className="mt-4">
              <label className="text-sm font-medium mb-2 block">Select Services</label>
              <div className="flex flex-wrap gap-2">
                {allServices.map(s => (
                  <button key={s} onClick={() => toggleService(s)} className={`filter-chip ${form.services.includes(s) ? 'selected' : ''}`}>{s}</button>
                ))}
              </div>
            </TabsContent>
          </Tabs>
          <Button onClick={handleSave} className="w-full mt-4 bg-secondary hover:bg-secondary/90 text-secondary-foreground">
            {editEvent ? 'Update Event' : 'Save Event'}
          </Button>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Events;
