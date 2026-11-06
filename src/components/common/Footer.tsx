import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Calendar,
  Mail,
  Phone,
  MapPin,
  Clock,
  RotateCcw,
  ShieldCheck,
  Check,
  Heart,
} from 'lucide-react';

export const Footer: React.FC = () => {
  const { setCurrentView, openBookingModal, resetAllData, showToast } = useApp();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }
    setSubscribed(true);
    showToast('Subscribed to appointment updates & health tips!', 'success');
  };

  return (
    <footer className="border-t border-slate-200 bg-slate-900 text-slate-300">
      {/* Upper Newsletter Section */}
      <div className="border-b border-slate-800 bg-slate-950/60 py-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-xl text-center md:text-left">
            <h3 className="font-display text-xl font-bold text-white tracking-tight">
              Stay ahead with priority booking slots
            </h3>
            <p className="mt-1 text-sm text-slate-400">
              Receive reminder digests, new specialist availability alerts, and seasonal wellness advisories directly to your inbox.
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="flex w-full md:w-auto max-w-md items-center gap-2">
            <input
              type="email"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={subscribed}
              className="w-full sm:w-72 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={subscribed}
              className="flex-shrink-0 inline-flex items-center rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors disabled:bg-emerald-700"
            >
              {subscribed ? (
                <>
                  <Check className="mr-1.5 h-4 w-4 text-emerald-300" />
                  Subscribed
                </>
              ) : (
                'Subscribe'
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/30">
                <Calendar className="h-5 w-5" />
              </div>
              <span className="font-display text-xl font-bold text-white tracking-tight">
                Smart<span className="text-indigo-400">Booking</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              The premier online scheduling platform engineering frictionless appointment reservations, real-time slot conflict prevention, and enterprise-grade client management.
            </p>

            <div className="flex items-center space-x-3 pt-2 text-xs text-slate-400">
              <span className="inline-flex items-center text-emerald-400">
                <ShieldCheck className="mr-1.5 h-4 w-4" />
                256-Bit SSL Encrypted
              </span>
              <span>&bull;</span>
              <span>Zero Double Booking Guarantee</span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Quick Links</h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => setCurrentView('home')}
                  className="hover:text-white transition-colors"
                >
                  Homepage
                </button>
              </li>
              <li>
                <button
                  onClick={() => openBookingModal()}
                  className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                >
                  Book Appointment Now
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setCurrentView('customer_dashboard');
                  }}
                  className="hover:text-white transition-colors"
                >
                  Customer Portal
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setCurrentView('admin_dashboard');
                  }}
                  className="hover:text-white transition-colors"
                >
                  Admin Management
                </button>
              </li>
            </ul>
          </div>

          {/* Business Hours */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Availability</h4>
            <ul className="mt-4 space-y-2.5 text-xs text-slate-400">
              <li className="flex items-start">
                <Clock className="mr-2 h-4 w-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-300">Monday - Friday</p>
                  <p>09:00 AM - 06:00 PM EST</p>
                </div>
              </li>
              <li className="flex items-start">
                <Clock className="mr-2 h-4 w-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-300">Saturday</p>
                  <p>10:00 AM - 04:00 PM EST</p>
                </div>
              </li>
              <li className="flex items-start">
                <Clock className="mr-2 h-4 w-4 text-slate-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-400">Sunday</p>
                  <p className="text-rose-400 font-medium">Closed for Maintenance</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Contact Us</h4>
            <ul className="mt-4 space-y-2.5 text-xs text-slate-400">
              <li className="flex items-center">
                <Phone className="mr-2 h-4 w-4 text-indigo-400 flex-shrink-0" />
                <span>+1 (800) 555-APPT (2778)</span>
              </li>
              <li className="flex items-center">
                <Mail className="mr-2 h-4 w-4 text-indigo-400 flex-shrink-0" />
                <span>support@smartappointmentbooking.com</span>
              </li>
              <li className="flex items-start">
                <MapPin className="mr-2 h-4 w-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                <span>742 Evergreen Plaza, Suite 400, New York, NY 10001</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>
            &copy; {new Date().getFullYear()} Smart Appointment Booking Inc. All rights reserved.
          </p>

          <div className="flex items-center space-x-6">
            <button
              onClick={resetAllData}
              className="inline-flex items-center text-slate-400 hover:text-amber-400 transition-colors"
              title="Reset application to factory sample data"
            >
              <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
              Reset Demo Records
            </button>
            <span className="flex items-center text-slate-500">
              Crafted with <Heart className="mx-1 h-3.5 w-3.5 text-rose-500 fill-rose-500" /> for seamless scheduling
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
