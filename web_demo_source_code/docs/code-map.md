# Bản đồ code để chia việc và chuẩn bị vấn đáp

## Bắt đầu ở đâu?

Mỗi trang HTML chứa bố cục chính của trang đó. Tìm `<main id="main">` để xem nội dung, tìm `data-fragment` để xem các form popup riêng. Biểu tượng dùng Bootstrap Icons qua CDN: HTML dùng `<i class="bi bi-ten-icon" aria-hidden="true"></i>`, JS dùng `UI.icon(ten)` trong `js/ui.js`. Nút chỉ có icon vẫn phải có `aria-label` mô tả thao tác.

Không cần đọc từ dòng đầu đến dòng cuối của toàn bộ project. Chọn một thao tác, lần theo HTML → sự kiện → hàm nghiệp vụ → cập nhật giao diện.

## Phạm vi từng thành viên

| Người | HTML và CSS | JS chính | Phần dùng chung cần đọc khi có liên quan |
|---|---|---|---|
| Tiến — Người chơi | `player-*.html`, `court-detail.html`, `booking.html`, `match-detail.html`; `css/player.css` | `js/player.js` | Skill Match trong `js/ai.js`; đánh giá trong `js/community.js`; đặt sân/trận trong `js/store.js` |
| Dũng — Chủ sân | `venue-*.html`; `css/venue.css` | `js/venue.js` | Lịch sân, doanh thu, đánh giá trong `js/community.js`; dữ liệu sân/đặt sân trong `js/store.js` |
| Thư — CLB | `organizer-*.html`; `css/organizer.css` | `js/organizer.js` | Team Balancer trong `js/ai.js`; sự kiện/danh sách/đội hình trong `js/store.js` |
| Trang — Admin | `admin-*.html`; `css/admin.css` | `js/admin.js` | Báo cáo người chơi trong `js/community.js`; tài khoản/môn/báo cáo trong `js/store.js` |

`js/manage.js` cũ đã được tách, không còn được nạp. Mỗi trang chuyên role chỉ nạp bộ điều khiển của role tương ứng. Các trang dùng chung như hồ sơ/cài đặt vẫn dùng chung cho cả bốn role.

## File dùng chung làm nhiệm vụ gì?

| File | Trách nhiệm |
|---|---|
| `js/store.js` | Dữ liệu mẫu, nâng cấp dữ liệu cộng đồng một lần, localStorage, kiểm tra quyền và quy tắc nghiệp vụ. Hiện chưa có JSON Server. |
| `js/ui.js` | Thông báo, popup, nút, điều hướng và tiện ích giao diện. |
| `js/views.js` | Điền dữ liệu vào các vị trí đã đánh dấu trong HTML; không tạo lại toàn bộ trang. |
| `js/app.js` | Chọn hàm xử lý theo URL, kiểm tra đăng nhập/role; hồ sơ, cài đặt, thông báo, trang lỗi. |
| `js/theme.js` | Đọc/lưu chế độ sáng tối. |
| `js/date-picker.js` | Chọn ngày, bàn phím, min/max. |
| `js/auth.js` | Luồng đăng nhập, đăng ký, xác minh, khôi phục mô phỏng. |
| `js/ai.js` | Hai thuật toán quy tắc và màn hình hỗ trợ; không gọi mô hình AI. |
| `js/community.js` | Chức năng xuyên role: đánh giá/báo cáo, hồ sơ công khai, lịch/doanh thu. |

## Cách đọc một bộ điều khiển role

Trong `venue.js`, `organizer.js`, `admin.js`:

1. `searchText`, `selectedStatus`, `selectedRole` (admin) giữ trạng thái bộ lọc của trang.
2. `bindFilters()` gắn sự kiện thay đổi ô tìm kiếm và trạng thái.
3. `matchesFilters()` lọc dữ liệu; `renderActions()` tạo các nút của hàng dữ liệu.
4. `renderCourts()`, `renderBookings()`, `renderEvents()`, `renderUsers()`... lấy dữ liệu và cập nhật đúng vùng HTML.
5. `openEditDialog()` chọn form của đúng loại bản ghi và xử lý lưu.
6. Cuối file là sự kiện click theo `data-action`: sửa, lưu trữ, duyệt, xuất báo cáo... chỉ thuộc role đó.
7. `window.Venue`, `window.Organizer`, `window.Admin` công khai các hàm để bộ điều hướng gọi. Đây là object JavaScript, không phải API mạng.

Tên các binding đã đổi thành tên có nghĩa như `courtName`, `bookingRows`, `statusOptions`, `roleButtons`. Ví dụ:

