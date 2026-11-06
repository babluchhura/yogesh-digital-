import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Service,
  Appointment,
  User,
  ScheduleConfig,
  NotificationItem,
  ContactInquiry,
  BookingFormData,
  AppointmentStatus,
} from '../types';
import {
  INITIAL_SERVICES,
  INITIAL_APPOINTMENTS,
  INITIAL_USERS,
  INITIAL_SCHEDULE_CONFIG,
  INITIAL_NOTIFICATIONS,
} from '../data/initialData';
import {
  generateBookingId,
  isSlotDoubleBooked,
  validateBookingForm,
  authenticateUser,
  ADMIN_CREDENTIALS,
} from '../utils/bookingLogic';

export interface EmailDispatchRecord {
  id: string;
  recipientEmail: string;
  recipientName: string;
  subject: string;
  templateType: 'booking_confirmed' | 'appointment_reminder' | 'booking_cancelled' | 'booking_rescheduled' | 'admin_alert';
  appointment: Appointment;
  sentAt: string;
}

interface AppContextType {
  // Services
  services: Service[];
  addService: (service: Omit<Service, 'id'>) => Service;
  updateService: (id: string, updates: Partial<Service>) => void;
  deleteService: (id: string) => void;

  // Appointments
  appointments: Appointment[];
  bookAppointment: (data: BookingFormData) => { success: boolean; appointment?: Appointment; error?: string };
  updateAppointmentStatus: (id: string, status: AppointmentStatus, rejectionReason?: string) => void;
  rescheduleAppointment: (id: string, newDate: string, newTimeSlot: string) => { success: boolean; error?: string };
  cancelAppointment: (id: string, reason?: string) => { success: boolean; error?: string };

  // Schedule & Slots
  scheduleConfig: ScheduleConfig;
  toggleDateBlock: (date: string) => void;
  updateDefaultSlots: (slots: string[]) => void;
  setCustomDateSlots: (date: string, slots: string[]) => void;

  // Users & Auth
  users: User[];
  currentUser: User | null;
  isAdmin: boolean;
  login: (identifier: string, pass: string) => { success: boolean; error?: string };
  loginWithGoogle: (accountOverride?: { email: string; name: string; avatar?: string }) => void;
  register: (name: string, email: string, phone: string, pass: string) => { success: boolean; error?: string };
  logout: () => void;
  updateProfile: (data: { name: string; phone: string; email?: string; avatar?: string }) => void;

