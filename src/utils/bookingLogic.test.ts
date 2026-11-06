import test from 'node:test';
import assert from 'node:assert/strict';
import {
  generateBookingId,
  isValidEmail,
  isValidPhone,
  isSlotDoubleBooked,
  getAvailableSlotsForDate,
  validateBookingForm,
  calculateDashboardStats,
  filterAppointments,
  authenticateUser,
  formatINR,
  ADMIN_CREDENTIALS,
} from './bookingLogic';
import { Appointment, ScheduleConfig, User } from '../types';

const mockAppointments: Appointment[] = [
  {
    id: 'SAB-2026-AAA01',
    serviceId: 'srv-1',
    serviceName: 'General Consultation',
    serviceCategory: 'Consultation',
    servicePrice: 120,
    durationMinutes: 45,
    date: '2026-11-10',
    timeSlot: '10:00 AM',
    customerName: 'Sarah Jenkins',
    customerEmail: 'sarah@example.com',
    customerPhone: '+1 555-0101',
    status: 'confirmed',
    createdAt: '2026-11-01T10:00:00Z',
    updatedAt: '2026-11-01T10:00:00Z',
  },
  {
    id: 'SAB-2026-BBB02',
    serviceId: 'srv-2',
    serviceName: 'Executive Health Check',
    serviceCategory: 'Health & Wellness',
    servicePrice: 250,
    durationMinutes: 60,
    date: '2026-11-10',
    timeSlot: '11:00 AM',
    customerName: 'Michael Chang',
    customerEmail: 'michael@example.com',
    customerPhone: '+1 555-0102',
    status: 'cancelled', // Cancelled booking should NOT block slot
    createdAt: '2026-11-02T10:00:00Z',
    updatedAt: '2026-11-03T10:00:00Z',
  },
  {
    id: 'SAB-2026-CCC03',
    serviceId: 'srv-1',
    serviceName: 'General Consultation',
    serviceCategory: 'Consultation',
    servicePrice: 120,
    durationMinutes: 45,
    date: '2026-11-10',
    timeSlot: '02:00 PM',
    customerName: 'Emma Watson',
    customerEmail: 'emma@example.com',
    customerPhone: '+1 555-0103',
    status: 'pending',
    createdAt: '2026-11-03T10:00:00Z',
    updatedAt: '2026-11-03T10:00:00Z',
  },
];

const mockScheduleConfig: ScheduleConfig = {
  defaultTimeSlots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM'],
  blockedDates: ['2026-11-15'],
  customDateSlots: {
    '2026-11-20': ['01:00 PM', '02:00 PM'],
  },
  workingDays: [1, 2, 3, 4, 5], // Mon-Fri
};

test('generateBookingId generates properly formatted ID', () => {
  const id = generateBookingId('2026-11-10');
  assert.match(id, /^SAB-2026-[A-Z0-9]{5}$/);
});

test('email and phone validators validate correct inputs', () => {
  assert.equal(isValidEmail('user@test.com'), true);
  assert.equal(isValidEmail('invalid-email'), false);
  assert.equal(isValidEmail(''), false);

  assert.equal(isValidPhone('+1 555-123-4567'), true);
  assert.equal(isValidPhone('1234567'), true);
  assert.equal(isValidPhone('abc'), false);
  assert.equal(isValidPhone('123'), false); // Too short
});

test('isSlotDoubleBooked prevents double booking for confirmed and pending slots', () => {
  // 10:00 AM is confirmed -> booked
  assert.equal(isSlotDoubleBooked(mockAppointments, '2026-11-10', '10:00 AM'), true);

  // 11:00 AM is cancelled -> NOT booked, available for other users
  assert.equal(isSlotDoubleBooked(mockAppointments, '2026-11-10', '11:00 AM'), false);

  // 02:00 PM is pending -> booked
  assert.equal(isSlotDoubleBooked(mockAppointments, '2026-11-10', '02:00 PM'), true);

  // 03:00 PM is unbooked -> available
  assert.equal(isSlotDoubleBooked(mockAppointments, '2026-11-10', '03:00 PM'), false);

  // Exclude current appointment (for rescheduling flow)
  assert.equal(
    isSlotDoubleBooked(mockAppointments, '2026-11-10', '10:00 AM', 'SAB-2026-AAA01'),
    false
  );
});

