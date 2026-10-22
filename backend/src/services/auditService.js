import { AuditEvent } from '../models/AuditEvent.js';

export async function logAuditEvent({ workspaceId, actor, action, entityType, entityId, details = {}, req = null }) {
  try {
    const ipAddress = req ? req.ip || req.headers['x-forwarded-for'] || '' : '';
    const actorName = actor ? actor.name || 'System' : 'System';

    await AuditEvent.create({
      workspace: workspaceId,
      actor: actor?._id || actor,
      actorName,
      action,
      entityType,
      entityId: String(entityId),
      details,
      ipAddress,
    });
  } catch (err) {
    // Non-blocking log failure
    console.error('[AuditService] Failed to record audit event:', err.message);
  }
}
