import React, { useEffect, useState } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Header from "./components/Header";
import Hero from "./components/Hero";
import About from "./components/About";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import Login from "./components/Login";
import Register from "./components/Register";
import UserDashboard from "./components/UserDashboard";
import UserProfile from "./components/UserProfile";
import BookingPage from "./components/BookingPage";
import BookingConfirmation from "./components/BookingConfirmation";
import TrackPackage from "./components/TrackPackage";
import RecentBookings from "./components/RecentBookings";
import ResetPassword from "./components/ResetPassword";

const AppContent: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  const [currentView, setCurrentView] = useState<
    | "home"
    | "login"
    | "register"
    | "dashboard"
    | "profile"
    | "booking"
    | "confirmation"
    | "track"
    | "recent-bookings"
    | "reset-password"
  >("home");

  const [bookingData, setBookingData] = useState<any>(null);
  const [bookingId, setBookingId] = useState<string>("");

  // smooth scrolling CSS
  useEffect(() => {
    document.documentElement.style.scrollPaddingTop = "5rem";
    document.documentElement.style.scrollBehavior = "smooth";
  }, []);

  // auth-based redirect
  useEffect(() => {
    if (isAuthenticated && ["home", "login", "register"].includes(currentView)) {
      setCurrentView("dashboard");
    }
    if (
      !isAuthenticated &&
      ["dashboard", "profile", "booking"].includes(currentView)
    ) {
      setCurrentView("home");
    }
  }, [isAuthenticated, currentView]);

  // browser back/forward support
  useEffect(() => {
    if (!loading) {
      window.history.pushState({ view: currentView }, "", "");
    }
  }, [currentView, loading]);

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state?.view) {
        setCurrentView(event.state.view);
      } else {
        setCurrentView("home");
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

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

  // handlers
  const handleLoginClick = () => setCurrentView("login");
  const handleRegisterClick = () => setCurrentView("register");
  const handleBackToHome = () => setCurrentView("home");
  const handleSwitchToLogin = () => setCurrentView("login");
  const handleSwitchToRegister = () => setCurrentView("register");
  const handleStartBooking = () =>
    setCurrentView(isAuthenticated ? "booking" : "login");
  const handleProfileClick = () => setCurrentView("profile");
  const handleBackToDashboard = () => setCurrentView("dashboard");
  const handleBookingComplete = (id: string, data: any) => {
    setBookingId(id);
    setBookingData(data);
    setCurrentView("confirmation");
  };
  const onBookingComplete = (bookingId: string, bookingData: any) =>
    handleBookingComplete(bookingId, bookingData);
  const handleTrackPackage = () => setCurrentView("track");
  const handleRecentBookings = () => setCurrentView("recent-bookings");
  const handleResetPassword = () => setCurrentView("reset-password");

  // views
  if (currentView === "recent-bookings") {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-red-50 text-gray-800">
        <Header onProfileClick={handleProfileClick} />
        <RecentBookings onBack={handleBackToDashboard} />
        <Footer />
      </div>
    );
  }

  if (currentView === "login") {
    return (
      <Login
        onBack={handleBackToHome}
        onSwitchToRegister={handleSwitchToRegister}
        onForgotPassword={handleResetPassword}
      />
    );
  }

  if (currentView === "register") {
    return (
      <Register
        onBack={handleBackToHome}
        onSwitchToLogin={handleSwitchToLogin}
      />
    );
  }

  if (currentView === "dashboard") {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-red-50 text-gray-800">
        <Header onProfileClick={handleProfileClick} />
        <UserDashboard
          onStartBooking={handleStartBooking}
          onTrackPackage={handleTrackPackage}
          onViewAllBookings={handleRecentBookings}
        />
        <Footer />
      </div>
    );
  }

  if (currentView === "reset-password") {
    return <ResetPassword onBack={handleBackToHome} />;
  }

  if (currentView === "profile") {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-red-50 text-gray-800">
        <Header onProfileClick={handleProfileClick} />
        <UserProfile onBack={handleBackToDashboard} />
        <Footer />
      </div>
    );
  }

  if (currentView === "booking") {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-red-50 text-gray-800">
        <Header onProfileClick={handleProfileClick} />
        <BookingPage
          onBack={handleBackToDashboard}
          onBookingComplete={onBookingComplete}
        />
        <Footer />
      </div>
    );
  }

  if (currentView === "confirmation") {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-red-50 text-gray-800">
        <Header onProfileClick={handleProfileClick} />
        <BookingConfirmation
          onBackToDashboard={handleBackToDashboard}
          bookingId={bookingId}
          bookingData={bookingData}
        />
        <Footer />
      </div>
    );
  }

  if (currentView === "track") {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-red-50 text-gray-800">
        <Header onProfileClick={handleProfileClick} />
        <TrackPackage onBack={handleBackToDashboard} />
        <Footer />
      </div>
    );
  }

  // home
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
