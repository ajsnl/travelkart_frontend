import React from 'react';

export function TravelKartLogoMain({ className = "w-12 h-12", color = "#00236F", accentColor = "#FF8F4F" }) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* Gradients */}
        <linearGradient id="mainLogoGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>
        <linearGradient id="accentLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={accentColor} />
          <stop offset="100%" stopColor="#F97316" />
        </linearGradient>
        
        {/* Glow filter */}
        <filter id="logoGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      
      {/* Globe Lat/Long Compass Arc */}
      <path 
        d="M 50 12 A 38 38 0 0 1 88 50 A 38 38 0 0 1 50 88 A 38 38 0 0 1 12 50" 
        stroke="url(#mainLogoGrad)" 
        strokeWidth="2" 
        strokeLinecap="round" 
        opacity="0.3" 
      />
      <path 
        d="M 50 12 A 38 38 0 0 0 12 50" 
        stroke="url(#accentLogoGrad)" 
        strokeWidth="3.5" 
        strokeLinecap="round" 
      />

      {/* Abstract Kart Chassis */}
      <path 
        d="M 22 36 L 28 36 L 36 60 L 68 60" 
        stroke="url(#mainLogoGrad)" 
        strokeWidth="4.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      
      {/* Compass / Wheel Targets */}
      <circle cx="38" cy="72" r="7" fill="none" stroke="url(#mainLogoGrad)" strokeWidth="3" />
      <circle cx="38" cy="72" r="2" fill="url(#accentLogoGrad)" />
      
      <circle cx="62" cy="72" r="7" fill="none" stroke="url(#mainLogoGrad)" strokeWidth="3" />
      <circle cx="62" cy="72" r="2" fill="url(#accentLogoGrad)" />

      {/* Soaring Flight Wing / Jet Silhouette (representing travel speed) */}
      <path 
        d="M 34 42 L 82 24 L 54 52 L 42 46 Z" 
        fill="url(#mainLogoGrad)" 
        filter="url(#logoGlow)" 
      />
      <path 
        d="M 82 24 L 54 52 L 68 38 Z" 
        fill="url(#accentLogoGrad)" 
      />
    </svg>
  );
}

export default TravelKartLogoMain;
