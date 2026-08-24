import Complaint from '../models/Complaint.js';
import Counter from '../models/Counter.js';
import { uploadToCloudinary } from '../middleware/uploadMiddleware.js';
import { getOverdueThresholdDays, attachOverdueInfo } from '../services/overdueService.js';
import { sendStatusUpdateEmail } from '../services/emailService.js';

// @desc    Create new complaint
// @route   POST /api/complaints
// @access  Private (Resident)
export const createComplaint = async (req, res) => {
  try {
    const { title, category, description, priority } = req.body;

    if (!title || !category || !description) {
      return res.status(400).json({ success: false, message: 'Please provide title, category, and description' });
    }

    // Generate human-readable complaintNumber (e.g. CMP-2026-0001)
    const currentYear = new Date().getFullYear();
    const counter = await Counter.findOneAndUpdate(
      { name: 'complaintNumber' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    const seqStr = String(counter.seq).padStart(4, '0');
    const complaintNumber = `CMP-${currentYear}-${seqStr}`;

    // Photo Upload handling via Cloudinary
    let photoUrl = null;
    let photoPublicId = null;

    if (req.file) {
      try {
        const uploadResult = await uploadToCloudinary(req.file.buffer);
        photoUrl = uploadResult.url;
        photoPublicId = uploadResult.publicId;
      } catch (uploadErr) {
        return res.status(400).json({
          success: false,
          message: uploadErr.message || 'Photo upload to Cloudinary failed.'
        });
      }
    }

    // Create initial statusHistory log item
    const initialHistory = [{
      status: 'Open',
      changedBy: req.user._id,
      changedByName: req.user.name,
      changedByRole: req.user.role,
      note: 'Complaint raised by resident',
      timestamp: new Date()
    }];

    const complaint = await Complaint.create({
      complaintNumber,
      title,
      category,
      description,
      priority: priority || 'Medium',
      photoUrl,
      photoPublicId,
      resident: req.user._id,
      status: 'Open',
      statusHistory: initialHistory
    });

    const populatedComplaint = await Complaint.findById(complaint._id).populate('resident', 'name email flatNumber phoneNumber');
    const thresholdDays = await getOverdueThresholdDays();
    const result = attachOverdueInfo(populatedComplaint.toObject(), thresholdDays);

    res.status(201).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('[Create Complaint Error]:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update an existing complaint
// @route   PUT /api/complaints/:id
// @access  Private (Resident)
export const updateComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, category, description, priority } = req.body;

    const complaint = await Complaint.findById(id);

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    // Security: Only the resident who created it can edit it
    if (complaint.resident.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this complaint' });
    }

    // Business Logic: Can only edit if status is Open
    if (complaint.status !== 'Open') {
      return res.status(400).json({ 
        success: false, 
        message: 'Complaint can only be edited while its status is Open. Once work has begun, it cannot be modified.' 
      });
    }

    // Update fields
    if (title) complaint.title = title;
    if (category) complaint.category = category;
    if (description) complaint.description = description;
    if (priority) complaint.priority = priority;

    // Optional photo update
    if (req.file) {
      try {
        const uploadResult = await uploadToCloudinary(req.file.buffer);
        complaint.photoUrl = uploadResult.url;
        complaint.photoPublicId = uploadResult.publicId;
      } catch (uploadErr) {
        return res.status(400).json({
          success: false,
          message: uploadErr.message || 'Photo upload to Cloudinary failed.'
        });
      }
    }

    complaint.updatedAt = new Date();
    await complaint.save();

    const populatedComplaint = await Complaint.findById(complaint._id).populate('resident', 'name email flatNumber phoneNumber');
    const thresholdDays = await getOverdueThresholdDays();
    const result = attachOverdueInfo(populatedComplaint.toObject(), thresholdDays);

    res.json({
      success: true,
      message: 'Complaint updated successfully',
      data: result
    });
  } catch (error) {
    console.error('[Update Complaint Error]:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a complaint
// @route   DELETE /api/complaints/:id
// @access  Private (Resident/Admin)
export const deleteComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const complaint = await Complaint.findById(id);

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    // Role-based authorization
    if (req.user.role === 'resident') {
      // Resident can only delete their own complaint
      if (complaint.resident.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized to delete this complaint' });
      }
      // Resident can only delete if status is Open
      if (complaint.status !== 'Open') {
        return res.status(400).json({ 
          success: false, 
          message: 'You can only delete complaints that are still Open. Contact the admin for further action.' 
        });
      }
    } else if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await Complaint.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Complaint deleted successfully'
    });
  } catch (error) {
    console.error('[Delete Complaint Error]:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all complaints (filtered by role, status, category, priority, overdue, date range, search)
// @route   GET /api/complaints
// @access  Private
export const getComplaints = async (req, res) => {
  try {
    const { status, category, priority, overdue, search, from, to } = req.query;
    const thresholdDays = await getOverdueThresholdDays();

    // Query filter builder
    const query = {};

    // Resident role filter: residents only see their own complaints
    if (req.user.role === 'resident') {
      query.resident = req.user._id;
    }

    // Status filter
    if (status && status !== 'All' && status !== 'Overdue') {
      query.status = status;
    }

    // Category filter
    if (category && category !== 'All') {
      query.category = category;
    }

    // Priority filter
    if (priority && priority !== 'All') {
      query.priority = priority;
    }

    // Date range filtering (?from=YYYY-MM-DD&to=YYYY-MM-DD)
    if (from || to) {
      query.createdAt = {};
      if (from) {
        const fromDate = new Date(from);
        fromDate.setHours(0, 0, 0, 0);
        query.createdAt.$gte = fromDate;
      }
      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        query.createdAt.$lte = toDate;
      }
    }

    // Text Search filter (complaintNumber, title, description)
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { complaintNumber: searchRegex },
        { title: searchRegex },
        { description: searchRegex }
      ];
    }

    let complaints = await Complaint.find(query)
      .populate('resident', 'name email flatNumber phoneNumber')
      .sort({ createdAt: -1 });

    // Attach dynamic overdue info to each complaint
    let decoratedComplaints = complaints.map(c => attachOverdueInfo(c.toObject(), thresholdDays));

    // Overdue filter tab logic
    if (status === 'Overdue' || overdue === 'true') {
      decoratedComplaints = decoratedComplaints.filter(c => c.isOverdue);
    }

    // Admin sorting optimization: overdue items first, then newest
    if (req.user.role === 'admin') {
      decoratedComplaints.sort((a, b) => {
        if (a.isOverdue && !b.isOverdue) return -1;
        if (!a.isOverdue && b.isOverdue) return 1;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
    }

    res.json({
      success: true,
      count: decoratedComplaints.length,
      data: decoratedComplaints
    });
  } catch (error) {
    console.error('[Get Complaints Error]:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single complaint by ID or complaintNumber
// @route   GET /api/complaints/:id
// @access  Private
export const getComplaintById = async (req, res) => {
  try {
    const { id } = req.params;
    let complaint;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      complaint = await Complaint.findById(id).populate('resident', 'name email flatNumber phoneNumber');
    } else {
      complaint = await Complaint.findOne({ complaintNumber: id }).populate('resident', 'name email flatNumber phoneNumber');
    }

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    // Security check: residents can only view their own complaints
    if (req.user.role === 'resident' && complaint.resident._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this complaint' });
    }

    const thresholdDays = await getOverdueThresholdDays();
    const decoratedComplaint = attachOverdueInfo(complaint.toObject(), thresholdDays);

    res.json({
      success: true,
      data: decoratedComplaint
    });
  } catch (error) {
    console.error('[Get Complaint By ID Error]:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update complaint status (Admin only)
// @route   PATCH /api/complaints/:id/status
// @access  Private (Admin)
export const updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    if (!['Open', 'In Progress', 'Resolved'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value. Must be Open, In Progress, or Resolved' });
    }

    const complaint = await Complaint.findById(id).populate('resident', 'name email flatNumber');
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    // IMPERATIVE REQUIREMENT: Resolved complaints are permanently closed
    if (complaint.status === 'Resolved') {
      return res.status(400).json({
        success: false,
        message: 'This complaint is marked as Resolved and permanently closed. Its status cannot be changed.'
      });
    }

    const oldStatus = complaint.status;
    complaint.status = status;
    complaint.updatedAt = new Date();

    if (status === 'Resolved') {
      complaint.resolvedAt = new Date();
    }

    // Append complete status history item
    complaint.statusHistory.push({
      status,
      changedBy: req.user._id,
      changedByName: req.user.name,
      changedByRole: req.user.role,
      note: note || '',
      timestamp: new Date()
    });

    await complaint.save();

    // Trigger email notification to resident
    if (complaint.resident && complaint.resident.email) {
      sendStatusUpdateEmail({
        residentEmail: complaint.resident.email,
        residentName: complaint.resident.name,
        complaintNumber: complaint.complaintNumber,
        title: complaint.title,
        oldStatus,
        newStatus: status,
        note: note || ''
      });
    }

    const thresholdDays = await getOverdueThresholdDays();
    const decoratedComplaint = attachOverdueInfo(complaint.toObject(), thresholdDays);

    res.json({
      success: true,
      message: `Complaint status updated to ${status}`,
      data: decoratedComplaint
    });
  } catch (error) {
    console.error('[Update Status Error]:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update complaint priority (Admin only)
// @route   PATCH /api/complaints/:id/priority
// @access  Private (Admin)
export const updateComplaintPriority = async (req, res) => {
  try {
    const { id } = req.params;
    const { priority } = req.body;

    if (!['Low', 'Medium', 'High'].includes(priority)) {
      return res.status(400).json({ success: false, message: 'Invalid priority value. Must be Low, Medium, or High' });
    }

    const complaint = await Complaint.findById(id).populate('resident', 'name email flatNumber');
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    // IMPERATIVE REQUIREMENT: Resolved complaints are permanently closed
    if (complaint.status === 'Resolved') {
      return res.status(400).json({
        success: false,
        message: 'This complaint is marked as Resolved and permanently closed. Its priority cannot be changed.'
      });
    }

    complaint.priority = priority;
    complaint.updatedAt = new Date();
    await complaint.save();

    const thresholdDays = await getOverdueThresholdDays();
    const decoratedComplaint = attachOverdueInfo(complaint.toObject(), thresholdDays);

    res.json({
      success: true,
      message: `Complaint priority set to ${priority}`,
      data: decoratedComplaint
    });
  } catch (error) {
    console.error('[Update Priority Error]:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
