import { PendingActionData } from './tools';
export type { AssistantState } from './speech';

export type Role = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
  language?: string;
  toolCalls?: Array<{
    name: string;
    args: Record<string, unknown>;
  }>;
  toolResults?: Array<{
    name: string;
    result: unknown;
  }>;
  pendingAction?: PendingActionData;
}

export interface AssistantRequestPayload {
  message: string;
  conversationHistory: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  language: string;
  sessionId?: string;
}

export interface AssistantResponsePayload {
  message: string;
  language: string;
  detectedLanguage?: string;
  toolExecutions?: Array<{
    toolName: string;
    success: boolean;
    data?: unknown;
    error?: string;
  }>;
  pendingAction?: PendingActionData;
  error?: string;
}

export interface ActionConfirmationRequest {
  actionId: string;
  idempotencyKey: string;
  confirmed: boolean;
}

export interface ActionConfirmationResponse {
  success: boolean;
  message: string;
  actionId: string;
  result?: unknown;
  error?: string;
}
