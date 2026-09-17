import React from 'react';
import type { CircuitComponent, Pin } from '../../../types/circuit';

interface Props {
  component: CircuitComponent;
  isSelected: boolean;
  onPinClick: (pinId: string, event: React.MouseEvent) => void;
  highlightPinIds: string[];
}

// Compact labels that never collide in 14px grid spacing
const getShortPinLabel = (pin: Pin): string => {
  const id = pin.id.toLowerCase();
  if (id.includes('aref')) return 'AR';
  if (id === 'gnd_top' || id.includes('gnd')) return 'GND';
  if (id === 'd13') return '13';
  if (id === 'd12') return '12';
  if (id === 'd11') return '~11';
  if (id === 'd10') return '~10';
  if (id === 'd9') return '~9';
  if (id === 'd8') return '8';
  if (id === 'd7') return '7';
  if (id === 'd6') return '~6';
  if (id === 'd5') return '~5';
  if (id === 'd4') return '4';
  if (id === 'd3') return '~3';
  if (id === 'd2') return '2';
  if (id === 'd1') return 'TX';
  if (id === 'd0') return 'RX';
  if (id === 'rst') return 'RST';
  if (id === '3v3') return '3V3';
  if (id === '5v') return '5V';
  if (id === 'vin') return 'VIN';
  if (id === 'a0') return 'A0';
  if (id === 'a1') return 'A1';
  if (id === 'a2') return 'A2';
  if (id === 'a3') return 'A3';
  if (id === 'a4') return 'A4';
  if (id === 'a5') return 'A5';
  return (pin.label || pin.name || '').substring(0, 3);
};

export const ArduinoUnoSvg: React.FC<Props> = ({
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
          x="-6"
          y="-6"
          width="332"
          height="252"
          rx="12"
          fill="none"
          stroke="#06b6d4"
          strokeWidth="2"
          strokeDasharray="5 3"
        />
      )}

      {/* PCB Board - Minimalist Matte Deep Teal Finish */}
      <rect
        x="0"
        y="0"
        width="320"
        height="240"
        rx="10"
        fill="#0a3d59"
        stroke="#06283b"
        strokeWidth="2"
        filter="drop-shadow(0 6px 16px rgba(0, 0, 0, 0.45))"
      />

      {/* Mounting Holes */}
      <circle cx="16" cy="16" r="5.5" fill="#040a12" stroke="#94a3b8" strokeWidth="1.2" opacity="0.8" />
      <circle cx="16" cy="224" r="5.5" fill="#040a12" stroke="#94a3b8" strokeWidth="1.2" opacity="0.8" />
      <circle cx="304" cy="16" r="5.5" fill="#040a12" stroke="#94a3b8" strokeWidth="1.2" opacity="0.8" />
      <circle cx="304" cy="224" r="5.5" fill="#040a12" stroke="#94a3b8" strokeWidth="1.2" opacity="0.8" />

      {/* Ports Silhouette: USB & DC Jack */}
      <rect x="-8" y="28" width="38" height="32" rx="3" fill="#334155" stroke="#475569" strokeWidth="1" />
      <rect x="-8" y="165" width="46" height="40" rx="3" fill="#1e293b" stroke="#334155" strokeWidth="1" />

      {/* Microcontroller IC (ATmega328P) */}
      <rect x="145" y="112" width="120" height="32" rx="3" fill="#0b0f19" stroke="#1e293b" strokeWidth="1.5" />
      <text x="205" y="132" fill="#64748b" fontSize="8.5" fontFamily="monospace" fontWeight="600" textAnchor="middle">
        ATmega328P
      </text>

      {/* Status LEDs (ON, L) */}
      <g transform="translate(80, 106)">
        <circle cx="4" cy="4" r="3" fill="#10b981" />
        <text x="12" y="7" fill="#cbd5e1" fontSize="6.5" fontWeight="bold">ON</text>

        <circle cx="4" cy="18" r="3" fill="#f59e0b" />
        <text x="12" y="21" fill="#cbd5e1" fontSize="6.5" fontWeight="bold">L (13)</text>
      </g>

      {/* Board Brand */}
      <text x="80" y="74" fill="#ffffff" fontSize="13" fontWeight="800" letterSpacing="0.8">
        ARDUINO
      </text>
      <text x="80" y="86" fill="#38bdf8" fontSize="8.5" fontWeight="700">
        UNO R3
      </text>

      {/* Section Silkscreen Labels (Generous clearance from pin text) */}
      <text x="180" y="44" fill="#67e8f9" fontSize="6.5" fontWeight="bold" textAnchor="middle" letterSpacing="0.6">
        DIGITAL (PWM ~)
      </text>
      <text x="110" y="186" fill="#67e8f9" fontSize="6.5" fontWeight="bold" textAnchor="middle" letterSpacing="0.6">
        POWER
      </text>
      <text x="215" y="186" fill="#67e8f9" fontSize="6.5" fontWeight="bold" textAnchor="middle" letterSpacing="0.6">
        ANALOG IN
      </text>

      {/* Female Header Bars (Clean matte dark bars) */}
      <rect x="62" y="8" width="236" height="18" rx="2" fill="#0f172a" stroke="#1e293b" strokeWidth="1" />
      <rect x="72" y="214" width="188" height="18" rx="2" fill="#0f172a" stroke="#1e293b" strokeWidth="1" />

      {/* Individual Pin Sockets & Non-Overlapping Silkscreen Labels */}
      {component.pins.map((pin) => {
        const isHighlighted = highlightPinIds.includes(pin.id);
        const px = pin.x ?? pin.position?.x ?? 0;
        const py = pin.y ?? pin.position?.y ?? 0;
        const shortLabel = getShortPinLabel(pin);
        const isTopHeader = py < 100;

        return (
          <g
            key={pin.id}
            className="pin-terminal"
            data-pin-id={pin.id}
            data-comp-id={component.instanceId || component.id}
            transform={`translate(${px}, ${py})`}
            onMouseDown={(e) => {
              e.stopPropagation();
            }}
            onClick={(e) => {
              e.stopPropagation();
              onPinClick(pin.id, e);
            }}
          >
            <title>{`${pin.name || pin.label} (${pin.description || pin.id})`}</title>

            {/* Generous Hitbox (r=7px for 14px pitch between headers) */}
            <circle
              r="7"
              fill="transparent"
              pointerEvents="all"
              className="pin-hitbox"
            />

            {/* Subtle Pin Hover Ring */}
            <circle
              r="6.5"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="1.2"
              className="pin-hover-ring"
            />

            {/* AI Suggestion Glow Ring */}
            {isHighlighted && (
              <circle r="10" fill="none" stroke="#10b981" strokeWidth="2.2">
                <animate attributeName="r" values="6;11;6" dur="1.2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="1;0.2;1" dur="1.2s" repeatCount="indefinite" />
              </circle>
            )}

            {/* Pin Socket Terminal */}
            <circle
              r="4.5"
              fill={isHighlighted ? '#10b981' : '#1e293b'}
              stroke={isHighlighted ? '#34d399' : '#64748b'}
              strokeWidth="1.2"
            />
            <circle r="1.8" fill={isHighlighted ? '#ffffff' : '#090d16'} />

            {/* Crisp, Non-Overlapping Pin Label */}
            <text
              y={isTopHeader ? 19 : -16}
              fill={isHighlighted ? '#34d399' : '#e2e8f0'}
              fontSize="5.5"
              fontFamily="var(--font-mono)"
              fontWeight="700"
              textAnchor="middle"
              pointerEvents="none"
            >
              {shortLabel}
            </text>
          </g>
        );
      })}
    </g>
  );
};
