import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Appointment, Service, AppointmentStatus, User } from '../../types';
import {
  Shield,
  Calendar,
  Clock,
  TrendingUp,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  Plus,
  Trash2,
  Edit,
  Mail,
  User as UserIcon,
  Phone,
  Lock,
  Layers,
  Settings,
  Eye,
  EyeOff,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import {
  calculateDashboardStats,
  filterAppointments,
  formatDatePretty,
} from '../../utils/bookingLogic';

export const AdminDashboard: React.FC = () => {
  const {
    isAdmin,
    login,
    currentUser,
    appointments,
    services,
    updateAppointmentStatus,
    rescheduleAppointment,
    addService,
    updateService,
    deleteService,
    scheduleConfig,
    toggleDateBlock,
    updateDefaultSlots,
    setCustomDateSlots,
    users,
    emailLogs,
    setActiveEmailPreview,
    openAuthModal,
    showToast,
    setCurrentView,
  } = useApp();

  // Active Admin Sub-tab
  const [adminTab, setAdminTab] = useState<'overview' | 'appointments' | 'schedule' | 'services' | 'customers' | 'emails'>('overview');

  // Appointment filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');

  // Reject Modal State
  const [rejectTargetId, setRejectTargetId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('');

  // Service Edit / Create Modal State
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [serviceName, setServiceName] = useState('');
  const [serviceCategory, setServiceCategory] = useState<Service['category']>('Consultation');
  const [servicePrice, setServicePrice] = useState(150);
  const [serviceDuration, setServiceDuration] = useState(45);
  const [serviceDesc, setServiceDesc] = useState('');
  const [serviceProvider, setServiceProvider] = useState('Dr. Specialist');
  const [serviceProviderTitle, setServiceProviderTitle] = useState('Senior Consultant');

  // New slot input for Schedule management
  const [newSlotInput, setNewSlotInput] = useState('');
  const [blockDateInput, setBlockDateInput] = useState('');

  // Admin Login Gate State
  const [adminUsernameInput, setAdminUsernameInput] = useState('');
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [adminLoginError, setAdminLoginError] = useState<string | null>(null);

  const handleAdminGateLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoginError(null);
    const res = login(adminUsernameInput, adminPasswordInput);
    if (!res.success) {
      setAdminLoginError(res.error || 'Access denied. Invalid administrator credentials.');
    }
  };

  // If not admin, render access locked security guard with private login
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-900/95 flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-3xl bg-white p-8 shadow-2xl border border-slate-200 space-y-6">
          <div className="text-center space-y-3">
            <div className="mx-auto flex flex-col items-center">
              <img
                src="/assets/aistudio/20261105_130008_fb835139.jpg"
                alt="Yogesh Chhura - Administrator"
                className="h-20 w-20 rounded-2xl object-cover ring-4 ring-amber-500/40 shadow-lg shadow-amber-500/20 mb-2"
              />
              <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-0.5 text-xs font-bold text-amber-800">
                <Shield className="h-3.5 w-3.5 mr-1" /> Yogesh Chhura (Admin)
              </span>
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-slate-900">
                Admin Portal Secure Access
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Restricted area. Please sign in with administrator credentials.
              </p>
            </div>
          </div>

          {adminLoginError && (
            <div className="flex items-center space-x-2 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-medium text-rose-700">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{adminLoginError}</span>
            </div>
          )}

          <form onSubmit={handleAdminGateLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Admin Username *
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={adminUsernameInput}
                  onChange={(e) => setAdminUsernameInput(e.target.value)}
                  placeholder="Enter admin username"
                  className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3.5 py-2.5 text-sm font-medium text-slate-900 placeholder-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Admin Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type={showAdminPassword ? 'text' : 'password'}
                  required
                  value={adminPasswordInput}
                  onChange={(e) => setAdminPasswordInput(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-10 py-2.5 text-sm font-medium text-slate-900 placeholder-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowAdminPassword(!showAdminPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                  title={showAdminPassword ? 'Hide password' : 'Show password'}
                  aria-label={showAdminPassword ? 'Hide password' : 'Show password'}
                >
                  {showAdminPassword ? (
                    <EyeOff className="h-4 w-4 text-slate-600" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-indigo-600 py-2.5 px-4 text-xs font-semibold text-white hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all active:scale-[0.98]"
            >
              Sign In to Admin Dashboard
            </button>

            <button
              type="button"
              onClick={() => setCurrentView('home')}
              className="w-full rounded-xl border border-slate-200 bg-white py-2 px-4 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Return to Website
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Calculate live stats
  const stats = calculateDashboardStats(appointments);

  // Filtered appointments
  const filteredAppointments = filterAppointments(appointments, {
    status: statusFilter,
    search: searchQuery,
    date: dateFilter,
  });

  const handleOpenAddService = () => {
    setEditingServiceId(null);
    setServiceName('');
    setServiceCategory('Consultation');
    setServicePrice(150);
    setServiceDuration(45);
    setServiceDesc('');
    setServiceProvider('Dr. Specialist');
    setServiceProviderTitle('Senior Consultant');
    setIsServiceModalOpen(true);
  };

  const handleOpenEditService = (s: Service) => {
    setEditingServiceId(s.id);
    setServiceName(s.name);
    setServiceCategory(s.category);
    setServicePrice(s.price);
    setServiceDuration(s.durationMinutes);
    setServiceDesc(s.description);
    setServiceProvider(s.providerName);
    setServiceProviderTitle(s.providerTitle);
    setIsServiceModalOpen(true);
  };

  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceName.trim() || !serviceDesc.trim()) {
      showToast('Please provide a name and description.', 'error');
      return;
    }

    if (editingServiceId) {
      updateService(editingServiceId, {
        name: serviceName,
        category: serviceCategory,
        price: Number(servicePrice),
        durationMinutes: Number(serviceDuration),
        description: serviceDesc,
        providerName: serviceProvider,
        providerTitle: serviceProviderTitle,
      });
    } else {
      addService({
        name: serviceName,
        category: serviceCategory,
        price: Number(servicePrice),
        durationMinutes: Number(serviceDuration),
        description: serviceDesc,
        providerName: serviceProvider,
        providerTitle: serviceProviderTitle,
        providerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
        iconName: 'Sparkles',
        isActive: true,
      });
    }

    setIsServiceModalOpen(false);
  };

  const handleAddDefaultSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlotInput.trim()) return;
    if (scheduleConfig.defaultTimeSlots.includes(newSlotInput.trim())) {
      showToast('This slot already exists.', 'error');
      return;
    }
    updateDefaultSlots([...scheduleConfig.defaultTimeSlots, newSlotInput.trim()]);
    setNewSlotInput('');
  };

  const handleRemoveDefaultSlot = (slotToRemove: string) => {
    updateDefaultSlots(scheduleConfig.defaultTimeSlots.filter((s) => s !== slotToRemove));
  };

  const handleBlockDate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockDateInput) return;
    toggleDateBlock(blockDateInput);
    setBlockDateInput('');
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Top Header Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <img
              src="/assets/aistudio/20261105_130008_fb835139.jpg"
              alt="Yogesh Chhura (Admin)"
              className="h-16 w-16 rounded-2xl object-cover ring-2 ring-amber-500/60 shadow-md shadow-amber-500/20"
            />
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-900">
                  Administrator Control Center
                </h1>
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800">
                  Master Privileges
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Logged in as {currentUser?.name || 'Yogesh Chhura'} &bull; Real-time schedule and appointment manager
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-500/30">
              <span className="mr-1.5 h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Double-Booking Shield Active
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setAdminTab('overview')}
            className={`rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
              adminTab === 'overview'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            Overview &amp; Stats
          </button>
          <button
            onClick={() => setAdminTab('appointments')}
            className={`flex items-center space-x-1.5 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
              adminTab === 'appointments'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <span>All Bookings</span>
            <span className={`rounded-full px-2 py-0.2 text-[10px] ${
              adminTab === 'appointments' ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {appointments.length}
            </span>
          </button>
          <button
            onClick={() => setAdminTab('schedule')}
            className={`rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
              adminTab === 'schedule'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            Schedule &amp; Time Slots
          </button>
          <button
            onClick={() => setAdminTab('services')}
            className={`flex items-center space-x-1.5 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
              adminTab === 'services'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <span>Services Manager</span>
            <span className="rounded-full bg-slate-200 px-2 py-0.2 text-[10px] text-slate-700">
              {services.length}
            </span>
          </button>
          <button
            onClick={() => setAdminTab('customers')}
            className={`rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
              adminTab === 'customers'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            Customer Directory
          </button>
          <button
            onClick={() => setAdminTab('emails')}
            className={`flex items-center space-x-1.5 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
              adminTab === 'emails'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <span>Email Logs</span>
            <span className="rounded-full bg-slate-200 px-2 py-0.2 text-[10px] text-slate-700">
              {emailLogs.length}
            </span>
          </button>
        </div>

        {/* TAB 1: Overview & Statistics */}
        {adminTab === 'overview' && (
          <div className="space-y-6">
            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                  <span>Total Appointments</span>
                  <Calendar className="h-4 w-4 text-indigo-600" />
                </div>
                <p className="mt-2 text-2xl font-extrabold text-slate-900">{stats.total}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{stats.todayCount} scheduled today</p>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                  <span>Pending Approval</span>
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                </div>
                <p className="mt-2 text-2xl font-extrabold text-amber-600">{stats.pending}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Awaiting confirmation</p>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                  <span>Gross Booking Revenue</span>
                  <DollarSign className="h-4 w-4 text-emerald-600" />
                </div>
                <p className="mt-2 text-2xl font-extrabold text-slate-900">${stats.totalRevenue}</p>
                <p className="text-[11px] text-emerald-600 mt-0.5 font-medium">99.8% collection rate</p>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                  <span>Active Services</span>
                  <Layers className="h-4 w-4 text-violet-600" />
                </div>
                <p className="mt-2 text-2xl font-extrabold text-slate-900">{services.filter((s) => s.isActive).length}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Across 5 categories</p>
              </div>
            </div>

            {/* Quick Action & Pending Approvals */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-display text-base font-bold text-slate-900">
                    Latest Appointments Requiring Attention
                  </h3>
                  <button
                    onClick={() => setAdminTab('appointments')}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                  >
                    View All &rarr;
                  </button>
                </div>

                <div className="divide-y divide-slate-100">
                  {appointments.slice(0, 5).map((apt) => (
                    <div key={apt.id} className="py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                            {apt.id}
                          </span>
                          <span className={`rounded-full px-2 py-0.2 text-[10px] font-bold uppercase ${
                            apt.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' :
                            apt.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                            apt.status === 'completed' ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {apt.status}
                          </span>
                          <span className="text-xs font-semibold text-slate-900">{apt.customerName}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          {apt.serviceName} &bull; {formatDatePretty(apt.date)} at {apt.timeSlot}
                        </p>
                      </div>

                      <div className="flex items-center space-x-1.5">
                        {apt.status === 'pending' && (
                          <button
                            onClick={() => updateAppointmentStatus(apt.id, 'confirmed')}
                            className="rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-emerald-700"
                          >
                            Accept
                          </button>
                        )}
                        {apt.status !== 'completed' && apt.status !== 'cancelled' && (
                          <button
                            onClick={() => updateAppointmentStatus(apt.id, 'completed')}
                            className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-200"
                          >
                            Mark Done
                          </button>
                        )}
                        {apt.status !== 'cancelled' && (
                          <button
                            onClick={() => {
                              setRejectTargetId(apt.id);
                              setRejectReason('');
                            }}
                            className="rounded-lg bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-700 hover:bg-rose-100"
                          >
                            Reject
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions Panel */}
              <div className="lg:col-span-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
                <h3 className="font-display text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                  Admin Shortcuts
                </h3>

                <div className="space-y-2.5">
                  <button
                    onClick={handleOpenAddService}
                    className="w-full flex items-center justify-between rounded-2xl border border-slate-200 p-3 hover:bg-slate-50 text-left transition-colors"
                  >
                    <div className="flex items-center space-x-2.5">
                      <Plus className="h-4 w-4 text-indigo-600" />
                      <span className="text-xs font-semibold text-slate-800">Add New Service</span>
                    </div>
                    <span className="text-[11px] text-slate-400">Configure</span>
                  </button>

                  <button
                    onClick={() => setAdminTab('schedule')}
                    className="w-full flex items-center justify-between rounded-2xl border border-slate-200 p-3 hover:bg-slate-50 text-left transition-colors"
                  >
                    <div className="flex items-center space-x-2.5">
                      <Clock className="h-4 w-4 text-indigo-600" />
                      <span className="text-xs font-semibold text-slate-800">Manage Daily Slots</span>
                    </div>
                    <span className="text-[11px] text-slate-400">Update</span>
                  </button>

                  <button
                    onClick={() => setAdminTab('emails')}
                    className="w-full flex items-center justify-between rounded-2xl border border-slate-200 p-3 hover:bg-slate-50 text-left transition-colors"
                  >
                    <div className="flex items-center space-x-2.5">
                      <Mail className="h-4 w-4 text-indigo-600" />
                      <span className="text-xs font-semibold text-slate-800">View Email Outbox</span>
                    </div>
                    <span className="text-[11px] text-slate-400">{emailLogs.length} logs</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Appointments Table */}
        {adminTab === 'appointments' && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-display text-base font-bold text-slate-900">
                  Appointment Database
                </h3>
                <p className="text-xs text-slate-500">
                  Filter, confirm, reject, or update statuses in real-time
                </p>
              </div>

              {/* Filter controls */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search ID, name, email..."
                    className="rounded-xl border border-slate-200 pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="rounded-xl border border-slate-200 px-2.5 py-1 text-xs text-slate-700"
                />

                {(searchQuery || statusFilter !== 'all' || dateFilter) && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setStatusFilter('all');
                      setDateFilter('');
                    }}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold px-2"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px]">
                    <th className="pb-3 pl-2">Booking ID</th>
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">Service</th>
                    <th className="pb-3">Date &amp; Slot</th>
                    <th className="pb-3">Price</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 pr-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAppointments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        No appointments match criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredAppointments.map((apt) => (
                      <tr key={apt.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 pl-2 font-mono font-bold text-slate-900">{apt.id}</td>
                        <td className="py-3">
                          <p className="font-semibold text-slate-900">{apt.customerName}</p>
                          <p className="text-[11px] text-slate-400">{apt.customerEmail} &bull; {apt.customerPhone}</p>
                        </td>
                        <td className="py-3">
                          <span className="font-medium text-slate-800">{apt.serviceName}</span>
                        </td>
                        <td className="py-3">
                          <p className="font-medium text-slate-900">{formatDatePretty(apt.date)}</p>
                          <p className="text-[11px] text-slate-500">{apt.timeSlot}</p>
                        </td>
                        <td className="py-3 font-semibold text-slate-900">${apt.servicePrice}</td>
                        <td className="py-3">
                          <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                            apt.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' :
                            apt.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                            apt.status === 'completed' ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {apt.status}
                          </span>
                        </td>
                        <td className="py-3 pr-2 text-right">
                          <div className="flex items-center justify-end space-x-1">
                            {apt.status !== 'confirmed' && apt.status !== 'completed' && (
                              <button
                                onClick={() => updateAppointmentStatus(apt.id, 'confirmed')}
                                className="rounded-lg bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100"
                                title="Approve Booking"
                              >
                                Accept
                              </button>
                            )}

                            {apt.status === 'confirmed' && (
                              <button
                                onClick={() => updateAppointmentStatus(apt.id, 'completed')}
                                className="rounded-lg bg-blue-50 px-2 py-1 text-[11px] font-semibold text-blue-700 hover:bg-blue-100"
                                title="Mark Completed"
                              >
                                Complete
                              </button>
                            )}

                            {apt.status !== 'cancelled' && (
                              <button
                                onClick={() => {
                                  setRejectTargetId(apt.id);
                                  setRejectReason('');
                                }}
                                className="rounded-lg bg-rose-50 px-2 py-1 text-[11px] font-semibold text-rose-700 hover:bg-rose-100"
                                title="Reject or cancel appointment"
                              >
                                Reject
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: Schedule & Slots Manager */}
        {adminTab === 'schedule' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Default Time Slots */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
              <h3 className="font-display text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                Default Daily Time Slots
              </h3>
              <p className="text-xs text-slate-500">
                These slots are automatically presented to customers on all operating working days.
              </p>

              <form onSubmit={handleAddDefaultSlot} className="flex gap-2">
                <input
                  type="text"
                  value={newSlotInput}
                  onChange={(e) => setNewSlotInput(e.target.value)}
                  placeholder="e.g. 05:30 PM"
                  className="flex-1 rounded-xl border border-slate-200 p-2 text-xs"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
                >
                  Add Slot
                </button>
              </form>

              <div className="flex flex-wrap gap-2 pt-2">
                {scheduleConfig.defaultTimeSlots.map((slot, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center rounded-xl bg-slate-100 border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-800"
                  >
                    <span>{slot}</span>
                    <button
                      onClick={() => handleRemoveDefaultSlot(slot)}
                      className="ml-2 text-slate-400 hover:text-rose-600"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Blocked Dates (Holidays / Days Off) */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
              <h3 className="font-display text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                Blackout &amp; Blocked Dates
              </h3>
              <p className="text-xs text-slate-500">
                Block booking for holidays, facility maintenance, or specialist off-days.
              </p>

              <form onSubmit={handleBlockDate} className="flex gap-2">
                <input
                  type="date"
                  value={blockDateInput}
                  onChange={(e) => setBlockDateInput(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="flex-1 rounded-xl border border-slate-200 p-2 text-xs"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                >
                  Block Date
                </button>
              </form>

              <div className="space-y-2 pt-2">
                {scheduleConfig.blockedDates.length === 0 ? (
                  <p className="text-xs text-slate-400">No dates currently blocked.</p>
                ) : (
                  scheduleConfig.blockedDates.map((d, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-xl bg-rose-50 p-2.5 text-xs text-rose-800 border border-rose-200"
                    >
                      <span className="font-semibold">{formatDatePretty(d)}</span>
                      <button
                        onClick={() => toggleDateBlock(d)}
                        className="text-[11px] font-bold text-rose-600 hover:text-rose-900"
                      >
                        Unblock
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Services Manager */}
        {adminTab === 'services' && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-display text-base font-bold text-slate-900">
                  Appointment Services Roster
                </h3>
                <p className="text-xs text-slate-500">
                  Add, update fees, modify duration, or deactivate services
                </p>
              </div>

              <button
                onClick={handleOpenAddService}
                className="inline-flex items-center rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 shadow-sm"
              >
                <Plus className="mr-1.5 h-4 w-4" />
                Add New Service
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map((svc) => (
                <div
                  key={svc.id}
                  className="rounded-2xl border border-slate-200 p-4 space-y-3 bg-white flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600">
                        {svc.category}
                      </span>
                      <span className="font-bold text-slate-900 text-sm">${svc.price}</span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-sm mt-2">{svc.name}</h4>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{svc.description}</p>
                  </div>

                  <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">{svc.durationMinutes} min &bull; {svc.providerName}</span>

                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => handleOpenEditService(svc)}
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-indigo-600"
                        title="Edit service"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteService(svc.id)}
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                        title="Delete service"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: Customer Directory */}
        {adminTab === 'customers' && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <h3 className="font-display text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Customer Registry
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {users.map((u) => {
                const bookingCount = appointments.filter(
                  (a) => a.customerEmail.toLowerCase() === u.email.toLowerCase()
                ).length;

                return (
                  <div key={u.id} className="rounded-2xl border border-slate-200 p-4 space-y-2 bg-white">
                    <div className="flex items-center space-x-3">
                      <img
                        src={u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=128&q=80'}
                        alt={u.name}
                        className="h-10 w-10 rounded-full object-cover ring-1 ring-slate-200"
                      />
                      <div>
                        <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{u.name}</h4>
                        <p className="text-[11px] text-slate-400">{u.email}</p>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-2 flex items-center justify-between text-xs text-slate-600">
                      <span>Phone: {u.phone}</span>
                      <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                        {bookingCount} {bookingCount === 1 ? 'Booking' : 'Bookings'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 6: Email Logs */}
        {adminTab === 'emails' && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-display text-base font-bold text-slate-900">
                  Email Dispatch Audit Log
                </h3>
                <p className="text-xs text-slate-500">
                  Review all simulated confirmation and cancellation messages sent by the system
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {emailLogs.length === 0 ? (
                <p className="py-8 text-center text-xs text-slate-400">
                  No automated emails logged yet. Book an appointment to trigger instant dispatch.
                </p>
              ) : (
                emailLogs.map((log) => (
                  <div key={log.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-slate-900 text-xs">{log.subject}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(log.sentAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        To: {log.recipientName} ({log.recipientEmail}) &bull; Ref: {log.appointment.id}
                      </p>
                    </div>

                    <button
                      onClick={() => setActiveEmailPreview(log)}
                      className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 shadow-xs"
                    >
                      <Eye className="mr-1 h-3.5 w-3.5" />
                      View Preview
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {rejectTargetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Reject / Cancel Booking</h3>
            <p className="text-xs text-slate-500">
              Provide a reason to notify the client via automated email.
            </p>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Practitioner unavailable due to surgery; kindly reschedule..."
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setRejectTargetId(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Back
              </button>
              <button
                onClick={() => {
                  updateAppointmentStatus(rejectTargetId, 'cancelled', rejectReason);
                  setRejectTargetId(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Service Add/Edit Modal */}
      {isServiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">
              {editingServiceId ? 'Edit Service' : 'Add New Appointment Service'}
            </h3>

            <form onSubmit={handleSaveService} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Service Title</label>
                <input
                  type="text"
                  required
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  placeholder="e.g. Dental Health Inspection"
                  className="w-full rounded-xl border border-slate-200 p-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={serviceCategory}
                    onChange={(e) => setServiceCategory(e.target.value as Service['category'])}
                    className="w-full rounded-xl border border-slate-200 p-2 text-xs"
                  >
                    <option value="Consultation">Consultation</option>
                    <option value="Health & Wellness">Health & Wellness</option>
                    <option value="Tech & Digital">Tech & Digital</option>
                    <option value="Legal & Finance">Legal & Finance</option>
                    <option value="Coaching & Lifestyle">Coaching & Lifestyle</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Price ($)</label>
                  <input
                    type="number"
                    required
                    value={servicePrice}
                    onChange={(e) => setServicePrice(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Duration (min)</label>
                  <input
                    type="number"
                    required
                    value={serviceDuration}
                    onChange={(e) => setServiceDuration(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 p-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Provider Specialist Name</label>
                <input
                  type="text"
                  value={serviceProvider}
                  onChange={(e) => setServiceProvider(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  required
                  value={serviceDesc}
                  onChange={(e) => setServiceDesc(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2 text-xs"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsServiceModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl"
                >
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
