import React from 'react';

export function TravelKartLogoAlt({ className = "w-12 h-12", color = "#1E3A8A", accentColor = "#F97316" }) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="altLogoMainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>
        <linearGradient id="altLogoAccentGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={accentColor} />
          <stop offset="100%" stopColor="#FBBF24" />
        </linearGradient>
      </defs>

      {/* Globe Grid Lines */}
      <circle cx="50" cy="50" r="40" stroke="url(#altLogoMainGrad)" strokeWidth="3" opacity="0.15" />
      <path d="M 10 50 H 90" stroke="url(#altLogoMainGrad)" strokeWidth="2" opacity="0.15" />
      <path d="M 50 10 V 90" stroke="url(#altLogoMainGrad)" strokeWidth="2" opacity="0.15" />
      
      {/* Elliptical Orbiting Cart Path */}
      <path 
        d="M 18 68 C 12 50, 22 24, 50 20 C 78 16, 92 38, 82 56 C 74 70, 52 82, 34 78" 
        stroke="url(#altLogoAccentGrad)" 
        strokeWidth="3.5" 
        strokeDasharray="6 4" 
        strokeLinecap="round" 
      />

      {/* Origami Jet Plane / Compass Arrow */}
      <g transform="translate(50, 50) rotate(-45)">
        {/* Right wing side */}
        <path d="M 0 0 L 30 -10 L 10 10 L 0 35 Z" fill="url(#altLogoMainGrad)" />
        {/* Left wing side */}
        <path d="M 0 0 L -10 30 L 10 10 L 35 0 Z" fill="url(#altLogoAccentGrad)" />
        {/* Center spine */}
        <line x1="0" y1="0" x2="10" y2="10" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
      </g>
    </svg>
  );
}

export default TravelKartLogoAlt;
