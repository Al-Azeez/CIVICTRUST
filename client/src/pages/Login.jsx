import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, User, Shield, Lock, Mail, ArrowRight, Sparkles } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, quickLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const result = await login(email, password);
    setIsSubmitting(false);

    if (result.success) {
      if (result.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/citizen/dashboard');
      }
    }
  };

  const handleQuickLogin = async (role) => {
    setIsSubmitting(true);
    const result = await quickLogin(role);
    setIsSubmitting(false);
    if (result.success) {
      if (result.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/citizen/dashboard');
      }
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-7 bg-[#0d1527]/90 border border-cyan-500/25 rounded-[28px] p-8 shadow-[0_0_50px_rgba(6,182,212,0.15)] backdrop-blur-xl">
        <div className="text-center space-y-2">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-violet-600 items-center justify-center shadow-lg shadow-cyan-950/60 mb-1">
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white font-['Outfit']">
            Sign in to CivicTrust
          </h2>
          <p className="text-xs text-slate-400">
            Access citizen reporting or municipal resolution reviewer portal
          </p>
        </div>

        {/* 1-Click Fast Demo Logins for Abdul & Azeez */}
        <div className="bg-[#060913]/90 rounded-2xl p-4 border border-cyan-500/20 space-y-2.5">
          <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              1-Click Instant Demo Credentials:
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => handleQuickLogin('citizen')}
              disabled={isSubmitting}
              className="py-3 px-3 rounded-xl bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/70 text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all shadow"
            >
              <User className="w-4 h-4 text-cyan-400" />
              <span>Abdul (Citizen)</span>
              <span className="text-[10px] text-cyan-400/80 font-mono">citizen@civictrust.org</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('admin')}
              disabled={isSubmitting}
              className="py-3 px-3 rounded-xl bg-violet-950/70 border border-violet-500/40 text-violet-300 hover:bg-violet-900/70 text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all shadow"
            >
              <Shield className="w-4 h-4 text-violet-400" />
              <span>Azeez (Admin)</span>
              <span className="text-[10px] text-violet-400/80 font-mono">admin@civictrust.org</span>
            </button>
          </div>
        </div>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-white/10" />
          <span className="flex-shrink mx-4 text-[10px] text-slate-400 uppercase tracking-widest font-bold">
            Or Sign In with Email
          </span>
          <div className="flex-grow border-t border-white/10" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Email Address:
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="citizen@civictrust.org"
                className="w-full pl-10 pr-3.5 py-2.5 bg-[#060913] border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Password:
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 bg-[#060913] border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white font-extrabold text-sm shadow-lg shadow-cyan-950 flex items-center justify-center gap-2 transition-all mt-2"
          >
            {isSubmitting ? 'Signing in...' : 'Sign In to Portal'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-xs text-slate-400">
          New citizen?{' '}
          <Link to="/register" className="text-cyan-400 font-bold hover:underline">
            Register your account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
