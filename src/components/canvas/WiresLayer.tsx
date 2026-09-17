import React from 'react';
import type { CircuitComponent, Wire } from '../../types/circuit';
import { audioSynth } from '../../services/audioSynthesizer';

interface Props {
  wires: Wire[];
  components: CircuitComponent[];
  selectedWireId: string | null;
  onSelectWire: (wireId: string) => void;
  onDeleteWire: (wireId: string) => void;
  onUpdateWireWaypoints?: (wireId: string, waypoints: Array<{ x: number; y: number }>) => void;
  activeWireStart: { compId: string; pinId: string; x: number; y: number; color: string } | null;
  cursorPos: { x: number; y: number } | null;
  clientToCanvasCoord: (clientX: number, clientY: number) => { x: number; y: number };
  draggingWaypoint: { wireId: string; index: number } | null;
  onStartDragWaypoint: (wireId: string, index: number) => void;
}

export const WiresLayer: React.FC<Props> = ({
  wires,
  components,
  selectedWireId,
  onSelectWire,
  onDeleteWire,
  onUpdateWireWaypoints,
  activeWireStart,
  cursorPos,
  clientToCanvasCoord,
  draggingWaypoint,
  onStartDragWaypoint,
}) => {
  // Helper to get pin canvas coordinates
  const getPinPos = (compId: string, pinId: string): { x: number; y: number } | null => {
    const comp = components.find((c) => c.instanceId === compId || c.id === compId);
    if (!comp) return null;
    const pin = comp.pins.find((p) => p.id === pinId);
    if (!pin) return null;
    const px = pin.x ?? pin.position?.x ?? 0;
    const py = pin.y ?? pin.position?.y ?? 0;
    return {
      x: comp.x + px,
      y: comp.y + py,
    };
  };

  // Straight line multi-segment path connecting p1 -> waypoints -> p2
  const getStraightWirePath = (
    p1: { x: number; y: number },
    waypoints: Array<{ x: number; y: number }> | undefined,
    p2: { x: number; y: number }
  ): string => {
    const all = [p1, ...(waypoints || []), p2];
    return all.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`).join(' ');
  };

  // Find midpoint along the wire for placing controls
  const getWireMidpoint = (
    p1: { x: number; y: number },
    waypoints: Array<{ x: number; y: number }> | undefined,
    p2: { x: number; y: number }
  ): { x: number; y: number } => {
    const all = [p1, ...(waypoints || []), p2];
    const midIdx = Math.floor((all.length - 1) / 2);
    const a = all[midIdx];
    const b = all[midIdx + 1];
    return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  };

  // Find which segment in [p1, ...waypoints, p2] is closest to the click point (target)
  const findInsertSegmentIndex = (
    p1: { x: number; y: number },
    waypoints: Array<{ x: number; y: number }> | undefined,
    p2: { x: number; y: number },
    target: { x: number; y: number }
  ): number => {
    const all = [p1, ...(waypoints || []), p2];
    let bestDist = Infinity;
    let bestIndex = 0;

    for (let i = 0; i < all.length - 1; i++) {
      const a = all[i];
      const b = all[i + 1];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const lenSq = dx * dx + dy * dy;

      let projX = a.x;
      let projY = a.y;

      if (lenSq > 0) {
        const t = Math.max(0, Math.min(1, ((target.x - a.x) * dx + (target.y - a.y) * dy) / lenSq));
        projX = a.x + t * dx;
        projY = a.y + t * dy;
      }

      const dist = Math.hypot(target.x - projX, target.y - projY);
      if (dist < bestDist) {
        bestDist = dist;
        bestIndex = i; // Will insert at index i in the waypoints array
      }
    }

    return bestIndex;
  };

  // Handle Double-Click on wire to add a new bend point
  const handleWireDoubleClick = (wire: Wire, e: React.MouseEvent) => {
    if (activeWireStart) return;
    e.stopPropagation();

    const p1 = getPinPos(wire.fromCompId, wire.fromPinId);
    const p2 = getPinPos(wire.toCompId, wire.toPinId);
    if (!p1 || !p2) return;

    const coords = clientToCanvasCoord(e.clientX, e.clientY);
    const insertIdx = findInsertSegmentIndex(p1, wire.waypoints, p2, coords);
    const currentWps = wire.waypoints || [];
    const nextWps = [...currentWps];
    const newPt = { x: Math.round(coords.x), y: Math.round(coords.y) };
    nextWps.splice(insertIdx, 0, newPt);

    // Draw the waypoint immediately onto the wire
    onUpdateWireWaypoints?.(wire.id, nextWps);
    onSelectWire(wire.id);
    audioSynth.playClickSound();
  };

  return (
    <g id="wires-layer">
      {/* Established Wires */}
      {wires.map((wire) => {
        const p1 = getPinPos(wire.fromCompId, wire.fromPinId);
        const p2 = getPinPos(wire.toCompId, wire.toPinId);

        if (!p1 || !p2) return null;

        const pathData = getStraightWirePath(p1, wire.waypoints, p2);
        const midPoint = getWireMidpoint(p1, wire.waypoints, p2);
        const isSelected = selectedWireId === wire.id;
        const hasWaypoints = wire.waypoints && wire.waypoints.length > 0;

        return (
          <g
            key={wire.id}
            onClick={(e) => {
              if (activeWireStart) return;
              e.stopPropagation();
              onSelectWire(wire.id);
            }}
            onDoubleClick={(e) => handleWireDoubleClick(wire, e)}
            style={{
              cursor: activeWireStart ? 'default' : 'pointer',
              pointerEvents: activeWireStart ? 'none' : 'auto',
            }}
          >
            {/* Transparent wide hit-box for easy click and double click */}
            <path
              d={pathData}
              fill="none"
              stroke="transparent"
              strokeWidth="18"
              strokeLinejoin="round"
              strokeLinecap="round"
              className="wire-hitbox"
            >
              <title>Nhấn đúp để tạo điểm uốn bẻ dây</title>
            </path>

            {/* Subtle soft shadow */}
            <path
              d={pathData}
              fill="none"
              stroke="rgba(0, 0, 0, 0.4)"
              strokeWidth="3.6"
              strokeLinejoin="round"
              strokeLinecap="round"
              transform="translate(0, 1.5)"
            />

            {/* Selection highlight glow */}
            {isSelected && (
              <path
                d={pathData}
                fill="none"
                stroke="#38bdf8"
                strokeWidth="7"
                strokeLinejoin="round"
                strokeLinecap="round"
                opacity="0.75"
              />
            )}

            {/* Crisp Straight Core Wire */}
            <path
              d={pathData}
              fill="none"
              stroke={wire.color}
              strokeWidth={isSelected ? '3.5' : '2.8'}
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            {/* Minimalist Pin Terminal Dots */}
            <circle cx={p1.x} cy={p1.y} r="3.2" fill="#f8fafc" stroke="#334155" strokeWidth="1" />
            <circle cx={p2.x} cy={p2.y} r="3.2" fill="#f8fafc" stroke="#334155" strokeWidth="1" />

            {/* Interactive Bend Point (Waypoint) Handles */}
            {(isSelected || hasWaypoints) &&
              wire.waypoints?.map((wp, idx) => {
                const isDraggingThis =
                  draggingWaypoint?.wireId === wire.id && draggingWaypoint?.index === idx;

                return (
                  <g
                    key={`wp-${wire.id}-${idx}`}
                    className={`wire-waypoint-handle ${isDraggingThis ? 'dragging' : ''}`}
                    transform={`translate(${wp.x}, ${wp.y})`}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      onSelectWire(wire.id);
                      onStartDragWaypoint(wire.id, idx);
                    }}
                    onDoubleClick={(e) => {
                      // Double click on bend point deletes it!
                      e.stopPropagation();
                      const nextWps = (wire.waypoints || []).filter((_, i) => i !== idx);
                      onUpdateWireWaypoints?.(wire.id, nextWps);
                      audioSynth.playClickSound();
                    }}
                  >
                    <title>Kéo để bẻ dây • Nhấn đúp để xoá điểm uốn này</title>
                    {/* Generous Hitbox for easy grabbing without jitter */}
                    <circle r="14" fill="transparent" pointerEvents="all" />

                    {/* Outer Glow Halo */}
                    <circle
                      className="wire-waypoint-halo"
                      r={isDraggingThis ? 9 : 7}
                      fill="none"
                      stroke={isDraggingThis ? '#10b981' : isSelected ? '#38bdf8' : '#94a3b8'}
                      strokeWidth={isDraggingThis ? 2.5 : 1.8}
                    />

                    {/* Main Bend Point Handle Body */}
                    <circle
                      className="wire-waypoint-body"
                      r={isDraggingThis ? 5 : 4.5}
                      fill="#ffffff"
                      stroke={isDraggingThis ? '#10b981' : wire.color}
                      strokeWidth="2"
                    />

                    {/* Center Pin Indicator Dot */}
                    <circle
                      className="wire-waypoint-dot"
                      r={isDraggingThis ? 2 : 1.8}
                      fill={isDraggingThis ? '#10b981' : wire.color}
                    />
                  </g>
                );
              })}

            {/* Delete button badge on selected wire */}
            {isSelected && (
              <g
                transform={`translate(${midPoint.x}, ${midPoint.y + 16})`}
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteWire(wire.id);
                }}
                style={{ cursor: 'pointer' }}
              >
                <circle r="10" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
                <line x1="-3.5" y1="-3.5" x2="3.5" y2="3.5" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
                <line x1="3.5" y1="-3.5" x2="-3.5" y2="3.5" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
              </g>
            )}
          </g>
        );
      })}

      {/* In-flight Active Elastic Wire - Clean Straight Preview */}
      {activeWireStart && cursorPos && (
        <g style={{ pointerEvents: 'none' }}>
          <line
            x1={activeWireStart.x}
            y1={activeWireStart.y}
            x2={cursorPos.x}
            y2={cursorPos.y}
            stroke={activeWireStart.color}
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeDasharray="6 4"
          />
          <circle cx={activeWireStart.x} cy={activeWireStart.y} r="3.5" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
          <circle cx={cursorPos.x} cy={cursorPos.y} r="4.5" fill={activeWireStart.color} stroke="#ffffff" strokeWidth="1.5" />
        </g>
      )}
    </g>
  );
};
