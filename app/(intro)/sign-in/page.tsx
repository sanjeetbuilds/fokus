'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowser } from '@/lib/supabase/client';
import Wordmark from '@/components/shared/Wordmark';

const FONT = "'Plus Jakarta Sans', sans-serif";

function isValidEmail(e: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());
}

export default function SignInPage() {
  const [email, setEmail]     = useState('');
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const router   = useRouter();
  const supabase = getSupabaseBrowser();

  const submit = async () => {
    if (!isValidEmail(email) || loading) return;
    setLoading(true);
    setError(null);

    const { error: err } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (err) {
      const msg = err.message.toLowerCase();
      const status = (err as { status?: number }).status;
      setError(
        msg.includes('rate') || msg.includes('too many') || status === 429
          ? 'Too many attempts. Please wait a few minutes and try again.'
          : 'Something went wrong. Please try again.'
      );
      setLoading(false);
      return;
    }

    router.push(`/auth/check-email?email=${encodeURIComponent(email.trim())}`);
  };

  const valid = isValidEmail(email);

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      padding: '0 28px',
      paddingTop: 'max(48px, env(safe-area-inset-top))',
      paddingBottom: 'max(28px, env(safe-area-inset-bottom))',
      background: '#ffffff',
      fontFamily: FONT,
      boxSizing: 'border-box',
    }}>
      <Wordmark size="sm" />

      <div style={{ marginTop: 40, flexShrink: 0 }}>
        <div style={{
          width: 40,
          height: 4,
          borderRadius: 2,
          background: '#5FB8B0',
          marginBottom: 16,
          flexShrink: 0,
        }} />
        <div style={{
          fontSize: 42,
          fontWeight: 800,
          color: '#252630',
          letterSpacing: '-0.035em',
          lineHeight: 1.05,
          marginBottom: 10,
          fontFamily: FONT,
        }}>
          What&apos;s your<br />email?
        </div>
        <div style={{
          fontSize: 16,
          color: '#8E8D9B',
          lineHeight: 1.65,
          marginBottom: 28,
          fontFamily: FONT,
        }}>
          We&apos;ll send a link to sign you in.<br />
          No password needed.
        </div>
        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={e => e.key === 'Enter' && submit()}
          placeholder="you@example.com"
          style={{
            width: '100%',
            background: focused ? '#ffffff' : '#F7F7F5',
            border: `1.5px solid ${focused ? '#9CA5FF' : '#E8E8E6'}`,
            borderRadius: 16,
            padding: '17px 16px',
            fontSize: 16,
            color: '#252630',
            outline: 'none',
            transition: 'border-color 150ms ease, background 150ms ease',
            fontFamily: FONT,
            boxSizing: 'border-box',
          }}
        />
      </div>

      <div style={{ flex: 1 }} />

      {error && (
        <div style={{
          fontSize: 13,
          color: '#C44040',
          textAlign: 'center',
          marginBottom: 12,
          padding: '10px 14px',
          background: '#FEF2F2',
          borderRadius: 10,
          lineHeight: 1.4,
          fontFamily: FONT,
        }}>{error}</div>
      )}

      <button
        onClick={submit}
        disabled={!valid || loading}
        style={{
          background: '#252630',
          opacity: !valid || loading ? 0.35 : 1,
          borderRadius: 999,
          padding: '16px 20px',
          fontSize: 15,
          fontWeight: 700,
          color: '#ffffff',
          border: 'none',
          width: '100%',
          fontFamily: FONT,
          cursor: !valid || loading ? 'not-allowed' : 'pointer',
          flexShrink: 0,
          letterSpacing: '-0.01em',
        }}
      >
        {loading ? 'Sending...' : 'Send my link'}
      </button>

      <div style={{
        fontSize: 12,
        color: '#C2C0CB',
        textAlign: 'center',
        marginTop: 12,
        lineHeight: 1.5,
        flexShrink: 0,
        fontFamily: FONT,
      }}>
        Your child&apos;s data stays private.<br />
        Only you can see it.
      </div>
    </div>
  );
}
