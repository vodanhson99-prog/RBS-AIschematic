import type { AISchematicRecipe, UserAISettings, AIProviderMetadata, AIProvider, CircuitComponent, Wire, AIChatMessage } from '../types/circuit';
import { saveSecureAISettings, loadSecureAISettings } from './securityService';


export const PREBUILT_RECIPES: AISchematicRecipe[] = [
  {
    id: 'traffic_light',
    title: 'Mạch đèn giao thông 3 màu (Đỏ - Vàng - Xanh)',
    category: 'Cơ bản',
    promptSample: 'Làm mạch đèn giao thông 3 màu Đỏ, Vàng, Xanh điều khiển bằng Arduino Uno',
    description: 'Mạch mô phỏng chu kỳ đèn giao thông giao lộ với 3 đèn LED riêng biệt qua các điện trở hạn dòng 220Ω bảo vệ đèn.',
    components: [
      { id: 'arduino', type: 'arduino_uno', name: 'Arduino Uno R3', x: 80, y: 160 },
      { id: 'bb', type: 'breadboard', name: 'Breadboard Mini', x: 440, y: 160 },
      { id: 'r_red', type: 'resistor', name: 'Điện trở 220Ω (Đỏ)', x: 470, y: 35, properties: { resistance: 220 } },
      { id: 'r_yellow', type: 'resistor', name: 'Điện trở 220Ω (Vàng)', x: 590, y: 35, properties: { resistance: 220 } },
      { id: 'r_green', type: 'resistor', name: 'Điện trở 220Ω (Xanh)', x: 710, y: 35, properties: { resistance: 220 } },
      { id: 'led_red', type: 'led', name: 'Đèn LED Đỏ', x: 520, y: 85, properties: { color: 'red' } },
      { id: 'led_yellow', type: 'led', name: 'Đèn LED Vàng', x: 640, y: 85, properties: { color: 'yellow' } },
      { id: 'led_green', type: 'led', name: 'Đèn LED Xanh', x: 760, y: 85, properties: { color: 'green' } },
    ],
    wires: [
      // Arduino GND to Breadboard Top Rail (-)
      { fromCompId: 'arduino', fromPinId: 'gnd_top', toCompId: 'bb', toPinId: 'top_minus_0', color: '#111827', note: 'Nối đất chung Arduino GND lên Breadboard rail (-)' },
      
      // Control signals from Arduino to Resistors
      { fromCompId: 'arduino', fromPinId: 'd13', toCompId: 'r_red', toPinId: 'pin1', color: '#ef4444', note: 'Chân D13 điều khiển đèn Đỏ' },
      { fromCompId: 'r_red', fromPinId: 'pin2', toCompId: 'led_red', toPinId: 'anode', color: '#ef4444', note: 'Qua điện trở 220Ω bảo vệ Anode LED Đỏ' },
      { fromCompId: 'led_red', fromPinId: 'cathode', toCompId: 'bb', toPinId: 'top_minus_3', color: '#111827', note: 'Cathode LED Đỏ về GND' },

      { fromCompId: 'arduino', fromPinId: 'd12', toCompId: 'r_yellow', toPinId: 'pin1', color: '#eab308', note: 'Chân D12 điều khiển đèn Vàng' },
      { fromCompId: 'r_yellow', fromPinId: 'pin2', toCompId: 'led_yellow', toPinId: 'anode', color: '#eab308', note: 'Qua điện trở 220Ω bảo vệ Anode LED Vàng' },
      { fromCompId: 'led_yellow', fromPinId: 'cathode', toCompId: 'bb', toPinId: 'top_minus_7', color: '#111827', note: 'Cathode LED Vàng về GND' },

      { fromCompId: 'arduino', fromPinId: 'd11', toCompId: 'r_green', toPinId: 'pin1', color: '#22c55e', note: 'Chân D11 điều khiển đèn Xanh' },
      { fromCompId: 'r_green', fromPinId: 'pin2', toCompId: 'led_green', toPinId: 'anode', color: '#22c55e', note: 'Qua điện trở 220Ω bảo vệ Anode LED Xanh' },
      { fromCompId: 'led_green', fromPinId: 'cathode', toCompId: 'bb', toPinId: 'top_minus_11', color: '#111827', note: 'Cathode LED Xanh về GND' },
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
      { id: 'arduino', type: 'arduino_uno', name: 'Arduino Uno R3', x: 80, y: 160 },
      { id: 'bb', type: 'breadboard', name: 'Breadboard Mini', x: 440, y: 160 },
      { id: 'sonar', type: 'ultrasonic', name: 'Cảm biến siêu âm HC-SR04', x: 460, y: 45, properties: { distance: 35 } },
      { id: 'buzzer', type: 'buzzer', name: 'Còi chíp Piezo Buzzer', x: 610, y: 50 },
      { id: 'r_warn', type: 'resistor', name: 'Điện trở 220Ω', x: 710, y: 35, properties: { resistance: 220 } },
      { id: 'led_warn', type: 'led', name: 'Đèn LED Cảnh báo', x: 770, y: 85, properties: { color: 'red' } },
    ],
    wires: [
      // Master Power Rails
      { fromCompId: 'arduino', fromPinId: '5v', toCompId: 'bb', toPinId: 'bot_plus_0', color: '#dc2626', note: 'Arduino 5V cấp nguồn thanh ray (+) dưới' },
      { fromCompId: 'arduino', fromPinId: 'gnd_bot1', toCompId: 'bb', toPinId: 'bot_minus_0', color: '#111827', note: 'Arduino GND nối đất thanh ray (-) dưới' },
      { fromCompId: 'arduino', fromPinId: 'gnd_top', toCompId: 'bb', toPinId: 'top_minus_0', color: '#111827', note: 'Arduino GND nối đất thanh ray (-) trên' },

      // Sonar power & signals
      { fromCompId: 'bb', fromPinId: 'bot_plus_1', toCompId: 'sonar', toPinId: 'vcc', color: '#dc2626', note: 'Cấp nguồn 5V cho cảm biến siêu âm' },
      { fromCompId: 'bb', fromPinId: 'bot_minus_1', toCompId: 'sonar', toPinId: 'gnd', color: '#111827', note: 'Nối đất GND cho cảm biến siêu âm' },
      { fromCompId: 'arduino', fromPinId: 'd9', toCompId: 'sonar', toPinId: 'trig', color: '#3b82f6', note: 'Chân Trig nối vào D9 (phát xung siêu âm)' },
      { fromCompId: 'arduino', fromPinId: 'd10', toCompId: 'sonar', toPinId: 'echo', color: '#06b6d4', note: 'Chân Echo nối vào D10 (nhận xung phản xạ)' },

      // Buzzer
      { fromCompId: 'arduino', fromPinId: 'd8', toCompId: 'buzzer', toPinId: 'pos', color: '#f59e0b', note: 'Chân D8 kích hoạt còi buzzer' },
      { fromCompId: 'buzzer', fromPinId: 'neg', toCompId: 'bb', toPinId: 'top_minus_7', color: '#111827', note: 'Chân âm còi nối về ray GND' },

      // LED warning
      { fromCompId: 'arduino', fromPinId: 'd7', toCompId: 'r_warn', toPinId: 'pin1', color: '#ef4444', note: 'Chân D7 điều khiển LED cảnh báo' },
      { fromCompId: 'r_warn', fromPinId: 'pin2', toCompId: 'led_warn', toPinId: 'anode', color: '#ef4444', note: 'Điện trở 220Ω vào Anode LED' },
      { fromCompId: 'led_warn', fromPinId: 'cathode', toCompId: 'bb', toPinId: 'top_minus_12', color: '#111827', note: 'Cathode LED về ray GND' },
    ],
    steps: [
      'Bước 1: Cấp nguồn 5V và GND từ Arduino sang các thanh ray nguồn trên Breadboard.',
      'Bước 2: Nối chân VCC và GND của HC-SR04 vào thanh ray 5V và GND của Breadboard.',
      'Bước 3: Nối chân Trig của HC-SR04 vào chân D9, và chân Echo vào chân D10 của Arduino.',
      'Bước 4: Nối chân dương (+) còi Buzzer vào chân D8, chân âm (-) nối về thanh ray GND.',
      'Bước 5: Nối chân D7 qua điện trở hạn dòng 220Ω vào chân Anode (+) của LED Đỏ, chân Cathode nối về ray GND.',
    ],
  },
  {
    id: 'button_toggle_led',
    title: 'Mạch điều khiển bật/tắt đèn LED bằng nút bấm',
    category: 'Cơ bản',
    promptSample: 'Mạch điều khiển đèn LED bật tắt bằng nút bấm nhấn nhả với Arduino',
    description: 'Mạch sử dụng nút nhấn nối điện trở kéo xuống (pull-down 10kΩ) để gửi tín hiệu số chuẩn xác vào Arduino điều khiển đèn LED.',
    components: [
      { id: 'arduino', type: 'arduino_uno', name: 'Arduino Uno R3', x: 80, y: 160 },
      { id: 'bb', type: 'breadboard', name: 'Breadboard Mini', x: 440, y: 160 },
      { id: 'btn', type: 'pushbutton', name: 'Nút bấm 4 chân', x: 470, y: 65 },
      { id: 'r_pull', type: 'resistor', name: 'Điện trở 10kΩ (Kéo xuống)', x: 560, y: 35, properties: { resistance: 10000 } },
      { id: 'r_led', type: 'resistor', name: 'Điện trở 220Ω (LED)', x: 690, y: 35, properties: { resistance: 220 } },
      { id: 'led', type: 'led', name: 'Đèn LED Xanh dương', x: 740, y: 85, properties: { color: 'blue' } },
    ],
    wires: [
      // Master Power Rails
      { fromCompId: 'arduino', fromPinId: '5v', toCompId: 'bb', toPinId: 'bot_plus_0', color: '#dc2626', note: 'Arduino 5V cấp nguồn thanh ray (+) dưới' },
      { fromCompId: 'arduino', fromPinId: 'gnd_bot1', toCompId: 'bb', toPinId: 'bot_minus_0', color: '#111827', note: 'Arduino GND nối đất thanh ray (-) dưới' },
      { fromCompId: 'arduino', fromPinId: 'gnd_top', toCompId: 'bb', toPinId: 'top_minus_0', color: '#111827', note: 'Arduino GND nối đất thanh ray (-) trên' },

      // Button 5V supply & Signal to D2
      { fromCompId: 'bb', fromPinId: 'top_plus_1', toCompId: 'btn', toPinId: 'term1a', color: '#dc2626', note: 'Cấp nguồn 5V vào chân 1A của nút nhấn' },
      { fromCompId: 'btn', fromPinId: 'term2a', toCompId: 'arduino', toPinId: 'd2', color: '#3b82f6', note: 'Chân 2A gửi tín hiệu mức cao về D2 khi nhấn nút' },

      // Pull-down resistor 10k to GND (using term2b internally connected to term2a)
      { fromCompId: 'btn', fromPinId: 'term2b', toCompId: 'r_pull', toPinId: 'pin1', color: '#3b82f6', note: 'Nối với điện trở kéo xuống 10kΩ để chống nhiễu chân D2' },
      { fromCompId: 'r_pull', fromPinId: 'pin2', toCompId: 'bb', toPinId: 'top_minus_6', color: '#111827', note: 'Đầu kia điện trở kéo xuống nối rail GND' },

      // LED control from D13
      { fromCompId: 'arduino', fromPinId: 'd13', toCompId: 'r_led', toPinId: 'pin1', color: '#06b6d4', note: 'Chân D13 điều khiển đèn LED' },
      { fromCompId: 'r_led', fromPinId: 'pin2', toCompId: 'led', toPinId: 'anode', color: '#06b6d4', note: 'Qua điện trở 220Ω vào Anode' },
      { fromCompId: 'led', fromPinId: 'cathode', toCompId: 'bb', toPinId: 'top_minus_11', color: '#111827', note: 'Cathode LED về rail GND' },
    ],
    steps: [
      'Bước 1: Nối nguồn 5V và GND từ Arduino vào các đường ray nguồn Breadboard.',
      'Bước 2: Cấp 5V vào chân 1A của Nút nhấn.',
      'Bước 3: Nối chân 2A của Nút nhấn vào chân D2 của Arduino để đọc trạng thái.',
      'Bước 4: Nối chân 2B của Nút nhấn qua điện trở kéo xuống 10kΩ về ray GND để triệt tiêu điện áp trôi nổi.',
      'Bước 5: Nối chân D13 qua điện trở 220Ω vào chân Anode (+) của LED, chân Cathode (-) về ray GND.',
    ],
  },
  {
    id: 'servo_potentiometer',
    title: 'Điều khiển góc quay Servo SG90 bằng Biến trở Potentiometer',
    category: 'Cơ điện tử',
    promptSample: 'Mạch điều khiển góc quay động cơ Servo SG90 bằng biến trở',
    description: 'Sử dụng biến trở đo điện áp analog 0-5V qua chân A0 để điều khiển chính xác vị trí góc quay 0-180 độ của động cơ servo SG90 qua chân PWM D9.',
    components: [
      { id: 'arduino', type: 'arduino_uno', name: 'Arduino Uno R3', x: 80, y: 160 },
      { id: 'bb', type: 'breadboard', name: 'Breadboard Mini', x: 440, y: 160 },
      { id: 'pot', type: 'potentiometer', name: 'Biến trở 10kΩ', x: 480, y: 50 },
      { id: 'servo', type: 'servo', name: 'Động cơ Servo SG90', x: 670, y: 50 },
    ],
    wires: [
      // Master Power Rails
      { fromCompId: 'arduino', fromPinId: '5v', toCompId: 'bb', toPinId: 'bot_plus_0', color: '#dc2626', note: 'Arduino 5V cấp nguồn thanh ray (+) dưới' },
      { fromCompId: 'arduino', fromPinId: 'gnd_bot1', toCompId: 'bb', toPinId: 'bot_minus_0', color: '#111827', note: 'Arduino GND nối đất thanh ray (-) dưới' },

      // Potentiometer
      { fromCompId: 'bb', fromPinId: 'bot_plus_2', toCompId: 'pot', toPinId: 'vcc', color: '#dc2626', note: 'Nguồn 5V cho chân ngoài biến trở' },
      { fromCompId: 'pot', fromPinId: 'wiper', toCompId: 'arduino', toPinId: 'a0', color: '#eab308', note: 'Chân giữa biến trở gửi điện áp analog về A0' },
      { fromCompId: 'bb', fromPinId: 'bot_minus_2', toCompId: 'pot', toPinId: 'gnd', color: '#111827', note: 'Nối đất GND cho biến trở' },

      // Servo SG90
      { fromCompId: 'bb', fromPinId: 'bot_plus_8', toCompId: 'servo', toPinId: 'vcc', color: '#dc2626', note: 'Dây Đỏ Servo nối vào 5V Breadboard' },
      { fromCompId: 'bb', fromPinId: 'bot_minus_8', toCompId: 'servo', toPinId: 'gnd', color: '#111827', note: 'Dây Nâu Servo nối vào GND Breadboard' },
      { fromCompId: 'arduino', fromPinId: 'd9', toCompId: 'servo', toPinId: 'sig', color: '#f97316', note: 'Dây Cam Servo nối chân PWM D9 để điều khiển xung góc quay' },
    ],
    steps: [
      'Bước 1: Nối chân 5V và GND của Arduino vào thanh ray nguồn dưới của Breadboard.',
      'Bước 2: Nối chân VCC (1) và GND (3) của Biến trở vào thanh ray 5V và GND của Breadboard.',
      'Bước 3: Nối chân Wiper (chân giữa 2) của Biến trở vào cổng Analog A0 của Arduino.',
      'Bước 4: Nối dây Nâu (GND) và dây Đỏ (VCC) của Servo SG90 vào thanh ray Breadboard tương ứng.',
      'Bước 5: Nối dây Cam (Tín hiệu PWM) của Servo vào chân D9 (có hỗ trợ PWM) của Arduino.',
    ],
  },
  {
    id: 'pir_security_alarm',
    title: 'Hệ thống báo động chống trộm cảm biến PIR',
    category: 'An ninh',
    promptSample: 'Mạch báo động chống trộm phát hiện chuyển động bằng PIR, còi Buzzer và đèn LED',
    description: 'Hệ thống an ninh phát hiện chuyển động thân nhiệt hồng ngoại bằng cảm biến PIR. Khi có kẻ xâm nhập, còi báo động réo liên tục và đèn chớp cảnh báo.',
    components: [
      { id: 'arduino', type: 'arduino_uno', name: 'Arduino Uno R3', x: 80, y: 160 },
      { id: 'bb', type: 'breadboard', name: 'Breadboard Mini', x: 440, y: 160 },
      { id: 'pir', type: 'pir', name: 'Cảm biến PIR HC-SR501', x: 460, y: 40 },
      { id: 'buzzer', type: 'buzzer', name: 'Còi chíp Báo động', x: 610, y: 45 },
      { id: 'res', type: 'resistor', name: 'Điện trở 220Ω', x: 710, y: 35, properties: { resistance: 220 } },
      { id: 'led', type: 'led', name: 'Đèn LED Báo động', x: 770, y: 85, properties: { color: 'red' } },
    ],
    wires: [
      // Master Power Rails
      { fromCompId: 'arduino', fromPinId: '5v', toCompId: 'bb', toPinId: 'bot_plus_0', color: '#dc2626', note: 'Nguồn 5V cấp cho Breadboard rail (+)' },
      { fromCompId: 'arduino', fromPinId: 'gnd_bot1', toCompId: 'bb', toPinId: 'bot_minus_0', color: '#111827', note: 'Nối đất GND cấp cho Breadboard rail (-)' },
      { fromCompId: 'arduino', fromPinId: 'gnd_top', toCompId: 'bb', toPinId: 'top_minus_0', color: '#111827', note: 'Nối đất GND cấp cho Breadboard rail trên (-)' },

      // PIR sensor
      { fromCompId: 'bb', fromPinId: 'bot_plus_2', toCompId: 'pir', toPinId: 'vcc', color: '#dc2626', note: 'Cấp nguồn 5V cho PIR' },
      { fromCompId: 'bb', fromPinId: 'bot_minus_2', toCompId: 'pir', toPinId: 'gnd', color: '#111827', note: 'Nối đất GND cho PIR' },
      { fromCompId: 'pir', fromPinId: 'out', toCompId: 'arduino', toPinId: 'd2', color: '#a855f7', note: 'Chân tín hiệu OUT PIR nối vào D2 (ngắt ngắt phát hiện)' },

      // Buzzer
      { fromCompId: 'arduino', fromPinId: 'd8', toCompId: 'buzzer', toPinId: 'pos', color: '#f59e0b', note: 'Kích hoạt còi báo động qua D8' },
      { fromCompId: 'buzzer', fromPinId: 'neg', toCompId: 'bb', toPinId: 'top_minus_6', color: '#111827', note: 'Chân âm còi nối ray GND' },

      // LED
      { fromCompId: 'arduino', fromPinId: 'd13', toCompId: 'res', toPinId: 'pin1', color: '#ef4444', note: 'D13 nhấp nháy đèn báo động' },
      { fromCompId: 'res', fromPinId: 'pin2', toCompId: 'led', toPinId: 'anode', color: '#ef4444', note: 'Qua điện trở 220Ω vào Anode' },
      { fromCompId: 'led', fromPinId: 'cathode', toCompId: 'bb', toPinId: 'top_minus_11', color: '#111827', note: 'Cathode LED về ray GND' },
    ],
    steps: [
      'Bước 1: Cấp nguồn 5V và GND từ Arduino sang các thanh ray nguồn trên Breadboard.',
      'Bước 2: Nối 2 chân VCC và GND của cảm biến PIR vào thanh ray nguồn Breadboard.',
      'Bước 3: Nối chân OUT của PIR vào chân Digital 2 của Arduino để theo dõi tín hiệu.',
      'Bước 4: Nối chân dương (+) còi Buzzer vào chân Digital 8, chân âm (-) vào ray GND.',
      'Bước 5: Nối chân Digital 13 qua điện trở 220Ω vào chân Anode của LED Đỏ, chân Cathode về ray GND.',
    ],
  },
  {
    id: 'smart_street_light',
    title: 'Đèn đường thông minh cảm biến quang trở LDR',
    category: 'Cảm biến',
    promptSample: 'Mạch đèn đường thông minh tự động bật sáng khi trời tối với quang trở LDR',
    description: 'Hệ thống chiếu sáng tự động thông minh: Sử dụng quang trở LDR kết hợp điện trở 10kΩ tạo cầu phân áp, Arduino đo cường độ sáng môi trường và tự động bật đèn khi trời tối.',
    components: [
      { id: 'arduino', type: 'arduino_uno', name: 'Arduino Uno R3', x: 80, y: 160 },
      { id: 'bb', type: 'breadboard', name: 'Breadboard Mini', x: 440, y: 160 },
      { id: 'ldr', type: 'ldr', name: 'Cảm biến quang trở LDR', x: 470, y: 65, properties: { lightLevel: 70 } },
      { id: 'r_div', type: 'resistor', name: 'Điện trở 10kΩ (Cầu phân áp)', x: 550, y: 35, properties: { resistance: 10000 } },
      { id: 'r_led', type: 'resistor', name: 'Điện trở 220Ω (LED)', x: 680, y: 35, properties: { resistance: 220 } },
      { id: 'led_street', type: 'led', name: 'Đèn đường LED Vàng', x: 730, y: 85, properties: { color: 'yellow' } },
    ],
    wires: [
      // Master Power Rails
      { fromCompId: 'arduino', fromPinId: '5v', toCompId: 'bb', toPinId: 'bot_plus_0', color: '#dc2626', note: 'Arduino 5V cấp nguồn thanh ray (+) dưới' },
      { fromCompId: 'arduino', fromPinId: 'gnd_bot1', toCompId: 'bb', toPinId: 'bot_minus_0', color: '#111827', note: 'Arduino GND nối đất thanh ray (-) dưới' },
      { fromCompId: 'arduino', fromPinId: 'gnd_top', toCompId: 'bb', toPinId: 'top_minus_0', color: '#111827', note: 'Arduino GND nối đất thanh ray (-) trên' },

      // LDR Voltage divider circuit
      { fromCompId: 'bb', fromPinId: 'bot_plus_2', toCompId: 'ldr', toPinId: 'pin1', color: '#dc2626', note: 'Cấp nguồn 5V vào chân 1 quang trở LDR' },
      { fromCompId: 'ldr', fromPinId: 'pin2', toCompId: 'arduino', toPinId: 'a0', color: '#eab308', note: 'Điểm giữa cầu phân áp gửi tín hiệu analog về A0' },
      { fromCompId: 'ldr', fromPinId: 'pin2', toCompId: 'r_div', toPinId: 'pin1', color: '#eab308', note: 'Nối điểm giữa vào chân 1 điện trở 10kΩ' },
      { fromCompId: 'r_div', fromPinId: 'pin2', toCompId: 'bb', toPinId: 'top_minus_5', color: '#111827', note: 'Chân 2 điện trở phân áp nối ray GND' },

      // Street light LED
      { fromCompId: 'arduino', fromPinId: 'd13', toCompId: 'r_led', toPinId: 'pin1', color: '#f59e0b', note: 'Chân D13 xuất lệnh bật đèn đường khi trời tối' },
      { fromCompId: 'r_led', fromPinId: 'pin2', toCompId: 'led_street', toPinId: 'anode', color: '#f59e0b', note: 'Qua điện trở hạn dòng 220Ω vào Anode' },
      { fromCompId: 'led_street', fromPinId: 'cathode', toCompId: 'bb', toPinId: 'top_minus_10', color: '#111827', note: 'Cathode LED về ray GND' },
    ],
    steps: [
      'Bước 1: Cấp nguồn 5V và GND từ Arduino sang các thanh ray nguồn trên Breadboard.',
      'Bước 2: Nối chân 1 của quang trở LDR vào thanh ray 5V.',
      'Bước 3: Nối chân 2 của LDR vào cổng Analog A0 của Arduino và nối đồng thời vào chân 1 của điện trở 10kΩ.',
      'Bước 4: Nối chân 2 của điện trở 10kΩ về thanh ray GND để hoàn thiện cầu phân áp.',
      'Bước 5: Nối chân D13 qua điện trở hạn dòng 220Ω vào Anode của đèn LED, chân Cathode về ray GND.',
    ],
  },
  {
    id: 'esp32_dht11_oled',
    title: 'Trạm IoT ESP32 đo nhiệt ẩm DHT11 & hiển thị OLED SSD1306',
    category: 'IoT & ESP32',
    promptSample: 'Mạch trạm đo nhiệt độ độ ẩm không khí dùng ESP32, cảm biến DHT11 và màn hình OLED I2C',
    description: 'Hệ thống giám sát môi trường không dây thông minh: ESP32 đọc dữ liệu nhiệt độ độ ẩm từ DHT11 qua giao thức 1-wire và xuất thông số thời gian thực lên màn hình OLED qua giao thức I2C (SDA=D21, SCL=D22).',
    components: [
      { id: 'esp32', type: 'esp32', name: 'ESP32 DevKit V1', x: 80, y: 160 },
      { id: 'bb', type: 'breadboard', name: 'Breadboard Mini', x: 440, y: 160 },
      { id: 'dht', type: 'dht11', name: 'Cảm biến DHT11', x: 460, y: 45, properties: { temperature: 28, humidity: 65 } },
      { id: 'oled', type: 'oled_i2c', name: 'Màn hình OLED 0.96" I2C', x: 640, y: 45 },
    ],
    wires: [
      // ESP32 3.3V and GND rails
      { fromCompId: 'esp32', fromPinId: '3v3', toCompId: 'bb', toPinId: 'top_plus_0', color: '#dc2626', note: 'Cấp nguồn 3.3V từ ESP32 sang ray (+) Breadboard' },
      { fromCompId: 'esp32', fromPinId: 'gnd_l', toCompId: 'bb', toPinId: 'top_minus_0', color: '#111827', note: 'Nối GND ESP32 sang ray (-) Breadboard' },

      // DHT11
      { fromCompId: 'bb', fromPinId: 'top_plus_2', toCompId: 'dht', toPinId: 'vcc', color: '#dc2626', note: 'Cấp nguồn 3.3V cho DHT11' },
      { fromCompId: 'bb', fromPinId: 'top_minus_2', toCompId: 'dht', toPinId: 'gnd', color: '#111827', note: 'Nối đất GND cho DHT11' },
      { fromCompId: 'esp32', fromPinId: 'd4', toCompId: 'dht', toPinId: 'data', color: '#3b82f6', note: 'Chân tín hiệu DHT11 nối chân GPIO D4 ESP32' },

      // OLED SSD1306 (I2C: SCL=D22, SDA=D21)
      { fromCompId: 'bb', fromPinId: 'top_plus_8', toCompId: 'oled', toPinId: 'vcc', color: '#dc2626', note: 'Nguồn 3.3V cho OLED' },
      { fromCompId: 'bb', fromPinId: 'top_minus_8', toCompId: 'oled', toPinId: 'gnd', color: '#111827', note: 'Nối đất GND cho OLED' },
      { fromCompId: 'esp32', fromPinId: 'd22', toCompId: 'oled', toPinId: 'scl', color: '#eab308', note: 'ESP32 D22 (SCL) nối chân SCL OLED' },
      { fromCompId: 'esp32', fromPinId: 'd21', toCompId: 'oled', toPinId: 'sda', color: '#06b6d4', note: 'ESP32 D21 (SDA) nối chân SDA OLED' },
    ],
    steps: [
      'Bước 1: Cấp nguồn 3.3V và GND từ ESP32 sang các thanh ray nguồn trên Breadboard.',
      'Bước 2: Nối chân VCC và GND của cảm biến DHT11 vào thanh ray 3.3V và GND.',
      'Bước 3: Nối chân DATA của cảm biến DHT11 vào chân GPIO D4 trên ESP32.',
      'Bước 4: Nối chân VCC và GND của màn hình OLED vào thanh ray 3.3V và GND.',
      'Bước 5: Nối đường truyền I2C: Chân SCL màn hình vào D22, chân SDA màn hình vào D21 của ESP32.',
    ],
  },
  {
    id: 'mega_relay_lcd',
    title: 'Hệ thống điều khiển Relay công suất & LCD 1602 với Arduino Mega 2560',
    category: 'Tự động hóa',
    promptSample: 'Mạch điều khiển đóng ngắt relay 5V kèm màn hình LCD 1602 I2C với Arduino Mega',
    description: 'Hệ thống điều khiển công nghiệp: Arduino Mega 2560 điều khiển đóng cắt rơ-le 5V cách ly quang cho phụ tải lớn và hiển thị trạng thái hệ thống lên màn hình LCD 1602 qua giao tiếp I2C.',
    components: [
      { id: 'mega', type: 'arduino_mega', name: 'Arduino Mega 2560 R3', x: 50, y: 160 },
      { id: 'bb', type: 'breadboard', name: 'Breadboard Mini', x: 540, y: 160 },
      { id: 'relay', type: 'relay_module', name: 'Module Rơ-le 5V 1 Kênh', x: 560, y: 40 },
      { id: 'lcd', type: 'lcd_1602_i2c', name: 'Màn hình LCD 1602 I2C', x: 740, y: 40 },
    ],
    wires: [
      // Master 5V and GND from Mega
      { fromCompId: 'mega', fromPinId: '5v', toCompId: 'bb', toPinId: 'bot_plus_0', color: '#dc2626', note: 'Nguồn 5V từ Arduino Mega sang ray (+)' },
      { fromCompId: 'mega', fromPinId: 'gnd_bot1', toCompId: 'bb', toPinId: 'bot_minus_0', color: '#111827', note: 'Nối đất GND từ Mega sang ray (-)' },

      // Relay
      { fromCompId: 'bb', fromPinId: 'bot_plus_2', toCompId: 'relay', toPinId: 'vcc', color: '#dc2626', note: 'Cấp nguồn 5V cho module Relay' },
      { fromCompId: 'bb', fromPinId: 'bot_minus_2', toCompId: 'relay', toPinId: 'gnd', color: '#111827', note: 'Nối đất GND cho module Relay' },
      { fromCompId: 'mega', fromPinId: 'd7', toCompId: 'relay', toPinId: 'in', color: '#3b82f6', note: 'Chân Digital D7 xuất tín hiệu đóng/ngắt Relay' },

      // LCD 1602 (I2C: Mega Pin 20=SDA, Pin 21=SCL)
      { fromCompId: 'bb', fromPinId: 'bot_plus_8', toCompId: 'lcd', toPinId: 'vcc', color: '#dc2626', note: 'Nguồn 5V nuôi màn hình LCD' },
      { fromCompId: 'bb', fromPinId: 'bot_minus_8', toCompId: 'lcd', toPinId: 'gnd', color: '#111827', note: 'Nối đất GND cho màn hình LCD' },
      { fromCompId: 'mega', fromPinId: 'd20', toCompId: 'lcd', toPinId: 'sda', color: '#06b6d4', note: 'Chân D20 (SDA của Mega) nối chân SDA LCD' },
      { fromCompId: 'mega', fromPinId: 'd21', toCompId: 'lcd', toPinId: 'scl', color: '#eab308', note: 'Chân D21 (SCL của Mega) nối chân SCL LCD' },
    ],
    steps: [
      'Bước 1: Nối chân 5V và GND từ Arduino Mega 2560 sang các thanh ray nguồn trên Breadboard.',
      'Bước 2: Cấp nguồn 5V và GND vào chân VCC và GND của module Rơ-le (Relay).',
      'Bước 3: Nối chân tín hiệu IN của Relay vào chân Digital D7 trên Arduino Mega.',
      'Bước 4: Cấp nguồn 5V và GND vào chân VCC và GND của module I2C LCD 1602.',
      'Bước 5: Nối chuẩn giao tiếp I2C: Chân SDA LCD vào chân D20 của Mega, chân SCL LCD vào chân D21 của Mega.',
    ],
  },
];

