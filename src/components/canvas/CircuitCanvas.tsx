import React, { useRef, useState, useEffect, useCallback } from 'react';
import type { CircuitComponent, Wire, PinSuggestion, SimulationState } from '../../types/circuit';
import { ZoomIn, ZoomOut, RotateCcw, Trash2, RotateCw, Copy } from 'lucide-react';
import { ArduinoUnoSvg } from './components/ArduinoUnoSvg';
import { ArduinoMegaSvg } from './components/ArduinoMegaSvg';
import { Esp32Svg } from './components/Esp32Svg';
import { ArduinoNanoSvg } from './components/ArduinoNanoSvg';
import { BreadboardSvg } from './components/BreadboardSvg';
import { LedSvg } from './components/LedSvg';
import { LedRgbSvg } from './components/LedRgbSvg';
import { ResistorSvg } from './components/ResistorSvg';
import { PushbuttonSvg } from './components/PushbuttonSvg';
import { PotentiometerSvg } from './components/PotentiometerSvg';
import { UltrasonicSvg } from './components/UltrasonicSvg';
import { BuzzerSvg } from './components/BuzzerSvg';
import { ServoSvg } from './components/ServoSvg';
import { PirSvg } from './components/PirSvg';
import { LdrSvg } from './components/LdrSvg';
import { Lcd1602Svg } from './components/Lcd1602Svg';
import { OledI2cSvg } from './components/OledI2cSvg';
import { RelayModuleSvg } from './components/RelayModuleSvg';
import { Dht11Svg } from './components/Dht11Svg';
import { JoystickSvg } from './components/JoystickSvg';
import { WiresLayer } from './WiresLayer';

interface Props {
  components: CircuitComponent[];
  wires: Wire[];
  selectedCompId: string | null;
  selectedWireId: string | null;
  onSelectComponent: (id: string | null) => void;
  onSelectWire: (id: string | null) => void;
  onUpdateComponentPos: (id: string, x: number, y: number) => void;
  onUpdateComponentProps: (id: string, props: Record<string, any>) => void;
  onDeleteComponent: (id: string) => void;
  onRotateComponent: (id: string) => void;
  onDuplicateComponent: (id: string) => void;
  onAddWire: (fromCompId: string, fromPinId: string, toCompId: string, toPinId: string, color: string) => void;
  onDeleteWire: (wireId: string) => void;
  onUpdateWireWaypoints?: (wireId: string, waypoints: Array<{ x: number; y: number }>) => void;
  suggestions: PinSuggestion[];
  recommendedWireColor: string;
  smartAdvice: string;
  warningAlert?: string;
  simulationState: SimulationState;
  onStartWiring: (compId: string, pinId: string) => void;
  onCancelWiring: () => void;
  activeWiringPin: { compId: string; pinId: string } | null;
}