test('getAvailableSlotsForDate correctly handles blocked dates and booked slots', () => {
  // Blocked date should return empty slots
  const blockedSlots = getAvailableSlotsForDate(mockScheduleConfig, mockAppointments, '2026-11-15');
  assert.equal(blockedSlots.length, 0);

  // 2026-11-10 (Tuesday) has 5 default slots; 10:00 AM and 02:00 PM should be unavailable
  const normalSlots = getAvailableSlotsForDate(mockScheduleConfig, mockAppointments, '2026-11-10');
  assert.equal(normalSlots.length, 5);

  const slot10am = normalSlots.find((s) => s.slot === '10:00 AM');
  assert.equal(slot10am?.available, false);

  const slot11am = normalSlots.find((s) => s.slot === '11:00 AM');
  assert.equal(slot11am?.available, true); // Cancelled apt freed the slot

  const slot3pm = normalSlots.find((s) => s.slot === '03:00 PM');
  assert.equal(slot3pm?.available, true);
});

test('validateBookingForm detects missing or invalid fields', () => {
  const invalid = validateBookingForm({
    serviceId: '',
    date: '',
    timeSlot: '',
    customerName: '',
    customerEmail: 'notanemail',
    customerPhone: '',
    notes: '',
  });

  assert.equal(invalid.isValid, false);
  assert.ok(invalid.errors.serviceId);
  assert.ok(invalid.errors.date);
  assert.ok(invalid.errors.timeSlot);
  assert.ok(invalid.errors.customerName);
  assert.ok(invalid.errors.customerEmail);

  // Valid future booking
  const valid = validateBookingForm({
    serviceId: 'srv-1',
    date: '2026-12-01',
    timeSlot: '10:00 AM',
    customerName: 'Alex Mercer',
    customerEmail: 'alex@example.com',
    customerPhone: '+1 234-567-8901',
    notes: 'First time consultation',
  });

  assert.equal(valid.isValid, true);
  assert.equal(Object.keys(valid.errors).length, 0);
});

test('calculateDashboardStats calculates revenue and counts properly', () => {
  const stats = calculateDashboardStats(mockAppointments);
  assert.equal(stats.total, 3);
  assert.equal(stats.confirmed, 1);
  assert.equal(stats.pending, 1);
  assert.equal(stats.cancelled, 1);
  // Revenue should sum confirmed and pending (120 + 120 = 240, cancelled excluded)
  assert.equal(stats.totalRevenue, 240);
});

test('filterAppointments accurately matches search query and status', () => {
  const sarahOnly = filterAppointments(mockAppointments, { search: 'Sarah' });
  assert.equal(sarahOnly.length, 1);
  assert.equal(sarahOnly[0].id, 'SAB-2026-AAA01');

  const pendingOnly = filterAppointments(mockAppointments, { status: 'pending' });
  assert.equal(pendingOnly.length, 1);
  assert.equal(pendingOnly[0].id, 'SAB-2026-CCC03');

  const byEmail = filterAppointments(mockAppointments, { customerEmail: 'michael@example.com' });
  assert.equal(byEmail.length, 1);
});

test('authenticateUser validates admin username and password correctly', () => {
  const users: User[] = [
    {
      id: 'user-admin',
      name: 'Yogesh Chhura (Admin)',
      email: 'yogeshchhura@00',
      phone: '+1 555-0100',
      role: 'admin',
      password: 'yogeshchhura@00',
      createdAt: '2026-01-01T00:00:00Z',
    },
    {
      id: 'user-cust',
      name: 'Sarah Jenkins',
      email: 'sarah@example.com',
      phone: '+1 555-0101',
      role: 'customer',
      password: 'customer123',
      createdAt: '2026-01-01T00:00:00Z',
    },
  ];

  // Correct admin login
  const validAdmin = authenticateUser(users, 'yogeshchhura@00', 'yogeshchhura@00');
  assert.equal(validAdmin.success, true);
  assert.equal(validAdmin.user?.role, 'admin');

  // Wrong admin password
  const wrongPass = authenticateUser(users, 'yogeshchhura@00', 'wrongpassword');
  assert.equal(wrongPass.success, false);
  assert.match(wrongPass.error || '', /Incorrect administrator password/);

  // Client cannot masquerade with empty or wrong password
  const wrongUser = authenticateUser(users, 'unknown@example.com', '12345');
  assert.equal(wrongUser.success, false);

  // Valid customer login
  const validCust = authenticateUser(users, 'sarah@example.com', 'customer123');
  assert.equal(validCust.success, true);
  assert.equal(validCust.user?.role, 'customer');
});

test('formatINR formats currency in Indian Rupees with symbol', () => {
  assert.equal(formatINR(1499), '₹1,499');
  assert.equal(formatINR(25000), '₹25,000');
  assert.equal(formatINR(0), '₹0');
});