export const AI_PROVIDERS_CONFIG: Record<AIProvider, AIProviderMetadata> = {
  gemini: {
    id: 'gemini',
    name: 'Google Gemini',
    badge: 'Gemini',
    color: '#3b82f6',
    defaultModel: 'gemini-1.5-flash',
    models: ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash'],
    keyPlaceholder: 'AIzaSy...',
    docUrl: 'https://aistudio.google.com/app/apikey',
    description: 'Mô hình từ Google tốc độ cao, tối ưu tạo sơ đồ mạch & hỗ trợ output JSON cấu trúc trực tiếp.',
  },
  openai: {
    id: 'openai',
    name: 'OpenAI',
    badge: 'OpenAI',
    color: '#10a37f',
    defaultModel: 'gpt-4o-mini',
    models: ['gpt-4o-mini', 'gpt-4o', 'o3-mini'],
    defaultBaseUrl: 'https://api.openai.com/v1',
    keyPlaceholder: 'sk-proj-...',
    docUrl: 'https://platform.openai.com/api-keys',
    description: 'Các mô hình GPT-4o tiêu chuẩn ngành với năng lực suy luận linh kiện & logic chân cắm chính xác.',
  },
  anthropic: {
    id: 'anthropic',
    name: 'Anthropic Claude',
    badge: 'Claude',
    color: '#d97706',
    defaultModel: 'claude-3-5-sonnet-20241022',
    models: ['claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022', 'claude-3-opus-20240229'],
    defaultBaseUrl: 'https://api.anthropic.com/v1',
    keyPlaceholder: 'sk-ant-api03-...',
    docUrl: 'https://console.anthropic.com/settings/keys',
    description: 'Claude 3.5 Sonnet - mô hình số 1 về kỹ thuật phần cứng, code Arduino và thiết kế hệ thống.',
  },
  deepseek: {
    id: 'deepseek',
    name: 'DeepSeek AI',
    badge: 'DeepSeek',
    color: '#6366f1',
    defaultModel: 'deepseek-chat',
    models: ['deepseek-chat', 'deepseek-reasoner'],
    defaultBaseUrl: 'https://api.deepseek.com',
    keyPlaceholder: 'sk-...',
    docUrl: 'https://platform.deepseek.com/api_keys',
    description: 'Mô hình DeepSeek V3 và R1 siêu việt, chi phí tối ưu, tương thích chuẩn OpenAI API.',
  },
  kimi: {
    id: 'kimi',
    name: 'Kimi (Moonshot AI)',
    badge: 'Kimi',
    color: '#06b6d4',
    defaultModel: 'moonshot-v1-8k',
    models: ['moonshot-v1-8k', 'moonshot-v1-32k', 'moonshot-v1-128k'],
    defaultBaseUrl: 'https://api.moonshot.cn/v1',
    keyPlaceholder: 'sk-...',
    docUrl: 'https://platform.moonshot.cn/console/api-keys',
    description: 'Mô hình ngữ cảnh siêu dài từ Moonshot AI, phản hồi mượt mà theo chuẩn OpenAI API.',
  },
  custom: {
    id: 'custom',
    name: 'Custom / Local (Ollama, OpenRouter)',
    badge: 'Custom',
    color: '#a855f7',
    defaultModel: 'llama3',
    models: ['llama3', 'mistral', 'qwen-2.5-coder', 'deepseek-r1:free'],
    defaultBaseUrl: 'http://localhost:11434/v1',
    keyPlaceholder: 'Nhập API key hoặc "ollama"',
    docUrl: 'https://ollama.com',
    description: 'Tự do kết nối máy chủ AI tự host (Ollama, LM Studio, vLLM) hoặc cổng OpenRouter/Groq.',
  },
};

