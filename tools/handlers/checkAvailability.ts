import { AVAILABILITY_STORE, SERVICES_STORE } from '../data-store';
import { CheckAvailabilityInput } from '../schemas';
import { ToolExecutionContext, ToolExecutionResult } from '@/types/tools';

export async function handleCheckAvailability(
  input: CheckAvailabilityInput,
  _context: ToolExecutionContext
): Promise<ToolExecutionResult> {
  const service = SERVICES_STORE.find((s) => s.id === input.serviceId);
  if (!service) {
    return {
      success: false,
      error: `Service with ID '${input.serviceId}' was not found. Available services: ${SERVICES_STORE.map((s) => `${s.id} (${s.name})`).join(', ')}.`,
    };
  }

  // Find existing slots for this date
  const slotsForDate = AVAILABILITY_STORE.filter(
    (slot) => slot.serviceId === input.serviceId && slot.date === input.date
  );

  let availableSlots: string[];
  if (slotsForDate.length > 0) {
    availableSlots = slotsForDate.filter((s) => !s.isBooked).map((s) => s.timeSlot);
  } else {
    // Generate default daylight slots if requested for upcoming dates
    availableSlots = ['10:00 AM', '11:30 AM', '02:30 PM', '04:00 PM'];
  }

  return {
    success: true,
    data: {
      serviceId: service.id,
      serviceName: service.name,
      date: input.date,
      availableSlots,
      hasAvailability: availableSlots.length > 0,
    },
  };
}
