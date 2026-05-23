'use client';

interface WordmarkProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizes = {
  sm: { font: 15, dot: 4, offset: -1.5 },
  md: { font: 20, dot: 5, offset: -2 },
  lg: { font: 32, dot: 8, offset: -3 },
  xl: { font: 52, dot: 12, offset: -4 },
};

export default function Wordmark({ size = 'sm', className }: WordmarkProps) {
  const s = sizes[size];
  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'baseline',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontSize: s.font,
        fontWeight: 800,
        color: '#252630',
        letterSpacing: '-0.035em',
        lineHeight: 1,
        userSelect: 'none',
      }}
    >
      fokus
      <span
        style={{
          display: 'inline-block',
          width: s.dot,
          height: s.dot,
          borderRadius: '50%',
          background: '#9CA5FF',
          marginLeft: 1.5,
          transform: `translateY(${s.offset}px)`,
          flexShrink: 0,
        }}
      />
    </span>
  );
}