export const DEFAULT_AI_SETTINGS: UserAISettings = {
  provider: 'gemini',
  apiKey: '',
  model: 'gemini-1.5-flash',
  customBaseUrl: '',
  storageMode: 'session',
};

// Bộ nhớ đệm trong RAM cho phiên làm việc hiện tại
let memoryCachedSettings: UserAISettings = { ...DEFAULT_AI_SETTINGS };

export function getMemoryCachedAISettings(): UserAISettings {
  return memoryCachedSettings;
}

export function setMemoryCachedAISettings(settings: UserAISettings): void {
  memoryCachedSettings = { ...settings };
}

export function loadStoredAISettings(): UserAISettings {
  // Trả về bộ nhớ đệm RAM nếu đã có
  if (memoryCachedSettings.apiKey) {
    return memoryCachedSettings;
  }

  try {
    const raw = sessionStorage.getItem('ai_circuit_secure_vault_v2') || 
                localStorage.getItem('ai_circuit_secure_vault_v2') ||
                localStorage.getItem('ai_circuit_studio_ai_settings');
    if (!raw) return DEFAULT_AI_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      provider: parsed.provider || 'gemini',
      apiKey: parsed.apiKey || memoryCachedSettings.apiKey || '',
      model: parsed.model || AI_PROVIDERS_CONFIG[parsed.provider as AIProvider]?.defaultModel || 'gemini-1.5-flash',
      customBaseUrl: parsed.customBaseUrl || '',
      storageMode: parsed.storageMode || 'session',
    };
  } catch {
    return DEFAULT_AI_SETTINGS;
  }
}

export async function loadStoredAISettingsAsync(): Promise<UserAISettings> {
  const settings = await loadSecureAISettings(DEFAULT_AI_SETTINGS);
  memoryCachedSettings = { ...settings };
  return settings;
}

export function saveStoredAISettings(settings: UserAISettings): void {
  memoryCachedSettings = { ...settings };
  saveSecureAISettings(settings).catch((err) => {
    console.warn('Failed to securely persist AI settings:', err);
  });
}

/**
 * Trích xuất an toàn đối tượng JSON từ chuỗi kết quả của các LLM
 * Xử lý triệt để markdown code blocks, text dẫn giải đầu cuối
 */
export function safeExtractJson(raw: string): any {
  if (!raw || typeof raw !== 'string') return null;
  let cleaned = raw.trim();
  // Xóa ```json và ```
  cleaned = cleaned.replace(/```(?:json)?\s*/gi, '').replace(/```\s*$/gi, '');
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }
  return JSON.parse(cleaned);
}

const HARDWARE_SYSTEM_PROMPT = `Bạn là kỹ sư trưởng thiết kế phần cứng mạch điện tử Arduino, ESP32 và hệ thống nhúng thông minh.
Nhiệm vụ của bạn là nhận yêu cầu của người dùng và trả về DUY NHẤT một chuỗi JSON hợp lệ (không kèm giải thích markdown ngoài JSON) theo cấu trúc sau:
{
  "id": "tên_mã_mạch",
  "title": "Tiêu đề mạch điện",
  "category": "Cơ bản hoặc Cảm biến hoặc IoT & ESP32 hoặc Tự động hóa",
  "promptSample": "yêu cầu gốc",
  "description": "Mô tả nguyên lý hoạt động ngắn gọn",
  "components": [
    { "id": "mcu_id", "type": "arduino_uno|arduino_mega|esp32|arduino_nano", "name": "Tên Bo mạch", "x": 80, "y": 180 },
    { "id": "bb", "type": "breadboard", "name": "Breadboard Mini", "x": 480, "y": 180 },
    { "id": "tên_id", "type": "loại linh kiện (led|resistor|pushbutton|potentiometer|ultrasonic|buzzer|servo|pir|ldr|lcd_1602_i2c|oled_i2c|relay_module|dht11|led_rgb|joystick)", "name": "Tên tiếng Việt", "x": 500, "y": 70, "properties": {} }
  ],
  "wires": [
    { "fromCompId": "mcu_id", "fromPinId": "gnd_top", "toCompId": "bb", "toPinId": "top_minus_0", "color": "#111827", "note": "Ghi chú nối dây" },
    { "fromCompId": "mcu_id", "fromPinId": "5v", "toCompId": "bb", "toPinId": "top_plus_0", "color": "#dc2626", "note": "Ghi chú nối nguồn" }
  ],
  "steps": [
    "Bước 1: Hướng dẫn cắm dây bằng tiếng Việt",
    "Bước 2: Hướng dẫn cắm dây tiếp theo"
  ],
  "changeSummary": [
    "+ Thêm linh kiện mới",
    "- Gỡ bỏ linh kiện nếu được yêu cầu",
    "~ Điều chỉnh thông số hoặc đổi bo"
  ]
}

CƠ CHẾ LẶP & CHỈNH SỬA MẠCH (ITERATIVE AGENT MODE):
- Khi nhận được [THÔNG TIN MẠCH HIỆN TẠI (CURRENT CIRCUIT BASE)], đây là yêu cầu chỉnh sửa, thêm hoặc bớt linh kiện/dây nối từ mạch đã có (giống như AI Coding Agent trong IDE sửa code):
  1. BẮT BUỘC giữ lại các linh kiện và dây nối cũ của mạch hiện tại, NGOẠI TRỪ những linh kiện người dùng yêu cầu gỡ bỏ, xóa hoặc thay thế.
  2. Bổ sung các linh kiện và dây nối mới theo đúng yêu cầu follow-up của người dùng.
  3. Bố trí tọa độ linh kiện mới hợp lý (x từ 450 đến 850, y từ 40 đến 250) tránh đè lên linh kiện cũ.
  4. Nếu người dùng yêu cầu 'gỡ' / 'xóa' / 'bỏ' / 'remove' linh kiện, loại bỏ linh kiện đó khỏi components và gỡ các dây nối tương ứng khỏi wires.
  5. Cung cấp mảng changeSummary: danh sách ngắn gọn các hành động cụ thể đã làm trong lượt này (ví dụ: ["+ Thêm Còi Buzzer tại chân D12", "- Gỡ bỏ Cảm biến siêu âm", "~ Đổi LED Đỏ thành LED Xanh lá"]).

DANH SÁCH LINH KIỆN & CHÂN HỖ TRỢ:
1. Bo mạch vi điều khiển (chọn 1 bo phù hợp với yêu cầu của người dùng):
   - arduino_uno: chân nguồn (5v, 3v3, gnd_top, gnd_bot1, gnd_bot2, vin), digital (d0-d13), analog (a0-a5). Chân I2C là a4 (SDA), a5 (SCL).
   - arduino_mega: chân nguồn (5v, 3v3, gnd_top, gnd_bot1, gnd_bot2, vin), digital (d0-d53), analog (a0-a15). Chân I2C là d20 (SDA), d21 (SCL).
   - esp32: chân nguồn (3v3, vin, gnd_l, gnd_r), digital/analog (d2, d4, d5, d12, d13, d14, d15, d18, d19, d21, d22, d23, d25, d26, d27, d32, d33, d34, d35, vp, vn, tx0, rx0). Chân I2C là d21 (SDA), d22 (SCL).
   - arduino_nano: chân nguồn (5v, 3v3, gnd_l, gnd_r, vin), digital (d2-d13, d0_rx, d1_tx), analog (a0-a7). Chân I2C là a4, a5.

2. Bo cắm & Module hiển thị / ngoại vi:
   - breadboard: ray nguồn top_plus_0..14, top_minus_0..14, bot_plus_0..14, bot_minus_0..14.
   - lcd_1602_i2c: gnd, vcc, sda, scl.
   - oled_i2c: gnd, vcc, scl, sda.
   - relay_module: vcc, gnd, in, no, com, nc.
   - dht11: vcc, data, gnd.
   - joystick: gnd, vcc, vrx, vry, sw.
   - led: anode, cathode (properties: { color: "red"|"green"|"yellow"|"blue" }).
   - led_rgb: red, cathode, green, blue.
   - resistor: pin1, pin2 (properties: { resistance: 220 hoặc 10000 }).
   - pushbutton: term1a, term1b, term2a, term2b.
   - potentiometer: vcc, wiper, gnd.
   - ultrasonic: vcc, trig, echo, gnd.
   - buzzer: pos, neg.
   - servo: sig, vcc, gnd.
   - pir: vcc, out, gnd.
   - ldr: pin1, pin2.

QUY TẮC NỐI DÂY:
1. Luôn cấp nguồn VCC và GND từ bo MCU vào Breadboard trước khi phân nhánh sang các cảm biến/module.
2. ESP32 dùng mức điện áp 3.3V (chân 3v3); Arduino dùng 5V (chân 5v).
3. Đèn LED thông thường bắt buộc đi qua điện trở 220Ω vào Anode để chống quá dòng.
4. Mã màu dây: Đỏ (#dc2626) cho VCC, Đen (#111827) cho GND, Vàng (#eab308)/Xanh dương (#3b82f6)/Xanh lá (#22c55e)/Tím (#a855f7) cho tín hiệu.
5. Chỉ trả về chuỗi JSON thuần tuý.`;

