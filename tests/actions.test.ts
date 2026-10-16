import { describe, it, expect, beforeEach } from 'vitest';
import { ActionService } from '@/services/action-service';
import { clearAuditLogsForTesting, getAuditLogs } from '@/lib/audit';

describe('ActionService & Consequential Confirmation Workflow', () => {
  beforeEach(() => {
    ActionService.resetForTesting();
    clearAuditLogsForTesting();
  });

  it('generates a pending action with a secure token and TTL', () => {
    const pending = ActionService.createPendingAction(
      'createBooking',
      { serviceId: 'srv_1', customerName: 'Deepak Kumar', customerPhone: '9876543210', date: '2026-10-21', timeSlot: '10:00 AM' },
      'Book General Health Checkup on 2026-10-21 at 10:00 AM for Deepak Kumar',
      'user_123'
    );

    expect(pending.actionId).toBeDefined();
    expect(pending.idempotencyKey).toBeDefined();
    expect(pending.expiresAt).toBeGreaterThan(Date.now());

    const logs = getAuditLogs();
    expect(logs.some((l) => l.eventType === 'ACTION_PENDING')).toBe(true);
  });

  it('successfully confirms and executes an action with valid credentials', async () => {
    const pending = ActionService.createPendingAction(
      'createBooking',
      { serviceId: 'srv_1', customerName: 'Deepak Kumar', customerPhone: '9876543210', date: '2026-10-21', timeSlot: '10:00 AM' },
      'Book General Health Checkup on 2026-10-21 at 10:00 AM for Deepak Kumar',
      'user_123'
    );

    const outcome = await ActionService.confirmAction(pending.actionId, pending.idempotencyKey, 'user_123');
    expect(outcome.success).toBe(true);
    expect(outcome.result).toBeDefined();
    expect((outcome.result as any).bookingId).toBeDefined();
    expect((outcome.result as any).status).toBe('confirmed');

    const logs = getAuditLogs();
    expect(logs.some((l) => l.eventType === 'ACTION_CONFIRMED')).toBe(true);
  });

  it('prevents replay attacks and duplicate execution via idempotency controls', async () => {
    const pending = ActionService.createPendingAction(
      'createBooking',
      { serviceId: 'srv_1', customerName: 'Deepak Kumar', customerPhone: '9876543210', date: '2026-10-21', timeSlot: '10:00 AM' },
      'Book General Health Checkup',
      'user_123'
    );

    // First execution
    const firstAttempt = await ActionService.confirmAction(pending.actionId, pending.idempotencyKey, 'user_123');
    expect(firstAttempt.success).toBe(true);

    // Duplicate replay attempt with same key
    const duplicateAttempt = await ActionService.confirmAction(pending.actionId, pending.idempotencyKey, 'user_123');
    expect(duplicateAttempt.success).toBe(true);
    expect(duplicateAttempt.message).toContain('already confirmed');
    // Result matches cached result without re-inserting booking
    expect(duplicateAttempt.result).toEqual(firstAttempt.result);
  });

  it('rejects confirmation if idempotency key is tampered or mismatched', async () => {
    const pending = ActionService.createPendingAction(
      'createBooking',
      { serviceId: 'srv_1' },
      'Book appointment',
      'user_123'
    );

    const outcome = await ActionService.confirmAction(pending.actionId, 'wrong_tampered_key', 'user_123');
    expect(outcome.success).toBe(false);
    expect(outcome.error).toContain('Security violation');

    const logs = getAuditLogs();
    expect(logs.some((l) => l.eventType === 'SECURITY_VIOLATION')).toBe(true);
  });

  it('safely rejects action when user cancels', () => {
    const pending = ActionService.createPendingAction(
      'createBooking',
      { serviceId: 'srv_1' },
      'Book appointment',
      'user_123'
    );

    const result = ActionService.rejectAction(pending.actionId, 'user_123');
    expect(result.success).toBe(true);
    expect(result.message).toContain('cancelled');

    const stored = ActionService.getPendingAction(pending.actionId);
    expect(stored?.status).toBe('rejected');
  });
});
