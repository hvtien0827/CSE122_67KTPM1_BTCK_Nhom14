# Tóm tắt mã nguồn demo CourtConnect

Website demo sử dụng **HTML, CSS, JavaScript thuần**, gồm **28 trang HTML** với 3 vai trò: người chơi, chủ sân và quản trị viên. Giao diện hỗ trợ mobile và chế độ sáng/tối.

## Chức năng chính

- **Người chơi:** tìm/đặt sân, tạo và tham gia trận, theo dõi hoạt động, nhận gợi ý ghép trận theo quy tắc, đánh giá và báo cáo.
- **Chủ sân:** quản lý sân, xem lịch khung giờ, xử lý đơn đặt và theo dõi doanh thu.
- **Admin:** quản lý tài khoản, duyệt chủ sân/sân, xử lý báo cáo và gửi thông báo.
- **Dùng chung:** đăng nhập/đăng ký, xác minh, khôi phục mật khẩu, hồ sơ, trò chuyện, thông báo và hỗ trợ.

## Cấu trúc

| Thành phần | Nội dung |
|---|---|
| Các file HTML | Điểm vào của 28 giao diện; `index.html` là trang chủ. |
| css/ | Kiểu hiển thị, responsive và theme. |
| js/ | Dữ liệu mẫu, xử lý chức năng, phân vai trò và thành phần dùng chung. |
| assets/ | Ảnh và tài nguyên giao diện. |
| design/ | Tài liệu thiết kế đi kèm mã nguồn. |
| docs/ | Danh sách màn hình, luồng sử dụng, phân công và tài liệu kỹ thuật. |
| tests/ | Máy chủ chạy thử và các kịch bản kiểm thử. |

## Chạy thử và tài liệu

Mở thư mục này bằng VS Code rồi chạy `index.html` bằng Live Server. Nếu đã cài Node.js, có thể chạy `npm start` trong thư mục này và truy cập http://localhost:4173.

Xem [README chi tiết và tài khoản demo](README.md), [danh sách màn hình](docs/screen-list.md), [luồng sử dụng](docs/user-flows.md) và [phân công](docs/team-assignment.md).

Dữ liệu được lưu cục bộ bằng `localStorage`. OTP, gợi ý ghép trận và các tương tác được mô phỏng trong trình duyệt; chưa có backend, SMS, thanh toán thật hay đồng bộ trò chuyện giữa thiết bị.

[Quay lại giới thiệu dự án](../README.md)