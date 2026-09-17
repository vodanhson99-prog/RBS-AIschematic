import React from 'react';
import type { CircuitComponent, SimulationState } from '../../types/circuit';
import {
  Square,
  Volume2,
  VolumeX,
  Disc,
  Radio,
  Eye,
  Sun,
  HandMetal,
  Zap,
} from 'lucide-react';


interface Props {
  isSimulating: boolean;
  onToggleSimulation: () => void;
  simulationState: SimulationState;
  components: CircuitComponent[];
  onUpdateComponentProps: (id: string, props: Record<string, any>) => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const SimulationCockpit: React.FC<Props> = ({
  isSimulating,
  onToggleSimulation,
  simulationState,
  components,
  onUpdateComponentProps,
  isMuted,
  onToggleMute,
}) => {
  // Find interactive components on the canvas
  const buttons = components.filter((c) => c.type === 'pushbutton');
  const pots = components.filter((c) => c.type === 'potentiometer');
  const sonars = components.filter((c) => c.type === 'ultrasonic');
  const pirs = components.filter((c) => c.type === 'pir');
  const ldrs = components.filter((c) => c.type === 'ldr');
  const servos = components.filter((c) => c.type === 'servo');
  const leds = components.filter((c) => c.type === 'led');

  if (!isSimulating) {
    return null;
  }

  return (
    <div className="simulation-cockpit glass-panel">
      {/* Cockpit Header */}
      <div className="cockpit-header">
        <div className="flex items-center gap-2">
          <span className="live-pulse-dot" />
          <span className="cockpit-title">BẢNG ĐIỀU KHIỂN MÔ PHỎNG THỜI GIAN THỰC</span>
          <span className="status-badge running">Mạch đang cấp điện 5V</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleMute}
            className={`cockpit-tool-btn ${isMuted ? 'muted' : ''}`}
            title={isMuted ? 'Bật âm thanh còi' : 'Tắt âm thanh còi'}
          >
            {isMuted ? (
              <VolumeX className="w-3.5 h-3.5 text-rose-400" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
            )}
            <span className="text-xs">{isMuted ? 'Đã tắt tiếng' : 'Âm thanh bật'}</span>
          </button>

          <button
            onClick={onToggleSimulation}
            className="cockpit-stop-btn"
            title="Dừng mô phỏng"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>Dừng mô phỏng</span>
          </button>
        </div>
      </div>

      {/* Interactive Controls Strip */}
      <div className="cockpit-controls-grid">
        {/* 1. Push Button Controls */}
        {buttons.map((btn) => {
          const isPressed =
            btn.attributes?.isPressed ?? btn.properties?.isPressed ?? false;
          return (
            <div key={btn.id} className="cockpit-control-card">
              <div className="card-label-row">
                <HandMetal className="w-3.5 h-3.5 text-slate-300" />
                <span className="control-label">{btn.name || 'Nút bấm'}</span>
              </div>
              <button
                className={`push-action-btn ${isPressed ? 'pressed' : ''}`}
                onMouseDown={() =>
                  onUpdateComponentProps(btn.id, { isPressed: true })
                }
                onMouseUp={() =>
                  onUpdateComponentProps(btn.id, { isPressed: false })
                }
                onMouseLeave={() =>
                  onUpdateComponentProps(btn.id, { isPressed: false })
                }
                onClick={() =>
                  onUpdateComponentProps(btn.id, { isPressed: !isPressed })
                }
              >
                {isPressed ? '🔴 Đang Giữ Bấm' : '🔘 Bấm & Giữ Nút'}
              </button>
            </div>
          );
        })}

        {/* 2. Potentiometer Slider */}
        {pots.map((pot) => {
          const potVal =
            pot.attributes?.potValue ?? pot.properties?.potValue ?? 512;
          const voltage = ((potVal / 1023) * 5.0).toFixed(2);
          return (
            <div key={pot.id} className="cockpit-control-card">
              <div className="card-label-row">
                <Disc className="w-3.5 h-3.5 text-blue-400" />
                <span className="control-label">{pot.name || 'Biến trở'}</span>
                <span className="control-val">{voltage}V</span>
              </div>
              <input
                type="range"
                min="0"
                max="1023"
                value={potVal}
                onChange={(e) =>
                  onUpdateComponentProps(pot.id, {
                    potValue: parseInt(e.target.value, 10),
                  })
                }
                className="cockpit-slider pot-slider"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>0V (0)</span>
                <span>2.5V (512)</span>
                <span>5V (1023)</span>
              </div>
            </div>
          );
        })}

        {/* 3. Ultrasonic Distance Slider */}
        {sonars.map((sonar) => {
          const dist =
            sonar.attributes?.distance ?? sonar.properties?.distance ?? 50;
          return (
            <div key={sonar.id} className="cockpit-control-card">
              <div className="card-label-row">
                <Radio className="w-3.5 h-3.5 text-teal-400" />
                <span className="control-label">{sonar.name || 'Cảm biến siêu âm'}</span>
                <span
                  className={`control-val ${dist < 25 ? 'text-rose-400 font-bold animate-pulse' : 'text-teal-400'}`}
                >
                  {dist} cm {dist < 25 ? '⚠️ GẦN!' : ''}
                </span>
              </div>
              <input
                type="range"
                min="2"
                max="300"
                value={dist}
                onChange={(e) =>
                  onUpdateComponentProps(sonar.id, {
                    distance: parseInt(e.target.value, 10),
                  })
                }
                className="cockpit-slider sonar-slider"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>2cm (Cực gần)</span>
                <span>150cm</span>
                <span>300cm (Xa)</span>
              </div>
            </div>
          );
        })}

        {/* 4. PIR Motion Sensor Toggle */}
        {pirs.map((pir) => {
          const isMotion =
            pir.attributes?.motionDetected ??
            pir.properties?.motionDetected ??
            false;
          return (
            <div key={pir.id} className="cockpit-control-card">
              <div className="card-label-row">
                <Eye className="w-3.5 h-3.5 text-lime-400" />
                <span className="control-label">{pir.name || 'Cảm biến PIR'}</span>
              </div>
              <button
                className={`pir-toggle-btn ${isMotion ? 'motion-active' : ''}`}
                onClick={() =>
                  onUpdateComponentProps(pir.id, { motionDetected: !isMotion })
                }
              >
                {isMotion ? '🚨 Đang Phát Hiện Người' : '🚶 Mô Phỏng Chuyển Động'}
              </button>
            </div>
          );
        })}

        {/* 5. LDR Light Sensor Slider */}
        {ldrs.map((ldr) => {
          const light =
            ldr.attributes?.lightLevel ?? ldr.properties?.lightLevel ?? 50;
          return (
            <div key={ldr.id} className="cockpit-control-card">
              <div className="card-label-row">
                <Sun className="w-3.5 h-3.5 text-yellow-400" />
                <span className="control-label">{ldr.name || 'Quang trở LDR'}</span>
                <span className="control-val">{light}% ☀️</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={light}
                onChange={(e) =>
                  onUpdateComponentProps(ldr.id, {
                    lightLevel: parseInt(e.target.value, 10),
                  })
                }
                className="cockpit-slider ldr-slider"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>0% (Tối mịt)</span>
                <span>50% (Phòng)</span>
                <span>100% (Rực rỡ)</span>
              </div>
            </div>
          );
        })}

        {/* 6. Servo Motor SG90 Status */}
        {servos.map((servo) => {
          const angle =
            simulationState.servoAngle ??
            servo.attributes?.angle ??
            servo.properties?.angle ??
            90;
          return (
            <div key={servo.id} className="cockpit-control-card">
              <div className="card-label-row">
                <Disc className="w-3.5 h-3.5 text-orange-400" />
                <span className="control-label">{servo.name || 'Servo SG90'}</span>
                <span className="control-val text-orange-400">{Math.round(angle)}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="180"
                value={Math.round(angle)}
                onChange={(e) =>
                  onUpdateComponentProps(servo.id, {
                    angle: parseInt(e.target.value, 10),
                  })
                }
                className="cockpit-slider servo-slider"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>0°</span>
                <span>90°</span>
                <span>180°</span>
              </div>
            </div>
          );
        })}

        {/* 7. Output LED Monitors */}
        {leds.length > 0 && (
          <div className="cockpit-control-card">
            <div className="card-label-row">
              <Zap className="w-3.5 h-3.5 text-yellow-300" />
              <span className="control-label">Trạng thái LED</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              {leds.map((led) => {
                const isLit =
                  simulationState.activeLeds[led.id] ||
                  simulationState.activeLeds[led.instanceId || ''];
                const color = led.attributes?.color || led.properties?.color || 'red';
                return (
                  <div
                    key={led.id}
                    className={`led-status-pill ${isLit ? 'lit' : 'off'} ${color}`}
                    title={`${led.name}: ${isLit ? 'ĐANG SÁNG' : 'ĐANG TẮT'}`}
                  >
                    <span className="status-dot" />
                    <span>{led.name || 'LED'}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
