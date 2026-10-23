# Bootstrap Icons qua CDN

> Cập nhật phạm vi 23/10/2026: trang phân tích vắng mặt của chủ sân đã gỡ. Hiện có 41 trang chức năng, 2 URL tương thích; AI còn Skill Match và Team Balancer. Các số liệu bên dưới ghi nhận đợt kiểm tra trước khi gỡ. Xem [phạm vi hiện hành](screen-list.md).

Mỗi trang nạp cùng phiên bản cố định:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.13.2/font/bootstrap-icons.min.css" />
```

Đặt trước `css/common.css` để CSS dự án điều chỉnh kích thước và màu. Website cần Internet để tải stylesheet/font, không lưu bộ icon offline và không nạp framework Bootstrap. CDN không thay đổi nơi lưu dữ liệu nghiệp vụ.

## Cách đọc và sửa

- HTML: `<i class="bi bi-calendar-event" aria-hidden="true"></i>`.
- JavaScript: `UI.icon('calendar')`; bảng tên ngữ nghĩa nằm đầu `js/ui.js`.
- `js/theme.js` đổi `bi-moon`/`bi-sun`; `js/community.js` chọn icon mạng xã hội.
- CSS dùng `.bi` thay selector phần tử SVG; icon ở nút/menu/thẻ vẫn theo màu hiện tại và hỗ trợ sáng/tối.
- Icon trang trí có `aria-hidden="true"`; tên thao tác thuộc nhãn chữ hoặc `aria-label` của nút/liên kết. Không dùng icon làm nhãn duy nhất cho trình đọc màn hình.
- Favicon giữ hình chữ C, chuyển sang `assets/favicon.png`. Chữ C thương hiệu và chữ cái avatar không phải icon chức năng.

| Chức năng | Bootstrap Icon |
|---|---|
| Menu / đóng | `list` / `x-lg` |
| Tìm kiếm / vị trí | `search` / `geo-alt` |
| Sân / môn | `grid-3x3` |
| Người chơi / hồ sơ | `people` / `person-circle` |
| Lịch / giờ | `calendar-event` / `clock` |
| Thống kê / cài đặt | `bar-chart-line` / `gear` |
| Thông báo / trợ giúp | `bell` / `question-circle` |
| AI / đội hình | `stars` / `diagram-3` |
| Xác nhận / cảnh báo / báo cáo | `check-lg` / `shield-exclamation` / `flag` |
| Đánh giá | `star-fill` / `star` |
| Mạng xã hội | `facebook`, `instagram`, `tiktok`, `youtube` |
| Zalo | `chat-dots` — icon hội thoại, không phải logo Zalo |

## Kiểm tra

Sau khi cài dependency kiểm thử, chạy server bằng `npm start`. Trong terminal khác:

```sh
npm run test:icons
```

Nếu dùng Chrome hệ thống trên PowerShell, đặt `$env:BROWSER_PATH='C:\Program Files\Google\Chrome\Application\chrome.exe'`. Test dùng phiên trình duyệt riêng, không xóa localStorage của trình duyệt đang dùng.

Test kiểm tra stylesheet/font thật từ CDN, tên glyph, nhãn truy cập, không còn SVG trong HTML/JS/CSS/assets, toàn bộ trang ở hai kích thước và hai theme, menu mobile của bốn role và nút đổi theme. Các bộ test lịch, đánh giá, biểu mẫu và nghiệp vụ tiếp tục kiểm tra thao tác của các nút.

Nguồn: [Bootstrap Icons](https://icons.getbootstrap.com/) và [hướng dẫn chính thức](https://github.com/twbs/icons/blob/main/README.md).

## Kết quả kiểm tra ngày 23/10/2026

- 44 HTML đều nạp cùng CDN 1.13.2; không còn SVG trong HTML, JS, CSS và assets sản phẩm.
- 168 lượt kiểm tra trang ở desktop/mobile và sáng/tối: glyph hợp lệ, không lỗi JavaScript hoặc tràn ngang toàn trang. CSS và font WOFF2 từ CDN trả HTTP 200.
- Kiểm tra menu mobile và nút đổi theme của cả bốn role đạt; menu không hiện ở workspace desktop.
- 14 bộ kiểm thử hiện có đều đạt: cấu trúc, HTML tĩnh, smoke, tích hợp, edge cases, cộng đồng, lịch, usability, interface, hoạt động mobile, bốn tài khoản mẫu, theme, dọn dữ liệu sân và chọn môn tạo trận. Thêm bộ `bootstrap-icons.cjs` đạt.
- Đã xem ảnh đại diện desktop/mobile, sáng/tối cho các role, lịch đặt sân và mạng xã hội. Đây là kiểm thử bằng Chrome trên máy, không khẳng định đã thử mọi trình duyệt hoặc thiết bị thật.
