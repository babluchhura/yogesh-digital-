import React from 'react';
import { Star, Quote, CheckCircle, Award } from 'lucide-react';

const TESTIMONIALS = [
  {
    name: 'Emily Thornton',
    role: 'VP of Operations, Strata Digital',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80',
    service: 'Full-Stack Architecture & Cloud Review',
    rating: 5,
    text: 'Smart Booking saved our engineering leadership hours of back-and-forth emails. We booked an emergency architecture audit with Marcus Vance within 2 minutes. The instant calendar file and reminder alerts were flawless.',
    verified: true,
    date: '2 weeks ago',
  },
  {
    name: 'Dr. Aaron Patel',
    role: 'Biotech Founder & Researcher',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=256&q=80',
    service: 'Executive Health & Wellness Checkup',
    rating: 5,
    text: 'As someone with a nonstop schedule, I value reliability above all else. Not a single second was wasted. When I had to reschedule due to an unexpected investor call, the 1-click reschedule feature took care of everything without penalties.',
    verified: true,
    date: '1 month ago',
  },
  {
    name: 'Jessica Vance',
    role: 'Corporate Counsel & Founder',
    avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=256&q=80',
    service: 'Corporate Legal & Contract Advisory',
    rating: 5,
    text: 'Jonathan’s contract review was thorough, pragmatic, and high-value. Having all my appointment receipts, booking IDs, and specialist notes archived neatly in my customer dashboard makes tax reporting a breeze.',
    verified: true,
    date: '3 weeks ago',
  },
];

export const TestimonialsSection: React.FC = () => {
  return (
    <section id="testimonials-section" className="py-20 bg-white border-t border-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
            <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
            <span>Social Proof & Trust</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Trusted by 15,000+ Happy Clients
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            See how founders, executives, and individuals experience smooth appointment scheduling with our platform.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((t, idx) => (
            <div
              key={idx}
              className="flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-slate-50/50 p-7 shadow-xs hover:shadow-md transition-shadow relative"
            >
              <div>
                {/* Star rating */}
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="ml-2 text-xs font-bold text-slate-700">5.0</span>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                  "{t.text}"
                </p>
              </div>

              <div className="mt-6 pt-5 border-t border-slate-200/70">
                <div className="flex items-center space-x-3">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="h-11 w-11 rounded-full object-cover ring-2 ring-white shadow-xs"
                  />
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <h4 className="text-sm font-bold text-slate-900">{t.name}</h4>
                      {t.verified && (
                        <span title="Verified Customer">
                          <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">{t.role}</p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-medium text-indigo-600">{t.service}</span>
                  <span>{t.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
