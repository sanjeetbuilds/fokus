'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Wordmark from '@/components/shared/Wordmark';

/* shared style constants */

const FONT = "'Plus Jakarta Sans', sans-serif";

const PAGE: React.CSSProperties = {
  minHeight: '100dvh',
  display: 'flex',
  flexDirection: 'column',
  padding: '0 28px',
  paddingTop: 'max(48px, env(safe-area-inset-top))',
  paddingBottom: 'max(28px, env(safe-area-inset-bottom))',
  background: '#ffffff',
  fontFamily: FONT,
  boxSizing: 'border-box',
};

function Spacer() {
  return <div style={{ flex: 1 }} />;
}

function Dots({ total, active }: { total: number; active: number }) {
  return (
    <div style={{ display: 'flex', gap: 5, marginBottom: 14 }}>
      {Array.from({ length: total }).map((_, i) => (
        <span key={i} style={{
          display: 'inline-block',
          width: i === active ? 20 : 6,
          height: 6,
          borderRadius: i === active ? 3 : '50%',
          background: i === active ? '#252630' : 'rgba(0,0,0,0.12)',
          transition: 'all 200ms ease',
          flexShrink: 0,
        }} />
      ))}
    </div>
  );
}

function PrimaryBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      background: '#252630',
      borderRadius: 999,
      padding: '16px 20px',
      fontSize: 16,
      fontWeight: 700,
      color: '#ffffff',
      border: 'none',
      width: '100%',
      fontFamily: FONT,
      letterSpacing: '-0.01em',
      cursor: 'pointer',
      flexShrink: 0,
    }}>{label}</button>
  );
}

function SkipBtn({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      background: 'none',
      border: 'none',
      padding: '10px 0',
      fontSize: 13,
      fontWeight: 500,
      color: '#C2C0CB',
      width: '100%',
      fontFamily: FONT,
      cursor: 'pointer',
      marginTop: 2,
      flexShrink: 0,
    }}>Skip</button>
  );
}

function Rule({ color }: { color: string }) {
  return (
    <div style={{
      width: 48,
      height: 4,
      borderRadius: 2,
      background: color,
      marginBottom: 20,
      flexShrink: 0,
    }} />
  );
}

function Tag({ label, color }: { label: string; color: string }) {
  return (
    <div style={{
      fontSize: 11,
      fontWeight: 700,
      color,
      letterSpacing: '0.1em',
      textTransform: 'uppercase' as const,
      marginBottom: 16,
      fontFamily: FONT,
      flexShrink: 0,
    }}>{label}</div>
  );
}

const HL: React.CSSProperties = {
  fontSize: 42,
  fontWeight: 800,
  color: '#252630',
  letterSpacing: '-0.035em',
  lineHeight: 1.05,
  marginBottom: 16,
  fontFamily: FONT,
};

const SUB: React.CSSProperties = {
  fontSize: 16,
  color: '#8E8D9B',
  lineHeight: 1.65,
  fontWeight: 400,
  fontFamily: FONT,
};

/* skill pills */

const SKILLS = [
  { label: 'Curiosity',     bg: '#FFF6DC', color: '#8A6200' },
  { label: 'Resilience',    bg: '#E8F9EE', color: '#207838' },
  { label: 'Language',      bg: '#EEEDFE', color: '#4040B8' },
  { label: 'Creativity',    bg: '#FCEEE8', color: '#943200' },
  { label: 'Emotional',     bg: '#FCEEF4', color: '#A02858' },
  { label: 'Observation',   bg: '#E4F7F5', color: '#0C5850' },
  { label: 'Thinking',      bg: '#EEEAF8', color: '#281860' },
  { label: 'Decisiveness',  bg: '#E4EBF5', color: '#0E1E38' },
  { label: 'Perspective',   bg: '#F0E8F4', color: '#3A1A4C' },
];

function SkillPills() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 16 }}>
      {SKILLS.map(s => (
        <span key={s.label} style={{
          background: s.bg,
          color: s.color,
          fontSize: 12,
          fontWeight: 700,
          padding: '6px 12px',
          borderRadius: 999,
          fontFamily: FONT,
        }}>{s.label}</span>
      ))}
    </div>
  );
}

/* screens */

