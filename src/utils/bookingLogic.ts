import { Appointment, BookingFormData, ScheduleConfig, User } from '../types';

/**
 * Generate a unique, professional booking ID format: SAB-YYYY-XXXXX
 */
export function generateBookingId(dateStr?: string): string {
  const year = dateStr ? new Date(dateStr).getFullYear() || new Date().getFullYear() : new Date().getFullYear();
  const randomChars = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `SAB-${year}-${randomChars}`;
}

/**
 * Validates whether an email format is valid
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email.trim());
}

/**
 * Validates a mobile phone number (allows standard international and local formats)
 */
export function isValidPhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') return false;
  const cleaned = phone.replace(/[\s\-\(\)\+\.]/g, '');
  return cleaned.length >= 7 && cleaned.length <= 16 && /^\d+$/.test(cleaned);
}

/**
 * Checks if a specific date and time slot is already booked (preventing double booking)
 * Cancelled appointments do NOT block slots.
 */
export function isSlotDoubleBooked(
  appointments: Appointment[],
  date: string,
  timeSlot: string,
  excludeAppointmentId?: string
): boolean {
  if (!date || !timeSlot) return false;

  return appointments.some((apt) => {
    if (excludeAppointmentId && apt.id === excludeAppointmentId) {
      return false;
    }
    // Only pending and confirmed bookings block the slot
    const isActiveBooking = apt.status === 'confirmed' || apt.status === 'pending';
    return (
      apt.date === date &&
      apt.timeSlot.trim().toLowerCase() === timeSlot.trim().toLowerCase() &&
      isActiveBooking
    );
  });
}

/**
 * Get available slots for a given date considering defaults, custom overrides, blocked dates, and existing bookings
 */
export function getAvailableSlotsForDate(
  config: ScheduleConfig,
  appointments: Appointment[],
  date: string,
  excludeAppointmentId?: string
): { slot: string; available: boolean; reason?: string }[] {
  if (!date) return [];

  // Check if entire date is blocked
  if (config.blockedDates.includes(date)) {
    return [];
  }

  // Check day of week
  const dateObj = new Date(date + 'T00:00:00');
  const dayOfWeek = dateObj.getDay();
  if (config.workingDays && !config.workingDays.includes(dayOfWeek)) {
    return [];
  }

  // Determine base slots for this date
  const baseSlots = config.customDateSlots[date] || config.defaultTimeSlots;

  return baseSlots.map((slot) => {
    const isBooked = isSlotDoubleBooked(appointments, date, slot, excludeAppointmentId);
    return {
      slot,
      available: !isBooked,
      reason: isBooked ? 'Slot already reserved' : undefined,
    };
  });
}

/**
 * Validates the entire booking form
 */
