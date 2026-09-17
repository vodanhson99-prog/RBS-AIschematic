import React from 'react';
import { Play, Square, RotateCcw, Cpu, Palette } from 'lucide-react';

interface Props {
  isSimulating: boolean;
  onToggleSimulation: () => void;
  onResetCanvas: () => void;
  selectedColor: string;
  onSelectColor: (color: string) => void;
  projectTitle: string;
}

export const TopHeader: React.FC<Props> = ({
  isSimulating,
  onToggleSimulation,
  onResetCanvas,
  selectedColor,
  onSelectColor,
  projectTitle,
}) => {
  const colors = [
    { name: 'Đỏ (5V/Power)', hex: '#ef4444' },
    { name: 'Đen (GND)', hex: '#111827' },
    { name: 'Xanh dương', hex: '#3b82f6' },
    { name: 'Vàng', hex: '#eab308' },
    { name: 'Xanh lá', hex: '#22c55e' },
    { name: 'Cam (PWM)', hex: '#f97316' },
    { name: 'Tím', hex: '#a855f7' },
    { name: 'Trắng', hex: '#f8fafc' },
  ];

  return (
    <header className="top-header glass-panel">
      {/* Left: Brand logo & title */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="brand-logo-icon">
          <Cpu className="w-5 h-5 text-cyan-400 shrink-0" />
        </div>
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-2">
            <h1 className="text-base font-extrabold tracking-tight text-slate-100">
              AI Circuit Studio
            </h1>
            <span className="brand-version-badge">TinkerCAD + AI</span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium truncate max-w-[240px]" title={projectTitle}>
            {projectTitle || 'Dự án mạch Arduino mới'}
          </span>
        </div>
      </div>

      {/* Center: Wire Color Selector */}
      <div className="header-color-picker shrink-0">
        <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
          <Palette className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>Màu dây:</span>
        </span>
        <div className="flex items-center gap-1">
          {colors.map((c) => (
            <button
              key={c.hex}
              onClick={() => onSelectColor(c.hex)}
              title={c.name}
              className={`color-select-btn ${selectedColor === c.hex ? 'active' : ''}`}
              style={{ backgroundColor: c.hex }}
            />
          ))}
        </div>
      </div>

      {/* Right: Simulation & Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onResetCanvas}
          title="Xoá toàn bộ canvas làm lại từ đầu"
          className="btn-header-secondary"
        >
          <RotateCcw className="w-3.5 h-3.5 mr-1.5 shrink-0" />
          <span>Làm mới</span>
        </button>

        <button
          onClick={onToggleSimulation}
          className={`btn-header-sim ${isSimulating ? 'simulating' : ''}`}
        >
          {isSimulating ? (
            <>
              <Square className="w-3.5 h-3.5 mr-1.5 fill-current shrink-0" />
              <span>Dừng mô phỏng</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 mr-1.5 fill-current shrink-0" />
              <span>Bắt đầu mô phỏng</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
