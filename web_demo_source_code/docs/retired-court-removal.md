# Loại bỏ sân mẫu và dọn dữ liệu cũ — 23/10/2026

Thay đổi trên nhánh `chore/remove-ho-tay-court`, dựa trên bản main đã merge PR chọn môn thể thao. Không thay đổi cấu trúc HTML hoặc CSS.

## Hành vi

- Dữ liệu khởi tạo còn ba sân; không tạo lại sân mẫu đã gỡ khi khôi phục dữ liệu.
- Trước khi nâng cấp/bổ sung dữ liệu, store loại bỏ sân cũ và các lịch sân, đơn đặt, trận, đánh giá, báo cáo người chơi liên quan. Các sự kiện, thông báo, tin nhắn, lịch sử AI và báo cáo có liên kết hoặc tên/địa chỉ trỏ đến bản ghi đã gỡ cũng được dọn.
- Dọn cả các bảng lưu trong `legacy`, tránh phục hồi bản ghi đã loại bỏ khi chuyển phiên bản.
- Nếu có đơn bị loại bỏ, các snapshot báo cáo tổng hợp còn giữ được tính lại số đơn và doanh thu từ các sân còn lại; giữ mốc thời gian của báo cáo.
- Giữ tài khoản, mật khẩu, các sân khác, danh mục môn và dữ liệu không liên quan. Chức năng thêm sân mới vẫn hoạt động, kể cả môn chưa có sân mẫu.
- Bộ lọc chọn môn trong test dùng sân thử nghiệm riêng, không phụ thuộc dữ liệu mẫu sản phẩm.

Bước chuyển đổi phải giữ mã định danh cũ để nhận diện dữ liệu trên trình duyệt đã dùng bản trước; mã này không tạo sân hoặc hiển thị trên giao diện. Không reset toàn bộ localStorage, không viết lại lịch sử Git.

## Kiểm tra

- **14/14 bộ kiểm tra đạt:** retired-court, match-sport, structure, smoke, static-html, integration, edge-cases, community, date-picker, usability-regression, interface-polish, mobile-activities, restore-four-roles, theme.
- `retired-court.cjs`: **141 xác nhận** cho dữ liệu mới, dữ liệu cũ/legacy, liên kết, snapshot, giữ dữ liệu khác, chạy lặp và dữ liệu hỏng.
- `match-sport.cjs`: **23 xác nhận** cho tạo/sửa trận và chọn môn, bao gồm mobile.
- Thử trực tiếp dữ liệu store của bản trước khi xoá: **38 kiểm tra trang** qua bốn role ở desktop/mobile; không còn sân trên giao diện, URL cũ trả trang 404 khi dùng player, không lỗi runtime.
- Smoke: 84 lượt trang, không tràn ngang/lỗi runtime. Theme: 168 lượt trang đạt.
- Cập nhật ảnh danh sách sân trong minh chứng kiểm thử. Các ảnh/log kiểm thử khác là minh chứng lịch sử, không được dùng để khởi tạo dữ liệu sản phẩm.

Chạy kiểm tra dữ liệu không cần server: `npm run test:retired-court`. Kiểm tra chọn môn cần server đang chạy (`npm start`), Playwright và trình duyệt: `npm run test:match-sport`.

Sau khi cập nhật mã, tải lại trang đang chạy đúng thư mục repo. Bước chuyển đổi tự dọn localStorage của địa chỉ/cổng hiện tại; không cần xoá toàn bộ dữ liệu hoặc tạo lại tài khoản. Các trình duyệt/máy khác được dọn khi chạy bản cập nhật; ứng dụng hiện chưa đồng bộ qua API.
