import React from 'react';
import type { CircuitComponent } from '../../../types/circuit';

interface Props {
  component: CircuitComponent;
  isSelected: boolean;
  onPinClick: (pinId: string, event: React.MouseEvent) => void;
  highlightPinIds: string[];
}

export const LedRgbSvg: React.FC<Props> = ({
  component,
  isSelected,
  onPinClick,
  highlightPinIds,
}) => {
  const compId = component.instanceId || component.id;
  const rgbColor = component.properties?.rgbColor || '#a855f7';

  return (
    <g
      id={`comp-${compId}`}
      transform={`translate(${component.x}, ${component.y}) rotate(${component.rotation})`}
      style={{ cursor: 'move' }}
    >
      {/* Selection Box */}
      {isSelected && (
        <rect
          x="-6"
          y="-6"
          width="82"
          height="102"
          rx="8"
          fill="none"
          stroke="#06b6d4"
          strokeWidth="1.8"
          strokeDasharray="4 3"
        />
      )}

      {/* LED Epoxy Bulb Body */}
      <path
        d="M 20 40 A 15 15 0 0 1 50 40 L 50 48 L 20 48 Z"
        fill={rgbColor}
        opacity="0.85"
        stroke="#ffffff"
        strokeWidth="1.2"
      />
      {/* Internal Anode / Cathode Flag reflections */}
      <path d="M 28 40 L 32 32 L 38 40 Z" fill="#ffffff" opacity="0.4" />
      {/* Rim Base */}
      <rect x="18" y="48" width="34" height="5" rx="1.5" fill={rgbColor} stroke="#ffffff" strokeWidth="0.8" />

      {/* 4 Metal Legs leading down to pin terminals */}
      <line x1="16" y1="53" x2="16" y2="78" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
      <line x1="28" y1="53" x2="28" y2="78" stroke="#94a3b8" strokeWidth="2.4" strokeLinecap="round" />
      <line x1="42" y1="53" x2="42" y2="78" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
      <line x1="54" y1="53" x2="54" y2="78" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />

      {/* Dynamic 4 Pins (R, Cathode/GND, G, B) */}
      {component.pins.map((pin) => {
        const isHighlighted = highlightPinIds.includes(pin.id);

        return (
          <g
            key={pin.id}
            transform={`translate(${pin.x}, ${pin.y})`}
            onClick={(e) => {
              e.stopPropagation();
              onPinClick(pin.id, e);
            }}
            className="pin-terminal group"
          >
            <circle r="7" fill="transparent" pointerEvents="all" className="pin-hitbox" />
            <circle r="5.5" fill="none" stroke="#38bdf8" strokeWidth="1.2" className="pin-hover-ring" />

            {isHighlighted && (
              <circle r="8" fill="none" stroke="#10b981" strokeWidth="2">
                <animate attributeName="r" values="4;9;4" dur="1.2s" repeatCount="indefinite" />
              </circle>
            )}

            <circle
              r="3.5"
              fill={isHighlighted ? '#10b981' : '#1e293b'}
              stroke={isHighlighted ? '#34d399' : '#94a3b8'}
              strokeWidth="1.2"
            />

            <text
              y={12}
              fill={isHighlighted ? '#34d399' : '#e2e8f0'}
              fontSize="5.5"
              fontFamily="var(--font-mono)"
              fontWeight="bold"
              textAnchor="middle"
              pointerEvents="none"
            >
              {pin.label}
            </text>
          </g>
        );
      })}
    </g>
  );
};
