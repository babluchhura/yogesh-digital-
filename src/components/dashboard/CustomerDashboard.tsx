import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Appointment } from '../../types';
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  AlertCircle,
  CheckCircle,
  XCircle,
  RotateCcw,
  Download,
  Edit2,
  Save,
  PlusCircle,
  ExternalLink,
  ChevronRight,
  Shield,
  FileText,
} from 'lucide-react';
import {
  formatDatePretty,
  getAvailableSlotsForDate,
} from '../../utils/bookingLogic';

export const CustomerDashboard: React.FC = () => {
  const {
    currentUser,
    appointments,
    updateProfile,
    cancelAppointment,
    rescheduleAppointment,
    openBookingModal,
    scheduleConfig,
    setActiveEmailPreview,
    emailLogs,
    showToast,
    setCurrentView,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'upcoming' | 'history' | 'profile'>('upcoming');

  // Reschedule Modal State
  const [rescheduleTarget, setRescheduleTarget] = useState<Appointment | null>(null);
  const [newDate, setNewDate] = useState<string>('');
  const [newSlot, setNewSlot] = useState<string>('');
  const [rescheduleError, setRescheduleError] = useState<string | null>(null);

  // Cancel Modal State
  const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('');

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState<boolean>(false);
  const [profileName, setProfileName] = useState<string>(currentUser?.name || '');
  const [profileEmail, setProfileEmail] = useState<string>(currentUser?.email || 'yogeshchhura@gmail.com');
  const [profilePhone, setProfilePhone] = useState<string>(currentUser?.phone || '');

  // Keep state synchronized with active user
  React.useEffect(() => {
    if (currentUser) {
      setProfileName(currentUser.name);
      setProfileEmail(currentUser.email);
      setProfilePhone(currentUser.phone);
    }
  }, [currentUser]);

  // Filter appointments for this user (by email or userId)
  const userAppointments = appointments.filter((apt) => {
    if (!currentUser) return false;
    const matchEmail = apt.customerEmail.toLowerCase() === currentUser.email.toLowerCase();
    const matchId = apt.userId === currentUser.id;
    return matchEmail || matchId;
  });

  const todayStr = new Date().toISOString().split('T')[0];

  const upcomingAppointments = userAppointments.filter(
    (apt) => apt.date >= todayStr && apt.status !== 'cancelled' && apt.status !== 'completed'
  );

  const pastAppointments = userAppointments.filter(
    (apt) => apt.date < todayStr || apt.status === 'completed' || apt.status === 'cancelled'
  );

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) {
      showToast('Name cannot be empty.', 'error');
      return;
    }
    if (!profileEmail.trim() || !profileEmail.includes('@')) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }
    updateProfile({ name: profileName, phone: profilePhone, email: profileEmail });
    setIsEditingProfile(false);
  };

  const handleConfirmReschedule = () => {
    if (!rescheduleTarget || !newDate || !newSlot) {
      setRescheduleError('Please select both a new date and an available slot.');
      return;
    }

    const res = rescheduleAppointment(rescheduleTarget.id, newDate, newSlot);
    if (res.success) {
      setRescheduleTarget(null);
      setNewDate('');
      setNewSlot('');
      setRescheduleError(null);
    } else {
      setRescheduleError(res.error || 'Failed to reschedule.');
    }
  };

  const handleConfirmCancel = () => {
    if (!cancelTarget) return;
    cancelAppointment(cancelTarget.id, cancelReason);
    setCancelTarget(null);
    setCancelReason('');
  };

  const downloadReceipt = (apt: Appointment) => {
    const receiptText = `
========================================
    SMART APPOINTMENT BOOKING RECEIPT
========================================
Booking Reference: ${apt.id}
Date Issued: ${new Date().toLocaleString()}
Status: ${apt.status.toUpperCase()}

SERVICE DETAILS:
----------------------------------------
Service: ${apt.serviceName}
Category: ${apt.serviceCategory}
Scheduled Date: ${apt.date} (${formatDatePretty(apt.date)})
Time Slot: ${apt.timeSlot}
Duration: ${apt.durationMinutes} Minutes
Amount: $${apt.servicePrice} USD

CUSTOMER INFORMATION:
----------------------------------------
Name: ${apt.customerName}
Email: ${apt.customerEmail}
Phone: ${apt.customerPhone}
${apt.notes ? `Customer Notes: ${apt.notes}\n` : ''}
LOCATION & CONTACT:
----------------------------------------
Smart Appointment Booking Suite 400
742 Evergreen Plaza, New York, NY 10001
Phone: +1 (800) 555-APPT
Email: support@smartappointmentbooking.com

Thank you for choosing Smart Appointment Booking!
========================================
    `.trim();

    const blob = new Blob([receiptText], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `Receipt-${apt.id}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Receipt for ${apt.id} downloaded!`, 'success');
  };

  // Compute slots for reschedule date
  const rescheduleSlots = newDate
    ? getAvailableSlotsForDate(
        scheduleConfig,
        appointments,
        newDate,
        rescheduleTarget?.id
      )
    : [];

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Top Header Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <img
              src={currentUser?.avatar || '/assets/aistudio/20261105_130008_fb835139.jpg'}
              alt={currentUser?.name || 'Customer'}
              className="h-16 w-16 rounded-2xl object-cover ring-2 ring-indigo-100 shadow-sm"
            />
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-display text-2xl font-bold text-slate-900">
                  {currentUser?.name || 'Customer Portal'}
                </h1>
                <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
                  Customer
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{currentUser?.email}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <button
              onClick={() => openBookingModal()}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 transition-colors"
            >
              <PlusCircle className="mr-1.5 h-4 w-4" />
              <span>Book New Appointment</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-2 border-b border-slate-200 pb-1">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`flex items-center space-x-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'upcoming'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Calendar className="h-4 w-4" />
            <span>Upcoming Appointments</span>
            <span className={`ml-1.5 rounded-full px-2 py-0.5 text-[11px] ${
              activeTab === 'upcoming' ? 'bg-indigo-500 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {upcomingAppointments.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center space-x-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'history'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Clock className="h-4 w-4" />
            <span>Booking History</span>
            <span className={`ml-1.5 rounded-full px-2 py-0.5 text-[11px] ${
              activeTab === 'history' ? 'bg-indigo-500 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {pastAppointments.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center space-x-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'profile'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <User className="h-4 w-4" />
            <span>Edit Profile</span>
          </button>
        </div>

        {/* TAB 1: Upcoming Appointments */}
        {activeTab === 'upcoming' && (
          <div className="space-y-4">
            {upcomingAppointments.length === 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                  <Calendar className="h-7 w-7" />
                </div>
                <h3 className="font-display text-lg font-bold text-slate-900">
                  No Upcoming Appointments
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
                  You do not have any pending or confirmed sessions scheduled right now.
                </p>
                <button
                  onClick={() => openBookingModal()}
                  className="inline-flex items-center rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-indigo-700"
                >
                  <PlusCircle className="mr-1.5 h-4 w-4" />
                  Schedule Now
                </button>
              </div>
            ) : (
              upcomingAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs hover:shadow-md transition-shadow flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
                >
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg">
                        {apt.id}
                      </span>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase ${
                        apt.status === 'confirmed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {apt.status}
                      </span>
                      <span className="text-xs text-slate-400">
                        Booked on {new Date(apt.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="font-display text-lg font-bold text-slate-900">
                      {apt.serviceName}
                    </h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                      <span className="flex items-center font-medium">
                        <Calendar className="mr-1.5 h-4 w-4 text-indigo-600" />
                        {formatDatePretty(apt.date)}
                      </span>
                      <span className="flex items-center font-medium">
                        <Clock className="mr-1.5 h-4 w-4 text-indigo-600" />
                        {apt.timeSlot} ({apt.durationMinutes} mins)
                      </span>
                      <span className="font-semibold text-slate-900">
                        ${apt.servicePrice} USD
                      </span>
                    </div>

                    {apt.notes && (
                      <p className="text-xs text-slate-500 italic">
                        Note: "{apt.notes}"
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0">
                    <button
                      onClick={() => {
                        setRescheduleTarget(apt);
                        setNewDate(apt.date);
                        setNewSlot('');
                        setRescheduleError(null);
                      }}
                      className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
                    >
                      <RotateCcw className="mr-1.5 h-3.5 w-3.5 text-indigo-600" />
                      Reschedule
                    </button>

                    <button
                      onClick={() => {
                        setCancelTarget(apt);
                        setCancelReason('');
                      }}
                      className="inline-flex items-center rounded-xl border border-rose-200 bg-rose-50/50 px-3.5 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-colors"
                    >
                      <XCircle className="mr-1.5 h-3.5 w-3.5" />
                      Cancel
                    </button>

                    <button
                      onClick={() => downloadReceipt(apt)}
                      className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-xs"
                      title="Download text receipt"
                    >
                      <Download className="h-3.5 w-3.5 text-slate-500" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 2: Booking History */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            {pastAppointments.length === 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-500 text-xs sm:text-sm">
                No past appointment records found.
              </div>
            ) : (
              pastAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                        {apt.id}
                      </span>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase ${
                        apt.status === 'completed'
                          ? 'bg-blue-100 text-blue-800'
                          : apt.status === 'cancelled'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {apt.status}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-base">{apt.serviceName}</h4>
                    <p className="text-xs text-slate-500">
                      Scheduled for {formatDatePretty(apt.date)} at {apt.timeSlot} &bull; ${apt.servicePrice}
                    </p>

                    {apt.rejectionReason && (
                      <p className="text-xs text-rose-600 italic">
                        Cancellation note: {apt.rejectionReason}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => downloadReceipt(apt)}
                      className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
                    >
                      <Download className="mr-1.5 h-3.5 w-3.5 text-slate-500" />
                      Receipt
                    </button>
                    <button
                      onClick={() => openBookingModal(apt.serviceId)}
                      className="inline-flex items-center rounded-xl bg-indigo-50 px-3.5 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
                    >
                      Book Again
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 3: Edit Profile */}
        {activeTab === 'profile' && (
          <div className="rounded-3xl border border-slate-200 bg-white p-7 sm:p-9 shadow-xs max-w-xl">
            <h3 className="font-display text-lg font-bold text-slate-900 mb-4">
              Personal Profile & Preferences
            </h3>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3.5 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address (Primary Login)
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    placeholder="yogeshchhura@gmail.com"
                    className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3.5 py-2.5 text-sm font-medium text-slate-900 placeholder-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-xs"
                  />
                </div>
                <span className="text-[11px] text-slate-400">Email is linked to your booking history and notifications</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mobile / Contact Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="tel"
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3.5 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="inline-flex items-center rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-indigo-700 shadow-md shadow-indigo-600/20"
                >
                  <Save className="mr-1.5 h-4 w-4" />
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Reschedule Interactive Modal */}
      {rescheduleTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <RotateCcw className="h-5 w-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Reschedule Appointment {rescheduleTarget.id}
                </h3>
              </div>
              <button
                onClick={() => setRescheduleTarget(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            {rescheduleError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{rescheduleError}</span>
              </div>
            )}

            <div className="text-xs text-slate-600 space-y-1 bg-indigo-50/50 p-3 rounded-xl border border-indigo-100">
              <p><strong>Current Slot:</strong> {formatDatePretty(rescheduleTarget.date)} at {rescheduleTarget.timeSlot}</p>
              <p><strong>Service:</strong> {rescheduleTarget.serviceName}</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Choose New Date *
              </label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => {
                  setNewDate(e.target.value);
                  setNewSlot('');
                  setRescheduleError(null);
                }}
                min={new Date().toISOString().split('T')[0]}
                className="w-full rounded-xl border border-slate-200 p-2 text-sm text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Choose Available Time Slot *
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {rescheduleSlots.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    disabled={!item.available}
                    onClick={() => setNewSlot(item.slot)}
                    className={`rounded-xl p-2 text-xs font-semibold transition-all text-center ${
                      newSlot === item.slot
                        ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-600'
                        : item.available
                        ? 'bg-slate-50 border border-slate-200 text-slate-700 hover:border-indigo-400'
                        : 'bg-slate-100 text-slate-400 line-through cursor-not-allowed'
                    }`}
                  >
                    {item.slot}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRescheduleTarget(null)}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleConfirmReschedule}
                className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white hover:bg-indigo-700 shadow-sm"
              >
                Confirm Reschedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancellation Modal */}
      {cancelTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center space-x-2 text-rose-600">
              <AlertCircle className="h-5 w-5" />
              <h3 className="font-bold text-slate-900 text-sm">Cancel Appointment?</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to cancel your booking for <strong>{cancelTarget.serviceName}</strong> on <strong>{formatDatePretty(cancelTarget.date)} at {cancelTarget.timeSlot}</strong>? The time slot will immediately become available for other clients.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reason for Cancellation (Optional)
              </label>
              <textarea
                rows={2}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g. Schedule clash, unexpected travel, etc."
                className="w-full rounded-xl border border-slate-200 p-2 text-xs text-slate-900"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCancelTarget(null)}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Keep Appointment
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700 shadow-sm"
              >
                Yes, Cancel Slot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