/**
 * Định dạng mạch hiện tại thành ngữ cảnh cho Agent
 */
export function formatBaseCircuitForAgent(base: { components: Array<any>; wires: Array<any>; title?: string }): string {
  if (!base.components || base.components.length === 0) return '';
  const mcu = base.components.find(c => c.type.startsWith('arduino_') || c.type === 'esp32');
  const others = base.components.filter(c => c.id !== mcu?.id && c.type !== 'breadboard');
  const compLines = others.map(c => `- ${c.name} (type: ${c.type}, id: ${c.id})${c.properties ? ` ${JSON.stringify(c.properties)}` : ''}`).join('\n');
  const wireLines = base.wires.map((w, i) => `${i + 1}. [${w.fromCompId}] pin ${w.fromPinId} -> [${w.toCompId}] pin ${w.toPinId} (màu: ${w.color})`).join('\n');

  return `[THÔNG TIN MẠCH HIỆN TẠI (CURRENT CIRCUIT BASE)]:
- Tiêu đề mạch hiện tại: ${base.title || 'Mạch đang thiết kế'}
- Bo điều khiển: ${mcu ? `${mcu.name} (${mcu.type})` : 'Chưa có'}
- Các linh kiện hiện có (${base.components.length} linh kiện):
${compLines || '(Chưa có linh kiện ngoại vi)'}
- Danh sách dây nối hiện có (${base.wires.length} dây):
${wireLines || '(Chưa có dây)'}
[HƯỚNG DẪN AGENT]: Hãy GIỮ LẠI toàn bộ mạch hiện tại này và thực hiện các chỉnh sửa/bổ sung/loại bỏ theo yêu cầu mới dưới đây. Trả về toàn bộ mạch hoàn chỉnh sau khi đã sửa đổi cùng với danh sách mảng changeSummary.`;
}

/**
 * Gọi Google Gemini Live API
 */
async function callGeminiLive(prompt: string, apiKey: string, model: string, baseCircuitContext?: string): Promise<AISchematicRecipe | null> {
  const modelName = model || 'gemini-1.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent`;
  const promptBody = baseCircuitContext
    ? `${baseCircuitContext}\n\n[YÊU CẦU CHỈNH SỬA / THÊM / BỚT TỪ NGƯỜI DÙNG]:\n${prompt}`
    : `Yêu cầu dự án người dùng: ${prompt}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: `${HARDWARE_SYSTEM_PROMPT}\n\n${promptBody}` }],
        },
      ],
      generationConfig: { responseMimeType: 'application/json' },
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Gemini API lỗi HTTP ${res.status}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) return null;
  return safeExtractJson(text);
}

/**
 * Gọi Anthropic Claude Live API
 */
async function callAnthropicLive(prompt: string, apiKey: string, model: string, baseUrl?: string, baseCircuitContext?: string): Promise<AISchematicRecipe | null> {
  const modelName = model || 'claude-3-5-sonnet-20241022';
  const base = (baseUrl || 'https://api.anthropic.com/v1').replace(/\/+$/, '');
  const url = `${base}/messages`;
  const promptBody = baseCircuitContext
    ? `${baseCircuitContext}\n\n[YÊU CẦU CHỈNH SỬA / THÊM / BỚT TỪ NGƯỜI DÙNG]:\n${prompt}`
    : `Yêu cầu dự án người dùng: ${prompt}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: modelName,
      max_tokens: 4096,
      system: HARDWARE_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: promptBody }],
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Claude API lỗi HTTP ${res.status}`);
  }

  const data = await res.json();
  const text = data.content?.[0]?.text;
  if (!text) return null;
  return safeExtractJson(text);
}

/**
 * Gọi OpenAI-Compatible API (OpenAI, DeepSeek, Kimi, Ollama, OpenRouter, Custom)
 */
async function callOpenAICompatibleLive(
  prompt: string,
  apiKey: string,
  model: string,
  baseUrl: string,
  baseCircuitContext?: string
): Promise<AISchematicRecipe | null> {
  let endpoint = baseUrl.trim().replace(/\/+$/, '');
  if (!endpoint.endsWith('/chat/completions')) {
    endpoint = `${endpoint}/chat/completions`;
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  const promptBody = baseCircuitContext
    ? `${baseCircuitContext}\n\n[YÊU CẦU CHỈNH SỬA / THÊM / BỚT TỪ NGƯỜI DÙNG]:\n${prompt}`
    : `Yêu cầu dự án người dùng: ${prompt}`;

  const payload: any = {
    model: model,
    max_tokens: 4096,
    messages: [
      { role: 'system', content: HARDWARE_SYSTEM_PROMPT },
      { role: 'user', content: promptBody },
    ],
  };

  // Chỉ bật json_object nếu không phải local ollama hoặc thử gửi
  try {
    payload.response_format = { type: 'json_object' };
  } catch {
    // ignore
  }

  let res = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  // Nếu lỗi do response_format không hỗ trợ (ví dụ trên một số custom server), thử lại không có response_format
  if (!res.ok && res.status === 400 && payload.response_format) {
    delete payload.response_format;
    res = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
  }

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `API lỗi HTTP ${res.status}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) return null;
  return safeExtractJson(text);
}

/**
 * Dispatcher gọi LLM trực tiếp theo cấu hình nhà cung cấp của người dùng
 */
export async function callLiveLLM(
  prompt: string,
  settings: UserAISettings,
  baseCircuitContext?: string
): Promise<AISchematicRecipe | null> {
  const { provider, apiKey, model, customBaseUrl } = settings;

  switch (provider) {
    case 'gemini':
      return callGeminiLive(prompt, apiKey, model, baseCircuitContext);
    case 'anthropic':
      return callAnthropicLive(prompt, apiKey, model, customBaseUrl, baseCircuitContext);
    case 'openai':
      return callOpenAICompatibleLive(prompt, apiKey, model, customBaseUrl || 'https://api.openai.com/v1', baseCircuitContext);
    case 'deepseek':
      return callOpenAICompatibleLive(prompt, apiKey, model, customBaseUrl || 'https://api.deepseek.com', baseCircuitContext);
    case 'kimi':
      return callOpenAICompatibleLive(prompt, apiKey, model, customBaseUrl || 'https://api.moonshot.cn/v1', baseCircuitContext);
    case 'custom':
      return callOpenAICompatibleLive(
        prompt,
        apiKey,
        model,
        customBaseUrl || 'http://localhost:11434/v1',
        baseCircuitContext
      );
    default:
      return callGeminiLive(prompt, apiKey, model, baseCircuitContext);
  }
}

/**
 * Kiểm tra kết nối nhanh (Ping Test) đến nhà cung cấp AI đã chọn
 */
export async function testAIConnection(
  settings: UserAISettings
): Promise<{ success: boolean; message: string; latencyMs: number }> {
  const startTime = Date.now();
  const testPrompt = 'Ping test! Vui lòng trả về chuỗi JSON chính xác: {"status": "ok", "message": "connected"}';

  try {
    const { provider, apiKey, model, customBaseUrl } = settings;
    if (!apiKey && provider !== 'custom') {
      return { success: false, message: 'Vui lòng nhập API Key trước khi kiểm tra!', latencyMs: 0 };
    }

    if (provider === 'gemini') {
      const modelName = model || 'gemini-1.5-flash';
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: testPrompt }] }],
          generationConfig: { maxOutputTokens: 50 },
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return { success: false, message: err.error?.message || `Lỗi HTTP ${res.status}`, latencyMs: Date.now() - startTime };
      }
    } else if (provider === 'anthropic') {
      const base = (customBaseUrl || 'https://api.anthropic.com/v1').replace(/\/+$/, '');
      const res = await fetch(`${base}/messages`, {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model || 'claude-3-5-sonnet-20241022',
          max_tokens: 50,
          messages: [{ role: 'user', content: testPrompt }],
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return { success: false, message: err.error?.message || `Lỗi HTTP ${res.status}`, latencyMs: Date.now() - startTime };
      }
    } else {
      // OpenAI-compatible providers: OpenAI, DeepSeek, Kimi, Custom
      let defaultBase = 'https://api.openai.com/v1';
      if (provider === 'deepseek') defaultBase = 'https://api.deepseek.com';
      if (provider === 'kimi') defaultBase = 'https://api.moonshot.cn/v1';
      if (provider === 'custom') defaultBase = 'http://localhost:11434/v1';

      let endpoint = (customBaseUrl || defaultBase).trim().replace(/\/+$/, '');
      if (!endpoint.endsWith('/chat/completions')) endpoint = `${endpoint}/chat/completions`;

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: model || 'gpt-4o-mini',
          messages: [{ role: 'user', content: testPrompt }],
          max_tokens: 30,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return { success: false, message: err.error?.message || `Lỗi HTTP ${res.status}`, latencyMs: Date.now() - startTime };
      }
    }

    const latencyMs = Date.now() - startTime;
    return {
      success: true,
      message: `Kết nối thành công tới ${AI_PROVIDERS_CONFIG[provider]?.name} (${model}) trong ${latencyMs}ms!`,
      latencyMs,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Không thể kết nối (Kiểm tra lại mạng hoặc CORS)',
      latencyMs: Date.now() - startTime,
    };
  }
}

export async function synthesizeCircuitFromPrompt(
  prompt: string,
  settingsOrKey?: UserAISettings | string,
  baseCircuit?: { components: Array<any>; wires: Array<any>; title?: string }
): Promise<AISchematicRecipe> {
  // Chuyển đổi tham số cài đặt
  let settings: UserAISettings;
  if (!settingsOrKey) {
    settings = loadStoredAISettings();
  } else if (typeof settingsOrKey === 'string') {
    settings = {
      provider: settingsOrKey.startsWith('AIza') ? 'gemini' : 'openai',
      apiKey: settingsOrKey,
      model: settingsOrKey.startsWith('AIza') ? 'gemini-1.5-flash' : 'gpt-4o-mini',
    };
  } else {
    settings = settingsOrKey;
  }

  const hasBaseCircuit = Boolean(baseCircuit && baseCircuit.components && baseCircuit.components.length > 0);
  const baseCircuitContext = hasBaseCircuit ? formatBaseCircuitForAgent(baseCircuit!) : undefined;

  // 1. Luôn ưu tiên gọi Live LLM trực tiếp theo API cấu hình của người dùng
  if (settings.apiKey || settings.provider === 'custom') {
    try {
      const result = await callLiveLLM(prompt, settings, baseCircuitContext);
      if (result && Array.isArray(result.components) && Array.isArray(result.wires)) {
        // Tự động suy luận changeSummary nếu model không trả về hoặc trả về rỗng
        let changeSummary = result.changeSummary;
        if (!changeSummary || changeSummary.length === 0) {
          if (hasBaseCircuit) {
            const oldIds = new Set(baseCircuit!.components.map((c: any) => c.id));
            const newComps = result.components.filter(c => !oldIds.has(c.id));
            const removedComps = baseCircuit!.components.filter((c: any) => !result.components.some(nc => nc.id === c.id));
            const diffs: string[] = [];
            newComps.forEach(c => diffs.push(`+ Thêm ${c.name}`));
            removedComps.forEach(c => diffs.push(`- Gỡ bỏ ${c.name}`));
            if (diffs.length === 0) {
              diffs.push(`~ Cập nhật sơ đồ nối dây và thông số mạch`);
            }
            changeSummary = diffs;
          } else {
            changeSummary = result.components.map(c => `+ Khởi tạo ${c.name}`).slice(0, 5);
          }
        }

        return {
          id: result.id || `ai_gen_${Date.now()}`,
          title: result.title || (hasBaseCircuit ? `${baseCircuit?.title || 'Mạch'} (Cập nhật)` : `Sơ đồ AI: ${prompt.slice(0, 40)}`),
          category: result.category || `Tạo bởi ${AI_PROVIDERS_CONFIG[settings.provider]?.badge || 'AI'}`,
          promptSample: prompt,
          description: result.description || `Sơ đồ mạch sinh tự động từ mô hình ${settings.model}.`,
          components: result.components,
          wires: result.wires,
          steps: result.steps || ['Cắm các linh kiện theo sơ đồ hướng dẫn.'],
          changeSummary,
        };
      }
    } catch (err) {
      console.warn(`Live LLM (${settings.provider}) synthesis failed, falling back to smart heuristic:`, err);
    }
  }

  // 2. Fallback sang thuật toán Heuristic thông minh nếu chưa có API Key hoặc mạng lỗi
  if (hasBaseCircuit) {
    return modifyCircuitHeuristically(prompt, baseCircuit!);
  }
  return generateSmartHeuristicRecipe(prompt);
}

/**
 * Thuật toán chỉnh sửa, thêm, bớt linh kiện Heuristic khi người dùng tiếp tục prompt (multi-turn Agent)
 */
