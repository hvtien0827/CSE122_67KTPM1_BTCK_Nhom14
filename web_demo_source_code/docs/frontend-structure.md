# Sửa giao diện CourtConnect sau khi tách HTML / CSS / JavaScript

Website có 42 trang chức năng và 2 URL chuyển hướng tương thích. Chạy trực tiếp bằng Live Server hoặc `node tests/serve.cjs`; không có bước build bắt buộc.

## Sửa ở đâu?

| Muốn thay đổi | File cần sửa |
|---|---|
| Tiêu đề, mô tả, bố cục, nhãn, input hoặc nút của trang | File `.html` tương ứng, trong `<main>` và vùng `data-page-view`. |
| Form trong popup | Các `<template data-fragment="...">` ở cuối HTML của trang. |
| Màu, font, dark mode, nút, input, header, sidebar, bảng dùng chung | `css/common.css`. |
| Trang người chơi, đặt sân, lịch chọn ngày, hoạt động | `css/player.css`. |
| Quản lý sân và lịch khung giờ của chủ sân | `css/venue.css`. |
| Giao diện quản lý, biểu đồ và đội hình CLB | `css/admin.css`. |
| Đăng nhập, đăng ký, xác minh, khôi phục mật khẩu | `css/auth.css`. |
| Hero, các section, CTA và footer của trang chủ | `css/home.css`. |
| Sự kiện, bộ lọc, kiểm tra form và dữ liệu trên trang | Hàm controller tương ứng trong `js/player.js`, `manage.js`, `community.js`, `ai.js`, `auth.js` hoặc `app.js`. |
| Quy tắc nghiệp vụ, lưu dữ liệu, phân quyền mô phỏng | `js/store.js`. |

Mỗi trang nạp `common.css` trước rồi CSS của nhóm trang. Các trang dùng chung nạp thêm `player.css`; các trang CLB dùng `admin.css` cho thành phần quản lý/đội hình, theo bộ sáu file CSS đã thống nhất.

## Ví dụ sửa một trang

Để sửa trang tìm sân, mở `player-court-search.html`, tìm tiêu đề `Tìm và đặt sân`. Sửa trực tiếp `<h1>`, mô tả và form `#filters` tại đó. Kiểu riêng đặt trong `player.css`; xử lý tìm kiếm nằm trong hàm `searchCourts()` của `js/player.js`.

Không đổi `id`, `name`, `data-action` hoặc tên vùng dữ liệu một cách độc lập: các thuộc tính đó là điểm liên kết với JavaScript. Nếu cần đổi, tìm và sửa đồng thời phần xử lý liên quan.

## Vùng dữ liệu hoạt động thế nào?

`js/views.js` là tiện ích nhỏ cập nhật DOM. Controller truyền các hàm cung cấp giá trị vào `Views.update()`. HTML quyết định bố cục; tiện ích này không đọc hoặc thực thi mã JavaScript từ thuộc tính HTML.

- Cặp comment `<!--bind:...-->` và `<!--/bind:...-->` đánh dấu vị trí cập nhật chữ, danh sách, hàng bảng hoặc option. Giữ nguyên cặp comment khi chỉnh bố cục xung quanh.
- `data-bind-attrs` nối dữ liệu với thuộc tính như `value`, `href`, `src`, `style`.
- `data-bind-flags` cập nhật trạng thái như `checked`, `disabled`, `selected`.
- `<template data-if="...">` và `<template data-else="...">` chứa hai trạng thái HTML, ví dụ có dữ liệu/chưa có dữ liệu. JavaScript chỉ chọn trạng thái phù hợp.
- `Views.fragment()` lấy form popup từ `<template data-fragment="...">` trong chính trang hiện tại.

Các ô `input[type="date"]` được `js/date-picker.js` bổ sung lịch dùng chung. Bố cục ở `#date-control-template` và `#shared-calendar-template` trong HTML; kiểu nằm ở cuối `common.css`. Giá trị và tên input gốc được giữ ở dạng ISO `yyyy-mm-dd` cho FormData, min/max và bộ lọc; nút chọn ngày hiển thị `dd/mm/yyyy`. Chọn ngày, “Hôm nay” hoặc “Xóa ngày” phát sự kiện `input`/`change` như trước. Khi tắt JavaScript, ô ngày gốc vẫn sử dụng được.

Các danh sách sân, trận, người chơi, đánh giá, lịch, hàng bảng và kết quả AI vẫn được tạo động từ dữ liệu. Bố cục trang, form cố định và hộp thoại nằm trong HTML. Không còn thay toàn bộ `document.body.innerHTML` khi lọc hoặc lưu dữ liệu.

Header, sidebar và khung dialog có mặt trong từng HTML để trang dễ đọc và hoạt động với server tĩnh. Khi sửa bố cục dùng chung, cập nhật các trang liên quan; `UI.updateChrome()` chỉ cập nhật tài khoản, vai trò, trạng thái menu và theme. JavaScript không sinh lại toàn bộ header/sidebar.

## Phối hợp nhóm

Mỗi người sửa HTML và CSS thuộc phần mình. Phần dùng chung trong `common.css`, `ui.js`, `views.js`, `store.js` cần thống nhất người sửa. Không sao chép toàn bộ CSS chung sang CSS riêng. Các module JavaScript vẫn chứa một số hàm thuộc nhiều vai trò; đối chiếu [danh sách màn hình](screen-list.md) và [phân công](team-assignment.md) trước khi sửa.

Thiết kế hiện tại được giữ bằng CSS riêng. Chưa đưa Bootstrap vào vì các class như `.row`, `.btn`, `.card`, `.container` đang có kiểu khác; nạp nguyên bộ sẽ cần nhiều CSS ghi đè và làm tăng rủi ro lệch giao diện.

## Kiểm tra

Khởi động server rồi chạy `npm run test:static` để kiểm tra bố cục có trong HTML, bộ sáu CSS, giao diện khi tắt JS và việc sửa HTML không bị controller ghi đè. Các bài kiểm tra chức năng vẫn nằm trong `tests/`.

Máy chạy kiểm thử cần Playwright và Chromium; có thể chỉ định Chrome đã cài bằng biến môi trường `BROWSER_PATH`. Dữ liệu kiểm thử dùng hồ sơ trình duyệt riêng.
