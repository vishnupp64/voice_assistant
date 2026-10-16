import { CreateBookingInput } from '../schemas';
import { ToolExecutionContext, ToolExecutionResult } from '@/types/tools';
import { SERVICES_STORE } from '../data-store';
import { ActionService } from '@/services/action-service';

export async function handleCreateBooking(
  input: CreateBookingInput,
  context: ToolExecutionContext
): Promise<ToolExecutionResult> {
  const service = SERVICES_STORE.find((s) => s.id === input.serviceId);
  const serviceName = service ? service.name : input.serviceId;
  const price = service ? `₹${service.price}` : 'standard fee';

  // Construct clear human-readable summary for confirmation
  const summary = `Book ${serviceName} on ${input.date} at ${input.timeSlot} for ${input.customerName} (${input.customerPhone}). Fee: ${price}.`;

  // Consequential action: register pending action and require confirmation
  const pendingAction = ActionService.createPendingAction(
    'createBooking',
    {
      serviceId: input.serviceId,
      customerName: input.customerName,
      customerPhone: input.customerPhone,
      date: input.date,
      timeSlot: input.timeSlot,
      notes: input.notes,
    },
    summary,
    context.userId
  );

  return {
    success: true,
    requiresConfirmation: true,
    pendingAction,
    data: {
      message: `Action requires confirmation. Summary: ${summary}`,
      actionId: pendingAction.actionId,
      summary,
    },
  };
}
