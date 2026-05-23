'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Wordmark from '@/components/shared/Wordmark';

/* shared primitives */

const S: React.CSSProperties = {
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
};

function FadeZone({ color }: { color: string }) {
  return (
    <div style={{
      position: 'absolute',
      top: 0, left: 0, right: 0,
      height: '65%',
      background: `linear-gradient(180deg, ${color} 0%, transparent 100%)`,
      pointerEvents: 'none',
      zIndex: 0,
    }} />
  );
}

function Spacer() {
  return <div style={{ flex: 1 }} />;
}

function Dots({ total, active }: { total: number; active: number }) {
  return (
    <div style={{ display: 'flex', gap: 5, justifyContent: 'center', marginBottom: 14 }}>
      {Array.from({ length: total }).map((_, i) => (
        <span key={i} style={{
          display: 'inline-block',
          width: i === active ? 20 : 6,
          height: 6,
          borderRadius: i === active ? 3 : '50%',
          background: i === active ? '#252630' : 'rgba(0,0,0,0.15)',
          transition: 'all 200ms ease',
        }} />
      ))}
    </div>
  );
}

function Btn({ label, onClick, dim }: { label: string; onClick: () => void; dim?: boolean }) {
  return (
    <button onClick={onClick} style={{
      background: '#252630',
      opacity: dim ? 0.35 : 1,
      borderRadius: 999,
      padding: '16px 20px',
      fontSize: 15,
      fontWeight: 700,
      color: '#fff',
      border: 'none',
      width: '100%',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      letterSpacing: '-0.01em',
      cursor: dim ? 'not-allowed' : 'pointer',
      flexShrink: 0,
    }}>{label}</button>
  );
}

function IconCircle({
  emoji,
  blobRgba,
  circleBg,
}: {
  emoji: string;
  blobRgba: string;
  circleBg: string;
}) {
  return (
    <div style={{
      position: 'relative',
      width: 88, height: 88,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      marginBottom: 28,
    }}>
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        background: blobRgba,
      }} />
      <div style={{
        width: 70, height: 70, borderRadius: '50%',
        background: circleBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', zIndex: 2,
        fontSize: 32,
      }}>{emoji}</div>
    </div>
  );
}

/* screens */

function SplashScreen({ onNext }: { onNext: () => void }) {
  return (
    <div style={S}>
      <FadeZone color="rgba(156,165,255,0.18)" />
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', flex: 1 }}>
        <Wordmark size="sm" />
        <Spacer />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: 24 }}>
          <Wordmark size="xl" />
          <div style={{
            fontSize: 16, color: '#8E8D9B',
            marginTop: 14, textAlign: 'center',
            lineHeight: 1.6, fontWeight: 400,
          }}>
            ten minutes a day,<br />with your child.
          </div>
        </div>
        <Spacer />
        <Dots total={4} active={0} />
        <Btn label="Continue" onClick={onNext} />
      </div>
    </div>
  );
}

const INTROS = [
  {
    fadeColor: 'rgba(156,165,255,0.20)',
    emoji: '🎓',
    blobRgba: 'rgba(156,165,255,0.20)',
    circleBg: '#EEEDFE',
    headline: (
      <>
        Schools measure<br />
        what&apos;s <span style={{ color: '#9CA5FF' }}>easy to<br />measure.</span>
      </>
    ),
    sub: 'Marks. Behaviour. Speed. None of which build what actually matters.',
    btn: 'Continue',
  },
  {
    fadeColor: 'rgba(244,200,74,0.22)',
    emoji: '⏱️',
    blobRgba: 'rgba(244,200,74,0.22)',
    circleBg: '#FFF6DC',
    headline: (
      <>
        Ten minutes.<br />
        <span style={{ color: '#9CA5FF' }}>One activity.</span><br />
        Every day.
      </>
    ),
    sub: 'No screens for your child. No scores. Just you and them, ten minutes.',
    btn: 'Continue',
  },
  {
    fadeColor: 'rgba(232,128,107,0.20)',
    emoji: '✨',
    blobRgba: 'rgba(232,128,107,0.20)',
    circleBg: '#FCEEE8',
    headline: (
      <>
        Nine skills.<br />
        <span style={{ color: '#9CA5FF' }}>72 activities</span><br />
        to do together.
      </>
    ),
    sub: 'Curiosity, resilience, perspective, emotional awareness. Ages 5 to 10.',
    btn: 'Get started',
  },
];

function IntroScreen({
  index,
  onNext,
  onSkip,
}: {
  index: number;
  onNext: () => void;
  onSkip: () => void;
}) {
  const d = INTROS[index];
  return (
    <div style={S}>
      <FadeZone color={d.fadeColor} />
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Wordmark size="sm" />
          <button onClick={onSkip} style={{
            fontSize: 14, color: '#C2C0CB', fontWeight: 500,
            background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}>Skip</button>
        </div>
        <Spacer />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: 20 }}>
          <IconCircle emoji={d.emoji} blobRgba={d.blobRgba} circleBg={d.circleBg} />
          <div style={{
            fontSize: 26, fontWeight: 800, color: '#252630',
            lineHeight: 1.2, letterSpacing: '-0.025em',
            textAlign: 'center', marginBottom: 14,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}>{d.headline}</div>
          <div style={{
            fontSize: 14, color: '#8E8D9B',
            lineHeight: 1.6, textAlign: 'center',
            maxWidth: 260,
          }}>{d.sub}</div>
        </div>
        <Spacer />
        <Dots total={4} active={index + 1} />
        <Btn label={d.btn} onClick={onNext} />
      </div>
    </div>
  );
}

/* page */

export default function WelcomePage() {
  const [step, setStep] = useState(0);
  const router = useRouter();

  const next = () => {
    if (step === 0) { setStep(1); return; }
    if (step < 3) { setStep(step + 1); return; }
    router.push('/sign-in');
  };

  const skip = () => {
    setStep(3);
  };

  if (step === 0) return <SplashScreen onNext={next} />;
  return <IntroScreen index={step - 1} onNext={next} onSkip={skip} />;
}
