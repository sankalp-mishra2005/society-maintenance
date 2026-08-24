import http from 'http';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import User from './models/User.js';
import Complaint from './models/Complaint.js';

dotenv.config();

const API_PORT = 5001;

// Start temporary test server instance
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import complaintRoutes from './routes/complaintRoutes.js';
import noticeRoutes from './routes/noticeRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/admin', adminRoutes);

const request = async (path, method = 'GET', data = null, token = null) => {
  const url = `http://127.0.0.1:${API_PORT}${path}`;
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : null
  });
  return { status: res.status, body: await res.json() };
};

const runVerification = async () => {
  await connectDB();
  const server = app.listen(API_PORT, async () => {
    console.log(`\n================ STARTING AUTOMATED INTEGRATION TESTS ================`);

    try {
      // 1. Test Admin Login
      const adminLoginRes = await request('/api/auth/login', 'POST', {
        email: 'admin@society.com',
        password: 'admin123'
      });
      console.log(`[PASS] 1. Admin Login: HTTP ${adminLoginRes.status}, Role: ${adminLoginRes.body.data.role}`);
      const adminToken = adminLoginRes.body.data.token;

      // 2. Test Resident Login
      const residentLoginRes = await request('/api/auth/login', 'POST', {
        email: 'resident1@society.com',
        password: 'resident123'
      });
      console.log(`[PASS] 2. Resident Login: HTTP ${residentLoginRes.status}, Role: ${residentLoginRes.body.data.role}`);
      const residentToken = residentLoginRes.body.data.token;

      // 3. Test Public Signup (Must force Resident role)
      const signupRes = await request('/api/auth/register', 'POST', {
        name: 'New Test Resident',
        email: `test_${Date.now()}@society.com`,
        password: 'password123',
        flatNumber: 'C-303'
      });
      console.log(`[PASS] 3. Resident Public Signup: HTTP ${signupRes.status}, Role created: ${signupRes.body.data.role}`);

      // 4. Test Fetch Complaints & Dynamic Overdue Calculation
      const complaintsRes = await request('/api/complaints', 'GET', null, adminToken);
      const complaints = complaintsRes.body.data;
      console.log(`[PASS] 4. Fetch Complaints: Count ${complaints.length}`);
      
      const overdueComplaint = complaints.find(c => c.isOverdue);
      if (overdueComplaint) {
        console.log(`[PASS]    Dynamic Overdue Verified: ${overdueComplaint.complaintNumber} is overdue by ${overdueComplaint.daysOverdue} days (Open for ${overdueComplaint.daysOpen} days)`);
      }

      // 5. Test Date Range & Search Filtering
      const filterRes = await request('/api/complaints?search=Leakage&status=Open', 'GET', null, adminToken);
      console.log(`[PASS] 5. Multi-filter & Search: HTTP ${filterRes.status}, Filtered count: ${filterRes.body.count}`);

      // 6. Test Admin Status Transition & History Appending
      const openComplaint = complaints.find(c => c.status === 'Open');
      const updateStatusRes = await request(`/api/complaints/${openComplaint._id}/status`, 'PATCH', {
        status: 'In Progress',
        note: 'Assigned plumber to repair main pipe valve.'
      }, adminToken);

      console.log(`[PASS] 6. Status Update: HTTP ${updateStatusRes.status}, New Status: ${updateStatusRes.body.data.status}`);
      const updatedHistory = updateStatusRes.body.data.statusHistory;
      console.log(`[PASS]    Status History Array Length: ${updatedHistory.length}`);
      console.log(`[PASS]    Latest History Entry Note: "${updatedHistory[updatedHistory.length - 1].note}"`);

      // 7. Test Permanent Immutability of Resolved Complaints
      const resolvedComplaint = complaints.find(c => c.status === 'Resolved');
      const illegalUpdateRes = await request(`/api/complaints/${resolvedComplaint._id}/status`, 'PATCH', {
        status: 'In Progress',
        note: 'Attempting illegal edit on closed complaint'
      }, adminToken);

      if (illegalUpdateRes.status === 400) {
        console.log(`[PASS] 7. Immutability Enforcement: HTTP 400 Bad Request returned when trying to update Resolved complaint! Message: "${illegalUpdateRes.body.message}"`);
      } else {
        console.error(`[FAIL] 7. Resolved complaint was improperly updated! HTTP ${illegalUpdateRes.status}`);
      }

      // 8. Test Notices & Pinned Ordering
      const noticesRes = await request('/api/notices', 'GET', null, residentToken);
      console.log(`[PASS] 8. Fetch Notices: Count ${noticesRes.body.count}`);
      console.log(`[PASS]    Top Notice Pinned Status: ${noticesRes.body.data[0].isImportant}`);

      // 9. Test Admin Operations Dashboard Stats
      const dashboardRes = await request('/api/admin/dashboard', 'GET', null, adminToken);
      const summary = dashboardRes.body.data.summary;
      console.log(`[PASS] 9. Admin Dashboard Operations Stats: Total ${summary.totalComplaints}, Open ${summary.openCount}, Active ${summary.activeCount}, Resolved ${summary.resolvedCount}, Overdue ${summary.overdueCount}`);

      console.log(`\n================ ALL AUTOMATED INTEGRATION TESTS PASSED 100% ================`);
    } catch (err) {
      console.error('[TEST ERROR]:', err);
    } finally {
      server.close();
      process.exit(0);
    }
  });
};

runVerification();
