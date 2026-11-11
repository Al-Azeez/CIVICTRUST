import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, User, Mail, Lock, Phone, MapPin, ArrowRight } from 'lucide-react';

const WARDS = [
  'Ward 1 - Central Market',
  'Ward 2 - Civil Lines',
  'Ward 3 - Industrial Zone',
  'Ward 4 - Green Park',
  'Ward 5 - Station Road',
  'Ward 6 - Heritage Quarter',
  'Ward 7 - Tech Enclave',
  'Ward 8 - Riverfront',
];

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    ward: WARDS[0],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const result = await register(formData);
    setIsSubmitting(false);

    if (result.success) {
      navigate('/citizen/dashboard');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6 bg-[#0d1527]/90 border border-cyan-500/25 rounded-[28px] p-8 shadow-[0_0_50px_rgba(6,182,212,0.15)] backdrop-blur-xl">
        <div className="text-center space-y-2">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-violet-600 items-center justify-center shadow-lg shadow-cyan-950/60 mb-1">
            <User className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white font-['Outfit']">
            Citizen Registration
          </h2>
          <p className="text-xs text-slate-400">
            Create your verified citizen profile to report and track civic issues
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Full Name:
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Ramesh Kumar"
                className="w-full pl-10 pr-3.5 py-2.5 bg-[#060913] border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Email Address:
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="ramesh@example.com"
                className="w-full pl-10 pr-3.5 py-2.5 bg-[#060913] border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
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
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 bg-[#060913] border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Phone:
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full pl-9 pr-3 py-2 bg-[#060913] border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Primary Ward:
              </label>
              <select
                value={formData.ward}
                onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                className="w-full px-3 py-2 bg-[#060913] border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              >
                {WARDS.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white font-extrabold text-sm shadow-lg shadow-cyan-950 flex items-center justify-center gap-2 transition-all mt-2"
          >
            {isSubmitting ? 'Creating Citizen Profile...' : 'Complete Registration'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-xs text-slate-400">
          Already registered?{' '}
          <Link to="/login" className="text-cyan-400 font-bold hover:underline">
            Sign In here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
