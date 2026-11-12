import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ShieldCheck, Activity, MapPin, CheckCircle2, Lock, ArrowUpRight } from 'lucide-react';

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
import OsintVerification from './pages/admin/OsintVerification';

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
          <div className="min-h-screen bg-[#fff9fc] text-[#1f132b] flex flex-col font-sans selection:bg-pink-100 selection:text-pink-600 relative candy-bg-mesh">
            {/* Background subtle candy ambient glows */}
            <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_15%_10%,rgba(255,228,240,0.6)_0%,rgba(255,249,252,0.8)_45%,rgba(247,239,249,0.7)_100%)]" />
            <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_60%_60%_at_80%_100%,rgba(224,64,160,0.05),rgba(255,255,255,0))]" />

            <DisclaimerBanner />
            <Navbar />
            
            <main className="flex-1 w-full relative z-10">
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
                <Route
                  path="/admin/osint"
                  element={
                    <ProtectedAdminRoute>
                      <OsintVerification />
                    </ProtectedAdminRoute>
                  }
                />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>

            {/* Footer */}
            <footer className="border-t border-pink-100 bg-white/70 backdrop-blur-xl relative z-20 py-10">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                  <div className="md:col-span-2 space-y-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-500 to-rose-400 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-pink-200">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <span className="font-['Plus_Jakarta_Sans',sans-serif] font-extrabold text-lg text-gray-900 tracking-tight">
                        Civic<span className="text-[#e040a0]">Trust</span>
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-pink-100 text-pink-700 border border-pink-200">
                        v3.4 Candy Core
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 max-w-md leading-relaxed">
                      Next-generation municipal grievance resolution and anti-fake resolution verification infrastructure. Powered by autonomous 3-Signal verification (GPS Haversine, Delta Computer Vision, & SLA Timestamping).
                    </p>
                    <div className="flex items-center gap-3 pt-2 text-[11px] text-gray-400">
                      <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Live Mesh Active
                      </span>
                      <span>•</span>
                      <span>Problem Statement PS-D04</span>
                      <span>•</span>
                      <span>Zero Fake Resolution Standard</span>
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-3 font-['Plus_Jakarta_Sans',sans-serif]">
                      Citizen Services
                    </div>
                    <ul className="space-y-2 text-xs text-gray-500">
                      <li>
                        <Link to="/citizen/report" className="hover:text-[#e040a0] transition-colors flex items-center gap-1">
                          <span>Report Civic Grievance</span>
                          <ArrowUpRight className="w-3 h-3 text-pink-400" />
                        </Link>
                      </li>
                      <li>
                        <Link to="/citizen/dashboard" className="hover:text-[#e040a0] transition-colors flex items-center gap-1">
                          <span>Citizen Dashboard</span>
                        </Link>
                      </li>
                      <li>
                        <Link to="/citizen/complaints" className="hover:text-[#e040a0] transition-colors flex items-center gap-1">
                          <span>Track Grievance Timeline</span>
                        </Link>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <div className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-3 font-['Plus_Jakarta_Sans',sans-serif]">
                      Municipal Command
                    </div>
                    <ul className="space-y-2 text-xs text-gray-500">
                      <li>
                        <Link to="/admin/dashboard" className="hover:text-[#e040a0] transition-colors flex items-center gap-1">
                          <span>Operational Command Center</span>
                          <ArrowUpRight className="w-3 h-3 text-pink-400" />
                        </Link>
                      </li>
                      <li>
                        <Link to="/admin/verification" className="hover:text-[#e040a0] transition-colors flex items-center gap-1">
                          <span>Multi-Signal Verification Queue</span>
                        </Link>
                      </li>
                      <li>
                        <Link to="/admin/hotspots" className="hover:text-[#e040a0] transition-colors flex items-center gap-1">
                          <span>Ward Hotspot Radar</span>
                        </Link>
                      </li>
                      <li>
                        <Link to="/admin/analytics" className="hover:text-[#e040a0] transition-colors flex items-center gap-1">
                          <span>Ward SLA Performance</span>
                        </Link>
                      </li>
                      <li>
                        <Link to="/admin/osint" className="hover:text-[#e040a0] transition-colors flex items-center gap-1">
                          <span>OSINT Geolocation Hub</span>
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-pink-100 text-pink-700 border border-pink-200">NEW</span>
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="border-t border-pink-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-[#e040a0]" />
                    <span>CivicTrust Digital Governance Platform • "Resolved should mean resolved."</span>
                  </div>
                  <div className="text-[11px] text-gray-400">
                    © 2026 Decentralized Verification Infrastructure
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </Router>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
