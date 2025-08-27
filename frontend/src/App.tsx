import React, { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Contact from './components/Contact';
import Footer from './components/Footer';
import Login from './components/Login';
import Register from './components/Register';
import UserDashboard from './components/UserDashboard';
import UserProfile from './components/UserProfile';
import BookingPage from './components/BookingPage';
import BookingConfirmation from './components/BookingConfirmation';
import TrackPackage from './components/TrackPackage';

const AppContent: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  const [currentView, setCurrentView] = useState<'home' | 'login' | 'register' | 'dashboard' | 'profile' | 'booking' | 'confirmation' | 'track' | 'google-register'>('home');
  const [bookingData, setBookingData] = useState<any>(null);
  const [bookingId, setBookingId] = useState<string>('');
  

  useEffect(() => {
    // Add smooth scrolling CSS
    document.documentElement.style.scrollPaddingTop = '5rem';
    document.documentElement.style.scrollBehavior = 'smooth';
  }, []);

  useEffect(() => {
    // Redirect to dashboard if user is authenticated and on home/login/register
    if (isAuthenticated && ['home', 'login', 'register'].includes(currentView)) {
      setCurrentView('dashboard');
    }
    // Redirect to home if user is not authenticated and on protected pages
    if (!isAuthenticated && ['dashboard', 'profile', 'booking'].includes(currentView)) {
      setCurrentView('home');
    }
  }, [isAuthenticated, currentView]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const handleLoginClick = () => {
    setCurrentView('login');
  };

  const handleRegisterClick = () => {
    setCurrentView('register');
  };

  const handleBackToHome = () => {
    setCurrentView('home');
  };

  const handleSwitchToLogin = () => {
    setCurrentView('login');
  };

  const handleSwitchToRegister = () => {
    setCurrentView('register');
  };

  const handleStartBooking = () => {
    if (isAuthenticated) {
      setCurrentView('booking');
    } else {
      setCurrentView('login');
    }
  };

  const handleProfileClick = () => {
    setCurrentView('profile');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
  };

  const handleBookingComplete = (id: string, data: any) => {
    setBookingId(id);
    setBookingData(data);
    setCurrentView('confirmation');
  };

  const onBookingComplete = (bookingId: string, bookingData: any) => {
    handleBookingComplete(bookingId, bookingData);
  };

  const handleTrackPackage = () => {
    setCurrentView('track');
  };



  if (currentView === 'login') {
    return (
      <Login 
        onBack={handleBackToHome}
        onSwitchToRegister={handleSwitchToRegister}
      />
    );
  }

  if (currentView === 'register') {
    return (
      <Register 
        onBack={handleBackToHome}
        onSwitchToLogin={handleSwitchToLogin}
  
      />
    );
  }



  if (currentView === 'dashboard') {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-red-50 text-gray-800">
        <Header 
          onProfileClick={handleProfileClick}
        />
        <UserDashboard 
          onStartBooking={handleStartBooking}
          onTrackPackage={handleTrackPackage}
        />
        <Footer />
      </div>
    );
  }

  if (currentView === 'profile') {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-red-50 text-gray-800">
        <Header 
          onProfileClick={handleProfileClick}
        />
        <UserProfile onBack={handleBackToDashboard} />
        <Footer />
      </div>
    );
  }

  if (currentView === 'booking') {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-red-50 text-gray-800">
        <Header 
          onProfileClick={handleProfileClick}
        />
        <BookingPage 
          onBack={handleBackToDashboard}
          onBookingComplete={onBookingComplete}
        />
        <Footer />
      </div>
    );
  }

  if (currentView === 'confirmation') {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-red-50 text-gray-800">
        <Header 
          onProfileClick={handleProfileClick}
        />
        <BookingConfirmation 
          onBackToDashboard={handleBackToDashboard}
          bookingId={bookingId}
          bookingData={bookingData}
        />
        <Footer />
      </div>
    );
  }

  if (currentView === 'track') {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-red-50 text-gray-800">
        <Header 
          onProfileClick={handleProfileClick}
        />
        <TrackPackage onBack={handleBackToDashboard} />
        <Footer />
      </div>
    );
  }


  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-red-50 text-gray-800">
      <Header 
        onLoginClick={handleLoginClick}
        onRegisterClick={handleRegisterClick}
        onProfileClick={handleProfileClick}
      />
      <main className="flex-1">
        <Hero onStartBooking={handleStartBooking} />
        <About />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;