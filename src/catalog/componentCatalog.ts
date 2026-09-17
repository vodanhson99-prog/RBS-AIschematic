import type { CircuitComponent, ComponentBlueprint, Pin, PinType } from '../types/circuit';

const createPin = (
  id: string,
  label: string,
  type: PinType,
  x: number,
  y: number,
  description?: string,
  voltageRating?: number
): Pin => ({
  id,
  label,
  name: label,
  type,
  position: { x, y },
  x,
  y,
  description,
  voltageRating,
});

export const COMPONENT_CATALOG: Record<string, ComponentBlueprint> = {
  arduino_uno: {
    modelId: 'arduino_uno',
    name: 'Arduino Uno R3',
    category: 'controller',
    description: 'Vi điều khiển ATmega328P với 14 chân Digital (6 chân PWM) và 6 chân Analog',
    dimensions: { width: 320, height: 240 },
    pins: [
      createPin('d0', '0 (RX)', 'DIGITAL', 288, 16, 'Digital Pin 0 (RX)'),
      createPin('d1', '1 (TX)', 'DIGITAL', 274, 16, 'Digital Pin 1 (TX)'),
      createPin('d2', '2', 'DIGITAL', 260, 16, 'Digital Pin 2'),
      createPin('d3', '~3', 'PWM', 246, 16, 'Digital Pin 3 (PWM)'),
      createPin('d4', '4', 'DIGITAL', 232, 16, 'Digital Pin 4'),
      createPin('d5', '~5', 'PWM', 218, 16, 'Digital Pin 5 (PWM)'),
      createPin('d6', '~6', 'PWM', 204, 16, 'Digital Pin 6 (PWM)'),
      createPin('d7', '7', 'DIGITAL', 190, 16, 'Digital Pin 7'),
      createPin('d8', '8', 'DIGITAL', 168, 16, 'Digital Pin 8'),
      createPin('d9', '~9', 'PWM', 154, 16, 'Digital Pin 9 (PWM)'),
      createPin('d10', '~10', 'PWM', 140, 16, 'Digital Pin 10 (PWM)'),
      createPin('d11', '~11', 'PWM', 126, 16, 'Digital Pin 11 (PWM)'),
      createPin('d12', '12', 'DIGITAL', 112, 16, 'Digital Pin 12'),
      createPin('d13', '13', 'DIGITAL', 98, 16, 'Digital Pin 13 (Built-in LED)'),
      createPin('gnd_top', 'GND', 'GND', 84, 16, 'Ground'),
      createPin('aref', 'AREF', 'PASSIVE', 70, 16, 'Analog Reference'),

      createPin('rst', 'RST', 'PASSIVE', 80, 224, 'Reset'),
      createPin('3v3', '3.3V', 'VCC', 94, 224, '3.3V Power Out', 3.3),
      createPin('5v', '5V', 'VCC', 108, 224, '5V Power Out', 5.0),
      createPin('gnd_bot1', 'GND', 'GND', 122, 224, 'Ground 1'),
      createPin('gnd_bot2', 'GND', 'GND', 136, 224, 'Ground 2'),
      createPin('vin', 'VIN', 'VCC', 150, 224, 'Voltage In'),

      createPin('a0', 'A0', 'ANALOG', 180, 224, 'Analog Input 0'),
      createPin('a1', 'A1', 'ANALOG', 194, 224, 'Analog Input 1'),
      createPin('a2', 'A2', 'ANALOG', 208, 224, 'Analog Input 2'),
      createPin('a3', 'A3', 'ANALOG', 222, 224, 'Analog Input 3'),
      createPin('a4', 'A4', 'I2C_SDA', 236, 224, 'Analog Input 4 (SDA)'),
      createPin('a5', 'A5', 'I2C_SCL', 250, 224, 'Analog Input 5 (SCL)'),
    ],
  },

  breadboard_mini: {
    modelId: 'breadboard_mini',
    name: 'Breadboard Mini',
    category: 'board',
    description: 'Bo mạch cắm thử nghiệm 400 lỗ với thanh ray nguồn kép',
    dimensions: { width: 460, height: 220 },
    pins: (() => {
      const pins: Pin[] = [];
      for (let i = 0; i < 15; i++) {
        const px = 30 + i * 28;
        pins.push(createPin(`top_plus_${i}`, '+', 'VCC', px, 20, `Ray (+) trên cột ${i + 1}`, 5.0));
        pins.push(createPin(`top_minus_${i}`, '-', 'GND', px, 38, `Ray (-) trên cột ${i + 1}`));
      }
      for (let col = 1; col <= 15; col++) {
        const px = 30 + (col - 1) * 28;
        pins.push(createPin(`col_${col}_top`, `${col}A`, 'PASSIVE', px, 80, `Lỗ cắm ${col} hàng A-E`));
        pins.push(createPin(`col_${col}_bot`, `${col}J`, 'PASSIVE', px, 140, `Lỗ cắm ${col} hàng F-J`));
      }
      for (let i = 0; i < 15; i++) {
        const px = 30 + i * 28;
        pins.push(createPin(`bot_plus_${i}`, '+', 'VCC', px, 182, `Ray (+) dưới cột ${i + 1}`, 5.0));
        pins.push(createPin(`bot_minus_${i}`, '-', 'GND', px, 200, `Ray (-) dưới cột ${i + 1}`));
      }
      return pins;
    })(),
  },

  led_red: {
    modelId: 'led_red',
    name: 'Đèn LED Đỏ',
    category: 'output',
    description: 'Đèn phát quang 5mm màu đỏ, phân cực Anode (+) và Cathode (-)',
    dimensions: { width: 40, height: 75 },
    defaultAttributes: { color: 'red', forwardVoltage: 2.0 },
    pins: [
      createPin('anode', 'A (+)', 'PASSIVE', 16, 65, 'Cực Anode (+) nối điện áp dương'),
      createPin('cathode', 'K (-)', 'GND', 32, 65, 'Cực Cathode (-) nối về đất GND'),
    ],
  },

  led_green: {
    modelId: 'led_green',
    name: 'Đèn LED Xanh',
    category: 'output',
    description: 'Đèn phát quang 5mm màu xanh lá cây',
    dimensions: { width: 40, height: 75 },
    defaultAttributes: { color: 'green', forwardVoltage: 2.2 },
    pins: [
      createPin('anode', 'A (+)', 'PASSIVE', 16, 65, 'Cực Anode (+)'),
      createPin('cathode', 'K (-)', 'GND', 32, 65, 'Cực Cathode (-)'),
    ],
  },

  resistor_220: {
    modelId: 'resistor_220',
    name: 'Điện trở 220Ω',
    category: 'passive',
    description: 'Điện trở gốm 220 Ohm (Đỏ-Đỏ-Nâu-Vàng kim) hạn dòng cho LED',
    dimensions: { width: 100, height: 40 },
    defaultAttributes: { resistance: 220, unit: 'ohm' },
    pins: [
      createPin('pin1', 'T1', 'PASSIVE', 10, 20, 'Đầu nối 1'),
      createPin('pin2', 'T2', 'PASSIVE', 90, 20, 'Đầu nối 2'),
    ],
  },

  pushbutton: {
    modelId: 'pushbutton',
    name: 'Nút nhấn 4 chân',
    category: 'input',
    description: 'Nút bấm tactile nhấn nhả 6x6mm',
    dimensions: { width: 60, height: 65 },
    defaultAttributes: { isPressed: false },
    pins: [
      createPin('term1a', '1A', 'PASSIVE', 12, 15, 'Cực 1A'),
      createPin('term1b', '1B', 'PASSIVE', 48, 15, 'Cực 1B'),
      createPin('term2a', '2A', 'PASSIVE', 12, 55, 'Cực 2A'),
      createPin('term2b', '2B', 'PASSIVE', 48, 55, 'Cực 2B'),
    ],
  },

  arduino_mega: {
    modelId: 'arduino_mega',
    name: 'Arduino Mega 2560 R3',
    category: 'controller',
    description: 'Vi điều khiển ATmega2560 với 54 chân Digital và 16 chân Analog',
    dimensions: { width: 480, height: 250 },
    pins: [
      createPin('5v', '5V', 'VCC', 128, 224, '5V Main Supply', 5.0),
      createPin('3v3', '3.3V', 'VCC', 114, 224, '3.3V Supply', 3.3),
      createPin('gnd_top', 'GND', 'GND', 84, 16, 'Ground'),
      createPin('gnd_bot1', 'GND 1', 'GND', 142, 224, 'Ground 1'),
      createPin('gnd_bot2', 'GND 2', 'GND', 156, 224, 'Ground 2'),
      createPin('d20', '20 (SDA)', 'I2C_SDA', 18, 16, 'I2C SDA'),
      createPin('d21', '21 (SCL)', 'I2C_SCL', 32, 16, 'I2C SCL'),
      createPin('d7', '7', 'DIGITAL', 190, 16, 'Digital 7'),
      createPin('d13', '13', 'DIGITAL', 98, 16, 'Digital 13'),
    ],
  },

  esp32: {
    modelId: 'esp32',
    name: 'ESP32 DevKit V1',
    category: 'controller',
    description: 'SoC 32-bit Wi-Fi & Bluetooth Dual Core 30 chân',
    dimensions: { width: 220, height: 280 },
    pins: [
      createPin('3v3', '3V3', 'VCC', 19, 35, '3.3V Power Out', 3.3),
      createPin('gnd_l', 'GND', 'GND', 19, 243, 'Ground Left'),
      createPin('gnd_r', 'GND', 'GND', 201, 243, 'Ground Right'),
      createPin('vin', 'VIN', 'VCC', 201, 259, '5V Input'),
      createPin('d21', 'D21 (SDA)', 'I2C_SDA', 201, 99, 'I2C SDA'),
      createPin('d22', 'D22 (SCL)', 'I2C_SCL', 201, 51, 'I2C SCL'),
      createPin('d4', 'D4', 'DIGITAL', 201, 195, 'GPIO4'),
      createPin('d2', 'D2', 'DIGITAL', 201, 211, 'GPIO2'),
    ],
  },

  arduino_nano: {
    modelId: 'arduino_nano',
    name: 'Arduino Nano V3',
    category: 'controller',
    description: 'Bo mạch nhỏ gọn ATmega328P cắm breadboard',
    dimensions: { width: 150, height: 280 },
    pins: [
      createPin('5v', '5V', 'VCC', 134, 211, '5V Power', 5.0),
      createPin('gnd_l', 'GND', 'GND', 16, 83, 'Ground Left'),
      createPin('gnd_r', 'GND', 'GND', 134, 243, 'Ground Right'),
      createPin('d2', 'D2', 'DIGITAL', 16, 99, 'Digital Pin 2'),
      createPin('d13', 'D13', 'DIGITAL', 134, 35, 'Digital Pin 13'),
    ],
  },

  lcd_1602_i2c: {
    modelId: 'lcd_1602_i2c',
    name: 'Màn hình LCD 1602 I2C',
    category: 'output',
    description: 'Màn hình LCD 16x2 ký tự chuẩn giao tiếp I2C 4 chân',
    dimensions: { width: 230, height: 130 },
    pins: [
      createPin('gnd', 'GND', 'GND', 78, 115, 'Ground'),
      createPin('vcc', 'VCC', 'VCC', 104, 115, '5V Power', 5.0),
      createPin('sda', 'SDA', 'I2C_SDA', 130, 115, 'I2C SDA'),
      createPin('scl', 'SCL', 'I2C_SCL', 156, 115, 'I2C SCL'),
    ],
  },

  oled_i2c: {
    modelId: 'oled_i2c',
    name: 'Màn hình OLED 0.96" I2C SSD1306',
    category: 'output',
    description: 'Màn hình OLED 128x64 pixels giao tiếp I2C',
    dimensions: { width: 120, height: 120 },
    pins: [
      createPin('gnd', 'GND', 'GND', 35, 13, 'Ground'),
      createPin('vcc', 'VCC', 'VCC', 52, 13, 'Power 3.3V-5V', 3.3),
      createPin('scl', 'SCL', 'I2C_SCL', 69, 13, 'I2C SCL'),
      createPin('sda', 'SDA', 'I2C_SDA', 86, 13, 'I2C SDA'),
    ],
  },

  relay_module: {
    modelId: 'relay_module',
    name: 'Module Rơ-le 5V 1 Kênh',
    category: 'output',
    description: 'Rơ-le cách ly quang đóng ngắt dòng điện tải lớn',
    dimensions: { width: 160, height: 105 },
    pins: [
      createPin('vcc', 'VCC', 'VCC', 145, 35, '5V Power', 5.0),
      createPin('gnd', 'GND', 'GND', 145, 55, 'Ground'),
      createPin('in', 'IN', 'DIGITAL', 145, 75, 'Control Signal'),
      createPin('no', 'NO', 'PASSIVE', 15, 30, 'Normally Open'),
      createPin('com', 'COM', 'PASSIVE', 15, 50, 'Common'),
      createPin('nc', 'NC', 'PASSIVE', 15, 70, 'Normally Closed'),
    ],
  },

  dht11: {
    modelId: 'dht11',
    name: 'Cảm biến DHT11',
    category: 'sensor',
    description: 'Cảm biến đo nhiệt độ và độ ẩm kỹ thuật số 1-Wire',
    dimensions: { width: 90, height: 110 },
    pins: [
      createPin('vcc', 'VCC', 'VCC', 20, 95, 'Power 3.3V-5V', 5.0),
      createPin('data', 'DATA', 'DIGITAL', 36, 95, '1-Wire Data'),
      createPin('nc', 'NC', 'PASSIVE', 54, 95, 'No Connection'),
      createPin('gnd', 'GND', 'GND', 70, 95, 'Ground'),
    ],
  },

  led_rgb: {
    modelId: 'led_rgb',
    name: 'Đèn LED RGB 4 Chân',
    category: 'output',
    description: 'Đèn LED phát quang 3 màu Red-Green-Blue Cathode chung',
    dimensions: { width: 70, height: 95 },
    pins: [
      createPin('red', 'R', 'PWM', 16, 78, 'Red Anode'),
      createPin('cathode', 'GND', 'GND', 28, 78, 'Common Cathode'),
      createPin('green', 'G', 'PWM', 42, 78, 'Green Anode'),
      createPin('blue', 'B', 'PWM', 54, 78, 'Blue Anode'),
    ],
  },

  joystick: {
    modelId: 'joystick',
    name: 'Module Joystick 2 Trục',
    category: 'input',
    description: 'Cần gạt điều hướng 2 trục Analog và 1 công tắc nút bấm',
    dimensions: { width: 120, height: 120 },
    pins: [
      createPin('gnd', 'GND', 'GND', 26, 105, 'Ground'),
      createPin('vcc', '+5V', 'VCC', 43, 105, '5V Power', 5.0),
      createPin('vrx', 'VRX', 'ANALOG', 60, 105, 'Analog X-axis'),
      createPin('vry', 'VRY', 'ANALOG', 77, 105, 'Analog Y-axis'),
      createPin('sw', 'SW', 'DIGITAL', 94, 105, 'Push Button Switch'),
    ],
  },
};

let instanceCounter = 1;

export function instantiateComponent(modelId: string, x: number, y: number): CircuitComponent {
  const blueprint = COMPONENT_CATALOG[modelId];
  if (!blueprint) {
    throw new Error(`Model not found in catalog: ${modelId}`);
  }

  const instanceId = `${modelId}_${Date.now().toString(36)}_${instanceCounter++}`;

  return {
    instanceId,
    id: instanceId,
    modelId: blueprint.modelId,
    type: blueprint.modelId,
    name: blueprint.name,
    x,
    y,
    rotation: 0,
    pins: blueprint.pins.map((p) => ({ ...p, id: p.id })),
    attributes: { ...blueprint.defaultAttributes },
    properties: { ...blueprint.defaultAttributes },
  };
}
