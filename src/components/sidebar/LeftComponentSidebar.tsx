import React, { useState, useMemo } from 'react';
import type { ComponentType } from '../../types/circuit';
import {
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Grid,
  Lightbulb,
  Activity,
  Radio,
  Volume2,
  Disc,
  Eye,
  Sun,
  Plus,
  Monitor,
  Zap,
  Thermometer,
  Palette,
  Gamepad2,
  Wifi,
} from 'lucide-react';

export interface CatalogItem {
  id: string;
  type: ComponentType;
  name: string;
  model: string;
  category: 'all' | 'mcu' | 'board' | 'output' | 'sensor' | 'passive';
  pinCount: number;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  badgeColor: string;
  description: string;
  props?: Record<string, any>;
}

const CATALOG_ITEMS: CatalogItem[] = [
  // 1. Vi điều khiển (MCU)
  {
    id: 'arduino_uno',
    type: 'arduino_uno',
    name: 'Arduino Uno R3',
    model: 'ATmega328P',
    category: 'mcu',
    pinCount: 28,
    icon: Cpu,
    iconColor: 'text-sky-400',
    badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
    description: 'Bo mạch vi điều khiển 14 chân Digital (6 chân PWM) & 6 chân Analog',
  },
  {
    id: 'arduino_mega',
    type: 'arduino_mega',
    name: 'Arduino Mega 2560',
    model: 'ATmega2560 R3',
    category: 'mcu',
    pinCount: 76,
    icon: Cpu,
    iconColor: 'text-indigo-400',
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    description: 'Bo mạch hiệu năng cao với 54 chân Digital, 16 chân Analog và 4 cổng UART',
  },
  {
    id: 'esp32',
    type: 'esp32',
    name: 'ESP32 DevKit V1',
    model: 'Dual-Core Wi-Fi/BT',
    category: 'mcu',
    pinCount: 30,
    icon: Wifi,
    iconColor: 'text-emerald-400',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    description: 'SoC 32-bit Wi-Fi & Bluetooth 240MHz, 30 chân I/O hỗ trợ IoT và điều khiển 3.3V',
  },
  {
    id: 'arduino_nano',
    type: 'arduino_nano',
    name: 'Arduino Nano V3',
    model: 'ATmega328P DIP',
    category: 'mcu',
    pinCount: 30,
    icon: Cpu,
    iconColor: 'text-blue-400',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    description: 'Bo Arduino Uno thu nhỏ dạng cắm breadboard tiện lợi với 8 chân Analog',
  },

  // 2. Boards
  {
    id: 'breadboard',
    type: 'breadboard',
    name: 'Breadboard Mini',
    model: '400 Lỗ',
    category: 'board',
    pinCount: 60,
    icon: Grid,
    iconColor: 'text-slate-300',
    badgeColor: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
    description: 'Bo cắm thử nghiệm linh kiện không cần hàn có 2 ray nguồn kép',
  },

  // 3. Actuators & Outputs & Displays
  {
    id: 'lcd_1602_i2c',
    type: 'lcd_1602_i2c',
    name: 'Màn hình LCD 1602',
    model: 'I2C PCF8574',
    category: 'output',
    pinCount: 4,
    icon: Monitor,
    iconColor: 'text-cyan-400',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    description: 'Màn hình hiển thị 16 ký tự x 2 dòng giao tiếp I2C tiện lợi chỉ với 4 chân cắm',
  },
  {
    id: 'oled_i2c',
    type: 'oled_i2c',
    name: 'Màn hình OLED 0.96"',
    model: 'SSD1306 128x64',
    category: 'output',
    pinCount: 4,
    icon: Monitor,
    iconColor: 'text-sky-300',
    badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
    description: 'Màn hình đồ hoạ OLED độ tương phản cao giao tiếp I2C (SCL / SDA)',
  },
  {
    id: 'relay_module',
    type: 'relay_module',
    name: 'Module Rơ-le 5V',
    model: '1-Channel Relay',
    category: 'output',
    pinCount: 6,
    icon: Zap,
    iconColor: 'text-blue-400',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    description: 'Rơ-le đóng cắt dòng điện tải lớn 220V/10A có cách ly quang an toàn',
  },
  {
    id: 'led_rgb',
    type: 'led_rgb',
    name: 'Đèn LED RGB 4 Chân',
    model: 'Common Cathode',
    category: 'output',
    pinCount: 4,
    icon: Palette,
    iconColor: 'text-purple-400',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    description: 'Đèn LED đa màu kết hợp Đỏ - Xanh lá - Lam qua xung PWM tạo triệu màu sắc',
  },
  {
    id: 'led_red',
    type: 'led',
    name: 'Đèn LED Đỏ',
    model: '5mm Red',
    category: 'output',
    pinCount: 2,
    icon: Lightbulb,
    iconColor: 'text-rose-400',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    description: 'Đèn phát quang 5mm màu đỏ, phân cực Anode (+) và Cathode (-)',
    props: { color: 'red' },
  },
  {
    id: 'led_yellow',
    type: 'led',
    name: 'Đèn LED Vàng',
    model: '5mm Yellow',
    category: 'output',
    pinCount: 2,
    icon: Lightbulb,
    iconColor: 'text-amber-400',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    description: 'Đèn phát quang 5mm màu vàng hổ phách làm đèn tín hiệu',
    props: { color: 'yellow' },
  },
  {
    id: 'led_green',
    type: 'led',
    name: 'Đèn LED Xanh Lá',
    model: '5mm Green',
    category: 'output',
    pinCount: 2,
    icon: Lightbulb,
    iconColor: 'text-emerald-400',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    description: 'Đèn phát quang 5mm màu xanh lá cây tiết kiệm năng lượng',
    props: { color: 'green' },
  },
  {
    id: 'buzzer',
    type: 'buzzer',
    name: 'Còi Chíp Piezo',
    model: '5V Buzzer',
    category: 'output',
    pinCount: 2,
    icon: Volume2,
    iconColor: 'text-amber-300',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    description: 'Còi chíp thạch anh phát âm thanh cảnh báo tần số 1000 - 2500Hz',
  },
  {
    id: 'servo',
    type: 'servo',
    name: 'Động cơ Servo SG90',
    model: 'SG90 9g',
    category: 'output',
    pinCount: 3,
    icon: Disc,
    iconColor: 'text-orange-400',
    badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    description: 'Động cơ điều khiển góc quay chính xác 0° đến 180° bằng tín hiệu PWM',
  },

  // 4. Sensors
  {
    id: 'dht11',
    type: 'dht11',
    name: 'Cảm biến DHT11',
    model: 'Nhiệt độ & Độ ẩm',
    category: 'sensor',
    pinCount: 4,
    icon: Thermometer,
    iconColor: 'text-blue-400',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    description: 'Cảm biến đo nhiệt độ (0-50°C) và độ ẩm không khí (20-90% RH) chuẩn 1-Wire',
  },
  {
    id: 'ultrasonic',
    type: 'ultrasonic',
    name: 'Cảm biến Siêu âm',
    model: 'HC-SR04',
    category: 'sensor',
    pinCount: 4,
    icon: Radio,
    iconColor: 'text-teal-400',
    badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
    description: 'Đo khoảng cách từ 2cm đến 400cm bằng sóng siêu âm (Trig / Echo)',
  },
  {
    id: 'pir',
    type: 'pir',
    name: 'Cảm biến PIR',
    model: 'HC-SR501',
    category: 'sensor',
    pinCount: 3,
    icon: Eye,
    iconColor: 'text-lime-400',
    badgeColor: 'bg-lime-500/20 text-lime-300 border-lime-500/30',
    description: 'Phát hiện chuyển động thân nhiệt hồng ngoại người và vật nuôi',
  },
  {
    id: 'ldr',
    type: 'ldr',
    name: 'Quang trở LDR',
    model: 'CdS 5528',
    category: 'sensor',
    pinCount: 2,
    icon: Sun,
    iconColor: 'text-yellow-400',
    badgeColor: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    description: 'Cảm biến ánh sáng có điện trở thay đổi nghịch biến theo độ rọi sáng',
  },

  // 5. Passives & Basic Inputs
  {
    id: 'joystick',
    type: 'joystick',
    name: 'Cần gạt Joystick 2 Trục',
    model: 'PS2 Joystick XY',
    category: 'passive',
    pinCount: 5,
    icon: Gamepad2,
    iconColor: 'text-violet-400',
    badgeColor: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
    description: 'Module điều hướng 2 trục Analog X-Y và 1 nút nhấn công tắc SW',
  },
  {
    id: 'resistor_220',
    type: 'resistor',
    name: 'Điện trở 220Ω',
    model: '1/4W 5%',
    category: 'passive',
    pinCount: 2,
    icon: Activity,
    iconColor: 'text-cyan-400',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    description: 'Hạn dòng bảo vệ đèn LED không bị cháy khi nối nguồn 5V',
    props: { resistance: 220 },
  },
  {
    id: 'resistor_10k',
    type: 'resistor',
    name: 'Điện trở 10kΩ',
    model: 'Pull-up/down',
    category: 'passive',
    pinCount: 2,
    icon: Activity,
    iconColor: 'text-indigo-400',
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    description: 'Điện trở định mức 10.000 Ohm làm điện trở kéo lên / kéo xuống',
    props: { resistance: 10000 },
  },
  {
    id: 'pushbutton',
    type: 'pushbutton',
    name: 'Nút nhấn Tactile',
    model: '6x6mm 4-Pin',
    category: 'passive',
    pinCount: 4,
    icon: Disc,
    iconColor: 'text-slate-200',
    badgeColor: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
    description: 'Nút nhấn nhả 4 chân đóng/mở mạch tín hiệu tức thời',
  },
  {
    id: 'potentiometer',
    type: 'potentiometer',
    name: 'Biến trở xoay',
    model: '10kΩ Linear',
    category: 'passive',
    pinCount: 3,
    icon: Disc,
    iconColor: 'text-blue-400',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    description: 'Biến trở chia áp 3 chân cung cấp điện áp Analog biến thiên 0 - 5V',
  },
];

