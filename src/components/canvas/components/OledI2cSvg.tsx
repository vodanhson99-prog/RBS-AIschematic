import React from 'react';
import type { CircuitComponent } from '../../../types/circuit';

interface Props {
  component: CircuitComponent;
  isSelected: boolean;
  onPinClick: (pinId: string, event: React.MouseEvent) => void;
  highlightPinIds: string[];
}

export const OledI2cSvg: React.FC<Props> = ({
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
          width="132"
          height="132"
          rx="8"
          fill="none"
          stroke="#06b6d4"
          strokeWidth="1.8"
          strokeDasharray="4 3"
        />
      )}

      {/* Blue PCB Frame */}
      <rect
        x="0"
        y="0"
        width="120"
        height="120"
        rx="6"
        fill="#1e3a8a"
        stroke="#2563eb"
        strokeWidth="1.5"
      />

      {/* 4 Mounting Corner Holes */}
      {[
        [8, 8],
        [112, 8],
        [8, 112],
        [112, 112],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="3.5" fill="#0f172a" stroke="#60a5fa" strokeWidth="1" />
      ))}

      {/* OLED Glass Screen (Black) */}
      <rect x="12" y="32" width="96" height="68" rx="3" fill="#000000" stroke="#334155" strokeWidth="1.5" />

      {/* Top Yellow Bar emulation */}
      <text x="18" y="44" fill="#facc15" fontSize="7" fontFamily="var(--font-mono)" fontWeight="bold">
        ESP32 I2C 0x3C
      </text>

      {/* Cyan Graphic waveform / text */}
      <text x="18" y="60" fill="#38bdf8" fontSize="8" fontFamily="var(--font-mono)" fontWeight="bold">
        AI STUDIO 128x64
      </text>
      <polyline
        points="18,78 30,78 35,68 42,88 48,72 55,78 70,78 80,68 90,82 102,78"
        fill="none"
        stroke="#06b6d4"
        strokeWidth="1.5"
      />

      {/* Header Bar at Top with 4 pins */}
      <rect x="25" y="6" width="70" height="14" rx="2" fill="#090d16" stroke="#1e293b" />

      {/* Dynamic 4 Pins (GND, VCC, SCL, SDA) */}
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
              r="3.8"
              fill={isHighlighted ? '#10b981' : '#1e293b'}
              stroke={isHighlighted ? '#34d399' : '#94a3b8'}
              strokeWidth="1.2"
            />
            <circle r="1.5" fill={isHighlighted ? '#ffffff' : '#090d16'} />

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
