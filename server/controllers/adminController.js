import Complaint from '../models/Complaint.js';
import SystemSetting from '../models/SystemSetting.js';
import { getOverdueThresholdDays, attachOverdueInfo } from '../services/overdueService.js';

// @desc    Get Admin Dashboard Operations Stats
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
export const getDashboardStats = async (req, res) => {
  try {
    const thresholdDays = await getOverdueThresholdDays();

    // Fetch all complaints with resident info
    const complaints = await Complaint.find().populate('resident', 'name email flatNumber');

    // Decorate complaints with dynamic overdue info
    const decoratedComplaints = complaints.map(c => attachOverdueInfo(c.toObject(), thresholdDays));

    const totalComplaints = decoratedComplaints.length;
    const openCount = decoratedComplaints.filter(c => c.status === 'Open').length;
    const inProgressCount = decoratedComplaints.filter(c => c.status === 'In Progress').length;
    const resolvedCount = decoratedComplaints.filter(c => c.status === 'Resolved').length;
    const overdueCount = decoratedComplaints.filter(c => c.isOverdue).length;
    const criticalCount = decoratedComplaints.filter(c => c.healthScore === 'Critical').length;

    // Status breakdown array
    const statusBreakdown = [
      { status: 'Open', count: openCount, percentage: totalComplaints ? Math.round((openCount / totalComplaints) * 100) : 0 },
      { status: 'In Progress', count: inProgressCount, percentage: totalComplaints ? Math.round((inProgressCount / totalComplaints) * 100) : 0 },
      { status: 'Resolved', count: resolvedCount, percentage: totalComplaints ? Math.round((resolvedCount / totalComplaints) * 100) : 0 }
    ];

    // Category breakdown object & array
    const categories = ['Plumbing', 'Electrical', 'Elevator', 'Security', 'Cleaning', 'General Maintenance', 'Other'];
    const categoryBreakdown = categories.map(cat => {
      const count = decoratedComplaints.filter(c => c.category === cat).length;
      return {
        category: cat,
        count,
        percentage: totalComplaints ? Math.round((count / totalComplaints) * 100) : 0
      };
    });

    // Priority breakdown
    const priorityBreakdown = [
      { priority: 'High', count: decoratedComplaints.filter(c => c.priority === 'High').length },
      { priority: 'Medium', count: decoratedComplaints.filter(c => c.priority === 'Medium').length },
      { priority: 'Low', count: decoratedComplaints.filter(c => c.priority === 'Low').length }
    ];

    // Overdue list (sorted by days overdue descending)
    const overdueComplaintsList = decoratedComplaints
      .filter(c => c.isOverdue)
      .sort((a, b) => b.daysOverdue - a.daysOverdue);

    res.json({
      success: true,
      data: {
        summary: {
          totalComplaints,
          openCount,
          inProgressCount,
          activeCount: openCount + inProgressCount,
          resolvedCount,
          overdueCount,
          criticalCount,
          overdueThresholdDays: thresholdDays
        },
        statusBreakdown,
        categoryBreakdown,
        priorityBreakdown,
        overdueComplaintsList
      }
    });
  } catch (error) {
    console.error('[Dashboard Stats Error]:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get System Settings
// @route   GET /api/admin/settings
// @access  Private (Admin)
export const getSystemSettings = async (req, res) => {
  try {
    const thresholdDays = await getOverdueThresholdDays();
    res.json({
      success: true,
      data: {
        overdueThresholdDays: thresholdDays
      }
    });
  } catch (error) {
    console.error('[Get Settings Error]:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update System Settings (e.g. overdueThresholdDays)
// @route   PUT /api/admin/settings
// @access  Private (Admin)
export const updateSystemSettings = async (req, res) => {
  try {
    const { overdueThresholdDays } = req.body;

    if (overdueThresholdDays === undefined || typeof overdueThresholdDays !== 'number' || overdueThresholdDays < 1) {
      return res.status(400).json({ success: false, message: 'Please provide a valid overdueThresholdDays number >= 1' });
    }

    await SystemSetting.findOneAndUpdate(
      { key: 'overdueThresholdDays' },
      { value: overdueThresholdDays, updatedAt: new Date() },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      message: 'System settings updated successfully',
      data: {
        overdueThresholdDays
      }
    });
  } catch (error) {
    console.error('[Update Settings Error]:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
