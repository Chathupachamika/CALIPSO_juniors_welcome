import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAuthStore } from './contexts/authStore';

// Layout
import MainLayout from './layouts/Mainlayout';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import LeaderboardPage from './pages/LeaderboardPage';
import EventsPage from './pages/EventsPage';
import ScanPage from './pages/ScanPage';
import QRCodeManager from './pages/admin/QRCodeManager';

function App() {
  const { loadFromStorage } = useAuthStore();

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Standalone: opened directly by scanning the physical QR code */}
        <Route path="/scan/:code" element={<ScanPage />} />

        {/* Protected Routes */}
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/qrcodes" element={<QRCodeManager />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;