function SplashScreen({ onNext, onSkip }: { onNext: () => void; onSkip: () => void }) {
  const COLOR = '#F4C84A';
  return (
    <div style={PAGE}>
      <Wordmark size="sm" />
      <Spacer />
      <div style={{ paddingBottom: 24 }}>
        <Tag label="For parents of 5 to 10 year olds" color={COLOR} />
        <Rule color={COLOR} />
        <div style={HL}>
          ten minutes<br />
          a day,<br />
          <span style={{ color: COLOR }}>with your<br />child.</span>
        </div>
        <div style={SUB}>
          The skills school doesn&apos;t teach.<br />
          One small thing. Every day.
        </div>
      </div>
      <Spacer />
      <Dots total={4} active={0} />
      <PrimaryBtn label="Continue" onClick={onNext} />
      <SkipBtn onClick={onSkip} />
    </div>
  );
}

function Intro1({ onNext, onSkip }: { onNext: () => void; onSkip: () => void }) {
  const COLOR = '#6B5B95';
  return (
    <div style={PAGE}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Wordmark size="sm" />
        <button onClick={onSkip} style={{
          background: 'none', border: 'none',
          fontSize: 13, fontWeight: 500, color: '#C2C0CB',
          cursor: 'pointer', fontFamily: FONT, padding: '4px 0',
        }}>Skip</button>
      </div>
      <Spacer />
      <div style={{ paddingBottom: 20 }}>
        <Tag label="The gap no one talks about" color={COLOR} />
        <Rule color={COLOR} />
        <div style={HL}>
          schools teach<br />
          subjects.<br />
          <span style={{ color: COLOR }}>not skills.</span>
        </div>
        <div style={SUB}>
          Critical thinking. Resilience. Emotional
          awareness. These aren&apos;t in any curriculum.
          They&apos;re built at home, in small moments.
        </div>
      </div>
      <Spacer />
      <Dots total={4} active={1} />
      <PrimaryBtn label="Continue" onClick={onNext} />
      <SkipBtn onClick={onSkip} />
    </div>
  );
}

function Intro2({ onNext, onSkip }: { onNext: () => void; onSkip: () => void }) {
  const AMBER = '#F4C84A';
  const GREEN_ACCENT = '#5DC87A';
  return (
    <div style={PAGE}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Wordmark size="sm" />
        <button onClick={onSkip} style={{
          background: 'none', border: 'none',
          fontSize: 13, fontWeight: 500, color: '#C2C0CB',
          cursor: 'pointer', fontFamily: FONT, padding: '4px 0',
        }}>Skip</button>
      </div>
      <Spacer />
      <div style={{ paddingBottom: 20 }}>
        <Tag label="How fokus works" color={AMBER} />
        <Rule color={AMBER} />
        <div style={{
          fontSize: 80,
          fontWeight: 800,
          color: AMBER,
          letterSpacing: '-0.05em',
          lineHeight: 0.9,
          marginBottom: 6,
          fontFamily: FONT,
        }}>10</div>
        <div style={{ ...HL, fontSize: 36, marginBottom: 16 }}>
          minutes.<br />
          <span style={{ color: GREEN_ACCENT }}>one activity.</span><br />
          every day.
        </div>
        <div style={SUB}>
          No screens for your child. No scores.
          No streaks. Just you and them.
        </div>
      </div>
      <Spacer />
      <Dots total={4} active={2} />
      <PrimaryBtn label="Continue" onClick={onNext} />
      <SkipBtn onClick={onSkip} />
    </div>
  );
}

function Intro3({ onNext }: { onNext: () => void }) {
  const GREEN = '#5DC87A';
  const FAINT_RULE = 'rgba(37, 38, 48, 0.15)';
  return (
    <div style={PAGE}>
      <Wordmark size="sm" />
      <Spacer />
      <div style={{ paddingBottom: 16 }}>
        <Tag label="What's inside" color={GREEN} />
        <Rule color={FAINT_RULE} />
        <div style={{ ...HL, marginBottom: 16 }}>
          <span style={{ color: '#252630' }}>9 skills.</span><br />
          72 small<br />
          things to do<br />
          together.
        </div>
        <SkillPills />
      </div>
      <Spacer />
      <Dots total={4} active={3} />
      <PrimaryBtn label="Get started" onClick={onNext} />
    </div>
  );
}

/* page */

export default function WelcomePage() {
  const [step, setStep] = useState(0);
  const router = useRouter();

  const goToSignIn = () => router.push('/sign-in');

  const next = () => {
    if (step < 3) setStep(s => s + 1);
    else goToSignIn();
  };

  const skip = () => goToSignIn();

  if (step === 0) return <SplashScreen onNext={next} onSkip={skip} />;
  if (step === 1) return <Intro1 onNext={next} onSkip={skip} />;
  if (step === 2) return <Intro2 onNext={next} onSkip={skip} />;
  return <Intro3 onNext={goToSignIn} />;
}
