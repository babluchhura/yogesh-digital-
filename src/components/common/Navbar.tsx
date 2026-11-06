import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Calendar,
  Bell,
  User,
  Shield,
  LogOut,
  ChevronDown,
  Menu,
  X,
  CheckCircle,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    isAdmin,
    logout,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    openBookingModal,
    openAuthModal,
    currentView,
    setCurrentView,
    setActiveEmailPreview,
    emailLogs,
  } = useApp();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const navigateToSection = (sectionId: string) => {
    if (currentView !== 'home') {
      setCurrentView('home');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md transition-all">
      {/* Top Notice Bar */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 px-4 py-1.5 text-xs font-medium text-white shadow-inner">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center rounded-full bg-emerald-500/20 px-2 py-0.5 text-emerald-300 ring-1 ring-emerald-500/30">
              <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Booking Engine
            </span>
            <span className="hidden sm:inline text-indigo-100">
              Double-booking protected &bull; Instant confirmation &bull; 24/7 availability
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => {
                if (isAdmin) setCurrentView('admin_dashboard');
                else if (currentUser) setCurrentView('customer_dashboard');
                else openAuthModal('login');
              }}
              className="text-indigo-200 hover:text-white transition-colors truncate max-w-[160px] sm:max-w-none text-right"
            >
              {isAdmin ? 'Admin Portal Active' : currentUser ? `Signed in as ${currentUser.name.split(' ')[0]}` : 'Sign In'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        {/* Brand */}
        <button
          onClick={() => setCurrentView('home')}
          className="group flex items-center space-x-3 text-left focus:outline-none"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 text-white shadow-md shadow-indigo-600/20 group-hover:scale-105 transition-transform">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-display text-xl font-bold tracking-tight text-slate-900">
                Smart<span className="text-indigo-600">Booking</span>
              </span>
              <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-700 uppercase tracking-wider">
                Pro
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-500">Online Appointment Hub</p>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2 text-sm font-medium text-slate-600">
          <button
            onClick={() => setCurrentView('home')}
            className={`rounded-lg px-3 py-2 transition-colors ${
              currentView === 'home'
                ? 'bg-indigo-50 font-semibold text-indigo-700'
                : 'hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => navigateToSection('services-section')}
            className="rounded-lg px-3 py-2 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            Services
          </button>
          <button
            onClick={() => navigateToSection('why-us-section')}
            className="rounded-lg px-3 py-2 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            Why Choose Us
          </button>
          <button
            onClick={() => navigateToSection('testimonials-section')}
            className="rounded-lg px-3 py-2 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            Reviews
          </button>
          <button
            onClick={() => navigateToSection('contact-section')}
            className="rounded-lg px-3 py-2 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            Contact
          </button>

          {/* Quick links to Dashboards */}
          {currentUser && (
            <button
              onClick={() => setCurrentView('customer_dashboard')}
              className={`rounded-lg px-3 py-2 transition-colors ${
                currentView === 'customer_dashboard'
                  ? 'bg-indigo-50 font-semibold text-indigo-700'
                  : 'hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              My Bookings
            </button>
          )}

          {isAdmin && (
            <button
              onClick={() => setCurrentView('admin_dashboard')}
              className={`flex items-center space-x-1 rounded-lg px-3 py-2 transition-colors ${
                currentView === 'admin_dashboard'
                  ? 'bg-amber-50 font-semibold text-amber-800 ring-1 ring-amber-200'
                  : 'text-amber-700 hover:bg-amber-50/80'
              }`}
            >
              <Shield className="h-4 w-4" />
              <span>Admin Panel</span>
            </button>
          )}
        </nav>

        {/* Right Action Icons & Auth */}
        <div className="flex items-center space-x-2.5 sm:space-x-3">
          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors focus:outline-none"
              aria-label="View notifications"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white shadow-sm ring-2 ring-white animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Menu */}
            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2 px-2">
                  <div className="flex items-center space-x-1.5">
                    <span className="font-semibold text-slate-900">Notifications</span>
                    <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-700">
                      {notifications.length}
                    </span>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllNotificationsRead}
                      className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 py-1">
                  {notifications.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-500">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.slice(0, 6).map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => markNotificationRead(notif.id)}
                        className={`group p-2.5 rounded-xl transition-colors cursor-pointer ${
                          notif.read ? 'bg-white hover:bg-slate-50' : 'bg-indigo-50/60 hover:bg-indigo-50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <p className="text-xs font-semibold text-slate-900">{notif.title}</p>
                          <span className="text-[10px] text-slate-400">
                            {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-600 leading-relaxed">{notif.message}</p>

                        {/* If this notification generated an email, option to preview */}
                        {emailLogs.some((e) => e.appointment.id === notif.appointmentId) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const record = emailLogs.find((em) => em.appointment.id === notif.appointmentId);
                              if (record) {
                                setActiveEmailPreview(record);
                                setIsNotifOpen(false);
                              }
                            }}
                            className="mt-2 inline-flex items-center text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
                          >
                            <ExternalLink className="mr-1 h-3 w-3" />
                            View Simulated Email
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Account / Sign In */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-2 rounded-xl border border-slate-200 bg-white p-1.5 pr-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors focus:outline-none"
              >
                <img
                  src={currentUser.avatar || '/assets/aistudio/20261105_130008_fb835139.jpg'}
                  alt={currentUser.name}
                  className="h-7 w-7 rounded-lg object-cover ring-1 ring-slate-200"
                />
                <span className="hidden sm:inline max-w-[120px] truncate">{currentUser.name}</span>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl z-50 animate-in fade-in duration-150">
                  <div className="border-b border-slate-100 px-3 py-2">
                    <p className="text-xs font-semibold text-slate-900">{currentUser.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                    <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      currentUser.role === 'admin'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-indigo-100 text-indigo-800'
                    }`}>
                      {currentUser.role === 'admin' ? 'Administrator' : 'Customer Account'}
                    </span>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setCurrentView('customer_dashboard');
                        setIsUserMenuOpen(false);
                      }}
                      className="flex w-full items-center px-3 py-2 text-xs font-medium text-slate-700 rounded-lg hover:bg-slate-100"
                    >
                      <User className="mr-2 h-4 w-4 text-slate-400" />
                      Customer Dashboard
                    </button>

                    {isAdmin && (
                      <button
                        onClick={() => {
                          setCurrentView('admin_dashboard');
                          setIsUserMenuOpen(false);
                        }}
                        className="flex w-full items-center px-3 py-2 text-xs font-medium text-amber-800 rounded-lg hover:bg-amber-50"
                      >
                        <Shield className="mr-2 h-4 w-4 text-amber-600" />
                        Admin Dashboard
                      </button>
                    )}

                    <button
                      onClick={() => {
                        logout();
                        setIsUserMenuOpen(false);
                      }}
                      className="flex w-full items-center px-3 py-2 text-xs font-medium text-rose-600 rounded-lg hover:bg-rose-50"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => openAuthModal('login')}
              className="hidden sm:inline-flex items-center space-x-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-sm transition-colors"
            >
              <User className="h-4 w-4 text-slate-500" />
              <span>Sign In</span>
            </button>
          )}

          {/* Primary CTA Book Appointment (visible on sm and up; mobile has hero CTA + hamburger menu) */}
          <button
            onClick={() => openBookingModal()}
            className="hidden sm:inline-flex items-center space-x-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-md shadow-indigo-600/30 hover:from-indigo-700 hover:to-indigo-800 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <Sparkles className="h-4 w-4" />
            <span className="whitespace-nowrap">Book Appointment</span>
          </button>

          {/* Quick Book Button on mobile (< sm) */}
          <button
            onClick={() => openBookingModal()}
            className="sm:hidden flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm hover:bg-indigo-700"
            aria-label="Book appointment"
            title="Book appointment"
          >
            <Sparkles className="h-4 w-4" />
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 focus:outline-none"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 shadow-xl animate-in slide-in-from-top duration-200">
          <div className="flex flex-col space-y-1">
            <button
              onClick={() => {
                setCurrentView('home');
                setIsMobileMenuOpen(false);
              }}
              className="text-left px-3 py-2 text-sm font-medium rounded-lg hover:bg-slate-100 text-slate-800"
            >
              Home
            </button>
            <button
              onClick={() => navigateToSection('services-section')}
              className="text-left px-3 py-2 text-sm font-medium rounded-lg hover:bg-slate-100 text-slate-800"
            >
              Our Services
            </button>
            <button
              onClick={() => navigateToSection('why-us-section')}
              className="text-left px-3 py-2 text-sm font-medium rounded-lg hover:bg-slate-100 text-slate-800"
            >
              Why Choose Us
            </button>
            <button
              onClick={() => navigateToSection('testimonials-section')}
              className="text-left px-3 py-2 text-sm font-medium rounded-lg hover:bg-slate-100 text-slate-800"
            >
              Customer Reviews
            </button>
            <button
              onClick={() => navigateToSection('contact-section')}
              className="text-left px-3 py-2 text-sm font-medium rounded-lg hover:bg-slate-100 text-slate-800"
            >
              Contact Us
            </button>

            <div className="border-t border-slate-100 my-2 pt-2">
              {currentUser ? (
                <>
                  <button
                    onClick={() => {
                      setCurrentView('customer_dashboard');
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex w-full items-center px-3 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 rounded-lg"
                  >
                    <User className="mr-2 h-4 w-4" />
                    Customer Dashboard
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => {
                        setCurrentView('admin_dashboard');
                        setIsMobileMenuOpen(false);
                      }}
                      className="mt-1 flex w-full items-center px-3 py-2 text-sm font-medium text-amber-800 bg-amber-50 rounded-lg"
                    >
                      <Shield className="mr-2 h-4 w-4" />
                      Admin Control Panel
                    </button>
                  )}
                  <button
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="mt-1 flex w-full items-center px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-lg"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    openAuthModal('login');
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex w-full items-center justify-center px-4 py-2.5 text-sm font-semibold text-slate-700 border border-slate-200 rounded-xl bg-slate-50"
                >
                  Sign In / Register
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
