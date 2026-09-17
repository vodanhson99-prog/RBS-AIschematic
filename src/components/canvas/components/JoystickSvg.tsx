import React from 'react';
import type { CircuitComponent } from '../../../types/circuit';

interface Props {
  component: CircuitComponent;
  isSelected: boolean;
  onPinClick: (pinId: string, event: React.MouseEvent) => void;
  highlightPinIds: string[];
}

export const JoystickSvg: React.FC<Props> = ({
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
          height="142"
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
        width="120"
        height="125"
        rx="6"
        fill="#0f172a"
        stroke="#1e293b"
        strokeWidth="2"
      />

      {/* Mounting Holes */}
      {[
        [8, 8],
        [112, 8],
        [8, 100],
        [112, 100],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="4" fill="#020617" stroke="#334155" strokeWidth="1" />
      ))}

      {/* Outer Metal Gimbal Base */}
      <rect x="25" y="15" width="70" height="70" rx="35" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />

      {/* Thumbstick Cap (Rubber textured dark grey) */}
      <circle cx="60" cy="50" r="28" fill="#334155" stroke="#475569" strokeWidth="2" />
      <circle cx="60" cy="50" r="18" fill="#1e293b" stroke="#0f172a" strokeWidth="1.5" />
      <circle cx="60" cy="50" r="8" fill="#475569" />

      {/* Potentiometer Cans (Green X & Y side sensors) */}
      <rect x="15" y="38" width="12" height="24" rx="2" fill="#15803d" stroke="#166534" />
      <rect x="48" y="5" width="24" height="12" rx="2" fill="#15803d" stroke="#166534" />

      {/* Header Bar at Bottom */}
      <rect x="15" y="98" width="90" height="14" rx="2" fill="#020617" stroke="#334155" />

      {/* 5 Pin Terminals: GND, +5V, VRx, VRy, SW */}
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
              stroke={isHighlighted ? '#34d399' : '#64748b'}
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
