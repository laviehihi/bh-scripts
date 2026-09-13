# Hướng dẫn sử dụng Script

Hướng dẫn cài đặt và sử dụng script từ đầu.

---

## 📋 Yêu cầu

- **Trình duyệt:** Chrome, Edge, Firefox, Brave, hoặc bất kỳ trình duyệt nhân Chromium.
- **Extension:** Tampermonkey (bắt buộc).
- **Hệ điều hành khuyến nghị:** macOS (để thu nhỏ cửa sổ game hết cỡ, giúp tọa độ click chính xác hơn).

---

## 🚀 Cài đặt

### Bước 1: Cài Tampermonkey

1. Mở trình duyệt (Chrome khuyến nghị).
2. Truy cập [Chrome Web Store - Tampermonkey](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo).
3. Nhấn **Thêm vào Chrome** (hoặc **Add to Chrome**).
4. Nhấn **Thêm tiện ích** khi popup hiện ra.
5. Sau khi cài xong, **biểu tượng Tampermonkey** sẽ xuất hiện ở góc phải trên trình duyệt.

> **Firefox:** Cài từ [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/).
>
> **Edge:** Cài từ [Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd).

---

### Bước 2: Bật quyền chạy User Scripts

Tùy vào phiên bản trình duyệt, bạn cần bật **1 trong 2** tùy chọn sau. Nếu đang dùng bản mới (Chrome/Edge 138+), thường phải làm **cả hai**.

#### Cách 1: Bật "Allow User Scripts" (Khuyên dùng cho Chrome/Edge 138+)

1. Trên thanh địa chỉ, gõ: `chrome://extensions` (hoặc `edge://extensions`) rồi nhấn Enter.
2. Tìm extension **Tampermonkey** trong danh sách.
3. Nhấn nút **Details** (Chi tiết) trên thẻ của Tampermonkey.
4. Kéo xuống, tìm công tắc **"Allow User Scripts"** (Cho phép chạy User Scripts).
5. Gạt công tắc sang **ON**.

> **Lưu ý:** Công tắc này nằm trong trang chi tiết của **riêng Tampermonkey**, không phải ở trang quản lý extension chung.

#### Cách 2: Bật "Developer Mode" (Dành cho Chrome/Edge cũ hơn 138)

1. Trên thanh địa chỉ, gõ: `chrome://extensions` (hoặc `edge://extensions`) rồi nhấn Enter.
2. Ở góc phải trên cùng, gạt công tắc **Developer mode** (Chế độ nhà phát triển) sang **ON**.

> **Quan trọng:** Nếu đang dùng **Chrome 138 trở lên**, ưu tiên làm theo **Cách 1**. Bật Developer Mode thôi có thể không đủ để Tampermonkey chạy được script.

---

### Bước 3: Cài Script

#### Cách 1: Cài từ link (nhanh nhất)

