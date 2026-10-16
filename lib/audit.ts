export interface AuditEvent {
  id: string;
  timestamp: number;
  eventType: 'TOOL_EXECUTION' | 'ACTION_PENDING' | 'ACTION_CONFIRMED' | 'ACTION_REJECTED' | 'RATE_LIMITED' | 'SECURITY_VIOLATION';
  toolName?: string;
  userId?: string;
  sessionId?: string;
  details: Record<string, unknown>;
}

const auditLogStore: AuditEvent[] = [];
const MAX_AUDIT_LOGS = 1000;

/**
 * Sanitizes input data to strip sensitive values (passwords, tokens, API keys, full credit cards).
 */
function sanitizeDetails(details: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  const sensitiveKeys = ['password', 'secret', 'token', 'apikey', 'api_key', 'authorization', 'card', 'cvv'];

  for (const [key, value] of Object.entries(details)) {
    const isSensitive = sensitiveKeys.some((s) => key.toLowerCase().includes(s));
    if (isSensitive) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeDetails(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

export function recordAuditEvent(
  eventType: AuditEvent['eventType'],
  data: {
    toolName?: string;
    userId?: string;
    sessionId?: string;
    details?: Record<string, unknown>;
  }
): AuditEvent {
  const event: AuditEvent = {
    id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    timestamp: Date.now(),
    eventType,
    toolName: data.toolName,
    userId: data.userId || 'anonymous',
    sessionId: data.sessionId,
    details: sanitizeDetails(data.details || {}),
  };

  auditLogStore.unshift(event);
  if (auditLogStore.length > MAX_AUDIT_LOGS) {
    auditLogStore.pop();
  }

  // Safe structured log output in development / server log
  if (process.env.NODE_ENV !== 'test') {
    console.log(`[AUDIT ${new Date(event.timestamp).toISOString()}] ${event.eventType} - ${event.toolName || ''}`);
  }

  return event;
}

export function getAuditLogs(limit: number = 50): AuditEvent[] {
  return auditLogStore.slice(0, limit);
}

export function clearAuditLogsForTesting(): void {
  auditLogStore.length = 0;
}
