import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './routes/ProtectedRoute';

import './styles/theme.css';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MyTrips from './pages/MyTrips';
import CreateTrip from './pages/CreateTrip';

import TripLayout from './components/trip/TripLayout';
import TripOverview from './pages/TripOverview';
import TripItinerary from './pages/TripItinerary';
import TripWeather from './pages/TripWeather';
import TripPacking from './pages/TripPacking';
import TripBudget from './pages/TripBudget';
import TripMap from './pages/TripMap';

function App() {
  return (
    <Router>
      <ThemeProvider>
        <NotificationProvider>
          <AuthProvider>
            <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/trips" element={<MyTrips />} />
              <Route path="/trips/new" element={<CreateTrip />} />
              <Route path="/trips/:id/edit" element={<CreateTrip />} />
              
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
            
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
          <ToastContainer position="top-right" autoClose={3000} hideProgressBar={true} />
          </AuthProvider>
        </NotificationProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
