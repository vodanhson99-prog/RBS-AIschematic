import type { CircuitComponent, PinSuggestion, Wire } from '../types/circuit';

export function analyzePinSuggestions(
  fromCompId: string,
  fromPinId: string,
  components: CircuitComponent[],
  _existingWires: Wire[]
): {
  suggestions: PinSuggestion[];
  recommendedColor: string;
  smartAdvice: string;
  warningAlert?: string;
} {
  const fromComp = components.find((c) => c.id === fromCompId);
  const fromPin = fromComp?.pins.find((p) => p.id === fromPinId);

  if (!fromComp || !fromPin) {
    return {
      suggestions: [],
      recommendedColor: '#3b82f6',
      smartAdvice: 'Nhấp vào một chân linh kiện để bắt đầu cắm dây...',
    };
  }

  const suggestions: PinSuggestion[] = [];
  let recommendedColor = '#3b82f6';
  let smartAdvice = '';
  let warningAlert: string | undefined;

  // 1. Handling POWER pins (5V, 3.3V, VCC)
  if (fromPin.type === 'power' || fromPin.id === '5v' || fromPin.id === '3v3' || fromPin.id === 'vcc') {
    recommendedColor = '#ef4444'; // Red
    smartAdvice = `Đang kéo từ chân nguồn ${fromPin.name}. Hãy nối đến các chân nhận nguồn VCC hoặc đường ray (+) trên Breadboard.`;

    components.forEach((comp) => {
      if (comp.id === fromCompId) return;

      if (comp.type === 'breadboard') {
        const plusPin = comp.pins.find((p) => p.id.includes('plus'));
        if (plusPin) {
          suggestions.push({
            targetCompId: comp.id,
            targetPinId: plusPin.id,
            targetCompName: comp.name,
            targetPinName: plusPin.name,
            reason: 'Cấp nguồn dương chung (+5V) cho toàn bộ bo mạch cắm Breadboard',
            safe: true,
            recommendedColor: '#ef4444',
            voltageNote: '5V DC',
          });
        }
      }

      if (comp.type === 'ultrasonic' || comp.type === 'pir' || comp.type === 'servo' || comp.type === 'potentiometer') {
        const vccPin = comp.pins.find((p) => p.id === 'vcc');
        if (vccPin) {
          suggestions.push({
            targetCompId: comp.id,
            targetPinId: vccPin.id,
            targetCompName: comp.name,
            targetPinName: vccPin.name,
            reason: `Cấp nguồn nuôi 5V cho ${comp.name}`,
            safe: true,
            recommendedColor: '#ef4444',
            voltageNote: '5V DC',
          });
        }
      }

      if (comp.type === 'pushbutton') {
        const t1 = comp.pins.find((p) => p.id === 'term1a');
        if (t1) {
          suggestions.push({
            targetCompId: comp.id,
            targetPinId: t1.id,
            targetCompName: comp.name,
            targetPinName: t1.name,
            reason: 'Cấp điện áp 5V vào một cực của nút nhấn',
            safe: true,
            recommendedColor: '#ef4444',
          });
        }
      }
    });

    warningAlert = 'Cảnh báo: Tuyệt đối không nối trực tiếp 5V vào chân GND (gây đoản mạch/cháy nguồn) hoặc cắm trực tiếp vào LED không có điện trở!';
  }

  // 2. Handling GROUND pins (GND, Cathode, Negative)
  else if (fromPin.type === 'gnd' || fromPin.id.includes('gnd') || fromPin.id === 'cathode' || fromPin.id === 'neg') {
    recommendedColor = '#111827'; // Black
    smartAdvice = `Đang kéo từ chân đất/âm ${fromPin.name}. Hãy nối về GND chung của Arduino hoặc ray (-) trên Breadboard.`;

    components.forEach((comp) => {
      if (comp.id === fromCompId) return;

      if (comp.type === 'arduino_uno') {
        const gndPins = comp.pins.filter((p) => p.type === 'gnd');
        gndPins.forEach((gp) => {
          suggestions.push({
            targetCompId: comp.id,
            targetPinId: gp.id,
            targetCompName: comp.name,
            targetPinName: gp.name,
            reason: 'Nối về điểm đất gốc (GND) của Arduino Uno',
            safe: true,
            recommendedColor: '#111827',
          });
        });
      }

      if (comp.type === 'breadboard') {
        const minusPin = comp.pins.find((p) => p.id.includes('minus'));
        if (minusPin) {
          suggestions.push({
            targetCompId: comp.id,
            targetPinId: minusPin.id,
            targetCompName: comp.name,
            targetPinName: minusPin.name,
            reason: 'Nối vào thanh ray cực âm (-) trên Breadboard',
            safe: true,
            recommendedColor: '#111827',
          });
        }
      }
    });
  }

  // 3. Handling LED Anode (+)
  else if (fromComp.type === 'led' && fromPin.id === 'anode') {
    recommendedColor = fromComp.properties.color === 'red' ? '#ef4444' : fromComp.properties.color === 'yellow' ? '#eab308' : '#22c55e';
    smartAdvice = 'Chân Anode (+) của LED rất nhạy cảm với quá dòng. Bạn NÊN nối qua một điện trở 220Ω trước khi cấp điện!';

    // Search for available resistors
    components.forEach((comp) => {
      if (comp.type === 'resistor') {
        const p1 = comp.pins[0];
        suggestions.push({
          targetCompId: comp.id,
          targetPinId: p1.id,
          targetCompName: comp.name,
          targetPinName: p1.name,
          reason: `Hạn dòng an toàn cho LED bằng điện trở ${comp.properties.resistance || 220}Ω`,
          safe: true,
          recommendedColor: recommendedColor,
        });
      }
    });
  }

  // 4. Handling Resistors
  else if (fromComp.type === 'resistor') {
    recommendedColor = '#06b6d4';
    smartAdvice = 'Điện trở không phân cực. Một đầu nối với chân điều khiển (D0-D13) hoặc nguồn, đầu kia nối với tải (LED/Sensor).';

    components.forEach((comp) => {
      if (comp.id === fromCompId) return;

      if (comp.type === 'led') {
        const anode = comp.pins.find((p) => p.id === 'anode');
        if (anode) {
          suggestions.push({
            targetCompId: comp.id,
            targetPinId: anode.id,
            targetCompName: comp.name,
            targetPinName: anode.name,
            reason: `Bảo vệ chân Anode của ${comp.name}`,
            safe: true,
            recommendedColor: comp.properties.color === 'red' ? '#ef4444' : '#22c55e',
          });
        }
      }

      if (comp.type === 'arduino_uno') {
        const digitalPins = comp.pins.filter((p) => p.type === 'digital' || p.type === 'pwm');
        // Prefer D13, D12, D11, D9
        const preferred = digitalPins.filter((p) => ['d13', 'd12', 'd11', 'd9', 'd8'].includes(p.id));
        preferred.forEach((dp) => {
          suggestions.push({
            targetCompId: comp.id,
            targetPinId: dp.id,
            targetCompName: comp.name,
            targetPinName: dp.name,
            reason: `Cấp xung tín hiệu điều khiển từ chân Digital ${dp.name}`,
            safe: true,
            recommendedColor: '#3b82f6',
          });
        });
      }
    });
  }

  // 5. Handling Arduino Digital & PWM pins
  else if (fromComp.type === 'arduino_uno' && (fromPin.type === 'digital' || fromPin.type === 'pwm')) {
    recommendedColor = fromPin.type === 'pwm' ? '#f59e0b' : '#3b82f6';
    smartAdvice = `Chân số ${fromPin.name} xuất tín hiệu logic 0V/5V${fromPin.type === 'pwm' ? ' (hỗ trợ điều chế xung PWM)' : ''}.`;

    components.forEach((comp) => {
      if (comp.type === 'resistor') {
        suggestions.push({
          targetCompId: comp.id,
          targetPinId: comp.pins[0].id,
          targetCompName: comp.name,
          targetPinName: comp.pins[0].name,
          reason: 'Khuyến nghị: Nối qua điện trở hạn dòng trước khi đưa vào đèn LED',
          safe: true,
          recommendedColor: '#3b82f6',
        });
      }

      if (comp.type === 'buzzer') {
        const pos = comp.pins.find((p) => p.id === 'pos');
        if (pos) {
          suggestions.push({
            targetCompId: comp.id,
            targetPinId: pos.id,
            targetCompName: comp.name,
            targetPinName: pos.name,
            reason: `Kích hoạt âm thanh còi chip từ chân ${fromPin.name}`,
            safe: true,
            recommendedColor: '#f59e0b',
          });
        }
      }

      if (comp.type === 'servo' && fromPin.type === 'pwm') {
        const sig = comp.pins.find((p) => p.id === 'sig');
        if (sig) {
          suggestions.push({
            targetCompId: comp.id,
            targetPinId: sig.id,
            targetCompName: comp.name,
            targetPinName: sig.name,
            reason: `Điều khiển góc quay Servo SG90 bằng xung PWM trên chân ${fromPin.name}`,
            safe: true,
            recommendedColor: '#f97316',
          });
        }
      }

      if (comp.type === 'ultrasonic') {
        const trig = comp.pins.find((p) => p.id === 'trig');
        const echo = comp.pins.find((p) => p.id === 'echo');
        if (trig) {
          suggestions.push({
            targetCompId: comp.id,
            targetPinId: trig.id,
            targetCompName: comp.name,
            targetPinName: trig.name,
            reason: 'Nối chân phát xung siêu âm Trig',
            safe: true,
            recommendedColor: '#3b82f6',
          });
        }
        if (echo) {
          suggestions.push({
            targetCompId: comp.id,
            targetPinId: echo.id,
            targetCompName: comp.name,
            targetPinName: echo.name,
            reason: 'Nối chân thu xung siêu âm Echo',
            safe: true,
            recommendedColor: '#06b6d4',
          });
        }
      }
    });
  }

  // 6. Handling Arduino Analog Pins (A0-A5)
  else if (fromComp.type === 'arduino_uno' && fromPin.type === 'analog') {
    recommendedColor = '#8b5cf6';
    smartAdvice = `Cổng Analog ${fromPin.name} đọc điện áp liên tục từ 0V đến 5V (độ phân giải 10-bit: 0 - 1023).`;

    components.forEach((comp) => {
      if (comp.type === 'potentiometer') {
        const wiper = comp.pins.find((p) => p.id === 'wiper');
        if (wiper) {
          suggestions.push({
            targetCompId: comp.id,
            targetPinId: wiper.id,
            targetCompName: comp.name,
            targetPinName: wiper.name,
            reason: `Đọc điện áp analog từ chân giữa (Wiper) của biến trở vào ${fromPin.name}`,
            safe: true,
            recommendedColor: '#8b5cf6',
          });
        }
      }
    });
  }

  // 7. General fallback
  if (suggestions.length === 0) {
    smartAdvice = `Đã chọn ${fromComp.name} [${fromPin.name}]. Nhấp vào chân của linh kiện muốn kết nối.`;
  }

  return {
    suggestions,
    recommendedColor,
    smartAdvice,
    warningAlert,
  };
}
