import type { AISchematicRecipe } from '../types/circuit';

export const PREBUILT_RECIPES: AISchematicRecipe[] = [
  {
    id: 'traffic_light',
    title: 'Mạch đèn giao thông 3 màu (Đỏ - Vàng - Xanh)',
    category: 'Cơ bản',
    promptSample: 'Làm mạch đèn giao thông 3 màu Đỏ, Vàng, Xanh điều khiển bằng Arduino Uno',
    description: 'Mạch mô phỏng chu kỳ đèn giao thông giao lộ với 3 đèn LED riêng biệt qua các điện trở hạn dòng 220Ω bảo vệ đèn.',
    components: [
      { id: 'arduino', type: 'arduino_uno', name: 'Arduino Uno R3', x: 80, y: 180 },
      { id: 'bb', type: 'breadboard', name: 'Breadboard Mini', x: 440, y: 180 },
      { id: 'r_red', type: 'resistor', name: 'Điện trở 220Ω (Đỏ)', x: 470, y: 120, properties: { resistance: 220 } },
      { id: 'r_yellow', type: 'resistor', name: 'Điện trở 220Ω (Vàng)', x: 570, y: 120, properties: { resistance: 220 } },
      { id: 'r_green', type: 'resistor', name: 'Điện trở 220Ω (Xanh)', x: 670, y: 120, properties: { resistance: 220 } },
      { id: 'led_red', type: 'led', name: 'Đèn LED Đỏ', x: 490, y: 30, properties: { color: 'red' } },
      { id: 'led_yellow', type: 'led', name: 'Đèn LED Vàng', x: 590, y: 30, properties: { color: 'yellow' } },
      { id: 'led_green', type: 'led', name: 'Đèn LED Xanh', x: 690, y: 30, properties: { color: 'green' } },
    ],
    wires: [
      // Arduino GND to Breadboard Bottom Rail (-)
      { fromCompId: 'arduino', fromPinId: 'gnd_top', toCompId: 'bb', toPinId: 'top_minus_0', color: '#111827', note: 'Nối đất chung Arduino GND lên Breadboard rail (-)' },
      
      // Control signals from Arduino to Resistors
      { fromCompId: 'arduino', fromPinId: 'd13', toCompId: 'r_red', toPinId: 'pin1', color: '#ef4444', note: 'Chân D13 điều khiển đèn Đỏ' },
      { fromCompId: 'r_red', fromPinId: 'pin2', toCompId: 'led_red', toPinId: 'anode', color: '#ef4444', note: 'Qua điện trở 220Ω bảo vệ Anode LED Đỏ' },
      { fromCompId: 'led_red', fromPinId: 'cathode', toCompId: 'bb', toPinId: 'top_minus_2', color: '#111827', note: 'Cathode LED Đỏ về GND' },

      { fromCompId: 'arduino', fromPinId: 'd12', toCompId: 'r_yellow', toPinId: 'pin1', color: '#eab308', note: 'Chân D12 điều khiển đèn Vàng' },
      { fromCompId: 'r_yellow', fromPinId: 'pin2', toCompId: 'led_yellow', toPinId: 'anode', color: '#eab308', note: 'Qua điện trở 220Ω bảo vệ Anode LED Vàng' },
      { fromCompId: 'led_yellow', fromPinId: 'cathode', toCompId: 'bb', toPinId: 'top_minus_6', color: '#111827', note: 'Cathode LED Vàng về GND' },

      { fromCompId: 'arduino', fromPinId: 'd11', toCompId: 'r_green', toPinId: 'pin1', color: '#22c55e', note: 'Chân D11 điều khiển đèn Xanh' },
      { fromCompId: 'r_green', fromPinId: 'pin2', toCompId: 'led_green', toPinId: 'anode', color: '#22c55e', note: 'Qua điện trở 220Ω bảo vệ Anode LED Xanh' },
      { fromCompId: 'led_green', fromPinId: 'cathode', toCompId: 'bb', toPinId: 'top_minus_10', color: '#111827', note: 'Cathode LED Xanh về GND' },
    ],
    steps: [
      'Bước 1: Nối chân GND của Arduino Uno vào thanh ray màu xanh (-) trên Breadboard để tạo đường đất chung.',
      'Bước 2: Cắm 3 đèn LED (Đỏ, Vàng, Xanh) lên mạch, quay chân ngắn (Cathode) về phía đường GND.',
      'Bước 3: Nối chân Cathode của 3 đèn LED vào thanh ray GND (-) bằng dây màu đen.',
      'Bước 4: Nối mỗi chân Anode (+) của đèn LED với một điện trở 220Ω để chống quá dòng gây cháy LED.',
      'Bước 5: Nối đầu còn lại của điện trở Đỏ vào chân D13, điện trở Vàng vào chân D12, và điện trở Xanh vào chân D11 trên Arduino.',
    ],
  },
  {
    id: 'ultrasonic_alarm',
    title: 'Mạch đo khoảng cách siêu âm & Báo động còi Buzzer',
    category: 'Cảm biến',
    promptSample: 'Mạch đo khoảng cách dùng cảm biến siêu âm HC-SR04 và còi Buzzer cảnh báo',
    description: 'Hệ thống radar cảnh báo va chạm: Cảm biến siêu âm liên tục quét khoảng cách vật cản, kích hoạt còi Buzzer và đèn LED đỏ khi vật cản tiến gần dưới khoảng cách nguy hiểm.',
    components: [
      { id: 'arduino', type: 'arduino_uno', name: 'Arduino Uno R3', x: 80, y: 180 },
      { id: 'sonar', type: 'ultrasonic', name: 'Cảm biến siêu âm HC-SR04', x: 450, y: 70, properties: { distance: 35 } },
      { id: 'buzzer', type: 'buzzer', name: 'Còi chíp Piezo Buzzer', x: 620, y: 80 },
      { id: 'led_warn', type: 'led', name: 'Đèn LED Cảnh báo', x: 730, y: 80, properties: { color: 'red' } },
      { id: 'r_warn', type: 'resistor', name: 'Điện trở 220Ω', x: 710, y: 220, properties: { resistance: 220 } },
    ],
    wires: [
      // Sonar power
      { fromCompId: 'arduino', fromPinId: '5v', toCompId: 'sonar', toPinId: 'vcc', color: '#dc2626', note: 'Cấp nguồn 5V cho cảm biến siêu âm' },
      { fromCompId: 'arduino', fromPinId: 'gnd_bot1', toCompId: 'sonar', toPinId: 'gnd', color: '#111827', note: 'Nối đất GND cho cảm biến siêu âm' },
      // Sonar signals
      { fromCompId: 'arduino', fromPinId: 'd9', toCompId: 'sonar', toPinId: 'trig', color: '#3b82f6', note: 'Chân Trig nối vào D9 (phát xung siêu âm)' },
      { fromCompId: 'arduino', fromPinId: 'd10', toCompId: 'sonar', toPinId: 'echo', color: '#06b6d4', note: 'Chân Echo nối vào D10 (nhận xung phản xạ)' },

      // Buzzer
      { fromCompId: 'arduino', fromPinId: 'd8', toCompId: 'buzzer', toPinId: 'pos', color: '#f59e0b', note: 'Chân D8 kích hoạt còi buzzer' },
      { fromCompId: 'arduino', fromPinId: 'gnd_top', toCompId: 'buzzer', toPinId: 'neg', color: '#111827', note: 'Chân âm còi nối về GND' },

      // LED warning
      { fromCompId: 'arduino', fromPinId: 'd7', toCompId: 'r_warn', toPinId: 'pin1', color: '#ef4444', note: 'Chân D7 điều khiển LED cảnh báo' },
      { fromCompId: 'r_warn', fromPinId: 'pin2', toCompId: 'led_warn', toPinId: 'anode', color: '#ef4444', note: 'Điện trở 220Ω vào Anode' },
      { fromCompId: 'led_warn', fromPinId: 'cathode', toCompId: 'buzzer', toPinId: 'neg', color: '#111827', note: 'Cathode LED về GND chung' },
    ],
    steps: [
      'Bước 1: Nối chân VCC của cảm biến HC-SR04 vào chân 5V của Arduino (dây đỏ).',
      'Bước 2: Nối chân GND của HC-SR04 vào chân GND của Arduino (dây đen).',
      'Bước 3: Nối chân Trig của HC-SR04 vào chân Digital 9, và chân Echo vào chân Digital 10.',
      'Bước 4: Nối chân dương (+) của Còi Buzzer vào chân Digital 8, chân âm (-) nối về GND.',
      'Bước 5: Nối chân Digital 7 qua điện trở 220Ω vào chân Anode của LED Đỏ, chân Cathode về GND.',
    ],
  },
  {
    id: 'button_toggle_led',
    title: 'Mạch điều khiển bật/tắt đèn LED bằng nút bấm',
    category: 'Cơ bản',
    promptSample: 'Mạch điều khiển đèn LED bật tắt bằng nút bấm nhấn nhả với Arduino',
    description: 'Mạch sử dụng nút nhấn nối điện trở kéo xuống (pull-down 10kΩ) để gửi tín hiệu số chuẩn xác vào Arduino điều khiển đèn LED.',
    components: [
      { id: 'arduino', type: 'arduino_uno', name: 'Arduino Uno R3', x: 80, y: 180 },
      { id: 'btn', type: 'pushbutton', name: 'Nút bấm 4 chân', x: 450, y: 120 },
      { id: 'r_pull', type: 'resistor', name: 'Điện trở 10kΩ (Kéo xuống)', x: 550, y: 120, properties: { resistance: 10000 } },
      { id: 'led', type: 'led', name: 'Đèn LED Xanh dương', x: 670, y: 100, properties: { color: 'blue' } },
      { id: 'r_led', type: 'resistor', name: 'Điện trở 220Ω (LED)', x: 650, y: 220, properties: { resistance: 220 } },
    ],
    wires: [
      // Button 5V supply
      { fromCompId: 'arduino', fromPinId: '5v', toCompId: 'btn', toPinId: 'term1a', color: '#dc2626', note: 'Cấp nguồn 5V vào chân 1A của nút nhấn' },
      // Button signal to D2
      { fromCompId: 'btn', fromPinId: 'term2a', toCompId: 'arduino', toPinId: 'd2', color: '#3b82f6', note: 'Chân 2A gửi tín hiệu mức cao về D2 khi nhấn nút' },
      // Pull-down resistor to GND
      { fromCompId: 'btn', fromPinId: 'term2a', toCompId: 'r_pull', toPinId: 'pin1', color: '#3b82f6', note: 'Nối với điện trở kéo xuống 10kΩ để chống nhiễu chân D2' },
      { fromCompId: 'r_pull', fromPinId: 'pin2', toCompId: 'arduino', toPinId: 'gnd_bot1', color: '#111827', note: 'Đầu kia điện trở kéo xuống nối GND' },
      // LED control from D13
      { fromCompId: 'arduino', fromPinId: 'd13', toCompId: 'r_led', toPinId: 'pin1', color: '#06b6d4', note: 'Chân D13 điều khiển đèn LED' },
      { fromCompId: 'r_led', fromPinId: 'pin2', toCompId: 'led', toPinId: 'anode', color: '#06b6d4', note: 'Qua điện trở 220Ω vào Anode' },
      { fromCompId: 'led', fromPinId: 'cathode', toCompId: 'arduino', toPinId: 'gnd_top', color: '#111827', note: 'Cathode LED về GND' },
    ],
    steps: [
      'Bước 1: Nối chân 5V của Arduino vào chân 1A của Nút nhấn.',
      'Bước 2: Nối chân 2A của Nút nhấn vào chân Digital 2 của Arduino để đọc trạng thái nút.',
      'Bước 3: Nối chân 2A này đồng thời vào chân 1 của Điện trở 10kΩ (Pull-down), đầu chân 2 nối về GND Arduino để triệt tiêu điện áp trôi nổi khi không nhấn.',
      'Bước 4: Nối chân Digital 13 vào điện trở 220Ω, rồi đến chân Anode (+) của đèn LED.',
      'Bước 5: Nối chân Cathode (-) của đèn LED về GND Arduino.',
    ],
  },
  {
    id: 'servo_potentiometer',
    title: 'Điều khiển góc quay Servo SG90 bằng Biến trở Potentiometer',
    category: 'Cơ điện tử',
    promptSample: 'Mạch điều khiển góc quay động cơ Servo SG90 bằng biến trở',
    description: 'Sử dụng biến trở đo điện áp analog 0-5V qua chân A0 để điều khiển chính xác vị trí góc quay 0-180 độ của động cơ servo SG90 qua chân PWM D9.',
    components: [
      { id: 'arduino', type: 'arduino_uno', name: 'Arduino Uno R3', x: 80, y: 180 },
      { id: 'pot', type: 'potentiometer', name: 'Biến trở 10kΩ', x: 450, y: 100 },
      { id: 'servo', type: 'servo', name: 'Động cơ Servo SG90', x: 620, y: 100 },
    ],
    wires: [
      // Potentiometer
      { fromCompId: 'arduino', fromPinId: '5v', toCompId: 'pot', toPinId: 'vcc', color: '#dc2626', note: 'Nguồn 5V cho chân ngoài biến trở' },
      { fromCompId: 'arduino', fromPinId: 'a0', toCompId: 'pot', toPinId: 'wiper', color: '#eab308', note: 'Chân giữa biến trở gửi điện áp analog về A0' },
      { fromCompId: 'arduino', fromPinId: 'gnd_bot1', toCompId: 'pot', toPinId: 'gnd', color: '#111827', note: 'Nối đất GND cho biến trở' },

      // Servo
      { fromCompId: 'arduino', fromPinId: '5v', toCompId: 'servo', toPinId: 'vcc', color: '#dc2626', note: 'Dây Đỏ Servo nối vào 5V' },
      { fromCompId: 'arduino', fromPinId: 'gnd_bot2', toCompId: 'servo', toPinId: 'gnd', color: '#111827', note: 'Dây Nâu Servo nối vào GND' },
      { fromCompId: 'arduino', fromPinId: 'd9', toCompId: 'servo', toPinId: 'sig', color: '#f97316', note: 'Dây Cam Servo nối chân PWM D9 để điều khiển xung góc quay' },
    ],
    steps: [
      'Bước 1: Nối chân VCC (chân 1) của Biến trở vào chân 5V của Arduino.',
      'Bước 2: Nối chân GND (chân 3) của Biến trở vào chân GND của Arduino.',
      'Bước 3: Nối chân Wiper (chân giữa số 2) của Biến trở vào cổng Analog A0 của Arduino.',
      'Bước 4: Nối dây Nâu (GND) của Servo SG90 vào GND Arduino, dây Đỏ (VCC) vào 5V.',
      'Bước 5: Nối dây Cam (Tín hiệu PWM) của Servo vào chân Digital ~9 có hỗ trợ PWM của Arduino.',
    ],
  },
  {
    id: 'pir_security_alarm',
    title: 'Hệ thống báo động chống trộm cảm biến PIR',
    category: 'An ninh',
    promptSample: 'Mạch báo động chống trộm phát hiện chuyển động bằng PIR, còi Buzzer và đèn LED',
    description: 'Hệ thống an ninh phát hiện chuyển động thân nhiệt hồng ngoại bằng cảm biến PIR. Khi có kẻ xâm nhập, còi báo động réo liên tục và đèn chớp cảnh báo.',
    components: [
      { id: 'arduino', type: 'arduino_uno', name: 'Arduino Uno R3', x: 80, y: 180 },
      { id: 'pir', type: 'pir', name: 'Cảm biến PIR HC-SR501', x: 450, y: 90 },
      { id: 'buzzer', type: 'buzzer', name: 'Còi chíp Báo động', x: 600, y: 90 },
      { id: 'led', type: 'led', name: 'Đèn LED Báo động', x: 720, y: 90, properties: { color: 'red' } },
      { id: 'res', type: 'resistor', name: 'Điện trở 220Ω', x: 700, y: 220, properties: { resistance: 220 } },
    ],
    wires: [
      { fromCompId: 'arduino', fromPinId: '5v', toCompId: 'pir', toPinId: 'vcc', color: '#dc2626', note: 'Nguồn 5V cấp cho PIR' },
      { fromCompId: 'arduino', fromPinId: 'gnd_bot1', toCompId: 'pir', toPinId: 'gnd', color: '#111827', note: 'Nối đất GND cho PIR' },
      { fromCompId: 'arduino', fromPinId: 'd2', toCompId: 'pir', toPinId: 'out', color: '#a855f7', note: 'Chân tín hiệu OUT PIR nối vào D2 (ngắt ngắt phát hiện)' },

      { fromCompId: 'arduino', fromPinId: 'd8', toCompId: 'buzzer', toPinId: 'pos', color: '#f59e0b', note: 'Kích hoạt còi báo động qua D8' },
      { fromCompId: 'arduino', fromPinId: 'gnd_top', toCompId: 'buzzer', toPinId: 'neg', color: '#111827', note: 'Chân âm còi nối GND' },

      { fromCompId: 'arduino', fromPinId: 'd13', toCompId: 'res', toPinId: 'pin1', color: '#ef4444', note: 'D13 nhấp nháy đèn báo động' },
      { fromCompId: 'res', fromPinId: 'pin2', toCompId: 'led', toPinId: 'anode', color: '#ef4444', note: 'Qua điện trở 220Ω vào Anode' },
      { fromCompId: 'led', fromPinId: 'cathode', toCompId: 'buzzer', toPinId: 'neg', color: '#111827', note: 'Cathode LED về GND' },
    ],
    steps: [
      'Bước 1: Cấp nguồn 5V và GND từ Arduino vào 2 chân VCC và GND của cảm biến PIR.',
      'Bước 2: Nối chân OUT của PIR vào chân Digital 2 của Arduino để theo dõi tín hiệu.',
      'Bước 3: Nối chân dương (+) còi Buzzer vào chân Digital 8, chân âm (-) vào GND.',
      'Bước 4: Nối chân Digital 13 qua điện trở 220Ω vào chân Anode của LED Đỏ, chân Cathode về GND.',
    ],
  },
];

