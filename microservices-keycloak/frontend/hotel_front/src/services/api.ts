import { Booking, BookingStatus, EventStatus, HotelEvent, Review, Room, RoomStatus, RoomType, StockCategory, StockItem, User } from '@/types';
import { getAccessToken } from '@/lib/keycloak';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9090/api';

const toNumber = (value: unknown): number => {
  if (value === null || value === undefined || value === '') return 0;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const toDate = (value?: string): string => {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0];
};

const splitList = (value?: string): string[] => {
  if (!value) return [];
  return value
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);
};

const joinList = (items?: string[]): string => {
  if (!items?.length) return '';
  return items.map(item => item.trim()).filter(Boolean).join(', ');
};

const apiRequest = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const token = await getAccessToken();
  const headers = new Headers(options.headers);
  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || response.statusText);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
};

export interface RoomApi {
  id: number;
  roomNumber: string;
  type: RoomType | string;
  floor: number;
  pricePerNight: number;
  status: RoomStatus | string;
  capacity?: number;
  amenities?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BookingApi {
  id: number;
  userId: number;
  roomId: number;
  checkInDate: string;
  checkOutDate: string;
  status: BookingStatus | string;
  totalPrice: number;
  numberOfGuests?: number;
  specialRequests?: string;
  confirmationCode?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ReviewApi {
  id: number;
  userId: number;
  roomId: number;
  bookingId?: number;
  rating: number;
  comment?: string;
  verified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface StockItemApi {
  id: number;
  itemCode: string;
  name: string;
  category: StockCategory | string;
  quantity: number;
  minQuantity: number;
  unit?: string;
  unitPrice?: number;
  supplier?: string;
  lastRestocked?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface EventApi {
  id: number;
  name: string;
  type: string;
  startDateTime: string;
  endDateTime: string;
  venue?: string;
  expectedAttendees?: number;
  organizerId?: number;
  status: EventStatus | string;
  totalCost?: number;
  description?: string;
  services?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserApi {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: string;
  preferences?: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const mapRoom = (room: RoomApi): Room => ({
  id: String(room.id),
  roomNumber: room.roomNumber,
  type: (room.type as RoomType) || 'SINGLE',
  floor: room.floor,
  pricePerNight: toNumber(room.pricePerNight),
  status: (room.status as RoomStatus) || 'AVAILABLE',
  capacity: room.capacity || 1,
  amenities: splitList(room.amenities),
  description: room.description || '',
});

const mapBooking = (booking: BookingApi, rooms: RoomApi[], users: UserApi[]): Booking => {
  const room = rooms.find(r => r.id === booking.roomId);
  const user = users.find(u => u.id === booking.userId);
  return {
    id: String(booking.id),
    userId: String(booking.userId),
    roomId: String(booking.roomId),
    guestName: user ? `${user.firstName} ${user.lastName}` : 'Unknown Guest',
    guestEmail: user?.email || '',
    roomNumber: room?.roomNumber || '-',
    roomType: (room?.type as RoomType) || 'SINGLE',
    checkIn: booking.checkInDate,
    checkOut: booking.checkOutDate,
    status: (booking.status as BookingStatus) || 'PENDING',
    guests: booking.numberOfGuests || 1,
    totalPrice: toNumber(booking.totalPrice),
    specialRequests: booking.specialRequests || '',
    confirmationCode: booking.confirmationCode || '',
    createdAt: booking.createdAt || '',
  };
};

const mapReview = (review: ReviewApi, rooms: RoomApi[], users: UserApi[]): Review => {
  const room = rooms.find(r => r.id === review.roomId);
  const user = users.find(u => u.id === review.userId);
  return {
    id: String(review.id),
    userId: String(review.userId),
    roomId: String(review.roomId),
    guestName: user ? `${user.firstName} ${user.lastName}` : 'Guest',
    roomNumber: room?.roomNumber || '-',
    rating: review.rating,
    comment: review.comment || '',
    verified: !!review.verified,
    bookingId: review.bookingId ? String(review.bookingId) : '',
    helpful: 0,
    createdAt: review.createdAt || '',
  };
};

const mapStockItem = (item: StockItemApi): StockItem => ({
  id: String(item.id),
  itemCode: item.itemCode,
  name: item.name,
  category: (item.category as StockCategory) || 'OTHER',
  quantity: item.quantity,
  minQuantity: item.minQuantity,
  unit: item.unit || 'unit',
  unitPrice: toNumber(item.unitPrice),
  supplier: item.supplier || '',
  lastRestocked: toDate(item.lastRestocked),
});

const mapEvent = (event: EventApi): HotelEvent => ({
  id: String(event.id),
  name: event.name,
  type: (event.type as HotelEvent['type']) || 'OTHER',
  startDate: toDate(event.startDateTime),
  endDate: toDate(event.endDateTime),
  organizer: event.organizerId ? `User #${event.organizerId}` : 'Unknown',
  venue: event.venue || '',
  expectedAttendees: event.expectedAttendees || 0,
  status: (event.status as EventStatus) || 'PLANNED',
  isPublic: false,
  services: splitList(event.services),
  totalCost: toNumber(event.totalCost),
  description: event.description || '',
});

const mapUser = (user: UserApi): User => ({
  id: String(user.id),
  email: user.email,
  firstName: user.firstName,
  lastName: user.lastName,
  phone: user.phone,
  role: (user.role as User['role']) || 'CLIENT',
  active: user.active,
  preferences: user.preferences ? { raw: user.preferences } : undefined,
  createdAt: user.createdAt || '',
});

export const roomsApi = {
  listRaw: async (): Promise<RoomApi[]> => apiRequest<RoomApi[]>('/rooms'),
  list: async (): Promise<Room[]> => {
    const rooms = await apiRequest<RoomApi[]>('/rooms');
    return rooms.map(mapRoom);
  },
  create: async (payload: Partial<Room>): Promise<Room> => {
    const created = await apiRequest<RoomApi>('/rooms', {
      method: 'POST',
      body: JSON.stringify({
        roomNumber: payload.roomNumber,
        type: payload.type,
        floor: payload.floor,
        pricePerNight: payload.pricePerNight,
        status: payload.status,
        capacity: payload.capacity,
        amenities: joinList(payload.amenities),
        description: payload.description,
      }),
    });
    return mapRoom(created);
  },
  update: async (id: string, payload: Partial<Room>): Promise<Room> => {
    const updated = await apiRequest<RoomApi>(`/rooms/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        id: Number(id),
        roomNumber: payload.roomNumber,
        type: payload.type,
        floor: payload.floor,
        pricePerNight: payload.pricePerNight,
        status: payload.status,
        capacity: payload.capacity,
        amenities: joinList(payload.amenities),
        description: payload.description,
      }),
    });
    return mapRoom(updated);
  },
  remove: async (id: string): Promise<void> => {
    await apiRequest<void>(`/rooms/${id}`, { method: 'DELETE' });
  },
};

export const usersApi = {
  listRaw: async (): Promise<UserApi[]> => apiRequest<UserApi[]>('/users'),
  getMe: async (): Promise<UserApi> => apiRequest<UserApi>('/users/me'),
  getByEmail: async (email: string): Promise<UserApi> => apiRequest<UserApi>(`/users/email/${encodeURIComponent(email)}`),
  list: async (): Promise<User[]> => {
    const users = await apiRequest<UserApi[]>('/users');
    return users.map(mapUser);
  },
  create: async (payload: Partial<User>): Promise<User> => {
    const created = await apiRequest<UserApi>('/users', {
      method: 'POST',
      body: JSON.stringify({
        email: payload.email,
        firstName: payload.firstName,
        lastName: payload.lastName,
        phone: payload.phone,
        role: payload.role,
        active: payload.active,
      }),
    });
    return mapUser(created);
  },
  update: async (id: string, payload: Partial<User>): Promise<User> => {
    const updated = await apiRequest<UserApi>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        id: Number(id),
        email: payload.email,
        firstName: payload.firstName,
        lastName: payload.lastName,
        phone: payload.phone,
        role: payload.role,
        active: payload.active,
      }),
    });
    return mapUser(updated);
  },
  remove: async (id: string): Promise<void> => {
    await apiRequest<void>(`/users/${id}`, { method: 'DELETE' });
  },
};

export const bookingsApi = {
  list: async (): Promise<BookingApi[]> => apiRequest<BookingApi[]>('/bookings'),
  listByUser: async (userId: string): Promise<BookingApi[]> => apiRequest<BookingApi[]>(`/bookings/user/${userId}`),
  create: async (payload: Omit<BookingApi, 'id'>): Promise<BookingApi> => {
    return apiRequest<BookingApi>('/bookings', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  update: async (id: string, payload: BookingApi): Promise<BookingApi> => {
    return apiRequest<BookingApi>(`/bookings/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ ...payload, id: Number(id) }),
    });
  },
  cancel: async (id: string): Promise<void> => {
    await apiRequest<void>(`/bookings/${id}/cancel`, { method: 'PATCH' });
  },
  confirm: async (id: string): Promise<BookingApi> => {
    return apiRequest<BookingApi>(`/bookings/${id}/confirm`, { method: 'PATCH' });
  },
};

export const reviewsApi = {
  list: async (): Promise<ReviewApi[]> => apiRequest<ReviewApi[]>('/reviews'),
  listByUser: async (userId: string): Promise<ReviewApi[]> => apiRequest<ReviewApi[]>(`/reviews/user/${userId}`),
  create: async (payload: Partial<ReviewApi>): Promise<ReviewApi> => {
    return apiRequest<ReviewApi>('/reviews', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};

export const stockApi = {
  list: async (): Promise<StockItem[]> => {
    const items = await apiRequest<StockItemApi[]>('/stock');
    return items.map(mapStockItem);
  },
  create: async (payload: Partial<StockItem>): Promise<StockItem> => {
    const created = await apiRequest<StockItemApi>('/stock', {
      method: 'POST',
      body: JSON.stringify({
        itemCode: payload.itemCode,
        name: payload.name,
        category: payload.category,
        quantity: payload.quantity,
        minQuantity: payload.minQuantity,
        unit: payload.unit,
        unitPrice: payload.unitPrice,
        supplier: payload.supplier,
      }),
    });
    return mapStockItem(created);
  },
  update: async (id: string, payload: Partial<StockItem>): Promise<StockItem> => {
    const updated = await apiRequest<StockItemApi>(`/stock/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        id: Number(id),
        itemCode: payload.itemCode,
        name: payload.name,
        category: payload.category,
        quantity: payload.quantity,
        minQuantity: payload.minQuantity,
        unit: payload.unit,
        unitPrice: payload.unitPrice,
        supplier: payload.supplier,
      }),
    });
    return mapStockItem(updated);
  },
  remove: async (id: string): Promise<void> => {
    await apiRequest<void>(`/stock/${id}`, { method: 'DELETE' });
  },
};

export const eventsApi = {
  list: async (): Promise<HotelEvent[]> => {
    const events = await apiRequest<EventApi[]>('/events');
    return events.map(mapEvent);
  },
  create: async (payload: Partial<HotelEvent>): Promise<HotelEvent> => {
    const created = await apiRequest<EventApi>('/events', {
      method: 'POST',
      body: JSON.stringify({
        name: payload.name,
        type: payload.type,
        startDateTime: payload.startDate ? `${payload.startDate}T00:00:00` : undefined,
        endDateTime: payload.endDate ? `${payload.endDate}T00:00:00` : undefined,
        venue: payload.venue,
        expectedAttendees: payload.expectedAttendees,
        status: payload.status,
        totalCost: payload.totalCost,
        description: payload.description,
        services: joinList(payload.services),
      }),
    });
    return mapEvent(created);
  },
  update: async (id: string, payload: Partial<HotelEvent>): Promise<HotelEvent> => {
    const updated = await apiRequest<EventApi>(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        id: Number(id),
        name: payload.name,
        type: payload.type,
        startDateTime: payload.startDate ? `${payload.startDate}T00:00:00` : undefined,
        endDateTime: payload.endDate ? `${payload.endDate}T00:00:00` : undefined,
        venue: payload.venue,
        expectedAttendees: payload.expectedAttendees,
        status: payload.status,
        totalCost: payload.totalCost,
        description: payload.description,
        services: joinList(payload.services),
      }),
    });
    return mapEvent(updated);
  },
  remove: async (id: string): Promise<void> => {
    await apiRequest<void>(`/events/${id}`, { method: 'DELETE' });
  },
};

export const getDashboardData = async () => {
  const [rooms, bookings, reviews, stock] = await Promise.all([
    apiRequest<RoomApi[]>('/rooms'),
    apiRequest<BookingApi[]>('/bookings'),
    apiRequest<ReviewApi[]>('/reviews'),
    apiRequest<StockItemApi[]>('/stock'),
  ]);
  return { rooms, bookings, reviews, stock };
};

export const mapBookingList = (bookings: BookingApi[], rooms: RoomApi[], users: UserApi[]): Booking[] =>
  bookings.map(booking => mapBooking(booking, rooms, users));

export const mapReviewList = (reviews: ReviewApi[], rooms: RoomApi[], users: UserApi[]): Review[] =>
  reviews.map(review => mapReview(review, rooms, users));
