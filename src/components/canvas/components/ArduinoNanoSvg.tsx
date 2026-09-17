import React from 'react';
import type { CircuitComponent } from '../../../types/circuit';

interface Props {
  component: CircuitComponent;
  isSelected: boolean;
  onPinClick: (pinId: string, event: React.MouseEvent) => void;
  highlightPinIds: string[];
}

export const ArduinoNanoSvg: React.FC<Props> = ({
  component,
  isSelected,
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
      {/* Selection Bounding Box */}
      {isSelected && (
        <rect
          x="-8"
          y="-8"
          width="166"
          height="286"
          rx="10"
          fill="none"
          stroke="#06b6d4"
          strokeWidth="2"
          strokeDasharray="6 4"
        />
      )}

      {/* Nano PCB Board (Deep Classic Blue) */}
      <rect
        x="0"
        y="0"
        width="150"
        height="270"
        rx="6"
        fill="#075985"
        stroke="#0284c7"
        strokeWidth="2"
      />

      {/* USB Mini-B Connector at Top */}
      <rect x="52" y="-12" width="46" height="32" rx="3" fill="#64748b" stroke="#cbd5e1" strokeWidth="1.2" />
      <rect x="60" y="-10" width="30" height="12" rx="1.5" fill="#0f172a" />

      {/* Central ATmega328P Chip */}
      <rect
        x="55"
        y="110"
        width="40"
        height="40"
        rx="3"
        fill="#0f172a"
        stroke="#334155"
        strokeWidth="1.2"
        transform="rotate(45, 75, 130)"
      />
      <circle cx="70" cy="115" r="2.5" fill="#64748b" />
      <text x="75" y="132" fill="#94a3b8" fontSize="5.5" fontFamily="var(--font-mono)" fontWeight="bold" textAnchor="middle">
        328P
      </text>

      {/* Reset Tactile Switch */}
      <rect x="62" y="65" width="26" height="24" rx="2" fill="#cbd5e1" stroke="#475569" />
      <circle cx="75" cy="77" r="5" fill="#ef4444" />

      {/* Board Typography */}
      <text x="75" y="195" fill="#f8fafc" fontSize="10" fontFamily="system-ui" fontWeight="900" textAnchor="middle">
        NANO V3
      </text>
      <text x="75" y="210" fill="#7dd3fc" fontSize="6" fontFamily="var(--font-mono)" textAnchor="middle">
        ARDUINO COMPATIBLE
      </text>

      {/* Dual Pin Header Rails */}
      <rect x="8" y="24" width="16" height="232" rx="3" fill="#020617" stroke="#1e293b" />
      <rect x="126" y="24" width="16" height="232" rx="3" fill="#020617" stroke="#1e293b" />

      {/* Dynamic Pin Terminals */}
      {component.pins.map((pin) => {
        const isHighlighted = highlightPinIds.includes(pin.id);
        const isLeft = pin.x <= 30;

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
            <circle r="8" fill="transparent" pointerEvents="all" className="pin-hitbox" />
            <circle r="6" fill="none" stroke="#38bdf8" strokeWidth="1.2" className="pin-hover-ring" />

            {isHighlighted && (
              <circle r="9" fill="none" stroke="#10b981" strokeWidth="2.2">
                <animate attributeName="r" values="5;10;5" dur="1.2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="1;0.2;1" dur="1.2s" repeatCount="indefinite" />
              </circle>
            )}

            <circle
              r="4"
              fill={isHighlighted ? '#10b981' : '#1e293b'}
              stroke={isHighlighted ? '#34d399' : '#64748b'}
              strokeWidth="1.2"
            />
            <circle r="1.6" fill={isHighlighted ? '#ffffff' : '#090d16'} />

            {/* Inward Facing Pin Labels */}
            <text
              x={isLeft ? 13 : -13}
              y={3}
              fill={isHighlighted ? '#34d399' : '#e2e8f0'}
              fontSize="6"
              fontFamily="var(--font-mono)"
              fontWeight="bold"
              textAnchor={isLeft ? 'start' : 'end'}
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
