import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { useKeycloak } from '@react-keycloak/web';

// Layouts
import AdminLayout from './components/layout/AdminLayout';
import GuestLayout from './components/layout/GuestLayout';

// Admin Pages
import Dashboard from './pages/admin/Dashboard';
import Rooms from './pages/admin/Rooms';
import Bookings from './pages/admin/Bookings';
import Guests from './pages/admin/Guests';

// Guest Pages
import Home from './pages/guest/Home';
import BookingFlow from './pages/guest/BookingFlow';
import UserDashboard from './pages/guest/UserDashboard';

// Utils
import PrivateRoute from './utils/PrivateRoute';
import UserSync from './components/UserSync'; // Added import for UserSync

const AppContent = () => {
  const { initialized } = useKeycloak();

  if (!initialized) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        {/* Guest Routes */}
        <Route element={<GuestLayout />}>
          <Route path="/" element={<Home />} />
          <Route
            path="/book/:roomId"
            element={
              <PrivateRoute roles={['guest', 'admin', 'staff']}>
                <BookingFlow />
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute roles={['guest', 'admin', 'staff']}>
                <UserDashboard />
              </PrivateRoute>
            }
          />
        </Route>

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <PrivateRoute roles={['admin']}>
              <AdminLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="rooms" element={<Rooms />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="guests" element={<Guests />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

const App = () => {
  return (
    <ToastProvider>
      <UserSync>
        <AppContent />
      </UserSync>
    </ToastProvider>
  );
};

export default App;
