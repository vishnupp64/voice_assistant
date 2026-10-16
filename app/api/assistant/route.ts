import { NextRequest, NextResponse } from 'next/server';
import { AssistantRequestSchema } from '@/services/conversation';
import { checkRateLimit } from '@/lib/rate-limiter';
import { runAssistantConversation } from '@/lib/gemini';
import { recordAuditEvent } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    // 1. Identify Client IP for Rate Limiting
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : '127.0.0.1';

    const maxRequests = Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 30;
    const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS) || 60000;

    const rateLimit = checkRateLimit(ip, maxRequests, windowMs);
    if (!rateLimit.success) {
      recordAuditEvent('RATE_LIMITED', {
        userId: ip,
        details: { retryAfterSeconds: rateLimit.retryAfterSeconds },
      });

      return NextResponse.json(
        {
          error: 'Rate limit exceeded. Please wait before sending more voice requests.',
          retryAfter: rateLimit.retryAfterSeconds,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateLimit.retryAfterSeconds || 60),
            'X-RateLimit-Limit': String(rateLimit.limit),
            'X-RateLimit-Remaining': '0',
          },
        }
      );
    }

    // 2. Validate request payload with Zod
    const rawBody = await req.json().catch(() => null);
    if (!rawBody) {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    const parseResult = AssistantRequestSchema.safeParse(rawBody);
    if (!parseResult.success) {
      const errorMsg = parseResult.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
      return NextResponse.json({ error: `Validation error: ${errorMsg}` }, { status: 400 });
    }

    const { message, conversationHistory, language, sessionId } = parseResult.data;

    // 3. Process assistant conversation & tool execution
    const result = await runAssistantConversation(
      message,
      conversationHistory,
      language,
      {
        userId: ip,
        sessionId: sessionId || 'default_session',
      }
    );

    return NextResponse.json(
      {
        message: result.text,
        language,
        toolExecutions: result.toolExecutions,
        pendingAction: result.pendingAction,
      },
      {
        headers: {
          'X-RateLimit-Limit': String(rateLimit.limit),
          'X-RateLimit-Remaining': String(rateLimit.remaining),
        },
      }
    );
  } catch (error: any) {
    console.error('API assistant error:', error);
    return NextResponse.json(
      {
        error: 'An internal error occurred while processing your voice command. Please try again.',
      },
      { status: 500 }
    );
  }
}
