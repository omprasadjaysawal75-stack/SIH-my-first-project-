export type ComplianceStatus = 'compliant' | 'non_compliant' | 'warning' | 'not_applicable';
export type DeclarationVerdict = 'PASS' | 'FAIL' | 'WARNING';

export interface ViolationDetail {
  ruleCode: string; // e.g. "Rule 6(1)(e)", "Rule 18(2)", "Rule 6(1)(c)"
  violation: string; // What is wrong
  suggestion: string; // Suggestion / remedy
  severity?: 'critical' | 'high' | 'medium';
}

export interface ComplianceItem {
  id: string;
  ruleCode: string; // e.g. "Rule 6(1)(e)"
  title: string; // e.g. "Retail Sale Price (MRP) inclusive of all taxes"
  extractedValue: string; // e.g. "₹ 45.00 (incl. of all taxes)" or "NOT FOUND"
  position?: string; // Approximate position on packaging, e.g. "Bottom right panel", "Back center", "Top flap"
  photoNumber?: number | null; // Which photo number (1-based index) this declaration was found in
  verdict: DeclarationVerdict; // 'PASS' | 'FAIL' | 'WARNING'
  isCompliant: boolean;
  status: ComplianceStatus;
  mandatory: boolean;
  requirement: string; // Statutory text requirement
  findingNotes: string; // Assessment reasoning
  suggestion?: string; // Actionable suggestion of what is wrong and how to fix
  penaltyReference?: string; // e.g. "Section 36 of Legal Metrology Act, 2009"
}

export interface ExtractedDeclarationItem {
  declarationName: string; // e.g. "Product name", "Manufacturer / Packer / Importer name and address"
  value: string; // value found on the label or "NOT FOUND"
  position: string; // approximate position of text on label e.g. "Top center of front label", "Bottom left of back panel"
  photoNumber?: number | null; // e.g. 1, 2, 3 (which uploaded photo this text was detected in)
  status?: 'FOUND' | 'NOT_FOUND' | 'INCOMPLETE';
  verdict?: DeclarationVerdict; // 'PASS' | 'FAIL' | 'WARNING'
  notes?: string;
}

export interface ProductScan {
  id: string;
  timestamp: string; // ISO string
  productName: string;
  brand?: string;
  category?: string;
  overallCompliant: boolean;
  complianceVerdict: 'COMPLIANT' | 'NON-COMPLIANT'; // COMPLIANT or NON-COMPLIANT
  complianceScore: number; // 0 to 100
  summaryVerdict: string;
  imageUrl: string;
  images?: string[];
  extractedDeclarations?: ExtractedDeclarationItem[];
  otherTextPrinted?: string[];
  imageQuality?: {
    isBlurry: boolean;
    noTextFound: boolean;
    qualityNote: string;
  };
  items: ComplianceItem[];
  violations: (string | ViolationDetail)[];
  violationDetails?: ViolationDetail[];
  recommendations: string[];
  inspectorNotes?: string;
  scannedByRole?: UserRole;
  scannedByName?: string;
  isCitizenReport?: boolean;
  citizenGrievance?: {
    complaintRef: string;
    storeName: string;
    location: string;
    city?: string;
    dateReported: string;
    status: 'PENDING_REVIEW' | 'INVESTIGATING' | 'NOTICE_ISSUED' | 'DISMISSED';
    officerNotes?: string;
  };
}

export interface DashboardMetrics {
  totalScans: number;
  compliantCount: number;
  nonCompliantCount: number;
  complianceRate: number; // percentage
  commonViolations: {
    rule: string;
    description: string;
    count: number;
    percentage: number;
  }[];
}

export type UserRole = 'admin' | 'inspector' | 'citizen';

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  designation: string;
  email: string;
  phone?: string;
  jurisdiction: string;
  badgeNumber: string;
  dateAdded: string;
  status: 'active' | 'inactive';
}
