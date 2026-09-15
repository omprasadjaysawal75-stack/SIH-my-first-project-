/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { GovHeader, NavTabId } from './components/GovHeader';
import { ScanLabelPage } from './components/ScanLabelPage';
import { ResultsPage } from './components/ResultsPage';
import { DashboardPage } from './components/DashboardPage';
import { HistoryPage } from './components/HistoryPage';
import { UsersPage } from './components/UsersPage';
import { LoginPage } from './components/LoginPage';
import { GovFooter } from './components/GovFooter';
import { RulesReferenceModal } from './components/RulesReferenceModal';
import { INITIAL_HISTORY } from './data/sampleLabels';
import { ProductScan, User } from './types';

const STORAGE_KEY = 'labelguard_scans_v1';
const AUTH_KEY = 'labelguard_current_user_v1';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(AUTH_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to load user session from localStorage:', e);
    }
    return null;
  });

  const [activeTab, setActiveTab] = useState<NavTabId>('scan');
  const [scans, setScans] = useState<ProductScan[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load saved scans from localStorage:', e);
    }
    return INITIAL_HISTORY;
  });

  const [currentScan, setCurrentScan] = useState<ProductScan | null>(() => {
    return scans.length > 0 ? scans[0] : null;
  });

  const [isScanning, setIsScanning] = useState(false);
  const [rulesModalOpen, setRulesModalOpen] = useState(false);

  // Sync scans with localStorage with quota protection
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(scans));
    } catch (e) {
      console.warn('Direct localStorage save failed, trimming image cache:', e);
      try {
        const compactScans = scans.map((s, idx) => {
          if (idx > 5) {
            return {
              ...s,
              images: s.imageUrl ? [s.imageUrl] : [],
            };
          }
          return s;
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(compactScans));
      } catch (e2) {
        console.error('Failed to persist scans to localStorage:', e2);
      }
    }
  }, [scans]);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    try {
      localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    } catch (e) {
      console.warn('Failed to persist session to localStorage:', e);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem(AUTH_KEY);
    } catch (e) {
      console.warn('Failed to remove user session:', e);
    }
    setActiveTab('scan');
  };

  const handleScanComplete = (newScan: ProductScan) => {
    const finalizedScan: ProductScan = {
      ...newScan,
      isCitizenReport: currentUser?.role === 'citizen',
      scannedByRole: currentUser?.role,
      timestamp: newScan.timestamp || new Date().toISOString(),
      productName: newScan.productName || 'Unlabeled Packaged Commodity',
      imageUrl: newScan.imageUrl || (newScan.images && newScan.images[0]) || '',
      images: newScan.images && newScan.images.length > 0 ? newScan.images : (newScan.imageUrl ? [newScan.imageUrl] : []),
      complianceVerdict: newScan.complianceVerdict || (newScan.overallCompliant ? 'COMPLIANT' : 'NON-COMPLIANT'),
      overallCompliant: newScan.complianceVerdict === 'COMPLIANT' || (newScan.overallCompliant && newScan.complianceVerdict !== 'NON-COMPLIANT'),
      complianceScore: typeof newScan.complianceScore === 'number' ? newScan.complianceScore : (newScan.overallCompliant ? 100 : 40),
      violations: newScan.violations || [],
      violationDetails: newScan.violationDetails || [],
    };

    setCurrentScan(finalizedScan);
    setScans((prev) => [finalizedScan, ...prev.filter((s) => s.id !== finalizedScan.id)]);
    setActiveTab('results');
  };

  const handleReportGrievance = (grievanceData: any) => {
    if (!currentScan) return;
    const updatedScan: ProductScan = {
      ...currentScan,
      isCitizenReport: true,
      scannedByRole: currentUser?.role || 'citizen',
      citizenGrievance: grievanceData,
    };
    setCurrentScan(updatedScan);
    setScans((prev) => prev.map((s) => (s.id === updatedScan.id ? updatedScan : s)));
  };

  const handleUpdateGrievanceStatus = (newStatus: any, officialNotes?: string) => {
    if (!currentScan || !currentScan.citizenGrievance) return;
    const updatedScan: ProductScan = {
      ...currentScan,
      citizenGrievance: {
        ...currentScan.citizenGrievance,
        status: newStatus,
        officialNotes: officialNotes || currentScan.citizenGrievance.officialNotes,
      },
    };
    setCurrentScan(updatedScan);
    setScans((prev) => prev.map((s) => (s.id === updatedScan.id ? updatedScan : s)));
  };

  const handleSelectScan = (scan: ProductScan) => {
    setCurrentScan(scan);
    setActiveTab('results');
  };

  // Only Admin is authorized to delete audit scan records
  const handleDeleteScan = (id: string) => {
    if (currentUser?.role !== 'admin') {
      alert('Unauthorized: Only administrators are permitted to delete audit inspection records.');
      return;
    }
    setScans((prev) => prev.filter((s) => s.id !== id));
    if (currentScan?.id === id) {
      const remaining = scans.filter((s) => s.id !== id);
      setCurrentScan(remaining.length > 0 ? remaining[0] : null);
    }
  };

  const handleRestoreDefaults = () => {
    if (currentUser?.role !== 'admin') {
      alert('Unauthorized: Only administrators can restore default audit records.');
      return;
    }
    setScans(INITIAL_HISTORY);
    setCurrentScan(INITIAL_HISTORY[0]);
  };

  // Non-logged-in users should not see any pages except the login screen
  if (!currentUser) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {/* Indian Government Header with User Role & Logout */}
      <GovHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        hasCurrentResult={Boolean(currentScan)}
        onOpenRulesGuide={() => setRulesModalOpen(true)}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'scan' && (
          <ScanLabelPage
            onScanComplete={handleScanComplete}
            isScanning={isScanning}
            setIsScanning={setIsScanning}
          />
        )}

        {activeTab === 'results' && (
          <ResultsPage
            scan={currentScan}
            onScanAnother={() => setActiveTab('scan')}
            onViewHistory={() => setActiveTab('history')}
            currentUser={currentUser}
            onReportGrievance={handleReportGrievance}
            onUpdateGrievanceStatus={handleUpdateGrievanceStatus}
          />
        )}

        {activeTab === 'dashboard' && (
          <DashboardPage
            scans={scans}
            onSelectScan={handleSelectScan}
            onNewScan={() => setActiveTab('scan')}
            onViewHistory={() => setActiveTab('history')}
          />
        )}

        {activeTab === 'history' && (
          <HistoryPage
            scans={scans}
            onSelectScan={handleSelectScan}
            onDeleteScan={handleDeleteScan}
            onRestoreDefaults={handleRestoreDefaults}
            onNewScan={() => setActiveTab('scan')}
            currentUser={currentUser}
          />
        )}

        {activeTab === 'users' && currentUser.role === 'admin' && (
          <UsersPage currentUser={currentUser} />
        )}
      </main>

      {/* Indian Government Portal Footer */}
      <GovFooter onOpenRulesGuide={() => setRulesModalOpen(true)} />

      {/* Statutory Rules Reference Modal */}
      <RulesReferenceModal
        isOpen={rulesModalOpen}
        onClose={() => setRulesModalOpen(false)}
      />
    </div>
  );
}
