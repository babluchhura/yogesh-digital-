import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Mail,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Copy,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { formatDatePretty } from '../../utils/bookingLogic';

export const EmailPreviewModal: React.FC = () => {
  const { activeEmailPreview, setActiveEmailPreview, showToast } = useApp();

  if (!activeEmailPreview) return null;

  const apt = activeEmailPreview.appointment;

  const copyEmailBody = () => {
    const text = `
Subject: ${activeEmailPreview.subject}
To: ${activeEmailPreview.recipientName} <${activeEmailPreview.recipientEmail}>
From: Smart Appointment Booking <notifications@smartappointmentbooking.com>
Date: ${new Date(activeEmailPreview.sentAt).toLocaleString()}

Booking Reference: ${apt.id}
Service: ${apt.serviceName}
Date: ${apt.date} (${formatDatePretty(apt.date)})
Time: ${apt.timeSlot}
Duration: ${apt.durationMinutes} Minutes
Price: $${apt.servicePrice}
Status: ${apt.status.toUpperCase()}

Customer: ${apt.customerName}
Phone: ${apt.customerPhone}
Email: ${apt.customerEmail}
${apt.notes ? `Notes: ${apt.notes}` : ''}
    `.trim();

    navigator.clipboard.writeText(text);
    showToast('Email content copied to clipboard!', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
          <div className="flex items-center space-x-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">Simulated Email Dispatch</h3>
              <p className="text-xs text-slate-500">Live preview of notification sent via SMTP relay</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={copyEmailBody}
              className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
              title="Copy email text"
            >
              <Copy className="mr-1.5 h-3.5 w-3.5" />
              Copy Text
            </button>
            <button
              onClick={() => setActiveEmailPreview(null)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Email Meta Info */}
        <div className="bg-slate-100/70 px-6 py-3 border-b border-slate-200 text-xs text-slate-600 space-y-1">
          <div className="flex">
            <span className="w-16 font-semibold text-slate-500">To:</span>
            <span className="text-slate-900 font-medium">
              {activeEmailPreview.recipientName} &lt;{activeEmailPreview.recipientEmail}&gt;
            </span>
          </div>
          <div className="flex">
            <span className="w-16 font-semibold text-slate-500">From:</span>
            <span className="text-slate-900">Smart Appointment Booking &lt;notifications@smartappointmentbooking.com&gt;</span>
          </div>
          <div className="flex">
            <span className="w-16 font-semibold text-slate-500">Subject:</span>
            <span className="text-indigo-900 font-bold">{activeEmailPreview.subject}</span>
          </div>
          <div className="flex">
            <span className="w-16 font-semibold text-slate-500">Sent:</span>
            <span>{new Date(activeEmailPreview.sentAt).toLocaleString()}</span>
          </div>
        </div>

        {/* Email Body Simulation Card */}
        <div className="overflow-y-auto p-6 space-y-6 bg-slate-50/50">
          <div className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            {/* Brand Logo inside email */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-2">
                <div className="h-7 w-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                  <Calendar className="h-4 w-4" />
                </div>
                <span className="font-bold text-slate-900">Smart Booking</span>
              </div>
              <span className="text-xs text-slate-400">Ref: {apt.id}</span>
            </div>

            {/* Email Greeting */}
            <div className="mt-4">
              <h4 className="text-base font-bold text-slate-900">
                Hello {activeEmailPreview.recipientName},
              </h4>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                {activeEmailPreview.templateType === 'booking_confirmed' && (
                  'Thank you for scheduling with us! Your appointment has been successfully confirmed and your exclusive time slot is locked in our system.'
                )}
                {activeEmailPreview.templateType === 'booking_cancelled' && (
                  'Your appointment reservation has been cancelled as requested. If this was unexpected, please contact our support team.'
                )}
                {activeEmailPreview.templateType === 'booking_rescheduled' && (
                  'Your appointment schedule has been successfully adjusted. Here are your revised time and date details.'
                )}
                {activeEmailPreview.templateType === 'admin_alert' && (
                  'A new booking transaction has been recorded and requires administrative tracking.'
                )}
              </p>
            </div>

            {/* Appointment Details Highlight Card */}
            <div className="mt-5 rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-indigo-900 uppercase tracking-wide">
                  Appointment Overview
                </span>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold ${
                  apt.status === 'confirmed'
                    ? 'bg-emerald-100 text-emerald-800'
                    : apt.status === 'cancelled'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {apt.status === 'confirmed' && <CheckCircle className="mr-1 h-3 w-3 text-emerald-600" />}
                  {apt.status === 'cancelled' && <AlertCircle className="mr-1 h-3 w-3 text-rose-600" />}
                  {apt.status.toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-slate-500 font-medium">Service</p>
                  <p className="font-semibold text-slate-900">{apt.serviceName}</p>
                </div>
                <div>
                  <p className="text-slate-500 font-medium">Investment</p>
                  <p className="font-semibold text-slate-900">${apt.servicePrice} USD</p>
                </div>
                <div>
                  <p className="text-slate-500 font-medium">Date</p>
                  <p className="font-semibold text-slate-900 flex items-center">
                    <Calendar className="mr-1 h-3.5 w-3.5 text-indigo-600" />
                    {formatDatePretty(apt.date)}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500 font-medium">Time Slot</p>
                  <p className="font-semibold text-slate-900 flex items-center">
                    <Clock className="mr-1 h-3.5 w-3.5 text-indigo-600" />
                    {apt.timeSlot} ({apt.durationMinutes} min)
                  </p>
                </div>
              </div>

              {apt.notes && (
                <div className="border-t border-indigo-100 pt-2 text-xs">
                  <span className="font-medium text-slate-500">Customer Notes: </span>
                  <span className="text-slate-700 italic">"{apt.notes}"</span>
                </div>
              )}
            </div>

            {/* Instructions & Calendar Action */}
            <div className="mt-5 space-y-2 text-xs text-slate-500 border-t border-slate-100 pt-4">
              <p className="font-medium text-slate-700">Important Reminders:</p>
              <ul className="list-disc pl-4 space-y-1 text-slate-600">
                <li>Please arrive or connect 5 minutes prior to your designated slot.</li>
                <li>Free cancellation or rescheduling is available up to 4 hours in advance.</li>
                <li>Keep your Booking Reference ID (<strong>{apt.id}</strong>) handy.</li>
              </ul>
            </div>

            {/* Email Footer */}
            <div className="mt-6 border-t border-slate-100 pt-4 text-center text-[11px] text-slate-400">
              <p>Smart Appointment Booking Inc. &bull; 742 Evergreen Plaza, NY</p>
              <p className="mt-0.5">Need help? Reply directly to this email or call +1 (800) 555-APPT</p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end border-t border-slate-200 bg-slate-50 px-6 py-3">
          <button
            onClick={() => setActiveEmailPreview(null)}
            className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
};
