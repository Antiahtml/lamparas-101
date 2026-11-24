const paths: Record<string, string> = {
  play: 'M7 4.5v15l12-7.5z',
  pause: 'M7 5h3.5v14H7zM13.5 5H17v14h-3.5z',
  restart: 'M4 12a8 8 0 1 0 2.4-5.7M4 4v4.5h4.5',
  rotL: 'M9 7H4V2M4.6 7A8.5 8.5 0 1 1 3.5 13',
  rotR: 'M15 7h5V2M19.4 7A8.5 8.5 0 1 0 20.5 13',
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  target: 'M12 3v3M12 18v3M3 12h3M18 12h3M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z',
  tag: 'M3 12V4h8l10 10-8 8zM7.5 8.5h.01',
  explode: 'M9 9H4V4M15 9h5V4M9 15H4v5M15 15h5v5M9 9l-5-5M15 9l5-5M9 15l-5 5M15 15l5 5',
  ruler: 'M3 16.5 16.5 3 21 7.5 7.5 21zM7 12.5l2 2M10 9.5l2 2M13 6.5l2 2',
  turn: 'M3 12c0-2.5 4-4.5 9-4.5s9 2 9 4.5-4 4.5-9 4.5M12 16.5l-3-3M12 16.5l-3 3',
  panel: 'M4 4h16v16H4zM15 4v16',
  bench: 'M3 10h18M5 10v9M19 10v9M3 10l2-5h14l2 5',
  file: 'M6 3h8l4 4v14H6zM14 3v4h4',
  check: 'M5 12.5l4.5 4.5L19 7',
  x: 'M6 6l12 12M18 6 6 18',
  bolt: 'M13 3 5 14h6l-1 7 8-11h-6z',
  arrow: 'M5 12h14M13 6l6 6-6 6',
  hand: 'M8 13V5.5a1.5 1.5 0 0 1 3 0V12M11 11V4.5a1.5 1.5 0 0 1 3 0V12M14 11.5V6a1.5 1.5 0 0 1 3 0v8c0 4-2.5 7-6.5 7-3 0-4.5-1.5-6-4l-2-3.5a1.5 1.5 0 0 1 2.5-1.5L8 13',
}

export function Icon({ name, size = 20, className = '' }: { name: keyof typeof paths | string; size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden className={className}>
      <path d={paths[name]} fill={name === 'play' || name === 'pause' ? 'currentColor' : 'none'} />
    </svg>
  )
}
