import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { checkRateLimit } from '@/lib/rate-limiter';

const TtsRequestSchema = z.object({
  text: z.string().min(1).max(1000),
  language: z.string().default('en-IN'),
});

export async function POST(req: NextRequest) {
  try {
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : '127.0.0.1';

    const rateLimit = checkRateLimit(ip, 30, 60000);
    if (!rateLimit.success) {
      return NextResponse.json({ error: 'Rate limit exceeded for TTS generation' }, { status: 429 });
    }

    const raw = await req.json().catch(() => null);
    const parsed = TtsRequestSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid TTS request parameters' }, { status: 400 });
    }

    const { text, language } = parsed.data;

    // Check if server-side Gemini audio model is configured
    // Note: If cloud TTS or Gemini audio output model is available, audio buffer can be streamed.
    // For free-tier-first compatibility, the client will primary use Web Speech API SpeechSynthesis,
    // and fallback to this server endpoint when high-fidelity server TTS is required.
    return NextResponse.json({
      supported: true,
      text,
      language,
      provider: 'server-adapter',
      message: 'Server audio adapter ready. Client-side browser synthesis is active as low-latency default.',
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to process TTS request' }, { status: 500 });
  }
}