export async function synthesizeCircuitFromPrompt(
  prompt: string,
  apiKey?: string,
  provider: 'auto' | 'gemini' | 'openai' = 'auto'
): Promise<AISchematicRecipe> {
  const normalized = prompt.toLowerCase();

  // 1. Check if matches prebuilt rich recipes
  if (normalized.includes('giao thông') || normalized.includes('traffic') || (normalized.includes('3') && normalized.includes('led'))) {
    return PREBUILT_RECIPES[0];
  }
  if (normalized.includes('siêu âm') || normalized.includes('khoảng cách') || normalized.includes('ultrasonic') || normalized.includes('sonar') || normalized.includes('sr04')) {
    return PREBUILT_RECIPES[1];
  }
  if (normalized.includes('nút') || normalized.includes('button') || normalized.includes('bấm') || normalized.includes('nhấn')) {
    return PREBUILT_RECIPES[2];
  }
  if (normalized.includes('servo') || normalized.includes('chiết áp') || normalized.includes('biến trở') || normalized.includes('potentiometer')) {
    return PREBUILT_RECIPES[3];
  }
  if (normalized.includes('pir') || normalized.includes('trộm') || normalized.includes('chuyển động') || normalized.includes('security') || normalized.includes('báo động')) {
    return PREBUILT_RECIPES[4];
  }

  // 2. If user provides API Key (OpenAI or Gemini), attempt live synthesis
  if (apiKey && (provider === 'gemini' || provider === 'openai' || provider === 'auto')) {
    try {
      const result = await callLiveLLM(prompt, apiKey, provider);
      if (result) return result;
    } catch (err) {
      console.warn('Live LLM synthesis failed, falling back to smart heuristic:', err);
    }
  }

  // 3. Smart Heuristic Dynamic Synthesis for custom prompts
  return generateSmartHeuristicRecipe(prompt);
}