export function modifyCircuitHeuristically(
  prompt: string,
  baseCircuit: { components: Array<any>; wires: Array<any>; title?: string }
): AISchematicRecipe {
  const norm = prompt.toLowerCase();
  let components = JSON.parse(JSON.stringify(baseCircuit.components || [])) as AISchematicRecipe['components'];
  let wires = JSON.parse(JSON.stringify(baseCircuit.wires || [])) as AISchematicRecipe['wires'];
  const changeSummary: string[] = [];
  const steps: string[] = [];

  if (components.length === 0) {
    return generateSmartHeuristicRecipe(prompt);
  }

  // 1. Kiểm tra chuyển đổi loại vi điều khiển (MCU Swap)
  let mcu = components.find(c => c.type.startsWith('arduino_') || c.type === 'esp32');
  const isEsp32Target = norm.includes('esp32') || norm.includes('esp 32') || norm.includes('nodemcu');
  const isMegaTarget = norm.includes('mega') || norm.includes('2560');
  const isUnoTarget = norm.includes('uno');
  const isNanoTarget = norm.includes('nano');

  if (mcu) {
    if (isEsp32Target && mcu.type !== 'esp32') {
      mcu.type = 'esp32';
      mcu.name = 'ESP32 DevKit V1';
      wires = wires.filter(w => !(w.fromCompId === mcu!.id && (w.fromPinId === '5v' || w.fromPinId === '3v3' || w.fromPinId.startsWith('gnd'))));
      wires.unshift(
        { fromCompId: mcu.id, fromPinId: '3v3', toCompId: 'bb', toPinId: 'top_plus_0', color: '#dc2626', note: 'ESP32 3.3V cấp nguồn rail (+)' },
        { fromCompId: mcu.id, fromPinId: 'gnd_l', toCompId: 'bb', toPinId: 'top_minus_0', color: '#111827', note: 'ESP32 GND nối ray (-)' }
      );
      changeSummary.push('~ Chuyển đổi bo vi điều khiển sang ESP32 DevKit V1 (chuẩn logic 3.3V)');
    } else if (isMegaTarget && mcu.type !== 'arduino_mega') {
      mcu.type = 'arduino_mega';
      mcu.name = 'Arduino Mega 2560 R3';
      wires = wires.filter(w => !(w.fromCompId === mcu!.id && (w.fromPinId === '5v' || w.fromPinId === '3v3' || w.fromPinId.startsWith('gnd'))));
      wires.unshift(
        { fromCompId: mcu.id, fromPinId: '5v', toCompId: 'bb', toPinId: 'top_plus_0', color: '#dc2626', note: 'Arduino Mega 5V cấp nguồn rail (+)' },
        { fromCompId: mcu.id, fromPinId: 'gnd_top', toCompId: 'bb', toPinId: 'top_minus_0', color: '#111827', note: 'Arduino Mega GND nối ray (-)' }
      );
      changeSummary.push('~ Chuyển đổi bo vi điều khiển sang Arduino Mega 2560 R3 (54 chân I/O)');
    } else if (isUnoTarget && mcu.type !== 'arduino_uno') {
      mcu.type = 'arduino_uno';
      mcu.name = 'Arduino Uno R3';
      wires = wires.filter(w => !(w.fromCompId === mcu!.id && (w.fromPinId === '5v' || w.fromPinId === '3v3' || w.fromPinId.startsWith('gnd'))));
      wires.unshift(
        { fromCompId: mcu.id, fromPinId: '5v', toCompId: 'bb', toPinId: 'top_plus_0', color: '#dc2626', note: 'Arduino Uno 5V cấp nguồn rail (+)' },
        { fromCompId: mcu.id, fromPinId: 'gnd_top', toCompId: 'bb', toPinId: 'top_minus_0', color: '#111827', note: 'Arduino Uno GND nối ray (-)' }
      );
      changeSummary.push('~ Chuyển đổi bo vi điều khiển về Arduino Uno R3');
    } else if (isNanoTarget && mcu.type !== 'arduino_nano') {
      mcu.type = 'arduino_nano';
      mcu.name = 'Arduino Nano V3';
      wires = wires.filter(w => !(w.fromCompId === mcu!.id && (w.fromPinId === '5v' || w.fromPinId === '3v3' || w.fromPinId.startsWith('gnd'))));
      wires.unshift(
        { fromCompId: mcu.id, fromPinId: '5v', toCompId: 'bb', toPinId: 'top_plus_0', color: '#dc2626', note: 'Arduino Nano 5V cấp nguồn rail (+)' },
        { fromCompId: mcu.id, fromPinId: 'gnd_l', toCompId: 'bb', toPinId: 'top_minus_0', color: '#111827', note: 'Arduino Nano GND nối ray (-)' }
      );
      changeSummary.push('~ Chuyển đổi bo vi điều khiển sang Arduino Nano V3 nhỏ gọn');
    }
  }

  const isEsp32 = mcu?.type === 'esp32';
  const isMega = mcu?.type === 'arduino_mega';

  // 2. Xử lý lệnh gỡ bỏ / xóa linh kiện (gỡ, xóa, bỏ, loại, remove, delete)
  const isRemove = norm.includes('gỡ') || norm.includes('xóa') || norm.includes('xoa') || norm.includes('bỏ') || norm.includes('loại') || norm.includes('remove') || norm.includes('delete');
  if (isRemove) {
    if (norm.includes('buzzer') || norm.includes('còi') || norm.includes('kêu')) {
      const removed = components.filter(c => c.type === 'buzzer');
      if (removed.length > 0) {
        const ids = new Set(removed.map(r => r.id));
        components = components.filter(c => !ids.has(c.id));
        wires = wires.filter(w => !ids.has(w.fromCompId) && !ids.has(w.toCompId));
        changeSummary.push(`- Gỡ bỏ ${removed.map(r => r.name).join(', ')} và các dây nối`);
      }
    }
    if (norm.includes('led') || norm.includes('đèn')) {
      let toRemove = components.filter(c => c.type === 'led');
      if (norm.includes('đỏ') || norm.includes('red')) {
        toRemove = toRemove.filter(c => c.properties?.color === 'red' || c.name.toLowerCase().includes('đỏ'));
      } else if (norm.includes('vàng') || norm.includes('yellow')) {
        toRemove = toRemove.filter(c => c.properties?.color === 'yellow' || c.name.toLowerCase().includes('vàng'));
      } else if (norm.includes('xanh lá') || norm.includes('green')) {
        toRemove = toRemove.filter(c => c.properties?.color === 'green' || c.name.toLowerCase().includes('xanh lá'));
      } else if (norm.includes('xanh dương') || norm.includes('blue')) {
        toRemove = toRemove.filter(c => c.properties?.color === 'blue' || c.name.toLowerCase().includes('xanh dương'));
      }
      if (toRemove.length > 0) {
        const ids = new Set(toRemove.map(r => r.id));
        components = components.filter(c => !ids.has(c.id));
        wires = wires.filter(w => !ids.has(w.fromCompId) && !ids.has(w.toCompId));
        changeSummary.push(`- Gỡ bỏ ${toRemove.map(r => r.name).join(', ')} và dây nối`);
      }
    }
    if (norm.includes('oled') || norm.includes('ssd1306')) {
      const removed = components.filter(c => c.type === 'oled_i2c');
      if (removed.length > 0) {
        const ids = new Set(removed.map(r => r.id));
        components = components.filter(c => !ids.has(c.id));
        wires = wires.filter(w => !ids.has(w.fromCompId) && !ids.has(w.toCompId));
        changeSummary.push('- Gỡ bỏ Màn hình OLED I2C');
      }
    }
    if (norm.includes('lcd') || norm.includes('1602')) {
      const removed = components.filter(c => c.type === 'lcd_1602_i2c');
      if (removed.length > 0) {
        const ids = new Set(removed.map(r => r.id));
        components = components.filter(c => !ids.has(c.id));
        wires = wires.filter(w => !ids.has(w.fromCompId) && !ids.has(w.toCompId));
        changeSummary.push('- Gỡ bỏ Màn hình LCD 1602 I2C');
      }
    }
    if (norm.includes('dht') || norm.includes('nhiệt độ')) {
      const removed = components.filter(c => c.type === 'dht11');
      if (removed.length > 0) {
        const ids = new Set(removed.map(r => r.id));
        components = components.filter(c => !ids.has(c.id));
        wires = wires.filter(w => !ids.has(w.fromCompId) && !ids.has(w.toCompId));
        changeSummary.push('- Gỡ bỏ Cảm biến nhiệt độ DHT11');
      }
    }
    if (norm.includes('siêu âm') || norm.includes('khoảng cách') || norm.includes('ultrasonic')) {
      const removed = components.filter(c => c.type === 'ultrasonic');
      if (removed.length > 0) {
        const ids = new Set(removed.map(r => r.id));
        components = components.filter(c => !ids.has(c.id));
        wires = wires.filter(w => !ids.has(w.fromCompId) && !ids.has(w.toCompId));
        changeSummary.push('- Gỡ bỏ Cảm biến siêu âm HC-SR04');
      }
    }
    if (norm.includes('nút') || norm.includes('button')) {
      const removed = components.filter(c => c.type === 'pushbutton');
      if (removed.length > 0) {
        const ids = new Set(removed.map(r => r.id));
        components = components.filter(c => !ids.has(c.id));
        wires = wires.filter(w => !ids.has(w.fromCompId) && !ids.has(w.toCompId));
        changeSummary.push('- Gỡ bỏ Nút bấm điều khiển');
      }
    }
    if (norm.includes('relay') || norm.includes('rơ le')) {
      const removed = components.filter(c => c.type === 'relay_module');
      if (removed.length > 0) {
        const ids = new Set(removed.map(r => r.id));
        components = components.filter(c => !ids.has(c.id));
        wires = wires.filter(w => !ids.has(w.fromCompId) && !ids.has(w.toCompId));
        changeSummary.push('- Gỡ bỏ Module Rơ-le');
      }
    }
  }

  // 3. Xử lý đổi màu / thuộc tính (đổi màu, thay màu)
  if ((norm.includes('đổi') || norm.includes('thay') || norm.includes('chuyển')) && (norm.includes('màu') || norm.includes('led'))) {
    const leds = components.filter(c => c.type === 'led');
    if (leds.length > 0) {
      if (norm.includes('xanh lá') || norm.includes('green')) {
        leds[0].properties = { ...leds[0].properties, color: 'green' };
        leds[0].name = 'Đèn LED Xanh lá';
        changeSummary.push('~ Đổi màu đèn LED sang Xanh lá');
      } else if (norm.includes('xanh dương') || norm.includes('blue') || norm.includes('lam')) {
        leds[0].properties = { ...leds[0].properties, color: 'blue' };
        leds[0].name = 'Đèn LED Xanh dương';
        changeSummary.push('~ Đổi màu đèn LED sang Xanh dương');
      } else if (norm.includes('vàng') || norm.includes('yellow')) {
        leds[0].properties = { ...leds[0].properties, color: 'yellow' };
        leds[0].name = 'Đèn LED Vàng';
        changeSummary.push('~ Đổi màu đèn LED sang Vàng');
      } else if (norm.includes('đỏ') || norm.includes('red')) {
        leds[0].properties = { ...leds[0].properties, color: 'red' };
        leds[0].name = 'Đèn LED Đỏ';
        changeSummary.push('~ Đổi màu đèn LED sang Đỏ');
      }
    }
  }

  // Tính toán tọa độ đặt linh kiện mới không bị đè
  const existingXs = components.map(c => c.x).filter(x => typeof x === 'number');
  let nextX = existingXs.length > 0 ? Math.max(...existingXs) + 120 : 500;
  if (nextX > 900) nextX = 520;

  const mcuId = mcu ? mcu.id : 'mcu';

  // 4. Xử lý Thêm / Bổ sung linh kiện
  const isAdd = !isRemove || norm.includes('thêm') || norm.includes('bổ sung') || norm.includes('gắn') || norm.includes('kèm') || norm.includes('cùng với');

  if (isAdd) {
    // A. Thêm còi buzzer
    if ((norm.includes('còi') || norm.includes('buzzer') || norm.includes('chuông') || norm.includes('báo động')) && !components.some(c => c.type === 'buzzer')) {
      const buzzerId = `buzzer_${Date.now()}`;
      components.push({
        id: buzzerId,
        type: 'buzzer',
        name: 'Còi chíp Piezo Buzzer',
        x: nextX,
        y: 50,
      });
      const buzzerPin = isEsp32 ? 'd13' : (isMega ? 'd8' : 'd8');
      wires.push(
        { fromCompId: mcuId, fromPinId: buzzerPin, toCompId: buzzerId, toPinId: 'pos', color: '#f59e0b', note: `Chân ${buzzerPin.toUpperCase()} kích hoạt còi` },
        { fromCompId: buzzerId, fromPinId: 'neg', toCompId: 'bb', toPinId: 'top_minus_5', color: '#111827', note: 'Chân âm còi nối GND' }
      );
      changeSummary.push(`+ Thêm Còi Buzzer Piezo tại chân ${buzzerPin.toUpperCase()} và nối đất GND`);
      nextX += 110;
    }

    // B. Thêm nút bấm
    if ((norm.includes('nút') || norm.includes('button') || norm.includes('công tắc')) && !components.some(c => c.type === 'pushbutton')) {
      const btnId = `btn_${Date.now()}`;
      const rPullId = `r_pull_${Date.now()}`;
      components.push(
        { id: btnId, type: 'pushbutton', name: 'Nút bấm 4 chân', x: nextX, y: 65 },
        { id: rPullId, type: 'resistor', name: 'Điện trở kéo xuống 10kΩ', x: nextX + 80, y: 35, properties: { resistance: 10000 } }
      );
      const btnPin = isEsp32 ? 'd4' : 'd2';
      wires.push(
        { fromCompId: 'bb', fromPinId: 'top_plus_1', toCompId: btnId, toPinId: 'term1a', color: '#dc2626', note: 'Nguồn 5V/3.3V cấp vào nút bấm' },
        { fromCompId: btnId, fromPinId: 'term2a', toCompId: mcuId, toPinId: btnPin, color: '#3b82f6', note: `Chân tín hiệu nút bấm về ${btnPin.toUpperCase()}` },
        { fromCompId: btnId, fromPinId: 'term2b', toCompId: rPullId, toPinId: 'pin1', color: '#3b82f6', note: 'Nối qua trở kéo xuống 10kΩ' },
        { fromCompId: rPullId, fromPinId: 'pin2', toCompId: 'bb', toPinId: 'top_minus_6', color: '#111827', note: 'Đầu kia trở kéo xuống về GND' }
      );
      changeSummary.push(`+ Thêm Nút bấm 4 chân tại chân ${btnPin.toUpperCase()} (kèm điện trở kéo xuống 10kΩ)`);
      nextX += 130;
    }

    // C. Thêm đèn LED
    if (norm.includes('thêm led') || norm.includes('thêm đèn') || norm.includes('gắn led') || norm.includes('gắn đèn')) {
      const ledId = `led_${Date.now()}`;
      const rId = `r_led_${Date.now()}`;
      let ledColor = 'green';
      let ledName = 'Đèn LED Xanh lá';
      if (norm.includes('vàng') || norm.includes('yellow')) {
        ledColor = 'yellow';
        ledName = 'Đèn LED Vàng';
      } else if (norm.includes('đỏ') || norm.includes('red')) {
        ledColor = 'red';
        ledName = 'Đèn LED Đỏ';
      } else if (norm.includes('xanh dương') || norm.includes('blue')) {
        ledColor = 'blue';
        ledName = 'Đèn LED Xanh dương';
      }

      components.push(
        { id: ledId, type: 'led', name: ledName, x: nextX, y: 55, properties: { color: ledColor } },
        { id: rId, type: 'resistor', name: 'Điện trở 220Ω', x: nextX - 10, y: 120, properties: { resistance: 220 } }
      );
      const ledPin = isEsp32 ? 'd14' : (isMega ? 'd12' : 'd12');
      wires.push(
        { fromCompId: mcuId, fromPinId: ledPin, toCompId: rId, toPinId: 'pin1', color: '#22c55e', note: `Chân ${ledPin.toUpperCase()} điều khiển LED` },
        { fromCompId: rId, fromPinId: 'pin2', toCompId: ledId, toPinId: 'anode', color: '#22c55e', note: 'Hạn dòng 220Ω vào Anode' },
        { fromCompId: ledId, fromPinId: 'cathode', toCompId: 'bb', toPinId: 'top_minus_7', color: '#111827', note: 'Cathode LED về GND' }
      );
      changeSummary.push(`+ Thêm ${ledName} tại chân ${ledPin.toUpperCase()} qua điện trở hạn dòng 220Ω`);
      nextX += 110;
    }

    // D. Thêm OLED
    if ((norm.includes('oled') || norm.includes('ssd1306')) && !components.some(c => c.type === 'oled_i2c')) {
      const oledId = `oled_${Date.now()}`;
      components.push({ id: oledId, type: 'oled_i2c', name: 'Màn hình OLED 0.96" I2C', x: nextX, y: 45 });
      wires.push(
        { fromCompId: 'bb', fromPinId: 'top_plus_4', toCompId: oledId, toPinId: 'vcc', color: '#dc2626', note: 'Nguồn nuôi OLED' },
        { fromCompId: 'bb', fromPinId: 'top_minus_4', toCompId: oledId, toPinId: 'gnd', color: '#111827', note: 'GND OLED' },
        { fromCompId: mcuId, fromPinId: isEsp32 ? 'd22' : (isMega ? 'd21' : 'a5'), toCompId: oledId, toPinId: 'scl', color: '#eab308', note: 'I2C SCL' },
        { fromCompId: mcuId, fromPinId: isEsp32 ? 'd21' : (isMega ? 'd20' : 'a4'), toCompId: oledId, toPinId: 'sda', color: '#06b6d4', note: 'I2C SDA' }
      );
      changeSummary.push('+ Thêm Màn hình OLED 0.96" I2C qua giao tiếp SDA/SCL');
      nextX += 140;
    }

    // E. Thêm LCD 1602
    if ((norm.includes('lcd') || norm.includes('1602')) && !components.some(c => c.type === 'lcd_1602_i2c')) {
      const lcdId = `lcd_${Date.now()}`;
      components.push({ id: lcdId, type: 'lcd_1602_i2c', name: 'Màn hình LCD 1602 I2C', x: nextX, y: 45 });
      wires.push(
        { fromCompId: 'bb', fromPinId: 'top_plus_6', toCompId: lcdId, toPinId: 'vcc', color: '#dc2626', note: 'Nguồn LCD' },
        { fromCompId: 'bb', fromPinId: 'top_minus_6', toCompId: lcdId, toPinId: 'gnd', color: '#111827', note: 'GND LCD' },
        { fromCompId: mcuId, fromPinId: isEsp32 ? 'd21' : (isMega ? 'd20' : 'a4'), toCompId: lcdId, toPinId: 'sda', color: '#06b6d4', note: 'I2C SDA' },
        { fromCompId: mcuId, fromPinId: isEsp32 ? 'd22' : (isMega ? 'd21' : 'a5'), toCompId: lcdId, toPinId: 'scl', color: '#eab308', note: 'I2C SCL' }
      );
      changeSummary.push('+ Thêm Màn hình LCD 1602 I2C');
      nextX += 190;
    }

    // F. Thêm DHT11
    if ((norm.includes('dht') || norm.includes('nhiệt độ') || norm.includes('độ ẩm')) && !components.some(c => c.type === 'dht11')) {
      const dhtId = `dht_${Date.now()}`;
      components.push({ id: dhtId, type: 'dht11', name: 'Cảm biến DHT11', x: nextX, y: 50, properties: { temperature: 28, humidity: 65 } });
      const dhtPin = isEsp32 ? 'd15' : 'd3';
      wires.push(
        { fromCompId: 'bb', fromPinId: 'top_plus_8', toCompId: dhtId, toPinId: 'vcc', color: '#dc2626', note: 'VCC DHT11' },
        { fromCompId: 'bb', fromPinId: 'top_minus_8', toCompId: dhtId, toPinId: 'gnd', color: '#111827', note: 'GND DHT11' },
        { fromCompId: mcuId, fromPinId: dhtPin, toCompId: dhtId, toPinId: 'data', color: '#3b82f6', note: `Data DHT11 về ${dhtPin.toUpperCase()}` }
      );
      changeSummary.push(`+ Thêm Cảm biến nhiệt độ - độ ẩm DHT11 tại chân ${dhtPin.toUpperCase()}`);
      nextX += 110;
    }

    // G. Thêm Siêu âm HC-SR04
    if ((norm.includes('siêu âm') || norm.includes('khoảng cách') || norm.includes('ultrasonic') || norm.includes('sr04')) && !components.some(c => c.type === 'ultrasonic')) {
      const sonarId = `sonar_${Date.now()}`;
      components.push({ id: sonarId, type: 'ultrasonic', name: 'Cảm biến siêu âm HC-SR04', x: nextX, y: 50, properties: { distance: 35 } });
      const trigPin = isEsp32 ? 'd18' : 'd9';
      const echoPin = isEsp32 ? 'd19' : 'd10';
      wires.push(
        { fromCompId: 'bb', fromPinId: 'top_plus_2', toCompId: sonarId, toPinId: 'vcc', color: '#dc2626', note: 'VCC Siêu âm' },
        { fromCompId: 'bb', fromPinId: 'top_minus_2', toCompId: sonarId, toPinId: 'gnd', color: '#111827', note: 'GND Siêu âm' },
        { fromCompId: mcuId, fromPinId: trigPin, toCompId: sonarId, toPinId: 'trig', color: '#3b82f6', note: `Trig -> ${trigPin.toUpperCase()}` },
        { fromCompId: mcuId, fromPinId: echoPin, toCompId: sonarId, toPinId: 'echo', color: '#06b6d4', note: `Echo -> ${echoPin.toUpperCase()}` }
      );
      changeSummary.push(`+ Thêm Cảm biến siêu âm HC-SR04 tại chân Trig: ${trigPin.toUpperCase()}, Echo: ${echoPin.toUpperCase()}`);
      nextX += 120;
    }

    // H. Thêm Rơ-le
    if ((norm.includes('relay') || norm.includes('rơ le')) && !components.some(c => c.type === 'relay_module')) {
      const relayId = `relay_${Date.now()}`;
      components.push({ id: relayId, type: 'relay_module', name: 'Module Rơ-le 5V 1 Kênh', x: nextX, y: 40 });
      const relayPin = isEsp32 ? 'd5' : 'd7';
      wires.push(
        { fromCompId: 'bb', fromPinId: 'top_plus_2', toCompId: relayId, toPinId: 'vcc', color: '#dc2626', note: 'VCC Relay' },
        { fromCompId: 'bb', fromPinId: 'top_minus_2', toCompId: relayId, toPinId: 'gnd', color: '#111827', note: 'GND Relay' },
        { fromCompId: mcuId, fromPinId: relayPin, toCompId: relayId, toPinId: 'in', color: '#3b82f6', note: `Kích Relay -> ${relayPin.toUpperCase()}` }
      );
      changeSummary.push(`+ Thêm Module Rơ-le 1 Kênh kích hoạt tại chân ${relayPin.toUpperCase()}`);
      nextX += 150;
    }

    // I. Thêm Servo
    if ((norm.includes('servo') || norm.includes('động cơ servo')) && !components.some(c => c.type === 'servo')) {
      const servoId = `servo_${Date.now()}`;
      components.push({ id: servoId, type: 'servo', name: 'Động cơ Micro Servo SG90', x: nextX, y: 50 });
      const servoPin = isEsp32 ? 'd12' : 'd6';
      wires.push(
        { fromCompId: 'bb', fromPinId: 'top_plus_1', toCompId: servoId, toPinId: 'vcc', color: '#dc2626', note: '5V nguồn Servo' },
        { fromCompId: 'bb', fromPinId: 'top_minus_1', toCompId: servoId, toPinId: 'gnd', color: '#111827', note: 'GND Servo' },
        { fromCompId: mcuId, fromPinId: servoPin, toCompId: servoId, toPinId: 'sig', color: '#f59e0b', note: `Xung PWM điều khiển góc -> ${servoPin.toUpperCase()}` }
      );
      changeSummary.push(`+ Thêm Động cơ Micro Servo SG90 tại chân PWM ${servoPin.toUpperCase()}`);
      nextX += 120;
    }
  }

  // Fallback change summary nếu không nhận diện cụm từ cụ thể
  if (changeSummary.length === 0) {
    changeSummary.push(`~ Cập nhật cấu hình và bố trí theo yêu cầu: "${prompt.slice(0, 50)}"`);
  }

  steps.push(`Cập nhật: Đã áp dụng các thay đổi: ${changeSummary.join('; ')}`);
  steps.push(`Hiện tại mạch có ${components.length} linh kiện và ${wires.length} đường dây kết nối an toàn.`);

  return {
    id: `mod_${Date.now()}`,
    title: baseCircuit.title ? `${baseCircuit.title} (Cập nhật)` : `Mạch đã chỉnh sửa: ${prompt.slice(0, 30)}`,
    category: isEsp32 ? 'IoT & ESP32' : 'Tự chỉnh sửa bởi Agent',
    promptSample: prompt,
    description: `Mạch đã được AI Agent cập nhật theo yêu cầu: "${prompt}". Bao gồm ${components.length} linh kiện và ${wires.length} dây nối.`,
    components,
    wires,
    steps,
    changeSummary,
  };
}

