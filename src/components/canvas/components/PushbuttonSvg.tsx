import React from 'react';
import type { CircuitComponent } from '../../../types/circuit';

interface Props {
  component: CircuitComponent;
  isSelected: boolean;
  onPinClick: (pinId: string, event: React.MouseEvent) => void;
  onTogglePress?: () => void;
  highlightPinIds: string[];
}

export const PushbuttonSvg: React.FC<Props> = ({
  component,
  isSelected,
  onPinClick,
  onTogglePress,
  highlightPinIds,
}) => {
  const isPressed = component.attributes?.isPressed ?? component.properties?.isPressed ?? false;

  return (
    <g
      id={`comp-${component.instanceId || component.id}`}
      transform={`translate(${component.x}, ${component.y}) rotate(${component.rotation})`}
      style={{ cursor: 'move' }}
    >
      {/* Selection outline */}
      {isSelected && (
        <rect
          x="2"
          y="4"
          width="56"
          height="62"
          rx="6"
          fill="none"
          stroke="#06b6d4"
          strokeWidth="2"
          strokeDasharray="4 3"
        />
      )}

      {/* 4 Metal Mounting Leads */}
      <path d="M 6 15 L 14 15" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M 46 15 L 54 15" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M 6 55 L 14 55" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M 46 55 L 54 55" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />

      {/* Tactile Body Frame */}
      <rect x="12" y="15" width="36" height="40" rx="4" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />

      {/* Center Actuator Button Plunger */}
      <circle
        cx="30"
        cy="35"
        r={isPressed ? 10 : 12}
        fill={isPressed ? '#ef4444' : '#0f172a'}
        stroke="#475569"
        strokeWidth="1.5"
        style={{ cursor: 'pointer', transition: 'all 0.1s ease' }}
        onClick={(e) => {
          e.stopPropagation();
          onTogglePress?.();
        }}
      />
      <circle cx="30" cy="35" r="4.5" fill={isPressed ? '#fca5a5' : '#334155'} pointerEvents="none" />

      {/* 4 Contact Pins */}
      {[
        { id: 'term1a', x: 12, y: 15, label: '1A' },
        { id: 'term1b', x: 48, y: 15, label: '1B' },
        { id: 'term2a', x: 12, y: 55, label: '2A' },
        { id: 'term2b', x: 48, y: 55, label: '2B' },
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
          <title>Chân nút nhấn {pin.label}</title>
          {/* Generous Hitbox */}
          <circle r="9" fill="transparent" pointerEvents="all" className="pin-hitbox" />
          {/* Hover Ring */}
          <circle r="7" fill="none" stroke="#38bdf8" strokeWidth="1.3" className="pin-hover-ring" />
          {highlightPinIds.includes(pin.id) && (
            <circle r="8" fill="none" stroke="#10b981" strokeWidth="2">
              <animate attributeName="r" values="4;9;4" dur="1s" repeatCount="indefinite" />
            </circle>
          )}
          <circle r="4" fill={highlightPinIds.includes(pin.id) ? '#10b981' : '#cbd5e1'} stroke="#334155" strokeWidth="1" />
        </g>
      ))}
    </g>
  );
};
