import { z } from 'zod';

const MAX_HISTORY_MESSAGES = 12;
const MAX_MESSAGE_LENGTH = 1000;

export const ClientMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().trim().min(1).max(MAX_MESSAGE_LENGTH),
});

export const AssistantRequestSchema = z.object({
  message: z.string().trim().min(1, 'Message cannot be empty').max(MAX_MESSAGE_LENGTH),
  conversationHistory: z.array(ClientMessageSchema).max(30).optional().default([]),
  language: z.string().min(2).max(10).default('en-IN'),
  sessionId: z.string().max(100).optional(),
});

export type ValidatedAssistantRequest = z.infer<typeof AssistantRequestSchema>;

export class ConversationService {
  /**
   * Sanitizes, truncates, and formats conversation history for model consumption.
   */
  static prepareContext(
    history: Array<{ role: 'user' | 'assistant'; content: string }>,
    currentMessage: string
  ): Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> {
    // Keep only the most recent N messages to avoid token overflow
    const recentHistory = history.slice(-MAX_HISTORY_MESSAGES);

    const formatted = recentHistory.map((msg) => ({
      role: msg.role === 'assistant' ? ('model' as const) : ('user' as const),
      parts: [{ text: msg.content.substring(0, MAX_MESSAGE_LENGTH) }],
    }));

    // Ensure the current user message is appended
    formatted.push({
      role: 'user' as const,
      parts: [{ text: currentMessage.substring(0, MAX_MESSAGE_LENGTH) }],
    });

    return formatted;
  }
}
