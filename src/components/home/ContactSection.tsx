import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle,
  ExternalLink,
  MessageSquare,
  Navigation,
  Globe,
  Share2,
} from 'lucide-react';

export const ContactSection: React.FC = () => {
  const { submitContactInquiry, showToast } = useApp();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [mapZoom, setMapZoom] = useState(14);
  const [mapViewType, setMapViewType] = useState<'roadmap' | 'satellite'>('roadmap');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      showToast('Please fill out all required fields.', 'error');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const res = submitContactInquiry({ name, email, phone, message });
      setIsSubmitting(false);

      if (res.success) {
        setSubmitted(true);
        setName('');
        setEmail('');
        setPhone('');
        setMessage('');
      }
    }, 400);
  };

  return (
    <section id="contact-section" className="py-20 bg-slate-50 border-t border-slate-200/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
            <MessageSquare className="h-3.5 w-3.5" />
            <span>We're Here to Help</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Get in Touch With Our Concierge
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Have questions about custom corporate packages, specialist availability, or technical integrations? Send us a note or visit our central clinic and offices.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Form (6 cols) */}
          <div className="lg:col-span-6 rounded-3xl border border-slate-200 bg-white p-7 sm:p-9 shadow-sm">
            <h3 className="font-display text-xl font-bold text-slate-900">
              Send an Inquiry
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Our support specialists respond within 2 business hours.
            </p>

            {submitted ? (
              <div className="mt-8 rounded-2xl bg-emerald-50 border border-emerald-200 p-6 text-center space-y-3">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Inquiry Received</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Thank you for reaching out! A dedicated appointment coordinator has received your message and will follow up shortly.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-2 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Yogesh Chhura"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. yogesh@gmail.com"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +1 555-0199"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Message / Questions *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="How can our scheduling team assist you today?"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-700 active:scale-98 disabled:opacity-50 transition-all"
                >
                  <Send className="mr-2 h-4 w-4" />
                  <span>{isSubmitting ? 'Sending Message...' : 'Submit Inquiry'}</span>
                </button>
              </form>
            )}
          </div>

          {/* Right Google Maps Integration & Details (6 cols) */}
          <div className="lg:col-span-6 space-y-6">
            {/* Interactive Map View */}
            <div className="relative rounded-3xl border border-slate-200 overflow-hidden bg-slate-100 shadow-sm h-72 sm:h-80 flex flex-col justify-between">
              {/* Map Canvas Background (Simulated high-res vector Google Map with landmarks) */}
              <div
                className={`absolute inset-0 transition-opacity duration-300 ${
                  mapViewType === 'satellite'
                    ? 'bg-slate-800'
                    : 'bg-[#e5e3df]'
                }`}
                style={{
                  backgroundImage:
                    mapViewType === 'satellite'
                      ? 'radial-gradient(circle at 50% 50%, #1e293b 0%, #0f172a 100%)'
                      : 'linear-gradient(#f8f9fa 1px, transparent 1px), linear-gradient(90deg, #f8f9fa 1px, #e8eaed 1px)',
                  backgroundSize: '36px 36px',
                }}
              >
                {/* Simulated Street Grid and Hudson River aesthetics */}
                <svg className="w-full h-full opacity-60" xmlns="http://www.w3.org/2000/svg">
                  <path d="M 0 100 Q 150 120 300 80 T 600 110" fill="none" stroke="#cbd5e1" strokeWidth="18" />
                  <path d="M 120 0 L 120 400" fill="none" stroke="#cbd5e1" strokeWidth="12" />
                  <path d="M 380 0 L 380 400" fill="none" stroke="#cbd5e1" strokeWidth="14" />
                  <path d="M 0 240 L 600 240" fill="none" stroke="#cbd5e1" strokeWidth="10" />
                  {/* Central Park / Green zone */}
                  <rect x="220" y="20" width="120" height="90" rx="8" fill="#d1fae5" opacity="0.8" />
                  <text x="240" y="70" fill="#047857" fontSize="10" fontWeight="bold">Evergreen Plaza</text>
                </svg>
              </div>

              {/* Map Interactive Toolbar */}
              <div className="relative z-10 m-3 flex items-center justify-between">
                <div className="flex items-center space-x-1 rounded-xl bg-white/95 p-1 shadow-md border border-slate-200 text-xs">
                  <button
                    onClick={() => setMapViewType('roadmap')}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                      mapViewType === 'roadmap' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Map
                  </button>
                  <button
                    onClick={() => setMapViewType('satellite')}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                      mapViewType === 'satellite' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Satellite
                  </button>
                </div>

                {/* Google Maps link */}
                <a
                  href="https://maps.google.com/?q=742+Evergreen+Plaza,+New+York,+NY"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 rounded-xl bg-white/95 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-md border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  <Navigation className="h-3.5 w-3.5 text-indigo-600" />
                  <span>Open in Google Maps</span>
                  <ExternalLink className="h-3 w-3 text-slate-400" />
                </a>
              </div>

              {/* Center Map Pin with Pulse */}
              <div className="relative z-10 flex flex-col items-center justify-center pointer-events-none">
                <div className="flex items-center space-x-2 rounded-2xl bg-slate-900 px-3 py-1.5 text-xs font-bold text-white shadow-xl ring-2 ring-indigo-500/50">
                  <MapPin className="h-4 w-4 text-rose-500 animate-bounce" />
                  <span>Smart Appointment Booking Clinic</span>
                </div>
                <div className="h-3 w-3 rounded-full bg-indigo-600 ring-4 ring-indigo-400/50 animate-ping mt-1" />
              </div>

              {/* Map Bottom Bar */}
              <div className="relative z-10 m-3 flex items-center justify-between text-[11px] text-slate-600 bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
                <span>Coordinates: 40.7580&deg; N, 73.9855&deg; W</span>
                <span className="font-semibold text-indigo-700">Level 4 Clinic &amp; Consultation Suites</span>
              </div>
            </div>

            {/* Contact Details Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-1">
                <div className="flex items-center text-xs font-bold text-slate-900">
                  <Phone className="mr-2 h-4 w-4 text-indigo-600" />
                  Direct Phone Lines
                </div>
                <p className="text-xs text-slate-600">+1 (800) 555-APPT (2778)</p>
                <p className="text-[11px] text-slate-400">Available Mon-Sat 8am-8pm EST</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-1">
                <div className="flex items-center text-xs font-bold text-slate-900">
                  <Mail className="mr-2 h-4 w-4 text-indigo-600" />
                  Email Support
                </div>
                <p className="text-xs text-slate-600">concierge@smartbooking.com</p>
                <p className="text-[11px] text-slate-400">Average response time: 45 min</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
