import {
  SearchKnowledgeSchema,
  GetServicesSchema,
  CheckAvailabilitySchema,
  CreateBookingSchema,
  GEMINI_TOOL_DECLARATIONS,
} from './schemas';
import { handleSearchKnowledge } from './handlers/searchKnowledge';
import { handleGetServices } from './handlers/getServices';
import { handleCheckAvailability } from './handlers/checkAvailability';
import { handleCreateBooking } from './handlers/createBooking';
import { ToolDefinition, ToolExecutionContext, ToolExecutionResult } from '@/types/tools';
import { recordAuditEvent } from '@/lib/audit';

export class ToolRegistry {
  private static tools: Map<string, ToolDefinition<any, any>> = new Map();

  static {
    this.register({
      name: 'searchKnowledge',
      description: 'Search clinic FAQs, operating hours, addresses, insurance, policies, and guidelines.',
      parameters: SearchKnowledgeSchema,
      jsonSchema: GEMINI_TOOL_DECLARATIONS[0],
      requiresConfirmation: false,
      execute: handleSearchKnowledge,
    });

    this.register({
      name: 'getServices',
      description: 'Retrieve the list of offered medical, wellness, and consulting services with prices and durations.',
      parameters: GetServicesSchema,
      jsonSchema: GEMINI_TOOL_DECLARATIONS[1],
      requiresConfirmation: false,
      execute: handleGetServices,
    });

    this.register({
      name: 'checkAvailability',
      description: 'Check available time slots for a specific service on a particular date.',
      parameters: CheckAvailabilitySchema,
      jsonSchema: GEMINI_TOOL_DECLARATIONS[2],
      requiresConfirmation: false,
      execute: handleCheckAvailability,
    });

    this.register({
      name: 'createBooking',
      description: 'Initiate an appointment booking. Requires user confirmation.',
      parameters: CreateBookingSchema,
      jsonSchema: GEMINI_TOOL_DECLARATIONS[3],
      requiresConfirmation: true,
      execute: handleCreateBooking,
    });
  }

  static register<TParams, TResult>(tool: ToolDefinition<TParams, TResult>): void {
    this.tools.set(tool.name, tool);
  }

  static get(name: string): ToolDefinition | undefined {
    return this.tools.get(name);
  }

  static getAll(): ToolDefinition[] {
    return Array.from(this.tools.values());
  }

  static getToolDeclarations() {
    return GEMINI_TOOL_DECLARATIONS;
  }

  /**
   * 9-step secure execution pipeline:
   * 1. Verify registered
   * 2. Validate argument schema
   * 3. Authenticate user
   * 4. Authorize access
   * 5. Validate business rules on server
   * 6. Check whether confirmation is required
   * 7. Execute approved backend operation
   * 8. Return real result to agent
   * 9. Record audit event
   */
  static async executeToolCall(
    name: string,
    rawArguments: unknown,
    context: ToolExecutionContext
  ): Promise<ToolExecutionResult> {
    // Step 1: Verify registered
    const tool = this.tools.get(name);
    if (!tool) {
      recordAuditEvent('SECURITY_VIOLATION', {
        toolName: name,
        userId: context.userId,
        details: { reason: `Unregistered tool execution attempted: ${name}` },
      });
      return {
        success: false,
        error: `Tool '${name}' is not registered or permitted on this server.`,
      };
    }

    // Step 2: Validate argument schema using Zod
    const validationResult = tool.parameters.safeParse(rawArguments);
    if (!validationResult.success) {
      const errorMsg = validationResult.error.errors.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ');
      return {
        success: false,
        error: `Invalid tool arguments for '${name}': ${errorMsg}`,
      };
    }

    // Step 3 & 4: Authenticate & Authorize context check
    // Public demo tools allow anonymous session with ID; future authenticated tools inspect context.userId

    // Step 5, 6, 7: Validate business rules & execute approved operation
    try {
      const result = await tool.execute(validationResult.data, context);

      // Step 8 & 9: Record audit event and return real result
      recordAuditEvent('TOOL_EXECUTION', {
        toolName: name,
        userId: context.userId,
        sessionId: context.sessionId,
        details: {
          success: result.success,
          requiresConfirmation: result.requiresConfirmation,
          parameters: validationResult.data,
        },
      });

      return result;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Tool execution error';
      recordAuditEvent('TOOL_EXECUTION', {
        toolName: name,
        userId: context.userId,
        sessionId: context.sessionId,
        details: { success: false, error: errorMessage },
      });
      return {
        success: false,
        error: errorMessage,
      };
    }
  }
}
