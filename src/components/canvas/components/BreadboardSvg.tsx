import React from 'react';
import type { CircuitComponent } from '../../../types/circuit';

interface Props {
  component: CircuitComponent;
  isSelected: boolean;
  onPinClick: (pinId: string, event: React.MouseEvent) => void;
  highlightPinIds: string[];
}

export const BreadboardSvg: React.FC<Props> = ({
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
      {/* Selection outline */}
      {isSelected && (
        <rect
          x="-6"
          y="-6"
          width="472"
          height="232"
          rx="10"
          fill="none"
          stroke="#06b6d4"
          strokeWidth="2"
          strokeDasharray="5 3"
        />
      )}

      {/* Main Breadboard Body - Sleek Light Slate Minimalist */}
      <rect
        x="0"
        y="0"
        width="460"
        height="220"
        rx="8"
        fill="#f1f5f9"
        stroke="#cbd5e1"
        strokeWidth="1.5"
        filter="drop-shadow(0 6px 16px rgba(0, 0, 0, 0.25))"
      />

      {/* Center DIP Divider Channel */}
      <rect x="15" y="105" width="430" height="10" fill="#e2e8f0" rx="2" />

      {/* Power Rail Lines (+ / -) */}
      <line x1="24" y1="12" x2="438" y2="12" stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round" />
      <text x="12" y="15" fill="#ef4444" fontSize="11" fontWeight="bold" textAnchor="middle">+</text>

      <line x1="24" y1="46" x2="438" y2="46" stroke="#3b82f6" strokeWidth="1.8" strokeLinecap="round" />
      <text x="12" y="49" fill="#3b82f6" fontSize="13" fontWeight="bold" textAnchor="middle">-</text>

      <line x1="24" y1="174" x2="438" y2="174" stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round" />
      <text x="12" y="177" fill="#ef4444" fontSize="11" fontWeight="bold" textAnchor="middle">+</text>

      <line x1="24" y1="208" x2="438" y2="208" stroke="#3b82f6" strokeWidth="1.8" strokeLinecap="round" />
      <text x="12" y="211" fill="#3b82f6" fontSize="13" fontWeight="bold" textAnchor="middle">-</text>

      {/* Column number labels */}
      {Array.from({ length: 15 }).map((_, i) => (
        <text
          key={`num-${i}`}
          x={30 + i * 28}
          y="64"
          fill="#64748b"
          fontSize="7"
          fontFamily="var(--font-mono)"
          fontWeight="600"
          textAnchor="middle"
          pointerEvents="none"
        >
          {i + 1}
        </text>
      ))}

      {/* Row letters */}
      <text x="16" y="83" fill="#64748b" fontSize="7.5" fontWeight="bold" textAnchor="middle">A</text>
      <text x="16" y="143" fill="#64748b" fontSize="7.5" fontWeight="bold" textAnchor="middle">J</text>

      {/* Clickable Pins with Clean Minimalist Socket Hole */}
      {component.pins.map((pin) => {
        const isHighlighted = highlightPinIds.includes(pin.id);
        const isPower = pin.type === 'VCC' || pin.type === 'power' || pin.id.includes('plus');
        const isGnd = pin.type === 'GND' || pin.type === 'gnd' || pin.id.includes('minus');
        const px = pin.x ?? pin.position?.x ?? 0;
        const py = pin.y ?? pin.position?.y ?? 0;

        return (
          <g
            key={pin.id}
            className="pin-terminal"
            data-pin-id={pin.id}
            data-comp-id={compId}
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

            {/* Generous Invisible Hitbox (r=11px for 28px pitch, covers socket area effortlessly) */}
            <circle
              r="11"
              fill="transparent"
              pointerEvents="all"
              className="pin-hitbox"
            />

            {/* Subtle Pin Hover Ring */}
            <circle
              r="8"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="1.5"
              className="pin-hover-ring"
            />

            {/* AI Suggestion Pulse */}
            {isHighlighted && (
              <circle r="11" fill="none" stroke="#10b981" strokeWidth="2">
                <animate attributeName="r" values="6;12;6" dur="1.2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="1;0.2;1" dur="1.2s" repeatCount="indefinite" />
              </circle>
            )}

            {/* Socket Pin Base */}
            <circle
              r="4.5"
              fill={
                isHighlighted
                  ? '#10b981'
                  : isPower
                  ? '#fee2e2'
                  : isGnd
                  ? '#e0e7ff'
                  : '#e2e8f0'
              }
              stroke={
                isHighlighted
                  ? '#34d399'
                  : isPower
                  ? '#ef4444'
                  : isGnd
                  ? '#3b82f6'
                  : '#94a3b8'
              }
              strokeWidth="1"
            />
            <rect
              x="-1.5"
              y="-1.5"
              width="3"
              height="3"
              fill={isHighlighted ? '#ffffff' : '#475569'}
              rx="0.5"
            />
          </g>
        );
      })}
    </g>
  );
};