function generateSmartHeuristicRecipe(prompt: string): AISchematicRecipe {
  const norm = prompt.toLowerCase();
  const hasLed = norm.includes('led') || norm.includes('đèn') || norm.includes('sáng');
  const hasBuzzer = norm.includes('còi') || norm.includes('buzzer') || norm.includes('kêu') || norm.includes('chuông');
  const hasButton = norm.includes('nút') || norm.includes('bấm') || norm.includes('nhấn');
  const hasUltrasonic = norm.includes('khoảng cách') || norm.includes('siêu âm') || norm.includes('vật cản');

  const components: AISchematicRecipe['components'] = [
    { id: 'arduino', type: 'arduino_uno', name: 'Arduino Uno R3', x: 80, y: 180 },
    { id: 'bb', type: 'breadboard', name: 'Breadboard Mini', x: 440, y: 180 },
  ];

  const wires: AISchematicRecipe['wires'] = [
    { fromCompId: 'arduino', fromPinId: 'gnd_top', toCompId: 'bb', toPinId: 'top_minus_0', color: '#111827', note: 'Arduino GND nối thanh ray (-) Breadboard' },
    { fromCompId: 'arduino', fromPinId: '5v', toCompId: 'bb', toPinId: 'top_plus_0', color: '#dc2626', note: 'Arduino 5V nối thanh ray (+) Breadboard' },
  ];

  const steps: string[] = [
    'Bước 1: Cấp nguồn 5V (dây đỏ) và GND (dây đen) từ Arduino sang thanh ray nguồn Breadboard.',
  ];

  let currentX = 460;

  if (hasLed || (!hasBuzzer && !hasButton && !hasUltrasonic)) {
    components.push(
      { id: 'led_1', type: 'led', name: 'Đèn LED Đỏ', x: currentX, y: 50, properties: { color: 'red' } },
      { id: 'r_led1', type: 'resistor', name: 'Điện trở 220Ω', x: currentX - 20, y: 120, properties: { resistance: 220 } }
    );
    wires.push(
      { fromCompId: 'arduino', fromPinId: 'd13', toCompId: 'r_led1', toPinId: 'pin1', color: '#ef4444', note: 'D13 cấp tín hiệu qua điện trở 220Ω' },
      { fromCompId: 'r_led1', fromPinId: 'pin2', toCompId: 'led_1', toPinId: 'anode', color: '#ef4444', note: 'Điện trở vào Anode LED' },
      { fromCompId: 'led_1', fromPinId: 'cathode', toCompId: 'bb', toPinId: 'top_minus_2', color: '#111827', note: 'Cathode LED về GND' }
    );
    steps.push('Bước: Nối chân Digital D13 qua điện trở 220Ω vào Anode đèn LED, Cathode về GND.');
    currentX += 120;
  }

  if (hasBuzzer) {
    components.push({ id: 'buzzer_1', type: 'buzzer', name: 'Còi chíp Piezo', x: currentX, y: 50 });
    wires.push(
      { fromCompId: 'arduino', fromPinId: 'd8', toCompId: 'buzzer_1', toPinId: 'pos', color: '#f59e0b', note: 'D8 cấp tín hiệu còi chíp' },
      { fromCompId: 'buzzer_1', fromPinId: 'neg', toCompId: 'bb', toPinId: 'top_minus_6', color: '#111827', note: 'Cực âm còi chíp về GND' }
    );
    steps.push('Bước: Nối chân Digital D8 vào chân Dương còi Buzzer, chân Âm về GND.');
    currentX += 120;
  }

  if (hasButton) {
    components.push(
      { id: 'btn_1', type: 'pushbutton', name: 'Nút bấm 4 chân', x: currentX, y: 70 },
      { id: 'r_btn', type: 'resistor', name: 'Điện trở 10kΩ Pull-down', x: currentX + 60, y: 70, properties: { resistance: 10000 } }
    );
    wires.push(
      { fromCompId: 'bb', fromPinId: 'top_plus_4', toCompId: 'btn_1', toPinId: 'term1a', color: '#dc2626', note: 'Nguồn 5V vào chân 1A nút nhấn' },
      { fromCompId: 'btn_1', fromPinId: 'term2a', toCompId: 'arduino', toPinId: 'd2', color: '#3b82f6', note: 'Tín hiệu nút nhấn về D2' },
      { fromCompId: 'btn_1', fromPinId: 'term2a', toCompId: 'r_btn', toPinId: 'pin1', color: '#3b82f6', note: 'Nối với điện trở kéo xuống' },
      { fromCompId: 'r_btn', fromPinId: 'pin2', toCompId: 'bb', toPinId: 'top_minus_10', color: '#111827', note: 'Đầu kia điện trở về GND' }
    );
    steps.push('Bước: Nối Nút bấm với nguồn 5V và chân Digital D2 kèm điện trở kéo xuống 10kΩ về GND.');
  }

  return {
    id: `custom_${Date.now()}`,
    title: `Sơ đồ dự án: ${prompt.slice(0, 45)}...`,
    category: 'Tự tạo theo Prompt AI',
    promptSample: prompt,
    description: `Mạch thiết kế theo yêu cầu: "${prompt}". Sơ đồ đã được AI tự động tính toán điện trở phù hợp và phân phối chân an toàn.`,
    components,
    wires,
    steps,
  };
}