1. Mở link: [Cài Script](https://raw.githubusercontent.com/laviehihi/bh-scripts/main/main.user.js)
2. Tampermonkey sẽ hiện popup xác nhận.
3. Nhấn **Install** (Cài đặt).
4. Xong.

#### Cách 2: Copy thủ công

1. Nhấn **biểu tượng Tampermonkey** ở góc phải trên → chọn **Dashboard**.
2. Trong Dashboard, nhấn dấu **`+`** (Create a new script) ở tab bên trái.
3. **Xoá toàn bộ nội dung** trong editor (Ctrl+A → Delete).
4. **Copy toàn bộ** nội dung file `main.user.js` từ repo.
5. **Paste** vào editor Tampermonkey (Ctrl+V).
6. **Ctrl+S** để lưu.

---


## ⚙️ Setup trước khi sử dụng bot

### Quan trọng: Thu nhỏ cửa sổ game

Trước khi setup bot, bạn **nên thu nhỏ cửa sổ game hết cỡ**.

**Lý do:**

- Canvas size càng nhỏ → tọa độ pixel càng ít bị lệch khi resize.
- Trên macOS, thu nhỏ cửa sổ Chrome giúp canvas size ổn định → tọa độ click chính xác.
- Nếu cửa sổ to → canvas size thay đổi → tọa độ setup sai.

**Cách thu nhỏ:**

1. Mở game.
2. Kéo cửa sổ Chrome nhỏ lại (không cần maximize).
3. Kích thước khuyến nghị: **500 × 337** hoặc nhỏ hơn (tùy màn hình).
4. **Không thay đổi kích cỡ cửa sổ** sau khi setup xong.

> ⚠️ **Lưu ý cho người dùng macOS:**
> - Trên macOS, canvas size phụ thuộc vào kích cỡ cửa sổ.
> - Thu nhỏ cửa sổ → canvas nhỏ → tọa độ ổn định.
> - **KHÔNG** resize cửa sổ sau khi setup bot.

---

## 🎮 Hướng dẫn sử dụng

### Phím tắt

| Phím          | Chức năng                                           |
| ------------- | --------------------------------------------------- |
| **1**         | Hiện/ẩn bảng Help                                   |
| **2**         | Overlay: mở → thu nhỏ → ẩn → mở                     |
| **3**         | Auto Rerun (dành cho macOS — thu nhỏ game hết cỡ)   |
| **4**         | Auto WB Solo (dành cho macOS — thu nhỏ game hết cỡ) |
| **5**         | Auto Script (theo rules tự setup)                   |
| **6**         | Vào/ra Add Rule Mode                                |
| **7**         | Bật/tắt Team Mode                                   |
| **Z**         | Team Mode: chế độ 2 người                           |
| **X**         | Team Mode: chế độ 3 người                           |
| **C**         | Team Mode: chế độ 4 người                           |
| **V**         | Team Mode: chế độ 5 người                           |
| **=** / **+** | Tăng tốc độ game                                    |
| **-**         | Giảm tốc độ game                                    |
| **0**         | (Trong Add Mode) Lưu vị trí                         |
| **9**         | (Trong Add Mode) Lưu màu                            |
| **8**         | (Trong Add Mode) Xoá rule cuối                      |

---

### Auto Rerun (Phím 3)

> ⚠️ **Dành cho macOS** — cần thu nhỏ game hết cỡ để tọa độ chính xác.

**Mục đích:** Tự động click nút Rerun khi trận xong.

**Cách dùng:**

1. Vào game, thu nhỏ cửa sổ hết cỡ.
2. Vào trận đánh.
3. Bấm **3** để bật.
4. Script check nút Rerun mỗi 3 giây.
5. Match → click → nghỉ 20 giây → lặp.
6. Bấm **3** lần nữa để tắt.

**Lưu ý:**

- Tọa độ nút Rerun đã hard-code → chỉ đúng khi canvas size khớp với máy setup gốc.
- Nếu dùng trên máy khác → cần setup lại (xem phần Add Rule bên dưới).

---

### Auto WB Solo (Phím 4)

> ⚠️ **Dành cho macOS** — cần thu nhỏ game hết cỡ để tọa độ chính xác.

**Mục đích:** Tự động đánh World Boss Solo.

**Cách dùng:**

1. Vào game, thu nhỏ cửa sổ hết cỡ.
2. Bấm **4** để bật.
3. Script check 3 nút của WB Solo mỗi 2 giây.
4. Bấm **4** lần nữa để tắt.

---

### Auto Script (Phím 5)

**Mục đích:** Tự động click theo **rules tự setup** (nhiều vị trí + màu). Đây là cách **linh hoạt nhất**, hoạt động với mọi kích cỡ cửa sổ nếu setup đúng.

#### Cách setup rules

**Bước 1:** Vào màn hình cần auto (VD: PvP, Raid, Dungeon, ...).

**Bước 2:** Bấm **6** để vào **Add Rule Mode**.

→ Bảng đỏ **"ADD RULE MODE"** hiện ở góc trái trên.

**Bước 3:** Di chuột đến nút cần click.

> ⚠️ **Chọn chỗ màu đẹp, không pha trộn:**
> - Nên chọn giữa nút, màu đồng nhất.
> - Tránh chữ, viền, icon, shadow, gradient.
> - Tránh vùng có animation (nhấp nháy).

**Bước 4:** Bấm **0** để lưu vị trí.

→ Vòng cam nhấp nháy xuất hiện tại vị trí đã lưu.

**Bước 5:** Di chuột ra xa nút (để nút tắt hover).

**Bước 6:** Bấm **9** để lưu màu.

→ Vòng cam biến mất → rule đã hoàn thành.

**Bước 7:** Lặp lại bước 3-6 cho các nút khác.

**Bước 8:** Bấm **6** để thoát Add Mode.

**Bước 9:** Bấm **5** để bật Auto Script.

#### Xoá rule

- Bấm **6** → bấm **8** → xoá rule cuối.
- Lặp lại nếu cần xoá nhiều rule.

#### Lưu ý

- Rules **tự động lưu** vào localStorage → F5 không mất.
- Mỗi rule cần **vị trí + màu**.
- Nếu click sai → xoá rule cuối, setup lại.
- **Không thay đổi kích cỡ cửa sổ** sau khi setup.

---

### WB Mode (Phím 7)

**Mục đích:** Tự động chơi theo **tổ đội** (đi nhiều người).

> ⚠️ **Dành cho macOS** — cần thu nhỏ game hết cỡ để tọa độ chính xác.

**Cách dùng:**

1. Vào màn hình tổ đội (WB Team).
2. Bấm **7** để bật.
3. Chọn chế độ:
- **Z** = 2 người.
- **X** = 3 người.
- **C** = 4 người.
- **V** = 5 người.
4. Script tự động:
- Đếm số slot có người.
- Đủ số người → bấm nút Ready/Start.
- Nếu có popup xác nhận → bấm Yes.
- Chờ xong → bấm Regroup → lặp.
5. Bấm **7** lần nữa để tắt.

**Lưu ý:**

- Script check 3 điểm confirm để xác định đang ở màn WB.
- Nếu không thấy confirm trong 3 phút → tự tắt.
- Delay 1s trước khi click để tránh click nhầm.

---

### Speed Hack (Phím = / -)

**Mục đích:** Tăng tốc độ game (animation, cooldown, ...).

**Cách dùng:**

1. Đợi game load xong.
2. Bấm **=** để tăng tốc (mỗi lần +1).
3. Bấm **-** để giảm tốc (mỗi lần -1).
4. Speed hiện tại hiển thị trong overlay.

**Lưu ý:**

- Speed tối đa: **10×**.
- Speed tối thiểu: **1×** (không hack).
- **Không nên dùng speed quá cao** (> 5×) → có thể lag.
