import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import {
  ShieldCheck,
  PlusCircle,
  LayoutDashboard,
  ClipboardList,
  Flame,
  BarChart3,
  LogOut,
  User,
  Shield,
  RotateCcw,
  Menu,
  X,
  Sparkles,
  Layers,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Scan,
  Activity
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, isCitizen, logout, quickLogin } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleResetData = async () => {
    if (window.confirm('Reset all demo complaints, master incidents, and verifications back to baseline?')) {
      setIsResetting(true);
      try {
        await api.post('/seed/reset');
        addToast('Demo data successfully reset to baseline.', 'success');
        window.location.reload();
      } catch (error) {
        addToast('Failed to reset demo data', 'error');
      } finally {
        setIsResetting(false);
      }
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-pink-100 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Gov-Tech Badge */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-400 flex items-center justify-center shadow-md shadow-pink-200 group-hover:scale-105 transition-transform duration-300">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 5-4.5 9-9 9s-9-4-9-9 4-9 9-9 9 4 9 9z" />
                </svg>
              </div>

              <div className="flex flex-col">
                <span className="font-['Plus_Jakarta_Sans',sans-serif] text-xl font-extrabold tracking-tight text-gray-900">
                  Civic<span className="text-[#e040a0]">Trust</span>
                </span>
              </div>
            </Link>

            <div className="hidden xl:flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-50 border border-pink-200">
              <span className="w-2 h-2 rounded-full bg-[#e040a0] animate-pulse" />
              <span className="text-[10px] font-bold text-pink-700 uppercase tracking-wider">
                Real Issues. Real Evidence. Real Accountability.
              </span>
            </div>
          </div>

          {/* Navigation Links for Desktop */}
          <nav className="hidden lg:flex items-center gap-1 bg-pink-50/60 p-1 rounded-full border border-pink-200/80 backdrop-blur-md">
            {isAuthenticated ? (
              isAdmin ? (
                <>
                  <Link
                    to="/admin/dashboard"
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      isActive('/admin/dashboard')
                        ? 'bg-[#e040a0] text-white shadow-sm font-bold'
                        : 'text-gray-600 hover:text-[#e040a0] hover:bg-white/80'
                    }`}
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    Dashboard
                  </Link>
                  <Link
                    to="/admin/complaints"
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      isActive('/admin/complaints')
                        ? 'bg-[#e040a0] text-white shadow-sm font-bold'
                        : 'text-gray-600 hover:text-[#e040a0] hover:bg-white/80'
                    }`}
                  >
                    <ClipboardList className="w-3.5 h-3.5" />
                    Complaints
                  </Link>
                  <Link
                    to="/admin/verification"
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      isActive('/admin/verification')
                        ? 'bg-[#e040a0] text-white shadow-sm font-bold'
                        : 'text-gray-600 hover:text-[#e040a0] hover:bg-white/80'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Review Audits
                  </Link>
                  <Link
                    to="/admin/osint"
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      isActive('/admin/osint')
                        ? 'bg-[#e040a0] text-white shadow-sm font-bold'
                        : 'text-[#db2777] font-bold hover:text-[#be185d] hover:bg-white/80'
                    }`}
                  >
                    <Scan className="w-3.5 h-3.5" />
                    OSINT Verification
                  </Link>
                  <Link
                    to="/admin/hotspots"
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      isActive('/admin/hotspots')
                        ? 'bg-[#e040a0] text-white shadow-sm font-bold'
                        : 'text-gray-600 hover:text-[#e040a0] hover:bg-white/80'
                    }`}
                  >
                    <Flame className="w-3.5 h-3.5" />
                    Hotspots
                  </Link>
                  <Link
                    to="/admin/analytics"
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      isActive('/admin/analytics')
                        ? 'bg-[#e040a0] text-white shadow-sm font-bold'
                        : 'text-gray-600 hover:text-[#e040a0] hover:bg-white/80'
                    }`}
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    Analytics
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/citizen/dashboard"
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      isActive('/citizen/dashboard')
                        ? 'bg-[#e040a0] text-white shadow-sm font-bold'
                        : 'text-gray-600 hover:text-[#e040a0] hover:bg-white/80'
                    }`}
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    Citizen Portal
                  </Link>
                  <Link
                    to="/citizen/report"
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                      isActive('/citizen/report')
                        ? 'candy-pill-gradient text-white shadow-md shadow-pink-300'
                        : 'bg-pink-100 text-[#be185d] border border-pink-200 hover:bg-pink-200'
                    }`}
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    Report Issue
                  </Link>
                  <Link
                    to="/citizen/complaints"
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      isActive('/citizen/complaints')
                        ? 'bg-[#e040a0] text-white shadow-sm font-bold'
                        : 'text-gray-600 hover:text-[#e040a0] hover:bg-white/80'
                    }`}
                  >
                    <ClipboardList className="w-3.5 h-3.5" />
                    My Grievances
                  </Link>
                </>
              )
            ) : (
              <>
                <Link
                  to="/"
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                    isActive('/') ? 'bg-[#e040a0] text-white shadow-sm' : 'text-gray-600 hover:text-[#e040a0] hover:bg-white/80'
                  }`}
                >
                  Landing Page
                </Link>
                <Link
                  to="/citizen/dashboard"
                  className="px-3.5 py-1.5 rounded-full text-xs font-medium text-gray-600 hover:text-[#e040a0] hover:bg-white/80 transition-all"
                >
                  Citizen Portal
                </Link>
                <Link
                  to="/admin/dashboard"
                  className="px-3.5 py-1.5 rounded-full text-xs font-medium text-gray-600 hover:text-[#e040a0] hover:bg-white/80 transition-all"
                >
                  Admin Analytics
                </Link>
                <Link
                  to="/admin/osint"
                  className="px-3.5 py-1.5 rounded-full text-xs font-medium text-gray-600 hover:text-[#e040a0] hover:bg-white/80 transition-all"
                >
                  OSINT Verification
                </Link>
              </>
            )}
          </nav>

          {/* Right Action Bar: Live Mesh status, Quick Demo Role Switcher & User Profile */}
          <div className="hidden md:flex items-center gap-2.5">
            {/* Live Mesh Status Pill */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-xs text-emerald-700 font-semibold shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Live Mesh</span>
              <span className="text-emerald-600/70 border-l border-emerald-300 pl-1.5 text-[11px]">18ms</span>
            </div>

            {/* Quick Demo Switcher */}
            <div className="flex items-center bg-pink-50/80 border border-pink-200/90 rounded-full p-0.5 text-xs backdrop-blur-md">
              <span className="text-pink-700 px-2 flex items-center gap-1 text-[11px] font-bold">
                <Sparkles className="w-3 h-3 text-[#e040a0]" />
                Demo:
              </span>
              <button
                onClick={() => quickLogin('citizen')}
                className={`px-2.5 py-1 rounded-full transition-all text-[11px] font-bold flex items-center gap-1 ${
                  isCitizen
                    ? 'bg-[#e040a0] text-white shadow-xs'
                    : 'text-gray-700 hover:text-pink-700 hover:bg-white/80'
                }`}
                title="Log in as Abdul (Citizen)"
              >
                <User className="w-3 h-3" />
                Abdul
              </button>
              <button
                onClick={() => quickLogin('admin')}
                className={`px-2.5 py-1 rounded-full transition-all text-[11px] font-bold flex items-center gap-1 ${
                  isAdmin
                    ? 'bg-[#db2777] text-white shadow-xs'
                    : 'text-gray-700 hover:text-pink-700 hover:bg-white/80'
                }`}
                title="Log in as Azeez (Senior Verifier)"
              >
                <Shield className="w-3 h-3" />
                Azeez
              </button>
            </div>

            {/* Reset Data Button */}
            <button
              onClick={handleResetData}
              disabled={isResetting}
              className="p-1.5 text-pink-700 hover:text-pink-900 hover:bg-pink-100/70 rounded-full border border-pink-200 transition-all"
              title="Reset Demo Data to Baseline"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin text-[#e040a0]' : ''}`} />
            </button>

            {/* Auth / Profile Area */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2 pl-2 border-l border-pink-200">
                <div className="w-8 h-8 rounded-full bg-pink-100 border border-pink-200 flex items-center justify-center font-bold text-xs text-pink-700">
                  {user?.name ? user.name.substring(0, 2).toUpperCase() : 'AZ'}
                </div>
                <div className="hidden xl:block text-left text-xs leading-tight">
                  <p className="font-bold text-gray-800">{user?.name}</p>
                  <p className="text-gray-400 text-[10px]">{user?.role === 'admin' ? 'Senior Verifier' : user?.ward || 'Citizen'}</p>
                </div>
                <button
                  onClick={logout}
                  className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors ml-1"
                  title="Logout"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-xs font-semibold text-gray-700 hover:text-[#e040a0] rounded-full hover:bg-pink-50 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="candy-pill-gradient px-4 py-1.5 text-xs font-bold rounded-full text-white hover:opacity-95 shadow-md shadow-pink-200 transition-all"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-pink-50 rounded-full border border-pink-200"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-pink-200 bg-white/95 backdrop-blur-2xl px-4 pt-3 pb-6 space-y-3">
          <div className="flex flex-col gap-1.5">
            {isAuthenticated ? (
              isAdmin ? (
                <>
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3.5 py-2.5 rounded-full text-xs font-semibold text-gray-800 hover:bg-pink-50 flex items-center gap-2"
                  >
                    <LayoutDashboard className="w-4 h-4 text-[#e040a0]" /> Dashboard
                  </Link>
                  <Link
                    to="/admin/complaints"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3.5 py-2.5 rounded-full text-xs font-semibold text-gray-800 hover:bg-pink-50 flex items-center gap-2"
                  >
                    <ClipboardList className="w-4 h-4 text-[#db2777]" /> Complaints
                  </Link>
                  <Link
                    to="/admin/verification"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3.5 py-2.5 rounded-full text-xs font-semibold text-gray-800 hover:bg-pink-50 flex items-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-600" /> Review Audits
                  </Link>
                  <Link
                    to="/admin/hotspots"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3.5 py-2.5 rounded-full text-xs font-semibold text-gray-800 hover:bg-pink-50 flex items-center gap-2"
                  >
                    <Flame className="w-4 h-4 text-rose-500" /> Hotspots
                  </Link>
                  <Link
                    to="/admin/analytics"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3.5 py-2.5 rounded-full text-xs font-semibold text-gray-800 hover:bg-pink-50 flex items-center gap-2"
                  >
                    <BarChart3 className="w-4 h-4 text-purple-600" /> Ward Analytics
                  </Link>
                  <Link
                    to="/admin/osint"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3.5 py-2.5 rounded-full text-xs font-semibold text-[#be185d] hover:bg-pink-50 flex items-center gap-2"
                  >
                    <Scan className="w-4 h-4 text-[#e040a0]" /> OSINT Verification
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/citizen/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3.5 py-2.5 rounded-full text-xs font-semibold text-gray-800 hover:bg-pink-50 flex items-center gap-2"
                  >
                    <LayoutDashboard className="w-4 h-4 text-[#e040a0]" /> Dashboard
                  </Link>
                  <Link
                    to="/citizen/report"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3.5 py-2.5 rounded-full text-xs font-bold candy-pill-gradient text-white flex items-center gap-2"
                  >
                    <PlusCircle className="w-4 h-4" /> Report Issue
                  </Link>
                  <Link
                    to="/citizen/complaints"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3.5 py-2.5 rounded-full text-xs font-semibold text-gray-800 hover:bg-pink-50 flex items-center gap-2"
                  >
                    <ClipboardList className="w-4 h-4 text-[#db2777]" /> My Complaints
                  </Link>
                </>
              )
            ) : (
              <div className="flex flex-col gap-2 pt-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 text-xs font-semibold rounded-full bg-pink-50 text-gray-800 border border-pink-200"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 text-xs font-bold rounded-full candy-pill-gradient text-white shadow-md shadow-pink-300"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-pink-200 flex items-center justify-between">
            <span className="text-xs text-gray-500 font-medium">Quick Demo:</span>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  quickLogin('citizen');
                  setMobileMenuOpen(false);
                }}
                className="px-3 py-1 text-xs rounded-full bg-pink-100 border border-pink-300 text-pink-800 font-bold"
              >
                Abdul
              </button>
              <button
                onClick={() => {
                  quickLogin('admin');
                  setMobileMenuOpen(false);
                }}
                className="px-3 py-1 text-xs rounded-full bg-pink-200 border border-pink-300 text-pink-900 font-bold"
              >
                Azeez
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
