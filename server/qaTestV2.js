import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import complaintRoutes from './routes/complaintRoutes.js';
import noticeRoutes from './routes/noticeRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import User from './models/User.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_PORT = 5002;
const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/admin', adminRoutes);

const runTests = async () => {
  await connectDB();
  const server = app.listen(API_PORT, async () => {
    console.log(`\n================ SECOND PASS: HOSTILE QA ================`);
    
    let passed = 0;
    let failed = 0;

    const assertEq = (name, actual, expected) => {
      if (actual === expected) {
        console.log(`[PASS] ${name}`);
        passed++;
      } else {
        console.error(`[FAIL] ${name} | Expected ${expected}, got ${actual}`);
        failed++;
      }
    };

    try {
      // Login Admin & Resident
      const adminRes = await fetch(`http://127.0.0.1:${API_PORT}/api/auth/login`, {
        method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ email: 'admin@society.com', password: 'admin123' })
      });
      const adminToken = (await adminRes.json()).data.token;

      const residentRes = await fetch(`http://127.0.0.1:${API_PORT}/api/auth/login`, {
        method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ email: 'resident1@society.com', password: 'resident123' })
      });
      const residentBody = await residentRes.json();
      const residentToken = residentBody.data.token;
      const residentId = residentBody.data._id;

      const resident2Res = await fetch(`http://127.0.0.1:${API_PORT}/api/auth/login`, {
        method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ email: 'resident2@society.com', password: 'resident123' })
      });
      const resident2Token = (await resident2Res.json()).data.token;

      // 5. SECURITY DEEP TEST
      // Resident -> Admin dashboard
      const dashRes = await fetch(`http://127.0.0.1:${API_PORT}/api/admin/dashboard`, { headers: { 'Authorization': `Bearer ${residentToken}` }});
      assertEq('Security: Resident -> Admin Dashboard (403)', dashRes.status, 403);

      // Resident -> Status update
      const allCompRes = await fetch(`http://127.0.0.1:${API_PORT}/api/complaints`, { headers: { 'Authorization': `Bearer ${adminToken}` }});
      const allCompBody = await allCompRes.json();
      const compId = allCompBody.data[0]._id;
      
      const resStatusUpd = await fetch(`http://127.0.0.1:${API_PORT}/api/complaints/${compId}/status`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${residentToken}` }, body: JSON.stringify({ status: 'In Progress' })
      });
      assertEq('Security: Resident -> Status Update (403)', resStatusUpd.status, 403);

      // Resident A -> Resident B complaint
      const resBComp = allCompBody.data.find(c => c.resident._id !== residentId);
      if (resBComp) {
        const spyRes = await fetch(`http://127.0.0.1:${API_PORT}/api/complaints/${resBComp._id}`, { headers: { 'Authorization': `Bearer ${residentToken}` }});
        assertEq('Security: Resident A -> Resident B Complaint (403)', spyRes.status, 403);
      } else {
        console.log('[SKIP] Security: No Resident B complaint found to test spy');
      }

      // Unauthenticated -> admin
      const unauthRes = await fetch(`http://127.0.0.1:${API_PORT}/api/admin/dashboard`);
      assertEq('Security: Unauthenticated -> Admin (401)', unauthRes.status, 401);

      // Forged JWT
      const forgedRes = await fetch(`http://127.0.0.1:${API_PORT}/api/admin/dashboard`, { headers: { 'Authorization': 'Bearer asdf.qwer.zxcv' }});
      assertEq('Security: Forged JWT (401)', forgedRes.status, 401);

      // 6. INPUT VALIDATION
      const missingTitleRes = await fetch(`http://127.0.0.1:${API_PORT}/api/complaints`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${residentToken}` }, body: JSON.stringify({ category: 'Plumbing', description: 'test' })
      });
      assertEq('Validation: Missing Complaint Title (400)', missingTitleRes.status, 400);

      const invalidStatusRes = await fetch(`http://127.0.0.1:${API_PORT}/api/complaints/${compId}/status`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` }, body: JSON.stringify({ status: 'FakeStatus' })
      });
      assertEq('Validation: Invalid Status Transition (400)', invalidStatusRes.status, 400);

      const invalidPriorityRes = await fetch(`http://127.0.0.1:${API_PORT}/api/complaints/${compId}/priority`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` }, body: JSON.stringify({ priority: 'SuperHigh' })
      });
      assertEq('Validation: Invalid Priority (400)', invalidPriorityRes.status, 400);

      // 7. CONCURRENCY TEST
      console.log('Running Concurrency Test: Creating 10 complaints simultaneously...');
      const reqs = [];
      for (let i = 0; i < 10; i++) {
        reqs.push(fetch(`http://127.0.0.1:${API_PORT}/api/complaints`, {
          method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${residentToken}` }, 
          body: JSON.stringify({ title: `Concurrent Test ${i}`, category: 'Plumbing', description: 'concurrent' })
        }));
      }
      const responses = await Promise.all(reqs);
      const bodies = await Promise.all(responses.map(r => r.json()));
      const cmpNumbers = bodies.map(b => b.data?.complaintNumber);
      const uniqueCmp = new Set(cmpNumbers);
      assertEq('Concurrency: No duplicate complaintNumbers under simultaneous load', uniqueCmp.size, 10);

      console.log(`\n================ RESULTS ================`);
      console.log(`Passed: ${passed}`);
      console.log(`Failed: ${failed}`);

    } catch (err) {
      console.error(err);
    } finally {
      server.close();
      process.exit(0);
    }
  });
};

runTests();
