import React from 'react';
import type { CircuitComponent } from '../../../types/circuit';

interface Props {
  component: CircuitComponent;
  isSelected: boolean;
  onPinClick: (pinId: string, event: React.MouseEvent) => void;
  highlightPinIds: string[];
  overrideAngle?: number;
}

export const ServoSvg: React.FC<Props> = ({
  component,
  isSelected,
  onPinClick,
  highlightPinIds,
  overrideAngle,
}) => {
  const compId = component.instanceId || component.id;
  const props = component.attributes || component.properties || {};
  const angle = overrideAngle ?? props.angle ?? 90;


  return (
    <g
      id={`comp-${compId}`}
      transform={`translate(${component.x}, ${component.y}) rotate(${component.rotation})`}
      style={{ cursor: 'move' }}
    >
      {/* Minimalist Selection Outline */}
      {isSelected && (
        <rect
          x="6"
          y="6"
          width="88"
          height="82"
          rx="6"
          fill="none"
          stroke="#06b6d4"
          strokeWidth="2"
          strokeDasharray="4 3"
        />
      )}

      {/* Mounting Tabs */}
      <rect x="8" y="24" width="84" height="12" rx="2" fill="#0284c7" stroke="#0369a1" strokeWidth="1" />
      <circle cx="14" cy="30" r="2.5" fill="#0b0f19" />
      <circle cx="86" cy="30" r="2.5" fill="#0b0f19" />

      {/* Main Servo Body */}
      <rect x="22" y="14" width="56" height="46" rx="4" fill="#0284c7" stroke="#0369a1" strokeWidth="1.5" />

      {/* Gear Top Center */}
      <circle cx="50" cy="32" r="13" fill="#0369a1" />
      <circle cx="50" cy="32" r="4.5" fill="#f8fafc" />

      {/* Rotating Servo Horn Arm */}
      <g transform={`rotate(${angle - 90}, 50, 32)`} style={{ transition: 'transform 0.2s ease-out' }}>
        <path d="M 47 32 L 48.5 8 L 51.5 8 L 53 32 Z" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />
        <circle cx="50" cy="12" r="1.5" fill="#94a3b8" />
        <circle cx="50" cy="20" r="1.5" fill="#94a3b8" />
      </g>

      <text x="50" y="53" fill="#ffffff" fontSize="7" fontWeight="bold" textAnchor="middle">
        SG90
      </text>

      {/* 3-pin Ribbon Leads */}
      <line x1="32" y1="60" x2="32" y2="72" stroke="#64748b" strokeWidth="2" strokeLinecap="round" />
      <line x1="50" y1="60" x2="50" y2="72" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
      <line x1="68" y1="60" x2="68" y2="72" stroke="#f97316" strokeWidth="2" strokeLinecap="round" />

      {[
        { id: 'gnd', x: 32, y: 72, label: 'GND', color: '#94a3b8', name: 'GND (Nối đất - Nâu/Đen)' },
        { id: 'vcc', x: 50, y: 72, label: '5V', color: '#ef4444', name: '5V (Nguồn - Đỏ)' },
        { id: 'sig', x: 68, y: 72, label: 'SIG', color: '#f97316', name: 'Signal (Tín hiệu xung - Cam/Vàng)' },
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
          <circle r="8.5" fill="transparent" pointerEvents="all" className="pin-hitbox" />
          {/* Hover Ring */}
          <circle r="7" fill="none" stroke="#38bdf8" strokeWidth="1.3" className="pin-hover-ring" />
          {highlightPinIds.includes(pin.id) && (
            <circle r="8" fill="none" stroke="#10b981" strokeWidth="2">
              <animate attributeName="r" values="5;9;5" dur="1s" repeatCount="indefinite" />
            </circle>
          )}
          <circle r="4" fill={highlightPinIds.includes(pin.id) ? '#10b981' : '#cbd5e1'} stroke="#475569" strokeWidth="1" />
          <text y="13" fill={pin.color} fontSize="6" fontWeight="bold" textAnchor="middle">
            {pin.label}
          </text>
        </g>
      ))}
    </g>
  );
};
