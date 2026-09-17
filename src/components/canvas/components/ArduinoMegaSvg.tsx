import React from 'react';
import type { CircuitComponent } from '../../../types/circuit';

interface Props {
  component: CircuitComponent;
  isSelected: boolean;
  onPinClick: (pinId: string, event: React.MouseEvent) => void;
  highlightPinIds: string[];
}

export const ArduinoMegaSvg: React.FC<Props> = ({
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
          width="472"
          height="252"
          rx="12"
          fill="none"
          stroke="#06b6d4"
          strokeWidth="2"
          strokeDasharray="6 4"
        />
      )}

      {/* Mega PCB Board (Dark Cyan / Teal) */}
      <rect
        x="0"
        y="0"
        width="460"
        height="240"
        rx="10"
        fill="#083344"
        stroke="#0e7490"
        strokeWidth="2.5"
      />

      {/* PCB Corner Mounting Holes */}
      {[
        [16, 16],
        [444, 16],
        [16, 224],
        [444, 224],
        [160, 224],
        [160, 16],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="6" fill="#021720" stroke="#155e75" strokeWidth="1.5" />
      ))}

      {/* USB Type-B Port */}
      <rect x="-14" y="32" width="46" height="52" rx="4" fill="#64748b" stroke="#94a3b8" strokeWidth="1.5" />
      <rect x="-12" y="42" width="20" height="32" rx="2" fill="#0f172a" />

      {/* Barrel Power Jack */}
      <rect x="-14" y="145" width="56" height="55" rx="4" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />
      <rect x="-10" y="160" width="22" height="25" rx="2" fill="#020617" />

      {/* ATmega2560 Main Square MCU (100-pin TQFP) */}
      <rect
        x="245"
        y="85"
        width="70"
        height="70"
        rx="4"
        fill="#0f172a"
        stroke="#334155"
        strokeWidth="1.5"
        transform="rotate(45, 280, 120)"
      />
      <circle cx="270" cy="100" r="3" fill="#64748b" />
      <text
        x="280"
        y="118"
        fill="#94a3b8"
        fontSize="7"
        fontFamily="var(--font-mono)"
        fontWeight="bold"
        textAnchor="middle"
      >
        ATmega2560
      </text>
      <text
        x="280"
        y="128"
        fill="#64748b"
        fontSize="5"
        fontFamily="var(--font-mono)"
        textAnchor="middle"
      >
        16MHz 256KB
      </text>

      {/* Secondary USB Interface Chip (ATmega16U2) */}
      <rect x="70" y="55" width="26" height="26" rx="2" fill="#0f172a" stroke="#334155" />
      <text x="83" y="70" fill="#64748b" fontSize="4.5" fontFamily="var(--font-mono)" textAnchor="middle">16U2</text>

      {/* Reset Button */}
      <rect x="58" y="16" width="22" height="22" rx="3" fill="#cbd5e1" stroke="#94a3b8" />
      <circle cx="69" cy="27" r="6" fill="#ef4444" />

      {/* Board Brand Typography */}
      <text x="145" y="112" fill="#f8fafc" fontSize="16" fontFamily="system-ui" fontWeight="900" letterSpacing="0.5">
        ARDUINO
      </text>
      <text x="145" y="132" fill="#38bdf8" fontSize="18" fontFamily="system-ui" fontWeight="900">
        MEGA 2560
      </text>
      <text x="145" y="146" fill="#0284c7" fontSize="8" fontFamily="system-ui" fontWeight="700">
        54 DIGITAL I/O • 16 ANALOG • 4 UARTS
      </text>

      {/* Top Header Plastic Bar */}
      <rect x="90" y="8" width="355" height="16" rx="3" fill="#090d16" stroke="#1e293b" />
      {/* Bottom Header Plastic Bar */}
      <rect x="90" y="216" width="355" height="16" rx="3" fill="#090d16" stroke="#1e293b" />
      {/* Far Right Double Row Header (Digital 22-53) */}
      <rect x="426" y="26" width="26" height="188" rx="3" fill="#090d16" stroke="#1e293b" />

      {/* Dynamic Pin Terminals */}
      {component.pins.map((pin) => {
        const isHighlighted = highlightPinIds.includes(pin.id);
        const isTop = pin.y <= 24;
        const isRight = pin.x >= 420;

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
            {/* Click Hitbox */}
            <circle r="8" fill="transparent" pointerEvents="all" className="pin-hitbox" />

            {/* Hover Ring */}
            <circle r="6" fill="none" stroke="#38bdf8" strokeWidth="1.2" className="pin-hover-ring" />

            {/* AI Suggestion Glow Ring */}
            {isHighlighted && (
              <circle r="9" fill="none" stroke="#10b981" strokeWidth="2.2">
                <animate attributeName="r" values="5;10;5" dur="1.2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="1;0.2;1" dur="1.2s" repeatCount="indefinite" />
              </circle>
            )}

            {/* Socket Hole */}
            <circle
              r="4.2"
              fill={isHighlighted ? '#10b981' : '#1e293b'}
              stroke={isHighlighted ? '#34d399' : '#64748b'}
              strokeWidth="1.2"
            />
            <circle r="1.8" fill={isHighlighted ? '#ffffff' : '#090d16'} />

            {/* Pin Label */}
            <text
              x={isRight ? -10 : 0}
              y={isRight ? 3 : isTop ? 17 : -15}
              fill={isHighlighted ? '#34d399' : '#e2e8f0'}
              fontSize="5"
              fontFamily="var(--font-mono)"
              fontWeight="700"
              textAnchor={isRight ? 'end' : 'middle'}
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
