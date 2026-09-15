import React, { useState } from 'react';
import {
  ShieldCheck,
  BookOpen,
  Menu,
  X,
  User as UserIcon,
  LogOut,
  UserCheck,
  ShoppingBag,
  HeartHandshake,
} from 'lucide-react';
import { User } from '../types';

export type NavTabId = 'scan' | 'results' | 'dashboard' | 'history' | 'users';

interface GovHeaderProps {
  activeTab: NavTabId;
  setActiveTab: (tab: NavTabId) => void;
  hasCurrentResult: boolean;
  onOpenRulesGuide: () => void;
  currentUser: User;
  onLogout: () => void;
}

export const GovHeader: React.FC<GovHeaderProps> = ({
  activeTab,
  setActiveTab,
  hasCurrentResult,
  onOpenRulesGuide,
  currentUser,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isCitizen = currentUser.role === 'citizen';
  const isAdmin = currentUser.role === 'admin';
  const isInspector = currentUser.role === 'inspector';

  const navItems: {
    id: NavTabId;
    label: string;
    icon: string;
    disabled?: boolean;
    badge?: string;
  }[] = [
    { id: 'scan', label: isCitizen ? 'Scan Package' : 'Scan Label', icon: '📷' },
    {
      id: 'results',
      label: isCitizen ? 'Consumer Verdict' : 'Results',
      icon: '📋',
      disabled: !hasCurrentResult,
      badge: hasCurrentResult ? 'Ready' : undefined,
    },
    {
      id: 'dashboard',
      label: isCitizen ? 'Market Insights' : 'Dashboard',
      icon: '📊',
    },
    {
      id: 'history',
      label: isCitizen ? 'My Scans & Grievances' : 'Inspection History',
      icon: '📁',
    },
  ];

  // Admin role gets access to see list of all users
  if (isAdmin) {
    navItems.push({
      id: 'users',
      label: 'Personnel Directory',
      icon: '👥',
      badge: 'Admin',
    });
  }

  const handleNavClick = (id: NavTabId) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-white border-b border-slate-200 shadow-xs sticky top-0 z-40">
      {/* Indian National Tricolor Ribbon */}
      <div className="h-1.5 w-full flex">
        <div className="w-1/3 bg-[#FF9933]"></div>
        <div className="w-1/3 bg-[#FFFFFF]"></div>
        <div className="w-1/3 bg-[#138808]"></div>
      </div>

      {/* Top Gov Portal Utility Bar */}
      <div className="bg-slate-100 border-b border-slate-200 px-4 py-1 text-xs text-slate-600">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3 font-medium">
            <span className="hidden sm:inline">भारत सरकार | Government of India</span>
            <span className="text-slate-300 hidden sm:inline">|</span>
            <span>उपभोक्ता मामले विभाग | Dept of Consumer Affairs</span>
            {isCitizen && (
              <span className="hidden md:inline-flex items-center text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 ml-2">
                जागो ग्राहक जागो
              </span>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-[11px] text-slate-500 hidden md:inline">
              Helpline: <strong>1915</strong> (National Consumer Care)
            </span>
            <button
              onClick={onOpenRulesGuide}
              className="flex items-center space-x-1 text-[#1e3a8a] hover:text-blue-900 font-semibold cursor-pointer"
              title="Legal Metrology Rules 2011 Reference"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>PCR 2011 Rules Guide</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Official Header Branding */}
      <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* National Emblem SVG Representation */}
            <div className="flex-shrink-0 flex flex-col items-center justify-center p-1 bg-white border border-slate-200 rounded shadow-2xs">
              <svg className="w-9 h-11 text-slate-800" viewBox="0 0 100 120" fill="currentColor">
                <circle cx="50" cy="22" r="14" fill="#1e3a8a" opacity="0.9" />
                <path d="M38 18 Q50 8 62 18 Q50 14 38 18" fill="#FF9933" />
                <rect x="42" y="36" width="16" height="34" rx="4" fill="#1e3a8a" />
                <rect x="26" y="42" width="14" height="26" rx="3" fill="#1e3a8a" opacity="0.85" />
                <rect x="60" y="42" width="14" height="26" rx="3" fill="#1e3a8a" opacity="0.85" />
                <rect x="18" y="74" width="64" height="12" rx="2" fill="#0f172a" />
                <circle cx="50" cy="80" r="5" fill="#ffffff" stroke="#1e3a8a" strokeWidth="1.5" />
                <polygon points="12,88 88,88 82,98 18,98" fill="#1e3a8a" />
                <text x="50" y="112" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#1e293b" letterSpacing="0.5">
                  सत्यमेव जयते
                </text>
              </svg>
            </div>

            {/* Portal Title & Statutory Subtitle */}
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg sm:text-xl font-black text-[#1e3a8a] tracking-tight">
                  LabelGuard
                </span>
                <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  PCR 2011
                </span>
                {isCitizen && (
                  <span className="hidden sm:inline-flex text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
                    Citizen Protection Mode
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 hidden sm:block">
                Legal Metrology (Packaged Commodities) Rules, 2011 • Crowdsourced Market Surveillance
              </p>
            </div>
          </div>

          {/* User Profile & Role Info + Logout Button */}
          <div className="hidden md:flex items-center space-x-3">
            {/* User Role Card */}
            <div className="flex items-center space-x-2.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                  isAdmin
                    ? 'bg-purple-100 text-purple-900 border border-purple-300'
                    : isCitizen
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-blue-100 text-[#1e3a8a] border border-blue-300'
                }`}
              >
                {isAdmin ? (
                  <ShieldCheck className="w-4 h-4" />
                ) : isCitizen ? (
                  <ShoppingBag className="w-4 h-4 text-emerald-700" />
                ) : (
                  <UserCheck className="w-4 h-4" />
                )}
              </div>
              <div className="text-left">
                <div className="flex items-center space-x-1.5">
                  <span className="text-xs font-bold text-slate-900 leading-none">
                    {currentUser.fullName}
                  </span>
                  {/* Role shown in the header */}
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                      isAdmin
                        ? 'bg-purple-600 text-white shadow-2xs'
                        : isCitizen
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'bg-blue-700 text-white shadow-2xs'
                    }`}
                  >
                    {isAdmin ? 'Admin' : isCitizen ? 'Citizen' : 'Inspector'}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                  {currentUser.jurisdiction} • {currentUser.badgeNumber}
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={onLogout}
              className="px-3 py-2 bg-white hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 text-slate-700 border border-slate-300 rounded text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-2xs transition-colors"
              title="Sign out of current session"
            >
              <LogOut className="w-3.5 h-3.5 text-slate-500 hover:text-rose-600" />
              <span>Logout</span>
            </button>
          </div>

          {/* Mobile Menu Toggle Button & Mobile Role Pill */}
          <div className="md:hidden flex items-center space-x-2">
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                isAdmin
                  ? 'bg-purple-600 text-white'
                  : isCitizen
                  ? 'bg-emerald-600 text-white'
                  : 'bg-blue-700 text-white'
              }`}
            >
              {isAdmin ? 'Admin' : isCitizen ? 'Citizen' : 'Inspector'}
            </span>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-slate-700 hover:text-[#1e3a8a] hover:bg-slate-100 focus:outline-hidden cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Government Portal Navigation Bar */}
      <nav className="bg-[#1e3a8a] text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="hidden md:flex space-x-1 py-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => !item.disabled && handleNavClick(item.id)}
                  disabled={item.disabled}
                  className={`px-4 py-2.5 rounded-sm text-sm font-semibold transition-colors flex items-center space-x-2 cursor-pointer ${
                    isActive
                      ? 'bg-blue-950 text-white shadow-inner border-b-2 border-amber-400'
                      : item.disabled
                      ? 'text-blue-300/40 cursor-not-allowed'
                      : 'text-blue-100 hover:bg-blue-800'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={`ml-1.5 px-2 py-0.5 text-[10px] font-bold rounded ${
                        item.badge === 'Admin'
                          ? 'bg-purple-200 text-purple-900'
                          : 'bg-amber-400 text-slate-900'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Mobile Dropdown Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-blue-800 px-3 py-2 space-y-1 bg-[#1e3a8a]">
            {/* Mobile User Info & Role Banner */}
            <div className="p-2.5 mb-2 bg-blue-900/90 rounded border border-blue-700/60 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white">{currentUser.fullName}</div>
                <div className="text-[11px] text-blue-200">
                  Role: <strong className="text-amber-300 uppercase">{currentUser.role}</strong> ({currentUser.badgeNumber})
                </div>
              </div>
              <button
                onClick={onLogout}
                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-bold flex items-center space-x-1 cursor-pointer"
              >
                <LogOut className="w-3 h-3" />
                <span>Logout</span>
              </button>
            </div>

            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => !item.disabled && handleNavClick(item.id)}
                  disabled={item.disabled}
                  className={`w-full text-left px-3 py-2.5 rounded text-sm font-medium flex items-center justify-between cursor-pointer min-h-[44px] ${
                    isActive
                      ? 'bg-blue-950 text-white border-l-4 border-amber-400 font-bold'
                      : item.disabled
                      ? 'text-blue-300/50 cursor-not-allowed'
                      : 'text-blue-100 hover:bg-blue-800'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                        item.badge === 'Admin'
                          ? 'bg-purple-300 text-purple-950'
                          : 'bg-amber-400 text-slate-900'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </nav>
    </header>
  );
};