function generateSmartHeuristicRecipe(prompt: string): AISchematicRecipe {
  const norm = prompt.toLowerCase();

  // Xác định loại bo mạch điều khiển người dùng yêu cầu
  let mcuType: string = 'arduino_uno';
  let mcuName: string = 'Arduino Uno R3';
  let isEsp32 = false;
  let isMega = false;

  if (norm.includes('mega') || norm.includes('2560')) {
    mcuType = 'arduino_mega';
    mcuName = 'Arduino Mega 2560 R3';
    isMega = true;
  } else if (norm.includes('esp32') || norm.includes('esp 32') || norm.includes('nodemcu')) {
    mcuType = 'esp32';
    mcuName = 'ESP32 DevKit V1';
    isEsp32 = true;
  } else if (norm.includes('nano')) {
    mcuType = 'arduino_nano';
    mcuName = 'Arduino Nano V3';
  }

  const components: AISchematicRecipe['components'] = [
    { id: 'mcu', type: mcuType, name: mcuName, x: 70, y: 170 },
    { id: 'bb', type: 'breadboard', name: 'Breadboard Mini', x: isMega ? 520 : 450, y: 170 },
  ];

  const wires: AISchematicRecipe['wires'] = [];
  const steps: string[] = [];

  // Master Power Wires
  if (isEsp32) {
    wires.push(
      { fromCompId: 'mcu', fromPinId: '3v3', toCompId: 'bb', toPinId: 'top_plus_0', color: '#dc2626', note: 'ESP32 3.3V cấp nguồn rail (+) Breadboard' },
      { fromCompId: 'mcu', fromPinId: 'gnd_l', toCompId: 'bb', toPinId: 'top_minus_0', color: '#111827', note: 'ESP32 GND nối ray (-) Breadboard' }
    );
    steps.push('Bước 1: Nối chân 3.3V và GND từ ESP32 sang hai thanh ray nguồn (+) và (-) trên Breadboard.');
  } else {
    wires.push(
      { fromCompId: 'mcu', fromPinId: '5v', toCompId: 'bb', toPinId: 'top_plus_0', color: '#dc2626', note: `${mcuName} 5V cấp nguồn rail (+) Breadboard` },
      { fromCompId: 'mcu', fromPinId: 'gnd_top', toCompId: 'bb', toPinId: 'top_minus_0', color: '#111827', note: `${mcuName} GND nối ray (-) Breadboard` }
    );
    steps.push(`Bước 1: Nối chân 5V (dây đỏ) và GND (dây đen) từ ${mcuName} sang hai thanh ray nguồn Breadboard.`);
  }

  let currentX = isMega ? 540 : 470;

  // 1. Module Rơ-le (Relay)
  if (norm.includes('relay') || norm.includes('rơ le') || norm.includes('rơ-le')) {
    components.push({ id: 'relay_1', type: 'relay_module', name: 'Module Rơ-le 5V 1 Kênh', x: currentX, y: 40 });
    wires.push(
      { fromCompId: 'bb', fromPinId: 'top_plus_2', toCompId: 'relay_1', toPinId: 'vcc', color: '#dc2626', note: 'Cấp nguồn VCC cho Relay' },
      { fromCompId: 'bb', fromPinId: 'top_minus_2', toCompId: 'relay_1', toPinId: 'gnd', color: '#111827', note: 'Nối đất GND cho Relay' },
      { fromCompId: 'mcu', fromPinId: isEsp32 ? 'd4' : (isMega ? 'd7' : 'd7'), toCompId: 'relay_1', toPinId: 'in', color: '#3b82f6', note: 'Chân tín hiệu điều khiển đóng cắt Relay' }
    );
    steps.push('Bước: Nối VCC và GND của Relay vào Breadboard; nối chân kích IN vào chân Digital điều khiển.');
    currentX += 160;
  }

  // 2. Màn hình OLED SSD1306 (I2C)
  if (norm.includes('oled') || norm.includes('ssd1306')) {
    components.push({ id: 'oled_1', type: 'oled_i2c', name: 'Màn hình OLED 0.96" I2C', x: currentX, y: 45 });
    wires.push(
      { fromCompId: 'bb', fromPinId: 'top_plus_4', toCompId: 'oled_1', toPinId: 'vcc', color: '#dc2626', note: 'Cấp nguồn nuôi OLED' },
      { fromCompId: 'bb', fromPinId: 'top_minus_4', toCompId: 'oled_1', toPinId: 'gnd', color: '#111827', note: 'Nối đất GND cho OLED' },
      { fromCompId: 'mcu', fromPinId: isEsp32 ? 'd22' : (isMega ? 'd21' : 'a5'), toCompId: 'oled_1', toPinId: 'scl', color: '#eab308', note: 'Xung I2C SCL' },
      { fromCompId: 'mcu', fromPinId: isEsp32 ? 'd21' : (isMega ? 'd20' : 'a4'), toCompId: 'oled_1', toPinId: 'sda', color: '#06b6d4', note: 'Dữ liệu I2C SDA' }
    );
    steps.push('Bước: Nối màn hình OLED I2C qua chân SCL và SDA tương ứng trên bo điều khiển.');
    currentX += 140;
  }

  // 3. Màn hình LCD 1602 I2C
  if (norm.includes('lcd') || norm.includes('1602')) {
    components.push({ id: 'lcd_1', type: 'lcd_1602_i2c', name: 'Màn hình LCD 1602 I2C', x: currentX, y: 45 });
    wires.push(
      { fromCompId: 'bb', fromPinId: 'top_plus_6', toCompId: 'lcd_1', toPinId: 'vcc', color: '#dc2626', note: 'Nguồn 5V cho LCD 1602' },
      { fromCompId: 'bb', fromPinId: 'top_minus_6', toCompId: 'lcd_1', toPinId: 'gnd', color: '#111827', note: 'GND cho LCD 1602' },
      { fromCompId: 'mcu', fromPinId: isEsp32 ? 'd21' : (isMega ? 'd20' : 'a4'), toCompId: 'lcd_1', toPinId: 'sda', color: '#06b6d4', note: 'Tín hiệu SDA I2C' },
      { fromCompId: 'mcu', fromPinId: isEsp32 ? 'd22' : (isMega ? 'd21' : 'a5'), toCompId: 'lcd_1', toPinId: 'scl', color: '#eab308', note: 'Xung SCL I2C' }
    );
    steps.push('Bước: Cắm 4 chân LCD 1602 I2C gồm GND, VCC, SDA và SCL vào bo.');
    currentX += 190;
  }

  // 4. Cảm biến nhiệt ẩm DHT11
  if (norm.includes('dht') || norm.includes('nhiệt độ') || norm.includes('độ ẩm') || norm.includes('nhiet do')) {
    components.push({ id: 'dht_1', type: 'dht11', name: 'Cảm biến DHT11', x: currentX, y: 50, properties: { temperature: 28, humidity: 65 } });
    wires.push(
      { fromCompId: 'bb', fromPinId: 'top_plus_8', toCompId: 'dht_1', toPinId: 'vcc', color: '#dc2626', note: 'VCC cảm biến DHT11' },
      { fromCompId: 'bb', fromPinId: 'top_minus_8', toCompId: 'dht_1', toPinId: 'gnd', color: '#111827', note: 'GND cảm biến DHT11' },
      { fromCompId: 'mcu', fromPinId: isEsp32 ? 'd15' : 'd2', toCompId: 'dht_1', toPinId: 'data', color: '#3b82f6', note: 'Tín hiệu 1-Wire DHT11' }
    );
    steps.push('Bước: Nối chân DATA cảm biến DHT11 vào chân Digital đọc dữ liệu 1-wire.');
    currentX += 110;
  }

  // 5. Cần gạt Joystick 2 trục
  if (norm.includes('joystick') || norm.includes('cần gạt') || norm.includes('tay cầm')) {
    components.push({ id: 'joy_1', type: 'joystick', name: 'Module Joystick 2 Trục', x: currentX, y: 45 });
    wires.push(
      { fromCompId: 'bb', fromPinId: 'top_plus_10', toCompId: 'joy_1', toPinId: 'vcc', color: '#dc2626', note: 'Nguồn 5V cho Joystick' },
      { fromCompId: 'bb', fromPinId: 'top_minus_10', toCompId: 'joy_1', toPinId: 'gnd', color: '#111827', note: 'GND cho Joystick' },
      { fromCompId: 'mcu', fromPinId: isEsp32 ? 'd34' : 'a0', toCompId: 'joy_1', toPinId: 'vrx', color: '#eab308', note: 'Tín hiệu Analog trục X' },
      { fromCompId: 'mcu', fromPinId: isEsp32 ? 'd35' : 'a1', toCompId: 'joy_1', toPinId: 'vry', color: '#f59e0b', note: 'Tín hiệu Analog trục Y' }
    );
    steps.push('Bước: Nối 2 chân VRx và VRy của Joystick vào hai cổng đọc Analog.');
    currentX += 130;
  }

  // 6. Đèn LED RGB 4 chân
  if (norm.includes('rgb')) {
    components.push({ id: 'led_rgb_1', type: 'led_rgb', name: 'Đèn LED RGB 4 Chân', x: currentX, y: 55, properties: { rgbColor: '#a855f7' } });
    wires.push(
      { fromCompId: 'bb', fromPinId: 'top_minus_12', toCompId: 'led_rgb_1', toPinId: 'cathode', color: '#111827', note: 'Cathode cực âm chung nối GND' },
      { fromCompId: 'mcu', fromPinId: isEsp32 ? 'd25' : (isMega ? 'd9' : 'd9'), toCompId: 'led_rgb_1', toPinId: 'red', color: '#ef4444', note: 'Chân màu Đỏ Red' },
      { fromCompId: 'mcu', fromPinId: isEsp32 ? 'd26' : (isMega ? 'd10' : 'd10'), toCompId: 'led_rgb_1', toPinId: 'green', color: '#22c55e', note: 'Chân màu Xanh Green' },
      { fromCompId: 'mcu', fromPinId: isEsp32 ? 'd27' : (isMega ? 'd11' : 'd11'), toCompId: 'led_rgb_1', toPinId: 'blue', color: '#3b82f6', note: 'Chân màu Lam Blue' }
    );
    steps.push('Bước: Nối cực âm Cathode của LED RGB về GND, nối 3 chân màu R, G, B vào 3 chân PWM.');
    currentX += 110;
  }

  // 7. Cảm biến siêu âm HC-SR04
  if (norm.includes('siêu âm') || norm.includes('khoảng cách') || norm.includes('ultrasonic') || norm.includes('sr04')) {
    components.push({ id: 'sonar_1', type: 'ultrasonic', name: 'Cảm biến siêu âm HC-SR04', x: currentX, y: 50, properties: { distance: 35 } });
    wires.push(
      { fromCompId: 'bb', fromPinId: 'top_plus_2', toCompId: 'sonar_1', toPinId: 'vcc', color: '#dc2626', note: 'VCC cảm biến siêu âm' },
      { fromCompId: 'bb', fromPinId: 'top_minus_2', toCompId: 'sonar_1', toPinId: 'gnd', color: '#111827', note: 'GND cảm biến siêu âm' },
      { fromCompId: 'mcu', fromPinId: isEsp32 ? 'd18' : 'd9', toCompId: 'sonar_1', toPinId: 'trig', color: '#3b82f6', note: 'Chân phát xung Trig' },
      { fromCompId: 'mcu', fromPinId: isEsp32 ? 'd19' : 'd10', toCompId: 'sonar_1', toPinId: 'echo', color: '#06b6d4', note: 'Chân nhận xung Echo' }
    );
    steps.push('Bước: Nối chân Trig và Echo của cảm biến siêu âm vào 2 chân Digital.');
    currentX += 120;
  }

  // 8. Còi Buzzer
  if (norm.includes('còi') || norm.includes('buzzer') || norm.includes('kêu') || norm.includes('chuông')) {
    components.push({ id: 'buzzer_1', type: 'buzzer', name: 'Còi chíp Piezo', x: currentX, y: 50 });
    wires.push(
      { fromCompId: 'mcu', fromPinId: isEsp32 ? 'd13' : 'd8', toCompId: 'buzzer_1', toPinId: 'pos', color: '#f59e0b', note: 'Chân phát tín hiệu âm thanh' },
      { fromCompId: 'buzzer_1', fromPinId: 'neg', toCompId: 'bb', toPinId: 'top_minus_5', color: '#111827', note: 'Chân âm còi về GND' }
    );
    steps.push('Bước: Nối chân dương (+) còi Buzzer vào chân điều khiển, chân âm (-) về GND.');
    currentX += 110;
  }

  // 9. Đèn LED đơn (kèm điện trở 220Ω)
  if (norm.includes('led') || norm.includes('đèn') || components.length === 2) {
    components.push(
      { id: 'led_1', type: 'led', name: 'Đèn LED Đỏ', x: currentX, y: 50, properties: { color: 'red' } },
      { id: 'r_led1', type: 'resistor', name: 'Điện trở 220Ω', x: currentX - 20, y: 120, properties: { resistance: 220 } }
    );
    wires.push(
      { fromCompId: 'mcu', fromPinId: isEsp32 ? 'd2' : 'd13', toCompId: 'r_led1', toPinId: 'pin1', color: '#ef4444', note: 'Tín hiệu Digital qua điện trở 220Ω' },
      { fromCompId: 'r_led1', fromPinId: 'pin2', toCompId: 'led_1', toPinId: 'anode', color: '#ef4444', note: 'Điện trở vào Anode LED' },
      { fromCompId: 'led_1', fromPinId: 'cathode', toCompId: 'bb', toPinId: 'top_minus_3', color: '#111827', note: 'Cathode LED về GND' }
    );
    steps.push('Bước: Nối chân điều khiển qua điện trở hạn dòng 220Ω vào Anode đèn LED, Cathode về GND.');
    currentX += 120;
  }

  return {
    id: `custom_${Date.now()}`,
    title: `Sơ đồ: ${prompt.slice(0, 45)}`,
    category: isEsp32 ? 'IoT & ESP32' : (isMega ? 'Mega & Điều khiển' : 'Tự tạo theo Prompt AI'),
    promptSample: prompt,
    description: `Mạch thiết kế tự động cho "${prompt}". Sử dụng bo ${mcuName} kết hợp bố trí linh kiện chuẩn xác và điện trở an toàn.`,
    components,
    wires,
    steps,
    changeSummary: components.map(c => `+ Khởi tạo ${c.name}`).slice(0, 6),
  };
}

