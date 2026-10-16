import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ActionService } from '@/services/action-service';
import { checkRateLimit } from '@/lib/rate-limiter';

const ConfirmActionSchema = z.object({
  actionId: z.string().min(1, 'Action ID is required'),
  idempotencyKey: z.string().min(1, 'Idempotency key is required'),
  confirmed: z.boolean(),
});

export async function POST(req: NextRequest) {
  try {
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : '127.0.0.1';

    const rateLimit = checkRateLimit(ip, 60, 60000);
    if (!rateLimit.success) {
      return NextResponse.json({ error: 'Too many requests. Please slow down.' }, { status: 429 });
    }

    const rawBody = await req.json().catch(() => null);
    if (!rawBody) {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    const validation = ConfirmActionSchema.safeParse(rawBody);
    if (!validation.success) {
      const errorMsg = validation.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
      return NextResponse.json({ error: `Validation error: ${errorMsg}` }, { status: 400 });
    }

    const { actionId, idempotencyKey, confirmed } = validation.data;

    if (!confirmed) {
      const rejectResult = ActionService.rejectAction(actionId, ip);
      return NextResponse.json({
        success: true,
        actionId,
        status: 'cancelled',
        message: rejectResult.message,
      });
    }

    const result = await ActionService.confirmAction(actionId, idempotencyKey, ip);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          actionId,
          error: result.error || 'Failed to execute confirmed action',
          message: result.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      actionId,
      status: 'confirmed',
      message: result.message,
      result: result.result,
    });
  } catch (error: any) {
    console.error('Action confirmation error:', error);
    return NextResponse.json(
      { error: 'Internal server error confirming action' },
      { status: 500 }
    );
  }
}
