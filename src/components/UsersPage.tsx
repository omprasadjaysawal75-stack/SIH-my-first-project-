import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  ShieldCheck,
  UserCheck,
  Building,
  Mail,
  Phone,
  Calendar,
  BadgeAlert,
  Sparkles,
  Lock,
  CheckCircle2,
} from 'lucide-react';
import { User, UserRole } from '../types';
import { INITIAL_USERS } from '../data/users';

interface UsersPageProps {
  currentUser: User;
}

export const UsersPage: React.FC<UsersPageProps> = ({ currentUser }) => {
  const [users] = useState<User[]>(INITIAL_USERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const term = searchTerm.trim().toLowerCase();
      const matchesSearch =
        term === '' ||
        u.fullName.toLowerCase().includes(term) ||
        u.username.toLowerCase().includes(term) ||
        u.designation.toLowerCase().includes(term) ||
        u.jurisdiction.toLowerCase().includes(term) ||
        u.badgeNumber.toLowerCase().includes(term);

      const matchesRole = roleFilter === 'all' || u.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

  const totalAdmins = users.filter((u) => u.role === 'admin').length;
  const totalInspectors = users.filter((u) => u.role === 'inspector').length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-4 sm:p-5 rounded-lg shadow-2xs">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-[11px] font-bold text-purple-900 uppercase tracking-wider">
              Administration Console
            </span>
            <span className="text-[10px] px-2 py-0.5 bg-purple-100 text-purple-900 rounded font-bold border border-purple-200 flex items-center space-x-1">
              <Lock className="w-2.5 h-2.5 mr-1" />
              <span>Admin Restricted</span>
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Authorized Personnel Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Official roster of Legal Metrology Officers, Enforcement Inspectors, and System Administrators under the Ministry of Consumer Affairs.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="px-3 py-1.5 bg-purple-50 border border-purple-200 rounded-md text-xs text-purple-900 font-semibold">
            Logged in as: <strong className="font-bold">{currentUser.fullName}</strong>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase">Total Personnel</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">{users.length}</div>
            <span className="text-xs text-slate-500">Authorized Accounts</span>
          </div>
          <div className="p-3 bg-blue-50 text-[#1e3a8a] rounded-lg border border-blue-100">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-purple-800 uppercase">Administrators</span>
            <div className="text-2xl font-extrabold text-purple-900 mt-1">{totalAdmins}</div>
            <span className="text-xs text-purple-700">Full Access + Delete Scans</span>
          </div>
          <div className="p-3 bg-purple-50 text-purple-700 rounded-lg border border-purple-200">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-blue-800 uppercase">Field Inspectors</span>
            <div className="text-2xl font-extrabold text-[#1e3a8a] mt-1">{totalInspectors}</div>
            <span className="text-xs text-blue-700">Scan & Report Verifications</span>
          </div>
          <div className="p-3 bg-blue-50 text-[#1e3a8a] rounded-lg border border-blue-200">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, username, badge, or jurisdiction..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm border border-slate-300 rounded focus:ring-2 focus:ring-purple-600 focus:outline-hidden bg-white"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          <span className="text-xs font-semibold text-slate-500">Filter Role:</span>
          <button
            onClick={() => setRoleFilter('all')}
            className={`px-3 py-1.5 rounded text-xs font-semibold cursor-pointer transition-colors ${
              roleFilter === 'all'
                ? 'bg-[#1e3a8a] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All ({users.length})
          </button>
          <button
            onClick={() => setRoleFilter('admin')}
            className={`px-3 py-1.5 rounded text-xs font-semibold cursor-pointer transition-colors ${
              roleFilter === 'admin'
                ? 'bg-purple-900 text-white shadow-xs'
                : 'bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100'
            }`}
          >
            Admins ({totalAdmins})
          </button>
          <button
            onClick={() => setRoleFilter('inspector')}
            className={`px-3 py-1.5 rounded text-xs font-semibold cursor-pointer transition-colors ${
              roleFilter === 'inspector'
                ? 'bg-blue-800 text-white shadow-xs'
                : 'bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100'
            }`}
          >
            Inspectors ({totalInspectors})
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-bold text-[11px] tracking-wider">
              <tr>
                <th className="px-4 py-3.5">Officer & Designation</th>
                <th className="px-4 py-3.5">Username & Badge</th>
                <th className="px-4 py-3.5">System Role</th>
                <th className="px-4 py-3.5">Jurisdiction / Directorate</th>
                <th className="px-4 py-3.5">Official Contact</th>
                <th className="px-4 py-3.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((u) => {
                const isAdmin = u.role === 'admin';
                return (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Name & Designation */}
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900 flex items-center space-x-1.5">
                        <span>{u.fullName}</span>
                        {u.username === currentUser.username && (
                          <span className="px-1.5 py-0.2 bg-amber-100 text-amber-900 text-[10px] font-bold rounded">
                            You
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500">{u.designation}</div>
                    </td>

                    {/* Username & Badge */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="font-mono text-xs font-semibold text-slate-800">
                        @{u.username}
                      </div>
                      <div className="text-[11px] font-mono text-slate-500">
                        {u.badgeNumber}
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {isAdmin ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-bold bg-purple-100 text-purple-900 border border-purple-200">
                          <ShieldCheck className="w-3.5 h-3.5 mr-1 text-purple-700" />
                          Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-bold bg-blue-100 text-blue-900 border border-blue-200">
                          <UserCheck className="w-3.5 h-3.5 mr-1 text-blue-700" />
                          Inspector
                        </span>
                      )}
                    </td>

                    {/* Jurisdiction */}
                    <td className="px-4 py-3.5 max-w-[220px]">
                      <div className="text-xs text-slate-700 flex items-start space-x-1">
                        <Building className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                        <span>{u.jurisdiction}</span>
                      </div>
                    </td>

                    {/* Official Contact */}
                    <td className="px-4 py-3.5 whitespace-nowrap text-xs text-slate-600 space-y-0.5">
                      <div className="flex items-center space-x-1 text-slate-700">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span>{u.email}</span>
                      </div>
                      {u.phone && (
                        <div className="flex items-center space-x-1 text-slate-500">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{u.phone}</span>
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5 text-center whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
                        Active
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
