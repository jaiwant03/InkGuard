/**
 * Visual Brand Consistency Engine
 * Analyzes image assets against workspace brand profiles, color palettes,
 * approved brand assets, and accessibility metadata (alt text).
 */

/**
 * Calculates color distance (simple Euclidean in RGB space) between two Hex colors.
 */
function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16);
    const g = parseInt(clean[1] + clean[1], 16);
    const b = parseInt(clean[2] + clean[2], 16);
    return { r, g, b };
  }
  const r = parseInt(clean.substring(0, 2), 16) || 0;
  const g = parseInt(clean.substring(2, 4), 16) || 0;
  const b = parseInt(clean.substring(4, 6), 16) || 0;
  return { r, g, b };
}

function colorDistance(hex1, hex2) {
  const c1 = hexToRgb(hex1);
  const c2 = hexToRgb(hex2);
  return Math.sqrt(Math.pow(c1.r - c2.r, 2) + Math.pow(c1.g - c2.g, 2) + Math.pow(c1.b - c2.b, 2));
}

/**
 * Checks image assets for brand palette conformity, alt text accessibility, and asset usage rules.
 * @param {Object} params
 * @param {string} params.imageUrl - URL of uploaded or referenced image
 * @param {string} params.altText - Provided alternative text for the image
 * @param {string[]} params.detectedColors - Hex color codes detected or sampled from asset
 * @param {Object} params.brandProfile - Workspace BrandProfile document
 * @param {Object[]} params.brandAssets - Workspace BrandAsset list
 * @param {string} [params.assetId] - Optional selected reference BrandAsset ID
 */
export function checkVisualConsistency({
  imageUrl,
  altText = '',
  detectedColors = [],
  brandProfile = null,
  brandAssets = [],
  assetId = null,
}) {
  const findings = [];
  const palette = brandProfile?.brandColors || [];
  const configuredHexes = palette.map((c) => (c.hex || '').toLowerCase().trim()).filter(Boolean);

  // 1. Accessibility Check: Alt Text presence and descriptive quality
  const trimmedAlt = (altText || '').trim();
  if (!trimmedAlt) {
    findings.push({
      category: 'Accessibility',
      severity: 'Medium',
      textSpan: 'Missing image alt text',
      startIndex: -1,
      endIndex: -1,
      explanation: 'Visual asset lacks descriptive alternative text (alt text). Screen readers cannot interpret the visual content, violating WCAG 2.1 Level AA requirements.',
      suggestedCorrection: 'Add descriptive alt text summarizing the image subject, purpose, and key text.',
      claimStatus: 'Needs verification',
      detectedBy: 'deterministic',
      confidenceScore: 100,
      status: 'open',
    });
  } else if (/^(image|photo|picture|logo|graphic|icon|banner|asset|untitled)$/i.test(trimmedAlt)) {
    findings.push({
      category: 'Accessibility',
      severity: 'Low',
      textSpan: trimmedAlt,
      startIndex: -1,
      endIndex: -1,
      explanation: `Generic alt text "${trimmedAlt}" provides poor context for assistive technologies. Alt text should describe the specific content or message depicted.`,
      suggestedCorrection: 'Replace with descriptive context (e.g., "INKGUARD dashboard displaying 94% brand compliance score").',
      claimStatus: 'Potentially inconsistent',
      detectedBy: 'deterministic',
      confidenceScore: 90,
      status: 'open',
    });
  }

  // 2. Color Palette Alignment Check
  if (configuredHexes.length > 0 && Array.isArray(detectedColors) && detectedColors.length > 0) {
    const unalignedColors = [];

    detectedColors.forEach((colorHex) => {
      const cleanHex = (colorHex || '').trim().toLowerCase();
      if (!cleanHex.startsWith('#')) return;

      // Find closest configured brand color
      let minDistance = Infinity;
      let closestColor = null;

      configuredHexes.forEach((brandHex) => {
        const dist = colorDistance(cleanHex, brandHex);
        if (dist < minDistance) {
          minDistance = dist;
          closestColor = brandHex;
        }
      });

      // If distance > 45, flag as non-palette deviation
      if (minDistance > 45) {
        unalignedColors.push({ color: cleanHex, closest: closestColor, distance: Math.round(minDistance) });
      }
    });

    if (unalignedColors.length > 0) {
      const colorList = unalignedColors.map((u) => u.color).join(', ');
      findings.push({
        category: 'Visual identity',
        severity: 'Medium',
        textSpan: colorList,
        startIndex: -1,
        endIndex: -1,
        explanation: `Asset uses colors (${colorList}) that deviate significantly from configured brand palette (${configuredHexes.join(', ')}).`,
        suggestedCorrection: `Align visual elements with approved primary brand colors: ${configuredHexes.slice(0, 3).join(', ')}.`,
        claimStatus: 'Potentially inconsistent',
        detectedBy: 'deterministic',
        confidenceScore: 88,
        status: 'open',
      });
    }
  }

  // 3. Asset Usage Rules Check
  let matchedAsset = null;
  if (assetId) {
    matchedAsset = brandAssets.find((a) => a._id?.toString() === assetId.toString());
  } else if (imageUrl) {
    matchedAsset = brandAssets.find((a) => a.fileUrl === imageUrl || a.fileName && imageUrl.includes(a.fileName));
  }

  if (matchedAsset) {
    if (matchedAsset.approvalStatus !== 'Approved') {
      findings.push({
        category: 'Visual identity',
        severity: 'High',
        textSpan: matchedAsset.name,
        startIndex: -1,
        endIndex: -1,
        explanation: `Referenced asset "${matchedAsset.name}" has approval status "${matchedAsset.approvalStatus}". Only approved brand assets may be published.`,
        suggestedCorrection: 'Obtain formal brand manager approval in the Brand Asset library or select an approved asset.',
        claimStatus: 'Potentially inconsistent',
        detectedBy: 'deterministic',
        confidenceScore: 100,
        status: 'open',
      });
    }

    if (matchedAsset.usageNotes) {
      findings.push({
        category: 'Visual identity',
        severity: 'Low',
        textSpan: matchedAsset.name,
        startIndex: -1,
        endIndex: -1,
        explanation: `Asset usage requirement: "${matchedAsset.usageNotes}". Ensure minimum clearance and approved surfaces are respected.`,
        suggestedCorrection: 'Follow designated asset clearance specifications.',
        claimStatus: 'Supported by an approved source',
        detectedBy: 'deterministic',
        confidenceScore: 100,
        status: 'open',
      });
    }
  }

  // Mandatory system disclosure note adhering to problem statement constraints
  const disclosure = {
    method: 'Automated metadata, palette proximity, and asset registry check.',
    disclaimer: 'Notice: Automated visual check verifies color palette adherence, asset library approval status, and accessibility metadata. Raster logo geometry recognition, optical font classification, and layout bounding-box analysis are not performed.',
    verifiedAsset: matchedAsset ? { name: matchedAsset.name, status: matchedAsset.approvalStatus } : null,
  };

  return {
    findings,
    disclosure,
    isCompliant: findings.filter((f) => f.severity === 'High').length === 0,
  };
}
