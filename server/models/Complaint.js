import mongoose from 'mongoose';

const statusHistorySchema = new mongoose.Schema({
  status: { 
    type: String, 
    enum: ['Open', 'In Progress', 'Resolved'], 
    required: true 
  },
  changedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  changedByName: { type: String, required: true },
  changedByRole: { type: String, enum: ['resident', 'admin'], required: true },
  note: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now }
}, { _id: false });

const complaintSchema = new mongoose.Schema({
  complaintNumber: { type: String, unique: true, required: true },
  title: { type: String, required: true, trim: true },
  category: { 
    type: String, 
    required: true, 
    enum: ['Plumbing', 'Electrical', 'Elevator', 'Security', 'Cleaning', 'General Maintenance', 'Other'] 
  },
  description: { type: String, required: true },
  photoUrl: { type: String, default: null },
  photoPublicId: { type: String, default: null },
  status: { 
    type: String, 
    enum: ['Open', 'In Progress', 'Resolved'], 
    default: 'Open' 
  },
  priority: { 
    type: String, 
    enum: ['Low', 'Medium', 'High'], 
    default: 'Medium' 
  },
  resident: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  statusHistory: [statusHistorySchema],
  resolvedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Calculate dynamic overdue metrics
complaintSchema.methods.calculateOverdueInfo = function(overdueThresholdDays = 3) {
  const DAY_MS = 1000 * 60 * 60 * 24;
  const daysOpen = Math.floor((Date.now() - new Date(this.createdAt).getTime()) / DAY_MS);
  const isOverdue = (this.status !== 'Resolved') && (daysOpen > overdueThresholdDays);
  const daysOverdue = isOverdue ? (daysOpen - overdueThresholdDays) : 0;
  return { daysOpen, isOverdue, daysOverdue };
};

// Calculate Complaint Health Score
complaintSchema.methods.calculateHealthScore = function(overdueThresholdDays = 3) {
  if (this.status === 'Resolved') return 'Healthy';
  
  let riskScore = 0;
  
  // Base priority score
  if (this.priority === 'High') riskScore += 30;
  if (this.priority === 'Medium') riskScore += 10;
  
  // Overdue score
  const { isOverdue, daysOverdue } = this.calculateOverdueInfo(overdueThresholdDays);
  if (isOverdue) {
    riskScore += 20 + (daysOverdue * 5); // Add 5 points per overdue day
  }
  
  if (riskScore >= 40) return 'Critical';
  if (riskScore >= 20) return 'Warning';
  return 'Healthy';
};

const Complaint = mongoose.model('Complaint', complaintSchema);
export default Complaint;