export function validateBookingForm(data: BookingFormData): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  if (!data.serviceId || data.serviceId.trim() === '') {
    errors.serviceId = 'Please select an appointment service.';
  }

  if (!data.date || data.date.trim() === '') {
    errors.date = 'Please select an appointment date.';
  } else {
    // Check if date is in the past
    const selected = new Date(data.date + 'T23:59:59');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selected < today) {
      errors.date = 'Appointment date cannot be in the past.';
    }
  }

  if (!data.timeSlot || data.timeSlot.trim() === '') {
    errors.timeSlot = 'Please select a preferred time slot.';
  }

  if (!data.customerName || data.customerName.trim().length < 2) {
    errors.customerName = 'Please enter your full name (at least 2 characters).';
  }

  if (!isValidEmail(data.customerEmail)) {
    errors.customerEmail = 'Please provide a valid email address.';
  }

  if (!isValidPhone(data.customerPhone)) {
    errors.customerPhone = 'Please provide a valid phone number (min 7 digits).';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Computes dashboard statistics from appointments
 */
export function calculateDashboardStats(appointments: Appointment[]) {
  const total = appointments.length;
  let pending = 0;
  let confirmed = 0;
  let completed = 0;
  let cancelled = 0;
  let totalRevenue = 0;

  const todayStr = new Date().toISOString().split('T')[0];
  let todayCount = 0;

  for (const apt of appointments) {
    if (apt.status === 'pending') pending++;
    else if (apt.status === 'confirmed') confirmed++;
    else if (apt.status === 'completed') completed++;
    else if (apt.status === 'cancelled') cancelled++;

    if (apt.status !== 'cancelled') {
      totalRevenue += apt.servicePrice || 0;
    }

    if (apt.date === todayStr && apt.status !== 'cancelled') {
      todayCount++;
    }
  }

  const completionRate =
    total > 0 ? Math.round((completed / (total - cancelled || 1)) * 100) : 100;

  return {
    total,
    pending,
    confirmed,
    completed,
    cancelled,
    totalRevenue,
    todayCount,
    completionRate,
  };
}

/**
 * Filter & search appointments by criteria
 */
export function filterAppointments(
  appointments: Appointment[],
  filters: {
    status?: string;
    search?: string;
    date?: string;
    customerEmail?: string;
  }
): Appointment[] {
  return appointments.filter((apt) => {
    // Status filter
    if (filters.status && filters.status !== 'all' && apt.status !== filters.status) {
      return false;
    }

    // Customer email filter (for personal dashboard)
    if (filters.customerEmail && apt.customerEmail.toLowerCase() !== filters.customerEmail.toLowerCase()) {
      return false;
    }

    // Specific date
    if (filters.date && apt.date !== filters.date) {
      return false;
    }

    // Search term
    if (filters.search && filters.search.trim() !== '') {
      const q = filters.search.toLowerCase().trim();
      const matchId = apt.id.toLowerCase().includes(q);
      const matchName = apt.customerName.toLowerCase().includes(q);
      const matchEmail = apt.customerEmail.toLowerCase().includes(q);
      const matchService = apt.serviceName.toLowerCase().includes(q);
      const matchPhone = apt.customerPhone.includes(q);

      if (!matchId && !matchName && !matchEmail && !matchService && !matchPhone) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Format date for friendly human reading
 */
export function formatDatePretty(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      return d.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}

export const ADMIN_CREDENTIALS = {
  username: 'yogeshchhura@00',
  password: 'yogeshchhura@00',
};

/**
 * Validates login credentials for users and administrator
 */
export function authenticateUser(
  users: User[],
  identifier: string,
  pass: string
): { success: boolean; user?: User; error?: string } {
  const normId = identifier.trim().toLowerCase();
  const trimmedPass = pass.trim();

  if (!normId) {
    return { success: false, error: 'Please enter your username or email.' };
  }
  if (!trimmedPass) {
    return { success: false, error: 'Please enter your password.' };
  }

  // Admin explicit login check:
  // Admin username is 'yogeshchhura@00'
  if (
    normId === 'yogeshchhura@00' ||
    (normId === 'yogeshchhura@gmail.com' && trimmedPass === ADMIN_CREDENTIALS.password)
  ) {
    if (trimmedPass === ADMIN_CREDENTIALS.password) {
      const existingAdmin = users.find(
        (u) => u.role === 'admin' || u.email.toLowerCase() === 'yogeshchhura@00'
      );
      const adminUser: User = existingAdmin || {
        id: 'user-admin',
        name: 'Yogesh Chhura (Admin)',
        email: 'yogeshchhura@00',
        phone: '+1 555-0100',
        role: 'admin',
        avatar: '/assets/aistudio/20261105_130008_fb835139.jpg',
        createdAt: new Date().toISOString(),
        authProvider: 'password',
      };
      return { success: true, user: adminUser };
    } else {
      return { success: false, error: 'Incorrect administrator password.' };
    }
  }

  // Standard user check by email
  const match = users.find((u) => u.email.toLowerCase() === normId);
  if (!match) {
    return { success: false, error: 'No account found with this username or email.' };
  }

  if (match.role === 'admin') {
    if (trimmedPass !== ADMIN_CREDENTIALS.password) {
      return { success: false, error: 'Incorrect administrator password.' };
    }
    return { success: true, user: match };
  }

  // Regular customer verification
  if (match.password && match.password !== trimmedPass) {
    return { success: false, error: 'Incorrect password entered.' };
  }
  if (!match.password && trimmedPass.length < 4) {
    return { success: false, error: 'Password must be at least 4 characters.' };
  }

  return { success: true, user: match };
}

/**
 * Format currency in Indian Rupees (INR / ₹) with standard Indian numbering system
 */
export function formatINR(amount: number): string {
  if (typeof amount !== 'number' || isNaN(amount)) return '₹0';
  return `₹${amount.toLocaleString('en-IN')}`;
}
