import mongoose from 'mongoose';
import Complaint from './models/Complaint.js';

const run = async () => {
  await mongoose.connect('mongodb://127.0.0.1:27017/society_maintenance');
  const c = await Complaint.find({ photoUrl: { $ne: null } }).sort({ createdAt: -1 }).limit(3);
  console.log(JSON.stringify(c, null, 2));
  await mongoose.disconnect();
};
run();
