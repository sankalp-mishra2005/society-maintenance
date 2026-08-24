import Complaint from '../models/Complaint.js';
import { getOverdueThresholdDays } from '../services/overdueService.js';
import { computeIntelligence } from '../services/issueIntelligenceService.js';

// @desc    Get Operations Intelligence Dashboard Data
// @route   GET /api/admin/intelligence
// @access  Private (Admin)
export const getIntelligenceData = async (req, res) => {
  try {
    const thresholdDays = await getOverdueThresholdDays();
    const complaints = await Complaint.find()
      .populate('resident', 'name email flatNumber')
      .exec();

    // Convert Mongoose documents to plain objects for the service
    const plainComplaints = complaints.map(doc => doc.toObject());

    // Delegate all computation to the isolated service
    const intelligence = computeIntelligence(plainComplaints, thresholdDays);

    res.json({
      success: true,
      data: intelligence
    });
  } catch (error) {
    console.error('[Intelligence Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
