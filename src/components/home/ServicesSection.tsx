import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ServiceCategory, Service } from '../../types';
import {
  Clock,
  Search,
  Sparkles,
  ArrowRight,
  Filter,
  CheckCircle,
} from 'lucide-react';

const CATEGORIES: ServiceCategory[] = [
  'All',
  'Health & Wellness',
  'Tech & Digital',
  'Consultation',
  'Legal & Finance',
  'Coaching & Lifestyle',
];

export const ServicesSection: React.FC = () => {
  const { services, openBookingModal } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredServices = services.filter((svc) => {
    if (!svc.isActive) return false;

    if (selectedCategory !== 'All' && svc.category !== selectedCategory) {
      return false;
    }

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      const matchName = svc.name.toLowerCase().includes(q);
      const matchDesc = svc.description.toLowerCase().includes(q);
      const matchProvider = svc.providerName.toLowerCase().includes(q);
      if (!matchName && !matchDesc && !matchProvider) return false;
    }

    return true;
  });

  return (
    <section id="services-section" className="py-20 bg-white border-t border-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Specialized Offerings</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Our Certified Appointment Services
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Choose from our curated roster of verified specialists across medicine, cloud technology, strategic growth, legal consultation, and leadership coaching.
          </p>
        </div>

        {/* Filter Controls & Search */}
        <div className="mt-10 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Category Pills */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 p-1 rounded-2xl bg-slate-100/80 border border-slate-200">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  selectedCategory === cat
                    ? 'bg-white text-indigo-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search services or specialists..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9.5 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Services Grid */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.length === 0 ? (
            <div className="col-span-full py-16 text-center">
              <p className="text-sm font-semibold text-slate-500">No services match your search or filter.</p>
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setSearchQuery('');
                }}
                className="mt-3 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                Reset filters
              </button>
            </div>
          ) : (
            filteredServices.map((svc) => (
              <div
                key={svc.id}
                className="group flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm hover:border-indigo-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
              >
                <div>
                  {/* Top badges */}
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-bold text-indigo-700">
                      {svc.category}
                    </span>
                    {svc.popular && (
                      <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 ring-1 ring-amber-200">
                        Popular
                      </span>
                    )}
                  </div>

                  <h3 className="mt-4 font-display text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {svc.name}
                  </h3>

                  <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3">
                    {svc.description}
                  </p>
                </div>

                <div className="mt-6 pt-5 border-t border-slate-100">
                  {/* Provider Info */}
                  <div className="flex items-center space-x-3 mb-4">
                    <img
                      src={svc.providerAvatar}
                      alt={svc.providerName}
                      className="h-10 w-10 rounded-full object-cover ring-2 ring-indigo-100"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-900">{svc.providerName}</p>
                      <p className="text-[11px] text-slate-500">{svc.providerTitle}</p>
                    </div>
                  </div>

                  {/* Price & Action */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">
                        Fee & Duration
                      </span>
                      <div className="flex items-baseline space-x-1">
                        <span className="text-xl font-extrabold text-slate-900">
                          ${svc.price}
                        </span>
                        <span className="text-xs text-slate-500">
                          / {svc.durationMinutes} min
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => openBookingModal(svc.id)}
                      className="inline-flex items-center rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white group-hover:bg-indigo-600 transition-colors shadow-sm"
                    >
                      <span>Book Slot</span>
                      <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};
