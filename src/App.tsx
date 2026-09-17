import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { CircuitComponent, ComponentType, LogEntry, SimulationState, Wire, AISchematicRecipe } from './types/circuit';
import { createComponentInstance } from './data/componentDefinitions';
import { CircuitCanvas } from './components/canvas/CircuitCanvas';
import { TopHeader } from './components/toolbar/TopHeader';
import { LeftComponentSidebar } from './components/sidebar/LeftComponentSidebar';
import { SimulationCockpit } from './components/simulation/SimulationCockpit';
import { WiringLogPanel } from './components/log/WiringLogPanel';
import { AICircuitAssistant } from './components/ai/AICircuitAssistant';
import { analyzePinSuggestions } from './services/suggestionEngine';
import { audioSynth } from './services/audioSynthesizer';

export const App: React.FC = () => {
  // Initial canvas state with Arduino Uno and Breadboard
  const [components, setComponents] = useState<CircuitComponent[]>(() => {
    return [
      createComponentInstance('arduino_uno', 80, 160, 'arduino_init'),
      createComponentInstance('breadboard', 460, 160, 'breadboard_init'),
    ];
  });

  const [wires, setWires] = useState<Wire[]>(() => [
    {
      id: 'wire_sample_1',
      fromCompId: 'arduino_init',
      fromPinId: '5v',
      toCompId: 'breadboard_init',
      toPinId: 'top_plus_0',
      color: '#ef4444',
      createdAt: Date.now(),
    },
    {
      id: 'wire_sample_2',
      fromCompId: 'arduino_init',
      fromPinId: 'gnd_top',
      toCompId: 'breadboard_init',
      toPinId: 'top_minus_0',
      color: '#111827',
      createdAt: Date.now(),
    },
  ]);
  const [logs, setLogs] = useState<LogEntry[]>(() => [
    {
      id: 'log-0',
      timestamp: new Date().toLocaleTimeString(),
      action: 'add_component',
      message: 'Khởi tạo không gian làm việc với Arduino Uno R3 và Breadboard',
    },
  ]);

  // UI Selection State
  const [selectedCompId, setSelectedCompId] = useState<string | null>(null);
  const [selectedWireId, setSelectedWireId] = useState<string | null>(null);
  const [selectedWireColor, setSelectedWireColor] = useState<string>('#3b82f6');
  const [projectTitle, setProjectTitle] = useState<string>('Mạch Arduino Mới');

  // Sidebar collapse state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  // Active in-flight wiring state
  const [activeWiringPin, setActiveWiringPin] = useState<{ compId: string; pinId: string } | null>(null);

  // Simulation State
  const [isSimulating, setIsSimulating] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [simulationState, setSimulationState] = useState<SimulationState>({
    isRunning: false,
    activeLeds: {},
    buzzerActive: false,
    buzzerFrequency: 1000,
    servoAngle: 90,
    distanceVal: 50,
    potVoltage: 2.5,
    ldrLightLevel: 50,
    motionDetected: false,
    buttonPressed: false,
  });

  // API Key state for AI
  const [apiKey, setApiKey] = useState<string>('');

  // Active side panel tab: 'ai' | 'log'
  const [activeSideTab, setActiveSideTab] = useState<'ai' | 'log'>('ai');

  // Add Log Helper
  const addLog = useCallback((action: LogEntry['action'], message: string, detail?: string) => {
    const newEntry: LogEntry = {
      id: `log-${Date.now()}-${Math.random()}`,
      timestamp: new Date().toLocaleTimeString(),
      action,
      message,
      detail,
    };
    setLogs((prev) => [...prev, newEntry]);
  }, []);

  // Compute real-time suggestions whenever activeWiringPin changes
  const { suggestions, recommendedColor, smartAdvice, warningAlert } = useMemo(() => {
    if (!activeWiringPin) {
      return {
        suggestions: [],
        recommendedColor: selectedWireColor,
        smartAdvice: 'Nhấp vào một chân bất kỳ trên linh kiện để bắt đầu kéo dây nối...',
        warningAlert: undefined,
      };
    }
    const res = analyzePinSuggestions(activeWiringPin.compId, activeWiringPin.pinId, components, wires);
    return {
      suggestions: res.suggestions,
      recommendedColor: res.recommendedColor || selectedWireColor,
      smartAdvice: res.smartAdvice,
      warningAlert: res.warningAlert,
    };
  }, [activeWiringPin, components, wires, selectedWireColor]);

  // Handle Add Wire
  const handleAddWire = useCallback(
    (fromCompId: string, fromPinId: string, toCompId: string, toPinId: string, color: string) => {
      // Check if already wired
      const exists = wires.some(
        (w) =>
          (w.fromCompId === fromCompId && w.fromPinId === fromPinId && w.toCompId === toCompId && w.toPinId === toPinId) ||
          (w.fromCompId === toCompId && w.fromPinId === toPinId && w.toCompId === fromCompId && w.toPinId === fromPinId)
      );
      if (exists) return;

      const newWire: Wire = {
        id: `wire_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        fromCompId,
        fromPinId,
        toCompId,
        toPinId,
        color,
        createdAt: Date.now(),
      };

      setWires((prev) => [...prev, newWire]);
      audioSynth.playClickSound();

      const fromComp = components.find((c) => c.id === fromCompId);
      const fromPin = fromComp?.pins.find((p) => p.id === fromPinId);
      const toComp = components.find((c) => c.id === toCompId);
      const toPin = toComp?.pins.find((p) => p.id === toPinId);

      addLog(
        'add_wire',
        `Cắm dây: ${fromComp?.name || fromCompId} [${fromPin?.name || fromPinId}] ➔ ${toComp?.name || toCompId} [${toPin?.name || toPinId}]`,
        `Màu dây: ${color}`
      );
    },
    [wires, components, addLog]
  );

  // Handle Delete Wire
  const handleDeleteWire = useCallback(
    (wireId: string) => {
      const wire = wires.find((w) => w.id === wireId);
      if (!wire) return;

      const fromComp = components.find((c) => c.id === wire.fromCompId);
      const toComp = components.find((c) => c.id === wire.toCompId);

      setWires((prev) => prev.filter((w) => w.id !== wireId));
      if (selectedWireId === wireId) setSelectedWireId(null);
      audioSynth.playClickSound();

      addLog(
        'remove_wire',
        `Rút dây cắm giữa ${fromComp?.name || wire.fromCompId} và ${toComp?.name || wire.toCompId}`
      );
    },
    [wires, selectedWireId, components, addLog]
  );

  // Handle Update Wire Waypoints (Bend points)
  const handleUpdateWireWaypoints = useCallback(
    (wireId: string, waypoints: Array<{ x: number; y: number }>) => {
      setWires((prev) =>
        prev.map((w) => (w.id === wireId ? { ...w, waypoints } : w))
      );
    },
    []
  );

  // Handle Clear All Wires
  const handleClearWires = useCallback(() => {
    setWires([]);
    setSelectedWireId(null);
    audioSynth.playClickSound();
    addLog('clear', 'Đã xoá toàn bộ dây nối trên canvas');
  }, [addLog]);

  // Handle Add Component
  const handleAddComponent = useCallback(
    (type: ComponentType, customProps?: Record<string, any>) => {
      const offset = (components.length % 6) * 35;
      const newComp = createComponentInstance(type, 320 + offset, 100 + offset, undefined, customProps);
      setComponents((prev) => [...prev, newComp]);
      setSelectedCompId(newComp.id);
      audioSynth.playClickSound();
      addLog('add_component', `Thêm linh kiện: ${newComp.name}`);
    },
    [components.length, addLog]
  );

  // Handle Delete Component
  const handleDeleteComponent = useCallback(
    (compId: string) => {
      const comp = components.find((c) => c.id === compId || c.instanceId === compId);
      if (!comp) return;

      // Filter out component
      setComponents((prev) => prev.filter((c) => c.id !== compId && c.instanceId !== compId));

      // Automatically remove all associated wires to avoid dangling connections
      const removedWires = wires.filter(
        (w) => w.fromCompId === compId || w.toCompId === compId
      );
      if (removedWires.length > 0) {
        setWires((prev) =>
          prev.filter((w) => w.fromCompId !== compId && w.toCompId !== compId)
        );
      }

      if (selectedCompId === compId) {
        setSelectedCompId(null);
      }
      audioSynth.playClickSound();

      addLog(
        'remove_component',
        `Đã xoá linh kiện: ${comp.name}`,
        removedWires.length > 0
          ? `Đã tự động dọn sạch ${removedWires.length} đường dây nối liên quan`
          : undefined
      );
    },
    [components, wires, selectedCompId, addLog]
  );

  // Handle Rotate Component
  const handleRotateComponent = useCallback(
    (compId: string) => {
      setComponents((prev) =>
        prev.map((c) =>
          c.id === compId || c.instanceId === compId
            ? { ...c, rotation: (c.rotation + 90) % 360 }
            : c
        )
      );
      audioSynth.playClickSound();
    },
    []
  );

  // Handle Duplicate Component
  const handleDuplicateComponent = useCallback(
    (compId: string) => {
      const target = components.find((c) => c.id === compId || c.instanceId === compId);
      if (!target) return;

      const newId = `${target.type}_copy_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      const cloned = createComponentInstance(
        target.type,
        target.x + 40,
        target.y + 40,
        newId,
        { ...target.properties, ...target.attributes }
      );
      cloned.rotation = target.rotation;

      setComponents((prev) => [...prev, cloned]);
      setSelectedCompId(newId);
      audioSynth.playClickSound();
      addLog('add_component', `Nhân bản linh kiện: ${cloned.name}`);
    },
    [components, addLog]
  );

  // Update Component Position
  const handleUpdateComponentPos = useCallback((id: string, x: number, y: number) => {
    setComponents((prev) =>
      prev.map((c) => (c.id === id || c.instanceId === id ? { ...c, x, y } : c))
    );
  }, []);

  // Update Component Properties
  const handleUpdateComponentProps = useCallback((id: string, props: Record<string, any>) => {
    setComponents((prev) =>
      prev.map((c) =>
        c.id === id || c.instanceId === id
          ? {
              ...c,
              properties: { ...c.properties, ...props },
              attributes: { ...c.attributes, ...props },
            }
          : c
      )
    );
  }, []);

  // Handle Reset Canvas
  const handleResetCanvas = useCallback(() => {
    setComponents([
      createComponentInstance('arduino_uno', 80, 160, 'arduino_init'),
      createComponentInstance('breadboard', 460, 160, 'breadboard_init'),
    ]);
    setWires([]);
    setSelectedCompId(null);
    setSelectedWireId(null);
    setActiveWiringPin(null);
    setIsSimulating(false);
    audioSynth.stopBeep();
    addLog('clear', 'Đã thiết lập lại không gian làm việc trắng');
  }, [addLog]);

  // Apply AI Schematic Recipe
  const handleApplyRecipe = useCallback(
    (recipe: AISchematicRecipe) => {
      setProjectTitle(recipe.title);

      // Create new component list
      const newComps: CircuitComponent[] = recipe.components.map((c) =>
        createComponentInstance(c.type, c.x, c.y, c.id, c.properties)
      );

      // Create new wires
      const newWires: Wire[] = recipe.wires.map((w, idx) => ({
        id: `wire_ai_${Date.now()}_${idx}`,
        fromCompId: w.fromCompId,
        fromPinId: w.fromPinId,
        toCompId: w.toCompId,
        toPinId: w.toPinId,
        color: w.color,
        createdAt: Date.now() + idx,
      }));

      setComponents(newComps);
      setWires(newWires);
      setSelectedCompId(null);
      setSelectedWireId(null);
      setActiveWiringPin(null);

      addLog(
        'ai_generated',
        `AI tự động tạo sơ đồ: "${recipe.title}" (${newComps.length} linh kiện, ${newWires.length} đường dây nối)`,
        recipe.description
      );
    },
    [addLog]
  );

  // Export JSON
  const handleExportJson = useCallback(() => {
    const data = {
      title: projectTitle,
      createdAt: new Date().toISOString(),
      components,
      wires,
      logs,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectTitle.toLowerCase().replace(/\s+/g, '_')}_schematic.json`;
    a.click();
    URL.revokeObjectURL(url);
    addLog('ai_generated', 'Đã tải xuống file sơ đồ JSON của dự án');
  }, [projectTitle, components, wires, logs, addLog]);

  // Toggle Simulation Mode
  const handleToggleSimulation = useCallback(() => {
    setIsSimulating((prev) => {
      const next = !prev;
      if (!next) {
        audioSynth.stopBeep();
      }
      return next;
    });
  }, []);

  // Circuit Simulation Evaluation Loop
  useEffect(() => {
    if (!isSimulating) {
      setSimulationState({
        isRunning: false,
        activeLeds: {},
        buzzerActive: false,
        buzzerFrequency: 1000,
        servoAngle: 90,
        distanceVal: 50,
        potVoltage: 2.5,
        ldrLightLevel: 50,
        motionDetected: false,
        buttonPressed: false,
      });
      audioSynth.stopBeep();
      return;
    }

    // Interval to simulate circuit state & reactions
    const interval = setInterval(() => {
      // 1. Check Button states
      const btnComp = components.find((c) => c.type === 'pushbutton');
      const isButtonPressed = btnComp?.properties?.isPressed || btnComp?.attributes?.isPressed || false;

      // 2. Check Potentiometer voltage
      const potComp = components.find((c) => c.type === 'potentiometer');
      const potVal = potComp?.properties?.potValue ?? potComp?.attributes?.potValue ?? 512;
      const potVoltage = (potVal / 1023) * 5.0;

      // 3. Servo Angle linked to Potentiometer or its own angle
      const servoComp = components.find((c) => c.type === 'servo');
      const servoAngle = potComp ? (potVal / 1023) * 180 : (servoComp?.properties?.angle ?? 90);

      // 4. Ultrasonic Sensor distance
      const sonarComp = components.find((c) => c.type === 'ultrasonic');
      const dist = sonarComp?.properties?.distance ?? sonarComp?.attributes?.distance ?? 50;

      // 5. PIR Sensor motion
      const pirComp = components.find((c) => c.type === 'pir');
      const isMotion = pirComp?.properties?.motionDetected ?? pirComp?.attributes?.motionDetected ?? false;

      // 6. LDR Sensor light level
      const ldrComp = components.find((c) => c.type === 'ldr');
      const light = ldrComp?.properties?.lightLevel ?? ldrComp?.attributes?.lightLevel ?? 50;

      // 7. Check LED lighting conditions
      const activeLeds: Record<string, boolean> = {};
      components.forEach((comp) => {
        if (comp.type === 'led') {
          // Check if anode and cathode are connected
          const hasAnodeWire = wires.some(
            (w) =>
              (w.fromCompId === comp.id && w.fromPinId === 'anode') ||
              (w.toCompId === comp.id && w.toPinId === 'anode')
          );
          const hasCathodeWire = wires.some(
            (w) =>
              (w.fromCompId === comp.id && w.fromPinId === 'cathode') ||
              (w.toCompId === comp.id && w.toPinId === 'cathode')
          );

          if (hasAnodeWire && hasCathodeWire) {
            // If button is in circuit or pressed, or proximity alert
            if (!btnComp || isButtonPressed || dist < 30 || isMotion) {
              activeLeds[comp.id] = true;
            }
          }
        }
      });

      // 8. Check Buzzer activation
      const buzzerComp = components.find((c) => c.type === 'buzzer');
      let buzzerActive = false;
      if (buzzerComp) {
        const hasPos = wires.some(
          (w) =>
            (w.fromCompId === buzzerComp.id && w.fromPinId === 'pos') ||
            (w.toCompId === buzzerComp.id && w.toPinId === 'pos')
        );
        const hasNeg = wires.some(
          (w) =>
            (w.fromCompId === buzzerComp.id && w.fromPinId === 'neg') ||
            (w.toCompId === buzzerComp.id && w.toPinId === 'neg')
        );
        buzzerActive = hasPos && hasNeg;
      }

      // Proximity alarm or motion alarm
      const shouldBuzz = buzzerActive || (sonarComp && dist < 25) || (pirComp && isMotion);
      const freq = dist < 15 ? 2000 : dist < 25 ? 1400 : 1000;

      if (shouldBuzz && !isMuted) {
        audioSynth.startBeep(freq);
      } else {
        audioSynth.stopBeep();
      }

      setSimulationState({
        isRunning: true,
        activeLeds,
        buzzerActive: shouldBuzz,
        buzzerFrequency: freq,
        servoAngle,
        distanceVal: dist,
        potVoltage,
        ldrLightLevel: light,
        motionDetected: isMotion,
        buttonPressed: isButtonPressed,
      });
    }, 150);

    return () => {
      clearInterval(interval);
      audioSynth.stopBeep();
    };
  }, [isSimulating, components, wires, isMuted]);

  return (
    <div className="app-container">
      {/* 1. Top Header Toolbar */}
      <TopHeader
        isSimulating={isSimulating}
        onToggleSimulation={handleToggleSimulation}
        onResetCanvas={handleResetCanvas}
        selectedColor={selectedWireColor}
        onSelectColor={setSelectedWireColor}
        projectTitle={projectTitle}
      />

      {/* 2. Main Workspace Layout: 3 Columns (Left Sidebar | Center Canvas | Right Panel) */}
      <div className="workspace-layout">
        {/* Left Searchable Component Library Sidebar */}
        <LeftComponentSidebar
          onAddComponent={handleAddComponent}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        {/* Center Canvas Area */}
        <div className="canvas-main-area">
          {/* Live Interactive Simulation Controls Bar */}
          <SimulationCockpit
            isSimulating={isSimulating}
            onToggleSimulation={handleToggleSimulation}
            simulationState={simulationState}
            components={components}
            onUpdateComponentProps={handleUpdateComponentProps}
            isMuted={isMuted}
            onToggleMute={() => setIsMuted(!isMuted)}
          />

          {/* Interactive Circuit Canvas */}
          <CircuitCanvas
            components={components}
            wires={wires}
            selectedCompId={selectedCompId}
            selectedWireId={selectedWireId}
            onSelectComponent={setSelectedCompId}
            onSelectWire={setSelectedWireId}
            onUpdateComponentPos={handleUpdateComponentPos}
            onUpdateComponentProps={handleUpdateComponentProps}
            onDeleteComponent={handleDeleteComponent}
            onRotateComponent={handleRotateComponent}
            onDuplicateComponent={handleDuplicateComponent}
            onAddWire={handleAddWire}
            onDeleteWire={handleDeleteWire}
            onUpdateWireWaypoints={handleUpdateWireWaypoints}
            suggestions={suggestions}
            recommendedWireColor={recommendedColor}
            smartAdvice={smartAdvice}
            warningAlert={warningAlert}
            simulationState={simulationState}
            onStartWiring={(compId, pinId) => setActiveWiringPin({ compId, pinId })}
            onCancelWiring={() => setActiveWiringPin(null)}
            activeWiringPin={activeWiringPin}
          />
        </div>

        {/* Right Docked Side Panel (AI Assistant & Real-time Wiring Log) */}
        <aside className="right-docked-panel">
          {/* Tab Navigation */}
          <div className="side-panel-tabs">
            <button
              onClick={() => setActiveSideTab('ai')}
              className={`side-tab-nav-btn ${activeSideTab === 'ai' ? 'active' : ''}`}
            >
              ✨ AI Tạo Sơ Đồ
            </button>
            <button
              onClick={() => setActiveSideTab('log')}
              className={`side-tab-nav-btn ${activeSideTab === 'log' ? 'active' : ''}`}
            >
              📋 Log Sơ Đồ Cắm ({wires.length})
            </button>
          </div>

          {/* Tab Content */}
          <div className="side-panel-content">
            {activeSideTab === 'ai' ? (
              <AICircuitAssistant
                onApplyRecipe={handleApplyRecipe}
                apiKey={apiKey}
                onUpdateApiKey={setApiKey}
              />
            ) : (
              <WiringLogPanel
                logs={logs}
                wires={wires}
                components={components}
                onDeleteWire={handleDeleteWire}
                onClearWires={handleClearWires}
                onExportJson={handleExportJson}
              />
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default App;
