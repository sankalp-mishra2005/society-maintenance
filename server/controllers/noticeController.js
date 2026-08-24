import Notice from '../models/Notice.js';
import User from '../models/User.js';
import { sendImportantNoticeEmail } from '../services/emailService.js';

// @desc    Get all notices
// @route   GET /api/notices
// @access  Private
export const getNotices = async (req, res) => {
  try {
    // Pinned important notices first, then sorted by createdAt descending
    const notices = await Notice.find()
      .populate('createdBy', 'name role')
      .sort({ isImportant: -1, createdAt: -1 });

    res.json({
      success: true,
      count: notices.length,
      data: notices
    });
  } catch (error) {
    console.error('[Get Notices Error]:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create notice (Admin only)
// @route   POST /api/notices
// @access  Private (Admin)
export const createNotice = async (req, res) => {
  try {
    const { title, content, category, isImportant } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Please provide title and content for the notice' });
    }

    const notice = await Notice.create({
      title,
      content,
      category: category || 'General',
      isImportant: Boolean(isImportant),
      createdBy: req.user._id
    });

    const populatedNotice = await Notice.findById(notice._id).populate('createdBy', 'name role');

    // If marked as important, trigger broadcast email to all residents
    if (Boolean(isImportant)) {
      const residents = await User.find({ role: 'resident' }).select('email');
      const residentEmails = residents.map(r => r.email).filter(Boolean);
      
      sendImportantNoticeEmail({
        residentEmails,
        noticeTitle: notice.title,
        noticeContent: notice.content
      });
    }

    res.status(201).json({
      success: true,
      data: populatedNotice
    });
  } catch (error) {
    console.error('[Create Notice Error]:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete notice (Admin only)
// @route   DELETE /api/notices/:id
// @access  Private (Admin)
export const deleteNotice = async (req, res) => {
  try {
    const { id } = req.params;
    const notice = await Notice.findById(id);

    if (!notice) {
      return res.status(404).json({ success: false, message: 'Notice not found' });
    }

    await notice.deleteOne();

    res.json({
      success: true,
      message: 'Notice deleted successfully'
    });
  } catch (error) {
    console.error('[Delete Notice Error]:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
