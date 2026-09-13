# Hướng dẫn sử dụng Script

Hướng dẫn cài đặt và sử dụng script từ đầu.

---

## 📋 Yêu cầu

- **Trình duyệt:** Chrome, Edge, Firefox, Brave, hoặc bất kỳ trình duyệt nhân Chromium.
- **Extension:** Tampermonkey (bắt buộc).

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
