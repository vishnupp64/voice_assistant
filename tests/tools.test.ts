import { describe, it, expect, beforeEach } from 'vitest';
import { ToolRegistry } from '@/tools/registry';
import {
  SearchKnowledgeSchema,
  GetServicesSchema,
  CheckAvailabilitySchema,
  CreateBookingSchema,
} from '@/tools/schemas';
import { ActionService } from '@/services/action-service';

describe('Tool Registry & 9-Step Secure Pipeline', () => {
  beforeEach(() => {
    ActionService.resetForTesting();
  });

  it('validates tool arguments with Zod schemas correctly', () => {
    // Valid inputs
    expect(SearchKnowledgeSchema.safeParse({ query: 'hours' }).success).toBe(true);
    expect(GetServicesSchema.safeParse({ category: 'health', maxPrice: 1000 }).success).toBe(true);
    expect(CheckAvailabilitySchema.safeParse({ serviceId: 'srv_1', date: '2026-10-20' }).success).toBe(true);
    expect(
      CreateBookingSchema.safeParse({
        serviceId: 'srv_1',
        customerName: 'Rahul Sharma',
        customerPhone: '9876543210',
        date: '2026-10-20',
        timeSlot: '10:00 AM',
      }).success
    ).toBe(true);

    // Invalid inputs
    expect(SearchKnowledgeSchema.safeParse({ query: '' }).success).toBe(false);
    expect(CheckAvailabilitySchema.safeParse({ serviceId: 'srv_1', date: 'invalid-date' }).success).toBe(false);
    expect(CreateBookingSchema.safeParse({ serviceId: 'srv_1', customerName: 'A' }).success).toBe(false);
  });

  it('rejects unauthorized or unregistered tool calls', async () => {
    const result = await ToolRegistry.executeToolCall(
      'unauthorizedSystemCommand',
      { command: 'rm -rf /' },
      { userId: 'test_user', language: 'en-IN' }
    );

    expect(result.success).toBe(false);
    expect(result.error).toContain('not registered or permitted');
  });

  it('executes searchKnowledge and returns real grounded clinic facts', async () => {
    const result = await ToolRegistry.executeToolCall(
      'searchKnowledge',
      { query: 'operating hours timing' },
      { userId: 'test_user', language: 'en-IN' }
    );

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    const articles = (result.data as any).articles;
    expect(articles.length).toBeGreaterThan(0);
    expect(articles[0].content).toContain('Monday to Saturday');
  });

  it('executes getServices and filters by category', async () => {
    const result = await ToolRegistry.executeToolCall(
      'getServices',
      { category: 'health' },
      { userId: 'test_user', language: 'en-IN' }
    );

    expect(result.success).toBe(true);
    const services = (result.data as any).services;
    expect(services.every((s: any) => s.category === 'health')).toBe(true);
  });

  it('enforces consequential confirmation workflow on createBooking', async () => {
    const result = await ToolRegistry.executeToolCall(
      'createBooking',
      {
        serviceId: 'srv_1',
        customerName: 'Anita Menon',
        customerPhone: '9876543210',
        date: '2026-10-25',
        timeSlot: '11:00 AM',
      },
      { userId: 'test_user', language: 'ml-IN' }
    );

    expect(result.success).toBe(true);
    expect(result.requiresConfirmation).toBe(true);
    expect(result.pendingAction).toBeDefined();
    expect(result.pendingAction?.toolName).toBe('createBooking');
    expect(result.pendingAction?.idempotencyKey).toBeDefined();
    expect(result.pendingAction?.expiresAt).toBeGreaterThan(Date.now());
  });
});
