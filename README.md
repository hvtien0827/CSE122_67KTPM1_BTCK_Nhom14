# CourtConnect — Bài tập lớn nhóm 14

CourtConnect là website tìm và đặt sân thể thao, tạo trận và ghép người chơi theo trình độ, thuộc học phần **Phát triển ứng dụng Web cơ bản (CSE122)**. Nhóm gồm **4 thành viên**, sử dụng **HTML, CSS và JavaScript thuần**.

## Tổng quan bản demo

Bản demo hiện tại gồm **28 trang HTML**, hỗ trợ desktop/mobile và chế độ sáng/tối, với 3 vai trò:

- **Người chơi:** tìm sân, đặt sân, tạo/tham gia trận, quản lý hoạt động, nhận gợi ý ghép trận và đánh giá sau khi chơi.
- **Chủ sân:** quản lý sân, lịch khung giờ, đơn đặt sân và thống kê doanh thu.
- **Quản trị viên:** quản lý tài khoản, duyệt chủ sân/sân, xử lý báo cáo và gửi thông báo hệ thống.

Các phần dùng chung gồm đăng nhập/đăng ký, xác minh, khôi phục mật khẩu, hồ sơ cá nhân, trò chuyện, thông báo và trợ giúp.

Đây là demo frontend: dữ liệu lưu bằng `localStorage` trên trình duyệt; OTP và gợi ý ghép trận được mô phỏng, chưa kết nối backend, SMS hay thanh toán thật.

## Nội dung repository

| Thư mục | Nội dung |
|---|---|
| [Docs](Docs/) | Đề bài và yêu cầu học phần gốc. |
| [Prompt markdown](Prompt%20markdown/README.md) | Prompt thiết kế và tài liệu phân loại 28 giao diện hiện tại. |
| [UI FIgma Design](UI%20FIgma%20Design/README.md) | Các bản PDF giao diện tham khảo xuất từ Figma. |
| [WEB Demo ( Source Code )](WEB%20Demo%20%28%20Source%20Code%20%29/TOM_TAT.md) | Mã nguồn website, tài nguyên, tài liệu kỹ thuật và kiểm thử. |

Đề bài gốc và một số mẫu Figma mô tả phiên bản trước. Danh mục giao diện của bản demo được đối chiếu theo [tài liệu phân loại giao diện](Prompt%20markdown/phan_loai_giao_dien_he_thong.md).

## Phân công 4 thành viên

| Thành viên | Phần phụ trách | Công việc chính |
|---|---|---|
| Thành viên 1 | Giao diện người chơi | Tìm/đặt sân, hoạt động, tạo/tham gia trận, duyệt yêu cầu tham gia và ghép trận theo trình độ. |
| Thành viên 2 | Giao diện chủ sân | Quản lý sân, lịch khung giờ, đơn đặt sân và thống kê doanh thu. |
| Thành viên 3 | Đăng nhập, đăng ký và giao diện chung | Xác minh, khôi phục mật khẩu, trang chủ, hồ sơ, cài đặt, trò chuyện, thông báo và các trang hỗ trợ. |
| Thành viên 4 | Giao diện quản trị viên | Quản lý tài khoản, duyệt chủ sân/sân, báo cáo vi phạm và thông báo hệ thống. |

Đây là phân công dự kiến; thay nhãn thành viên bằng họ tên khi chốt nhóm. Mỗi người phụ trách HTML/CSS/JS và kiểm tra trên mobile cho phần của mình; cả nhóm thống nhất thành phần dùng chung và kiểm tra các luồng liên quan giữa các vai trò.

## Chạy thử

Mở thư mục **WEB Demo ( Source Code )** bằng VS Code, dùng Live Server để chạy `index.html`. Xem [hướng dẫn và tài khoản demo](WEB%20Demo%20%28%20Source%20Code%20%29/README.md).