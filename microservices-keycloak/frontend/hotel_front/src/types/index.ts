export type Role = 'ADMIN' | 'MANAGER' | 'STAFF' | 'CLIENT';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: Role;
  active: boolean;
  preferences?: Record<string, unknown>;
  createdAt: string;
}

export type RoomType = 'SINGLE' | 'DOUBLE' | 'SUITE' | 'DELUXE';
export type RoomStatus = 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'RESERVED';

export interface Room {
  id: string;
  roomNumber: string;
  type: RoomType;
  floor: number;
  pricePerNight: number;
  status: RoomStatus;
  capacity: number;
  amenities: string[];
  description: string;
}

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

export interface Booking {
  id: string;
  userId?: string;
  roomId?: string;
  guestName: string;
  guestEmail: string;
  roomNumber: string;
  roomType: RoomType;
  checkIn: string;
  checkOut: string;
  status: BookingStatus;
  guests: number;
  totalPrice: number;
  specialRequests?: string;
  confirmationCode: string;
  createdAt: string;
}

export interface Review {
  id: string;
  userId?: string;
  roomId?: string;
  guestName: string;
  roomNumber: string;
  rating: number;
  comment: string;
  verified: boolean;
  bookingId: string;
  helpful: number;
  businessResponse?: string;
  createdAt: string;
}

export type StockCategory = 'LINEN' | 'CLEANING' | 'MINIBAR' | 'FURNITURE' | 'RESTAURANT' | 'SPA' | 'OTHER';

export interface StockItem {
  id: string;
  itemCode: string;
  name: string;
  category: StockCategory;
  quantity: number;
  minQuantity: number;
  unit: string;
  unitPrice: number;
  supplier: string;
  lastRestocked: string;
}

export type EventType = 'SEMINAR' | 'WEDDING' | 'PARTY' | 'CONFERENCE' | 'OTHER';
export type EventStatus = 'PLANNED' | 'CONFIRMED' | 'IN_PROGRESS' | 'CANCELLED' | 'COMPLETED';

export interface HotelEvent {
  id: string;
  name: string;
  type: EventType;
  startDate: string;
  endDate: string;
  organizer: string;
  venue: string;
  expectedAttendees: number;
  status: EventStatus;
  isPublic: boolean;
  services: string[];
  totalCost: number;
  description: string;
}
