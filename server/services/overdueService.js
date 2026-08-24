import SystemSetting from '../models/SystemSetting.js';

/**
 * Get current configured overdue threshold days
 */
export const getOverdueThresholdDays = async () => {
  try {
    const setting = await SystemSetting.findOne({ key: 'overdueThresholdDays' });
    if (setting && typeof setting.value === 'number') {
      return setting.value;
    }
  } catch (error) {
    console.error('[OverdueService Error]:', error.message);
  }
  return 3; // Default threshold of 3 days
};

export const attachOverdueInfo = (complaintObj, thresholdDays) => {
  const DAY_MS = 1000 * 60 * 60 * 24;
  const createdAtTime = new Date(complaintObj.createdAt).getTime();
  const now = Date.now();
  
  const daysOpen = Math.floor((now - createdAtTime) / DAY_MS);
  const isOverdue = (complaintObj.status !== 'Resolved') && (daysOpen > thresholdDays);
  const daysOverdue = isOverdue ? (daysOpen - thresholdDays) : 0;

  let healthScore = 'Healthy';
  if (complaintObj.status !== 'Resolved') {
    let riskScore = 0;
    if (complaintObj.priority === 'High') riskScore += 30;
    if (complaintObj.priority === 'Medium') riskScore += 10;
    
    if (isOverdue) {
      riskScore += 20 + (daysOverdue * 5);
    }
    
    if (riskScore >= 40) healthScore = 'Critical';
    else if (riskScore >= 20) healthScore = 'Warning';
  }

  return {
    ...complaintObj,
    daysOpen,
    isOverdue,
    daysOverdue,
    overdueThresholdDays: thresholdDays,
    healthScore
  };
};
