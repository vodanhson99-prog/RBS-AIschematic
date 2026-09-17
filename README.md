# AI Circuit Studio ⚡ (Tinkercad + AI Assistant)

> Ứng dụng thiết kế và mô phỏng mạch điện tương tác kiểu Tinkercad, tích hợp AI tự động đề xuất chân cắm, hỗ trợ đa dạng linh kiện Arduino, cảm biến và mô phỏng thời gian thực.

![AI Circuit Studio](https://raw.githubusercontent.com/vodanhson99-prog/ai-circuit-studio/main/preview.png)

---

## 🌟 Tính Năng Nổi Bật

### 1. Canvas Thiết Kế Trực Quan (SVG Vector Canvas)
- **Hệ thống dây điện Tinkercad-Style**:
  - Mặc định nối thẳng trực tiếp (`Crisp Straight Wires`) với bo góc tròn và đổ bóng chân thực.
  - **Tạo điểm uốn tức thì**: Nhấn đúp chuột vào bất kỳ điểm nào trên dây để tạo điểm uốn cố định ngay tại chỗ.
  - **Bẻ dây tự do theo ý muốn**: Nhấn giữ vào điểm uốn và rê chuột để bẻ góc theo thời gian thực (Zero Cursor Jitter).
  - Nhấn đúp vào điểm uốn để xoá điểm và đưa dây trở về đường thẳng.
- **Thao tác linh kiện tiện lợi**:
  - Di chuyển, kéo thả mượt mà trên lưới điện tử.
  - Thanh công cụ nổi: Xoay 90° (`R`), nhân bản linh kiện, xoá (`Del` / `Backspace`).
  - Tự động dọn dẹp dây nối liên quan khi xoá linh kiện.

### 2. Thư Viện Linh Kiện Phong Phú (Left Component Sidebar)
- **Bo mạch**: Arduino Uno R3 (vi điều khiển ATmega328P với đầy đủ 28 chân cắm).
- **Bo cắm**: Breadboard Mini 400 lỗ với 2 ray nguồn kép (+/-).
- **Đầu ra**: Đèn LED (Đỏ, Vàng, Xanh lá, Xanh dương), Còi chip Piezo Buzzer, Động cơ Servo SG90 (quay 0° - 180°).
- **Đầu vào & Cảm biến**: Nút nhấn Tactile, Biến trở xoay 10kΩ, Cảm biến khoảng cách Siêu âm HC-SR04, Cảm biến chuyển động PIR, Cảm biến quang trở LDR.

### 3. Bảng Điều Khiển Mô Phỏng Thời Gian Thực (Live Simulation Cockpit)
- Kiểm thử mạch điện trực tiếp ngay trên trình duyệt:
  - Vặn biến trở để điều chỉnh góc quay động cơ Servo SG90 (0° - 180°).
  - Kéo thanh trượt khoảng cách siêu âm: Cảnh báo còi chip Buzzer dồn dập (1000Hz - 2000Hz) và nhấp nháy đèn LED khi vật cản < 25cm.
  - Nhấn nút bấm để đóng/mở mạch điện và kích sáng đèn LED.
  - Nút bật/tắt âm thanh còi thông minh.

### 4. Trợ Lý AI Thiết Kế Mạch & Log Sơ Đồ Cắm Thời Gian Thực
- **AI Schematic Assistant (Gemini Engine)**:
  - Nhập prompt yêu cầu (ví dụ: *"Mạch đèn giao thông 3 màu"*, *"Đo khoảng cách cảnh báo bằng còi"*...) để AI tự động vẽ sơ đồ, bố trí linh kiện và đi dây nối tối ưu.
- **Gợi ý nối chân Real-time (Smart HUD)**:
  - Tự động phân tích chân cắm, phát sáng vòng xanh lá gợi ý chân đối xứng và cảnh báo đấu chập điện áp / ngắn mạch.
- **Bảng Log Sơ Đồ Cắm (Netlist Export)**:
  - Ghi nhật ký từng thao tác cắm/rút dây theo thời gian thực.
  - Xuất dữ liệu mạch điện ra file JSON chuẩn để lưu trữ và chia sẻ.

---

## 🛠️ Công Nghệ Sử Dụng

- **Frontend Core**: React 19, TypeScript, Vite
- **UI & Graphics**: Vanilla CSS3, SVG Vector Graphics, Lucide Icons, Glassmorphism Aesthetics
- **Audio Synthesizer**: Web Audio API (phản hồi âm thanh cắm dây và còi chip tần số cao)
- **AI Integration**: Google Gemini API / Antigravity Engine

---

## 🚀 Cài Đặt & Chạy Dự Án

```bash
# Clone dự án
git clone https://github.com/vodanhson99-prog/ai-circuit-studio.git
cd ai-circuit-studio

# Cài đặt thư viện phụ thuộc
npm install

# Khởi chạy dev server
npm run dev

# Build sản phẩm
npm run build
```

---

## 🌿 Cấu Trúc Nhánh (Branches)

- **`main`**: Nhánh chính chứa phiên bản ổn định nhất của ứng dụng.
- **`test`**: Nhánh thử nghiệm và kiểm thử tính năng mới.

---

## 📄 Bản Quyền

Dự án phát triển bởi [@vodanhson99-prog](https://github.com/vodanhson99-prog).
