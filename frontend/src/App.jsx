import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './routes/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';

import './styles/theme.css';

// Lazy load page-level routes to reduce initial bundle size
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const MyTrips = lazy(() => import('./pages/MyTrips'));
const CreateTrip = lazy(() => import('./pages/CreateTrip'));

const TripLayout = lazy(() => import('./components/trip/TripLayout'));
const TripOverview = lazy(() => import('./pages/TripOverview'));
const TripItinerary = lazy(() => import('./pages/TripItinerary'));
const TripWeather = lazy(() => import('./pages/TripWeather'));
const TripPacking = lazy(() => import('./pages/TripPacking'));
const TripBudget = lazy(() => import('./pages/TripBudget'));
const TripMap = lazy(() => import('./pages/TripMap'));
const AccountSettings = lazy(() => import('./pages/AccountSettings'));
const HelpSupport = lazy(() => import('./pages/HelpSupport'));

function App() {
  return (
    <Router>
      <ThemeProvider>
        <NotificationProvider>
          <AuthProvider>
            <Suspense fallback={
              <div className="flex items-center justify-center min-h-screen bg-[#F5F3EE]">
                <div className="w-12 h-12 border-4 border-[#4A90D9]/20 border-t-[#4A90D9] rounded-full animate-spin"></div>
              </div>
            }>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                
                <Route element={<ProtectedRoute />}>
                  <Route element={<MainLayout />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/trips" element={<MyTrips />} />
                    <Route path="/trips/new" element={<CreateTrip />} />
                    <Route path="/trips/:id/edit" element={<CreateTrip />} />
                    <Route path="/settings" element={<AccountSettings />} />
                    <Route path="/support" element={<HelpSupport />} />
                    
                    <Route path="/trips/:id" element={<TripLayout />}>
                      <Route index element={<TripOverview />} />
                      <Route path="itinerary" element={<TripItinerary />} />
                      <Route path="weather" element={<TripWeather />} />
                      <Route path="packing" element={<TripPacking />} />
                      <Route path="budget" element={<TripBudget />} />
                      <Route path="map" element={<TripMap />} />
                      <Route path="*" element={<TripOverview />} />
                    </Route>
                  </Route>
                </Route>
                
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Suspense>
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={true} />
          </AuthProvider>
        </NotificationProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
