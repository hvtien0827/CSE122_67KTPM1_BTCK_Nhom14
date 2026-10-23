# Vai trò và phạm vi hiện tại

Nguồn: [đề bài gốc](../../docs/BTL-28_courtconnect-at-san-va-ghep-nguoi-choi-theo-trinh-o.md), [danh mục trang](pages.json) và mã nguồn web_demo_source_code. Nhóm có 4 thành viên, mỗi người xây dựng một vai trò.

| Vai trò | Thành viên / nhánh | Phần xây dựng | AI |
|---|---|---|---|
| Người chơi | Thành viên 1 / `feat/player` | Tìm/đặt sân, hoạt động, tạo/tham gia trận, đánh giá sân/bạn chơi và báo cáo | Skill Match |
| Chủ sân | Thành viên 2 / `feat/venue` | Quản lý sân/lịch khung giờ, đơn đặt, doanh thu và đánh giá sân | — |
| Điều phối CLB | Thành viên 3 / `feat/organizer` | Sự kiện, danh sách người chơi, đội hình và chia đội | Team Balancer |
| Quản trị viên | Thành viên 4 / `feat/admin` | Môn thể thao, tài khoản, báo cáo hoạt động/CSV, báo cáo người chơi | Xem hoạt động, không có AI thứ tư |

**Phần làm chung:** trang chủ, luồng tài khoản, hồ sơ cá nhân/công khai, cài đặt, thông báo, trợ giúp, điều khoản, bảo mật, lỗi; thành phần UI, dữ liệu, phân quyền frontend, responsive, sáng/tối, tích hợp và kiểm thử. Xem [phân công chi tiết](team-assignment.md).

Khách được xem danh sách/chi tiết sân và trận. Đặt sân, tham gia và tạo trận cần đăng nhập vai trò người chơi; trang cá nhân cần phiên. Sai vai trò hiển thị 403. Đăng ký công khai chỉ tạo người chơi; admin có thể tạo tài khoản vai trò khác trong demo.

Bản hiện tại có 41 trang chức năng. `chat.html` và `venue-slot-management.html` chỉ chuyển hướng: trò chuyện đã gỡ, khung giờ quản lý ngay trong cửa sổ lịch sân. Dữ liệu và phân quyền là mô phỏng localStorage.
