# Phân công 4 thành viên theo 4 vai trò

Nhóm giữ Người chơi, Chủ sân, Điều phối CLB và Quản trị viên theo đề bài gốc. Mỗi thành viên phụ trách một vai trò; các phần còn lại do cả nhóm phối hợp làm. Bảng này là kế hoạch phân công, không phải ghi nhận tác giả hoặc công việc đã hoàn thành.

| Thành viên | Vai trò phụ trách | Công việc chính |
|---|---|---|
| Thành viên 1 | Người chơi | Tìm/đặt sân, hoạt động, tạo/tham gia trận, Skill Match, đánh giá sân và bạn chơi. |
| Thành viên 2 | Chủ sân | Quản lý sân và lịch khung giờ, xử lý đơn đặt, No-show Risk, doanh thu và đánh giá sân. |
| Thành viên 3 | Điều phối CLB | Quản lý sự kiện, danh sách người chơi, đội hình và Team Balancer. |
| Thành viên 4 | Quản trị viên | Quản lý môn thể thao, tài khoản, báo cáo hoạt động/CSV và xử lý báo cáo người chơi. |

## Phạm vi từng người

- **Thành viên 1:** các trang người chơi, chi tiết sân/trận và đặt sân; phần Skill Match trong `js/ai.js`, xử lý người chơi trong `js/player.js` và đánh giá/báo cáo trong `js/community.js`.
- **Thành viên 2:** các trang chủ sân; quản lý sân/đơn trong `js/manage.js`, No-show Risk trong `js/ai.js`, lịch sân/doanh thu/đánh giá trong `js/community.js`.
- **Thành viên 3:** 4 trang `organizer-*.html`; xử lý sự kiện, roster trong `js/manage.js` và Team Balancer trong `js/ai.js`.
- **Thành viên 4:** các trang `admin-*.html`; xử lý môn/tài khoản/báo cáo hoạt động trong `js/manage.js` và báo cáo người chơi trong `js/community.js`.

Tên trang cụ thể và người phụ trách xem [bảng màn hình](screen-list.md). Một module có thể chứa chức năng của nhiều vai trò; thống nhất hàm/phần cần sửa trước khi làm.

## Phần làm chung

- Trang chủ và toàn bộ luồng đăng nhập/đăng ký, xác minh email, khôi phục mật khẩu.
- Hồ sơ cá nhân/công khai, cài đặt, thông báo, trợ giúp, điều khoản, bảo mật và trang lỗi.
- Thành phần dùng chung: header, menu, form, dialog, thông báo kết quả, CSS, responsive và sáng/tối.
- Dữ liệu mẫu/localStorage, phân quyền frontend, tích hợp các luồng liên quan giữa vai trò.
- Thiết kế Figma bổ sung, kiểm thử, tài liệu, báo cáo sử dụng AI, slide và minh chứng OBS.

Phần làm chung được chia thành đầu việc nhỏ có người thực hiện và người kiểm tra, không mặc định giao riêng cho một thành viên. Trò chuyện đã gỡ; hai URL chuyển hướng cũ được kiểm tra chung.

## Phối hợp và kiểm tra

Review chéo Thành viên 1–2 và Thành viên 3–4. Kiểm tra cùng nhau các luồng đặt sân → chủ sân duyệt → người chơi tạo trận; CLB → danh sách → chia đội; báo cáo người chơi → admin xử lý.

Mỗi người phải tự hiểu, sửa và giải thích HTML/CSS/JS phần mình; cập nhật công việc và minh chứng thực tế. Điền họ tên/MSSV khi chốt nhóm. Mỗi đầu việc dùng nhánh riêng, mở Pull Request để thành viên khác xem và kiểm tra trước khi ghép vào main.
