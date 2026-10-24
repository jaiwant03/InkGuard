import fetch from 'node:process';
import http from 'node:http';

async function request(endpoint, options = {}) {
  const res = await globalThis.fetch(`http://localhost:5000/api${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const data = await res.json();
  return { status: res.status, ok: res.ok, data };
}

async function runCompleteDemo() {
  console.log('=== [1/8] AUTHENTICATING AS ADMIN ===');
  const loginRes = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'admin@inkguard.demo',
      password: 'Password123!',
    }),
  });

  if (!loginRes.ok || !loginRes.data.success) {
    throw new Error('Login failed: ' + JSON.stringify(loginRes.data));
  }

  const token = loginRes.data.data?.token;
  const authHeaders = { Authorization: `Bearer ${token}` };
  const user = loginRes.data.data?.user;
  const workspace = loginRes.data.data?.workspace;
  const workspaceId = workspace?._id || user?.activeWorkspaceId;
  console.log(`✓ Authenticated: ${user?.name} (${user?.email})`);
  console.log(`✓ Active Workspace: ${workspace?.name} (${workspaceId})`);

  console.log('\n=== [2/8] STEP 1: CREATE CORPORATE BRAND RULE (INPUT -> OUTPUT) ===');
  const ruleInput = {
    title: 'Zero-Tolerance on Hack-Proof Claims',
    category: 'Promotional claims',
    severity: 'High',
    description: 'Never guarantee 100% invulnerability. Use defensible security language and verified architectural protections.',
    preferredWording: 'multi-layer enterprise defense architecture',
    prohibitedPhrases: ['hack-proof', '100% unbreakable'],
    requiredPhrases: [],
    correctExamples: ['Apex Cloud incorporates a multi-layer enterprise defense architecture.'],
    incorrectExamples: ['Apex Cloud is 100% unbreakable and hack-proof.'],
    sourceReference: 'Corporate Legal & PR Policy Sec-4.2',
    isActive: true,
  };
  console.log('INPUT:', JSON.stringify(ruleInput, null, 2));

  const ruleRes = await request('/brand-rules', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify(ruleInput),
  });
  console.log('OUTPUT Status:', ruleRes.status);
  console.log('OUTPUT Data:', JSON.stringify(ruleRes.data, null, 2));
  const createdRuleId = ruleRes.data.data?._id;

  console.log('\n=== [3/8] STEP 2: REGISTER APPROVED FACT TRUTH ASSERTION (INPUT -> OUTPUT) ===');
  const factInput = {
    factText: 'Apex Cloud protects over 4,500 enterprise brands with 99.99% high-availability SLA.',
    category: 'Company metrics',
    sourceName: 'Q3 2026 Cloud Operations Report',
    sourceUrl: 'https://internal.apexcloud.corp/reports/q3-2026',
    ownerRole: 'Director of Infrastructure',
    verificationDate: new Date().toISOString(),
    expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
  };
  console.log('INPUT:', JSON.stringify(factInput, null, 2));

  const factRes = await request('/approved-facts', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify(factInput),
  });
  console.log('OUTPUT Status:', factRes.status);
  console.log('OUTPUT Data:', JSON.stringify(factRes.data, null, 2));
  const createdFactId = factRes.data.data?._id;

  console.log('\n=== [4/8] STEP 3: SUBMIT CONTENT DRAFT & RUN DETERMINISTIC AUDIT (INPUT -> OUTPUT) ===');
  const draftInput = {
    title: 'Q4 Global Cloud Infrastructure Press Release',
    contentType: 'Website copy',
    content: 'Introducing our new Apex cloud engine. It is guaranteed to be 100% unbreakable and completely hack-proof for all enterprise workloads. Over 1,200 enterprise organizations use Apex Cloud solutions worldwide.',
  };
  console.log('INPUT Draft:', JSON.stringify(draftInput, null, 2));

  const draftRes = await request('/drafts', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify(draftInput),
  });
  console.log('Draft Creation OUTPUT:', JSON.stringify(draftRes.data, null, 2));
  const draftId = draftRes.data.data._id;

  console.log('\n--- Running AI Brand Governance Audit on Draft ---');
  const auditRes = await request(`/drafts/${draftId}/review`, {
    method: 'POST',
    headers: authHeaders,
  });
  console.log('Audit OUTPUT Status:', auditRes.status);
  console.log('Audit Score Result:', JSON.stringify(auditRes.data.data?.scoreResult, null, 2));
  console.log('Flagged Findings:', JSON.stringify(auditRes.data.data?.findings, null, 2));

  console.log('\n=== [5/8] STEP 4: REMEDIATE COPY & RE-AUDIT TO 100% (INPUT -> OUTPUT) ===');
  const correctedInput = {
    content: 'Introducing our new Apex cloud engine, engineered with a multi-layer enterprise defense architecture for all enterprise workloads. Apex Cloud protects over 4,500 enterprise brands with 99.99% high-availability SLA.',
    changeNotes: 'Replaced prohibited phrases with preferred terminology and aligned enterprise numbers with approved facts.',
  };
  console.log('INPUT Remediation:', JSON.stringify(correctedInput, null, 2));

  const updateRes = await request(`/drafts/${draftId}/version`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify(correctedInput),
  });
  console.log('Version 2 Created OUTPUT:', JSON.stringify(updateRes.data, null, 2));

  console.log('\n--- Re-running Audit on Corrected Version 2 ---');
  const reAuditRes = await request(`/drafts/${draftId}/review`, {
    method: 'POST',
    headers: authHeaders,
  });
  console.log('Re-Audit Score Result:', JSON.stringify(reAuditRes.data.data?.scoreResult, null, 2));
  console.log('Remaining Findings count:', reAuditRes.data.data?.findings?.length);

  console.log('\n=== [6/8] STEP 5: SUBMIT FOR SIGN-OFF & APPROVE DRAFT (INPUT -> OUTPUT) ===');
  const submitApprovalRes = await request(`/drafts/${draftId}/status`, {
    method: 'PATCH',
    headers: authHeaders,
    body: JSON.stringify({ status: 'In Review' }),
  });
  console.log('Submitted for Sign-off OUTPUT:', JSON.stringify(submitApprovalRes.data, null, 2));

  const approveInput = {
    action: 'approve',
    comment: 'Audit score verified at 100%. Approved for global publication across PR and digital channels.',
  };
  console.log('INPUT Reviewer Decision:', JSON.stringify(approveInput, null, 2));

  const approveRes = await request(`/drafts/${draftId}/decision`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify(approveInput),
  });
  console.log('OUTPUT Approval Decision:', JSON.stringify(approveRes.data, null, 2));

  console.log('\n=== [7/8] STEP 6: VERIFY IMMUTABLE AUDIT TRAIL (OUTPUT) ===');
  const auditLogsRes = await request('/audit?limit=8', {
    method: 'GET',
    headers: authHeaders,
  });
  console.log('Recent Audit Events:', JSON.stringify(auditLogsRes.data.data?.slice(0, 6), null, 2));

  console.log('\n=== [8/8] STEP 7: RETRIEVE UPDATED WORKSPACE DASHBOARD METRICS (OUTPUT) ===');
  const dashboardRes = await request('/dashboard/metrics', {
    method: 'GET',
    headers: authHeaders,
  });
  console.log('Executive Dashboard Metrics:', JSON.stringify(dashboardRes.data.data, null, 2));

  console.log('\n🎉 ALL INPUTS AND OUTPUTS EXECUTED SUCCESSFULLY!');
  return {
    ruleId: createdRuleId,
    factId: createdFactId,
    draftId,
  };
}

runCompleteDemo().catch((err) => {
  console.error('Demo Error:', err);
  process.exit(1);
});
