import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { connectDB } from '../config/db.js';
import mongoose from 'mongoose';

describe('INKGUARD Backend API Test Suite', () => {
  let authCookie = null;
  let workspaceId = null;

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

    // Grab cookie
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

  it('POST /api/drafts should create a new content draft', async () => {
    const res = await request(app)
      .post('/api/drafts')
      .set('Cookie', authCookie)
      .set('x-workspace-id', workspaceId)
      .send({
        title: 'Cloud Infrastructure Whitepaper Intro',
        contentType: 'Website copy',
        content: 'Apex Cloud delivers high resilience for cloud teams. Visit our helpdesk anytime for immediate support.',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Cloud Infrastructure Whitepaper Intro');
    expect(res.body.data.status).toBe('Draft');

    const draftId = res.body.data._id;

    // Test review run execution
    const reviewRes = await request(app)
      .post(`/api/drafts/${draftId}/review`)
      .set('Cookie', authCookie)
      .set('x-workspace-id', workspaceId);

    expect(reviewRes.status).toBe(200);
    expect(reviewRes.body.success).toBe(true);
    expect(reviewRes.body.data.scoreResult).toBeDefined();
    expect(reviewRes.body.data.findings.length).toBeGreaterThan(0);

    // Verify deterministic check found prohibited term 'helpdesk'
    const helpdeskFinding = reviewRes.body.data.findings.find((f) => f.textSpan.toLowerCase() === 'helpdesk');
    expect(helpdeskFinding).toBeDefined();
    expect(helpdeskFinding.category).toBe('Terminology');
    expect(helpdeskFinding.suggestedCorrection).toBe('Client Success Team');
  });

  it('GET /api/dashboard/metrics should return calculated persisted metrics', async () => {
    const res = await request(app)
      .get('/api/dashboard/metrics')
      .set('Cookie', authCookie)
      .set('x-workspace-id', workspaceId);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalReviews).toBeGreaterThanOrEqual(1);
    expect(typeof res.body.data.averageScore).toBe('number');
  });
});
