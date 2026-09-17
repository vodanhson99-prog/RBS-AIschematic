import React from 'react';
import type { CircuitComponent } from '../../../types/circuit';

interface Props {
  component: CircuitComponent;
  isSelected: boolean;
  onPinClick: (pinId: string, event: React.MouseEvent) => void;
  highlightPinIds: string[];
}

export const Lcd1602Svg: React.FC<Props> = ({
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
      {/* Selection Box */}
      {isSelected && (
        <rect
          x="-6"
          y="-6"
          width="272"
          height="142"
          rx="10"
          fill="none"
          stroke="#06b6d4"
          strokeWidth="2"
          strokeDasharray="6 4"
        />
      )}

      {/* Main Green/Blue PCB Frame */}
      <rect
        x="0"
        y="0"
        width="260"
        height="130"
        rx="6"
        fill="#14532d"
        stroke="#166534"
        strokeWidth="2"
      />

      {/* Mounting Corner Holes */}
      {[
        [10, 10],
        [250, 10],
        [10, 120],
        [250, 120],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="4.5" fill="#052e16" stroke="#22c55e" strokeWidth="1" />
      ))}

      {/* Metal Bezel Framing the Glass */}
      <rect x="22" y="16" width="216" height="74" rx="4" fill="#0f172a" stroke="#475569" strokeWidth="2" />

      {/* LCD Glass Screen (Classic Blue Backlight or Green) */}
      <rect x="28" y="22" width="204" height="62" rx="2" fill="#1e3a8a" />

      {/* Row 1 text simulation */}
      <text
        x="38"
        y="45"
        fill="#93c5fd"
        fontSize="11"
        fontFamily="var(--font-mono)"
        fontWeight="bold"
        letterSpacing="1.2"
      >
        AI CIRCUIT STUDIO
      </text>

      {/* Row 2 text simulation */}
      <text
        x="38"
        y="68"
        fill="#60a5fa"
        fontSize="11"
        fontFamily="var(--font-mono)"
        fontWeight="bold"
        letterSpacing="1.2"
      >
        SYSTEM READY...
      </text>

      {/* I2C Backpack Adapter Board (Black sub-PCB at bottom) */}
      <rect x="65" y="95" width="130" height="30" rx="3" fill="#090d16" stroke="#334155" strokeWidth="1" />
      <text x="130" y="107" fill="#64748b" fontSize="6.5" fontFamily="var(--font-mono)" textAnchor="middle">
        I2C PCF8574 MODULE (0x27)
      </text>

      {/* Contrast Trimmer Potentiometer on I2C board */}
      <rect x="172" y="100" width="14" height="14" rx="2" fill="#1e40af" stroke="#3b82f6" />
      <circle cx="179" cy="107" r="4" fill="#cbd5e1" />
      <line x1="176" y1="107" x2="182" y2="107" stroke="#334155" strokeWidth="1.2" />

      {/* 4 I2C Pin Terminals (GND, VCC, SDA, SCL) */}
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
            <circle r="8" fill="transparent" pointerEvents="all" className="pin-hitbox" />
            <circle r="6" fill="none" stroke="#38bdf8" strokeWidth="1.2" className="pin-hover-ring" />

            {isHighlighted && (
              <circle r="9" fill="none" stroke="#10b981" strokeWidth="2.2">
                <animate attributeName="r" values="5;10;5" dur="1.2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="1;0.2;1" dur="1.2s" repeatCount="indefinite" />
              </circle>
            )}

            <circle
              r="4.2"
              fill={isHighlighted ? '#10b981' : '#1e293b'}
              stroke={isHighlighted ? '#34d399' : '#64748b'}
              strokeWidth="1.2"
            />
            <circle r="1.8" fill={isHighlighted ? '#ffffff' : '#090d16'} />

            {/* Pin label underneath */}
            <text
              y={14}
              fill={isHighlighted ? '#34d399' : '#e2e8f0'}
              fontSize="6"
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
