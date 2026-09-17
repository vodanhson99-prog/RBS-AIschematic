import React from 'react';
import type { CircuitComponent } from '../../../types/circuit';

interface Props {
  component: CircuitComponent;
  isSelected: boolean;
  onPinClick: (pinId: string, event: React.MouseEvent) => void;
  onValueChange?: (val: number) => void;
  highlightPinIds: string[];
}

export const PotentiometerSvg: React.FC<Props> = ({
  component,
  isSelected,
  onPinClick,
  onValueChange,
  highlightPinIds,
}) => {
  const potVal = component.attributes?.potValue ?? component.properties?.potValue ?? 512;
  const knobAngle = -135 + (potVal / 1023) * 270;

  const handleKnobClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextVal = (potVal + 250) % 1024;
    onValueChange?.(nextVal);
  };

  return (
    <g
      id={`comp-${component.instanceId || component.id}`}
      transform={`translate(${component.x}, ${component.y}) rotate(${component.rotation})`}
      style={{ cursor: 'move' }}
    >
      {/* Selection outline */}
      {isSelected && (
        <rect
          x="2"
          y="2"
          width="66"
          height="80"
          rx="6"
          fill="none"
          stroke="#06b6d4"
          strokeWidth="2"
          strokeDasharray="4 3"
        />
      )}

      {/* Main Base Housing */}
      <rect x="8" y="10" width="54" height="48" rx="6" fill="#0369a1" stroke="#0284c7" strokeWidth="1" />

      {/* Outer Dial Rim */}
      <circle cx="35" cy="34" r="18" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />

      {/* Rotating Dial Knob */}
      <g transform={`rotate(${knobAngle}, 35, 34)`} onClick={handleKnobClick} style={{ cursor: 'pointer' }}>
        <circle cx="35" cy="34" r="14" fill="#0f172a" stroke="#38bdf8" strokeWidth="1" />
        <line x1="35" y1="22" x2="35" y2="28" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
      </g>

      {/* Value label */}
      <text x="35" y="6" fill="#38bdf8" fontSize="7.5" fontWeight="600" textAnchor="middle">
        {Math.round((potVal / 1023) * 100)}% ({((potVal / 1023) * 5).toFixed(1)}V)
      </text>

      {/* 3 Terminal Legs (1: VCC, 2: Wiper, 3: GND) */}
      <line x1="15" y1="58" x2="15" y2="70" stroke="#94a3b8" strokeWidth="2" />
      <line x1="35" y1="58" x2="35" y2="70" stroke="#94a3b8" strokeWidth="2" />
      <line x1="55" y1="58" x2="55" y2="70" stroke="#94a3b8" strokeWidth="2" />

      {[
        { id: 'vcc', x: 15, y: 70, label: '5V', name: 'VCC (+5V)' },
        { id: 'wiper', x: 35, y: 70, label: 'SIG', name: 'Tín hiệu gạt (Wiper)' },
        { id: 'gnd', x: 55, y: 70, label: 'GND', name: 'Nối đất (GND)' },
      ].map((pin) => (
        <g
          key={pin.id}
          className="pin-terminal"
          data-pin-id={pin.id}
          data-comp-id={component.instanceId || component.id}
          transform={`translate(${pin.x}, ${pin.y})`}
          onMouseDown={(e) => {
            e.stopPropagation();
          }}
          onClick={(e) => {
            e.stopPropagation();
            onPinClick(pin.id, e);
          }}
        >
          <title>{pin.name}</title>
          {/* Generous Hitbox */}
          <circle r="9" fill="transparent" pointerEvents="all" className="pin-hitbox" />
          {/* Hover Ring */}
          <circle r="7" fill="none" stroke="#38bdf8" strokeWidth="1.3" className="pin-hover-ring" />
          {highlightPinIds.includes(pin.id) && (
            <circle r="9" fill="none" stroke="#10b981" strokeWidth="2">
              <animate attributeName="r" values="5;10;5" dur="1s" repeatCount="indefinite" />
            </circle>
          )}
          <circle r="4" fill={highlightPinIds.includes(pin.id) ? '#10b981' : '#cbd5e1'} stroke="#334155" strokeWidth="1" />
          <text y="14" fill="#94a3b8" fontSize="6.5" fontWeight="600" textAnchor="middle">
            {pin.label}
          </text>
        </g>
      ))}
    </g>
  );
};
