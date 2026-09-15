import { jsPDF } from 'jspdf';
import { ProductScan, ViolationDetail } from '../types';

/**
 * Loads an image from a URL or Base64/SVG string and converts it into a clean
 * raster JPEG/PNG data URL for embedding into jsPDF.
 */
async function loadImageAsRaster(
  src: string
): Promise<{ dataUrl: string; width: number; height: number } | null> {
  return new Promise((resolve) => {
    if (!src) {
      resolve(null);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'Anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        let w = img.naturalWidth || img.width || 600;
        let h = img.naturalHeight || img.height || 600;

        // Downscale oversized images to keep PDF size optimal
        const maxDim = 1000;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }

        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(null);
          return;
        }

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        resolve({ dataUrl, width: w, height: h });
      } catch (err) {
        console.warn('Canvas rasterization error:', err);
        resolve(null);
      }
    };

    img.onerror = (err) => {
      console.warn('Image failed to load for PDF:', err);
      resolve(null);
    };

    img.src = src;
  });
}

/**
 * Generates and triggers download of an official Legal Metrology Compliance Audit PDF Report.
 * Includes all uploaded packaging photos, extracted declarations, verdicts, violations, and mandatory disclaimer.
 */
export async function generateCompliancePdf(scan: ProductScan): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
  const margin = 14;
  const contentWidth = pageWidth - margin * 2; // 182mm
  let y = margin;

  const checkPageBreak = (neededHeight: number): void => {
    if (y + neededHeight > pageHeight - 20) {
      doc.addPage();
      y = margin;
    }
  };

  // --- PAGE 1: HEADER ---
  // Top Govt-Style Header Bar
  doc.setFillColor(30, 58, 138); // Navy blue (#1e3a8a)
  doc.rect(margin, y, contentWidth, 18, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text(
    'LEGAL METROLOGY (PACKAGED COMMODITIES) RULES, 2011',
    pageWidth / 2,
    y + 6.5,
    { align: 'center' }
  );

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(
    'STATUTORY COMPLIANCE INSPECTION AUDIT REPORT',
    pageWidth / 2,
    y + 12.5,
    { align: 'center' }
  );
  y += 22;

  // Metadata Grid Box
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(203, 213, 225); // slate-300
  doc.rect(margin, y, contentWidth, 24, 'FD');

  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105); // slate-600
  doc.text('REPORT ID:', margin + 4, y + 6);
  doc.text('DATE OF SCAN:', margin + 95, y + 6);
  doc.text('PRODUCT NAME:', margin + 4, y + 14);
  doc.text('BRAND / CATEGORY:', margin + 95, y + 14);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text(scan.id || 'SCAN-AUTO', margin + 26, y + 6);

  const formattedDate = new Date(scan.timestamp || Date.now()).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  doc.text(formattedDate, margin + 122, y + 6);

  const truncatedName = doc.splitTextToSize(scan.productName || 'Pre-packaged Commodity', 65)[0];
  doc.text(truncatedName, margin + 31, y + 14);

  const brandCat = `${scan.brand || 'Unbranded'} / ${scan.category || 'General'}`;
  doc.text(brandCat, margin + 130, y + 14);
  y += 28;

  // --- OVERALL VERDICT & SCORE BANNER ---
  const isCompliant =
    scan.complianceVerdict === 'COMPLIANT' ||
    (scan.overallCompliant && scan.complianceVerdict !== 'NON-COMPLIANT');

  const verdictText = isCompliant ? 'COMPLIANT' : 'NON-COMPLIANT';

  if (isCompliant) {
    doc.setFillColor(236, 253, 245); // emerald-50
    doc.setDrawColor(52, 211, 153); // emerald-400
  } else {
    doc.setFillColor(255, 241, 242); // rose-50
    doc.setDrawColor(248, 113, 113); // rose-400
  }
  doc.rect(margin, y, contentWidth, 24, 'FD');

  // Verdict pill
  if (isCompliant) {
    doc.setFillColor(16, 185, 129); // emerald-600
  } else {
    doc.setFillColor(225, 29, 72); // rose-600
  }
  doc.roundedRect(margin + 4, y + 4, 38, 7, 1.5, 1.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text(`VERDICT: ${verdictText}`, margin + 23, y + 8.5, { align: 'center' });

  // Score badge on right
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(pageWidth - margin - 36, y + 3.5, 32, 17, 2, 2, 'FD');
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 58, 138); // navy
  doc.text(`${scan.complianceScore}/100`, pageWidth - margin - 20, y + 11, { align: 'center' });
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('COMPLIANCE SCORE', pageWidth - margin - 20, y + 16, { align: 'center' });

  // Verdict Summary text
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  const summaryTitle = isCompliant
    ? 'All Statutory Declarations Satisfied under Legal Metrology Rules'
    : 'Statutory Violations Detected on Packaging Label';
  doc.text(summaryTitle, margin + 46, y + 8.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  const summaryLines = doc.splitTextToSize(
    scan.summaryVerdict || (isCompliant ? 'Passed inspection.' : 'Violations found.'),
    contentWidth - 88
  );
  doc.text(summaryLines.slice(0, 2), margin + 4, y + 16);
  y += 28;

  // --- ALL UPLOADED PRODUCT PHOTOGRAPHS ---
  // The user explicitly requested: "Include ALL uploaded photos of the product in the PDF report, not just the first one."
  const photosToRender: string[] =
    scan.images && scan.images.length > 0 ? scan.images : scan.imageUrl ? [scan.imageUrl] : [];

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(
    `INSPECTED PRODUCT PACKAGING PHOTOS (${photosToRender.length} uploaded view${
      photosToRender.length > 1 ? 's' : ''
    })`,
    margin,
    y
  );
  y += 4;

  // Pre-load all images as raster
  const rasterizedPhotos = await Promise.all(photosToRender.map((src) => loadImageAsRaster(src)));

  const validPhotos = rasterizedPhotos.filter(
    (p): p is { dataUrl: string; width: number; height: number } => p !== null
  );

  if (validPhotos.length > 0) {
    if (validPhotos.length === 1) {
      // Single photo layout
      const photo = validPhotos[0];
      const maxPhotoWidth = 75;
      const maxPhotoHeight = 55;
      let imgW = maxPhotoWidth;
      let imgH = (photo.height / photo.width) * imgW;
      if (imgH > maxPhotoHeight) {
        imgH = maxPhotoHeight;
        imgW = (photo.width / photo.height) * imgH;
      }

      checkPageBreak(imgH + 12);
      const startX = (pageWidth - imgW) / 2;
      doc.setDrawColor(226, 232, 240);
      doc.setFillColor(248, 250, 252);
      doc.rect(startX - 1, y - 1, imgW + 2, imgH + 2, 'FD');
      doc.addImage(photo.dataUrl, 'JPEG', startX, y, imgW, imgH);

      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text('Photograph #1: Submitted Packaging Label', pageWidth / 2, y + imgH + 4, {
        align: 'center',
      });
      y += imgH + 8;
    } else {
      // Multiple photos layout (2 per row side by side)
      const slotWidth = (contentWidth - 6) / 2; // ~88mm
      const maxSlotHeight = 44;

      let col = 0;
      let rowStartY = y;

      for (let i = 0; i < validPhotos.length; i++) {
        const photo = validPhotos[i];
        if (col === 0) {
          checkPageBreak(maxSlotHeight + 10);
          rowStartY = y;
        }

        const slotX = margin + col * (slotWidth + 6);
        let imgW = slotWidth;
        let imgH = (photo.height / photo.width) * imgW;
        if (imgH > maxSlotHeight) {
          imgH = maxSlotHeight;
          imgW = (photo.width / photo.height) * imgH;
        }
        const imgX = slotX + (slotWidth - imgW) / 2;

        doc.setDrawColor(203, 213, 225);
        doc.setFillColor(248, 250, 252);
        doc.rect(slotX, rowStartY, slotWidth, maxSlotHeight, 'FD');
        doc.addImage(photo.dataUrl, 'JPEG', imgX, rowStartY + (maxSlotHeight - imgH) / 2, imgW, imgH);

        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(71, 85, 105);
        doc.text(`Photo #${i + 1}`, slotX + 3, rowStartY + maxSlotHeight - 2);

        if (col === 1 || i === validPhotos.length - 1) {
          y = rowStartY + maxSlotHeight + 6;
          col = 0;
        } else {
          col = 1;
        }
      }
    }
  } else {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 116, 139);
    doc.text('Packaging photograph not available in raster cache.', margin, y + 4);
    y += 8;
  }

  y += 2;

  // --- STATUTORY VIOLATIONS LIST (IF ANY) ---
  const structuredViolations = scan.violationDetails || [];
  const stringViolations = (scan.violations || []).filter((v): v is string => typeof v === 'string');

  if (structuredViolations.length > 0 || stringViolations.length > 0) {
    checkPageBreak(25);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(159, 18, 57); // rose-800
    doc.text('IDENTIFIED STATUTORY VIOLATIONS & REMEDIES', margin, y);
    y += 4;

    // Render structured violations first
    for (let i = 0; i < structuredViolations.length; i++) {
      const v = structuredViolations[i];
      const boxHeight = 18;
      checkPageBreak(boxHeight + 4);

      doc.setFillColor(255, 241, 242); // rose-50
      doc.setDrawColor(254, 205, 211); // rose-200
      doc.rect(margin, y, contentWidth, boxHeight, 'FD');

      // Rule tag
      doc.setFillColor(225, 29, 72);
      doc.roundedRect(margin + 2.5, y + 2.5, 22, 5, 1, 1, 'F');
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text(v.ruleCode || 'Rule 6', margin + 13.5, y + 6, { align: 'center' });

      // Violation text
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(136, 19, 55);
      const violText = doc.splitTextToSize(v.violation, contentWidth - 32);
      doc.text(violText.slice(0, 2), margin + 27, y + 6);

      // Suggestion text
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(71, 85, 105);
      const suggText = doc.splitTextToSize(`Suggestion: ${v.suggestion}`, contentWidth - 6);
      doc.text(suggText.slice(0, 1), margin + 3, y + 14);

      y += boxHeight + 2.5;
    }

    // Fallback string violations if structured was empty
    if (structuredViolations.length === 0) {
      for (const strV of stringViolations) {
        checkPageBreak(10);
        doc.setFillColor(255, 241, 242);
        doc.setDrawColor(254, 205, 211);
        doc.rect(margin, y, contentWidth, 8, 'FD');

        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(159, 18, 57);
        const txt = doc.splitTextToSize(`• ${strV}`, contentWidth - 6);
        doc.text(txt.slice(0, 1), margin + 3, y + 5);
        y += 10;
      }
    }
    y += 3;
  }

  // --- MANDATORY STATUTORY DECLARATIONS TABLE (8 DECLARATIONS) ---
  checkPageBreak(30);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('MANDATORY STATUTORY DECLARATIONS EVALUATION (RULE 6)', margin, y);
  y += 4;

  // Table Column Coordinates:
  // Col 1: Rule & Name (52mm)
  // Col 2: Extracted Value (62mm)
  // Col 3: Packaging Location (40mm)
  // Col 4: Verdict (28mm)
  const colRuleW = 50;
  const colValW = 66;
  const colLocW = 40;
  const colVerdW = 26;

  // Table Header Row
  doc.setFillColor(30, 41, 59); // slate-800
  doc.rect(margin, y, contentWidth, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);

  doc.text('RULE & STATUTORY REQUIREMENT', margin + 3, y + 4.2);
  doc.text('EXTRACTED LABEL VALUE', margin + colRuleW + 3, y + 4.2);
  doc.text('PACKAGING LOCATION', margin + colRuleW + colValW + 3, y + 4.2);
  doc.text('STATUS', margin + colRuleW + colValW + colLocW + 8, y + 4.2);
  y += 6;

  const items = scan.items || [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const rowHeight = 11;
    checkPageBreak(rowHeight + 2);

    // Alternating row background
    if (i % 2 === 0) {
      doc.setFillColor(255, 255, 255);
    } else {
      doc.setFillColor(248, 250, 252);
    }
    doc.setDrawColor(226, 232, 240);
    doc.rect(margin, y, contentWidth, rowHeight, 'FD');

    // Rule code and title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(30, 58, 138); // navy
    doc.text(item.ruleCode || `Rule 6(1)`, margin + 2, y + 4);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(51, 65, 85);
    const titleLines = doc.splitTextToSize(item.title || 'Declaration', colRuleW - 4);
    doc.text(titleLines[0], margin + 2, y + 8);

    // Extracted Value
    doc.setFont('helvetica', item.extractedValue !== 'NOT FOUND' ? 'bold' : 'italic');
    doc.setFontSize(6.5);
    doc.setTextColor(
      item.extractedValue !== 'NOT FOUND' ? 15 : 190,
      item.extractedValue !== 'NOT FOUND' ? 23 : 18,
      item.extractedValue !== 'NOT FOUND' ? 42 : 60
    );
    const valLines = doc.splitTextToSize(item.extractedValue || 'NOT FOUND', colValW - 4);
    doc.text(valLines.slice(0, 2), margin + colRuleW + 2, y + 4.5);

    // Position & Photo
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(71, 85, 105);
    const locText = item.position
      ? `${item.position}${item.photoNumber ? ` (Photo ${item.photoNumber})` : ''}`
      : 'Not located';
    const locLines = doc.splitTextToSize(locText, colLocW - 4);
    doc.text(locLines[0], margin + colRuleW + colValW + 2, y + 5.5);

    // Verdict Badge
    const verdict = item.verdict || (item.isCompliant ? 'PASS' : 'FAIL');
    let vBg = [16, 185, 129]; // green
    if (verdict === 'FAIL') vBg = [225, 29, 72]; // red
    if (verdict === 'WARNING') vBg = [217, 119, 6]; // amber

    doc.setFillColor(vBg[0], vBg[1], vBg[2]);
    const badgeX = margin + colRuleW + colValW + colLocW + 4;
    doc.roundedRect(badgeX, y + 2.5, 18, 5, 1, 1, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(255, 255, 255);
    doc.text(verdict, badgeX + 9, y + 6, { align: 'center' });

    y += rowHeight;
  }

  y += 4;

  // --- IMAGE QUALITY NOTE IF APPLICABLE ---
  if (scan.imageQuality && (scan.imageQuality.isBlurry || scan.imageQuality.noTextFound)) {
    checkPageBreak(12);
    doc.setFillColor(254, 243, 199); // amber-100
    doc.setDrawColor(245, 158, 11);
    doc.rect(margin, y, contentWidth, 9, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(146, 64, 14);
    doc.text('IMAGE LEGIBILITY NOTICE:', margin + 3, y + 4);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(120, 53, 15);
    const qNote = scan.imageQuality.qualityNote || 'Partial blurriness detected.';
    doc.text(qNote, margin + 42, y + 4);
    y += 12;
  }

  // --- FOOTER ON ALL PAGES ---
  // Mandatory requirement: A line at the bottom: "This is a preliminary AI-assisted check, not a legal determination"
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);

    // Subtle divider line
    doc.setDrawColor(203, 213, 225);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

    // Mandatory statutory disclaimer line
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(
      'This is a preliminary AI-assisted check, not a legal determination',
      pageWidth / 2,
      pageHeight - 8,
      { align: 'center' }
    );

    // Page numbers & report ID
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.text(`Report ID: ${scan.id || 'N/A'}`, margin, pageHeight - 4);
    doc.text(`Page ${p} of ${totalPages}`, pageWidth - margin, pageHeight - 4, {
      align: 'right',
    });
  }

  // Trigger download
  const safeFilename = `Legal_Metrology_Report_${scan.id || 'audit'}.pdf`;
  doc.save(safeFilename);
}

