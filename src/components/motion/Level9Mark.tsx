"use client";

type Props = {
  size?: number;
  className?: string;
  gradientIdSuffix?: string;
};

export default function Level9Mark({ size = 64, className = "", gradientIdSuffix = "" }: Props) {
  const s = gradientIdSuffix;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 320 320"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label="Level9"
    >
      <defs>
        <linearGradient id={`l9-cool${s}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="55%" stopColor="#06B6D4" />
          <stop offset="100%" stopColor="#0D9488" />
        </linearGradient>
        <linearGradient id={`l9-obs${s}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#14082E" />
          <stop offset="100%" stopColor="#041521" />
        </linearGradient>
        <linearGradient id={`l9-glass${s}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.14" />
          <stop offset="40%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect
        x="40"
        y="40"
        width="240"
        height="240"
        rx="56"
        fill={`url(#l9-obs${s})`}
        stroke={`url(#l9-cool${s})`}
        strokeWidth="1.5"
      />
      <rect x="40" y="40" width="240" height="240" rx="56" fill={`url(#l9-glass${s})`} />
      <text
        x="160"
        y="162"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="Inter, system-ui, sans-serif"
        fontWeight="900"
        fontSize="180"
        fill="#FFFFFF"
        transform="rotate(-14 160 162)"
        style={{ letterSpacing: "-0.04em" }}
      >
        9
      </text>
    </svg>
  );
}
