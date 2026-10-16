import { z } from 'zod';

export interface ToolDefinition<TParams = any, TResult = any> {
  name: string;
  description: string;
  parameters: z.ZodType<any, any, any>;
  jsonSchema: Record<string, unknown>;
  requiresConfirmation: boolean;
  execute: (args: TParams, context: ToolExecutionContext) => Promise<ToolExecutionResult<TResult>>;
}

export interface ToolExecutionContext {
  userId?: string;
  sessionId?: string;
  language: string;
}

export interface ToolExecutionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  requiresConfirmation?: boolean;
  pendingAction?: PendingActionData;
}

export interface PendingActionData {
  actionId: string;
  toolName: string;
  parameters: Record<string, unknown>;
  summary: string;
  expiresAt: number; // Unix timestamp ms
  idempotencyKey: string;
}
