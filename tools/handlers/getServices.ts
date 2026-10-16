import { SERVICES_STORE } from '../data-store';
import { GetServicesInput } from '../schemas';
import { ToolExecutionContext, ToolExecutionResult } from '@/types/tools';

export async function handleGetServices(
  input: GetServicesInput,
  _context: ToolExecutionContext
): Promise<ToolExecutionResult> {
  let services = [...SERVICES_STORE];

  if (input.category && input.category !== 'all') {
    services = services.filter((s) => s.category === input.category);
  }

  if (typeof input.maxPrice === 'number') {
    services = services.filter((s) => s.price <= input.maxPrice!);
  }

  return {
    success: true,
    data: {
      count: services.length,
      services: services.map((s) => ({
        id: s.id,
        name: s.name,
        category: s.category,
        priceFormatted: `₹${s.price}`,
        duration: `${s.durationMinutes} mins`,
        description: s.description,
      })),
    },
  };
}
