import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  AlertCircle,
  LogIn,
  KeyRound,
  Sparkles,
  Zap,
  Check,
  ShoppingBag,
  Shield,
  ArrowRight,
  Mail,
  Phone,
  MapPin,
  HelpCircle,
} from 'lucide-react';
import { User } from '../types';
import {
  authenticateUser,
  registerCitizenUser,
  loginWithGoogle,
  guestCitizenLogin,
} from '../data/users';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  // Mode: 'citizen' or 'official'
  const [activePortal, setActivePortal] = useState<'citizen' | 'official'>('citizen');
  // Sub-tab for citizen: 'signin' or 'signup'
  const [citizenMode, setCitizenMode] = useState<'signin' | 'signup'>('signin');

  // Official form state
  const [officialUser, setOfficialUser] = useState('');
  const [officialPass, setOfficialPass] = useState('');
  const [showOfficialPass, setShowOfficialPass] = useState(false);

  // Citizen sign-in state
  const [citizenEmail, setCitizenEmail] = useState('');
  const [citizenPass, setCitizenPass] = useState('');
  const [showCitizenPass, setShowCitizenPass] = useState(false);

  // Citizen sign-up state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regCity, setRegCity] = useState('');
  const [regPass, setRegPass] = useState('');

  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [autoFillNotice, setAutoFillNotice] = useState<string | null>(null);

  // Official Login Handler
  const handleOfficialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!officialUser.trim()) {
      setErrorMessage('Please enter your official username (e.g. inspector or admin).');
      return;
    }
    if (!officialPass) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const user = authenticateUser(officialUser, officialPass);
      setIsLoading(false);
      if (user) {
        onLoginSuccess(user);
      } else {
        setErrorMessage('Invalid credentials. For quick testing use inspector/inspector123 or admin/admin123.');
      }
    }, 200);
  };

  // Citizen Sign-in Handler
  const handleCitizenSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!citizenEmail.trim()) {
      setErrorMessage('Please enter your registered email address or username.');
      return;
    }
    if (!citizenPass) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const user = authenticateUser(citizenEmail, citizenPass);
      setIsLoading(false);
      if (user) {
        onLoginSuccess(user);
      } else {
        setErrorMessage('Account not found with these credentials. Please check your details or create a new account.');
      }
    }, 200);
  };

  // Citizen Registration Handler
  const handleCitizenSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!regName.trim()) {
      setErrorMessage('Please enter your Full Name.');
      return;
    }
    if (!regEmail.trim() || !regEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!regPass || regPass.length < 4) {
      setErrorMessage('Password must be at least 4 characters.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const newUser = registerCitizenUser({
        fullName: regName,
        email: regEmail,
        phone: regPhone,
        city: regCity || 'New Delhi',
        password: regPass,
      });
      setIsLoading(false);
      onLoginSuccess(newUser);
    }, 250);
  };

  // Google Login Handler
  const handleGoogleLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      // Connects citizen account
      const user = loginWithGoogle('sudhajaysawal14@gmail.com', 'Sudha Jaysawal');
      setIsLoading(false);
      onLoginSuccess(user);
    }, 300);
  };

  // Guest Scan Handler
  const handleGuestScan = () => {
    const guestUser = guestCitizenLogin();
    onLoginSuccess(guestUser);
  };

  // Auto-fill official credentials
  const handleAutoFillOfficial = (role: 'inspector' | 'admin') => {
    setErrorMessage('');
    if (role === 'inspector') {
      setOfficialUser('inspector');
      setOfficialPass('inspector123');
      setAutoFillNotice('Filled Inspector: inspector / inspector123');
    } else {
      setOfficialUser('admin');
      setOfficialPass('admin123');
      setAutoFillNotice('Filled Admin: admin / admin123');
    }
    setTimeout(() => setAutoFillNotice(null), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between font-sans text-slate-800">
      {/* Top Gov Portal Bar with Tricolor */}
      <div>
        <div className="h-1.5 w-full flex">
          <div className="w-1/3 bg-[#FF9933]"></div>
          <div className="w-1/3 bg-[#FFFFFF]"></div>
          <div className="w-1/3 bg-[#138808]"></div>
        </div>

        <div className="bg-white border-b border-slate-200 py-1.5 px-4 text-xs text-slate-600 shadow-2xs">
          <div className="max-w-5xl mx-auto flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-slate-700">भारत सरकार | Government of India</span>
              <span className="text-slate-300">|</span>
              <span className="hidden sm:inline">उपभोक्ता मामले विभाग | Dept of Consumer Affairs</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                जागो ग्राहक जागो
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Center Container */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 py-6 sm:py-10">
        <div className="w-full max-w-lg space-y-4">
          {/* Official Emblem & Portal Title */}
          <div className="text-center space-y-2">
            <div className="inline-flex flex-col items-center justify-center p-2 bg-white border border-slate-200 rounded-md shadow-2xs">
              <svg className="w-10 h-12 text-slate-800" viewBox="0 0 100 120" fill="currentColor">
                <circle cx="50" cy="22" r="14" fill="#1e3a8a" opacity="0.9" />
                <path d="M38 18 Q50 8 62 18 Q50 14 38 18" fill="#FF9933" />
                <rect x="42" y="36" width="16" height="34" rx="4" fill="#1e3a8a" />
                <rect x="26" y="42" width="14" height="26" rx="3" fill="#1e3a8a" opacity="0.85" />
                <rect x="60" y="42" width="14" height="26" rx="3" fill="#1e3a8a" opacity="0.85" />
                <rect x="18" y="74" width="64" height="12" rx="2" fill="#0f172a" />
                <circle cx="50" cy="80" r="5" fill="#ffffff" stroke="#1e3a8a" strokeWidth="1.5" />
                <polygon points="12,88 88,88 82,98 18,98" fill="#1e3a8a" />
                <text x="50" y="112" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#1e293b">
                  सत्यमेव जयते
                </text>
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#1e3a8a]">
              LabelGuard Portal
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              Crowdsourced Packaging Compliance & Consumer Protection System under the{' '}
              <strong>Legal Metrology (Packaged Commodities) Rules, 2011</strong>
            </p>
          </div>

          {/* Primary Portal Selector: Citizen Consumer vs Official Authority */}
          <div className="grid grid-cols-2 p-1 bg-slate-200/80 rounded-xl border border-slate-300/70">
            <button
              type="button"
              onClick={() => {
                setActivePortal('citizen');
                setErrorMessage('');
              }}
              className={`py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer min-h-[44px] ${
                activePortal === 'citizen'
                  ? 'bg-white text-[#1e3a8a] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShoppingBag className="w-4 h-4 text-amber-600" />
              <span>Citizens & Consumers</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActivePortal('official');
                setErrorMessage('');
              }}
              className={`py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer min-h-[44px] ${
                activePortal === 'official'
                  ? 'bg-[#1e3a8a] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-cyan-300" />
              <span>Enforcement Officials</span>
            </button>
          </div>

          {/* Card Container */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-md p-5 sm:p-7">
            {/* Error Message Banner */}
            {errorMessage && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* ========================================================= */}
            {/* 1. CITIZEN / CONSUMER ACCESS FLOW                          */}
            {/* ========================================================= */}
            {activePortal === 'citizen' && (
              <div className="space-y-4">
                {/* Citizen Header & Jago Grahak Jago info */}
                <div className="border-b border-slate-100 pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-sm sm:text-base font-bold text-slate-900">
                        Citizen Packaging Scanner
                      </h2>
                      <p className="text-xs text-slate-500">
                        Scan any packaged food, verify fair prices & report violations
                      </p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full border border-emerald-300">
                      Public Access
                    </span>
                  </div>
                </div>

                {/* Google Sign-In Button */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm font-semibold text-slate-700 shadow-2xs flex items-center justify-center space-x-2.5 transition-all cursor-pointer min-h-[44px]"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.58-5.17 3.58-9.15z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.94H1.24v3.15C3.26 21.36 7.33 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.26c-.25-.72-.38-1.49-.38-2.26s.13-1.54.38-2.26V6.59H1.24C.45 8.16 0 9.94 0 12s.45 3.84 1.24 5.41l4.04-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.59l4.04 3.15c.95-2.84 3.6-4.99 6.72-4.99z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>

                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-slate-200"></div>
                  <span className="flex-shrink mx-3 text-slate-400 text-[11px] uppercase tracking-wider font-medium">
                    Or Use Consumer Account
                  </span>
                  <div className="flex-grow border-t border-slate-200"></div>
                </div>

                {/* Sub-tabs: Sign In vs Create Account */}
                <div className="flex border-b border-slate-200 text-xs">
                  <button
                    type="button"
                    onClick={() => setCitizenMode('signin')}
                    className={`pb-2 px-3 font-bold border-b-2 cursor-pointer transition-colors ${
                      citizenMode === 'signin'
                        ? 'border-[#1e3a8a] text-[#1e3a8a]'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Citizen Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => setCitizenMode('signup')}
                    className={`pb-2 px-3 font-bold border-b-2 cursor-pointer transition-colors ${
                      citizenMode === 'signup'
                        ? 'border-[#1e3a8a] text-[#1e3a8a]'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Register New Consumer
                  </button>
                </div>

                {/* Citizen Sign In Form */}
                {citizenMode === 'signin' ? (
                  <form onSubmit={handleCitizenSignIn} className="space-y-3 pt-1">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Email Address or Username
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={citizenEmail}
                          onChange={(e) => setCitizenEmail(e.target.value)}
                          placeholder="e.g. consumer@gmail.com"
                          className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-600 focus:outline-hidden min-h-[42px]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Password
                      </label>
                      <div className="relative">
                        <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type={showCitizenPass ? 'text' : 'password'}
                          value={citizenPass}
                          onChange={(e) => setCitizenPass(e.target.value)}
                          placeholder="Enter your password"
                          className="w-full pl-9 pr-10 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-600 focus:outline-hidden min-h-[42px]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCitizenPass(!showCitizenPass)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                        >
                          {showCitizenPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-2.5 px-4 bg-[#1e3a8a] hover:bg-blue-900 active:bg-blue-950 text-white rounded-md text-xs sm:text-sm font-bold shadow-xs flex items-center justify-center space-x-2 transition-colors cursor-pointer min-h-[44px]"
                    >
                      {isLoading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <LogIn className="w-4 h-4" />
                          <span>Sign In as Citizen</span>
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  /* Citizen Registration Form */
                  <form onSubmit={handleCitizenSignUp} className="space-y-3 pt-1">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Full Name *
                      </label>
                      <div className="relative">
                        <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          placeholder="e.g. Ramesh Kumar"
                          className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-600 focus:outline-hidden min-h-[42px]"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Email Address *
                        </label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="email"
                            value={regEmail}
                            onChange={(e) => setRegEmail(e.target.value)}
                            placeholder="you@email.com"
                            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-600 focus:outline-hidden min-h-[42px]"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Mobile Number
                        </label>
                        <div className="relative">
                          <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="tel"
                            value={regPhone}
                            onChange={(e) => setRegPhone(e.target.value)}
                            placeholder="+91 98765 43210"
                            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-600 focus:outline-hidden min-h-[42px]"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          City / District
                        </label>
                        <div className="relative">
                          <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={regCity}
                            onChange={(e) => setRegCity(e.target.value)}
                            placeholder="e.g. Bengaluru, Pune"
                            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-600 focus:outline-hidden min-h-[42px]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Password *
                        </label>
                        <div className="relative">
                          <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="password"
                            value={regPass}
                            onChange={(e) => setRegPass(e.target.value)}
                            placeholder="Create password"
                            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-600 focus:outline-hidden min-h-[42px]"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-md text-xs sm:text-sm font-bold shadow-xs flex items-center justify-center space-x-2 transition-colors cursor-pointer min-h-[44px]"
                    >
                      {isLoading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4" />
                          <span>Create Account & Start Scanning</span>
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* Instant Guest Scan without registration */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500">In a retail store right now?</span>
                  <button
                    type="button"
                    onClick={handleGuestScan}
                    className="text-xs font-bold text-[#1e3a8a] hover:text-blue-900 flex items-center space-x-1 cursor-pointer py-1 px-2 hover:bg-blue-50 rounded"
                  >
                    <span>Instant Quick Scan</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* 2. OFFICIAL ENFORCEMENT AUTHORITY FLOW                     */}
            {/* ========================================================= */}
            {activePortal === 'official' && (
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-slate-900">
                      Enforcement Authority Sign In
                    </h2>
                    <p className="text-xs text-slate-500">
                      Legal Metrology Inspectors, Controllers & Admins
                    </p>
                  </div>
                  <div className="p-2 bg-blue-50 text-[#1e3a8a] rounded-md border border-blue-200">
                    <Lock className="w-4 h-4" />
                  </div>
                </div>

                {/* Auto-fill feedback */}
                {autoFillNotice && (
                  <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-md text-xs text-emerald-800 flex items-center space-x-1.5 animate-fadeIn">
                    <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span>{autoFillNotice}</span>
                  </div>
                )}

                {/* Demo auto-fill quick buttons */}
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold text-amber-900 flex items-center space-x-1">
                      <Zap className="w-3.5 h-3.5 text-amber-600" />
                      <span>Quick Test Credentials</span>
                    </span>
                    <span className="text-[10px] text-amber-700">Auto-fill:</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleAutoFillOfficial('inspector')}
                      className="py-1 px-2 bg-white hover:bg-amber-100 border border-amber-300 rounded text-xs font-semibold text-slate-800 text-center transition-colors cursor-pointer"
                    >
                      Fill Inspector
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAutoFillOfficial('admin')}
                      className="py-1 px-2 bg-white hover:bg-amber-100 border border-amber-300 rounded text-xs font-semibold text-slate-800 text-center transition-colors cursor-pointer"
                    >
                      Fill Admin
                    </button>
                  </div>
                </div>

                <form onSubmit={handleOfficialSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Officer Username
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={officialUser}
                        onChange={(e) => setOfficialUser(e.target.value)}
                        placeholder="inspector or admin"
                        className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-600 focus:outline-hidden bg-slate-50/50 min-h-[42px]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Officer Password
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type={showOfficialPass ? 'text' : 'password'}
                        value={officialPass}
                        onChange={(e) => setOfficialPass(e.target.value)}
                        placeholder="Enter password"
                        className="w-full pl-9 pr-10 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-600 focus:outline-hidden bg-slate-50/50 min-h-[42px]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowOfficialPass(!showOfficialPass)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                      >
                        {showOfficialPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 px-4 bg-[#1e3a8a] hover:bg-blue-900 active:bg-blue-950 text-white rounded-md text-xs sm:text-sm font-bold shadow-xs flex items-center justify-center space-x-2 transition-colors cursor-pointer min-h-[44px]"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <LogIn className="w-4 h-4" />
                        <span>Sign In to Enforcement Portal</span>
                      </>
                    )}
                  </button>
                </form>

                {/* 1-Click Direct Demo Buttons */}
                <div className="pt-3 border-t border-slate-200">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const user = authenticateUser('inspector', 'inspector123');
                        if (user) onLoginSuccess(user);
                      }}
                      className="p-2 bg-blue-50/80 hover:bg-blue-100 border border-blue-200 rounded-lg text-left cursor-pointer transition-colors"
                    >
                      <div className="text-xs font-bold text-[#1e3a8a]">1-Click Inspector</div>
                      <div className="text-[10px] text-slate-500">Scan & audit queue</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const user = authenticateUser('admin', 'admin123');
                        if (user) onLoginSuccess(user);
                      }}
                      className="p-2 bg-purple-50/80 hover:bg-purple-100 border border-purple-200 rounded-lg text-left cursor-pointer transition-colors"
                    >
                      <div className="text-xs font-bold text-purple-900">1-Click Admin</div>
                      <div className="text-[10px] text-slate-500">Full control & users</div>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Legal Notice Footer */}
          <div className="text-center text-[11px] text-slate-500 space-y-0.5">
            <p>
              Statutory Consumer Redressal under <strong>Legal Metrology Act, 2009</strong> &{' '}
              <strong>Consumer Protection Act, 2019</strong>.
            </p>
            <p className="text-slate-400">
              Department of Consumer Affairs • Krishi Bhawan, New Delhi • Helpline: 1915
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Footer bar */}
      <footer className="bg-white border-t border-slate-200 py-2.5 px-4 text-center text-xs text-slate-500">
        Legal Metrology (Packaged Commodities) Rules, 2011 Enforcement & Citizen Surveillance Portal • Government of India
      </footer>
    </div>
  );
};
