import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { Toast } from './components/common/Toast';
import { EmailPreviewModal } from './components/common/EmailPreviewModal';
import { BookingModal } from './components/booking/BookingModal';
import { AuthModal } from './components/auth/AuthModal';
import { HeroSection } from './components/home/HeroSection';
import { ServicesSection } from './components/home/ServicesSection';
import { WhyChooseUsSection } from './components/home/WhyChooseUsSection';
import { TestimonialsSection } from './components/home/TestimonialsSection';
import { ContactSection } from './components/home/ContactSection';
import { CustomerDashboard } from './components/dashboard/CustomerDashboard';
import { AdminDashboard } from './components/dashboard/AdminDashboard';

const MainContent: React.FC = () => {
  const { currentView } = useApp();

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-1">
        {currentView === 'home' && (
          <>
            <HeroSection />
            <ServicesSection />
            <WhyChooseUsSection />
            <TestimonialsSection />
            <ContactSection />
          </>
        )}

        {currentView === 'customer_dashboard' && <CustomerDashboard />}

        {currentView === 'admin_dashboard' && <AdminDashboard />}
      </main>

      <Footer />

      {/* Global Interactive Modals */}
      <BookingModal />
      <AuthModal />
      <EmailPreviewModal />
      <Toast />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
