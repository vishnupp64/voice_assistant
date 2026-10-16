import { PendingActionData } from '@/types/tools';
import { recordAuditEvent } from '@/lib/audit';
import { BOOKINGS_STORE, SERVICES_STORE, BookingRecord } from '@/tools/data-store';

export interface StoredPendingAction {
  actionId: string;
  toolName: string;
  parameters: Record<string, unknown>;
  summary: string;
  createdAt: number;
  expiresAt: number;
  idempotencyKey: string;
  userId?: string;
  status: 'pending' | 'confirmed' | 'rejected' | 'expired';
  executedResult?: unknown;
}

const pendingActionsMap = new Map<string, StoredPendingAction>();
const processedIdempotencyKeys = new Set<string>();

const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes

export class ActionService {
  /**
   * Registers a pending consequential action requiring explicit user confirmation.
   */
  static createPendingAction(
    toolName: string,
    parameters: Record<string, unknown>,
    summary: string,
    userId?: string
  ): PendingActionData {
    const actionId = `act_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const idempotencyKey = `idemp_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    const ttlMs = Number(process.env.ACTION_CONFIRMATION_TTL_MS) || DEFAULT_TTL_MS;
    const expiresAt = Date.now() + ttlMs;

    const stored: StoredPendingAction = {
      actionId,
      toolName,
      parameters,
      summary,
      createdAt: Date.now(),
      expiresAt,
      idempotencyKey,
      userId,
      status: 'pending',
    };

    pendingActionsMap.set(actionId, stored);

    recordAuditEvent('ACTION_PENDING', {
      toolName,
      userId,
      details: {
        actionId,
        summary,
        expiresAt,
      },
    });

    return {
      actionId,
      toolName,
      parameters,
      summary,
      expiresAt,
      idempotencyKey,
    };
  }

  /**
   * Validates and executes an approved pending action.
   */
  static async confirmAction(
    actionId: string,
    idempotencyKey: string,
    userId?: string
  ): Promise<{ success: boolean; message: string; result?: unknown; error?: string }> {
    const action = pendingActionsMap.get(actionId);

    if (!action) {
      return {
        success: false,
        error: 'Pending action not found or already processed.',
        message: 'Invalid or missing action ID.',
      };
    }

    // Verify idempotency
    if (processedIdempotencyKeys.has(idempotencyKey) || action.status === 'confirmed') {
      return {
        success: true,
        message: 'Action was already confirmed and processed.',
        result: action.executedResult,
      };
    }

    // Verify token binding
    if (action.idempotencyKey !== idempotencyKey) {
      recordAuditEvent('SECURITY_VIOLATION', {
        toolName: action.toolName,
        userId,
        details: { actionId, reason: 'Idempotency key mismatch' },
      });
      return {
        success: false,
        error: 'Security violation: Idempotency token mismatch.',
        message: 'Action confirmation token is invalid.',
      };
    }

    // Check expiration
    if (Date.now() > action.expiresAt) {
      action.status = 'expired';
      recordAuditEvent('ACTION_REJECTED', {
        toolName: action.toolName,
        userId,
        details: { actionId, reason: 'Action expired' },
      });
      return {
        success: false,
        error: 'Action expired. Please initiate the request again.',
        message: 'The confirmation window timed out.',
      };
    }

    // Execute actual business action
    try {
      const result = await this.executeAction(action.toolName, action.parameters);
      action.status = 'confirmed';
      action.executedResult = result;
      processedIdempotencyKeys.add(idempotencyKey);

      recordAuditEvent('ACTION_CONFIRMED', {
        toolName: action.toolName,
        userId,
        details: { actionId, result },
      });

      return {
        success: true,
        message: `Successfully executed: ${action.summary}`,
        result,
      };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown execution failure';
      return {
        success: false,
        error: errorMessage,
        message: 'Failed to execute confirmed action.',
      };
    }
  }

  /**
   * User rejected or cancelled the pending action.
   */
  static rejectAction(actionId: string, userId?: string): { success: boolean; message: string } {
    const action = pendingActionsMap.get(actionId);
    if (action) {
      action.status = 'rejected';
      recordAuditEvent('ACTION_REJECTED', {
        toolName: action.toolName,
        userId,
        details: { actionId, reason: 'User cancelled' },
      });
    }
    return {
      success: true,
      message: 'Action has been safely cancelled.',
    };
  }

  /**
   * Internal execution of confirmed actions.
   */
  private static async executeAction(
    toolName: string,
    parameters: Record<string, unknown>
  ): Promise<unknown> {
    if (toolName === 'createBooking') {
      const { serviceId, customerName, customerPhone, date, timeSlot, notes } = parameters as {
        serviceId: string;
        customerName: string;
        customerPhone: string;
        date: string;
        timeSlot: string;
        notes?: string;
      };

      const service = SERVICES_STORE.find((s) => s.id === serviceId);
      const serviceName = service ? service.name : serviceId;

      const newBooking: BookingRecord = {
        bookingId: `bk_${Date.now().toString(36).toUpperCase()}`,
        serviceId,
        serviceName,
        customerName,
        customerPhone,
        date,
        timeSlot,
        notes,
        status: 'confirmed',
        createdAt: Date.now(),
      };

      BOOKINGS_STORE.push(newBooking);

      return {
        bookingId: newBooking.bookingId,
        serviceName,
        date,
        timeSlot,
        customerName,
        status: 'confirmed',
        receiptNote: `Appointment confirmed with ${serviceName} on ${date} at ${timeSlot}. An SMS confirmation has been queued for ${customerPhone}.`,
      };
    }

    throw new Error(`Execution handler for tool '${toolName}' is not defined.`);
  }

  static getPendingAction(actionId: string): StoredPendingAction | undefined {
    return pendingActionsMap.get(actionId);
  }

  static resetForTesting(): void {
    pendingActionsMap.clear();
    processedIdempotencyKeys.clear();
  }
}
