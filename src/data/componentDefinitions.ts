import type { CircuitComponent, ComponentType, Pin } from '../types/circuit';

export const PIN_RADIUS = 6;

function buildComponent(
  id: string,
  type: string,
  name: string,
  x: number,
  y: number,
  pins: Pin[],
  properties: Record<string, any> = {}
): CircuitComponent {
  const normalizedPins: Pin[] = pins.map((p) => ({
    ...p,
    position: p.position || { x: p.x, y: p.y },
    x: p.x,
    y: p.y,
    name: p.name || p.label,
    label: p.label || p.name || '',
  }));

  return {
    id,
    instanceId: id,
    type,
    modelId: type,
    name,
    x,
    y,
    rotation: 0,
    properties,
    attributes: properties,
    pins: normalizedPins,
  };
}

export function createComponentInstance(
  type: ComponentType,
  x: number,
  y: number,
  customId?: string,
  customProps?: Record<string, any>
): CircuitComponent {
  const id = customId || `${type}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

  switch (type) {
    case 'arduino_uno': {
      const pins: Pin[] = [
        // Digital Header (Top right, from right to left)
        { id: 'd0', name: '0 (RX)', label: 'RX/0', type: 'digital', x: 288, y: 16, description: 'Digital Pin 0 / Serial RX' },
        { id: 'd1', name: '1 (TX)', label: 'TX/1', type: 'digital', x: 274, y: 16, description: 'Digital Pin 1 / Serial TX' },
        { id: 'd2', name: '2', label: '2', type: 'digital', x: 260, y: 16, description: 'Digital Pin 2 (Interrupt)' },
        { id: 'd3', name: '~3', label: '~3', type: 'pwm', x: 246, y: 16, description: 'Digital Pin 3 (PWM)' },
        { id: 'd4', name: '4', label: '4', type: 'digital', x: 232, y: 16, description: 'Digital Pin 4' },
        { id: 'd5', name: '~5', label: '~5', type: 'pwm', x: 218, y: 16, description: 'Digital Pin 5 (PWM)' },
        { id: 'd6', name: '~6', label: '~6', type: 'pwm', x: 204, y: 16, description: 'Digital Pin 6 (PWM)' },
        { id: 'd7', name: '7', label: '7', type: 'digital', x: 190, y: 16, description: 'Digital Pin 7' },
        { id: 'd8', name: '8', label: '8', type: 'digital', x: 168, y: 16, description: 'Digital Pin 8' },
        { id: 'd9', name: '~9', label: '~9', type: 'pwm', x: 154, y: 16, description: 'Digital Pin 9 (PWM)' },
        { id: 'd10', name: '~10', label: '~10', type: 'pwm', x: 140, y: 16, description: 'Digital Pin 10 (PWM / SS)' },
        { id: 'd11', name: '~11', label: '~11', type: 'pwm', x: 126, y: 16, description: 'Digital Pin 11 (PWM / MOSI)' },
        { id: 'd12', name: '12', label: '12', type: 'digital', x: 112, y: 16, description: 'Digital Pin 12 (MISO)' },
        { id: 'd13', name: '13', label: '13', type: 'digital', x: 98, y: 16, description: 'Digital Pin 13 (SCK / Onboard LED)' },
        { id: 'gnd_top', name: 'GND', label: 'GND', type: 'gnd', x: 84, y: 16, description: 'Ground' },
        { id: 'aref', name: 'AREF', label: 'AREF', type: 'passive', x: 70, y: 16, description: 'Analog Reference' },

        // Power & Analog Header (Bottom)
        { id: 'rst', name: 'RESET', label: 'RST', type: 'passive', x: 80, y: 224, description: 'Reset Pin' },
        { id: '3v3', name: '3.3V', label: '3.3V', type: 'power', x: 94, y: 224, description: '3.3V Output' },
        { id: '5v', name: '5V', label: '5V', type: 'power', x: 108, y: 224, description: '5V Output (Main Supply)' },
        { id: 'gnd_bot1', name: 'GND 1', label: 'GND', type: 'gnd', x: 122, y: 224, description: 'Ground 1' },
        { id: 'gnd_bot2', name: 'GND 2', label: 'GND', type: 'gnd', x: 136, y: 224, description: 'Ground 2' },
        { id: 'vin', name: 'VIN', label: 'VIN', type: 'power', x: 150, y: 224, description: 'Voltage Input' },

        { id: 'a0', name: 'A0', label: 'A0', type: 'analog', x: 180, y: 224, description: 'Analog Input 0' },
        { id: 'a1', name: 'A1', label: 'A1', type: 'analog', x: 194, y: 224, description: 'Analog Input 1' },
        { id: 'a2', name: 'A2', label: 'A2', type: 'analog', x: 208, y: 224, description: 'Analog Input 2' },
        { id: 'a3', name: 'A3', label: 'A3', type: 'analog', x: 222, y: 224, description: 'Analog Input 3' },
        { id: 'a4', name: 'A4', label: 'A4', type: 'analog', x: 236, y: 224, description: 'Analog Input 4 (SDA)' },
        { id: 'a5', name: 'A5', label: 'A5', type: 'analog', x: 250, y: 224, description: 'Analog Input 5 (SCL)' },
      ];
      return buildComponent(id, type, 'Arduino Uno R3', x, y, pins, {});
    }

    case 'breadboard': {
      const pins: Pin[] = [];
      // Rails: Top + and - (10 distribution nodes across 30 columns for clean clicking)
      for (let i = 0; i < 15; i++) {
        const px = 30 + i * 28;
        pins.push({
          id: `top_plus_${i}`,
          name: `Top Rail (+) ${i + 1}`,
          label: '+',
          type: 'power',
          x: px,
          y: 20,
          description: 'Đường nguồn dương trên (+5V)',
        });
        pins.push({
          id: `top_minus_${i}`,
          name: `Top Rail (-) ${i + 1}`,
          label: '-',
          type: 'gnd',
          x: px,
          y: 38,
          description: 'Đường nối đất trên (GND)',
        });
      }

      // Middle Rows: Row 1 to 15, column pairs
      for (let col = 1; col <= 15; col++) {
        const px = 30 + (col - 1) * 28;
        // Upper section (row A/B)
        pins.push({
          id: `col_${col}_top`,
          name: `Hàng ${col}A`,
          label: `${col}A`,
          type: 'passive',
          x: px,
          y: 80,
          description: `Lỗ cắm cột ${col} (nhóm A-E)`,
        });
        // Lower section (row F/J)
        pins.push({
          id: `col_${col}_bot`,
          name: `Hàng ${col}J`,
          label: `${col}J`,
          type: 'passive',
          x: px,
          y: 140,
          description: `Lỗ cắm cột ${col} (nhóm F-J)`,
        });
      }

      // Rails: Bottom + and -
      for (let i = 0; i < 15; i++) {
        const px = 30 + i * 28;
        pins.push({
          id: `bot_plus_${i}`,
          name: `Bottom Rail (+) ${i + 1}`,
          label: '+',
          type: 'power',
          x: px,
          y: 182,
          description: 'Đường nguồn dương dưới (+5V)',
        });
        pins.push({
          id: `bot_minus_${i}`,
          name: `Bottom Rail (-) ${i + 1}`,
          label: '-',
          type: 'gnd',
          x: px,
          y: 200,
          description: 'Đường nối đất dưới (GND)',
        });
      }

      return buildComponent(id, type, 'Breadboard Mini', x, y, pins, {});
    }

    case 'led': {
      const color = customProps?.color || 'red';
      const pins: Pin[] = [
        {
          id: 'anode',
          name: 'Anode (+)',
          label: 'A (+)',
          type: 'passive',
          x: 16,
          y: 65,
          description: 'Chân Dương Anode (Chân dài, nối điện trở/nguồn dương)',
        },
        {
          id: 'cathode',
          name: 'Cathode (-)',
          label: 'K (-)',
          type: 'passive',
          x: 32,
          y: 65,
          description: 'Chân Âm Cathode (Chân ngắn có vát cạnh, nối về GND)',
        },
      ];
      return buildComponent(id, type, `Đèn LED (${color.toUpperCase()})`, x, y, pins, { color, ...customProps });
    }

    case 'resistor': {
      const resistance = customProps?.resistance || 220;
      const pins: Pin[] = [
        {
          id: 'pin1',
          name: 'Chân 1 (Terminal 1)',
          label: 'T1',
          type: 'passive',
          x: 10,
          y: 20,
          description: 'Đầu nối 1 của điện trở',
        },
        {
          id: 'pin2',
          name: 'Chân 2 (Terminal 2)',
          label: 'T2',
          type: 'passive',
          x: 90,
          y: 20,
          description: 'Đầu nối 2 của điện trở',
        },
      ];
      return buildComponent(id, type, `Điện trở ${resistance}Ω`, x, y, pins, { resistance, ...customProps });
    }

    case 'pushbutton': {
      const pins: Pin[] = [
        { id: 'term1a', name: 'Chân 1A', label: '1A', type: 'passive', x: 12, y: 15, description: 'Cực 1A (nối sẵn với 1B)' },
        { id: 'term1b', name: 'Chân 1B', label: '1B', type: 'passive', x: 48, y: 15, description: 'Cực 1B (nối sẵn với 1A)' },
        { id: 'term2a', name: 'Chân 2A', label: '2A', type: 'passive', x: 12, y: 55, description: 'Cực 2A (nối sẵn với 2B, đóng mạch khi bấm)' },
        { id: 'term2b', name: 'Chân 2B', label: '2B', type: 'passive', x: 48, y: 55, description: 'Cực 2B (nối sẵn với 2A, đóng mạch khi bấm)' },
      ];
      return buildComponent(id, type, 'Nút nhấn (Pushbutton)', x, y, pins, { isPressed: false, ...customProps });
    }

    case 'potentiometer': {
      const pins: Pin[] = [
        { id: 'vcc', name: 'Chân 1 (VCC)', label: 'VCC', type: 'power', x: 15, y: 70, description: 'Cấp nguồn 5V' },
        { id: 'wiper', name: 'Chân 2 (Wiper/Tín hiệu)', label: 'SIG', type: 'analog', x: 35, y: 70, description: 'Điện áp ra biến thiên (nối vào chân Analog A0-A5)' },
        { id: 'gnd', name: 'Chân 3 (GND)', label: 'GND', type: 'gnd', x: 55, y: 70, description: 'Nối đất GND' },
      ];
      return buildComponent(id, type, 'Biến trở (Potentiometer)', x, y, pins, { potValue: 512, ...customProps });
    }

    case 'ultrasonic': {
      const pins: Pin[] = [
        { id: 'vcc', name: 'VCC', label: 'VCC', type: 'power', x: 25, y: 75, description: 'Nguồn cấp 5V' },
        { id: 'trig', name: 'Trig', label: 'TRIG', type: 'digital', x: 45, y: 75, description: 'Chân phát xung sóng siêu âm' },
        { id: 'echo', name: 'Echo', label: 'ECHO', type: 'digital', x: 65, y: 75, description: 'Chân nhận tín hiệu phản xạ' },
        { id: 'gnd', name: 'GND', label: 'GND', type: 'gnd', x: 85, y: 75, description: 'Nối đất GND' },
      ];
      return buildComponent(id, type, 'Cảm biến siêu âm HC-SR04', x, y, pins, { distance: 50, ...customProps });
    }

    case 'buzzer': {
      const pins: Pin[] = [
        { id: 'pos', name: 'Dương (+)', label: '+', type: 'passive', x: 25, y: 70, description: 'Chân dương (+) còi chip' },
        { id: 'neg', name: 'Âm (-)', label: '-', type: 'gnd', x: 50, y: 70, description: 'Chân âm (-) còi chip nối về GND' },
      ];
      return buildComponent(id, type, 'Còi chíp (Piezo Buzzer)', x, y, pins, { active: false, ...customProps });
    }

    case 'servo': {
      const pins: Pin[] = [
        { id: 'gnd', name: 'GND (Nâu)', label: 'GND', type: 'gnd', x: 30, y: 75, description: 'Dây Nâu - Nối đất GND' },
        { id: 'vcc', name: 'VCC (Đỏ)', label: '5V', type: 'power', x: 50, y: 75, description: 'Dây Đỏ - Nguồn 5V' },
        { id: 'sig', name: 'Signal (Cam/Vàng)', label: 'PWM', type: 'pwm', x: 70, y: 75, description: 'Dây Cam - Tín hiệu PWM điều khiển góc quay' },
      ];
      return buildComponent(id, type, 'Động cơ Servo SG90', x, y, pins, { angle: 90, ...customProps });
    }

    case 'pir': {
      const pins: Pin[] = [
        { id: 'vcc', name: 'VCC', label: 'VCC', type: 'power', x: 25, y: 80, description: 'Nguồn 5V' },
        { id: 'out', name: 'OUT', label: 'OUT', type: 'digital', x: 45, y: 80, description: 'Tín hiệu phát hiện chuyển động (HIGH khi có người)' },
        { id: 'gnd', name: 'GND', label: 'GND', type: 'gnd', x: 65, y: 80, description: 'Nối đất GND' },
      ];
      return buildComponent(id, type, 'Cảm biến chuyển động PIR', x, y, pins, { motionDetected: false, ...customProps });
    }

    case 'ldr': {
      const pins: Pin[] = [
        { id: 'pin1', name: 'Chân 1 (T1)', label: 'T1', type: 'passive', x: 16, y: 65, description: 'Đầu cực 1 của quang trở (nối nguồn 5V)' },
        { id: 'pin2', name: 'Chân 2 (T2)', label: 'T2', type: 'passive', x: 34, y: 65, description: 'Đầu cực 2 của quang trở (tín hiệu ngõ ra / nối chân Analog)' },
      ];
      return buildComponent(id, type, 'Cảm biến quang trở (LDR)', x, y, pins, { lightLevel: 65, ...customProps });
    }

    default:
      throw new Error(`Unknown component type: ${type}`);
  }
}

