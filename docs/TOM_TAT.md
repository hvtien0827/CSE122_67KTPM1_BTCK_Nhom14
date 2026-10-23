# Tóm tắt mã nguồn demo CourtConnect

Mã nguồn hiện tại nằm trong [web_demo_source_code](../web_demo_source_code/), sử dụng HTML/CSS/JavaScript thuần với **4 vai trò**, **41 trang chức năng** và **2 URL chuyển hướng cũ**.

| Vai trò | Chức năng |
|---|---|
| Người chơi | Tìm/đặt sân, tạo/tham gia trận, quản lý hoạt động, Skill Match, đánh giá và báo cáo sau trận. |
| Chủ sân | Quản lý sân và lịch khung giờ, đơn đặt, doanh thu và đánh giá sân. |
| Điều phối CLB | Quản lý sự kiện, danh sách người chơi, đội hình và Team Balancer. |
| Quản trị viên | Quản lý môn, tài khoản, báo cáo hoạt động/CSV và báo cáo người chơi. |

Trang chủ, luồng tài khoản, hồ sơ cá nhân/công khai, cài đặt, thông báo, trợ giúp, điều khoản, bảo mật và lỗi là **phần làm chung của cả nhóm**. Trò chuyện đã gỡ; quản lý khung giờ tích hợp trong lịch sân. Hai file `chat.html` và `venue-slot-management.html` chỉ chuyển hướng.

## Phân công xây dựng

Thành viên 1 xây dựng người chơi trên `feat/player`; Thành viên 2 xây dựng chủ sân trên `feat/venue`; Thành viên 3 xây dựng điều phối CLB trên `feat/organizer`; Thành viên 4 xây dựng quản trị viên trên `feat/admin`. Các phần còn lại làm chung.

## Cấu trúc và chạy thử

Trong web_demo_source_code: các file HTML là điểm vào; `css/` chứa kiểu hiển thị; `js/` chứa xử lý/dữ liệu; `assets/` chứa ảnh; `docs/` và `design/` chứa tài liệu; `tests/` chứa máy chủ và kiểm thử.

Chạy `index.html` bằng Live Server, hoặc chạy `npm start` trong web_demo_source_code và mở http://127.0.0.1:4173. Website hỗ trợ mobile và sáng/tối. Dữ liệu lưu cục bộ bằng localStorage; OTP email và hai trải nghiệm AI được mô phỏng, chưa có backend, email hoặc thanh toán thật.

Xem [README và tài khoản mẫu](../web_demo_source_code/README.md), [màn hình](../web_demo_source_code/docs/screen-list.md), [luồng sử dụng](../web_demo_source_code/docs/user-flows.md) và [phân công 4 vai trò](../web_demo_source_code/docs/team-assignment.md).

[Quay lại giới thiệu dự án](../README.md)

## Đọc code sau khi tách role

Controller chính nằm trong `js/player.js`, `js/venue.js`, `js/organizer.js`, `js/admin.js`; CSS CLB dùng `organizer.css` riêng. Xem [bản đồ code và hướng dẫn vấn đáp](../web_demo_source_code/docs/code-map.md). JSON Server chưa được tích hợp.
