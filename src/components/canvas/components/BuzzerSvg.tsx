import React from 'react';
import type { CircuitComponent } from '../../../types/circuit';

interface Props {
  component: CircuitComponent;
  isSelected: boolean;
  isActive?: boolean;
  onPinClick: (pinId: string, event: React.MouseEvent) => void;
  highlightPinIds: string[];
}

export const BuzzerSvg: React.FC<Props> = ({
  component,
  isSelected,
  isActive = false,
  onPinClick,
  highlightPinIds,
}) => {
  const compId = component.instanceId || component.id;

  return (
    <g
      id={`comp-${compId}`}
      transform={`translate(${component.x}, ${component.y}) rotate(${component.rotation})`}
      style={{ cursor: 'move' }}
    >
      {/* Minimalist Selection Outline */}
      {isSelected && (
        <rect
          x="4"
          y="4"
          width="64"
          height="80"
          rx="6"
          fill="none"
          stroke="#06b6d4"
          strokeWidth="2"
          strokeDasharray="4 3"
        />
      )}

      {/* Subtle Sound Waves Pulse */}
      {isActive && (
        <circle cx="36" cy="36" r="30" fill="none" stroke="#f59e0b" strokeWidth="2" opacity="0.6">
          <animate attributeName="r" values="24;36;24" dur="0.8s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.8;0.1;0.8" dur="0.8s" repeatCount="indefinite" />
        </circle>
      )}

      {/* Minimalist Matte Piezo Disc Body */}
      <circle cx="36" cy="36" r="26" fill="#1e293b" stroke="#334155" strokeWidth="2" />
      <circle cx="36" cy="36" r="18" fill="#0f172a" stroke="#1e293b" strokeWidth="1" />
      <circle cx="36" cy="36" r="6" fill="#020617" />

      {/* Subtle Polarity Mark */}
      <text x="22" y="28" fill="#ef4444" fontSize="12" fontWeight="700">
        +
      </text>

      {/* Minimalist Pin Leads */}
      <line x1="26" y1="62" x2="26" y2="74" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
      <line x1="46" y1="62" x2="46" y2="74" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />

      {/* Pin 1: Positive (+) */}
      <g
        className="pin-terminal"
        data-pin-id="pos"
        data-comp-id={component.instanceId || component.id}
        transform="translate(26, 74)"
        onMouseDown={(e) => {
          e.stopPropagation();
        }}
        onClick={(e) => {
          e.stopPropagation();
          onPinClick('pos', e);
        }}
      >
        <title>Chân dương (+) Còi Buzzer</title>
        {/* Generous Hitbox */}
        <circle r="9" fill="transparent" pointerEvents="all" className="pin-hitbox" />
        {/* Hover Ring */}
        <circle r="7" fill="none" stroke="#38bdf8" strokeWidth="1.3" className="pin-hover-ring" />
        {highlightPinIds.includes('pos') && (
          <circle r="8" fill="none" stroke="#10b981" strokeWidth="2">
            <animate attributeName="r" values="5;9;5" dur="1s" repeatCount="indefinite" />
          </circle>
        )}
        <circle r="4" fill={highlightPinIds.includes('pos') ? '#10b981' : '#cbd5e1'} stroke="#475569" strokeWidth="1" />
        <text y="14" fill="#ef4444" fontSize="7" fontWeight="bold" textAnchor="middle">
          +
        </text>
      </g>

      {/* Pin 2: Negative (-) */}
      <g
        className="pin-terminal"
        data-pin-id="neg"
        data-comp-id={component.instanceId || component.id}
        transform="translate(46, 74)"
        onMouseDown={(e) => {
          e.stopPropagation();
        }}
        onClick={(e) => {
          e.stopPropagation();
          onPinClick('neg', e);
        }}
      >
        <title>Chân âm (-) Còi Buzzer (GND)</title>
        {/* Generous Hitbox */}
        <circle r="9" fill="transparent" pointerEvents="all" className="pin-hitbox" />
        {/* Hover Ring */}
        <circle r="7" fill="none" stroke="#38bdf8" strokeWidth="1.3" className="pin-hover-ring" />
        {highlightPinIds.includes('neg') && (
          <circle r="8" fill="none" stroke="#10b981" strokeWidth="2">
            <animate attributeName="r" values="5;9;5" dur="1s" repeatCount="indefinite" />
          </circle>
        )}
        <circle r="4" fill={highlightPinIds.includes('neg') ? '#10b981' : '#cbd5e1'} stroke="#475569" strokeWidth="1" />
        <text y="14" fill="#64748b" fontSize="7" fontWeight="bold" textAnchor="middle">
          -
        </text>
      </g>
    </g>
  );
};
