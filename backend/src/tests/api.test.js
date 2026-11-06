import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import path from 'path';
import fs from 'fs';
import app from '../app.js';
import { connectDB } from '../config/db.js';
import mongoose from 'mongoose';
import { Workspace } from '../models/Workspace.js';

describe('INKGUARD Backend API & Governance Architecture Test Suite', () => {
  let authCookie = null;
  let workspaceId = null;
  let testDraftId = null;

  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('GET /api/health should return 200 with system status and tagline', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.database).toBe('connected');
    expect(res.body.tagline).toBe('Create with confidence. Publish with consistency.');
  });

  it('POST /api/auth/login with valid credentials should sign in and return cookie', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@inkguard.demo', password: 'Password123!' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe('admin@inkguard.demo');
    expect(res.body.data.workspace).toBeDefined();

    workspaceId = res.body.data.workspace._id;

    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    authCookie = cookies.map((c) => c.split(';')[0]).join('; ');
  });

  it('POST /api/auth/login with invalid password should fail with 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@inkguard.demo', password: 'WrongPassword!' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/auth/me should verify active session with valid cookie', async () => {
    const res = await request(app).get('/api/auth/me').set('Cookie', authCookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe('admin@inkguard.demo');
    expect(res.body.data.role).toBe('admin');
  });

  it('GET /api/brand-rules should list active rules for the workspace', async () => {
    const res = await request(app)
      .get('/api/brand-rules')
      .set('Cookie', authCookie)
      .set('x-workspace-id', workspaceId);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('POST /api/brand-rules should detect conflicting or ambiguous rules', async () => {
    // Attempt creating a rule whose prohibited phrase is "Client Success Team"
    // which is already a preferred wording in another rule
    const res = await request(app)
      .post('/api/brand-rules')
      .set('Cookie', authCookie)
      .set('x-workspace-id', workspaceId)
      .send({
        title: 'Conflict Test Rule',
        description: 'Testing rule conflict detection between preferred and prohibited terms',
        category: 'Terminology',
        severity: 'Medium',
        prohibitedPhrases: ['helpdesk', 'Client Success Team'],
        preferredWording: 'Support Desk',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    // Verify conflict warning is returned
    expect(res.body.conflictWarnings).toBeDefined();
    expect(res.body.conflictWarnings.length).toBeGreaterThan(0);

    // Clean up created test rule
    await request(app)
      .delete(`/api/brand-rules/${res.body.data._id}`)
      .set('Cookie', authCookie)
      .set('x-workspace-id', workspaceId);
  });

  it('POST /api/drafts/extract-text should upload document and extract text', async () => {
    // Create a temporary text file
    const tempDir = path.resolve('uploads');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
    const tempFile = path.join(tempDir, 'sample_test_doc.txt');
    fs.writeFileSync(tempFile, 'Apex Cloud provides 100% guaranteed high availability for your team.');

    const res = await request(app)
      .post('/api/drafts/extract-text')
      .set('Cookie', authCookie)
      .set('x-workspace-id', workspaceId)
      .attach('file', tempFile);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.text).toContain('Apex Cloud provides');
    expect(res.body.data.wordCount).toBeGreaterThan(0);
    expect(res.body.data.format).toBe('Plain Text');

    // Clean up temp file
    if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
  });

  it('POST /api/drafts/visual-check should analyze alt text and palette compliance', async () => {
    const res = await request(app)
      .post('/api/drafts/visual-check')
      .set('Cookie', authCookie)
      .set('x-workspace-id', workspaceId)
      .send({
        imageUrl: '/uploads/sample_banner.svg',
        altText: 'image', // Generic alt text
        detectedColors: ['#FF0055', '#2563EB'],
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.findings).toBeDefined();

    // Verify finding flagged generic alt text
    const altFinding = res.body.data.findings.find((f) => f.category === 'Accessibility');
    expect(altFinding).toBeDefined();
    expect(altFinding.textSpan).toBe('image');

    // Verify visual disclosure note is present
    expect(res.body.data.disclosure.disclaimer).toBeDefined();
  });

  it('POST /api/drafts should create a draft and review run with explainable findings', async () => {
    const res = await request(app)
      .post('/api/drafts')
      .set('Cookie', authCookie)
      .set('x-workspace-id', workspaceId)
      .send({
        title: 'Cloud Infrastructure Whitepaper Intro',
        contentType: 'Website copy',
        content: 'Apex Cloud is 100% guaranteed hack-proof. Contact our helpdesk for support.',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    testDraftId = res.body.data._id;

    // Run brand review
    const reviewRes = await request(app)
      .post(`/api/drafts/${testDraftId}/review`)
      .set('Cookie', authCookie)
      .set('x-workspace-id', workspaceId);

    expect(reviewRes.status).toBe(200);
    expect(reviewRes.body.success).toBe(true);
    expect(reviewRes.body.data.scoreResult).toBeDefined();
    expect(reviewRes.body.data.findings.length).toBeGreaterThan(0);

    // Verify deterministic check found prohibited term 'helpdesk'
    const helpdeskFinding = reviewRes.body.data.findings.find((f) => f.textSpan && f.textSpan.toLowerCase() === 'helpdesk');
    expect(helpdeskFinding).toBeDefined();
    expect(helpdeskFinding.category).toBe('Terminology');
    expect(helpdeskFinding.suggestedCorrection).toBe('Client Success Team');
  });

  it('POST /api/drafts/:id/decision should block publication approval without override reason when high-risk findings exist', async () => {
    // Attempting to approve draft that has open High-risk findings without override
    const res = await request(app)
      .post(`/api/drafts/${testDraftId}/decision`)
      .set('Cookie', authCookie)
      .set('x-workspace-id', workspaceId)
      .send({
        decision: 'approve',
        comment: 'Attempting approval without fixing violations',
        overrideReason: '', // Empty override reason
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.requiresOverride).toBe(true);
  });

  it('POST /api/drafts/:id/decision should approve when explicit authorized override reason is provided', async () => {
    const res = await request(app)
      .post(`/api/drafts/${testDraftId}/decision`)
      .set('Cookie', authCookie)
      .set('x-workspace-id', workspaceId)
      .send({
        decision: 'approve',
        comment: 'Approved with regulatory sign-off',
        overrideReason: 'Legal counsel granted compliance exception for urgent corporate announcement.',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('Approved');
    expect(res.body.data.isOverrideApproved).toBe(true);
    expect(res.body.data.overrideReason).toContain('Legal counsel granted compliance exception');
  });

  it('Cross-Workspace Security: User cannot access records of a workspace they do not belong to', async () => {
    // Log in as reviewer (who is a regular user, not superadmin)
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'reviewer@inkguard.demo', password: 'Password123!' });
    const reviewerCookies = loginRes.headers['set-cookie'];
    const reviewerCookie = reviewerCookies.map((c) => c.split(';')[0]).join('; ');

    // Create an independent workspace
    const rogueWorkspace = await Workspace.create({
      name: 'Confidential Subsidiary Workspace',
      slug: `rogue-${Date.now()}`,
      description: 'Strictly isolated workspace',
      owner: new mongoose.Types.ObjectId(),
    });

    const res = await request(app)
      .get('/api/brand-rules')
      .set('Cookie', reviewerCookie)
      .set('x-workspace-id', rogueWorkspace._id.toString());

    // Must be strictly denied with 403 Forbidden
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('not a member of this workspace');

    // Clean up
    await Workspace.deleteOne({ _id: rogueWorkspace._id });
  });

  it('GET /api/insights should return MongoDB aggregated metrics without mock data', async () => {
    const res = await request(app)
      .get('/api/insights')
      .set('Cookie', authCookie)
      .set('x-workspace-id', workspaceId);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.categoryDistribution)).toBe(true);
    expect(Array.isArray(res.body.data.topRules)).toBe(true);
    expect(typeof res.body.data.avgTurnaroundSeconds).toBe('number');
  });

  it('GET /api/brand-assets should return approved assets repository', async () => {
    const res = await request(app)
      .get('/api/brand-assets')
      .set('Cookie', authCookie)
      .set('x-workspace-id', workspaceId);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