// ============================================================================
// CHẾ ĐỘ CHAT: HỎI ĐÁP, GIẢI THÍCH NGUYÊN LÝ & VIẾT CODE MẠCH ĐIỆN VỚI AI
// ============================================================================

/**
 * Tóm tắt cấu trúc mạch hiện tại trên Canvas làm ngữ cảnh cho AI
 */
export function buildCircuitContextSummary(components: CircuitComponent[], wires: Wire[]): string {
  if (!components || components.length === 0) {
    return 'Hiện tại chưa có linh kiện nào trên bàn vẽ (Canvas trống).';
  }

  const mcu = components.find(c => c.type.startsWith('arduino_') || c.type === 'esp32');
  const mcuName = mcu ? `${mcu.name} (ID: ${mcu.id})` : 'Chưa có vi điều khiển';

  const otherComps = components.filter(c => c.id !== mcu?.id && c.type !== 'breadboard');
  const compList = otherComps.map(c => `- ${c.name} (loại: ${c.type}, ID: ${c.id})${c.properties && Object.keys(c.properties).length > 0 ? ` [Thuộc tính: ${JSON.stringify(c.properties)}]` : ''}`).join('\n');

  const wireList = wires.map((w, idx) => {
    const fromComp = components.find(c => c.id === w.fromCompId)?.name || w.fromCompId;
    const toComp = components.find(c => c.id === w.toCompId)?.name || w.toCompId;
    return `${idx + 1}. [${fromComp}] chân ${w.fromPinId}  <--->  [${toComp}] chân ${w.toPinId} (Dây màu ${w.color})`;
  }).join('\n');

  return `
[THÔNG TIN MẠCH HIỆN TẠI TRÊN BÀN VẼ CANVAS]:
- Vi điều khiển trung tâm: ${mcuName}
- Tổng số linh kiện: ${components.length}
- Các linh kiện ngoại vi & cảm biến:
${compList || '(Không có linh kiện ngoại vi)'}
- Danh sách nối dây chi tiết (${wires.length} dây):
${wireList || '(Chưa có dây nối nào)'}
`.trim();
}

const CIRCUIT_MENTOR_SYSTEM_PROMPT = `Bạn là Trợ lý AI Chuyên gia Kỹ thuật Điện tử & Lập trình Vi điều khiển (Circuit Studio AI Mentor).
Nhiệm vụ của bạn là đồng hành, giải đáp mọi thắc mắc của người dùng về:
1. Nguyên lý hoạt động và kiến thức điện tử (Arduino, ESP32, cảm biến, màn hình OLED/LCD, động cơ, relay, điện trở...).
2. Hướng dẫn lập trình và viết mã nguồn (Arduino C++, ESP-IDF, MicroPython) với cú pháp chuẩn, có chú thích giải thích từng khối lệnh rõ ràng.
3. Kiểm tra an toàn mạch điện: điện áp (5V vs 3.3V), dòng tải, điện trở bảo vệ LED, chống nhiễu chân tín hiệu nút bấm (pull-up/pull-down).
4. Tư vấn nâng cấp, mở rộng tính năng và khắc phục sự cố (debugging) khi mạch không hoạt động như mong muốn.

Định dạng câu trả lời:
- Luôn trả lời bằng tiếng Việt tự nhiên, thân thiện, xúc tích, chuyên nghiệp và có cấu trúc rõ ràng.
- Khi cung cấp mã nguồn Arduino/C++, hãy đặt trong khối mã \`\`\`cpp ... \`\`\` để người dùng dễ dàng đọc và sao chép.
- Khi người dùng hỏi về mạch hiện tại, hãy sử dụng thông tin trong [THÔNG TIN MẠCH HIỆN TẠI TRÊN BÀN VẼ CANVAS] được cung cấp để trả lời chính xác theo từng chân và linh kiện họ đã nối.`;

