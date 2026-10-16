import { z } from 'zod';

export const SearchKnowledgeSchema = z.object({
  query: z.string().min(2, 'Query must be at least 2 characters long').max(100),
  category: z.enum(['operations', 'policies', 'billing', 'support', 'all']).optional().default('all'),
  limit: z.number().int().min(1).max(5).optional().default(3),
});

export const GetServicesSchema = z.object({
  category: z.enum(['health', 'wellness', 'consulting', 'all']).optional().default('all'),
  maxPrice: z.number().positive().optional(),
});

export const CheckAvailabilitySchema = z.object({
  serviceId: z.string().min(1, 'Service ID is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
});

export const CreateBookingSchema = z.object({
  serviceId: z.string().min(1, 'Service ID is required'),
  customerName: z.string().min(2, 'Customer name must have at least 2 characters').max(50),
  customerPhone: z.string().min(8, 'Phone number must have at least 8 digits').max(15),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  timeSlot: z.string().min(2, 'Time slot is required, e.g., 10:00 AM'),
  notes: z.string().max(200).optional(),
});

export type SearchKnowledgeInput = z.infer<typeof SearchKnowledgeSchema>;
export type GetServicesInput = z.infer<typeof GetServicesSchema>;
export type CheckAvailabilityInput = z.infer<typeof CheckAvailabilitySchema>;
export type CreateBookingInput = z.infer<typeof CreateBookingSchema>;

// Tool schemas in Gemini Function Declaration format
export const GEMINI_TOOL_DECLARATIONS = [
  {
    name: 'searchKnowledge',
    description: 'Search clinic FAQs, operating hours, addresses, insurance, policies, and guidelines.',
    parameters: {
      type: 'OBJECT',
      properties: {
        query: {
          type: 'STRING',
          description: 'Search terms or question about the clinic policies, hours, or facilities.',
        },
        category: {
          type: 'STRING',
          description: 'Optional category filter: operations, policies, billing, support, or all.',
        },
        limit: {
          type: 'INTEGER',
          description: 'Maximum number of results to return (1-5).',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'getServices',
    description: 'Retrieve the list of offered medical, wellness, and consulting services with prices and durations.',
    parameters: {
      type: 'OBJECT',
      properties: {
        category: {
          type: 'STRING',
          description: 'Category of service: health, wellness, consulting, or all.',
        },
        maxPrice: {
          type: 'NUMBER',
          description: 'Filter services costing less than or equal to this amount.',
        },
      },
    },
  },
  {
    name: 'checkAvailability',
    description: 'Check available time slots for a specific service on a particular date.',
    parameters: {
      type: 'OBJECT',
      properties: {
        serviceId: {
          type: 'STRING',
          description: 'The unique service ID (e.g. srv_1, srv_2).',
        },
        date: {
          type: 'STRING',
          description: 'The target date in YYYY-MM-DD format.',
        },
      },
      required: ['serviceId', 'date'],
    },
  },
  {
    name: 'createBooking',
    description: 'Initiate an appointment booking. NOTE: This is a consequential action that REQUIRES user confirmation before execution.',
    parameters: {
      type: 'OBJECT',
      properties: {
        serviceId: {
          type: 'STRING',
          description: 'The ID of the service to book (e.g. srv_1).',
        },
        customerName: {
          type: 'STRING',
          description: 'Full name of the customer/patient.',
        },
        customerPhone: {
          type: 'STRING',
          description: 'Contact phone number of the customer.',
        },
        date: {
          type: 'STRING',
          description: 'The date for the appointment in YYYY-MM-DD format.',
        },
        timeSlot: {
          type: 'STRING',
          description: 'The desired time slot, e.g. 10:00 AM.',
        },
        notes: {
          type: 'STRING',
          description: 'Any additional symptoms or preferences.',
        },
      },
      required: ['serviceId', 'customerName', 'customerPhone', 'date', 'timeSlot'],
    },
  },
];
