import React from 'react';
import type { CircuitComponent } from '../../../types/circuit';

interface Props {
  component: CircuitComponent;
  isSelected: boolean;
  onPinClick: (pinId: string, event: React.MouseEvent) => void;
  onToggleMotion?: () => void;
  highlightPinIds: string[];
}

export const PirSvg: React.FC<Props> = ({
  component,
  isSelected,
  onPinClick,
  onToggleMotion,
  highlightPinIds,
}) => {
  const compId = component.instanceId || component.id;
  const props = component.attributes || component.properties || {};
  const isDetected = props.motionDetected || false;

  return (
    <g
      id={`comp-${compId}`}
      transform={`translate(${component.x}, ${component.y}) rotate(${component.rotation})`}
      style={{ cursor: 'move' }}
    >
      {/* Minimalist Selection Outline */}
      {isSelected && (
        <rect
          x="-2"
          y="-2"
          width="80"
          height="92"
          rx="6"
          fill="none"
          stroke="#06b6d4"
          strokeWidth="2"
          strokeDasharray="4 3"
        />
      )}

      {/* PCB Base (Minimalist Dark Forest Green) */}
      <rect x="2" y="2" width="72" height="62" rx="4" fill="#14532d" stroke="#166534" strokeWidth="1.5" />

      {/* Motion Alert Subtle Glow */}
      {isDetected && (
        <circle cx="38" cy="33" r="28" fill="none" stroke="#ef4444" strokeWidth="2" opacity="0.6">
          <animate attributeName="r" values="22;30;22" dur="1s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.8;0.1;0.8" dur="1s" repeatCount="indefinite" />
        </circle>
      )}

      {/* Minimalist Flat Fresnel Dome Lens */}
      <circle
        cx="38"
        cy="33"
        r="20"
        fill={isDetected ? '#fca5a5' : '#f8fafc'}
        stroke="#cbd5e1"
        strokeWidth="1.5"
        onClick={(e) => {
          e.stopPropagation();
          onToggleMotion?.();
        }}
        style={{ cursor: 'pointer' }}
      />
      <circle cx="38" cy="33" r="10" fill="none" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2 2" />
      <circle cx="38" cy="33" r="4" fill="#cbd5e1" />

      <text x="38" y="10" fill="#86efac" fontSize="6.5" fontWeight="bold" textAnchor="middle">
        PIR
      </text>

      {/* Terminal Pins */}
      {[
        { id: 'vcc', x: 24, y: 74, label: 'VCC', color: '#ef4444', name: 'VCC (+5V Nguồn)' },
        { id: 'out', x: 38, y: 74, label: 'OUT', color: '#a855f7', name: 'Output (Tín hiệu phát hiện)' },
        { id: 'gnd', x: 52, y: 74, label: 'GND', color: '#94a3b8', name: 'GND (Nối đất)' },
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
          <circle r="7" fill="transparent" pointerEvents="all" className="pin-hitbox" />
          {/* Hover Ring */}
          <circle r="6" fill="none" stroke="#38bdf8" strokeWidth="1.2" className="pin-hover-ring" />
          {highlightPinIds.includes(pin.id) && (
            <circle r="8" fill="none" stroke="#10b981" strokeWidth="2">
              <animate attributeName="r" values="5;9;5" dur="1s" repeatCount="indefinite" />
            </circle>
          )}
          <line x1="0" y1="-10" x2="0" y2="0" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
          <circle r="4" fill={highlightPinIds.includes(pin.id) ? '#10b981' : '#cbd5e1'} stroke="#475569" strokeWidth="1" />
          <text y="13" fill={pin.color} fontSize="6" fontWeight="bold" textAnchor="middle">
            {pin.label}
          </text>
        </g>
      ))}
    </g>
  );
};
