import React from 'react';
import {
  ShieldCheck,
  CalendarCheck,
  BellRing,
  RefreshCw,
  Award,
  Lock,
  Sparkles,
  Zap,
} from 'lucide-react';

const REASONS = [
  {
    icon: ShieldCheck,
    title: 'Zero Double Booking Guarantee',
    description:
      'Our synchronized slot-locking engine ensures that the moment you choose a time, it is reserved atomically. No awkward overlaps or unexpected scheduling conflicts.',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    icon: BellRing,
    title: 'Instant Confirmation & Multi-Channel Alerts',
    description:
      'Immediate unique booking reference code, calendar file generation, and real-time email dispatch to keep both customer and specialist aligned.',
    color: 'from-indigo-500 to-blue-600',
  },
  {
    icon: RefreshCw,
    title: 'Self-Serve Rescheduling & Cancellation',
    description:
      'Plans change. Customers can adjust their dates or cancel appointments up to 4 hours prior directly from their personal dashboard without waiting on hold.',
    color: 'from-violet-500 to-purple-600',
  },
  {
    icon: Award,
    title: 'Vetted & Board-Certified Specialists',
    description:
      'Every consultant, medical practitioner, legal advisor, and coach is rigorously vetted for qualifications, certifications, and high-standard service delivery.',
    color: 'from-amber-500 to-orange-600',
  },
  {
    icon: Lock,
    title: 'Bank-Grade Privacy & Data Integrity',
    description:
      'Your consultation notes, health discussions, and contact details are shielded with high-grade encryption and strict role-based access control.',
    color: 'from-cyan-500 to-blue-600',
  },
  {
    icon: Zap,
    title: 'Sub-60 Second Booking Velocity',
    description:
      'A streamlined, responsive four-step flow optimized for mobile, tablet, and desktop devices without tedious redundant form steps.',
    color: 'from-rose-500 to-pink-600',
  },
];

export const WhyChooseUsSection: React.FC = () => {
  return (
    <section id="why-us-section" className="py-20 bg-slate-50 border-t border-slate-200/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* About Us Story Banner */}
        <div className="rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 p-8 sm:p-12 text-white shadow-xl mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <span className="inline-flex items-center rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-300 ring-1 ring-indigo-500/30">
                <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                About Smart Appointment Booking
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight">
                Pioneering reliable, human-centered appointment technology since 2021.
              </h2>
              <p className="text-sm sm:text-base text-indigo-100 leading-relaxed max-w-2xl">
                We founded Smart Booking to eliminate the frustrating back-and-forth email chains, phantom double bookings, and clunky legacy calendars. Today, our platform powers thousands of high-stakes consultations weekly—connecting individuals directly with leading experts across healthcare, enterprise technology, and professional advisory.
              </p>
            </div>

            <div className="lg:col-span-4 grid grid-cols-2 gap-4 text-center">
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-xs border border-white/10">
                <p className="font-display text-2xl sm:text-3xl font-extrabold text-white">40k+</p>
                <p className="text-xs text-indigo-200 mt-1">Sessions Completed</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-xs border border-white/10">
                <p className="font-display text-2xl sm:text-3xl font-extrabold text-white">99.9%</p>
                <p className="text-xs text-indigo-200 mt-1">On-Time Accuracy</p>
              </div>
            </div>
          </div>
        </div>

        {/* Why Choose Us Feature Cards */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
            <CalendarCheck className="h-3.5 w-3.5" />
            <span>Built For Peace of Mind</span>
          </div>
          <h3 className="font-display text-3xl font-extrabold text-slate-900 tracking-tight">
            Why Professionals & Clients Choose Us
          </h3>
          <p className="text-sm text-slate-600">
            Engineered from the ground up for zero errors, effortless rescheduling, and delightful user experiences.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {REASONS.map((reason, idx) => {
            const Icon = reason.icon;
            return (
              <div
                key={idx}
                className="relative rounded-3xl border border-slate-200 bg-white p-7 shadow-xs hover:shadow-md transition-shadow"
              >
                <div
                  className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr ${reason.color} text-white shadow-md shadow-indigo-600/10 mb-5`}
                >
                  <Icon className="h-6 w-6" />
                </div>

                <h4 className="font-display text-base font-bold text-slate-900">
                  {reason.title}
                </h4>

                <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {reason.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