const CATEGORIES = [
  { id: 'all', label: 'Tất cả' },
  { id: 'mcu', label: 'Vi điều khiển' },
  { id: 'output', label: 'Đầu ra & Màn hình' },
  { id: 'sensor', label: 'Cảm biến' },
  { id: 'passive', label: 'Linh kiện' },
  { id: 'board', label: 'Bo cắm' },
];

interface Props {
  onAddComponent: (type: ComponentType, customProps?: Record<string, any>) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const LeftComponentSidebar: React.FC<Props> = ({
  onAddComponent,
  isCollapsed,
  onToggleCollapse,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredItems = useMemo(() => {
    return CATALOG_ITEMS.filter((item) => {
      const matchCategory =
        selectedCategory === 'all' || item.category === selectedCategory;
      const term = searchTerm.trim().toLowerCase();
      const matchSearch =
        !term ||
        item.name.toLowerCase().includes(term) ||
        item.model.toLowerCase().includes(term) ||
        item.description.toLowerCase().includes(term);
      return matchCategory && matchSearch;
    });
  }, [searchTerm, selectedCategory]);

  if (isCollapsed) {
    return (
      <div className="left-sidebar-collapsed glass-panel">
        <button
          onClick={onToggleCollapse}
          className="expand-sidebar-btn"
          title="Mở thanh tìm kiếm linh kiện"
        >
          <ChevronRight className="w-5 h-5 text-sky-400" />
          <span className="collapsed-vertical-text">THƯ VIỆN LINH KIỆN</span>
        </button>
      </div>
    );
  }

  return (
    <aside className="left-component-sidebar glass-panel">
      {/* 1. Header with Title & Collapse Button */}
      <div className="sidebar-header">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse" />
          <h2 className="sidebar-title">Linh Kiện Arduino</h2>
        </div>
        <button
          onClick={onToggleCollapse}
          className="collapse-sidebar-btn"
          title="Thu gọn thanh linh kiện"
        >
          <ChevronLeft className="w-4 h-4 text-slate-400 hover:text-white" />
        </button>
      </div>

      {/* 2. Real-time Search Bar */}
      <div className="sidebar-search-box">
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Tìm linh kiện (e.g. servo, led, ldr)..."
          className="sidebar-search-input"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="clear-search-btn"
            title="Xoá tìm kiếm"
          >
            <X className="w-3.5 h-3.5 text-slate-400 hover:text-white" />
          </button>
        )}
      </div>

      {/* 3. Category Filter Chips */}
      <div className="sidebar-category-chips">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`cat-chip-btn ${selectedCategory === cat.id ? 'active' : ''}`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* 4. Results Count */}
      <div className="sidebar-count-bar">
        <span className="text-slate-400 text-xs font-medium">
          {filteredItems.length} linh kiện tìm thấy
        </span>
      </div>

      {/* 5. Scrollable Component List */}
      <div className="sidebar-items-list">
        {filteredItems.length === 0 ? (
          <div className="empty-search-state">
            <p className="text-sm text-slate-400 font-medium">Không tìm thấy linh kiện</p>
            <p className="text-xs text-slate-500 mt-1">
              Thử tìm kiếm với từ khóa khác như "led", "cảm biến", "biến trở"
            </p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="component-card-item"
                onClick={() => onAddComponent(item.type, item.props)}
                title={`Nhấp để thêm ${item.name} vào Canvas`}
              >
                <div className="card-top-row">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="card-icon-wrapper">
                      <Icon className={`w-4 h-4 shrink-0 ${item.iconColor}`} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="card-name-text">{item.name}</h4>
                      <span className="card-model-code">{item.model}</span>
                    </div>
                  </div>
                  <span className={`card-pin-badge ${item.badgeColor}`}>
                    {item.pinCount} chân
                  </span>
                </div>

                <p className="card-desc-text">{item.description}</p>

                <div className="card-action-footer">
                  <button
                    className="add-to-canvas-pill"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddComponent(item.type, item.props);
                    }}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm vào mạch</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};