/**
 * Gửi tin nhắn trong Chế độ Chat đến Live LLM (Gemini, OpenAI, Claude, DeepSeek, Kimi, Custom)
 * hoặc chuyển sang Smart Fallback nếu chưa cấu hình Key / mất mạng.
 */
export async function askCircuitAIChat(
  messages: AIChatMessage[],
  circuitContext: string,
  settingsOrKey?: UserAISettings | string
): Promise<string> {
  let settings: UserAISettings;
  if (!settingsOrKey) {
    settings = loadStoredAISettings();
  } else if (typeof settingsOrKey === 'string') {
    settings = {
      provider: settingsOrKey.startsWith('AIza') ? 'gemini' : 'openai',
      apiKey: settingsOrKey,
      model: settingsOrKey.startsWith('AIza') ? 'gemini-1.5-flash' : 'gpt-4o-mini',
    };
  } else {
    settings = settingsOrKey;
  }

  // 1. Nếu có API Key hoặc custom provider, gọi Live LLM
  if (settings.apiKey || settings.provider === 'custom') {
    try {
      const liveReply = await callLiveLLMChat(messages, circuitContext, settings);
      if (liveReply && liveReply.trim()) {
        return liveReply.trim();
      }
    } catch (err) {
      console.warn(`Live Chat LLM (${settings.provider}) failed, falling back to smart heuristic:`, err);
    }
  }

  // 2. Fallback sang Smart Circuit Chat Brain nếu chưa có key hoặc lỗi mạng
  return generateSmartFallbackChatReply(messages, circuitContext);
}

/**
 * Gọi Live LLM Chat đa nhà cung cấp
 */
async function callLiveLLMChat(
  messages: AIChatMessage[],
  circuitContext: string,
  settings: UserAISettings
): Promise<string> {
  const { provider, apiKey, model, customBaseUrl } = settings;

  const fullSystemPrompt = `${CIRCUIT_MENTOR_SYSTEM_PROMPT}\n\n${circuitContext}`;

  switch (provider) {
    case 'gemini': {
      const modelName = model || 'gemini-1.5-flash';
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent`;

      // Chuẩn bị contents theo chuẩn Gemini
      const contents = [
        {
          role: 'user',
          parts: [{ text: fullSystemPrompt }],
        },
        {
          role: 'model',
          parts: [{ text: 'Tôi đã nắm rõ thông tin mạch điện và sẵn sàng hỗ trợ giải đáp mọi câu hỏi, viết code hoặc phân tích mạch.' }],
        },
        ...messages.map((m) => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }],
        })),
      ];

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({ contents }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Gemini Chat lỗi HTTP ${res.status}`);
      }

      const data = await res.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    }

    case 'anthropic': {
      const modelName = model || 'claude-3-5-sonnet-20241022';
      const base = (customBaseUrl || 'https://api.anthropic.com/v1').replace(/\/+$/, '');
      const url = `${base}/messages`;

      const claudeMessages = messages.map((m) => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content,
      }));

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: modelName,
          max_tokens: 2048,
          system: fullSystemPrompt,
          messages: claudeMessages,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Claude Chat lỗi HTTP ${res.status}`);
      }

      const data = await res.json();
      return data.content?.[0]?.text || '';
    }

    default: {
      // OpenAI-compatible (OpenAI, DeepSeek, Kimi, Ollama, Custom)
      let defaultBase = 'https://api.openai.com/v1';
      if (provider === 'deepseek') defaultBase = 'https://api.deepseek.com';
      if (provider === 'kimi') defaultBase = 'https://api.moonshot.cn/v1';
      if (provider === 'custom') defaultBase = 'http://localhost:11434/v1';

      let endpoint = (customBaseUrl || defaultBase).trim().replace(/\/+$/, '');
      if (!endpoint.endsWith('/chat/completions')) {
        endpoint = `${endpoint}/chat/completions`;
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }

      const openAiMessages = [
        { role: 'system', content: fullSystemPrompt },
        ...messages.map((m) => ({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: m.content,
        })),
      ];

      const res = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: model || 'gpt-4o-mini',
          messages: openAiMessages,
          max_tokens: 2048,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Chat API lỗi HTTP ${res.status}`);
      }

      const data = await res.json();
      return data.choices?.[0]?.message?.content || '';
    }
  }
}

/**
 * Trả lời thông minh ngoại tuyến khi người dùng chưa cấu hình API Key
 */
function generateSmartFallbackChatReply(messages: AIChatMessage[], circuitContext: string): string {
  const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user')?.content || '';
  const query = lastUserMsg.toLowerCase();

  // 1. Người dùng yêu cầu viết code / sketch Arduino
  if (query.includes('code') || query.includes('viết code') || query.includes('lập trình') || query.includes('sketch') || query.includes('chương trình')) {
    const isEsp32 = circuitContext.toLowerCase().includes('esp32');
    const hasUltrasonic = circuitContext.toLowerCase().includes('ultrasonic') || circuitContext.toLowerCase().includes('siêu âm');
    const hasOled = circuitContext.toLowerCase().includes('oled');
    const hasDht = circuitContext.toLowerCase().includes('dht');
    const hasBuzzer = circuitContext.toLowerCase().includes('buzzer') || circuitContext.toLowerCase().includes('còi');

    if (hasUltrasonic && hasBuzzer) {
      return `Dưới đây là mã nguồn Arduino C++ hoàn chỉnh để vận hành hệ thống cảm biến siêu âm cảnh báo còi dựa trên mạch của bạn:

\`\`\`cpp
// Khai báo chân kết nối
const int TRIG_PIN = 9;
const int ECHO_PIN = 10;
const int BUZZER_PIN = 8;
const int LED_PIN = 7;

void setup() {
  Serial.begin(9600);
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(LED_PIN, OUTPUT);
  Serial.println("Hệ thống cảnh báo khoảng cách sẵn sàng!");
}

void loop() {
  // Phát xung siêu âm 10us
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  // Đo thời gian nhận xung phản xạ
  long duration = pulseIn(ECHO_PIN, HIGH, 30000);
  float distance = duration * 0.0343 / 2; // Tính khoảng cách (cm)

  Serial.print("Khoảng cách: ");
  Serial.print(distance);
  Serial.println(" cm");

  // Nếu vật cản dưới 20cm, kích hoạt còi và đèn
  if (distance > 0 && distance < 20) {
    digitalWrite(LED_PIN, HIGH);
    tone(BUZZER_PIN, 1000);
  } else {
    digitalWrite(LED_PIN, LOW);
    noTone(BUZZER_PIN);
  }

  delay(100);
}
\`\`\`

💡 **Giải thích code:**
- **TRIG_PIN (D9)**: Phát sóng siêu âm tần số 40kHz.
- **ECHO_PIN (D10)**: Đo thời gian phản hồi của sóng để suy ra khoảng cách.
- Khi vật cản tiến gần dưới 20cm, hàm \`tone()\` kích hoạt còi buzzer và bật đèn LED cảnh báo.`;
    }

    if (hasDht && hasOled) {
      return `Dưới đây là mã nguồn mẫu cho ${isEsp32 ? 'ESP32' : 'Arduino'} đọc cảm biến nhiệt ẩm DHT11 và hiển thị lên màn hình OLED I2C:

\`\`\`cpp
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <DHT.h>

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);

#define DHTPIN ${isEsp32 ? '4' : '2'}
#define DHTTYPE DHT11
DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(115200);
  dht.begin();

  if(!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println("Lỗi khởi tạo màn hình OLED!");
    for(;;);
  }

  display.clearDisplay();
  display.setTextColor(WHITE);
}

void loop() {
  float h = dht.readHumidity();
  float t = dht.readTemperature();

  display.clearDisplay();
  display.setTextSize(1);
  display.setCursor(0, 0);
  display.println("TRAM THOI TIET MINI");
  display.drawLine(0, 10, 128, 10, WHITE);

  display.setTextSize(2);
  display.setCursor(0, 20);
  display.print("T: "); display.print(t, 1); display.println(" C");

  display.setCursor(0, 42);
  display.print("H: "); display.print(h, 0); display.println(" %");
  display.display();

  delay(2000);
}
\`\`\`

💡 **Lưu ý thư viện:** Bạn cần cài đặt thư viện \`Adafruit SSD1306\` và \`DHT sensor library\` trong Arduino IDE Library Manager trước khi nạp code!`;
    }

    // Default LED blink sketch
    return `Dưới đây là mã nguồn Arduino C++ cơ bản điều khiển đèn LED và ngoại vi trên mạch của bạn:

\`\`\`cpp
// Khai báo chân tín hiệu
const int LED_PIN = 13;

void setup() {
  Serial.begin(9600);
  pinMode(LED_PIN, OUTPUT);
  Serial.println("Hệ thống khởi động thành công!");
}

void loop() {
  digitalWrite(LED_PIN, HIGH); // Bật LED
  Serial.println("LED: ON");
  delay(1000);

  digitalWrite(LED_PIN, LOW);  // Tắt LED
  Serial.println("LED: OFF");
  delay(1000);
}
\`\`\`

💡 **Ghi chú:** Chân **D13** trên Arduino Uno thường được nối với LED tích hợp trên bo và có thể điều khiển trực tiếp qua lệnh \`digitalWrite()\`. Nhớ mắc điện trở hạn dòng 220Ω khi cắm LED ngoài!`;
  }

  // 2. Hỏi về nguyên lý hoạt động
  if (query.includes('nguyên lý') || query.includes('hoạt động như thế nào') || query.includes('giải thích')) {
    return `### 🔍 Phân tích nguyên lý hoạt động của mạch:

1. **Khối nguồn (Power Rail):**
   - Vi điều khiển cấp nguồn 5V (hoặc 3.3V với ESP32) và đường mass GND sang hai thanh ray nguồn trên Breadboard.
   - Nhờ đó, tất cả các linh kiện cắm trên mạch đều có chung một điểm tham chiếu thế (Common Ground), giúp tín hiệu logic truyền chính xác và chống nhiễu.

2. **Khối điều khiển & Xử lý (MCU):**
   - Vi điều khiển đọc dữ liệu từ các chân ngõ vào (Input như Cảm biến, Biến trở, Nút nhấn) thông qua bộ chuyển đổi tương tự-số ADC hoặc giao tiếp I2C/One-Wire.
   - Vi điều khiển chạy thuật toán logic để quyết định trạng thái ngõ ra (Output như Bật LED, kêu còi Buzzer, xoay góc Servo, kích Relay).

3. **Bảo vệ phần cứng:**
   - Các đèn LED luôn được mắc nối tiếp với điện trở 220Ω để hạn chế dòng điện chạy qua không vượt quá 20mA, tránh làm cháy LED hoặc quá tải cổng vi điều khiển.

Bạn có muốn tôi viết code mẫu chi tiết hoặc kiểm tra an toàn điện áp cho mạch này không?`;
  }

  // 3. Hỏi về an toàn điện / điện trở
  if (query.includes('an toàn') || query.includes('cháy') || query.includes('điện trở') || query.includes('điện áp')) {
    return `### ⚡ Phân tích an toàn điện áp & Bảo vệ linh kiện:

1. **Tại sao LED cần điện trở hạn dòng 220Ω?**
   - Đèn LED thông thường có điện áp rơi $V_f \\approx 1.8V - 2.2V$ và dòng điện an toàn $I \\approx 10mA - 15mA$.
   - Khi nối vào nguồn 5V của Arduino mà không có điện trở, dòng điện chạy qua LED sẽ rất lớn theo định luật Ohm ($I = \\frac{5V - 2V}{R_{led} \\approx 0} \\rightarrow \\infty$), dẫn đến **cháy LED ngay lập tức** hoặc hỏng chân I/O vi điều khiển!
   - Sử dụng điện trở 220Ω: $I = \\frac{5V - 2V}{220\\Omega} \\approx 13.6mA$ — đây là mức dòng điện hoàn hảo giúp LED sáng đẹp và bền bỉ.

2. **Lưu ý mức điện áp logic (5V vs 3.3V):**
   - **Arduino Uno/Mega**: Mức logic chuẩn là **5V**.
   - **ESP32**: Mức logic chuẩn là **3.3V**. Không nối trực tiếp tín hiệu 5V vào chân GPIO của ESP32 mà không qua cầu phân áp hoặc mạch chuyển mức logic (Logic Level Shifter).

3. **Chân GND chung (Common Ground):**
   - Luôn đảm bảo tất cả cảm biến và nguồn ngoại vi được nối chung cực âm GND với bo điều khiển!`;
  }

  // 4. Tư vấn nâng cấp mạch
  if (query.includes('nâng cấp') || query.includes('thêm linh kiện') || query.includes('gợi ý')) {
    return `### 💡 Gợi ý nâng cấp & Mở rộng tính năng cho mạch:

1. **Thêm màn hình hiển thị trực quan:**
   - Bổ sung **Màn hình OLED 0.96" I2C** (chỉ tốn 2 chân SDA/SCL) để hiển thị thông số cảm biến, menu điều khiển theo thời gian thực thay vì chỉ xem qua Serial Monitor.

2. **Cảnh báo đa cấp (Âm thanh & Ánh sáng):**
   - Kết hợp **Đèn LED RGB 4 chân** (đổi màu Xanh -> Vàng -> Đỏ theo mức độ nguy hiểm) và **Còi Buzzer Piezo** phát tiếng bíp ngắt quãng khi có sự cố.

3. **Kết nối IoT không dây (ESP32):**
   - Nếu nâng cấp lên **ESP32**, bạn có thể gửi dữ liệu lên Dashboard đám mây qua WiFi (Blynk IoT, Adafruit IO, MQTT) để giám sát và điều khiển mạch từ xa qua điện thoại thông minh!

Bạn muốn tôi thiết kế chi tiết phần mở rộng nào trong số các gợi ý trên?`;
  }

  // Trả lời mặc định thân thiện
  return `Chào bạn! Tôi là **Trợ lý AI Thiết kế Mạch (Circuit Mentor)**.

Tôi đang theo dõi mạch trên bàn thiết kế của bạn. Tôi có thể hỗ trợ bạn:
- 📝 **Viết mã nguồn Arduino / C++** sẵn sàng nạp thẳng vào bo mạch.
- ❓ **Giải thích chi tiết nguyên lý** kết nối và hoạt động của từng linh kiện.
- ⚡ **Kiểm tra an toàn điện áp**, tính toán điện trở hạn dòng và chống nhiễu.
- 💡 **Gợi ý tính năng mới** hoặc cách khắc phục lỗi mạch.

Hãy đặt bất kỳ câu hỏi nào bạn đang thắc mắc nhé!`;
}

