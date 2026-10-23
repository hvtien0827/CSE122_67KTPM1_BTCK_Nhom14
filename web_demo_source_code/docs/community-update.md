# Cập nhật luồng cộng đồng và chủ sân — 24/09/2026

- Chủ sân: bấm tên sân trong Quản lý sân để mở lịch 7 ngày theo trục giờ. Lịch phân biệt trống, chờ duyệt, đã thuê, hoàn thành và đã đóng. Phần chưa mở lịch không được tính là trống. Có tạo/sửa/đóng khung giờ ngay trong lịch; không cho sửa lịch đã có đơn.
- Thống kê doanh thu: lọc ngày, tuần (thứ Hai–Chủ nhật), tháng, năm và sân thuộc chủ hiện tại. Chỉ đơn hoàn thành được tính doanh thu; đơn đã duyệt hiển thị riêng là dự kiến. Ngày tham chiếu là ngày sử dụng sân, chưa mô phỏng thanh toán thực tế.
- Đánh giá sân: chủ sân xem phản hồi theo sân; người thuê đánh giá tại Hoạt động của tôi sau khi đơn hoàn thành và giờ thuê kết thúc. Mỗi lượt thuê có một đánh giá, có thể sửa.
- Người chơi: thông số ở gợi ý ghép trận, chi tiết trận và hồ sơ công khai. Tỉ lệ hủy/rút dựa trên thao tác được ghi nhận của chính người chơi; tỉ lệ ghép thành công là số trận từng đủ người chia tổng trận tham gia, kể cả đã rút. Không phải tỉ lệ thắng hay dự đoán AI. Lịch cũ chưa ghi nhận việc rút không được suy đoán bổ sung.
- Trong trận đã hoàn thành: đánh giá bạn chơi 1–5 sao, chọn nhiều nhãn và bình luận; báo cáo gửi vào trang Báo cáo người chơi của admin. Chỉ thành viên cùng trận mới được gửi, không tự đánh giá. Một báo cáo/người/trận; admin đánh dấu đã xem xét, không tự động khóa tài khoản.
- Tạo trận có tab riêng. Trò chuyện đã gỡ khỏi giao diện và chức năng. URL chat cũ chuyển về hoạt động; URL quản lý khung giờ cũ chuyển về quản lý sân.
- Admin lọc tài khoản bằng nhóm vai trò; kết hợp được với tìm kiếm/trạng thái.
- Mọi vai trò có số điện thoại ẩn mặc định, tùy chọn công khai. Liên kết Facebook, Instagram, TikTok, YouTube, Zalo chỉ hiện biểu tượng ở hồ sơ công khai, mở tab mới. Chỉ nhận https đúng tên miền dịch vụ.
- Dữ liệu hiện có được giữ lại. Nâng cấp một lần thêm lịch mẫu cho tài khoản người chơi mặc định (3 trận đã đấu, 2 trận sắp đấu), bỏ qua nếu khung giờ trùng. Không cần reset. Tài khoản mới không tự được gán lịch mẫu.

## Kiểm tra

`tests/community.cjs`: đánh giá sân/bạn chơi, báo cáo và xử lý admin, chặn đánh giá trận chưa hoàn thành, lưu/ẩn/hiện điện thoại, kiểm tra liên kết mạng xã hội, tạo lịch, lọc doanh thu, lọc tài khoản và menu mobile.

`tests/smoke.cjs`, `tests/theme.cjs`: kiểm tra các trang hiện hành trên desktop/mobile và giao diện sáng/tối. `docs/pages.json` là danh mục hiện hành; URL chuyển hướng cũ không tính là màn hình chức năng.

Đây vẫn là nguyên mẫu HTML/CSS/JS dùng localStorage. Quyền và tùy chọn riêng tư là hành vi giao diện demo, không thay thế kiểm soát truy cập phía máy chủ.

## Kết quả đã ghi nhận của đợt cập nhật (lịch sử)

- Kiểm tra trang: 84 lượt (42 trang × 2 kích thước), không lỗi tải hoặc tràn trang.
- Giao diện: 168 lượt kiểm tra sáng/tối, lưu lựa chọn, bàn phím và đồng bộ tab đều đạt.
- Luồng nghiệp vụ: 38 kiểm tra đạt; tình huống biên: 35 kiểm tra đạt.
- Bộ kiểm tra community đạt toàn bộ luồng mới. Kiểm tra bổ sung xác nhận nâng cấp không nhân đôi dữ liệu, giữ hồ sơ cũ, chặn tự đánh giá/khác người thuê/không cùng trận, ghi nhận rút trận và lịch dark mode trên mobile.

## Tối ưu hoạt động và mobile

- Gửi đánh giá/báo cáo thành công hiện thông báo tương ứng sau khi trang cập nhật; lỗi vẫn nằm trong biểu mẫu.
- Hoạt động của tôi có bộ lọc Tất cả / Lịch đặt sân / Trận đấu của tôi, giữ lựa chọn khi cập nhật trong trang.
- Mobile: bảng hoạt động và quản lý đặt sân chuyển thành thẻ có nhãn và nút thao tác; lịch sân chuyển thành danh sách theo ngày với nút ngày trước/sau. Desktop giữ bảng và lịch tuần.
- `tests/mobile-activities.cjs`: kiểm tra ba thông báo, bộ lọc, mobile 320/390/760 px, mở chi tiết khung giờ và lịch desktop; đã chạy đạt.


## Đồng bộ với bản hiện tại

Bản đang dùng là web_demo_source_code, 4 vai trò, 41 trang chức năng và 2 URL chuyển hướng. Phân công: Người chơi — `feat/player`; Chủ sân — `feat/venue`; Điều phối CLB — `feat/organizer`; Quản trị viên — `feat/admin`; còn lại làm chung. Xem [phân công](team-assignment.md).

Sửa lỗi tương thích dữ liệu ngày 12/10/2026: tải lại sẽ khôi phục tài khoản/dữ liệu CLB bị ngừng hỗ trợ trong bản 28 trang, giữ khóa thủ công và dữ liệu hiện hành. Kết quả kiểm chứng mới tại [test-report.md](test-report.md).
