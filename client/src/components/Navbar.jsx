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
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, isCitizen, logout, quickLogin } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleResetData = async () => {
    if (window.confirm('Reset all demo complaints and verifications back to standard sample state?')) {
      setIsResetting(true);
      try {
        await api.post('/seed/reset');
        addToast('Demo data successfully reset to initial baseline.', 'success');
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
    <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Tagline */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-500 p-0.5 shadow-lg shadow-emerald-950/50 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-white font-['Outfit'] flex items-center gap-1.5">
                CivicTrust
                <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  PS-D04
                </span>
              </span>
              <span className="text-[11px] text-slate-400 font-medium tracking-wide">
                Resolved should mean resolved.
              </span>
            </div>
          </Link>

          {/* Navigation Links for Desktop */}
          <nav className="hidden md:flex items-center gap-1">
            {isAuthenticated ? (
              isAdmin ? (
                <>
                  <Link
                    to="/admin/dashboard"
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      isActive('/admin/dashboard')
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'text-slate-300 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                  <Link
                    to="/admin/complaints"
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      isActive('/admin/complaints')
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'text-slate-300 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    <ClipboardList className="w-4 h-4" />
                    Complaints
                  </Link>
                  <Link
                    to="/admin/verification"
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      isActive('/admin/verification')
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'text-slate-300 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    Review Suspicious
                  </Link>
                  <Link
                    to="/admin/hotspots"
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      isActive('/admin/hotspots')
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'text-slate-300 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    <Flame className="w-4 h-4 text-rose-400" />
                    Hotspot Map
                  </Link>
                  <Link
                    to="/admin/analytics"
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      isActive('/admin/analytics')
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'text-slate-300 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4" />
                    Ward Analytics
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/citizen/dashboard"
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      isActive('/citizen/dashboard')
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'text-slate-300 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                  <Link
                    to="/citizen/report"
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      isActive('/citizen/report')
                        ? 'bg-emerald-600 text-white font-semibold shadow-lg shadow-emerald-950/50'
                        : 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30'
                    }`}
                  >
                    <PlusCircle className="w-4 h-4" />
                    Report Issue
                  </Link>
                  <Link
                    to="/citizen/complaints"
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      isActive('/citizen/complaints')
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'text-slate-300 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    <ClipboardList className="w-4 h-4" />
                    My Complaints
                  </Link>
                </>
              )
            ) : (
              <>
                <Link
                  to="/"
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/') ? 'text-emerald-400' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Overview
                </Link>
              </>
            )}
          </nav>

          {/* Right Action Bar: Quick Role Switcher + Auth + Reset */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Quick 1-Click Role Switcher for Hackathon Testing */}
            <div className="flex items-center bg-slate-900/90 border border-slate-800 rounded-lg p-1 text-xs">
              <span className="text-slate-500 px-2 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                Demo:
              </span>
              <button
                onClick={() => quickLogin('citizen')}
                className={`px-2 py-1 rounded transition-colors font-medium flex items-center gap-1 ${
                  isCitizen
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
                title="Log in as Citizen (Aarav Sharma)"
              >
                <User className="w-3 h-3" />
                Citizen
              </button>
              <button
                onClick={() => quickLogin('admin')}
                className={`px-2 py-1 rounded transition-colors font-medium flex items-center gap-1 ${
                  isAdmin
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
                title="Log in as Reviewer (Municipal Review Officer)"
              >
                <Shield className="w-3 h-3" />
                Reviewer
              </button>
            </div>

            {/* Reset Button */}
            <button
              onClick={handleResetData}
              disabled={isResetting}
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-lg border border-slate-800 transition-colors"
              title="Reset Demo Data"
            >
              <RotateCcw className={`w-4 h-4 ${isResetting ? 'animate-spin' : ''}`} />
            </button>

            {/* User Profile / Login */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                <div className="flex flex-col text-right">
                  <span className="text-xs font-semibold text-white leading-tight">
                    {user?.name}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-medium uppercase tracking-wider">
                    {user?.role}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 rounded-lg border border-transparent hover:border-rose-900/30 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-sm font-medium text-slate-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 text-sm font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950 transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-950/95 backdrop-blur-lg px-4 pt-2 pb-6 space-y-3">
          <div className="flex flex-col gap-1">
            {isAuthenticated ? (
              isAdmin ? (
                <>
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-900 flex items-center gap-2"
                  >
                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                  </Link>
                  <Link
                    to="/admin/complaints"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-900 flex items-center gap-2"
                  >
                    <ClipboardList className="w-4 h-4" /> Complaints
                  </Link>
                  <Link
                    to="/admin/verification"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-lg text-sm font-medium text-amber-400 hover:bg-slate-900 flex items-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4" /> Review Suspicious
                  </Link>
                  <Link
                    to="/admin/hotspots"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-900 flex items-center gap-2"
                  >
                    <Flame className="w-4 h-4" /> Hotspot Map
                  </Link>
                  <Link
                    to="/admin/analytics"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-900 flex items-center gap-2"
                  >
                    <BarChart3 className="w-4 h-4" /> Ward Analytics
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/citizen/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-900 flex items-center gap-2"
                  >
                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                  </Link>
                  <Link
                    to="/citizen/report"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-lg text-sm font-semibold bg-emerald-600 text-white flex items-center gap-2"
                  >
                    <PlusCircle className="w-4 h-4" /> Report Issue
                  </Link>
                  <Link
                    to="/citizen/complaints"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-900 flex items-center gap-2"
                  >
                    <ClipboardList className="w-4 h-4" /> My Complaints
                  </Link>
                </>
              )
            ) : (
              <div className="flex flex-col gap-2 pt-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 text-sm font-medium rounded-lg bg-slate-900 text-slate-200 border border-slate-800"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 text-sm font-semibold rounded-lg bg-emerald-600 text-white"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Fast Switcher in Mobile */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">Quick Demo Switch:</span>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  quickLogin('citizen');
                  setMobileMenuOpen(false);
                }}
                className="px-2.5 py-1 text-xs rounded bg-slate-900 border border-slate-700 text-slate-200"
              >
                Citizen
              </button>
              <button
                onClick={() => {
                  quickLogin('admin');
                  setMobileMenuOpen(false);
                }}
                className="px-2.5 py-1 text-xs rounded bg-indigo-950 border border-indigo-700 text-indigo-200"
              >
                Reviewer
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
