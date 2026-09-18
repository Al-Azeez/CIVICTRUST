import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Components
import Navbar from './components/Navbar';
import DisclaimerBanner from './components/DisclaimerBanner';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

// Citizen Pages
import CitizenDashboard from './pages/citizen/CitizenDashboard';
import ReportIssue from './pages/citizen/ReportIssue';
import ComplaintList from './pages/citizen/ComplaintList';
import ComplaintDetail from './pages/citizen/ComplaintDetail';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminComplaints from './pages/admin/AdminComplaints';
import VerificationReview from './pages/admin/VerificationReview';
import HotspotDashboard from './pages/admin/HotspotDashboard';
import WardAnalytics from './pages/admin/WardAnalytics';

// Protected Route Guards
const ProtectedCitizenRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

const ProtectedAdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  if (isLoading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/citizen/dashboard" replace />;
  return children;
};

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
            <DisclaimerBanner />
            <Navbar />
            
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-16">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Citizen Routes */}
                <Route
                  path="/citizen/dashboard"
                  element={
                    <ProtectedCitizenRoute>
                      <CitizenDashboard />
                    </ProtectedCitizenRoute>
                  }
                />
                <Route
                  path="/citizen/report"
                  element={
                    <ProtectedCitizenRoute>
                      <ReportIssue />
                    </ProtectedCitizenRoute>
                  }
                />
                <Route
                  path="/citizen/complaints"
                  element={
                    <ProtectedCitizenRoute>
                      <ComplaintList />
                    </ProtectedCitizenRoute>
                  }
                />
                <Route
                  path="/citizen/complaints/:id"
                  element={
                    <ProtectedCitizenRoute>
                      <ComplaintDetail />
                    </ProtectedCitizenRoute>
                  }
                />

                {/* Admin / Reviewer Routes */}
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedAdminRoute>
                      <AdminDashboard />
                    </ProtectedAdminRoute>
                  }
                />
                <Route
                  path="/admin/complaints"
                  element={
                    <ProtectedAdminRoute>
                      <AdminComplaints />
                    </ProtectedAdminRoute>
                  }
                />
                <Route
                  path="/admin/verification"
                  element={
                    <ProtectedAdminRoute>
                      <VerificationReview />
                    </ProtectedAdminRoute>
                  }
                />
                <Route
                  path="/admin/hotspots"
                  element={
                    <ProtectedAdminRoute>
                      <HotspotDashboard />
                    </ProtectedAdminRoute>
                  }
                />
                <Route
                  path="/admin/analytics"
                  element={
                    <ProtectedAdminRoute>
                      <WardAnalytics />
                    </ProtectedAdminRoute>
                  }
                />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>

            {/* Footer */}
            <footer className="border-t border-slate-800/80 bg-slate-950 py-8 px-4 text-center text-xs text-slate-500 space-y-2">
              <div className="flex items-center justify-center gap-2 text-slate-400 font-semibold">
                <span>CivicTrust</span> • <span>"Resolved should mean resolved."</span> • <span className="text-emerald-400">PS-D04</span>
              </div>
              <p className="max-w-2xl mx-auto text-[11px] text-slate-500">
                Independent civic integrity verification system. Automated image analysis provides advisory classification without automated punishment.
              </p>
            </footer>
          </div>
        </Router>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
