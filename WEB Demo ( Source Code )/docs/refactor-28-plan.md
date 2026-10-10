# Đối chiếu phạm vi 28 trang

| Nhóm yêu cầu | Trang đích | Xử lý |
|---|---|---|
| Đăng nhập/đăng ký/xác thực | login, register, verify-email | Đổi sang xác minh số điện thoại, chọn vai trò, duyệt chủ sân |
| Khôi phục/đổi mật khẩu | forgot-password, verify-reset, reset-password | Gộp thông báo thành công; giữ kiểm tra mã/hạn |
| Chi tiết và đặt sân | player-court-search | Gộp court-detail, booking, booking-success theo tham số |
| Chi tiết và ghép trận | player-open-matches, player-skill-match | Gộp match-detail; đổi tham gia thành yêu cầu |
| Hoạt động và tạo trận | my-activities, player-match-create | Đổi tên, giữ bộ lọc và responsive |
| Yêu cầu tham gia | Join-Requests | Thêm duyệt/từ chối và kiểm tra chỗ/lịch khi duyệt |
| Đặt sân/lịch/rủi ro | venue-booking-management | Gộp lịch tuần/ngày và cảnh báo tự hủy 30 ngày |
| Sân | venue-court-management | Mọi thay đổi gửi admin duyệt |
| Doanh thu | Revenue | Đổi tên, giữ bộ lọc |
| Quản trị | Admin-Dashboard | Gộp quản lý người dùng/sân và duyệt thay đổi sân |
| Duyệt chủ sân | Court-Owner-Approval | Thêm thông tin đăng ký/sân, lý do từ chối |
| Báo cáo vi phạm | Report, Report-Management | Người chơi/chủ sân, bằng chứng, cảnh báo/khóa/bỏ qua |
| Thông báo và chat | notifications, System-Notifications, chat | Khôi phục chat; thêm gửi thông báo |
| Hồ sơ/cài đặt/trợ giúp | profile, settings, help | Bỏ mạng xã hội/hồ sơ trang riêng, đổi mật khẩu qua OTP |
| Điều khoản/lỗi | privacy, error | Gộp terms và 403/404 |
| CLB/chia đội/đánh giá đối thủ | Không còn | Bỏ UI và logic; lưu dữ liệu cũ vào legacy để không mất lịch sử |

Bản ZIP khôi phục đặt ngoài source_code. Không có Git trong thư mục dự án tại thời điểm kiểm tra. Không reset dữ liệu trình duyệt khi nâng cấp.
