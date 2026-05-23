'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';
import Wordmark from '@/components/shared/Wordmark';

function CheckEmailContent() {
  const params = useSearchParams();
  const router = useRouter();
  const email  = params.get('email') ?? 'your inbox';

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      padding: '0 26px',
      paddingTop: 'max(48px, env(safe-area-inset-top))',
      paddingBottom: 'max(28px, env(safe-area-inset-bottom))',
      background: '#ffffff',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      boxSizing: 'border-box',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* colour fade */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '60%',
        background: 'linear-gradient(180deg, rgba(93,200,122,0.16) 0%, transparent 100%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', flex: 1 }}>
        <Wordmark size="sm" />

        <div style={{ flex: 1 }} />

        <div style={{
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', textAlign: 'center',
          paddingBottom: 16, flexShrink: 0,
        }}>
          {/* icon */}
          <div style={{
            position: 'relative', width: 96, height: 96,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 18,
          }}>
            <div style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              background: 'rgba(93,200,122,0.15)',
            }} />
            <div style={{
              width: 76, height: 76, borderRadius: '50%',
              background: '#E8F9EE',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative', zIndex: 2, fontSize: 36,
            }}>📬</div>
          </div>

          {/* badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            background: '#E8F9EE', color: '#207838',
            fontSize: 12, fontWeight: 700,
            padding: '6px 14px', borderRadius: 999,
            marginBottom: 16,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}>✓ Link sent</div>

          <div style={{
            fontSize: 26, fontWeight: 800, color: '#252630',
            letterSpacing: '-0.025em', marginBottom: 12, lineHeight: 1.2,
          }}>Check your inbox.</div>

          <div style={{ fontSize: 15, color: '#8E8D9B', lineHeight: 1.6, maxWidth: 260 }}>
            Tap the link we sent to{' '}
            <span style={{ fontWeight: 700, color: '#252630' }}>{email}</span>.
            {' '}Open it on this device.
          </div>

          <button
            onClick={() => router.push('/sign-in')}
            style={{
              marginTop: 20, fontSize: 14, fontWeight: 600,
              color: '#252630', background: 'none', border: 'none',
              borderBottom: '1.5px solid #252630', paddingBottom: 2,
              cursor: 'pointer',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >Use a different email</button>
        </div>

        <div style={{ flex: 1 }} />

        <div style={{
          fontSize: 12, color: '#C2C0CB',
          textAlign: 'center', lineHeight: 1.5, flexShrink: 0,
        }}>
          Didn&apos;t get it? Check spam or try again in 60 seconds.
        </div>
      </div>
    </div>
  );
}

export default function CheckEmailPage() {
  return (
    <Suspense>
      <CheckEmailContent />
    </Suspense>
  );
}
