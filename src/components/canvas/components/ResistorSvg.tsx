import React from 'react';
import type { CircuitComponent } from '../../../types/circuit';

interface Props {
  component: CircuitComponent;
  isSelected: boolean;
  onPinClick: (pinId: string, event: React.MouseEvent) => void;
  highlightPinIds: string[];
}

export const ResistorSvg: React.FC<Props> = ({
  component,
  isSelected,
  onPinClick,
  highlightPinIds,
}) => {
  const resistance = component.attributes?.resistance || component.properties?.resistance || 220;

  const getColorBands = (val: number): [string, string, string, string] => {
    if (val === 220) return ['#ef4444', '#ef4444', '#78350f', '#d97706']; // Red, Red, Brown, Gold
    if (val === 330) return ['#f97316', '#f97316', '#78350f', '#d97706'];
    if (val === 1000) return ['#78350f', '#000000', '#ef4444', '#d97706'];
    if (val === 10000) return ['#78350f', '#000000', '#f97316', '#d97706'];
    return ['#ef4444', '#ef4444', '#78350f', '#d97706'];
  };

  const bands = getColorBands(resistance);

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
          y="-6"
          width="96"
          height="50"
          rx="8"
          fill="none"
          stroke="#06b6d4"
          strokeWidth="2"
          strokeDasharray="4 3"
        />
      )}

      {/* Clean Axial Lead Wires */}
      <line x1="10" y1="20" x2="30" y2="20" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="70" y1="20" x2="90" y2="20" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />

      {/* Ceramic Resistor Body */}
      <rect x="28" y="11" width="44" height="18" rx="5" fill="#fde68a" stroke="#d97706" strokeWidth="1" />

      {/* Color Bands */}
      <rect x="36" y="11" width="4" height="18" fill={bands[0]} />
      <rect x="44" y="11" width="4" height="18" fill={bands[1]} />
      <rect x="52" y="11" width="4" height="18" fill={bands[2]} />
      <rect x="62" y="11" width="4" height="18" fill={bands[3]} />

      {/* Value label */}
      <text x="50" y="38" fill="#e2e8f0" fontSize="8" fontWeight="600" textAnchor="middle">
        {resistance >= 1000 ? `${resistance / 1000}kΩ` : `${resistance}Ω`}
      </text>

      {/* Terminal 1 Pin */}
      <g
        className="pin-terminal"
        data-pin-id="pin1"
        data-comp-id={component.instanceId || component.id}
        transform="translate(10, 20)"
        onMouseDown={(e) => {
          e.stopPropagation();
        }}
        onClick={(e) => {
          e.stopPropagation();
          onPinClick('pin1', e);
        }}
      >
        <title>Chân 1 Điện trở (T1)</title>
        {/* Generous Hitbox */}
        <circle r="11" fill="transparent" pointerEvents="all" className="pin-hitbox" />
        {/* Hover Ring */}
        <circle r="8" fill="none" stroke="#38bdf8" strokeWidth="1.5" className="pin-hover-ring" />
        {highlightPinIds.includes('pin1') && (
          <circle r="9" fill="none" stroke="#10b981" strokeWidth="2">
            <animate attributeName="r" values="5;10;5" dur="1s" repeatCount="indefinite" />
          </circle>
        )}
        <circle r="4.5" fill={highlightPinIds.includes('pin1') ? '#10b981' : '#cbd5e1'} stroke="#475569" strokeWidth="1" />
        <text y="-8" fill="#94a3b8" fontSize="6.5" fontWeight="600" textAnchor="middle">
          T1
        </text>
      </g>

      {/* Terminal 2 Pin */}
      <g
        className="pin-terminal"
        data-pin-id="pin2"
        data-comp-id={component.instanceId || component.id}
        transform="translate(90, 20)"
        onMouseDown={(e) => {
          e.stopPropagation();
        }}
        onClick={(e) => {
          e.stopPropagation();
          onPinClick('pin2', e);
        }}
      >
        <title>Chân 2 Điện trở (T2)</title>
        {/* Generous Hitbox */}
        <circle r="11" fill="transparent" pointerEvents="all" className="pin-hitbox" />
        {/* Hover Ring */}
        <circle r="8" fill="none" stroke="#38bdf8" strokeWidth="1.5" className="pin-hover-ring" />
        {highlightPinIds.includes('pin2') && (
          <circle r="9" fill="none" stroke="#10b981" strokeWidth="2">
            <animate attributeName="r" values="5;10;5" dur="1s" repeatCount="indefinite" />
          </circle>
        )}
        <circle r="4.5" fill={highlightPinIds.includes('pin2') ? '#10b981' : '#cbd5e1'} stroke="#475569" strokeWidth="1" />
        <text y="-8" fill="#94a3b8" fontSize="6.5" fontWeight="600" textAnchor="middle">
          T2
        </text>
      </g>
    </g>
  );
};
