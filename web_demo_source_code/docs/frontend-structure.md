# Cấu trúc frontend sau khi chia theo role

Đọc [bản đồ code và hướng dẫn vấn đáp](code-map.md) để lần một thao tác từ HTML tới JS và dữ liệu. Website vẫn có 42 trang chức năng và 2 URL tương thích, không cần build và chưa tích hợp JSON Server.

## Sửa ở đâu?

| Việc | File |
|---|---|
| Bố cục, tiêu đề, mô tả, nhãn và form chính | HTML tương ứng, trong `<main>` |
| Form popup của trang | `<template data-fragment>` ở cuối chính HTML đó |
| Nút, input, bảng, panel, biến màu sáng/tối | `css/common.css` |
| Header, sidebar, menu mobile/tài khoản | `css/navigation.css` và `js/ui.js` |
| Lịch chọn ngày dùng chung | `css/date-picker.css`, `js/date-picker.js`, hai template lịch cuối HTML |
| Người chơi | `css/player.css`, `js/player.js` |
| Chủ sân | `css/venue.css`, `js/venue.js` |
| Điều phối CLB | `css/organizer.css`, `js/organizer.js` |
| Admin | `css/admin.css`, `js/admin.js` |
| Tài khoản | `css/auth.css`, `js/auth.js` |
| Trang chủ | `css/home.css`, `Player.home()` trong `js/player.js` |
| Quy tắc nghiệp vụ, dữ liệu, localStorage | `js/store.js` |
| Đánh giá/báo cáo, hồ sơ công khai, lịch sân/doanh thu | `js/community.js` |
| Ba tính năng hỗ trợ bằng thuật toán quy tắc | `js/ai.js` |
| Định tuyến theo tên file, hồ sơ, cài đặt, thông báo, lỗi | `js/app.js` |

Mỗi trang nạp ba CSS dùng chung trước CSS nhóm trang. Trang role không nạp controller của các role khác. Các trang hồ sơ/cài đặt dùng chung vẫn hỗ trợ bốn role.

## HTML và dữ liệu

HTML là nguồn bố cục. JavaScript không ghi đè toàn bộ body. `Views.update()` chỉ cập nhật vùng được đánh dấu. Các binding dùng tên có nghĩa như `courtName`, `statusOptions`, `bookingRows`.

- `<!--bind:courtName--><!--/bind:courtName-->`: vị trí thay chữ hoặc HTML dữ liệu.
- `data-bind-attrs`: cập nhật `value`, `src`, `href`...
- `data-bind-flags`: cập nhật `disabled`, `checked`, `selected`...
- `template[data-if]`/`template[data-else]`: trạng thái có dữ liệu hoặc rỗng.
- `Views.fragment()`: lấy form popup có sẵn trong HTML.

Không đổi `id`, `name`, `data-action` hoặc tên binding chỉ ở một bên. Sửa đồng thời HTML và controller. Dữ liệu đầu vào được `esc()` trước khi chèn; không bỏ bước mã hoá này.

## Phần đã dọn

- Bỏ các bản sao dialog của chức năng khác khỏi HTML.
- Giữ menu đúng role trên trang chuyên role; trang dùng chung vẫn hỗ trợ cả bốn.
- Tách `manage.js` cũ thành ba controller riêng, chỉ có màn hình, form và sự kiện của role đó.
- Đổi tên dữ liệu liên kết HTML/JS, bỏ các tên dài được sinh từ biểu thức.
- Tách điều hướng và lịch ngày khỏi `common.css`; chuyển định dạng đội hình sang `organizer.css`, ảnh xem trước sang `venue.css`.
- Các thuật toán và nghiệp vụ xuyên role vẫn dùng chung; không nhân bản toàn bộ dữ liệu hay CSS để làm file có vẻ ngắn.

## Kiểm tra và làm nhóm

Chạy `npm ci` nếu chưa cài thư viện, `npm start` để phục vụ web. Các lệnh kiểm tra có trong `package.json`; Playwright dùng hồ sơ trình duyệt thử nghiệm riêng.

Các bản PR cũ ở ngoài thư mục này dựa trên `manage.js` cũ. Xem phần lưu ý trong [code-map.md](code-map.md) trước khi áp dụng; không chép lại file cũ đè lên cấu trúc mới.
