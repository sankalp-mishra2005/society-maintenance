/**
 * Issue Intelligence Service
 * 
 * Isolated, rule-based computation module for analyzing complaint data.
 * All calculations are transparent arithmetic — no ML, no AI, no black boxes.
 * 
 * Inputs:  Array of complaint documents + overdue threshold in days
 * Outputs: { sla, hotspots, recurringIssues }
 * 
 * This module has ZERO side effects — it does not read from the database,
 * does not write to the database, and does not call any external services.
 * It can be removed without affecting any other part of the application.
 */

const DAY_MS = 1000 * 60 * 60 * 24;

/**
 * Extract a block label from a flat number string.
 * Supports formats like "A-101", "B 201", "Tower C-30".
 * @param {string} flatNumber
 * @returns {string} Block label (e.g., "Block A") or "General"
 */
export const extractBlock = (flatNumber) => {
  if (!flatNumber) return 'Unknown';
  const match = flatNumber.match(/^([a-zA-Z]+)/);
  if (match) return `Block ${match[1].toUpperCase()}`;
  return 'General';
};

/**
 * Compute all intelligence metrics from raw complaint data.
 * 
 * @param {Array} complaints - Array of plain complaint objects (with populated resident.flatNumber)
 * @param {number} thresholdDays - SLA overdue threshold in days
 * @returns {{ sla: Object, hotspots: Object, recurringIssues: Array }}
 */
export const computeIntelligence = (complaints, thresholdDays) => {
  const CATEGORIES = ['Plumbing', 'Electrical', 'Elevator', 'Security', 'Cleaning', 'General Maintenance', 'Other'];
  const now = Date.now();
  const thirtyDaysAgo = now - 30 * DAY_MS;
  const sixtyDaysAgo = now - 60 * DAY_MS;

  // Accumulators
  let totalResolvedTimeMs = 0;
  let resolvedCount = 0;
  let overdueCountAllTime = 0;

  const categorySla = {};
  CATEGORIES.forEach(cat => {
    categorySla[cat] = { resolvedCount: 0, totalTimeMs: 0 };
  });

  const recentComplaints = [];
  const olderComplaints = [];
  const activeHotspots = {};

  // Single pass over all complaints
  complaints.forEach(c => {
    const createdTime = new Date(c.createdAt).getTime();

    // --- SLA: resolution time tracking ---
    if (c.status === 'Resolved' && c.resolvedAt) {
      resolvedCount++;
      const resolveTime = new Date(c.resolvedAt).getTime() - createdTime;
      totalResolvedTimeMs += resolveTime;

      if (categorySla[c.category]) {
        categorySla[c.category].resolvedCount++;
        categorySla[c.category].totalTimeMs += resolveTime;
      }
    }

    // --- Overdue detection (ever exceeded threshold) ---
    const timeToResolveOrNow = (c.status === 'Resolved' && c.resolvedAt)
      ? new Date(c.resolvedAt).getTime() - createdTime
      : now - createdTime;
    if (timeToResolveOrNow > thresholdDays * DAY_MS) {
      overdueCountAllTime++;
    }

    // --- Hotspots: active (non-resolved) issues by block × category ---
    if (c.status !== 'Resolved') {
      const block = extractBlock(c.resident?.flatNumber);
      if (!activeHotspots[block]) activeHotspots[block] = {};
      activeHotspots[block][c.category] = (activeHotspots[block][c.category] || 0) + 1;
    }

    // --- Recurring issues: bucket into 30-day windows ---
    if (createdTime > thirtyDaysAgo) {
      recentComplaints.push(c);
    } else if (createdTime > sixtyDaysAgo) {
      olderComplaints.push(c);
    }
  });

  // === SLA Calculations ===
  const avgResolutionDays = resolvedCount
    ? (totalResolvedTimeMs / resolvedCount / DAY_MS).toFixed(1)
    : 0;
  const resolutionRate = complaints.length
    ? Math.round((resolvedCount / complaints.length) * 100)
    : 0;
  const overdueRate = complaints.length
    ? Math.round((overdueCountAllTime / complaints.length) * 100)
    : 0;

  // High Priority SLA: % of high-priority complaints resolved within threshold
  const highPriorityComplaints = complaints.filter(c => c.priority === 'High');
  let hpMetSla = 0;
  highPriorityComplaints.forEach(c => {
    const resolveTime = (c.status === 'Resolved' && c.resolvedAt)
      ? new Date(c.resolvedAt).getTime() - new Date(c.createdAt).getTime()
      : now - new Date(c.createdAt).getTime();
    if (resolveTime <= thresholdDays * DAY_MS && c.status === 'Resolved') {
      hpMetSla++;
    }
  });
  const highPrioritySlaRate = highPriorityComplaints.length
    ? Math.round((hpMetSla / highPriorityComplaints.length) * 100)
    : 100;

  // Per-category avg resolution breakdown
  const categorySlaBreakdown = Object.keys(categorySla)
    .map(cat => ({
      category: cat,
      avgResolutionDays: categorySla[cat].resolvedCount
        ? (categorySla[cat].totalTimeMs / categorySla[cat].resolvedCount / DAY_MS).toFixed(1)
        : 0
    }))
    .filter(c => c.avgResolutionDays > 0)
    .sort((a, b) => b.avgResolutionDays - a.avgResolutionDays);

  const sla = {
    avgResolutionDays,
    resolutionRate,
    overdueRate,
    highPrioritySlaRate,
    categorySlaBreakdown
  };

  // === Hotspot Matrix ===
  const hotspots = {
    blocks: Object.keys(activeHotspots),
    categories: CATEGORIES,
    data: activeHotspots
  };

  // === Recurring Issue Detection ===
  const groupComplaints = (list) => {
    const counts = {};
    list.forEach(c => {
      const block = extractBlock(c.resident?.flatNumber);
      const key = `${block}::${c.category}`;
      counts[key] = (counts[key] || 0) + 1;
    });
    return counts;
  };

  const recentCounts = groupComplaints(recentComplaints);
  const olderCounts = groupComplaints(olderComplaints);

  const recurringIssues = [];
  Object.keys(recentCounts).forEach(key => {
    const count = recentCounts[key];
    const prevCount = olderCounts[key] || 0;

    // Rule: ≥2 complaints in a block for a single category in 30 days
    if (count >= 2) {
      let percentIncrease = 100;
      if (prevCount > 0) {
        percentIncrease = Math.round(((count - prevCount) / prevCount) * 100);
      }

      // Trigger if ≥3 total, or if count is 2 but growing >50%
      if (count >= 3 || percentIncrease > 50) {
        const [block, category] = key.split('::');
        recurringIssues.push({
          block,
          category,
          count,
          percentIncrease: prevCount === 0 ? 'New Spike' : `+${percentIncrease}%`,
          priority: count >= 5 ? 'High' : 'Medium',
          recommendation: `Inspect ${block} infrastructure for ${category}`
        });
      }
    }
  });

  recurringIssues.sort((a, b) => b.count - a.count);

  return {
    sla,
    hotspots,
    recurringIssues: recurringIssues.slice(0, 5) // Top 5
  };
};
