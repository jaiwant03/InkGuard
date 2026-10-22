import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Workspace } from '../models/Workspace.js';
import { WorkspaceMember } from '../models/WorkspaceMember.js';
import { BrandProfile } from '../models/BrandProfile.js';
import { BrandRule } from '../models/BrandRule.js';
import { ApprovedFact } from '../models/ApprovedFact.js';
import { BrandAsset } from '../models/BrandAsset.js';
import { ContentDraft } from '../models/ContentDraft.js';
import { ContentVersion } from '../models/ContentVersion.js';
import { ReviewRun } from '../models/ReviewRun.js';
import { Finding } from '../models/Finding.js';
import { Comment } from '../models/Comment.js';
import { AuditEvent } from '../models/AuditEvent.js';

async function seed() {
  console.log('[Seed] Connecting to MongoDB...');
  await connectDB();

  console.log('[Seed] Clearing existing collections for fresh seed...');
  await Promise.all([
    User.deleteMany({}),
    Workspace.deleteMany({}),
    WorkspaceMember.deleteMany({}),
    BrandProfile.deleteMany({}),
    BrandRule.deleteMany({}),
    ApprovedFact.deleteMany({}),
    BrandAsset.deleteMany({}),
    ContentDraft.deleteMany({}),
    ContentVersion.deleteMany({}),
    ReviewRun.deleteMany({}),
    Finding.deleteMany({}),
    Comment.deleteMany({}),
    AuditEvent.deleteMany({}),
  ]);

  console.log('[Seed] Creating demo users...');
  // Standard demo accounts
  const adminUser = await User.create({
    name: 'Brand Governance Admin',
    email: 'admin@inkguard.demo',
    password: 'Password123!',
    systemRole: 'superadmin',
  });

  const reviewerUser = await User.create({
    name: 'Compliance Reviewer',
    email: 'reviewer@inkguard.demo',
    password: 'Password123!',
    systemRole: 'user',
  });

  const creatorUser = await User.create({
    name: 'Content Creator',
    email: 'creator@inkguard.demo',
    password: 'Password123!',
    systemRole: 'user',
  });

  console.log('[Seed] Creating flagship workspace...');
  const workspace = await Workspace.create({
    name: 'Apex Cloud Solutions',
    slug: 'apex-cloud-solutions',
    description: 'Enterprise brand governance workspace for product, marketing, and communications.',
    owner: adminUser._id,
    industry: 'Enterprise Software & Cloud Infrastructure',
    isDefaultDemo: true,
  });

  // Assign memberships
  await WorkspaceMember.create({
    workspace: workspace._id,
    user: adminUser._id,
    role: 'admin',
  });

  await WorkspaceMember.create({
    workspace: workspace._id,
    user: reviewerUser._id,
    role: 'reviewer',
    invitedBy: adminUser._id,
  });

  await WorkspaceMember.create({
    workspace: workspace._id,
    user: creatorUser._id,
    role: 'creator',
    invitedBy: adminUser._id,
  });

  // Set active workspace for users
  adminUser.activeWorkspaceId = workspace._id;
  reviewerUser.activeWorkspaceId = workspace._id;
  creatorUser.activeWorkspaceId = workspace._id;
  await Promise.all([adminUser.save(), reviewerUser.save(), creatorUser.save()]);

  console.log('[Seed] Creating Brand Profile...');
  await BrandProfile.create({
    workspace: workspace._id,
    brandName: 'Apex Cloud',
    tagline: 'Create with confidence. Publish with consistency.',
    description: 'The authoritative brand identity and communication standard for Apex Cloud Solutions.',
    preferredTone: 'Authoritative, technical yet accessible, empathetic to business problems, and solution-focused.',
    targetAudience: 'Chief Information Security Officers, Enterprise Architects, and DevOps Engineering Directors.',
    brandColors: [
      { name: 'Apex Royal Blue', hex: '#2563EB', rgb: '37, 99, 235', role: 'Primary', usage: 'Primary logo, high-priority buttons, key accents' },
      { name: 'Indigo Aura', hex: '#4F46E5', rgb: '79, 70, 229', role: 'Secondary', usage: 'Gradient blends, secondary badges and graph highlights' },
      { name: 'Slate Gray', hex: '#64748B', rgb: '100, 116, 139', role: 'Neutral', usage: 'Body copy, borders, and card outlines' },
      { name: 'Surface White', hex: '#FFFFFF', rgb: '255, 255, 255', role: 'Surface', usage: 'Primary card container backgrounds' },
    ],
    typography: [
      { role: 'Heading', family: 'Inter', weight: '600, 700', usage: 'Display banners, page headlines, card titles' },
      { role: 'Body', family: 'Inter', weight: '400, 500', usage: 'Marketing copy, articles, preview documents' },
    ],
    approvedMessaging: [
      'Empowering enterprise teams with resilient, compliant cloud architecture.',
      'Deterministic reliability meets agile cloud operations.',
      'Built for zero-compromise security and global availability.',
    ],
    preferredTerminology: [
      { term: 'customer service', preferred: 'client success team', context: 'When referring to support operations' },
      { term: 'cheap', preferred: 'cost-effective', context: 'When discussing pricing tiers' },
      { term: 'app', preferred: 'enterprise platform', context: 'When describing our core product' },
    ],
    prohibitedTerminology: ['hack-proof', 'fail-proof', '100% guaranteed', 'zero-risk', 'cheapest'],
    updatedBy: adminUser._id,
  });

  console.log('[Seed] Seeding Brand Rules across 9 categories...');
  const rules = await BrandRule.insertMany([
    {
      workspace: workspace._id,
      title: 'Prohibit Absolute Guarantees and Unverifiable Promises',
      description: 'Never promise 100% security, zero-risk, or fail-proof performance. All systems have operational parameters.',
      category: 'Promotional claims',
      severity: 'High',
      preferredWording: 'Engineered for 99.99% high availability and resilient disaster recovery',
      prohibitedPhrases: ['100% guaranteed', 'fail-proof', 'zero-risk', 'unbreakable', 'hack-proof'],
      requiredPhrases: [],
      correctExamples: ['Our architecture offers 99.99% SLA availability.', 'Designed with defense-in-depth security.'],
      incorrectExamples: ['Our cloud is 100% guaranteed hack-proof.', 'A zero-risk infrastructure migration.'],
      sourceReference: 'Legal Compliance Policy §4.2',
      isActive: true,
      createdBy: adminUser._id,
    },
    {
      workspace: workspace._id,
      title: 'Standardize Product Naming: "Apex Cloud Enterprise"',
      description: 'Always refer to the enterprise tier as "Apex Cloud Enterprise". Do not abbreviate as "ACE" or "Apex Ent".',
      category: 'Product naming',
      severity: 'High',
      preferredWording: 'Apex Cloud Enterprise',
      prohibitedPhrases: ['ACE platform', 'Apex Ent', 'Apex App'],
      requiredPhrases: [],
      correctExamples: ['Deploy with Apex Cloud Enterprise in minutes.'],
      incorrectExamples: ['Download the ACE platform today.', 'Use Apex Ent for clusters.'],
      sourceReference: 'Brand Architecture Guide v3.1',
      isActive: true,
      createdBy: adminUser._id,
    },
    {
      workspace: workspace._id,
      title: 'Preferred Customer Support Terminology',
      description: 'Refer to support representatives as "Client Success Team", never "Helpdesk" or "Customer Care reps".',
      category: 'Terminology',
      severity: 'Medium',
      preferredWording: 'Client Success Team',
      prohibitedPhrases: ['helpdesk', 'customer care rep', 'support reps'],
      requiredPhrases: [],
      correctExamples: ['Contact our dedicated Client Success Team anytime.'],
      incorrectExamples: ['Call our helpdesk for assistance.'],
      sourceReference: 'Voice & Tone Guidelines p. 14',
      isActive: true,
      createdBy: reviewerUser._id,
    },
    {
      workspace: workspace._id,
      title: 'Mandatory Trademark Disclaimer for External Releases',
      description: 'External press releases and product landing pages must feature the trademark attribution phrase.',
      category: 'Required disclaimers',
      severity: 'Medium',
      preferredWording: 'Apex Cloud and the Apex shield emblem are registered trademarks.',
      prohibitedPhrases: [],
      requiredPhrases: ['registered trademark'],
      correctExamples: ['Apex Cloud is a registered trademark of Apex Solutions, Inc.'],
      incorrectExamples: ['Content missing trademark notification block.'],
      sourceReference: 'Intellectual Property Policy §1.1',
      isActive: true,
      createdBy: adminUser._id,
    },
    {
      workspace: workspace._id,
      title: 'Accessible Call-To-Action Phrasing (WCAG 2.1)',
      description: 'Avoid vague links such as "click here" or "learn more". Anchor text must describe the destination.',
      category: 'Accessibility',
      severity: 'Low',
      preferredWording: 'Explore our architectural whitepaper',
      prohibitedPhrases: ['click here', 'click this link'],
      requiredPhrases: [],
      correctExamples: ['Review our compliance certification overview.'],
      incorrectExamples: ['To see certifications, click here.'],
      sourceReference: 'Digital Accessibility Standards (WCAG AA)',
      isActive: true,
      createdBy: reviewerUser._id,
    },
    {
      workspace: workspace._id,
      title: 'Professional Technical Tone - Avoid Aggressive Shouting',
      description: 'Do not use excessive exclamation marks or all-caps capitalization for marketing emphasis.',
      category: 'Tone of voice',
      severity: 'Low',
      preferredWording: 'Standard sentence casing with confident clarity.',
      prohibitedPhrases: [],
      requiredPhrases: [],
      correctExamples: ['Transform your cloud posture effortlessly.'],
      incorrectExamples: ['ACT NOW FOR MASSIVE SAVINGS!!!'],
      sourceReference: 'Editorial Style Manual §2',
      isActive: true,
      createdBy: reviewerUser._id,
    },
  ]);

  console.log('[Seed] Seeding Approved Facts...');
  const facts = await ApprovedFact.insertMany([
    {
      workspace: workspace._id,
      factText: 'Apex Cloud processes over 4.8 billion transactions daily with sub-millisecond p99 latency.',
      category: 'Performance Benchmarks',
      sourceName: 'Q3 Independent Audit Report',
      sourceUrl: 'https://benchmark.example.com/q3-audit',
      verificationDate: new Date('2026-08-15'),
      expiryDate: new Date('2027-08-15'),
      ownerRole: 'Chief Technology Officer',
      status: 'active',
      notes: 'Audited benchmark across US-East and EU-West multi-region deployments.',
      createdBy: adminUser._id,
    },
    {
      workspace: workspace._id,
      factText: 'Apex Cloud delivers 99.99% service uptime backed by a financially supported SLA.',
      category: 'Service Level Agreement',
      sourceName: 'Master Enterprise SLA v4.0',
      sourceUrl: 'https://docs.example.com/sla',
      verificationDate: new Date('2026-01-10'),
      expiryDate: new Date('2027-01-10'),
      ownerRole: 'Director of Infrastructure',
      status: 'active',
      notes: 'Standard contract terms for all tier 1 clients.',
      createdBy: adminUser._id,
    },
    {
      workspace: workspace._id,
      factText: 'Over 1,200 enterprise organizations use Apex Cloud solutions worldwide.',
      category: 'Customer Traction',
      sourceName: '2025 Annual Financial Report',
      sourceUrl: 'https://ir.example.com/2025-annual-filing',
      verificationDate: new Date('2025-03-01'),
      expiryDate: new Date('2026-03-01'), // Expired fact for testing verification engine!
      ownerRole: 'Investor Relations',
      status: 'expired',
      notes: 'Customer count is outdated and requires refresh from Q3 2026 census.',
      createdBy: reviewerUser._id,
    },
  ]);

  console.log('[Seed] Seeding Brand Assets...');
  await BrandAsset.insertMany([
    {
      workspace: workspace._id,
      name: 'Primary Shield Emblem & Wordmark (SVG)',
      category: 'Logos',
      description: 'Official corporate logo for light backgrounds with royal blue shield.',
      fileUrl: '/uploads/sample_logo.svg',
      fileName: 'sample_logo.svg',
      fileType: 'image/svg+xml',
      fileSize: 4200,
      approvalStatus: 'Approved',
      usageNotes: 'Maintain minimum padding equal to 50% of the shield height on all four sides.',
      tags: ['logo', 'primary', 'vector'],
      uploadedBy: adminUser._id,
    },
    {
      workspace: workspace._id,
      name: 'Cloud Infrastructure Architecture Banner',
      category: 'Approved banners',
      description: 'Modern indigo gradient banner for blog articles and technical briefs.',
      fileUrl: '/uploads/sample_banner.png',
      fileName: 'sample_banner.png',
      fileType: 'image/png',
      fileSize: 184000,
      approvalStatus: 'Approved',
      usageNotes: 'Approved for social headers and newsletter top banners.',
      tags: ['banner', 'social', 'dark-theme'],
      uploadedBy: reviewerUser._id,
    },
  ]);

  console.log('[Seed] Seeding Content Drafts, Review Runs, and Findings...');
  // Draft 1: A draft with deliberate brand violations for demonstration
  const sampleContentViolations = `Introducing the new ACE platform for high-scale enterprise workloads!

Our cloud architecture is 100% guaranteed to be hack-proof, with zero-risk migration for any legacy cluster. If your engineers experience any difficulties, they can simply contact our helpdesk.

To explore all architecture diagrams and benchmarks, click here. Over 1,200 enterprise organizations use Apex Cloud solutions worldwide.`;

  const draft1 = await ContentDraft.create({
    workspace: workspace._id,
    title: 'Q4 Product Launch Announcement & Architecture Overview',
    contentType: 'Website copy',
    currentContent: sampleContentViolations,
    originalContent: sampleContentViolations,
    currentVersion: 1,
    status: 'In Review',
    author: creatorUser._id,
    lastReviewedAt: new Date(),
  });

  await ContentVersion.create({
    draft: draft1._id,
    versionNumber: 1,
    title: draft1.title,
    content: draft1.currentContent,
    changeSummary: 'Initial marketing copy draft submitted for brand review.',
    createdBy: creatorUser._id,
  });

  // Create review run for Draft 1
  const reviewRun1 = await ReviewRun.create({
    workspace: workspace._id,
    draft: draft1._id,
    versionNumber: 1,
    contentSnapshot: draft1.currentContent,
    complianceScore: 58,
    scoreGrade: 'Needs Revision',
    findingsSummary: { high: 2, medium: 2, low: 1, total: 5 },
    rulesCheckedCount: rules.length,
    factsCheckedCount: facts.length,
    engineType: 'deterministic',
    aiProvider: 'none',
    runBy: creatorUser._id,
  });

  draft1.latestReviewRun = reviewRun1._id;
  draft1.latestComplianceScore = 58;
  await draft1.save();

  // Create real findings tied to database records
  await Finding.insertMany([
    {
      reviewRun: reviewRun1._id,
      draft: draft1._id,
      workspace: workspace._id,
      category: 'Product naming',
      severity: 'High',
      textSpan: 'ACE platform',
      startIndex: 20,
      endIndex: 32,
      explanation: 'Found prohibited abbreviation "ACE platform". Always use the official product name.',
      suggestedCorrection: 'Apex Cloud Enterprise',
      ruleRef: rules[1]._id,
      ruleTitle: rules[1].title,
      claimStatus: 'Potentially inconsistent',
      detectedBy: 'deterministic',
      confidenceScore: 100,
      status: 'open',
    },
    {
      reviewRun: reviewRun1._id,
      draft: draft1._id,
      workspace: workspace._id,
      category: 'Promotional claims',
      severity: 'High',
      textSpan: '100% guaranteed to be hack-proof',
      startIndex: 96,
      endIndex: 128,
      explanation: 'Absolute guarantee claims create legal liability and violate risk management standards.',
      suggestedCorrection: 'engineered with defense-in-depth isolation',
      ruleRef: rules[0]._id,
      ruleTitle: rules[0].title,
      claimStatus: 'Potentially inconsistent',
      detectedBy: 'deterministic',
      confidenceScore: 100,
      status: 'open',
    },
    {
      reviewRun: reviewRun1._id,
      draft: draft1._id,
      workspace: workspace._id,
      category: 'Terminology',
      severity: 'Medium',
      textSpan: 'helpdesk',
      startIndex: 236,
      endIndex: 244,
      explanation: 'Prohibited terminology. Refer to our customer support as the Client Success Team.',
      suggestedCorrection: 'Client Success Team',
      ruleRef: rules[2]._id,
      ruleTitle: rules[2].title,
      claimStatus: 'Potentially inconsistent',
      detectedBy: 'deterministic',
      confidenceScore: 100,
      status: 'open',
    },
    {
      reviewRun: reviewRun1._id,
      draft: draft1._id,
      workspace: workspace._id,
      category: 'Approved facts',
      severity: 'Medium',
      textSpan: 'Over 1,200 enterprise organizations use Apex Cloud solutions worldwide.',
      startIndex: 328,
      endIndex: 399,
      explanation: 'This fact reference is based on expired benchmark data (expired March 2026). Verification is required before publication.',
      suggestedCorrection: 'Verify current client census figures with Investor Relations.',
      factRef: facts[2]._id,
      factSource: facts[2].sourceName,
      claimStatus: 'Needs verification',
      detectedBy: 'deterministic',
      confidenceScore: 90,
      status: 'open',
    },
    {
      reviewRun: reviewRun1._id,
      draft: draft1._id,
      workspace: workspace._id,
      category: 'Accessibility',
      severity: 'Low',
      textSpan: 'click here',
      startIndex: 315,
      endIndex: 325,
      explanation: 'Non-descriptive call-to-action text impairs screen reader navigation (WCAG 2.1).',
      suggestedCorrection: 'Explore our technical architecture whitepaper',
      ruleRef: rules[4]._id,
      ruleTitle: rules[4].title,
      claimStatus: 'Needs verification',
      detectedBy: 'deterministic',
      confidenceScore: 95,
      status: 'open',
    },
  ]);

  // Comments on Draft 1
  await Comment.create({
    draft: draft1._id,
    workspace: workspace._id,
    author: reviewerUser._id,
    content: 'Please adjust the prohibited acronym and update the client statistics with current Q3 audit numbers before final sign-off.',
    type: 'change_request',
  });

  // Draft 2: High scoring, approved social post
  const draft2 = await ContentDraft.create({
    workspace: workspace._id,
    title: 'LinkedIn: Sub-millisecond p99 Latency Benchmark',
    contentType: 'Social media post',
    currentContent: 'Apex Cloud processes over 4.8 billion transactions daily with sub-millisecond p99 latency across multi-region nodes. Discover how our Client Success Team helps Fortune 500 enterprises optimize mission-critical cloud pipelines.\n\nApex Cloud is a registered trademark of Apex Solutions, Inc.',
    originalContent: 'Apex Cloud processes over 4.8 billion transactions daily...',
    currentVersion: 1,
    status: 'Approved',
    author: creatorUser._id,
    reviewer: reviewerUser._id,
    lastReviewedAt: new Date(),
    latestComplianceScore: 98,
  });

  const reviewRun2 = await ReviewRun.create({
    workspace: workspace._id,
    draft: draft2._id,
    versionNumber: 1,
    contentSnapshot: draft2.currentContent,
    complianceScore: 98,
    scoreGrade: 'Excellent',
    findingsSummary: { high: 0, medium: 0, low: 1, total: 1 },
    rulesCheckedCount: rules.length,
    factsCheckedCount: facts.length,
    engineType: 'deterministic',
    aiProvider: 'none',
    runBy: creatorUser._id,
  });

  draft2.latestReviewRun = reviewRun2._id;
  await draft2.save();

  // Audit events
  await AuditEvent.insertMany([
    {
      workspace: workspace._id,
      actor: adminUser._id,
      actorName: adminUser.name,
      action: 'WORKSPACE_INITIALIZED',
      entityType: 'Workspace',
      entityId: workspace._id,
      details: { name: workspace.name },
    },
    {
      workspace: workspace._id,
      actor: creatorUser._id,
      actorName: creatorUser.name,
      action: 'DRAFT_CREATED',
      entityType: 'Draft',
      entityId: draft1._id,
      details: { title: draft1.title },
    },
    {
      workspace: workspace._id,
      actor: creatorUser._id,
      actorName: creatorUser.name,
      action: 'REVIEW_RUN_COMPLETED',
      entityType: 'ReviewRun',
      entityId: reviewRun1._id,
      details: { score: 58, grade: 'Needs Revision' },
    },
  ]);

  console.log('[Seed] Database successfully seeded!');
  console.log('----------------------------------------------------');
  console.log('DEMO CREDENTIALS:');
  console.log('1. Admin:    admin@inkguard.demo    / Password123!');
  console.log('2. Reviewer: reviewer@inkguard.demo / Password123!');
  console.log('3. Creator:  creator@inkguard.demo  / Password123!');
  console.log('----------------------------------------------------');
  process.exit(0);
}

seed().catch((err) => {
  console.error('[Seed] Error during seeding:', err);
  process.exit(1);
});