  // Notifications
  notifications: NotificationItem[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  // Email simulation
  emailLogs: EmailDispatchRecord[];
  activeEmailPreview: EmailDispatchRecord | null;
  setActiveEmailPreview: (record: EmailDispatchRecord | null) => void;

  // Contact inquiries
  contactInquiries: ContactInquiry[];
  submitContactInquiry: (data: { name: string; email: string; phone: string; message: string }) => { success: boolean; error?: string };

  // Navigation & Modals
  currentView: 'home' | 'customer_dashboard' | 'admin_dashboard';
  setCurrentView: (view: 'home' | 'customer_dashboard' | 'admin_dashboard') => void;
  isBookingModalOpen: boolean;
  selectedServiceForBooking: Service | null;
  openBookingModal: (serviceId?: string) => void;
  closeBookingModal: () => void;
  isAuthModalOpen: boolean;
  authModalTab: 'login' | 'register' | 'forgot';
  openAuthModal: (tab?: 'login' | 'register' | 'forgot') => void;
  closeAuthModal: () => void;

  // Toast message
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;

  // Reset demo data
  resetAllData: () => void;
}

const STORAGE_KEYS = {
  SERVICES: 'sab_services_v1',
  APPOINTMENTS: 'sab_appointments_v1',
  USERS: 'sab_users_v1',
  CURRENT_USER: 'sab_current_user_v1',
  SCHEDULE: 'sab_schedule_v1',
  NOTIFICATIONS: 'sab_notifications_v1',
  EMAIL_LOGS: 'sab_email_logs_v1',
  INQUIRIES: 'sab_inquiries_v1',
};

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Services State
  const [services, setServices] = useState<Service[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SERVICES);
      return saved ? JSON.parse(saved) : INITIAL_SERVICES;
    } catch {
      return INITIAL_SERVICES;
    }
  });

  // Appointments State
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
      return saved ? JSON.parse(saved) : INITIAL_APPOINTMENTS;
    } catch {
      return INITIAL_APPOINTMENTS;
    }
  });

  // Schedule Config
  const [scheduleConfig, setScheduleConfig] = useState<ScheduleConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SCHEDULE);
      return saved ? JSON.parse(saved) : INITIAL_SCHEDULE_CONFIG;
    } catch {
      return INITIAL_SCHEDULE_CONFIG;
    }
  });

  // Users
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USERS);
      return saved ? JSON.parse(saved) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  });

  // Current User (defaults to pre-logged in customer for instant demo richness, or null)
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.email === 'yogeshchhura@gmail.com' || parsed.email === 'yogeshchhura@00') {
          return { ...parsed, avatar: '/assets/aistudio/20261105_130008_fb835139.jpg' };
        }
        return parsed;
      }
      return INITIAL_USERS[2];
    } catch {
      return INITIAL_USERS[2];
    }
  });

  // Notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  // Email logs
  const [emailLogs, setEmailLogs] = useState<EmailDispatchRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EMAIL_LOGS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Contact inquiries
  const [contactInquiries, setContactInquiries] = useState<ContactInquiry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.INQUIRIES);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // UI Navigation & Modals
  const [currentView, setCurrentView] = useState<'home' | 'customer_dashboard' | 'admin_dashboard'>('home');
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedServiceForBooking, setSelectedServiceForBooking] = useState<Service | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register' | 'forgot'>('login');
  const [activeEmailPreview, setActiveEmailPreview] = useState<EmailDispatchRecord | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services));
    } catch (e) {
      console.warn('Storage sync error', e);
    }
  }, [services]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
    } catch (e) {
      console.warn('Storage sync error', e);
    }
  }, [appointments]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SCHEDULE, JSON.stringify(scheduleConfig));
    } catch (e) {
      console.warn('Storage sync error', e);
    }
  }, [scheduleConfig]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    } catch (e) {
      console.warn('Storage sync error', e);
    }
  }, [users]);

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      }
    } catch (e) {
      console.warn('Storage sync error', e);
    }
  }, [currentUser]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    } catch (e) {
      console.warn('Storage sync error', e);
    }
  }, [notifications]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.EMAIL_LOGS, JSON.stringify(emailLogs));
    } catch (e) {
      console.warn('Storage sync error', e);
    }
  }, [emailLogs]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(contactInquiries));
    } catch (e) {
      console.warn('Storage sync error', e);
    }
  }, [contactInquiries]);

  // Toast auto-dismiss
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  }, []);

  // Helper to add notification and simulated email dispatch
  const recordEmailAndNotification = useCallback(
    (
      apt: Appointment,
      templateType: EmailDispatchRecord['templateType'],
      recipientEmail: string,
      recipientName: string,
      subject: string,
      notificationMessage: string,
      targetUserId?: string
    ) => {
      const emailRecord: EmailDispatchRecord = {
        id: 'email-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        recipientEmail,
        recipientName,
        subject,
        templateType,
        appointment: apt,
        sentAt: new Date().toISOString(),
      };

      setEmailLogs((prev) => [emailRecord, ...prev]);

      const notifItem: NotificationItem = {
        id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        userId: targetUserId,
        appointmentId: apt.id,
        type:
          templateType === 'booking_confirmed'
            ? 'booking_confirmation'
            : templateType === 'booking_cancelled'
            ? 'booking_cancellation'
            : templateType === 'appointment_reminder'
            ? 'appointment_reminder'
            : 'status_update',
        title: subject,
        message: notificationMessage,
        read: false,
        createdAt: new Date().toISOString(),
        recipientEmail,
      };

      setNotifications((prev) => [notifItem, ...prev]);
    },
    []
  );

  // Book appointment
  const bookAppointment = useCallback(
    (data: BookingFormData) => {
      const validation = validateBookingForm(data);
      if (!validation.isValid) {
        const firstErr = Object.values(validation.errors)[0];
        return { success: false, error: firstErr };
      }

      // Check double booking
      const isTaken = isSlotDoubleBooked(appointments, data.date, data.timeSlot);
      if (isTaken) {
        return {
          success: false,
          error: `The slot on ${data.date} at ${data.timeSlot} was just booked by another customer. Please select another slot.`,
        };
      }

      const service = services.find((s) => s.id === data.serviceId);
      if (!service) {
        return { success: false, error: 'Selected service could not be found.' };
      }

      const newId = generateBookingId(data.date);
      const newAppointment: Appointment = {
        id: newId,
        serviceId: service.id,
        serviceName: service.name,
        serviceCategory: service.category,
        servicePrice: service.price,
        durationMinutes: service.durationMinutes,
        date: data.date,
        timeSlot: data.timeSlot,
        customerName: data.customerName.trim(),
        customerEmail: data.customerEmail.trim(),
        customerPhone: data.customerPhone.trim(),
        notes: data.notes?.trim() || undefined,
        status: 'confirmed', // Auto-confirmed with instant slot locking
        userId: currentUser?.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setAppointments((prev) => [newAppointment, ...prev]);

      // Dispatch confirmation email to customer
      recordEmailAndNotification(
        newAppointment,
        'booking_confirmed',
        newAppointment.customerEmail,
        newAppointment.customerName,
        `Booking Confirmed! [${newAppointment.id}] ${newAppointment.serviceName}`,
        `Your appointment on ${newAppointment.date} at ${newAppointment.timeSlot} is confirmed with reference ${newAppointment.id}.`,
        currentUser?.id
      );

      // Notify admin
      recordEmailAndNotification(
        newAppointment,
        'admin_alert',
        'admin@smartbooking.com',
        'Admin Team',
        `New Booking Received: ${newAppointment.id}`,
        `${newAppointment.customerName} booked ${newAppointment.serviceName} for ${newAppointment.date} at ${newAppointment.timeSlot}.`,
        'user-admin'
      );

      showToast(`Appointment booked successfully! Reference: ${newId}`, 'success');
      return { success: true, appointment: newAppointment };
    },
    [appointments, services, currentUser, recordEmailAndNotification, showToast]
  );

  // Update appointment status (Admin action)
  const updateAppointmentStatus = useCallback(
    (id: string, newStatus: AppointmentStatus, rejectionReason?: string) => {
      setAppointments((prev) =>
        prev.map((apt) => {
          if (apt.id === id) {
            const updated: Appointment = {
              ...apt,
              status: newStatus,
              updatedAt: new Date().toISOString(),
              rejectionReason: newStatus === 'cancelled' ? rejectionReason : undefined,
            };

            const statusSubject =
              newStatus === 'confirmed'
                ? `Booking Approved: ${apt.id}`
                : newStatus === 'cancelled'
                ? `Booking Declined / Cancelled: ${apt.id}`
                : `Booking Status Updated: ${apt.id} (${newStatus.toUpperCase()})`;

            recordEmailAndNotification(
              updated,
              newStatus === 'cancelled' ? 'booking_cancelled' : 'booking_confirmed',
              apt.customerEmail,
              apt.customerName,
              statusSubject,
              newStatus === 'cancelled'
                ? `Your booking ${apt.id} was cancelled. ${rejectionReason ? `Reason: ${rejectionReason}` : ''}`
                : `Your booking ${apt.id} status is now ${newStatus}.`,
              apt.userId
            );

            return updated;
          }
          return apt;
        })
      );
      showToast(`Booking ${id} status updated to ${newStatus}.`, 'info');
    },
    [recordEmailAndNotification, showToast]
  );

  // Reschedule appointment
  const rescheduleAppointment = useCallback(
    (id: string, newDate: string, newTimeSlot: string) => {
      const apt = appointments.find((a) => a.id === id);
      if (!apt) return { success: false, error: 'Appointment not found.' };

      // Check double booking for new slot (excluding this appointment)
      const isTaken = isSlotDoubleBooked(appointments, newDate, newTimeSlot, id);
      if (isTaken) {
        return { success: false, error: 'The requested slot is already booked. Please pick another slot.' };
      }

      setAppointments((prev) =>
        prev.map((a) => {
          if (a.id === id) {
            const updated: Appointment = {
              ...a,
              date: newDate,
              timeSlot: newTimeSlot,
              status: 'confirmed',
              updatedAt: new Date().toISOString(),
              rescheduledFrom: {
                date: a.date,
                timeSlot: a.timeSlot,
              },
            };

            recordEmailAndNotification(
              updated,
              'booking_rescheduled',
              a.customerEmail,
              a.customerName,
              `Appointment Rescheduled: ${a.id}`,
              `Your appointment has been successfully rescheduled to ${newDate} at ${newTimeSlot}.`,
              a.userId
            );

            return updated;
          }
          return a;
        })
      );

      showToast(`Appointment ${id} successfully rescheduled to ${newDate} at ${newTimeSlot}!`, 'success');
      return { success: true };
    },
    [appointments, recordEmailAndNotification, showToast]
  );

  // Cancel appointment
  const cancelAppointment = useCallback(
    (id: string, reason?: string) => {
      const apt = appointments.find((a) => a.id === id);
      if (!apt) return { success: false, error: 'Appointment not found.' };

      setAppointments((prev) =>
        prev.map((a) => {
          if (a.id === id) {
            const updated: Appointment = {
              ...a,
              status: 'cancelled',
              updatedAt: new Date().toISOString(),
              rejectionReason: reason || 'Cancelled by user',
            };

            recordEmailAndNotification(
              updated,
              'booking_cancelled',
              a.customerEmail,
              a.customerName,
              `Booking Cancelled: ${a.id}`,
              `Your appointment for ${a.serviceName} on ${a.date} at ${a.timeSlot} has been cancelled.`,
              a.userId
            );

            return updated;
          }
          return a;
        })
      );

      showToast(`Appointment ${id} has been cancelled. Time slot is now freed.`, 'info');
      return { success: true };
    },
    [appointments, recordEmailAndNotification, showToast]
  );

  // Services CRUD
  const addService = useCallback((data: Omit<Service, 'id'>) => {
    const newService: Service = {
      ...data,
      id: 'srv-' + (Date.now().toString(36)),
    };
    setServices((prev) => [newService, ...prev]);
    showToast(`Service "${newService.name}" created successfully!`, 'success');
    return newService;
  }, [showToast]);

  const updateService = useCallback((id: string, updates: Partial<Service>) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
    showToast('Service details updated.', 'success');
  }, [showToast]);

  const deleteService = useCallback((id: string) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
    showToast('Service removed.', 'info');
  }, [showToast]);

  // Schedule management
  const toggleDateBlock = useCallback((date: string) => {
    setScheduleConfig((prev) => {
      const isBlocked = prev.blockedDates.includes(date);
      const nextBlocked = isBlocked
        ? prev.blockedDates.filter((d) => d !== date)
        : [...prev.blockedDates, date];
      return { ...prev, blockedDates: nextBlocked };
    });
    showToast('Schedule availability updated.', 'info');
  }, [showToast]);

  const updateDefaultSlots = useCallback((slots: string[]) => {
    setScheduleConfig((prev) => ({ ...prev, defaultTimeSlots: slots }));
    showToast('Default time slots updated.', 'success');
  }, [showToast]);

  const setCustomDateSlots = useCallback((date: string, slots: string[]) => {
    setScheduleConfig((prev) => ({
      ...prev,
      customDateSlots: {
        ...prev.customDateSlots,
        [date]: slots,
      },
    }));
    showToast(`Custom slots saved for ${date}.`, 'success');
  }, [showToast]);

  // Auth
  const login = useCallback(
    (identifier: string, pass: string) => {
      const authResult = authenticateUser(users, identifier, pass);
      if (!authResult.success || !authResult.user) {
        return { success: false, error: authResult.error || 'Invalid credentials.' };
      }

      const authenticatedUser = authResult.user;
      setCurrentUser(authenticatedUser);
      setIsAuthModalOpen(false);

      if (authenticatedUser.role === 'admin') {
        setCurrentView('admin_dashboard');
        showToast(`Administrator logged in. Welcome, ${authenticatedUser.name.split(' ')[0]}!`, 'success');
      } else {
        setCurrentView('customer_dashboard');
        showToast(`Welcome back, ${authenticatedUser.name}!`, 'success');
      }

      return { success: true };
    },
    [users, showToast]
  );

  const loginWithGoogle = useCallback(
    (accountOverride?: { email: string; name: string; avatar?: string }) => {
      const targetEmail = (accountOverride?.email || 'yogeshchhura@gmail.com').trim().toLowerCase();
      const targetName = accountOverride?.name || 'Yogesh Chhura';
      const targetAvatar =
        accountOverride?.avatar ||
        '/assets/aistudio/20261105_130008_fb835139.jpg';

      const existing = users.find((u) => u.email.toLowerCase() === targetEmail);
      let googleUser: User;

      if (existing) {
        googleUser = {
          ...existing,
          authProvider: 'google',
          avatar: targetAvatar,
        };
        setUsers((prev) => prev.map((u) => (u.id === existing.id ? googleUser : u)));
      } else {
        googleUser = {
          id: 'user-google-' + Date.now().toString(36),
          name: targetName,
          email: targetEmail,
          phone: '+1 555-0199',
          role: 'customer',
          avatar: targetAvatar,
          createdAt: new Date().toISOString(),
          authProvider: 'google',
        };
        setUsers((prev) => [...prev, googleUser]);
      }

      setCurrentUser(googleUser);
      setIsAuthModalOpen(false);
      showToast(`Signed in with Google as ${googleUser.email}!`, 'success');
    },
    [users, showToast]
  );

  const register = useCallback(
    (name: string, email: string, phone: string, pass: string) => {
      const normalized = email.trim().toLowerCase();
      if (!name || name.trim().length < 2) {
        return { success: false, error: 'Full name is required (min 2 characters).' };
      }
      if (!email.includes('@') || !email.includes('.')) {
        return { success: false, error: 'A valid email address is required.' };
      }
      if (!phone || phone.trim().length < 7) {
        return { success: false, error: 'A valid phone number is required.' };
      }
      if (!pass || pass.length < 5) {
        return { success: false, error: 'Password must be at least 5 characters.' };
      }

      const existing = users.find((u) => u.email.toLowerCase() === normalized);
      if (existing) {
        return { success: false, error: 'An account with this email already exists. Please log in.' };
      }

      const newUser: User = {
        id: 'user-' + Date.now().toString(36),
        name: name.trim(),
        email: normalized,
        phone: phone.trim(),
        role: normalized.includes('admin') ? 'admin' : 'customer',
        createdAt: new Date().toISOString(),
      };

      setUsers((prev) => [...prev, newUser]);
      setCurrentUser(newUser);
      setIsAuthModalOpen(false);
      showToast(`Account registered! Welcome, ${newUser.name}.`, 'success');

      if (newUser.role === 'admin') {
        setCurrentView('admin_dashboard');
      } else {
        setCurrentView('customer_dashboard');
      }

      return { success: true };
    },
    [users, showToast]
  );

  const logout = useCallback(() => {
    setCurrentUser(null);
    setCurrentView('home');
    showToast('You have been signed out.', 'info');
  }, [showToast]);

  const updateProfile = useCallback(
    (data: { name: string; phone: string; email?: string; avatar?: string }) => {
      if (!currentUser) return;
      const oldEmail = currentUser.email;
      const newEmail = data.email?.trim() || currentUser.email;

      const updatedUser: User = {
        ...currentUser,
        name: data.name.trim() || currentUser.name,
        phone: data.phone.trim() || currentUser.phone,
        email: newEmail,
        avatar: data.avatar || currentUser.avatar,
      };

      setCurrentUser(updatedUser);
      setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));

      // If email changed, also update appointments customerEmail so booking history is preserved
      if (oldEmail && newEmail && oldEmail.toLowerCase() !== newEmail.toLowerCase()) {
        setAppointments((prev) =>
          prev.map((apt) =>
            apt.customerEmail.toLowerCase() === oldEmail.toLowerCase()
              ? { ...apt, customerEmail: newEmail, customerName: updatedUser.name }
              : apt
          )
        );
      }

      showToast('Profile updated successfully!', 'success');
    },
    [currentUser, showToast]
  );

  // Notifications
  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('All notifications marked as read.', 'info');
  }, [showToast]);

  // Contact Inquiries
  const submitContactInquiry = useCallback(
    (data: { name: string; email: string; phone: string; message: string }) => {
      if (!data.name || !data.email || !data.message) {
        return { success: false, error: 'Please fill in all required fields.' };
      }

      const inquiry: ContactInquiry = {
        id: 'inq-' + Date.now().toString(36),
        name: data.name.trim(),
        email: data.email.trim(),
        phone: data.phone.trim(),
        message: data.message.trim(),
        createdAt: new Date().toISOString(),
        status: 'unread',
      };

      setContactInquiries((prev) => [inquiry, ...prev]);

      // Notify admin
      const adminNotif: NotificationItem = {
        id: 'notif-inq-' + Date.now(),
        userId: 'user-admin',
        type: 'system',
        title: `New Inquiry from ${inquiry.name}`,
        message: inquiry.message.substring(0, 100) + '...',
        read: false,
        createdAt: new Date().toISOString(),
        recipientEmail: 'admin@smartbooking.com',
      };
      setNotifications((prev) => [adminNotif, ...prev]);

      showToast('Your message has been sent! Our support team will get back to you shortly.', 'success');
      return { success: true };
    },
    [showToast]
  );

  // Modals
  const openBookingModal = useCallback(
    (serviceId?: string) => {
      if (serviceId) {
        const found = services.find((s) => s.id === serviceId);
        setSelectedServiceForBooking(found || null);
      } else {
        setSelectedServiceForBooking(null);
      }
      setIsBookingModalOpen(true);
    },
    [services]
  );

  const closeBookingModal = useCallback(() => {
    setIsBookingModalOpen(false);
    setSelectedServiceForBooking(null);
  }, []);

  const openAuthModal = useCallback((tab: 'login' | 'register' | 'forgot' = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  // Reset demo data
  const resetAllData = useCallback(() => {
    setServices(INITIAL_SERVICES);
    setAppointments(INITIAL_APPOINTMENTS);
    setUsers(INITIAL_USERS);
    setCurrentUser(INITIAL_USERS[1]);
    setScheduleConfig(INITIAL_SCHEDULE_CONFIG);
    setNotifications(INITIAL_NOTIFICATIONS);
    setEmailLogs([]);
    setContactInquiries([]);
    setCurrentView('home');
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
    showToast('Demo data successfully reset to initial state.', 'info');
  }, [showToast]);

  const isAdmin = currentUser?.role === 'admin';

  return (
    <AppContext.Provider
      value={{
        services,
        addService,
        updateService,
        deleteService,
        appointments,
        bookAppointment,
        updateAppointmentStatus,
        rescheduleAppointment,
        cancelAppointment,
        scheduleConfig,
        toggleDateBlock,
        updateDefaultSlots,
        setCustomDateSlots,
        users,
        currentUser,
        isAdmin,
        login,
        loginWithGoogle,
        register,
        logout,
        updateProfile,
        notifications,
        markNotificationRead,
        markAllNotificationsRead,
        emailLogs,
        activeEmailPreview,
        setActiveEmailPreview,
        contactInquiries,
        submitContactInquiry,
        currentView,
        setCurrentView,
        isBookingModalOpen,
        selectedServiceForBooking,
        openBookingModal,
        closeBookingModal,
        isAuthModalOpen,
        authModalTab,
        openAuthModal,
        closeAuthModal,
        toast,
        showToast,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
