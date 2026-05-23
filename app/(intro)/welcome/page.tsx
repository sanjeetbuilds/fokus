'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Wordmark from '@/components/shared/Wordmark';

const SCREENS = [
  {
    id: 'splash',
    type: 'splash',
  },
  {
    id: 'intro1',
    type: 'intro',
    blobColor: 'rgba(156,165,255,0.12)',
    circleColor: '#EEEDFE',
    iconName: 'ti-school',
    iconColor: '#4040B8',
    headline: ['Schools measure', "what's ", 'easy to measure.'],
    accentIndex: 2,
    sub: 'Marks. Behaviour. Speed. None of\nwhich build what actually matters.',
    button: 'Continue',
  },
  {
    id: 'intro2',
    type: 'intro',
    blobColor: 'rgba(244,200,74,0.12)',
    circleColor: '#FFF6DC',
    iconName: 'ti-clock',
    iconColor: '#8A6200',
    headline: ['Ten minutes. ', 'One activity.', ' Every day.'],
    accentIndex: 1,
    sub: 'No screens for your child. No scores.\nJust you and them, ten minutes.',
    button: 'Continue',
  },
  {
    id: 'intro3',
    type: 'intro',
    blobColor: 'rgba(232,128,107,0.12)',
    circleColor: '#FCEEE8',
    iconName: 'ti-sparkles',
    iconColor: '#943200',
    headline: ['Nine skills. ', '72 activities', ' to do together.'],
    accentIndex: 1,
    sub: 'Curiosity, resilience, perspective,\nemotional awareness. Ages 5 to 10.',
    button: 'Get started',
  },
];

const container: React.CSSProperties = {
  minHeight: '100dvh',
  display: 'flex',
  flexDirection: 'column',
  padding: '0 24px',
  paddingTop: 'max(52px, env(safe-area-inset-top))',
  paddingBottom: 'max(28px, env(safe-area-inset-bottom))',
  background: '#ffffff',
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  boxSizing: 'border-box',
};

function Dots({ total, current }: { total: number; current: number }) {
  return (
    <div style={{ display: 'flex', gap: 5, justifyContent: 'center', marginBottom: 14 }}>
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          style={{
            width: i === current ? 18 : 6,
            height: 6,
            borderRadius: i === current ? 3 : '50%',
            background: i === current ? '#252630' : '#E0DED8',
            transition: 'all 200ms ease',
            display: 'inline-block',
          }}
        />
      ))}
    </div>
  );
}

function PrimaryButton({
  label,
  onClick,
  disabled = false,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: '#252630',
        opacity: disabled ? 0.35 : 1,
        borderRadius: 999,
        padding: '15px 20px',
        textAlign: 'center',
        fontSize: 15,
        fontWeight: 700,
        color: '#ffffff',
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        width: '100%',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        letterSpacing: '-0.01em',
        flexShrink: 0,
      }}
    >
      {label}
    </button>
  );
}

function IconZone({
  blobColor,
  circleColor,
  iconName,
  iconColor,
}: {
  blobColor: string;
  circleColor: string;
  iconName: string;
  iconColor: string;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        height: 80,
        marginBottom: 28,
        flexShrink: 0,
      }}
    >
      <div
        style={{
          position: 'absolute',
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: blobColor,
        }}
      />
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: circleColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 2,
          flexShrink: 0,
        }}
      >
        <i
          className={`ti ${iconName}`}
          style={{ fontSize: 26, color: iconColor }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}

export default function WelcomePage() {
  const [step, setStep] = useState(0);
  const router = useRouter();

  const advance = () => {
    if (step < SCREENS.length - 1) {
      setStep(step + 1);
    } else {
      router.push('/sign-in');
    }
  };

  const skip = () => {
    setStep(SCREENS.length - 1);
  };

  const screen = SCREENS[step];

  if (screen.type === 'splash') {
    return (
      <div style={container}>
        <Wordmark size="sm" />
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            paddingBottom: 16,
          }}
        >
          <Wordmark size="xl" />
          <div
            style={{
              fontSize: 15,
              color: '#8E8D9B',
              marginTop: 14,
              textAlign: 'center',
              lineHeight: 1.55,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 400,
            }}
          >
            ten minutes a day,
            <br />
            with your child.
          </div>
        </div>
        <Dots total={4} current={0} />
        <PrimaryButton label="Continue" onClick={advance} />
      </div>
    );
  }

  const s = screen as (typeof SCREENS)[1];

  return (
    <div style={container}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
        <Wordmark size="sm" />
        <button
          onClick={skip}
          style={{
            fontSize: 13,
            color: '#C2C0CB',
            fontWeight: 500,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px 0',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        >
          Skip
        </button>
      </div>

      <IconZone
        blobColor={s.blobColor!}
        circleColor={s.circleColor!}
        iconName={s.iconName!}
        iconColor={s.iconColor!}
      />

      <div
        style={{
          fontSize: 26,
          fontWeight: 800,
          color: '#252630',
          lineHeight: 1.12,
          letterSpacing: '-0.028em',
          textAlign: 'center',
          flexShrink: 0,
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}
      >
        {s.headline!.map((part, i) => (
          <span
            key={i}
            style={{ color: i === s.accentIndex ? '#9CA5FF' : '#252630' }}
          >
            {part}
          </span>
        ))}
      </div>

      <div
        style={{
          fontSize: 14,
          color: '#8E8D9B',
          lineHeight: 1.55,
          textAlign: 'center',
          marginTop: 12,
          flexShrink: 0,
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          whiteSpace: 'pre-line',
        }}
      >
        {s.sub}
      </div>

      <div style={{ flex: 1 }} />

      <Dots total={4} current={step} />
      <PrimaryButton
        label={s.button!}
        onClick={advance}
      />
    </div>
  );
}
