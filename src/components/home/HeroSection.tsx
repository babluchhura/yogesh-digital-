import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle,
  Star,
  Users,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const HeroSection: React.FC = () => {
  const { openBookingModal, services, setCurrentView } = useApp();

  const [quickServiceId, setQuickServiceId] = useState(services[0]?.id || '');
  const [quickDate, setQuickDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });

  const handleQuickBook = (e: React.FormEvent) => {
    e.preventDefault();
    openBookingModal(quickServiceId || undefined);
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50/60 via-white to-slate-50 pt-12 pb-20 sm:pt-16 sm:pb-28">
      {/* Decorative Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-indigo-200/40 via-violet-200/20 to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Hero Pitch (7 cols) */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center space-x-2 rounded-full border border-indigo-200 bg-white px-3.5 py-1.5 shadow-xs">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-semibold text-indigo-900">
                Next-Gen Online Appointment Platform
              </span>
              <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                2026 Ready
              </span>
            </div>

            <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
              Frictionless scheduling for{' '}
              <span className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-800 bg-clip-text text-transparent">
                busy professionals
              </span>{' '}
              & clients.
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Book consultations, healthcare visits, and specialist sessions with guaranteed zero double bookings, real-time calendar synchronization, and automated email confirmation passes.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
              <button
                onClick={() => openBookingModal()}
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 hover:shadow-xl active:scale-95 transition-all"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                <span>Book Appointment Now</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>

              <button
                onClick={() => {
                  const el = document.getElementById('services-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-sm transition-all"
              >
                Browse All Services
              </button>
            </div>

            {/* Quick Hero Highlights */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-200/80 max-w-lg mx-auto lg:mx-0">
              <div className="text-left">
                <p className="font-display text-xl sm:text-2xl font-bold text-slate-900">99.9%</p>
                <p className="text-xs text-slate-500 font-medium">Slot Reliability</p>
              </div>
              <div className="text-left">
                <p className="font-display text-xl sm:text-2xl font-bold text-slate-900">15,000+</p>
                <p className="text-xs text-slate-500 font-medium">Active Bookings</p>
              </div>
              <div className="text-left">
                <p className="font-display text-xl sm:text-2xl font-bold text-slate-900 flex items-center">
                  4.9 <Star className="ml-1 h-4 w-4 fill-amber-400 text-amber-400" />
                </p>
                <p className="text-xs text-slate-500 font-medium">Customer Rating</p>
              </div>
            </div>
          </div>

          {/* Right Interactive Quick-Booking Widget (5 cols) */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-md rounded-3xl border border-slate-200/90 bg-white/95 p-6 sm:p-7 shadow-2xl backdrop-blur-md">
              <div className="absolute -top-3.5 right-6 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 px-3 py-1 text-[11px] font-bold text-white shadow-sm flex items-center">
                <ShieldCheck className="mr-1 h-3.5 w-3.5" />
                Real-Time Availability
              </div>

              <div className="mb-5">
                <h3 className="font-display text-lg font-bold text-slate-900">
                  Quick Appointment Finder
                </h3>
                <p className="text-xs text-slate-500">
                  Find and reserve your preferred consultation slot in under 60 seconds.
                </p>
              </div>

              <form onSubmit={handleQuickBook} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Select Desired Service
                  </label>
                  <select
                    value={quickServiceId}
                    onChange={(e) => setQuickServiceId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  >
                    {services.map((svc) => (
                      <option key={svc.id} value={svc.id}>
                        {svc.name} (${svc.price} &bull; {svc.durationMinutes}m)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Select Target Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="date"
                      value={quickDate}
                      onChange={(e) => setQuickDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Benefits Bullet Points */}
                <div className="rounded-2xl bg-indigo-50/70 p-3.5 text-xs text-indigo-900 space-y-1.5">
                  <div className="flex items-center">
                    <CheckCircle className="mr-2 h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
                    <span>Instant unique reference ID generation</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="mr-2 h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
                    <span>Free calendar file (.ics) and email confirmation</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="mr-2 h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
                    <span>Zero duplicate booking conflict lock</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-3 text-xs sm:text-sm font-bold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-700 active:scale-98 transition-all"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>Check Slots & Reserve</span>
                </button>
              </form>

              {/* Specialists preview snippet */}
              <div className="mt-5 border-t border-slate-100 pt-3 flex items-center justify-between text-xs text-slate-500">
                <div className="flex -space-x-2 overflow-hidden">
                  <img
                    className="inline-block h-7 w-7 rounded-full ring-2 ring-white object-cover"
                    src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=128&q=80"
                    alt="Doctor"
                  />
                  <img
                    className="inline-block h-7 w-7 rounded-full ring-2 ring-white object-cover"
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&q=80"
                    alt="Consultant"
                  />
                  <img
                    className="inline-block h-7 w-7 rounded-full ring-2 ring-white object-cover"
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=128&q=80"
                    alt="Advisor"
                  />
                </div>
                <span>Certified specialists on duty</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
