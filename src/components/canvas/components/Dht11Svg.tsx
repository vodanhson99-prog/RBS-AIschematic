import React from 'react';
import type { CircuitComponent } from '../../../types/circuit';

interface Props {
  component: CircuitComponent;
  isSelected: boolean;
  onPinClick: (pinId: string, event: React.MouseEvent) => void;
  highlightPinIds: string[];
}

export const Dht11Svg: React.FC<Props> = ({
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
          width="102"
          height="124"
          rx="8"
          fill="none"
          stroke="#06b6d4"
          strokeWidth="1.8"
          strokeDasharray="4 3"
        />
      )}

      {/* Main Cyan/Blue Sensor Housing */}
      <rect
        x="0"
        y="0"
        width="90"
        height="85"
        rx="5"
        fill="#0284c7"
        stroke="#0369a1"
        strokeWidth="1.5"
      />

      {/* Ventilation Grille / Slits for Humidity Sensing */}
      {[16, 26, 36, 46].map((gy, idx) => (
        <g key={idx}>
          <rect x="15" y={gy} width="26" height="5" rx="1.5" fill="#0369a1" />
          <rect x="49" y={gy} width="26" height="5" rx="1.5" fill="#0369a1" />
        </g>
      ))}

      {/* Sensor Label */}
      <rect x="20" y="60" width="50" height="16" rx="2" fill="#075985" />
      <text x="45" y="72" fill="#ffffff" fontSize="9" fontFamily="system-ui" fontWeight="900" textAnchor="middle">
        DHT11
      </text>

      {/* Pins leading down */}
      <line x1="20" y1="85" x2="20" y2="100" stroke="#cbd5e1" strokeWidth="2" />
      <line x1="36" y1="85" x2="36" y2="100" stroke="#cbd5e1" strokeWidth="2" />
      <line x1="54" y1="85" x2="54" y2="100" stroke="#cbd5e1" strokeWidth="2" />
      <line x1="70" y1="85" x2="70" y2="100" stroke="#cbd5e1" strokeWidth="2" />

      {/* Dynamic Pin Terminals */}
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
