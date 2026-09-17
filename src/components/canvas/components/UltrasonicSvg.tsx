import React from 'react';
import type { CircuitComponent } from '../../../types/circuit';

interface Props {
  component: CircuitComponent;
  isSelected: boolean;
  onPinClick: (pinId: string, event: React.MouseEvent) => void;
  onDistanceChange?: (dist: number) => void;
  highlightPinIds: string[];
}

export const UltrasonicSvg: React.FC<Props> = ({
  component,
  isSelected,
  onPinClick,
  onDistanceChange,
  highlightPinIds,
}) => {
  const dist = component.attributes?.distance ?? component.properties?.distance ?? 50;

  return (
    <g
      id={`comp-${component.instanceId || component.id}`}
      transform={`translate(${component.x}, ${component.y}) rotate(${component.rotation})`}
      style={{ cursor: 'move' }}
    >
      {/* Selection outline */}
      {isSelected && (
        <rect
          x="-4"
          y="-4"
          width="128"
          height="96"
          rx="6"
          fill="none"
          stroke="#06b6d4"
          strokeWidth="2"
          strokeDasharray="4 3"
        />
      )}

      {/* PCB Base */}
      <rect x="0" y="0" width="120" height="65" rx="5" fill="#0284c7" stroke="#0369a1" strokeWidth="1.5" />

      {/* Two Cylinders (T and R) */}
      <circle cx="32" cy="32" r="20" fill="#e2e8f0" stroke="#64748b" strokeWidth="1.5" />
      <circle cx="32" cy="32" r="12" fill="#334155" />
      <text x="32" y="36" fill="#f8fafc" fontSize="10" fontWeight="bold" textAnchor="middle">
        T
      </text>

      <circle cx="88" cy="32" r="20" fill="#e2e8f0" stroke="#64748b" strokeWidth="1.5" />
      <circle cx="88" cy="32" r="12" fill="#334155" />
      <text x="88" y="36" fill="#f8fafc" fontSize="10" fontWeight="bold" textAnchor="middle">
        R
      </text>

      <text x="60" y="14" fill="#ffffff" fontSize="7" fontWeight="bold" textAnchor="middle">
        HC-SR04
      </text>

      {/* Distance badge */}
      <g
        transform="translate(60, 50)"
        onClick={(e) => {
          e.stopPropagation();
          const next = dist <= 20 ? 80 : dist - 25;
          onDistanceChange?.(next);
        }}
        style={{ cursor: 'pointer' }}
      >
        <rect x="-22" y="-7" width="44" height="14" rx="4" fill="#0f172a" stroke="#38bdf8" strokeWidth="1" />
        <text y="3" fill="#38bdf8" fontSize="7.5" fontWeight="bold" textAnchor="middle">
          {dist} cm
        </text>
      </g>

      {/* 4 Header Pins */}
      {[
        { id: 'vcc', x: 25, y: 75, label: 'VCC', color: '#ef4444', name: 'VCC (+5V Nguồn)' },
        { id: 'trig', x: 45, y: 75, label: 'TRIG', color: '#3b82f6', name: 'Trigger (Kích sóng)' },
        { id: 'echo', x: 65, y: 75, label: 'ECHO', color: '#06b6d4', name: 'Echo (Phản xạ sóng)' },
        { id: 'gnd', x: 85, y: 75, label: 'GND', color: '#111827', name: 'GND (Nối đất)' },
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
          <line x1="0" y1="-10" x2="0" y2="0" stroke="#94a3b8" strokeWidth="2" />
          <circle r="4" fill={highlightPinIds.includes(pin.id) ? '#10b981' : '#cbd5e1'} stroke="#334155" strokeWidth="1" />
          <text y="14" fill={pin.color} fontSize="6" fontWeight="bold" textAnchor="middle">
            {pin.label}
          </text>
        </g>
      ))}
    </g>
  );
};
