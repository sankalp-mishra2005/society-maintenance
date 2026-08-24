import Complaint from '../models/Complaint.js';
import Notice from '../models/Notice.js';
import User from '../models/User.js';
import SystemSetting from '../models/SystemSetting.js';

// @desc    Get dashboard summary statistics
// @route   GET /api/dashboard/stats
// @access  Private
export const getDashboardStats = async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const matchResident = isAdmin ? {} : { resident: req.user._id };

    // Fetch complaints stats
    const totalComplaints = await Complaint.countDocuments(matchResident);
    const openComplaints = await Complaint.countDocuments({ ...matchResident, status: 'Open' });
    const inProgressComplaints = await Complaint.countDocuments({ ...matchResident, status: 'In Progress' });
    const resolvedComplaints = await Complaint.countDocuments({ ...matchResident, status: 'Resolved' });
    
    // Calculate Overdue
    const thresholdSetting = await SystemSetting.findOne({ key: 'overdueThresholdDays' });
    const overdueThresholdDays = thresholdSetting ? Number(thresholdSetting.value) : 3;
    const activeComplaints = await Complaint.find({ ...matchResident, status: { $ne: 'Resolved' } });
    let overdueCount = 0;
    activeComplaints.forEach(c => {
      if (c.calculateOverdueInfo(overdueThresholdDays).isOverdue) {
        overdueCount++;
      }
    });

    // Fetch notices stats (Notices are global)
    const activeNoticesCount = await Notice.countDocuments({});
    const importantNoticesCount = await Notice.countDocuments({ isImportant: true });

    // Fetch users (Admin only metric, but safe to return 0 for residents)
    const totalResidents = isAdmin ? await User.countDocuments({ role: 'resident' }) : 0;

    res.json({
      success: true,
      data: {
        complaints: {
          total: totalComplaints,
          open: openComplaints,
          inProgress: inProgressComplaints,
          resolved: resolvedComplaints,
          overdue: overdueCount
        },
        notices: {
          active: activeNoticesCount,
          important: importantNoticesCount
        },
        residents: {
          total: totalResidents
        },
        // Mock financial data for the UI
        finances: {
          collected: isAdmin ? 450000 : undefined,
          pending: isAdmin ? 25000 : undefined,
          myDues: !isAdmin ? 0 : undefined
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error while fetching dashboard stats' });
  }
};
