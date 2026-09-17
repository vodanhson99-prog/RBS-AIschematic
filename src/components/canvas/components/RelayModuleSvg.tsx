import React from 'react';
import type { CircuitComponent } from '../../../types/circuit';

interface Props {
  component: CircuitComponent;
  isSelected: boolean;
  onPinClick: (pinId: string, event: React.MouseEvent) => void;
  highlightPinIds: string[];
}

export const RelayModuleSvg: React.FC<Props> = ({
  component,
  isSelected,
  onPinClick,
  highlightPinIds,
}) => {
  const compId = component.instanceId || component.id;
  const isTriggered = component.properties?.isTriggered ?? false;

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
          width="172"
          height="112"
          rx="10"
          fill="none"
          stroke="#06b6d4"
          strokeWidth="2"
          strokeDasharray="6 4"
        />
      )}

      {/* PCB Base (Deep Blue / Black) */}
      <rect
        x="0"
        y="0"
        width="160"
        height="100"
        rx="6"
        fill="#0f172a"
        stroke="#1e293b"
        strokeWidth="2"
      />

      {/* Mounting Holes */}
      {[
        [8, 8],
        [152, 8],
        [8, 92],
        [152, 92],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="4" fill="#020617" stroke="#334155" strokeWidth="1" />
      ))}

      {/* Blue Relay Box (Songle 5V DC) */}
      <rect
        x="50"
        y="12"
        width="65"
        height="76"
        rx="4"
        fill="#1d4ed8"
        stroke="#2563eb"
        strokeWidth="1.5"
      />
      <text x="82" y="32" fill="#ffffff" fontSize="8" fontFamily="system-ui" fontWeight="900" textAnchor="middle">
        SONGLE
      </text>
      <text x="82" y="46" fill="#bfdbfe" fontSize="6" fontFamily="var(--font-mono)" fontWeight="bold" textAnchor="middle">
        SRD-05VDC
      </text>
      <text x="82" y="58" fill="#93c5fd" fontSize="5" fontFamily="var(--font-mono)" textAnchor="middle">
        10A 250VAC
      </text>
      <text x="82" y="70" fill="#93c5fd" fontSize="5" fontFamily="var(--font-mono)" textAnchor="middle">
        10A 30VDC
      </text>

      {/* High-Voltage Screw Terminal Block (Blue / Green on Left) */}
      <rect x="6" y="20" width="34" height="60" rx="3" fill="#15803d" stroke="#166534" strokeWidth="1.2" />
      {[30, 50, 70].map((sy, idx) => (
        <g key={idx}>
          <circle cx="23" cy={sy} r="6" fill="#052e16" stroke="#4ade80" strokeWidth="1" />
          <line x1="19" y1={sy} x2="27" y2={sy} stroke="#cbd5e1" strokeWidth="1.5" />
        </g>
      ))}

      {/* Optocoupler IC (EL817) */}
      <rect x="122" y="20" width="16" height="24" rx="2" fill="#020617" stroke="#334155" />
      <text x="130" y="34" fill="#64748b" fontSize="4.5" fontFamily="var(--font-mono)" textAnchor="middle">817</text>

      {/* Status LEDs */}
      <circle cx="125" cy="55" r="3" fill="#ef4444" opacity="0.9" />
      <text x="134" y="57" fill="#64748b" fontSize="5" fontFamily="var(--font-mono)">PWR</text>
      <circle cx="125" cy="70" r="3" fill={isTriggered ? '#22c55e' : '#334155'} />
      <text x="134" y="72" fill="#64748b" fontSize="5" fontFamily="var(--font-mono)">RLY</text>

      {/* Pin Terminals */}
      {component.pins.map((pin) => {
        const isHighlighted = highlightPinIds.includes(pin.id);
        const isLeft = pin.x <= 35;

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

            {/* Label */}
            <text
              x={isLeft ? 12 : -12}
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
