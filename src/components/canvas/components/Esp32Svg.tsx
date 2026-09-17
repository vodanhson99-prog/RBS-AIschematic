import React from 'react';
import type { CircuitComponent } from '../../../types/circuit';

interface Props {
  component: CircuitComponent;
  isSelected: boolean;
  onPinClick: (pinId: string, event: React.MouseEvent) => void;
  highlightPinIds: string[];
}

export const Esp32Svg: React.FC<Props> = ({
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
          width="236"
          height="316"
          rx="10"
          fill="none"
          stroke="#06b6d4"
          strokeWidth="2"
          strokeDasharray="6 4"
        />
      )}

      {/* PCB Board (Deep Matte Black / Charcoal) */}
      <rect
        x="0"
        y="0"
        width="220"
        height="300"
        rx="8"
        fill="#0b0f19"
        stroke="#1e293b"
        strokeWidth="2"
      />

      {/* Mounting Holes */}
      {[
        [16, 16],
        [204, 16],
        [16, 284],
        [204, 284],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="5" fill="#020617" stroke="#334155" strokeWidth="1.2" />
      ))}

      {/* ESP-WROOM-32 Metal RF Shield */}
      <rect
        x="45"
        y="30"
        width="130"
        height="115"
        rx="4"
        fill="#94a3b8"
        stroke="#cbd5e1"
        strokeWidth="1.5"
      />
      {/* Laser Etching Text on Metal Shield */}
      <text x="110" y="58" fill="#1e293b" fontSize="11" fontFamily="system-ui" fontWeight="900" textAnchor="middle">
        ESP-WROOM-32
      </text>
      <text x="110" y="74" fill="#334155" fontSize="7" fontFamily="var(--font-mono)" fontWeight="700" textAnchor="middle">
        Wi-Fi & Bluetooth MCU
      </text>
      <text x="110" y="88" fill="#475569" fontSize="6" fontFamily="var(--font-mono)" textAnchor="middle">
        FCC ID: 2AC7Z-ESPWROOM32
      </text>
      <rect x="75" y="100" width="70" height="28" rx="2" fill="#64748b" opacity="0.3" />
      <text x="110" y="117" fill="#1e293b" fontSize="6" fontFamily="var(--font-mono)" fontWeight="bold" textAnchor="middle">
        ESPRESSIF
      </text>

      {/* Meandered PCB Inverted-F Antenna (Gold/Yellow trace at top) */}
      <path
        d="M 60 22 L 60 10 L 160 10 L 160 22 M 85 10 L 85 22 M 110 10 L 110 22 M 135 10 L 135 22"
        stroke="#eab308"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />

      {/* CP2102 / CH340 USB-UART Chip */}
      <rect x="90" y="180" width="40" height="35" rx="3" fill="#020617" stroke="#334155" />
      <text x="110" y="201" fill="#64748b" fontSize="6.5" fontFamily="var(--font-mono)" textAnchor="middle">
        CP2102
      </text>

      {/* Micro-USB Jack at Bottom */}
      <rect x="85" y="275" width="50" height="32" rx="3" fill="#64748b" stroke="#cbd5e1" strokeWidth="1.2" />
      <rect x="92" y="285" width="36" height="14" rx="2" fill="#020617" />

      {/* EN / RST Button (Left) */}
      <rect x="42" y="260" width="18" height="18" rx="3" fill="#cbd5e1" stroke="#475569" />
      <circle cx="51" cy="269" r="4.5" fill="#ef4444" />
      <text x="51" y="254" fill="#94a3b8" fontSize="6.5" fontFamily="var(--font-mono)" textAnchor="middle">EN</text>

      {/* BOOT Button (Right) */}
      <rect x="160" y="260" width="18" height="18" rx="3" fill="#cbd5e1" stroke="#475569" />
      <circle cx="169" cy="269" r="4.5" fill="#3b82f6" />
      <text x="169" y="254" fill="#94a3b8" fontSize="6.5" fontFamily="var(--font-mono)" textAnchor="middle">BOOT</text>

      {/* Status LEDs */}
      <circle cx="95" cy="155" r="3" fill="#ef4444" opacity="0.9" />
      <text x="85" y="157" fill="#64748b" fontSize="5" fontFamily="var(--font-mono)">PWR</text>
      <circle cx="125" cy="155" r="3" fill="#38bdf8" opacity="0.9" />
      <text x="131" y="157" fill="#64748b" fontSize="5" fontFamily="var(--font-mono)">IO2</text>

      {/* Pin Headers: Left column & Right column */}
      <rect x="10" y="24" width="18" height="252" rx="3" fill="#020617" stroke="#1e293b" />
      <rect x="192" y="24" width="18" height="252" rx="3" fill="#020617" stroke="#1e293b" />

      {/* Dynamic Pin Terminals */}
      {component.pins.map((pin) => {
        const isHighlighted = highlightPinIds.includes(pin.id);
        const isLeft = pin.x <= 40;

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

            {/* Label inside board facing inwards */}
            <text
              x={isLeft ? 14 : -14}
              y={3}
              fill={isHighlighted ? '#34d399' : '#cbd5e1'}
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
