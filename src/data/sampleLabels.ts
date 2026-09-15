import { ProductScan } from '../types';

export interface SampleLabelOption {
  id: string;
  name: string;
  category: string;
  statusText: string;
  expectedCompliant: boolean;
  thumbnailUrl: string;
  description: string;
  defaultResult: ProductScan;
}

// Generate realistic packaging label SVGs encoded as data URLs
function createLabelSvg(title: string, brand: string, netQty: string, mrp: string, details: string[], bgColor = '#f8fafc', accentColor = '#1e3a8a'): string {
  const detailsXml = details
    .map((d, i) => `<text x="24" y="${180 + i * 22}" font-family="Arial, sans-serif" font-size="12" fill="#334155">${d}</text>`)
    .join('');

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 450 480" width="450" height="480">
  <rect width="450" height="480" fill="${bgColor}" rx="12" stroke="#cbd5e1" stroke-width="2"/>
  
  <!-- Top Banner / Brand -->
  <rect x="0" y="0" width="450" height="70" fill="${accentColor}" rx="12 12 0 0"/>
  <text x="24" y="36" font-family="Arial, sans-serif" font-weight="bold" font-size="18" fill="#ffffff" letter-spacing="1">${brand.toUpperCase()}</text>
  <text x="24" y="56" font-family="Arial, sans-serif" font-size="12" fill="#93c5fd">${title}</text>
  
  <!-- Product Main Declaration Badge -->
  <rect x="20" y="85" width="410" height="60" fill="#ffffff" rx="8" stroke="#e2e8f0"/>
  <text x="36" y="110" font-family="Arial, sans-serif" font-size="11" fill="#64748b" font-weight="bold">NET QUANTITY / शुद्ध मात्रा</text>
  <text x="36" y="132" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#0f172a">${netQty}</text>
  
  <text x="230" y="110" font-family="Arial, sans-serif" font-size="11" fill="#64748b" font-weight="bold">MAX. RETAIL PRICE (M.R.P.)</text>
  <text x="230" y="132" font-family="Arial, sans-serif" font-size="15" font-weight="bold" fill="#0f172a">${mrp}</text>

  <!-- Legal Metrology Mandated Panel -->
  <rect x="20" y="155" width="410" height="255" fill="#ffffff" rx="8" stroke="#e2e8f0"/>
  <text x="24" y="174" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="${accentColor}">MANDATORY STATUTORY DECLARATIONS (RULE 6 PCR 2011)</text>
  ${detailsXml}

  <!-- Barcode Simulation -->
  <g transform="translate(30, 422)">
    <rect x="0" y="0" width="180" height="38" fill="#ffffff" stroke="#cbd5e1"/>
    <line x1="10" y1="5" x2="10" y2="30" stroke="#000" stroke-width="2"/>
    <line x1="16" y1="5" x2="16" y2="30" stroke="#000" stroke-width="3"/>
    <line x1="24" y1="5" x2="24" y2="30" stroke="#000" stroke-width="1"/>
    <line x1="30" y1="5" x2="30" y2="30" stroke="#000" stroke-width="4"/>
    <line x1="40" y1="5" x2="40" y2="30" stroke="#000" stroke-width="2"/>
    <line x1="50" y1="5" x2="50" y2="30" stroke="#000" stroke-width="3"/>
    <line x1="62" y1="5" x2="62" y2="30" stroke="#000" stroke-width="1"/>
    <line x1="72" y1="5" x2="72" y2="30" stroke="#000" stroke-width="3"/>
    <line x1="84" y1="5" x2="84" y2="30" stroke="#000" stroke-width="2"/>
    <line x1="96" y1="5" x2="96" y2="30" stroke="#000" stroke-width="4"/>
    <line x1="110" y1="5" x2="110" y2="30" stroke="#000" stroke-width="2"/>
    <line x1="120" y1="5" x2="120" y2="30" stroke="#000" stroke-width="1"/>
    <line x1="130" y1="5" x2="130" y2="30" stroke="#000" stroke-width="3"/>
    <line x1="145" y1="5" x2="145" y2="30" stroke="#000" stroke-width="2"/>
    <line x1="160" y1="5" x2="160" y2="30" stroke="#000" stroke-width="3"/>
    <text x="35" y="36" font-family="monospace" font-size="8" fill="#475569">8 901234 567890</text>
  </g>

  <!-- Green Veg Dot / Stamp -->
  <g transform="translate(370, 422)">
    <rect x="0" y="0" width="36" height="36" fill="#fff" stroke="#15803d" stroke-width="2"/>
    <circle cx="18" cy="18" r="9" fill="#15803d"/>
  </g>
</svg>
`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const SAMPLE_LABELS: SampleLabelOption[] = [
  {
    id: 'sample-compliant-ghee',
    name: 'Ananda Pure Desi Ghee (1 Litre)',
    category: 'Dairy & Edible Oils',
    statusText: 'Fully Compliant (100% Score)',
    expectedCompliant: true,
    thumbnailUrl: createLabelSvg(
      'Pure Desi Cow Ghee (Clarified Butter)',
      'Ananda Dairy Foods Ltd.',
      '1 L (905 g)',
      '₹ 680.00 (incl. of all taxes)',
      [
        '• Mfg Date: 12/08/2026 | Batch: AG-2026-44B',
        '• Best Before: 9 Months from date of packing',
        '• Unit Sale Price: ₹ 0.68 / ml',
        '• Mfd & Packed By: Ananda Dairy Foods Ltd, Plot 42,',
        '  Industrial Area Phase 2, Noida, UP - 201301, India',
        '• Country of Origin: India',
        '• Customer Care: Manager, Consumer Affairs',
        '  Toll-Free: 1800-180-2244 | Email: care@anandafoods.in',
        '  Address: Same as manufacturer'
      ],
      '#f8fafc',
      '#1e3a8a'
    ),
    description: 'Fully compliant sample packaging with complete statutory declaration panel matching all Rule 6 provisions.',
    defaultResult: {
      id: 'scan-sample-1',
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      productName: 'Ananda Pure Desi Cow Ghee',
      brand: 'Ananda Dairy Foods Ltd.',
      category: 'Dairy & Edible Oils',
      overallCompliant: true,
      complianceVerdict: 'COMPLIANT',
      complianceScore: 100,
      summaryVerdict: 'COMPLIANT: All mandatory declarations under Rule 6 of Legal Metrology (PC) Rules 2011 are clearly visible, formatted correctly, and satisfy statutory norms.',
      imageUrl: '',
      items: [
        {
          id: 'item-1',
          ruleCode: 'Rule 6(1)(a)',
          title: 'Name & Address of Manufacturer / Packer',
          extractedValue: 'Ananda Dairy Foods Ltd, Plot 42, Industrial Area Phase 2, Noida, UP - 201301, India',
          isCompliant: true,
          status: 'compliant',
          verdict: 'PASS',
          mandatory: true,
          requirement: 'Complete name and physical registered postal address including PIN code.',
          findingNotes: 'Complete legal entity name, factory plot, and postal PIN code are declared.'
        },
        {
          id: 'item-2',
          ruleCode: 'Rule 6(1)(b)',
          title: 'Generic or Common Name of Commodity',
          extractedValue: 'Pure Desi Cow Ghee (Clarified Butter)',
          isCompliant: true,
          status: 'compliant',
          verdict: 'PASS',
          mandatory: true,
          requirement: 'Generic or common name must clearly identify the packaged product.',
          findingNotes: 'Generic name clearly printed without ambiguous terminology.'
        },
        {
          id: 'item-3',
          ruleCode: 'Rule 6(1)(c)',
          title: 'Net Quantity (Metric Units)',
          extractedValue: '1 L (905 g)',
          isCompliant: true,
          status: 'compliant',
          verdict: 'PASS',
          mandatory: true,
          requirement: 'Expressed in standard SI metric units (g, kg, ml, l).',
          findingNotes: 'Standard metric unit used with volume and mass equivalence.'
        },
        {
          id: 'item-4',
          ruleCode: 'Rule 6(1)(d)',
          title: 'Month & Year of Manufacture / Packing',
          extractedValue: '12/08/2026',
          isCompliant: true,
          status: 'compliant',
          verdict: 'PASS',
          mandatory: true,
          requirement: 'Month and year of manufacture or pre-packing.',
          findingNotes: 'Clearly indicated with day, month and year format alongside batch number.'
        },
        {
          id: 'item-5',
          ruleCode: 'Rule 6(1)(e)',
          title: 'Maximum Retail Price (MRP)',
          extractedValue: '₹ 680.00 (incl. of all taxes)',
          isCompliant: true,
          status: 'compliant',
          verdict: 'PASS',
          mandatory: true,
          requirement: 'Must state MRP in Indian Currency with "incl. of all taxes" or "inclusive of all taxes".',
          findingNotes: 'Indian Rupee symbol (₹) present and includes statutory phrase "(incl. of all taxes)".'
        },
        {
          id: 'item-6',
          ruleCode: 'Rule 6(1)(e) Amdt',
          title: 'Unit Sale Price (USP)',
          extractedValue: '₹ 0.68 / ml',
          isCompliant: true,
          status: 'compliant',
          verdict: 'PASS',
          mandatory: true,
          requirement: 'Mandatory for packages containing >1 kg or >1 L (Unit sale price per g or ml).',
          findingNotes: 'Unit sale price declared accurately at ₹0.68 per ml.'
        },
        {
          id: 'item-7',
          ruleCode: 'Rule 6(1)(n)',
          title: 'Consumer Care Helpline & Contact',
          extractedValue: 'Toll-Free: 1800-180-2244 | Email: care@anandafoods.in | Noida UP',
          isCompliant: true,
          status: 'compliant',
          verdict: 'PASS',
          mandatory: true,
          requirement: 'Officer designation, postal address, working telephone number AND email address.',
          findingNotes: 'Complete consumer care officer title, toll-free number, and email provided.'
        },
        {
          id: 'item-8',
          ruleCode: 'Rule 6(10)',
          title: 'Country of Origin',
          extractedValue: 'India',
          isCompliant: true,
          status: 'compliant',
          verdict: 'PASS',
          mandatory: true,
          requirement: 'Country of manufacture or origin must be declared conspicuously.',
          findingNotes: 'Declared explicitly as "Country of Origin: India".'
        }
      ],
      violations: [],
      violationDetails: [],
      recommendations: ['Label is fully compliant with Indian Legal Metrology (PC) Rules 2011. No remedial action needed.']
    }
  },
  {
    id: 'sample-noncompliant-snack',
    name: 'Crunchy Salsa Nacho Tortilla Chips 150g',
    category: 'Packaged Snacks',
    statusText: 'Non-Compliant (MRP & Net Quantity FAIL)',
    expectedCompliant: false,
    thumbnailUrl: createLabelSvg(
      'Crunchy Salsa Nacho Chips',
      'Fiesta Snacks Co.',
      'Net Wt: 5.3 oz (150g)',
      'MRP: 60/- Only',
      [
        '• Mfg Date: Not Specified (Batch #2026-F9)',
        '• Best Before: 6 Months',
        '• Packed By: Fiesta Snacks, Mumbai',
        '• Origin: Not declared',
        '• Feedback: Call our hotline 022-99887766',
        '  (Email address: Missing)',
        '  (Unit Sale Price: Missing)',
        '• Ingredients: Corn, Palm Oil, Spices'
      ],
      '#fff7ed',
      '#c2410c'
    ),
    description: 'Contains imperial weight notation first (5.3 oz), MRP missing "inclusive of all taxes", missing consumer care email, and missing country of origin.',
    defaultResult: {
      id: 'scan-sample-2',
      timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
      productName: 'Crunchy Salsa Nacho Chips',
      brand: 'Fiesta Snacks Co.',
      category: 'Packaged Snacks',
      overallCompliant: false,
      complianceVerdict: 'NON-COMPLIANT',
      complianceScore: 38,
      summaryVerdict: 'NON-COMPLIANT: Statutory violations under Rule 6(1)(e), Rule 6(1)(c), Rule 6(1)(n), and Rule 6(10) of Legal Metrology (PC) Rules 2011.',
      imageUrl: '',
      items: [
        {
          id: 'item-1',
          ruleCode: 'Rule 6(1)(a)',
          title: 'Name & Address of Manufacturer / Packer',
          extractedValue: 'Fiesta Snacks, Mumbai (Incomplete PIN / street address)',
          isCompliant: false,
          status: 'warning',
          verdict: 'WARNING',
          mandatory: true,
          requirement: 'Complete postal address including PIN code and premises identification.',
          findingNotes: 'Only "Mumbai" is written. Missing street, industrial plot, and mandatory PIN code.',
          suggestion: 'Provide full registered premises address with PIN code under Rule 6(1)(a).'
        },
        {
          id: 'item-2',
          ruleCode: 'Rule 6(1)(b)',
          title: 'Generic or Common Name of Commodity',
          extractedValue: 'Crunchy Salsa Nacho Chips',
          isCompliant: true,
          status: 'compliant',
          verdict: 'PASS',
          mandatory: true,
          requirement: 'Generic or common name must clearly identify the packaged product.',
          findingNotes: 'Identified clearly as Nacho Tortilla Chips.'
        },
        {
          id: 'item-3',
          ruleCode: 'Rule 6(1)(c)',
          title: 'Net Quantity (Metric Units)',
          extractedValue: 'Net Wt: 5.3 oz (150g)',
          isCompliant: false,
          status: 'non_compliant',
          verdict: 'FAIL',
          mandatory: true,
          requirement: 'Must declare in standard SI metric units (g, kg). Imperial units (oz, lbs) cannot precede metric units.',
          findingNotes: 'FAIL: Imperial unit (5.3 oz) precedes metric unit. Rule 13 mandates SI metric units as primary declaration.',
          suggestion: 'Display net quantity exclusively in metric units (e.g., "Net Quantity: 150 g"). Imperial units cannot precede metric units.'
        },
        {
          id: 'item-4',
          ruleCode: 'Rule 6(1)(d)',
          title: 'Month & Year of Manufacture / Packing',
          extractedValue: 'Missing / Not Stated',
          isCompliant: false,
          status: 'non_compliant',
          verdict: 'FAIL',
          mandatory: true,
          requirement: 'Month and year of manufacture or pre-packing.',
          findingNotes: 'FAIL: Month and year of packing is absent from the label.',
          suggestion: 'Print month and year of manufacture/packing prominently using MM/YYYY format.'
        },
        {
          id: 'item-5',
          ruleCode: 'Rule 6(1)(e)',
          title: 'Maximum Retail Price (MRP)',
          extractedValue: 'MRP: 60/- Only',
          isCompliant: false,
          status: 'non_compliant',
          verdict: 'FAIL',
          mandatory: true,
          requirement: 'Must state MRP with mandatory words "inclusive of all taxes" or "incl. of all taxes".',
          findingNotes: 'FAIL: Stated as "MRP: 60/- Only". The mandatory phrase "inclusive of all taxes" or "incl. of all taxes" is missing.',
          suggestion: 'Update MRP to include the statutory phrase: "MRP ₹ 60.00 (inclusive of all taxes)".'
        },
        {
          id: 'item-6',
          ruleCode: 'Rule 6(1)(n)',
          title: 'Consumer Care Details (Email & Phone)',
          extractedValue: 'Call 022-99887766 (Email missing)',
          isCompliant: false,
          status: 'non_compliant',
          verdict: 'FAIL',
          mandatory: true,
          requirement: 'Consumer care must include name, address, telephone number AND electronic mail (email).',
          findingNotes: 'FAIL: Electronic mail address for consumer grievance redressal is missing.',
          suggestion: 'Include active email address (e.g., care@fiestasnacks.com) alongside phone helpline for grievance redressal.'
        },
        {
          id: 'item-7',
          ruleCode: 'Rule 6(10)',
          title: 'Country of Origin',
          extractedValue: 'Not declared',
          isCompliant: false,
          status: 'non_compliant',
          verdict: 'FAIL',
          mandatory: true,
          requirement: 'Country of origin is mandatory on all packaged commodities.',
          findingNotes: 'FAIL: Label fails to state "Country of Origin: India" or country of manufacture.',
          suggestion: 'Add clear declaration "Country of Origin: India" on the principal display panel.'
        }
      ],
      violations: [
        'MRP does not say "inclusive of all taxes" [Rule 6(1)(e)]',
        'Net quantity displays non-standard imperial unit first without proper metric primacy [Rule 6(1)(c)]',
        'Missing statutory Consumer Care Email address [Rule 6(1)(n)]',
        'Month and year of manufacture/packing absent [Rule 6(1)(d)]',
        'Country of origin declaration is missing [Rule 6(10)]'
      ],
      violationDetails: [
        {
          ruleCode: 'Rule 6(1)(e)',
          severity: 'critical',
          violation: 'MRP declared as "MRP: 60/- Only" without mandatory statutory phrase "inclusive of all taxes" or "(incl. of all taxes)".',
          suggestion: 'Reprint label with "MRP ₹ 60.00 (inclusive of all taxes)".'
        },
        {
          ruleCode: 'Rule 6(1)(c)',
          severity: 'high',
          violation: 'Imperial unit (5.3 oz) precedes metric unit. Legal Metrology mandates SI metric units (g/kg/ml/L) as primary declaration.',
          suggestion: 'Declare net quantity primarily as "150 g" in standard font size.'
        },
        {
          ruleCode: 'Rule 6(1)(n)',
          severity: 'high',
          violation: 'No email address provided for consumer complaints. Rule 6(1)(n) mandates both telephone and email.',
          suggestion: 'Add official grievance email address alongside phone number.'
        },
        {
          ruleCode: 'Rule 6(10)',
          severity: 'critical',
          violation: 'Country of origin is not stated on packaging.',
          suggestion: 'Affix "Country of Origin: India" declaration conspicuously.'
        }
      ],
      recommendations: [
        'Reprint label with "MRP ₹ 60.00 (inclusive of all taxes)".',
        'Declare net quantity primarily in metric units (150 g).',
        'Add consumer care email address (e.g. care@fiestasnacks.com).',
        'Stamp month and year of packaging (MM/YYYY) clearly.',
        'Declare "Country of Origin: India" prominently.'
      ]
    }
  },
  {
    id: 'sample-dual-mrp-sticker',
    name: 'Basmati Rice 5kg (Dual MRP Sticker Detected)',
    category: 'Staples & Grains',
    statusText: 'Non-Compliant (Dual MRP Sticker Violation)',
    expectedCompliant: false,
    thumbnailUrl: createLabelSvg(
      'Royal Premium Basmati Rice 5kg',
      'Heritage Agri Foods Ltd.',
      'Net Qty: 5 kg',
      'STICKER: ₹ 480 (Original: ₹ 410)',
      [
        '• WARNING: Sticker overlaid over printed MRP',
        '• Original Printed Price: ₹ 410.00 (incl. taxes)',
        '• Overwritten Sticker: ₹ 480.00',
        '• Mfg Date: 05/2026 | Batch: BR-8821',
        '• Packed By: Heritage Agri Foods Ltd, Karnal, HR',
        '• Country of Origin: India',
        '• Care: 1800-200-4411 | ricecare@heritagefoods.com'
      ],
      '#fef2f2',
      '#b91c1c'
    ),
    description: 'Critical Legal Metrology violation: Retailer has overlaid a ₹480 sticker on top of manufacturer printed ₹410 MRP.',
    defaultResult: {
      id: 'scan-sample-3',
      timestamp: new Date(Date.now() - 3600000 * 14).toISOString(),
      productName: 'Royal Premium Basmati Rice 5kg',
      brand: 'Heritage Agri Foods Ltd.',
      category: 'Staples & Grains',
      overallCompliant: false,
      complianceVerdict: 'NON-COMPLIANT',
      complianceScore: 28,
      summaryVerdict: 'NON-COMPLIANT: CRITICAL VIOLATION - Dual MRP stickers detected. Overwriting or affixing higher price sticker is strictly prohibited under Rule 18(2) of Legal Metrology (PC) Rules 2011.',
      imageUrl: '',
      items: [
        {
          id: 'item-1',
          ruleCode: 'Rule 6(1)(a)',
          title: 'Name & Address of Manufacturer / Packer',
          extractedValue: 'Heritage Agri Foods Ltd, GT Road, Karnal, Haryana - 132001',
          isCompliant: true,
          status: 'compliant',
          verdict: 'PASS',
          mandatory: true,
          requirement: 'Complete postal address including PIN code.',
          findingNotes: 'Complete factory details with PIN code.'
        },
        {
          id: 'item-2',
          ruleCode: 'Rule 6(1)(b)',
          title: 'Generic or Common Name of Commodity',
          extractedValue: 'Premium Basmati Rice',
          isCompliant: true,
          status: 'compliant',
          verdict: 'PASS',
          mandatory: true,
          requirement: 'Generic or common name.',
          findingNotes: 'Commodity name declared.'
        },
        {
          id: 'item-3',
          ruleCode: 'Rule 6(1)(c)',
          title: 'Net Quantity (Metric Units)',
          extractedValue: '5 kg',
          isCompliant: true,
          status: 'compliant',
          verdict: 'PASS',
          mandatory: true,
          requirement: 'Standard metric units.',
          findingNotes: 'Standard 5 kg net quantity.'
        },
        {
          id: 'item-4',
          ruleCode: 'Rule 6(1)(d)',
          title: 'Month & Year of Packing',
          extractedValue: '05/2026',
          isCompliant: true,
          status: 'compliant',
          verdict: 'PASS',
          mandatory: true,
          requirement: 'Month and year of manufacture or packaging.',
          findingNotes: 'Batch and packing date indicated.'
        },
        {
          id: 'item-5',
          ruleCode: 'Rule 6(1)(e) & Rule 18(2)',
          title: 'Maximum Retail Price (Dual Sticker Violation)',
          extractedValue: 'Original ₹ 410.00 overlaid with Sticker ₹ 480.00',
          isCompliant: false,
          status: 'non_compliant',
          verdict: 'FAIL',
          mandatory: true,
          requirement: 'No person shall alter, smudge or obliterate the price marked by manufacturer, or affix additional price sticker.',
          findingNotes: 'CRITICAL VIOLATION: Two conflicting MRPs detected. Secondary adhesive sticker of ₹480 has been applied over manufacturer printed MRP of ₹410.',
          suggestion: 'Remove illegal higher price sticker. Product must be sold at or below original manufacturer printed MRP (₹410.00).'
        },
        {
          id: 'item-6',
          ruleCode: 'Rule 6(1)(n)',
          title: 'Consumer Care Helpline & Email',
          extractedValue: '1800-200-4411 | ricecare@heritagefoods.com',
          isCompliant: true,
          status: 'compliant',
          verdict: 'PASS',
          mandatory: true,
          requirement: 'Telephone and email.',
          findingNotes: 'Toll-free and email provided.'
        },
        {
          id: 'item-7',
          ruleCode: 'Rule 6(10)',
          title: 'Country of Origin',
          extractedValue: 'India',
          isCompliant: true,
          status: 'compliant',
          verdict: 'PASS',
          mandatory: true,
          requirement: 'Country of origin.',
          findingNotes: 'Declared as India.'
        }
      ],
      violations: [
        'Dual MRP detected: Sticker price ₹480 overlaid on original printed MRP ₹410 [Rule 18(2)]',
        'Altering or obliterating manufacturer printed MRP is punishable under Legal Metrology Act, 2009'
      ],
      violationDetails: [
        {
          ruleCode: 'Rule 18(2)',
          severity: 'critical',
          violation: 'Two conflicting retail prices detected on package. Secondary sticker price of ₹480 was overlaid on original printed MRP of ₹410.',
          suggestion: 'Immediately remove adhesive price sticker. Sale at inflated price over printed MRP violates Section 36(1) and Rule 18(2).'
        }
      ],
      recommendations: [
        'Sell commodity strictly at or below manufacturer printed MRP of ₹410.00.',
        'Do not paste secondary price stickers over pre-packaged goods.'
      ]
    }
  },
  {
    id: 'sample-expired-product',
    name: 'Organic Almond Milk 1L (Expired Commodity)',
    category: 'Dairy Alternatives',
    statusText: 'Non-Compliant (Expired Shelf-Life)',
    expectedCompliant: false,
    thumbnailUrl: createLabelSvg(
      'Organic Unsweetened Almond Milk 1L',
      'Natura Plant Foods LLP',
      'Net Volume: 1 L',
      'MRP: ₹ 240.00 (incl. of all taxes)',
      [
        '• EXPIRED PRODUCT DETECTED',
        '• Mfg Date: 10/01/2023 | Batch: AM-23-01',
        '• Best Before: 12 Months from Mfg (Expired Jan 2024)',
        '• Today\'s Date is post-expiry',
        '• Mfd By: Natura Plant Foods, Pune - 411028',
        '• Country of Origin: India',
        '• Care: support@naturamilk.in'
      ],
      '#fef2f2',
      '#991b1b'
    ),
    description: 'Product has crossed its shelf-life / best-before date compared with the current calendar date.',
    defaultResult: {
      id: 'scan-sample-4',
      timestamp: new Date(Date.now() - 3600000 * 30).toISOString(),
      productName: 'Organic Unsweetened Almond Milk 1L',
      brand: 'Natura Plant Foods LLP',
      category: 'Dairy Alternatives',
      overallCompliant: false,
      complianceVerdict: 'NON-COMPLIANT',
      complianceScore: 45,
      summaryVerdict: 'NON-COMPLIANT: CRITICAL VIOLATION - Expired packaged commodity. Manufacture date 10/01/2023 with 12 months best-before shelf life has expired.',
      imageUrl: '',
      items: [
        {
          id: 'item-1',
          ruleCode: 'Rule 6(1)(a)',
          title: 'Name & Address of Manufacturer / Packer',
          extractedValue: 'Natura Plant Foods LLP, Pune - 411028',
          isCompliant: true,
          status: 'compliant',
          verdict: 'PASS',
          mandatory: true,
          requirement: 'Manufacturer name and address.',
          findingNotes: 'Postal address with PIN code declared.'
        },
        {
          id: 'item-2',
          ruleCode: 'Rule 6(1)(b)',
          title: 'Generic or Common Name of Commodity',
          extractedValue: 'Organic Unsweetened Almond Milk',
          isCompliant: true,
          status: 'compliant',
          verdict: 'PASS',
          mandatory: true,
          requirement: 'Generic name.',
          findingNotes: 'Clearly identified.'
        },
        {
          id: 'item-3',
          ruleCode: 'Rule 6(1)(c)',
          title: 'Net Quantity (Metric Units)',
          extractedValue: '1 L',
          isCompliant: true,
          status: 'compliant',
          verdict: 'PASS',
          mandatory: true,
          requirement: 'Metric unit.',
          findingNotes: 'Standard 1 L declared.'
        },
        {
          id: 'item-4',
          ruleCode: 'Rule 6(1)(d) & Expiry',
          title: 'Date of Manufacture & Best Before Expiry',
          extractedValue: 'Mfg: 10/01/2023 | Best Before: 12 Months (EXPIRED)',
          isCompliant: false,
          status: 'non_compliant',
          verdict: 'FAIL',
          mandatory: true,
          requirement: 'Commodities must not be sold beyond their expiry or best-before date.',
          findingNotes: 'CRITICAL VIOLATION: Packaged product expired in January 2024 based on declared 12-month shelf life.',
          suggestion: 'Immediately remove and seize stock. Sale of expired pre-packaged goods is prohibited by law.'
        },
        {
          id: 'item-5',
          ruleCode: 'Rule 6(1)(e)',
          title: 'Maximum Retail Price (MRP)',
          extractedValue: '₹ 240.00 (incl. of all taxes)',
          isCompliant: true,
          status: 'compliant',
          verdict: 'PASS',
          mandatory: true,
          requirement: 'MRP with inclusive of all taxes.',
          findingNotes: 'Compliant MRP format.'
        },
        {
          id: 'item-6',
          ruleCode: 'Rule 6(1)(n)',
          title: 'Consumer Care Helpline & Email',
          extractedValue: 'support@naturamilk.in',
          isCompliant: true,
          status: 'compliant',
          verdict: 'PASS',
          mandatory: true,
          requirement: 'Consumer grievance contact.',
          findingNotes: 'Email provided.'
        },
        {
          id: 'item-7',
          ruleCode: 'Rule 6(10)',
          title: 'Country of Origin',
          extractedValue: 'India',
          isCompliant: true,
          status: 'compliant',
          verdict: 'PASS',
          mandatory: true,
          requirement: 'Country of origin.',
          findingNotes: 'Country of origin declared.'
        }
      ],
      violations: [
        'Product is past its expiry/best-before date (Mfg: 10/01/2023, 12 months shelf-life)',
        'Retail sale of expired pre-packaged commodities is strictly prohibited'
      ],
      violationDetails: [
        {
          ruleCode: 'Rule 6(1)(d)',
          severity: 'critical',
          violation: 'Product manufacture date is 10/01/2023 with 12-month shelf life. The commodity is expired and unfit for retail distribution.',
          suggestion: 'Immediately condemn and withdraw expired inventory from retail shelf.'
        }
      ],
      recommendations: [
        'Immediately quarantine and pull expired batch AM-23-01 from shelf.',
        'Audit stock rotation and shelf-life tracking in retail inventory.'
      ]
    }
  },
  {
    id: 'sample-blurry-cutoff',
    name: 'Herbal Hand Sanitizer 100ml (Cut-off & Blurry Text)',
    category: 'Personal Care & Hygiene',
    statusText: 'Warning (Partially Cut-off / Blurry Declarations)',
    expectedCompliant: false,
    thumbnailUrl: createLabelSvg(
      'AyurShield Herbal Hand Sanitizer',
      'Veda Life Sciences Pvt Ltd',
      'Net Qty: 10... [Cut off]',
      '₹ 50.00 (incl. of all taxes)',
      [
        '• Text partially cut off at label edge',
        '• Net Qty text truncated: "10..."',
        '• Mfg Date: 08/2026',
        '• Customer Care: [Blurry / Unreadable font]',
        '• Country of Origin: India',
        '• Warning: Verification needed with clearer photo'
      ],
      '#fffbeb',
      '#d97706'
    ),
    description: 'Demonstrates WARNING verdicts where text is found but looks partially cut off at label seam or blurry in packaging image.',
    defaultResult: {
      id: 'scan-sample-5',
      timestamp: new Date(Date.now() - 3600000 * 50).toISOString(),
      productName: 'AyurShield Herbal Hand Sanitizer 100ml',
      brand: 'Veda Life Sciences Pvt Ltd',
      category: 'Personal Care & Hygiene',
      overallCompliant: false,
      complianceVerdict: 'NON-COMPLIANT',
      complianceScore: 68,
      summaryVerdict: 'NON-COMPLIANT: 2 WARNING verdicts identified. Net quantity text is truncated/cut off at label margin and consumer care contact is blurry.',
      imageUrl: '',
      items: [
        {
          id: 'item-1',
          ruleCode: 'Rule 6(1)(a)',
          title: 'Name & Address of Manufacturer / Packer',
          extractedValue: 'Veda Life Sciences Pvt Ltd, Plot 18, Haridwar, UK - 249401',
          isCompliant: true,
          status: 'compliant',
          verdict: 'PASS',
          mandatory: true,
          requirement: 'Manufacturer postal address.',
          findingNotes: 'Complete factory details with PIN code are legible.'
        },
        {
          id: 'item-2',
          ruleCode: 'Rule 6(1)(b)',
          title: 'Generic or Common Name of Commodity',
          extractedValue: 'Herbal Hand Sanitizer (Alcohol Based)',
          isCompliant: true,
          status: 'compliant',
          verdict: 'PASS',
          mandatory: true,
          requirement: 'Generic name.',
          findingNotes: 'Generic name clearly printed.'
        },
        {
          id: 'item-3',
          ruleCode: 'Rule 6(1)(c)',
          title: 'Net Quantity (Partially Cut-off)',
          extractedValue: '10... [Truncated at seam]',
          isCompliant: false,
          status: 'warning',
          verdict: 'WARNING',
          mandatory: true,
          requirement: 'Net quantity must be declared conspicuously and completely without truncation.',
          findingNotes: 'WARNING: Text is found but partially cut off at label margin or cylindrical curve. Unit "ml" is not fully legible.',
          suggestion: 'Ensure label layout maintains adequate margin so net quantity (100 ml) is completely visible without cutoff.'
        },
        {
          id: 'item-4',
          ruleCode: 'Rule 6(1)(d)',
          title: 'Month & Year of Manufacture',
          extractedValue: '08/2026',
          isCompliant: true,
          status: 'compliant',
          verdict: 'PASS',
          mandatory: true,
          requirement: 'Month and year of manufacture.',
          findingNotes: 'Month and year declared.'
        },
        {
          id: 'item-5',
          ruleCode: 'Rule 6(1)(e)',
          title: 'Maximum Retail Price (MRP)',
          extractedValue: '₹ 50.00 (incl. of all taxes)',
          isCompliant: true,
          status: 'compliant',
          verdict: 'PASS',
          mandatory: true,
          requirement: 'MRP with inclusive of all taxes.',
          findingNotes: 'Compliant MRP format.'
        },
        {
          id: 'item-6',
          ruleCode: 'Rule 6(1)(n)',
          title: 'Consumer Care Details (Blurry Font)',
          extractedValue: 'care@vedalife... [Blurry font]',
          isCompliant: false,
          status: 'warning',
          verdict: 'WARNING',
          mandatory: true,
          requirement: 'Consumer care contact must be clear and legible.',
          findingNotes: 'WARNING: The consumer care telephone and email are too blurry in the image to verify complete digits.',
          suggestion: 'Re-upload a clearer, higher-resolution photo or inspect font minimum height under Rule 9.'
        },
        {
          id: 'item-7',
          ruleCode: 'Rule 6(10)',
          title: 'Country of Origin',
          extractedValue: 'India',
          isCompliant: true,
          status: 'compliant',
          verdict: 'PASS',
          mandatory: true,
          requirement: 'Country of origin.',
          findingNotes: 'Declared explicitly.'
        }
      ],
      violations: [
        'Net quantity text is partially cut off at label boundary [Rule 6(1)(c)]',
        'Consumer care contact text is blurry / low legibility [Rule 6(1)(n)]'
      ],
      violationDetails: [
        {
          ruleCode: 'Rule 6(1)(c)',
          severity: 'medium',
          violation: 'Net quantity declaration is truncated at the container seam ("10..."), preventing clear metric verification.',
          suggestion: 'Adjust label margin so "100 ml" is clearly visible on front display panel.'
        },
        {
          ruleCode: 'Rule 6(1)(n)',
          severity: 'medium',
          violation: 'Consumer care helpline text is blurry and unconfirmable.',
          suggestion: 'Ensure minimum font height under Rule 9 and provide high-contrast print.'
        }
      ],
      recommendations: [
        'Retake packaging photograph with sharp focus to confirm blurred text.',
        'Adjust label die-cut margins so net quantity is not truncated.'
      ]
    }
  }
];

// Initial seeded history for the table
export const INITIAL_HISTORY: ProductScan[] = SAMPLE_LABELS.map((s, idx) => {
  const isCitizen = idx % 2 === 1; // seed some as citizen reports
  return {
    ...s.defaultResult,
    imageUrl: s.thumbnailUrl,
    images: [s.thumbnailUrl],
    scannedByRole: isCitizen ? 'citizen' : 'inspector',
    scannedByName: isCitizen ? 'Sunil Sharma (Citizen Consumer)' : 'Rajesh Sharma (Inspector)',
    isCitizenReport: isCitizen,
    citizenGrievance: isCitizen ? {
      complaintRef: `NCH-2026-00${4810 + idx}`,
      storeName: idx === 1 ? 'Gupta Super Kirana, Karol Bagh' : 'Blinkit Hub 14, Indiranagar',
      location: idx === 1 ? 'Shop 42, Arya Samaj Road, Karol Bagh, New Delhi' : '100ft Road, Indiranagar, Bengaluru',
      city: idx === 1 ? 'New Delhi' : 'Bengaluru',
      dateReported: '2026-09-12T14:30:00.000Z',
      status: 'PENDING_REVIEW',
      officerNotes: 'Citizen reported store charging ₹10 over printed MRP and missing consumer helpline.'
    } : undefined
  };
});
