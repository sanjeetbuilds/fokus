'use client';

interface WordmarkProps {
  size?: 'sm' | 'lg' | 'xl';
}

export default function Wordmark({ size = 'sm' }: WordmarkProps) {
  const configs = {
    sm:  { fontSize: 15, dotSize: 4,  dotMargin: 1.5, dotOffset: -1.5 },
    lg:  { fontSize: 32, dotSize: 8,  dotMargin: 2,   dotOffset: -3   },
    xl:  { fontSize: 52, dotSize: 13, dotMargin: 3,   dotOffset: -4   },
  };
  const c = configs[size];
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'baseline',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      fontSize: c.fontSize,
      fontWeight: 800,
      color: '#252630',
      letterSpacing: '-0.035em',
      lineHeight: 1,
      userSelect: 'none',
    }}>
      fokus
      <span style={{
        display: 'inline-block',
        width: c.dotSize,
        height: c.dotSize,
        borderRadius: '50%',
        background: '#9CA5FF',
        marginLeft: c.dotMargin,
        transform: `translateY(${c.dotOffset}px)`,
        flexShrink: 0,
      }} />
    </span>
  );
}
