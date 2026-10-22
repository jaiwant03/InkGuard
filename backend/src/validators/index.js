import { z } from 'zod';
import { RULE_CATEGORIES, RULE_SEVERITIES } from '../models/BrandRule.js';
import { CONTENT_TYPES } from '../models/ContentDraft.js';

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().email('Please enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string(),
    workspaceName: z.string().min(2, 'Workspace name must be at least 2 characters').optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional().default(false),
});

export const brandRuleSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  category: z.enum(RULE_CATEGORIES),
  severity: z.enum(RULE_SEVERITIES).default('Medium'),
  preferredWording: z.string().optional().default(''),
  prohibitedPhrases: z.array(z.string()).optional().default([]),
  requiredPhrases: z.array(z.string()).optional().default([]),
  correctExamples: z.array(z.string()).optional().default([]),
  incorrectExamples: z.array(z.string()).optional().default([]),
  sourceReference: z.string().optional().default(''),
  isActive: z.boolean().optional().default(true),
});

export const approvedFactSchema = z.object({
  factText: z.string().min(5, 'Fact text must be at least 5 characters'),
  category: z.string().default('Product Capabilities'),
  sourceName: z.string().min(2, 'Source name is required'),
  sourceUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  verificationDate: z.string().datetime().optional().or(z.date()).optional(),
  expiryDate: z.string().datetime().optional().nullable().or(z.date()).optional().nullable(),
  ownerRole: z.string().optional().default('Product Marketing Lead'),
  status: z.enum(['active', 'expired', 'archived']).default('active'),
  notes: z.string().optional().default(''),
});

export const contentDraftSchema = z.object({
  title: z.string().min(2, 'Title is required').max(200),
  contentType: z.enum(CONTENT_TYPES).default('General marketing text'),
  content: z.string().min(5, 'Content must be at least 5 characters'),
});

export const findingActionSchema = z.object({
  action: z.enum(['apply', 'dismiss', 'resolve', 'verify']),
  dismissReason: z.string().optional().default(''),
});

export const approvalActionSchema = z.object({
  decision: z.enum(['approve', 'request_changes', 'reject']),
  comment: z.string().optional().default(''),
});

export const commentSchema = z.object({
  content: z.string().min(1, 'Comment text cannot be empty'),
  type: z.enum(['general', 'change_request', 'approval_note', 'rejection_note']).default('general'),
  findingRef: z.string().optional().nullable(),
});
