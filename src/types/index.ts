export type ServiceCategory =
  | 'All'
  | 'Consultation'
  | 'Health & Wellness'
  | 'Tech & Digital'
  | 'Legal & Finance'
  | 'Coaching & Lifestyle';

export interface Service {
  id: string;
  name: string;
  category: Exclude<ServiceCategory, 'All'>;
  durationMinutes: number;
  price: number;
  description: string;
  iconName: string;
  providerName: string;
  providerTitle: string;
  providerAvatar: string;
  popular?: boolean;
  isActive: boolean;
}

export type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'completed'
  | 'cancelled';

export interface Appointment {
  id: string; // e.g. SAB-2026-8921
  serviceId: string;
  serviceName: string;
  serviceCategory: string;
  servicePrice: number;
  durationMinutes: number;
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g. 10:00 AM
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  notes?: string;
  status: AppointmentStatus;
  userId?: string;
  createdAt: string;
  updatedAt: string;
  rejectionReason?: string;
  rescheduledFrom?: {
    date: string;
    timeSlot: string;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'admin';
  avatar?: string;
  createdAt: string;
  password?: string;
  authProvider?: 'google' | 'password';
}

export interface NotificationItem {
  id: string;
  userId?: string; // target user or 'admin'
  appointmentId?: string;
  type: 'booking_confirmation' | 'appointment_reminder' | 'booking_cancellation' | 'status_update' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  recipientEmail: string;
}

export interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  createdAt: string;
  status: 'unread' | 'read' | 'replied';
}

export interface ScheduleConfig {
  defaultTimeSlots: string[];
  blockedDates: string[]; // YYYY-MM-DD
  customDateSlots: Record<string, string[]>; // YYYY-MM-DD -> list of slots
  workingDays: number[]; // 0 = Sun, 1 = Mon ... 6 = Sat
}

export interface BookingFormData {
  serviceId: string;
  date: string;
  timeSlot: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  notes: string;
}
