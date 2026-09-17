import React from 'react';
import type { CircuitComponent } from '../../../types/circuit';

interface Props {
  component: CircuitComponent;
  isSelected: boolean;
  isLit?: boolean;
  onPinClick: (pinId: string, event: React.MouseEvent) => void;
  highlightPinIds: string[];
}

export const LedSvg: React.FC<Props> = ({
  component,
  isSelected,
  isLit = false,
  onPinClick,
  highlightPinIds,
}) => {
  const color = component.attributes?.color || component.properties?.color || 'red';

  const colorConfig: Record<string, { body: string; glow: string; halo: string }> = {
    red: { body: '#ef4444', glow: '#f87171', halo: 'rgba(239, 68, 68, 0.7)' },
    yellow: { body: '#eab308', glow: '#fde047', halo: 'rgba(234, 179, 8, 0.7)' },
    green: { body: '#10b981', glow: '#34d399', halo: 'rgba(16, 185, 129, 0.7)' },
    blue: { body: '#3b82f6', glow: '#60a5fa', halo: 'rgba(59, 130, 246, 0.7)' },
  };

  const theme = colorConfig[color] || colorConfig.red;

  return (
    <g
      id={`comp-${component.instanceId || component.id}`}
      transform={`translate(${component.x}, ${component.y}) rotate(${component.rotation})`}
      style={{ cursor: 'move' }}
    >
      {/* Selection outline */}
      {isSelected && (
        <rect
          x="-6"
          y="-6"
          width="60"
          height="82"
          rx="8"
          fill="none"
          stroke="#06b6d4"
          strokeWidth="2"
          strokeDasharray="4 3"
        />
      )}

      {/* Radiant glow aura when lit */}
      {isLit && (
        <circle
          cx="24"
          cy="22"
          r="30"
          fill={theme.halo}
          filter="blur(8px)"
        />
      )}

      {/* Minimalist Pin Leads */}
      {/* Anode (+) bent lead */}
      <path
        d="M 20 38 L 20 48 L 16 54 L 16 65"
        stroke="#94a3b8"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      {/* Cathode (-) straight lead */}
      <path
        d="M 28 38 L 28 48 L 32 54 L 32 65"
        stroke="#64748b"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />

      {/* LED Flat Base Rim */}
      <rect
        x="12"
        y="36"
        width="24"
        height="4"
        rx="1"
        fill={isLit ? theme.glow : theme.body}
        stroke="#0f172a"
        strokeWidth="0.8"
      />

      {/* LED Clean Minimalist Dome */}
      <path
        d="M 14 36 C 14 12, 34 12, 34 36 Z"
        fill={isLit ? theme.glow : theme.body}
        opacity={isLit ? 1 : 0.9}
        stroke="#1e293b"
        strokeWidth="1.2"
        filter={isLit ? `drop-shadow(0 0 12px ${theme.body})` : undefined}
      />

      {/* Internal highlight reflection */}
      <circle cx="21" cy="20" r="2.5" fill="#ffffff" opacity={isLit ? 0.8 : 0.4} />

      {/* Pin 1: Anode (+) Terminal */}
      <g
        className="pin-terminal"
        data-pin-id="anode"
        data-comp-id={component.instanceId || component.id}
        transform="translate(16, 65)"
        onMouseDown={(e) => {
          e.stopPropagation();
        }}
        onClick={(e) => {
          e.stopPropagation();
          onPinClick('anode', e);
        }}
      >
        <title>Anode (+) Cực dương</title>
        {/* Generous Hitbox */}
        <circle r="9" fill="transparent" pointerEvents="all" className="pin-hitbox" />
        {/* Hover Ring */}
        <circle r="7.5" fill="none" stroke="#38bdf8" strokeWidth="1.3" className="pin-hover-ring" />
        {highlightPinIds.includes('anode') && (
          <circle r="9" fill="none" stroke="#10b981" strokeWidth="2">
            <animate attributeName="r" values="5;10;5" dur="1s" repeatCount="indefinite" />
          </circle>
        )}
        <circle r="4.5" fill={highlightPinIds.includes('anode') ? '#10b981' : '#cbd5e1'} stroke="#334155" strokeWidth="1" />
        <text y="14" fill="#ef4444" fontSize="7" fontWeight="bold" textAnchor="middle">
          +
        </text>
      </g>

      {/* Pin 2: Cathode (-) Terminal */}
      <g
        className="pin-terminal"
        data-pin-id="cathode"
        data-comp-id={component.instanceId || component.id}
        transform="translate(32, 65)"
        onMouseDown={(e) => {
          e.stopPropagation();
        }}
        onClick={(e) => {
          e.stopPropagation();
          onPinClick('cathode', e);
        }}
      >
        <title>Cathode (-) Cực âm</title>
        {/* Generous Hitbox */}
        <circle r="9" fill="transparent" pointerEvents="all" className="pin-hitbox" />
        {/* Hover Ring */}
        <circle r="7.5" fill="none" stroke="#38bdf8" strokeWidth="1.3" className="pin-hover-ring" />
        {highlightPinIds.includes('cathode') && (
          <circle r="9" fill="none" stroke="#10b981" strokeWidth="2">
            <animate attributeName="r" values="5;10;5" dur="1s" repeatCount="indefinite" />
          </circle>
        )}
        <circle r="4.5" fill={highlightPinIds.includes('cathode') ? '#10b981' : '#94a3b8'} stroke="#334155" strokeWidth="1" />
        <text y="14" fill="#3b82f6" fontSize="7" fontWeight="bold" textAnchor="middle">
          -
        </text>
      </g>
    </g>
  );
};