/**
 * Generates and triggers download of a spreadsheet-ready CSV file
 * containing all statutory compliance data, extracted declarations, verdicts, and violations.
 */
export function generateComplianceCsv(scan: ProductScan): void {
  const escapeCsv = (str: string | number | undefined | null): string => {
    if (str === null || str === undefined) return '""';
    const val = String(str).replace(/"/g, '""');
    return `"${val}"`;
  };

  const rows: string[] = [];

  // Section 1: Report Metadata
  rows.push(['REPORT SUMMARY', 'LEGAL METROLOGY (PACKAGED COMMODITIES) RULES, 2011'].join(','));
  rows.push(['Report ID', escapeCsv(scan.id)].join(','));
  rows.push(['Date of Scan', escapeCsv(scan.timestamp)].join(','));
  rows.push(['Product Name', escapeCsv(scan.productName)].join(','));
  rows.push(['Brand', escapeCsv(scan.brand || 'Unbranded')].join(','));
  rows.push(['Category', escapeCsv(scan.category || 'General')].join(','));
  rows.push(['Overall Verdict', escapeCsv(scan.complianceVerdict || (scan.overallCompliant ? 'COMPLIANT' : 'NON-COMPLIANT'))].join(','));
  rows.push(['Compliance Score', escapeCsv(`${scan.complianceScore}/100`)].join(','));
  rows.push(['Summary Findings', escapeCsv(scan.summaryVerdict)].join(','));
  rows.push('');

  // Section 2: Mandatory Statutory Declarations
  rows.push(['MANDATORY STATUTORY DECLARATIONS (RULE 6)', '', '', '', '', '', ''].join(','));
  rows.push([
    'Rule Code',
    'Mandatory Statutory Declaration',
    'Extracted Value on Label',
    'Packaging Location',
    'Photo Number',
    'Status Verdict',
    'Inspector Notes / Finding',
    'Remedial Suggestion'
  ].join(','));

  const items = scan.items || [];
  for (const item of items) {
    rows.push([
      escapeCsv(item.ruleCode),
      escapeCsv(item.title),
      escapeCsv(item.extractedValue),
      escapeCsv(item.position || 'N/A'),
      escapeCsv(item.photoNumber ? `Photo ${item.photoNumber}` : 'N/A'),
      escapeCsv(item.verdict || (item.isCompliant ? 'PASS' : 'FAIL')),
      escapeCsv(item.findingNotes),
      escapeCsv(item.suggestion || 'None required')
    ].join(','));
  }
  rows.push('');

  // Section 3: Statutory Violations
  rows.push(['STATUTORY VIOLATIONS & REMEDIES', '', '', ''].join(','));
  rows.push(['Rule Reference', 'Violation Description', 'Severity', 'Statutory Suggestion & Remedy'].join(','));

  const violations = scan.violationDetails || [];
  if (violations.length > 0) {
    for (const v of violations) {
      rows.push([
        escapeCsv(v.ruleCode),
        escapeCsv(v.violation),
        escapeCsv(v.severity || 'high'),
        escapeCsv(v.suggestion)
      ].join(','));
    }
  } else if (scan.violations && scan.violations.length > 0) {
    for (const v of scan.violations) {
      const vText = typeof v === 'string' ? v : v.violation;
      const vCode = typeof v === 'object' && v.ruleCode ? v.ruleCode : 'Rule 6';
      rows.push([escapeCsv(vCode), escapeCsv(vText), 'high', 'N/A'].join(','));
    }
  } else {
    rows.push(['None', 'No statutory violations detected on label', 'N/A', 'N/A'].join(','));
  }
  rows.push('');

  // Section 4: Mandatory Disclaimer Line
  rows.push(['DISCLAIMER', escapeCsv('This is a preliminary AI-assisted check, not a legal determination')].join(','));

  // Prepend UTF-8 BOM so Excel properly opens symbols (₹, etc.)
  const csvContent = '\uFEFF' + rows.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Legal_Metrology_Report_${scan.id || 'audit'}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
