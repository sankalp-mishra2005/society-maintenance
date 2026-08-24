import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Complaint from '../models/Complaint.js';
import Notice from '../models/Notice.js';
import Counter from '../models/Counter.js';
import SystemSetting from '../models/SystemSetting.js';

dotenv.config();

const seed = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    await mongoose.connect(mongoUri);
    console.log('[Seed]: Connected to MongoDB...');

    // Clear existing data
    await User.deleteMany({});
    await Complaint.deleteMany({});
    await Notice.deleteMany({});
    await Counter.deleteMany({});
    await SystemSetting.deleteMany({});
    console.log('[Seed]: Cleared old data.');

    // 1. Create System Setting
    await SystemSetting.create({
      key: 'overdueThresholdDays',
      value: 3
    });
    console.log('[Seed]: Created system setting overdueThresholdDays = 3');

    // 2. Create Users
    const admin = await User.create({
      name: 'Society Administrator',
      email: 'admin@society.com',
      password: 'admin123',
      role: 'admin',
      phoneNumber: '+1 555-0199'
    });

    const resident1 = await User.create({
      name: 'John Doe',
      email: 'resident1@society.com',
      password: 'resident123',
      role: 'resident',
      flatNumber: 'A-101',
      phoneNumber: '+1 555-0101'
    });

    const resident2 = await User.create({
      name: 'Sarah Connor',
      email: 'resident2@society.com',
      password: 'resident123',
      role: 'resident',
      flatNumber: 'B-402',
      phoneNumber: '+1 555-0102'
    });

    const resident3 = await User.create({
      name: 'Michael Scott',
      email: 'michael@society.com',
      password: 'resident123',
      role: 'resident',
      flatNumber: 'A-201',
      phoneNumber: '+1 555-0201'
    });

    const resident4 = await User.create({
      name: 'Dwight Schrute',
      email: 'dwight@society.com',
      password: 'resident123',
      role: 'resident',
      flatNumber: 'B-304',
      phoneNumber: '+1 555-0304'
    });

    const resident5 = await User.create({
      name: 'Jim Halpert',
      email: 'jim@society.com',
      password: 'resident123',
      role: 'resident',
      flatNumber: 'C-102',
      phoneNumber: '+1 555-0102'
    });

    const resident6 = await User.create({
      name: 'Pam Beesly',
      email: 'pam@society.com',
      password: 'resident123',
      role: 'resident',
      flatNumber: 'C-103',
      phoneNumber: '+1 555-0103'
    });

    console.log('[Seed]: Created Admin and Resident users.');

    // 3. Setup Counter
    await Counter.create({ name: 'complaintNumber', seq: 5 });

    // Dates calculation helper
    const now = Date.now();
    const DAY = 1000 * 60 * 60 * 24;

    // 4. Create Complaints
    // Complaint 1: OVERDUE Open complaint (created 6 days ago)
    const date1 = new Date(now - 6 * DAY);
    const complaint1 = await Complaint.create({
      complaintNumber: 'CMP-2026-0001',
      title: 'Water Leakage in Main Supply Pipeline',
      category: 'Plumbing',
      description: 'Significant water seepage near the basement parking pillar B4. Needs urgent pipe repair.',
      priority: 'High',
      status: 'Open',
      photoUrl: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=800&q=80',
      resident: resident1._id,
      createdAt: date1,
      updatedAt: date1,
      statusHistory: [
        {
          status: 'Open',
          changedBy: resident1._id,
          changedByName: resident1.name,
          changedByRole: 'resident',
          note: 'Complaint raised by resident. Water dripping continuously.',
          timestamp: date1
        }
      ]
    });

    // Complaint 2: In Progress complaint (created 4 days ago) with multi-step history
    const date2_created = new Date(now - 4 * DAY);
    const date2_updated = new Date(now - 2 * DAY);
    const complaint2 = await Complaint.create({
      complaintNumber: 'CMP-2026-0002',
      title: 'Block B Elevator Noise and Shaking',
      category: 'Elevator',
      description: 'Elevator #2 in Block B makes loud grinding sounds between 3rd and 5th floors.',
      priority: 'High',
      status: 'In Progress',
      photoUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
      resident: resident2._id,
      createdAt: date2_created,
      updatedAt: date2_updated,
      statusHistory: [
        {
          status: 'Open',
          changedBy: resident2._id,
          changedByName: resident2.name,
          changedByRole: 'resident',
          note: 'Complaint submitted by resident',
          timestamp: date2_created
        },
        {
          status: 'In Progress',
          changedBy: admin._id,
          changedByName: admin.name,
          changedByRole: 'admin',
          note: 'Elevator technician dispatch scheduled for Thursday morning.',
          timestamp: date2_updated
        }
      ]
    });

    // Complaint 3: Resolved complaint (created 10 days ago, resolved 1 day ago) - Permanently closed!
    const date3_created = new Date(now - 10 * DAY);
    const date3_progress = new Date(now - 7 * DAY);
    const date3_resolved = new Date(now - 1 * DAY);
    const complaint3 = await Complaint.create({
      complaintNumber: 'CMP-2026-0003',
      title: 'Clubhouse Corridor Light Flicker',
      category: 'Electrical',
      description: 'Multiple LED lights flickering continuously in the main gym hall corridor.',
      priority: 'Medium',
      status: 'Resolved',
      resolvedAt: date3_resolved,
      resident: resident1._id,
      createdAt: date3_created,
      updatedAt: date3_resolved,
      statusHistory: [
        {
          status: 'Open',
          changedBy: resident1._id,
          changedByName: resident1.name,
          changedByRole: 'resident',
          note: 'Complaint submitted',
          timestamp: date3_created
        },
        {
          status: 'In Progress',
          changedBy: admin._id,
          changedByName: admin.name,
          changedByRole: 'admin',
          note: 'Electrician inspecting fixture wiring',
          timestamp: date3_progress
        },
        {
          status: 'Resolved',
          changedBy: admin._id,
          changedByName: admin.name,
          changedByRole: 'admin',
          note: 'Replaced faulty driver unit and bulbs. Issue fixed and verified.',
          timestamp: date3_resolved
        }
      ]
    });

    // Complaint 4: Recent Open complaint (created 1 day ago)
    const date4 = new Date(now - 1 * DAY);
    const complaint4 = await Complaint.create({
      complaintNumber: 'CMP-2026-0004',
      title: 'Gate 2 Intercom Connection Down',
      category: 'Security',
      description: 'Security guard cannot reach Flat B-402 via intercom console at main entrance.',
      priority: 'Medium',
      status: 'Open',
      resident: resident2._id,
      createdAt: date4,
      updatedAt: date4,
      statusHistory: [
        {
          status: 'Open',
          changedBy: resident2._id,
          changedByName: resident2.name,
          changedByRole: 'resident',
          note: 'Complaint submitted by resident',
          timestamp: date4
        }
      ]
    });

    // Complaint 5: OVERDUE Open complaint (created 5 days ago)
    const date5 = new Date(now - 5 * DAY);
    const complaint5 = await Complaint.create({
      complaintNumber: 'CMP-2026-0005',
      title: 'Staircase Garbage Accumulation Block A',
      category: 'Cleaning',
      description: 'Waste bags left unattended near 2nd floor staircase landing for 3 days.',
      priority: 'Low',
      status: 'Open',
      resident: resident1._id,
      createdAt: date5,
      updatedAt: date5,
      statusHistory: [
        {
          status: 'Open',
          changedBy: resident1._id,
          changedByName: resident1.name,
          changedByRole: 'resident',
          note: 'Complaint submitted by resident',
          timestamp: date5
        }
      ]
    });

    console.log('[Seed]: Created 5 sample complaints with status histories & overdue states.');

    // 5. Create Notices
    await Notice.create({
      title: 'Annual Maintenance & Water Tank Cleaning Schedule',
      content: 'Please note that overhead water tanks across Block A & Block B will be cleaned on Saturday between 9:00 AM and 2:00 PM. Water supply will be temporarily suspended during this window.',
      category: 'Maintenance',
      isImportant: true,
      createdBy: admin._id,
      createdAt: new Date(now - 2 * DAY)
    });

    await Notice.create({
      title: 'Quarterly General Body Society Meeting',
      content: 'All resident owners are invited to attend the quarterly AGBC meeting this Sunday at 10:30 AM in the Clubhouse Hall.',
      category: 'Event',
      isImportant: false,
      createdBy: admin._id,
      createdAt: new Date(now - 5 * DAY)
    });

    await Notice.create({
      title: 'Pest Control Drive for Common Areas',
      content: 'Routine pest control service will be conducted in basements, stairwells, and garden walking paths tomorrow morning.',
      category: 'General',
      isImportant: false,
      createdBy: admin._id,
      createdAt: new Date(now - 8 * DAY)
    });

    console.log('[Seed]: Created sample notices.');

    console.log('\n================ SEED DATA COMPLETED SUCCESSFULLY ================');
    console.log('Admin Account:    admin@society.com / admin123');
    console.log('Resident 1:       resident1@society.com / resident123');
    console.log('Resident 2:       resident2@society.com / resident123');
    console.log('==================================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error.message);
    process.exit(1);
  }
};

seed();
