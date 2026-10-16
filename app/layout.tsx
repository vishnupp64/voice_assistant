import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Multilingual Voice AI Assistant | Powered by Google Gemini',
  description:
    'A real-time multilingual voice-controlled AI assistant supporting English, Malayalam, Hindi, Tamil, and more with secure function calling and action confirmations.',
  keywords: [
    'Voice AI',
    'Gemini AI',
    'Multilingual Assistant',
    'Web Speech API',
    'Malayalam AI',
    'Hindi AI',
    'Tamil AI',
    'Next.js Voice Agent',
  ],
  authors: [{ name: 'Voice AI Engineering Team' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0f172a',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased selection:bg-teal-500 selection:text-slate-950">
        {children}
      </body>
    </html>
  );
}
