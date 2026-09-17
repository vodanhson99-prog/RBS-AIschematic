import React from 'react';
import type { CircuitComponent } from '../../../types/circuit';

interface Props {
  component: CircuitComponent;
  isSelected: boolean;
  onPinClick: (pinId: string, event: React.MouseEvent) => void;
  onLightChange?: (val: number) => void;
  highlightPinIds: string[];
}

export const LdrSvg: React.FC<Props> = ({
  component,
  isSelected,
  onPinClick,
  onLightChange,
  highlightPinIds,
}) => {
  const compId = component.instanceId || component.id;
  const props = component.attributes || component.properties || {};
  const lightLevel = props.lightLevel ?? 50; // 0 (tối om) to 100 (sáng chói)

  const handleDiskClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = (lightLevel + 25) > 100 ? 15 : lightLevel + 25;
    onLightChange?.(next);
  };

  return (
    <g
      id={`comp-${compId}`}
      transform={`translate(${component.x}, ${component.y}) rotate(${component.rotation})`}
      style={{ cursor: 'move' }}
    >
      {/* Selection outline */}
      {isSelected && (
        <rect
          x="2"
          y="2"
          width="46"
          height="72"
          rx="6"
          fill="none"
          stroke="#06b6d4"
          strokeWidth="2"
          strokeDasharray="4 3"
        />
      )}

      {/* 2 Long Flexible Metal Leads */}
      <path d="M 16 38 L 16 65" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M 34 38 L 34 65" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />

      {/* Sensor Round Head Disc */}
      <circle
        cx="25"
        cy="22"
        r="18"
        fill="#f8fafc"
        stroke="#cbd5e1"
        strokeWidth="1.5"
        style={{ cursor: 'pointer' }}
        onClick={handleDiskClick}
      >
        <title>{`Quang trở LDR - Nhấp để đổi độ sáng: ${lightLevel}%`}</title>
      </circle>

      {/* Outer red ceramic rim */}
      <circle
        cx="25"
        cy="22"
        r="15"
        fill={lightLevel > 50 ? '#fef08a' : '#fed7aa'}
        stroke="#ea580c"
        strokeWidth="1.2"
        pointerEvents="none"
      />

      {/* Serpentine CdS pattern (Đường ngoằn ngoèo cảm quang) */}
      <path
        d="M 15 16 C 18 16, 18 20, 21 20 C 24 20, 24 16, 27 16 C 30 16, 30 20, 33 20 C 35 20, 35 24, 32 24 C 29 24, 29 28, 26 28 C 23 28, 23 24, 20 24 C 17 24, 17 28, 15 28"
        fill="none"
        stroke="#c2410c"
        strokeWidth="1.5"
        strokeLinecap="round"
        pointerEvents="none"
      />

      {/* Light Intensity Badge */}
      <g
        transform="translate(25, 4)"
        onClick={handleDiskClick}
        style={{ cursor: 'pointer' }}
      >
        <rect x="-16" y="-6" width="32" height="12" rx="3" fill="#0f172a" stroke="#eab308" strokeWidth="1" />
        <text y="2.5" fill="#facc15" fontSize="7" fontWeight="bold" textAnchor="middle">
          {lightLevel}% ☀️
        </text>
      </g>

      {/* 2 Terminal Pins (pin1, pin2) */}
      {[
        { id: 'pin1', x: 16, y: 65, label: 'T1', name: 'Chân 1 Quang trở (T1)' },
        { id: 'pin2', x: 34, y: 65, label: 'T2', name: 'Chân 2 Quang trở (T2)' },
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
          <title>{pin.name}</title>
          {/* Generous Hitbox */}
          <circle r="8.5" fill="transparent" pointerEvents="all" className="pin-hitbox" />
          {/* Hover Ring */}
          <circle r="7" fill="none" stroke="#38bdf8" strokeWidth="1.3" className="pin-hover-ring" />
          {highlightPinIds.includes(pin.id) && (
            <circle r="8" fill="none" stroke="#10b981" strokeWidth="2">
              <animate attributeName="r" values="4;9;4" dur="1s" repeatCount="indefinite" />
            </circle>
          )}
          <circle
            r="4"
            fill={highlightPinIds.includes(pin.id) ? '#10b981' : '#cbd5e1'}
            stroke="#334155"
            strokeWidth="1"
          />
          <text y="13" fill="#94a3b8" fontSize="6.5" fontWeight="600" textAnchor="middle">
            {pin.label}
          </text>
        </g>
      ))}
    </g>
  );
};
