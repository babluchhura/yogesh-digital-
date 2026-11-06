import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Service, BookingFormData, Appointment } from '../../types';
import {
  X,
  Calendar as CalendarIcon,
  Clock,
  User,
  Mail,
  Phone,
  FileText,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Download,
  Share2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import {
  getAvailableSlotsForDate,
  validateBookingForm,
  formatDatePretty,
} from '../../utils/bookingLogic';

export const BookingModal: React.FC = () => {
  const {
    isBookingModalOpen,
    closeBookingModal,
    services,
    selectedServiceForBooking,
    scheduleConfig,
    appointments,
    currentUser,
    bookAppointment,
    setActiveEmailPreview,
    emailLogs,
    setCurrentView,
  } = useApp();

  // Booking step: 1 = Service, 2 = Date & Slot, 3 = Customer Info, 4 = Confirmation
  const [step, setStep] = useState<number>(1);
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);

  // Form State
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [termsAgreed, setTermsAgreed] = useState<boolean>(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Calendar month state
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());

  // Initialize or reset when modal opens
  useEffect(() => {
    if (isBookingModalOpen) {
      if (selectedServiceForBooking) {
        setSelectedServiceId(selectedServiceForBooking.id);
        setStep(2); // Jump straight to date picker if service was preselected
      } else {
        setSelectedServiceId(services[0]?.id || '');
        setStep(1);
      }

      // Default date to tomorrow if not set
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      setSelectedDate(tomorrowStr);
      setCalendarMonth(new Date(tomorrow));
      setSelectedSlot('');
      setFormError(null);
      setConfirmedAppointment(null);

      // Prefill user details if logged in
      if (currentUser) {
        setCustomerName(currentUser.name);
        setCustomerEmail(currentUser.email);
        setCustomerPhone(currentUser.phone);
      } else {
        setCustomerName('');
        setCustomerEmail('');
        setCustomerPhone('');
      }
      setNotes('');
    }
  }, [isBookingModalOpen, selectedServiceForBooking, currentUser, services]);

  if (!isBookingModalOpen) return null;

  const currentService = services.find((s) => s.id === selectedServiceId);

  // Compute available slots for selected date
  const slotOptions = selectedDate
    ? getAvailableSlotsForDate(scheduleConfig, appointments, selectedDate)
    : [];

  // Generate calendar days for the current calendarMonth view
  const getDaysInMonth = () => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startingDayOfWeek = firstDay.getDay(); // 0 = Sun
    const totalDays = lastDay.getDate();

    const days: { dateStr: string; dayNum: number; isPast: boolean; isCurrentMonth: boolean }[] = [];

    const todayStr = new Date().toISOString().split('T')[0];

    // Padding for days before month start
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ dateStr: '', dayNum: 0, isPast: true, isCurrentMonth: false });
    }

    // Days of current month
    for (let d = 1; d <= totalDays; d++) {
      const monthStr = (month + 1).toString().padStart(2, '0');
      const dayStr = d.toString().padStart(2, '0');
      const dStr = `${year}-${monthStr}-${dayStr}`;
      const isPast = dStr < todayStr;
      days.push({
        dateStr: dStr,
        dayNum: d,
        isPast,
        isCurrentMonth: true,
      });
    }

    return days;
  };

  const handleNextMonth = () => {
    setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1));
  };

  const handlePrevMonth = () => {
    const prev = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1);
    const today = new Date();
    // Only allow if not navigating prior to current month
    if (prev.getFullYear() >= today.getFullYear() && (prev.getMonth() >= today.getMonth() || prev.getFullYear() > today.getFullYear())) {
      setCalendarMonth(prev);
    }
  };

  const handleConfirmBooking = () => {
    setFormError(null);

    if (!termsAgreed) {
      setFormError('Please agree to the booking and cancellation policy.');
      return;
    }

    const payload: BookingFormData = {
      serviceId: selectedServiceId,
      date: selectedDate,
      timeSlot: selectedSlot,
      customerName,
      customerEmail,
      customerPhone,
      notes,
    };

    const validation = validateBookingForm(payload);
    if (!validation.isValid) {
      const firstKey = Object.keys(validation.errors)[0];
      setFormError(validation.errors[firstKey]);
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const result = bookAppointment(payload);
      setIsSubmitting(false);

      if (result.success && result.appointment) {
        setConfirmedAppointment(result.appointment);
        setStep(4); // Success step
      } else {
        setFormError(result.error || 'Failed to reserve appointment slot.');
      }
    }, 400);
  };

  // Generate .ics calendar file for the customer
  const downloadIcsCalendar = () => {
    if (!confirmedAppointment) return;

    const apt = confirmedAppointment;
    const startHour = parseInt(apt.timeSlot.split(':')[0]) + (apt.timeSlot.includes('PM') && !apt.timeSlot.startsWith('12') ? 12 : 0);
    const startMin = parseInt(apt.timeSlot.split(':')[1]?.replace(/[^0-9]/g, '') || '0');

    const dtStart = apt.date.replace(/-/g, '') + 'T' + String(startHour).padStart(2, '0') + String(startMin).padStart(2, '0') + '00';
    const dtEnd = apt.date.replace(/-/g, '') + 'T' + String(startHour + 1).padStart(2, '0') + String(startMin).padStart(2, '0') + '00';

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Smart Appointment Booking//EN',
      'BEGIN:VEVENT',
      `UID:${apt.id}@smartappointmentbooking.com`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:${apt.serviceName} - Booking [${apt.id}]`,
      `DESCRIPTION:Appointment reservation with Smart Booking.\\nReference ID: ${apt.id}\\nCustomer: ${apt.customerName}`,
      'LOCATION:Smart Appointment Booking Suite 400',
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `appointment-${apt.id}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 px-6 py-4 text-white">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/30">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-base sm:text-lg font-bold">
                Smart Appointment Booking
              </h2>
              <p className="text-xs text-indigo-200">
                {step === 1 && 'Step 1 of 3: Select Service'}
                {step === 2 && 'Step 2 of 3: Pick Date & Time Slot'}
                {step === 3 && 'Step 3 of 3: Customer Information'}
                {step === 4 && 'Booking Confirmed!'}
              </p>
            </div>
          </div>

          <button
            onClick={closeBookingModal}
            className="rounded-full p-2 text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Step Progress Indicator (Steps 1 to 3) */}
        {step < 4 && (
          <div className="grid grid-cols-3 border-b border-slate-100 bg-slate-50 text-xs font-semibold text-center py-2.5 px-4 gap-2">
            <button
              onClick={() => setStep(1)}
              className={`flex items-center justify-center space-x-1.5 transition-colors ${
                step >= 1 ? 'text-indigo-600 font-bold' : 'text-slate-400'
              }`}
            >
              <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] ${
                step >= 1 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
              }`}>
                1
              </span>
              <span className="hidden sm:inline">1. Service</span>
            </button>

            <button
              onClick={() => selectedServiceId && setStep(2)}
              className={`flex items-center justify-center space-x-1.5 transition-colors ${
                step >= 2 ? 'text-indigo-600 font-bold' : 'text-slate-400'
              }`}
            >
              <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] ${
                step >= 2 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
              }`}>
                2
              </span>
              <span className="hidden sm:inline">2. Date & Slot</span>
            </button>

            <button
              onClick={() => selectedDate && selectedSlot && setStep(3)}
              className={`flex items-center justify-center space-x-1.5 transition-colors ${
                step >= 3 ? 'text-indigo-600 font-bold' : 'text-slate-400'
              }`}
            >
              <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] ${
                step >= 3 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
              }`}>
                3
              </span>
              <span className="hidden sm:inline">3. Details</span>
            </button>
          </div>
        )}

        {/* Form Error Banner */}
        {formError && (
          <div className="mx-6 mt-4 flex items-center space-x-2 rounded-xl bg-rose-50 border border-rose-200 px-4 py-2.5 text-xs font-medium text-rose-700 animate-in fade-in">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* Body content based on step */}
        <div className="overflow-y-auto p-6 flex-1 space-y-6">
          {/* STEP 1: Select Service */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Choose a Professional Service</h3>
                  <p className="text-xs text-slate-500">Select the appointment service you wish to schedule</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                {services
                  .filter((s) => s.isActive)
                  .map((svc) => (
                    <div
                      key={svc.id}
                      onClick={() => {
                        setSelectedServiceId(svc.id);
                        setFormError(null);
                      }}
                      className={`group relative flex flex-col justify-between rounded-2xl border p-4 transition-all cursor-pointer ${
                        selectedServiceId === svc.id
                          ? 'border-indigo-600 bg-indigo-50/50 shadow-md ring-2 ring-indigo-500/20'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between">
                          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-slate-600">
                            {svc.category}
                          </span>
                          <span className="text-sm font-bold text-slate-900">
                            ${svc.price}
                          </span>
                        </div>

                        <h4 className="mt-2 text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {svc.name}
                        </h4>
                        <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {svc.description}
                        </p>
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
                        <span className="flex items-center">
                          <Clock className="mr-1 h-3.5 w-3.5 text-indigo-500" />
                          {svc.durationMinutes} min
                        </span>
                        <span className="font-medium text-slate-700">
                          {svc.providerName}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* STEP 2: Pick Date & Time Slot */}
          {step === 2 && (
            <div className="space-y-6">
              {currentService && (
                <div className="flex items-center justify-between rounded-xl bg-indigo-50/60 p-3.5 border border-indigo-100 text-xs">
                  <div>
                    <span className="font-semibold text-indigo-900">{currentService.name}</span>
                    <span className="mx-2 text-slate-300">&bull;</span>
                    <span className="text-slate-600">${currentService.price} ({currentService.durationMinutes} mins)</span>
                  </div>
                  <button
                    onClick={() => setStep(1)}
                    className="font-medium text-indigo-600 hover:text-indigo-800"
                  >
                    Change Service
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Interactive Monthly Calendar (left 7 cols) */}
                <div className="md:col-span-7 rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                    <span className="font-bold text-slate-900 text-sm">
                      {calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </span>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={handlePrevMonth}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                        title="Previous Month"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        onClick={handleNextMonth}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                        title="Next Month"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Day of Week Headers */}
                  <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-slate-400 mb-1">
                    <span>Su</span>
                    <span>Mo</span>
                    <span>Tu</span>
                    <span>We</span>
                    <span>Th</span>
                    <span>Fr</span>
                    <span>Sa</span>
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-1 text-center">
                    {getDaysInMonth().map((item, idx) => {
                      if (!item.isCurrentMonth) {
                        return <div key={idx} className="h-9"></div>;
                      }

                      const isSelected = selectedDate === item.dateStr;
                      const isBlocked = scheduleConfig.blockedDates.includes(item.dateStr);
                      const isSunday = new Date(item.dateStr + 'T00:00:00').getDay() === 0;
                      const isDisabled = item.isPast || isBlocked || isSunday;

                      return (
                        <button
                          key={idx}
                          disabled={isDisabled}
                          onClick={() => {
                            setSelectedDate(item.dateStr);
                            setSelectedSlot('');
                            setFormError(null);
                          }}
                          className={`h-9 w-full rounded-xl text-xs font-medium transition-all flex items-center justify-center ${
                            isSelected
                              ? 'bg-indigo-600 font-bold text-white shadow-md shadow-indigo-600/30'
                              : isDisabled
                              ? 'text-slate-300 cursor-not-allowed bg-slate-50/50'
                              : 'text-slate-700 hover:bg-indigo-50 hover:text-indigo-600'
                          }`}
                        >
                          {item.dayNum}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-4 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-3">
                    <span className="flex items-center">
                      <span className="mr-1.5 h-2 w-2 rounded-full bg-indigo-600"></span>
                      Selected
                    </span>
                    <span className="flex items-center">
                      <span className="mr-1.5 h-2 w-2 rounded-full bg-slate-200"></span>
                      Unavailable/Closed
                    </span>
                    <span className="text-slate-400">Closed Sundays</span>
                  </div>
                </div>

                {/* Available Time Slots for Selected Date (right 5 cols) */}
                <div className="md:col-span-5 flex flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div>
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200/80">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                          Time Slots
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          {selectedDate ? formatDatePretty(selectedDate) : 'Select a date first'}
                        </p>
                      </div>
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                        Live Sync
                      </span>
                    </div>

                    {slotOptions.length === 0 ? (
                      <div className="py-8 text-center text-xs text-slate-400">
                        No appointments available on this date.
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                        {slotOptions.map((item, idx) => {
                          const isPicked = selectedSlot === item.slot;
                          return (
                            <button
                              key={idx}
                              disabled={!item.available}
                              onClick={() => {
                                setSelectedSlot(item.slot);
                                setFormError(null);
                              }}
                              className={`rounded-xl px-2.5 py-2 text-xs font-semibold transition-all text-center flex flex-col items-center justify-center ${
                                isPicked
                                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 ring-2 ring-indigo-600 ring-offset-1'
                                  : item.available
                                  ? 'bg-white border border-slate-200 text-slate-800 hover:border-indigo-400 hover:text-indigo-600 shadow-sm'
                                  : 'bg-slate-200/70 text-slate-400 border border-transparent cursor-not-allowed line-through opacity-70'
                              }`}
                              title={item.available ? 'Available slot' : 'Reserved - Double booking prevented'}
                            >
                              <span>{item.slot}</span>
                              <span className="text-[9px] font-normal">
                                {item.available ? 'Available' : 'Booked'}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 rounded-xl bg-white p-2.5 border border-slate-200/80 text-[11px] text-slate-500 flex items-start space-x-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>Double-booking algorithm automatically reserves your slot in real time.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Customer Information */}
          {step === 3 && (
            <div className="space-y-5">
              {/* Order Recap Banner */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 rounded-2xl bg-indigo-50/70 border border-indigo-100 p-4 text-xs">
                <div>
                  <span className="text-slate-500 font-medium">Service</span>
                  <p className="font-bold text-slate-900">{currentService?.name}</p>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Date & Time</span>
                  <p className="font-bold text-slate-900">
                    {formatDatePretty(selectedDate)} at {selectedSlot}
                  </p>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <span className="text-slate-500 font-medium">Total Cost</span>
                  <p className="font-bold text-indigo-700 text-sm">${currentService?.price} USD</p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-900">Customer Details</h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="e.g. Yogesh Chhura"
                        className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Email Address (for instant receipt & reminders) *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <input
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="e.g. yogesh@gmail.com"
                        className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Mobile / Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <input
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="e.g. +1 555-0199"
                        className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Appointment Message / Notes (Optional)
                    </label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <textarea
                        rows={2}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Any special requests or relevant medical/technical background..."
                        className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-600 flex items-start space-x-2">
                  <input
                    type="checkbox"
                    id="terms-check"
                    checked={termsAgreed}
                    onChange={(e) => setTermsAgreed(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="terms-check" className="cursor-pointer">
                    I acknowledge and agree to the 4-hour cancellation policy and authorize Smart Appointment Booking to generate my secure confirmation pass and dispatch confirmation emails.
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Success & Confirmation Pass */}
          {step === 4 && confirmedAppointment && (
            <div className="text-center py-4 space-y-5 animate-in zoom-in-95 duration-200">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 shadow-lg shadow-emerald-500/20">
                <CheckCircle className="h-9 w-9" />
              </div>

              <div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-500/30">
                  CONFIRMED & LOCKED
                </span>
                <h3 className="mt-2 font-display text-xl sm:text-2xl font-bold text-slate-900">
                  Appointment Confirmed!
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Your appointment slot is reserved. A confirmation email has been dispatched to {confirmedAppointment.customerEmail}.
                </p>
              </div>

              {/* Digital Pass Card */}
              <div className="mx-auto max-w-md rounded-2xl border-2 border-indigo-100 bg-gradient-to-br from-indigo-50/50 via-white to-slate-50 p-5 text-left shadow-md">
                <div className="flex items-center justify-between border-b border-indigo-100 pb-3">
                  <div>
                    <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">
                      Booking Reference ID
                    </span>
                    <p className="font-mono text-base font-bold text-slate-900">
                      {confirmedAppointment.id}
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                    SAB
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500">Service</span>
                    <p className="font-semibold text-slate-900">{confirmedAppointment.serviceName}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Date</span>
                    <p className="font-semibold text-slate-900">{formatDatePretty(confirmedAppointment.date)}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Time Slot</span>
                    <p className="font-semibold text-slate-900">{confirmedAppointment.timeSlot}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Customer</span>
                    <p className="font-semibold text-slate-900">{confirmedAppointment.customerName}</p>
                  </div>
                </div>

                {confirmedAppointment.notes && (
                  <div className="mt-3 border-t border-slate-100 pt-2 text-xs">
                    <span className="text-slate-500 font-medium">Notes: </span>
                    <span className="text-slate-700 italic">{confirmedAppointment.notes}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={downloadIcsCalendar}
                  className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition-colors"
                >
                  <Download className="mr-1.5 h-4 w-4 text-indigo-600" />
                  Add to Calendar (.ics)
                </button>

                {emailLogs.length > 0 && (
                  <button
                    onClick={() => {
                      const latest = emailLogs[0];
                      if (latest) setActiveEmailPreview(latest);
                    }}
                    className="inline-flex items-center rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors"
                  >
                    <Mail className="mr-1.5 h-4 w-4" />
                    View Sent Email
                  </button>
                )}

                <button
                  onClick={() => {
                    closeBookingModal();
                    setCurrentView('customer_dashboard');
                  }}
                  className="inline-flex items-center rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors shadow-md"
                >
                  Go to Customer Dashboard
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls (Steps 1 to 3) */}
        {step < 4 && (
          <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-4">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Back
              </button>
            ) : (
              <div></div>
            )}

            {step === 1 && (
              <button
                type="button"
                disabled={!selectedServiceId}
                onClick={() => {
                  setFormError(null);
                  setStep(2);
                }}
                className="inline-flex items-center rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-indigo-700 shadow-md shadow-indigo-600/20 disabled:opacity-50 transition-colors"
              >
                <span>Continue to Date & Slot</span>
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </button>
            )}

            {step === 2 && (
              <button
                type="button"
                disabled={!selectedDate || !selectedSlot}
                onClick={() => {
                  if (!selectedDate || !selectedSlot) {
                    setFormError('Please select both a date and an available time slot.');
                    return;
                  }
                  setFormError(null);
                  setStep(3);
                }}
                className="inline-flex items-center rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-indigo-700 shadow-md shadow-indigo-600/20 disabled:opacity-50 transition-colors"
              >
                <span>Continue to Customer Details</span>
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </button>
            )}

            {step === 3 && (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmBooking}
                className="inline-flex items-center rounded-xl bg-emerald-600 px-6 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/20 disabled:opacity-50 transition-colors"
              >
                {isSubmitting ? (
                  <span>Reserving Slot...</span>
                ) : (
                  <>
                    <CheckCircle className="mr-1.5 h-4 w-4" />
                    <span>Confirm Booking</span>
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