export const CircuitCanvas: React.FC<Props> = ({
  components,
  wires,
  selectedCompId,
  selectedWireId,
  onSelectComponent,
  onSelectWire,
  onUpdateComponentPos,
  onUpdateComponentProps,
  onDeleteComponent,
  onRotateComponent,
  onDuplicateComponent,
  onAddWire,
  onDeleteWire,
  onUpdateWireWaypoints,
  suggestions,
  recommendedWireColor,
  smartAdvice,
  warningAlert,
  simulationState,
  onStartWiring,
  onCancelWiring,
  activeWiringPin,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);


  // Zoom & Pan state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Component Dragging state
  const [draggingCompId, setDraggingCompId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Wire Waypoint Dragging state
  const [draggingWaypoint, setDraggingWaypoint] = useState<{ wireId: string; index: number } | null>(null);

  // Active in-flight wire mouse cursor
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);

  // Convert client (screen) coordinates to SVG canvas space coordinates
  const clientToCanvasCoord = useCallback(
    (clientX: number, clientY: number) => {
      if (!svgRef.current) return { x: 0, y: 0 };
      const rect = svgRef.current.getBoundingClientRect();
      const rawX = clientX - rect.left;
      const rawY = clientY - rect.top;
      return {
        x: (rawX - pan.x) / zoom,
        y: (rawY - pan.y) / zoom,
      };
    },
    [pan, zoom]
  );

  // Active wiring start coordinates
  const activeWireStart = activeWiringPin
    ? (() => {
        const comp = components.find((c) => (c.instanceId || c.id) === activeWiringPin.compId);
        const pin = comp?.pins.find((p) => p.id === activeWiringPin.pinId);
        if (!comp || !pin) return null;
        const px = pin.x ?? pin.position?.x ?? 0;
        const py = pin.y ?? pin.position?.y ?? 0;
        return {
          compId: comp.instanceId || comp.id,
          pinId: pin.id,
          x: comp.x + px,
          y: comp.y + py,
          color: recommendedWireColor,
        };
      })()
    : null;

  // Handle pin click to start or complete wiring
  const handlePinClick = (compId: string, pinId: string, event: React.MouseEvent) => {
    event.stopPropagation();

    if (!activeWiringPin) {
      // Start dragging a wire
      onStartWiring(compId, pinId);
    } else {
      // Complete wire if clicking a different pin
      if (activeWiringPin.compId === compId && activeWiringPin.pinId === pinId) {
        // Clicked same pin: cancel
        onCancelWiring();
      } else {
        // Add wire
        onAddWire(activeWiringPin.compId, activeWiringPin.pinId, compId, pinId, recommendedWireColor);
        onCancelWiring();
      }
    }
  };

  // Mouse Down handler for dragging components or panning
  const handleMouseDown = (e: React.MouseEvent) => {
    // If middle click or space held, initiate pan
    if (e.button === 1 || e.altKey) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      return;
    }

    // Check if clicked directly on canvas background
    const target = e.target as HTMLElement;
    if (target.tagName === 'svg' || target.id === 'canvas-bg-grid') {
      onSelectComponent(null);
      onSelectWire(null);
      if (activeWiringPin) {
        onCancelWiring();
      }
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  // Start dragging a component
  const handleCompMouseDown = (compId: string, e: React.MouseEvent) => {
    if (activeWiringPin) return; // Don't drag while wiring

    // Never initiate component drag if mousedown originated on a pin
    const target = e.target as HTMLElement | SVGElement;
    if (target.closest && (target.closest('.pin-terminal') || target.closest('[data-pin-id]'))) {
      return;
    }

    e.stopPropagation();
    onSelectComponent(compId);
    onSelectWire(null);

    const comp = components.find((c) => (c.instanceId || c.id) === compId);
    if (!comp) return;

    const coords = clientToCanvasCoord(e.clientX, e.clientY);
    setDraggingCompId(compId);
    setDragOffset({ x: coords.x - comp.x, y: coords.y - comp.y });
  };

  // Mouse Move
  const handleMouseMove = (e: React.MouseEvent) => {
    const coords = clientToCanvasCoord(e.clientX, e.clientY);
    setCursorPos(coords);

    if (draggingWaypoint && onUpdateWireWaypoints) {
      // Safety guard: if mouse button is not currently held down, stop dragging immediately!
      if (e.buttons !== 1) {
        setDraggingWaypoint(null);
        return;
      }
      const wire = wires.find((w) => w.id === draggingWaypoint.wireId);
      if (wire && wire.waypoints) {
        const updated = [...wire.waypoints];
        updated[draggingWaypoint.index] = {
          x: Math.round(coords.x),
          y: Math.round(coords.y),
        };
        onUpdateWireWaypoints(draggingWaypoint.wireId, updated);
      }
      return;
    }

    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
      return;
    }

    if (draggingCompId) {
      const newX = Math.round(coords.x - dragOffset.x);
      const newY = Math.round(coords.y - dragOffset.y);
      onUpdateComponentPos(draggingCompId, newX, newY);
    }
  };

  // Mouse Up
  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggingCompId(null);
    setDraggingWaypoint(null);
  };

  // Wheel Zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    const newZoom = Math.min(Math.max(zoom * zoomFactor, 0.4), 2.2);

    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    setPan({
      x: mouseX - (mouseX - pan.x) * (newZoom / zoom),
      y: mouseY - (mouseY - pan.y) * (newZoom / zoom),
    });
    setZoom(newZoom);
  };

  // Selected component reference
  const selectedComponent = components.find(
    (c) => (c.instanceId || c.id) === selectedCompId
  );

  // Keyboard Shortcuts: Delete/Backspace to delete component/wire, R to rotate
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when user is typing in form inputs
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea') return;

      if (e.key === 'Escape' && activeWiringPin) {
        onCancelWiring();
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedCompId) {
          onDeleteComponent(selectedCompId);
        } else if (selectedWireId) {
          onDeleteWire(selectedWireId);
        }
      }
      if ((e.key === 'r' || e.key === 'R') && selectedCompId) {
        onRotateComponent(selectedCompId);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    activeWiringPin,
    selectedCompId,
    selectedWireId,
    onCancelWiring,
    onDeleteComponent,
    onDeleteWire,
    onRotateComponent,
  ]);

  // Global mouseup listener so dragging always stops cleanly anywhere
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setDraggingWaypoint(null);
      setDraggingCompId(null);
      setIsPanning(false);
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  // Extract list of suggested pin IDs for the active component being hovered/suggested
  const getHighlightPinsForComp = (compId: string) => {
    return suggestions
      .filter((s) => s.targetCompId === compId)
      .map((s) => s.targetPinId);
  };

  return (
    <div className="circuit-canvas-wrapper" onMouseDown={handleMouseDown}>
      {/* Floating Selected Component Quick Action Bar */}
      {selectedComponent && (
        <div className="selected-comp-floating-bar glass-panel">
          <div className="selected-comp-info">
            <span className="selected-comp-name">{selectedComponent.name}</span>
            <span className="selected-comp-rot">{selectedComponent.rotation}°</span>
          </div>
          <div className="selected-comp-actions">
            <button
              onClick={() => onRotateComponent(selectedComponent.id)}
              className="comp-action-btn"
              title="Xoay 90° (Phím R)"
            >
              <RotateCw className="w-3.5 h-3.5 text-sky-400" />
              <span>Xoay (R)</span>
            </button>
            <button
              onClick={() => onDuplicateComponent(selectedComponent.id)}
              className="comp-action-btn"
              title="Nhân bản linh kiện"
            >
              <Copy className="w-3.5 h-3.5 text-emerald-400" />
              <span>Nhân bản</span>
            </button>
            <button
              onClick={() => onDeleteComponent(selectedComponent.id)}
              className="comp-action-btn delete"
              title="Xoá linh kiện (Phím Delete)"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Xoá (Del)</span>
            </button>
          </div>
        </div>
      )}

      {/* Floating Smart Suggestion & Safety HUD */}
      {activeWiringPin && (
        <div className="floating-smart-hud glass-panel">
          <div className="hud-badge">
            <span className="hud-pulse-dot" />
            <span className="font-semibold text-emerald-400">Gợi ý nối chân Real-time</span>
          </div>
          <p className="hud-advice">{smartAdvice}</p>
          {warningAlert && (
            <div className="hud-warning">
              ⚠️ {warningAlert}
            </div>
          )}
          <div className="hud-instructions">
            Nhấp chân đích đề xuất (vòng sáng xanh lá) để cắm dây • Nhấn <kbd>Esc</kbd> để huỷ
          </div>
        </div>
      )}


      {/* Canvas Controls Toolbar (Zoom, Reset View) */}
      <div className="canvas-floating-toolbar glass-panel">
        <button
          onClick={() => setZoom((z) => Math.min(z + 0.15, 2.2))}
          title="Phóng to"
          className="canvas-tool-btn"
        >
          <ZoomIn className="w-4 h-4 text-slate-300" />
        </button>
        <span className="canvas-zoom-text">{Math.round(zoom * 100)}%</span>
        <button
          onClick={() => setZoom((z) => Math.max(z - 0.15, 0.4))}
          title="Thu nhỏ"
          className="canvas-tool-btn"
        >
          <ZoomOut className="w-4 h-4 text-slate-300" />
        </button>
        <button
          onClick={() => {
            setZoom(1);
            setPan({ x: 0, y: 0 });
          }}
          title="Vừa màn hình (Reset View)"
          className="canvas-tool-btn"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-300" />
        </button>
      </div>

      {/* Main Interactive SVG Canvas */}
      <svg
        ref={svgRef}
        className="circuit-svg-viewport"
        style={{ cursor: draggingWaypoint ? 'grabbing' : activeWiringPin ? 'crosshair' : isPanning ? 'grabbing' : 'default' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
      >
        <defs>
          {/* Subtle Minimalist Electronics Dot Grid */}
          <pattern
            id="circuit-grid"
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="10" cy="10" r="0.8" fill="#475569" opacity="0.35" />
          </pattern>
        </defs>

        {/* Background Grid */}
        <rect
          id="canvas-bg-grid"
          x="-20000"
          y="-20000"
          width="40000"
          height="40000"
          fill="url(#circuit-grid)"
        />

        {/* Pan and Zoom Root Container */}
        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* 1. Component Layer */}
          {components.map((comp) => {
            const compId = comp.instanceId || comp.id;
            const compType = (comp.type || comp.modelId || '').toLowerCase();
            const isSelected = selectedCompId === compId;
            const highlightPinIds = getHighlightPinsForComp(compId);

            return (
              <g
                key={compId}
                onMouseDown={(e) => handleCompMouseDown(compId, e)}
              >
                {compType.includes('mega') && (
                  <ArduinoMegaSvg
                    component={comp}
                    isSelected={isSelected}
                    onPinClick={(pinId, e) => handlePinClick(compId, pinId, e)}
                    highlightPinIds={highlightPinIds}
                  />
                )}
                {compType.includes('esp32') && (
                  <Esp32Svg
                    component={comp}
                    isSelected={isSelected}
                    onPinClick={(pinId, e) => handlePinClick(compId, pinId, e)}
                    highlightPinIds={highlightPinIds}
                  />
                )}
                {compType.includes('nano') && (
                  <ArduinoNanoSvg
                    component={comp}
                    isSelected={isSelected}
                    onPinClick={(pinId, e) => handlePinClick(compId, pinId, e)}
                    highlightPinIds={highlightPinIds}
                  />
                )}
                {compType.includes('arduino') && !compType.includes('mega') && !compType.includes('nano') && (
                  <ArduinoUnoSvg
                    component={comp}
                    isSelected={isSelected}
                    onPinClick={(pinId, e) => handlePinClick(compId, pinId, e)}
                    highlightPinIds={highlightPinIds}
                  />
                )}
                {compType.includes('lcd') && (
                  <Lcd1602Svg
                    component={comp}
                    isSelected={isSelected}
                    onPinClick={(pinId, e) => handlePinClick(compId, pinId, e)}
                    highlightPinIds={highlightPinIds}
                  />
                )}
                {compType.includes('oled') && (
                  <OledI2cSvg
                    component={comp}
                    isSelected={isSelected}
                    onPinClick={(pinId, e) => handlePinClick(compId, pinId, e)}
                    highlightPinIds={highlightPinIds}
                  />
                )}
                {compType.includes('relay') && (
                  <RelayModuleSvg
                    component={comp}
                    isSelected={isSelected}
                    onPinClick={(pinId, e) => handlePinClick(compId, pinId, e)}
                    highlightPinIds={highlightPinIds}
                  />
                )}
                {compType.includes('dht') && (
                  <Dht11Svg
                    component={comp}
                    isSelected={isSelected}
                    onPinClick={(pinId, e) => handlePinClick(compId, pinId, e)}
                    highlightPinIds={highlightPinIds}
                  />
                )}
                {compType.includes('rgb') && (
                  <LedRgbSvg
                    component={comp}
                    isSelected={isSelected}
                    onPinClick={(pinId, e) => handlePinClick(compId, pinId, e)}
                    highlightPinIds={highlightPinIds}
                  />
                )}
                {compType.includes('joystick') && (
                  <JoystickSvg
                    component={comp}
                    isSelected={isSelected}
                    onPinClick={(pinId, e) => handlePinClick(compId, pinId, e)}
                    highlightPinIds={highlightPinIds}
                  />
                )}
                {compType.includes('breadboard') && (
                  <BreadboardSvg
                    component={comp}
                    isSelected={isSelected}
                    onPinClick={(pinId, e) => handlePinClick(compId, pinId, e)}
                    highlightPinIds={highlightPinIds}
                  />
                )}
                {compType.includes('led') && !compType.includes('rgb') && (
                  <LedSvg
                    component={comp}
                    isSelected={isSelected}
                    isLit={simulationState.activeLeds[compId] || simulationState.activeLeds[comp.id]}
                    onPinClick={(pinId, e) => handlePinClick(compId, pinId, e)}
                    highlightPinIds={highlightPinIds}
                  />
                )}
                {compType.includes('resistor') && (
                  <ResistorSvg
                    component={comp}
                    isSelected={isSelected}
                    onPinClick={(pinId, e) => handlePinClick(compId, pinId, e)}
                    highlightPinIds={highlightPinIds}
                  />
                )}
                {compType.includes('pushbutton') && (
                  <PushbuttonSvg
                    component={comp}
                    isSelected={isSelected}
                    onPinClick={(pinId, e) => handlePinClick(compId, pinId, e)}
                    onTogglePress={() => {
                      const cur = comp.attributes?.isPressed ?? comp.properties?.isPressed ?? false;
                      onUpdateComponentProps(compId, { isPressed: !cur });
                    }}
                    highlightPinIds={highlightPinIds}
                  />
                )}
                {compType.includes('potentiometer') && (
                  <PotentiometerSvg
                    component={comp}
                    isSelected={isSelected}
                    onPinClick={(pinId, e) => handlePinClick(compId, pinId, e)}
                    onValueChange={(val) => {
                      onUpdateComponentProps(compId, { potValue: val });
                    }}
                    highlightPinIds={highlightPinIds}
                  />
                )}
                {compType.includes('ultrasonic') && (
                  <UltrasonicSvg
                    component={comp}
                    isSelected={isSelected}
                    onPinClick={(pinId, e) => handlePinClick(compId, pinId, e)}
                    onDistanceChange={(dist) => {
                      onUpdateComponentProps(compId, { distance: dist });
                    }}
                    highlightPinIds={highlightPinIds}
                  />
                )}
                {compType.includes('buzzer') && (
                  <BuzzerSvg
                    component={comp}
                    isSelected={isSelected}
                    isActive={simulationState.buzzerActive}
                    onPinClick={(pinId, e) => handlePinClick(compId, pinId, e)}
                    highlightPinIds={highlightPinIds}
                  />
                )}
                {compType.includes('servo') && (
                  <ServoSvg
                    component={comp}
                    isSelected={isSelected}
                    overrideAngle={simulationState.servoAngle}
                    onPinClick={(pinId, e) => handlePinClick(compId, pinId, e)}
                    highlightPinIds={highlightPinIds}
                  />
                )}
                {compType.includes('pir') && (
                  <PirSvg
                    component={comp}
                    isSelected={isSelected}
                    onPinClick={(pinId, e) => handlePinClick(compId, pinId, e)}
                    onToggleMotion={() => {
                      const cur = comp.attributes?.motionDetected ?? comp.properties?.motionDetected ?? false;
                      onUpdateComponentProps(compId, { motionDetected: !cur });
                    }}
                    highlightPinIds={highlightPinIds}
                  />
                )}
                {compType.includes('ldr') && (
                  <LdrSvg
                    component={comp}
                    isSelected={isSelected}
                    onPinClick={(pinId, e) => handlePinClick(compId, pinId, e)}
                    onLightChange={(val) => {
                      onUpdateComponentProps(compId, { lightLevel: val });
                    }}
                    highlightPinIds={highlightPinIds}
                  />
                )}

              </g>
            );
          })}

          {/* 2. Wires Layer */}
          <WiresLayer
            wires={wires}
            components={components}
            selectedWireId={selectedWireId}
            onSelectWire={onSelectWire}
            onDeleteWire={onDeleteWire}
            onUpdateWireWaypoints={onUpdateWireWaypoints}
            activeWireStart={activeWireStart}
            cursorPos={cursorPos}
            clientToCanvasCoord={clientToCanvasCoord}
            draggingWaypoint={draggingWaypoint}
            onStartDragWaypoint={(wireId, index) => setDraggingWaypoint({ wireId, index })}
          />
        </g>
      </svg>
    </div>
  );
};
