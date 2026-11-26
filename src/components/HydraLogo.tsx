import React from 'react';

interface HydraLogoProps {
  size?: number;
  className?: string;
  color?: string;
}

/**
 * Adaptive 5-headed geometric circuit HYDRA emblem.
 * Uses currentColor by default to adapt seamlessly to Light and Dark modes.
 */
export const HydraLogo: React.FC<HydraLogoProps> = ({
  size = 28,
  className = '',
  color = 'currentColor'
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="HYDRA Logo"
    >
      {/* Center head */}
      <polygon
        points="46,12 54,12 58,19 50,27 42,19"
        stroke={color}
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <polygon
        points="47.5,15 52.5,15 54.5,19 50,23.5 45.5,19"
        stroke={color}
        strokeWidth="1.4"
        strokeLinejoin="round"
        opacity="0.7"
      />
      <line x1="50" y1="27" x2="50" y2="86" stroke={color} strokeWidth="2.4" strokeLinecap="round" />

      {/* Upper-left head & circuit path */}
      <path
        d="M47,55 L35,43 L35,31 L29,25 L19,25 L13,31 L18,35 L26,35 L30,31"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="20.5" cy="29.5" r="1.4" fill={color} />

      {/* Upper-right head & circuit path */}
      <path
        d="M53,55 L65,43 L65,31 L71,25 L81,25 L87,31 L82,35 L74,35 L70,31"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="79.5" cy="29.5" r="1.4" fill={color} />

      {/* Lower-left head & circuit path */}
      <path
        d="M44,82 L44,68 L28,53 L28,45 L22,39 L12,39 L6,45 L11,49 L20,49 L23,45"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="13.5" cy="43.5" r="1.4" fill={color} />

      {/* Lower-right head & circuit path */}
      <path
        d="M56,82 L56,68 L72,53 L72,45 L78,39 L88,39 L94,45 L89,49 L80,49 L77,45"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="86.5" cy="43.5" r="1.4" fill={color} />

      {/* Inner circuit traces */}
      <path d="M47,79 L47,63 L33,49" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.65" />
      <path d="M53,79 L53,63 L67,49" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.65" />
    </svg>
  );
};