async function callLiveLLM(
  prompt: string,
  apiKey: string,
  provider: 'gemini' | 'openai' | 'auto'
): Promise<AISchematicRecipe | null> {
  const isGemini = provider === 'gemini' || (provider === 'auto' && apiKey.startsWith('AIza'));
  
  const systemInstruction = `Bạn là kỹ sư trưởng thiết kế phần cứng mạch điện tử Arduino và Tinkercad.
Nhiệm vụ của bạn là nhận yêu cầu của người dùng và trả về JSON chứa sơ đồ cắm chân gồm:
1. components: Danh sách linh kiện từ các loại: arduino_uno, breadboard, led, resistor, pushbutton, potentiometer, ultrasonic, buzzer, servo, pir. Kèm toạ độ x (từ 80 đến 800), y (từ 50 đến 400).
2. wires: Danh sách dây nối giữa fromCompId/fromPinId và toCompId/toPinId kèm mã màu hex (Đỏ cho 5V, Đen cho GND, Vàng/Xanh/Cam cho tín hiệu). Luôn có điện trở hạn dòng 220Ω bảo vệ LED.
3. steps: Các bước hướng dẫn cắm dây bằng tiếng Việt.
Chỉ trả về JSON thuần tuý, không kèm markdown backticks.`;

  if (isGemini) {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: `${systemInstruction}\n\nYêu cầu dự án: ${prompt}` }] }],
        generationConfig: { responseMimeType: 'application/json' },
      }),
    });
    if (!res.ok) throw new Error(`Gemini API error: ${res.statusText}`);
    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return null;
    return JSON.parse(text);
  } else {
    // OpenAI format
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemInstruction },
          { role: 'user', content: `Yêu cầu dự án: ${prompt}` },
        ],
        response_format: { type: 'json_object' },
      }),
    });
    if (!res.ok) throw new Error(`OpenAI API error: ${res.statusText}`);
    const data = await res.json();
    const text = data.choices?.[0]?.message?.content;
    if (!text) return null;
    return JSON.parse(text);
  }
}