```html
<!--bind:courtName--><!--/bind:courtName-->
```

Controller cung cấp giá trị cùng tên:

```js
Views.update('player-courtDetail', {
  courtName: () => esc(c.name),
  // Các dữ liệu khác của trang...
});
```

`esc()` mã hoá ký tự HTML của dữ liệu đầu vào trước khi chèn. `() => ...` là hàm chỉ trả giá trị khi tiện ích cập nhật giao diện gọi nó. `data-bind-attrs` cập nhật value/href/src; `data-bind-flags` cập nhật checked/disabled/selected. `data-if` và `data-else` chọn trạng thái có dữ liệu/rỗng.

Đây vẫn là một tiện ích liên kết DOM tự viết. Nhóm cần hiểu cơ chế này; đợt chỉnh cấu trúc không thay nó bằng framework khác hoặc xoá toàn bộ lớp dùng chung.

## Ví dụ luồng vấn đáp

### Chủ sân duyệt đơn

`venue-booking-management.html` → nút `data-action="booking-status"` do danh sách tạo → sự kiện cuối `venue.js` → popup xác nhận → `CC.setBooking()` trong `store.js` kiểm tra quyền/trạng thái → lưu localStorage → `renderPage()` → `Venue.bookings()` cập nhật danh sách.

### Người chơi tìm sân

`player-court-search.html` → submit form `#filters` → `searchCourts()` trong `player.js` → lọc sân → `Views.update()` cập nhật `resultCount` và `courtCards`. Tiêu đề/bố cục không bị tạo lại.

### CLB sửa danh sách

`organizer-player-roster.html` → `roster-add` hoặc `roster-toggle` → sự kiện trong `organizer.js` → `CC.roster()` trong `store.js` → kiểm tra sự kiện, người chơi và sức chứa → cập nhật danh sách, xoá đội hình cũ để chia lại.

### Admin tìm tài khoản

`admin-user-management.html` → `bindFilters()`/nút `filter-role` → cập nhật trạng thái bộ lọc → `renderUsers()` → tạo hàng bảng phù hợp. Đây là mô phỏng frontend, không phải phân quyền bảo mật phía server.

## CSS chia như thế nào?

Mỗi trang nạp theo thứ tự: `common.css` → `navigation.css` → `date-picker.css` (chỉ khi có input ngày) → CSS của nhóm trang. Xem [danh sách phụ thuộc theo trang](page-dependencies.json) và [báo cáo dọn mã](source-cleanup-report.md).

- `common.css`: biến màu sáng/tối, chữ, nút/input, panel/bảng và responsive dùng chung. File còn dài vì các thành phần này có mặt ở nhiều role, không tách bằng cách chép trùng.
- `navigation.css`: header, sidebar, menu tài khoản, điều hướng mobile.
- `date-picker.css`: lịch chọn ngày dùng chung.
- `player.css`, `venue.css`, `organizer.css`, `admin.css`: kiểu riêng từng role.
- `auth.css`, `home.css`: luồng tài khoản và trang chủ.

Dùng Bootstrap Icons 1.13.2 qua CDN; không nạp CSS/JS của framework Bootstrap. Website vẫn dùng HTML/CSS/JS thuần, không có bước build và không đổi giao diện chỉ để giảm số dòng.

## Làm việc nhóm sau khi tách

Mỗi người sửa HTML/CSS/JS của role mình. Sửa `store.js`, `ui.js`, `views.js`, `app.js`, `community.js`, `ai.js` hoặc CSS chung thì báo nhóm và kiểm tra các role liên quan.

Ba bản PR cũ và các patch bên ngoài thư mục này vẫn theo cấu trúc `manage.js` trước khi tách. Không chép chúng đè lên bản mới. Chuyển đúng đoạn thay đổi sang `venue.js`, `organizer.js`, `admin.js`; test riêng vẫn có thể tái sử dụng theo hành vi, còn test tham chiếu `Manage` phải đổi sang namespace mới. Không merge hai thay đổi cấu trúc trái nhau mà không so sánh.

## Tự kiểm tra trước ngày thi

- Chỉ được thẻ HTML và hàm JS tương ứng với nút đang demo.
- Giải thích `find`, `filter`, `map`, điều kiện quyền/trạng thái và lưu dữ liệu.
- Phân biệt phần tĩnh trong HTML với danh sách tạo động.
- Tự đổi được một nhãn, một điều kiện lọc và một thông báo validation.
- Không nói dự án đã có API/backend thật: tích hợp JSON Server là công việc tiếp theo.
