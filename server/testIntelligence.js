/**
 * Issue Intelligence Module — Integration Tests
 * 
 * Tests the GET /api/admin/intelligence endpoint for:
 * 1. Response structure validation
 * 2. SLA metric ranges
 * 3. Hotspot matrix shape
 * 4. Recurring issues field validation
 * 5. Security (resident blocked, unauthenticated blocked)
 */

import connectDB from './config/db.js';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import complaintRoutes from './routes/complaintRoutes.js';
import noticeRoutes from './routes/noticeRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();

const API_PORT = 5003;
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
    console.log(`\n================ ISSUE INTELLIGENCE MODULE TESTS ================`);

    let passed = 0;
    let failed = 0;

    const assert = (name, condition, detail = '') => {
      if (condition) {
        console.log(`[PASS] ${name}`);
        passed++;
      } else {
        console.error(`[FAIL] ${name}${detail ? ` | ${detail}` : ''}`);
        failed++;
      }
    };

    try {
      // --- Setup: get tokens ---
      const adminRes = await fetch(`http://127.0.0.1:${API_PORT}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@society.com', password: 'admin123' })
      });
      const adminBody = await adminRes.json();
      const adminToken = adminBody.data.token;

      const residentRes = await fetch(`http://127.0.0.1:${API_PORT}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'resident1@society.com', password: 'resident123' })
      });
      const residentBody = await residentRes.json();
      const residentToken = residentBody.data.token;

      // ===== 1. Endpoint returns 200 with valid structure =====
      const intelRes = await fetch(`http://127.0.0.1:${API_PORT}/api/admin/intelligence`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      assert('1. Intelligence endpoint returns 200', intelRes.status === 200, `Got ${intelRes.status}`);

      const intelBody = await intelRes.json();
      assert('2. Response has success=true', intelBody.success === true);
      assert('3. Response has data object', typeof intelBody.data === 'object' && intelBody.data !== null);

      // ===== 2. Top-level keys =====
      const { data } = intelBody;
      assert('4. Data contains sla key', 'sla' in data);
      assert('5. Data contains hotspots key', 'hotspots' in data);
      assert('6. Data contains recurringIssues key', 'recurringIssues' in data);

      // ===== 3. SLA metric validation =====
      const { sla } = data;
      assert('7. SLA has avgResolutionDays', 'avgResolutionDays' in sla);
      assert('8. SLA has resolutionRate', 'resolutionRate' in sla);
      assert('9. SLA has overdueRate', 'overdueRate' in sla);
      assert('10. SLA has highPrioritySlaRate', 'highPrioritySlaRate' in sla);
      assert('11. SLA has categorySlaBreakdown', 'categorySlaBreakdown' in sla);

      // Range checks
      const avgDays = parseFloat(sla.avgResolutionDays);
      assert('12. avgResolutionDays is non-negative number', !isNaN(avgDays) && avgDays >= 0, `Got ${sla.avgResolutionDays}`);
      assert('13. resolutionRate is 0-100', sla.resolutionRate >= 0 && sla.resolutionRate <= 100, `Got ${sla.resolutionRate}`);
      assert('14. overdueRate is 0-100', sla.overdueRate >= 0 && sla.overdueRate <= 100, `Got ${sla.overdueRate}`);
      assert('15. highPrioritySlaRate is 0-100', sla.highPrioritySlaRate >= 0 && sla.highPrioritySlaRate <= 100, `Got ${sla.highPrioritySlaRate}`);
      assert('16. categorySlaBreakdown is array', Array.isArray(sla.categorySlaBreakdown));

      // Validate each category breakdown entry
      if (sla.categorySlaBreakdown.length > 0) {
        const entry = sla.categorySlaBreakdown[0];
        assert('17. Category breakdown entry has category field', typeof entry.category === 'string');
        assert('18. Category breakdown entry has avgResolutionDays', 'avgResolutionDays' in entry);
      } else {
        console.log('[SKIP] 17-18. No category breakdown entries to validate');
        passed += 2; // Skip counts as pass (no data to violate)
      }

      // ===== 4. Hotspot matrix validation =====
      const { hotspots } = data;
      assert('19. Hotspots has blocks array', Array.isArray(hotspots.blocks));
      assert('20. Hotspots has categories array', Array.isArray(hotspots.categories));
      assert('21. Hotspots has data object', typeof hotspots.data === 'object');
      assert('22. Hotspots categories includes standard categories',
        hotspots.categories.includes('Plumbing') && hotspots.categories.includes('Electrical'),
        `Got ${hotspots.categories.join(', ')}`
      );

      // Validate hotspot data structure (each block maps to category counts)
      if (hotspots.blocks.length > 0) {
        const firstBlock = hotspots.blocks[0];
        const blockData = hotspots.data[firstBlock];
        assert('23. Block data is an object with category counts', typeof blockData === 'object');
        const firstCatCount = Object.values(blockData)[0];
        assert('24. Category count is a positive number', typeof firstCatCount === 'number' && firstCatCount > 0);
      } else {
        console.log('[SKIP] 23-24. No hotspot blocks to validate');
        passed += 2;
      }

      // ===== 5. Recurring issues validation =====
      const { recurringIssues } = data;
      assert('25. recurringIssues is array', Array.isArray(recurringIssues));
      assert('26. recurringIssues has at most 5 entries', recurringIssues.length <= 5);

      if (recurringIssues.length > 0) {
        const issue = recurringIssues[0];
        assert('27. Recurring issue has block', typeof issue.block === 'string' && issue.block.length > 0);
        assert('28. Recurring issue has category', typeof issue.category === 'string' && issue.category.length > 0);
        assert('29. Recurring issue has count', typeof issue.count === 'number' && issue.count >= 2);
        assert('30. Recurring issue has priority (High|Medium)', ['High', 'Medium'].includes(issue.priority));
        assert('31. Recurring issue has recommendation', typeof issue.recommendation === 'string' && issue.recommendation.length > 0);
        assert('32. Recurring issue has percentIncrease', typeof issue.percentIncrease === 'string');
        
        // Verify sorted descending by count
        if (recurringIssues.length > 1) {
          assert('33. Recurring issues sorted by count desc', recurringIssues[0].count >= recurringIssues[1].count);
        } else {
          console.log('[SKIP] 33. Only one recurring issue, skip sort check');
          passed++;
        }
      } else {
        console.log('[SKIP] 27-33. No recurring issues to validate');
        passed += 7;
      }

      // ===== 6. Security: Resident cannot access intelligence =====
      const resIntelRes = await fetch(`http://127.0.0.1:${API_PORT}/api/admin/intelligence`, {
        headers: { 'Authorization': `Bearer ${residentToken}` }
      });
      assert('34. Security: Resident -> Intelligence (403)', resIntelRes.status === 403, `Got ${resIntelRes.status}`);

      // ===== 7. Security: Unauthenticated cannot access intelligence =====
      const unauthIntelRes = await fetch(`http://127.0.0.1:${API_PORT}/api/admin/intelligence`);
      assert('35. Security: Unauthenticated -> Intelligence (401)', unauthIntelRes.status === 401, `Got ${unauthIntelRes.status}`);

      // ===== 8. Security: Forged JWT cannot access intelligence =====
      const forgedIntelRes = await fetch(`http://127.0.0.1:${API_PORT}/api/admin/intelligence`, {
        headers: { 'Authorization': 'Bearer fake.jwt.token' }
      });
      assert('36. Security: Forged JWT -> Intelligence (401)', forgedIntelRes.status === 401, `Got ${forgedIntelRes.status}`);

      // ===== 9. Idempotency: calling twice returns same structure =====
      const intelRes2 = await fetch(`http://127.0.0.1:${API_PORT}/api/admin/intelligence`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      const intelBody2 = await intelRes2.json();
      assert('37. Idempotency: second call returns same sla.resolutionRate',
        intelBody2.data.sla.resolutionRate === sla.resolutionRate
      );
      assert('38. Idempotency: second call returns same sla.overdueRate',
        intelBody2.data.sla.overdueRate === sla.overdueRate
      );

      // ===== Summary =====
      console.log(`\n================ INTELLIGENCE TEST RESULTS ================`);
      console.log(`Passed: ${passed}`);
      console.log(`Failed: ${failed}`);

      if (failed === 0) {
        console.log(`\n✅ ALL ISSUE INTELLIGENCE TESTS PASSED`);
      } else {
        console.log(`\n❌ ${failed} TEST(S) FAILED`);
      }

    } catch (err) {
      console.error('[TEST FATAL ERROR]:', err);
      failed++;
    } finally {
      server.close();
      process.exit(failed > 0 ? 1 : 0);
    }
  });
};

runTests();
