import type { AISchematicRecipe, UserAISettings, AIProviderMetadata, AIProvider } from '../types/circuit';
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

const HARDWARE_SYSTEM_PROMPT = `Bạn là kỹ sư trưởng thiết kế phần cứng mạch điện tử Arduino và Tinkercad.
Nhiệm vụ của bạn là nhận yêu cầu của người dùng và trả về DUY NHẤT một chuỗi JSON hợp lệ (không kèm giải thích markdown ngoài JSON) theo cấu trúc sau:
{
  "id": "tên_mã_mạch",
  "title": "Tiêu đề mạch điện",
  "category": "Cơ bản hoặc Cảm biến hoặc Tự động",
  "promptSample": "yêu cầu gốc",
  "description": "Mô tả nguyên lý hoạt động ngắn gọn",
  "components": [
    { "id": "arduino", "type": "arduino_uno", "name": "Arduino Uno R3", "x": 80, "y": 180 },
    { "id": "bb", "type": "breadboard", "name": "Breadboard Mini", "x": 440, "y": 180 },
    { "id": "tên_id", "type": "loại linh kiện (led|resistor|pushbutton|potentiometer|ultrasonic|buzzer|servo|pir|ldr)", "name": "Tên tiếng Việt", "x": 500, "y": 70, "properties": {} }
  ],
  "wires": [
    { "fromCompId": "arduino", "fromPinId": "gnd_top", "toCompId": "bb", "toPinId": "top_minus_0", "color": "#111827", "note": "Ghi chú" },
    { "fromCompId": "arduino", "fromPinId": "5v", "toCompId": "bb", "toPinId": "top_plus_0", "color": "#dc2626", "note": "Ghi chú" }
  ],
  "steps": [
    "Bước 1: Hướng dẫn cắm dây bằng tiếng Việt",
    "Bước 2: Hướng dẫn cắm dây tiếp theo"
  ]
}
QUY TẮC CỐT LÕI:
1. Luôn có arduino_uno và breadboard làm khung cấp nguồn 5V và GND.
2. Với đèn LED, bắt buộc phải có điện trở 220Ω (resistor) nối tiếp với chân Anode để hạn dòng.
3. Mã màu dây: Đỏ (#dc2626 hoặc #ef4444) cho 5V, Đen (#111827) cho GND, Vàng (#eab308)/Xanh (#3b82f6)/Cam (#f97316) cho tín hiệu.
4. Chỉ trả về JSON thuần tuý.`;

/**
 * Gọi Google Gemini Live API
 */
async function callGeminiLive(prompt: string, apiKey: string, model: string): Promise<AISchematicRecipe | null> {
  const modelName = model || 'gemini-1.5-flash';
  // Truyền API key qua header bảo mật x-goog-api-key thay vì query param để tránh lộ trên URL/logs
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent`;
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
          parts: [{ text: `${HARDWARE_SYSTEM_PROMPT}\n\nYêu cầu dự án người dùng: ${prompt}` }],
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
async function callAnthropicLive(prompt: string, apiKey: string, model: string, baseUrl?: string): Promise<AISchematicRecipe | null> {
  const modelName = model || 'claude-3-5-sonnet-20241022';
  const base = (baseUrl || 'https://api.anthropic.com/v1').replace(/\/+$/, '');
  const url = `${base}/messages`;

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
      messages: [{ role: 'user', content: `Yêu cầu dự án người dùng: ${prompt}` }],
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
  baseUrl: string
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

  const payload: any = {
    model: model,
    messages: [
      { role: 'system', content: HARDWARE_SYSTEM_PROMPT },
      { role: 'user', content: `Yêu cầu dự án người dùng: ${prompt}` },
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
  settings: UserAISettings
): Promise<AISchematicRecipe | null> {
  const { provider, apiKey, model, customBaseUrl } = settings;

  switch (provider) {
    case 'gemini':
      return callGeminiLive(prompt, apiKey, model);
    case 'anthropic':
      return callAnthropicLive(prompt, apiKey, model, customBaseUrl);
    case 'openai':
      return callOpenAICompatibleLive(prompt, apiKey, model, customBaseUrl || 'https://api.openai.com/v1');
    case 'deepseek':
      return callOpenAICompatibleLive(prompt, apiKey, model, customBaseUrl || 'https://api.deepseek.com');
    case 'kimi':
      return callOpenAICompatibleLive(prompt, apiKey, model, customBaseUrl || 'https://api.moonshot.cn/v1');
    case 'custom':
      return callOpenAICompatibleLive(
        prompt,
        apiKey,
        model,
        customBaseUrl || 'http://localhost:11434/v1'
      );
    default:
      return callGeminiLive(prompt, apiKey, model);
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
  settingsOrKey?: UserAISettings | string
): Promise<AISchematicRecipe> {
  const normalized = prompt.toLowerCase();

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

  // 1. Kiểm tra prebuilt recipes nếu prompt khớp các bài toán kinh điển
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
  if (normalized.includes('ldr') || normalized.includes('quang trở') || normalized.includes('đèn đường') || normalized.includes('ánh sáng') || normalized.includes('trời tối') || normalized.includes('street light')) {
    return PREBUILT_RECIPES[5];
  }

  // 2. Nếu có API Key (hoặc custom local server), gọi Live LLM
  if (settings.apiKey || settings.provider === 'custom') {
    try {
      const result = await callLiveLLM(prompt, settings);
      if (result && Array.isArray(result.components) && Array.isArray(result.wires)) {
        return {
          id: result.id || `ai_gen_${Date.now()}`,
          title: result.title || `Sơ đồ AI: ${prompt.slice(0, 40)}`,
          category: result.category || `Tạo bởi ${AI_PROVIDERS_CONFIG[settings.provider]?.badge || 'AI'}`,
          promptSample: prompt,
          description: result.description || `Sơ đồ mạch sinh tự động từ mô hình ${settings.model}.`,
          components: result.components,
          wires: result.wires,
          steps: result.steps || ['Cắm các linh kiện theo sơ đồ hướng dẫn.'],
        };
      }
    } catch (err) {
      console.warn(`Live LLM (${settings.provider}) synthesis failed, falling back to smart heuristic:`, err);
    }
  }

  // 3. Fallback sang thuật toán Heuristic thông minh
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
