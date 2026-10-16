import { describe, it, expect } from 'vitest';
import { ConversationService, AssistantRequestSchema } from '@/services/conversation';

describe('Conversation Service & Request Schemas', () => {
  it('validates AssistantRequestSchema accurately', () => {
    const valid = {
      message: 'Hello, what services are available?',
      conversationHistory: [{ role: 'user' as const, content: 'Hi' }],
      language: 'en-IN',
    };
    expect(AssistantRequestSchema.safeParse(valid).success).toBe(true);

    const empty = {
      message: '   ',
      language: 'en-IN',
    };
    expect(AssistantRequestSchema.safeParse(empty).success).toBe(false);
  });

  it('limits history to the maximum configured messages to avoid token blowup', () => {
    const longHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [];
    for (let i = 0; i < 20; i++) {
      longHistory.push({
        role: i % 2 === 0 ? 'user' : 'assistant',
        content: `Message ${i}`,
      });
    }

    const prepared = ConversationService.prepareContext(longHistory, 'Latest prompt');
    // Prepared context has max 12 recent history items + 1 current message = 13
    expect(prepared.length).toBeLessThanOrEqual(13);
    expect(prepared[prepared.length - 1].parts[0].text).toBe('Latest prompt');
  });
});
