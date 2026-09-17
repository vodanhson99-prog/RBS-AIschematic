import React from 'react';
import type { ComponentType } from '../../types/circuit';
import { Cpu, Grid, Lightbulb, Activity, Radio, Volume2, Disc, Eye } from 'lucide-react';

interface Props {
  onAddComponent: (type: ComponentType, customProps?: Record<string, any>) => void;
}

export const ComponentLibrary: React.FC<Props> = ({ onAddComponent }) => {
  const items = [
    { type: 'arduino_uno' as ComponentType, name: 'Arduino Uno R3', icon: Cpu, color: 'text-sky-400' },
    { type: 'breadboard' as ComponentType, name: 'Breadboard', icon: Grid, color: 'text-slate-300' },
    {
      type: 'led' as ComponentType,
      name: 'Đèn LED Đỏ',
      icon: Lightbulb,
      color: 'text-rose-400',
      props: { color: 'red' },
    },
    {
      type: 'led' as ComponentType,
      name: 'Đèn LED Vàng',
      icon: Lightbulb,
      color: 'text-amber-400',
      props: { color: 'yellow' },
    },
    {
      type: 'led' as ComponentType,
      name: 'Đèn LED Xanh',
      icon: Lightbulb,
      color: 'text-emerald-400',
      props: { color: 'green' },
    },
    {
      type: 'resistor' as ComponentType,
      name: 'Điện trở 220Ω',
      icon: Activity,
      color: 'text-cyan-400',
      props: { resistance: 220 },
    },
    {
      type: 'resistor' as ComponentType,
      name: 'Điện trở 10kΩ',
      icon: Activity,
      color: 'text-indigo-400',
      props: { resistance: 10000 },
    },
    { type: 'pushbutton' as ComponentType, name: 'Nút bấm', icon: Disc, color: 'text-slate-200' },
    { type: 'potentiometer' as ComponentType, name: 'Biến trở', icon: Disc, color: 'text-blue-400' },
    { type: 'ultrasonic' as ComponentType, name: 'Siêu âm HC-SR04', icon: Radio, color: 'text-teal-400' },
    { type: 'buzzer' as ComponentType, name: 'Còi Buzzer', icon: Volume2, color: 'text-amber-300' },
    { type: 'servo' as ComponentType, name: 'Servo SG90', icon: Disc, color: 'text-orange-400' },
    { type: 'pir' as ComponentType, name: 'Cảm biến PIR', icon: Eye, color: 'text-lime-400' },
  ];

  return (
    <div className="component-library-bar glass-panel">
      <div className="library-header">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Thư viện linh kiện
        </span>
      </div>
      <div className="library-items-scroll">
        {items.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={`${item.type}-${idx}`}
              onClick={() => onAddComponent(item.type, item.props)}
              className="comp-lib-btn"
              title={`Thêm ${item.name} vào Canvas`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${item.color}`} />
              <span className="comp-lib-label">{item.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
