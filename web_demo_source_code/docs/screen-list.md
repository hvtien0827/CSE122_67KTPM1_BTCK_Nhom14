# Bảng kiểm kê màn hình hiện hành

**42 trang chức năng, 4 vai trò; 44 file HTML khi tính thêm 2 URL chuyển hướng.** Danh mục đối chiếu theo [pages.json](pages.json) và mã nguồn hiện tại. Các trang dùng chung do cả nhóm phối hợp; mỗi người phụ trách một vai trò theo [phân công](team-assignment.md).

Bảng này không xác nhận giảng viên đã duyệt hay minh chứng đã hoàn tất. Nhóm bổ sung Figma và OBS/kiểm tra thực tế theo đề bài. CRUD dùng dialog trên trang quản lý; lỗi/tải là trạng thái của trang.

| Mã | Vai trò | Mục tiêu / Nhiệm vụ | Màn hình | Tệp | CRUD / Trạng thái | AI | Phụ trách | Module |
|---|---|---|---|---|---|---|---|---|
| UI-01 | Dùng chung | Kết nối cộng đồng thể thao | Kết nối cộng đồng thể thao | `index.html` | R; bình thường / rỗng / lỗi | — | Cả nhóm | Player.home |
| UI-02 | Dùng chung | Đăng nhập | Đăng nhập | `login.html` | Form / xử lý / lỗi / thành công theo bước | — | Cả nhóm | Auth.render / js/auth.js |
| UI-03 | Dùng chung | Tạo tài khoản | Tạo tài khoản | `register.html` | Form / xử lý / lỗi / thành công theo bước | — | Cả nhóm | Auth.render / js/auth.js |
| UI-04 | Dùng chung | Quên mật khẩu | Quên mật khẩu | `forgot-password.html` | Form / xử lý / lỗi / thành công theo bước | — | Cả nhóm | Auth.render / js/auth.js |
| UI-05 | Dùng chung | Đã gửi mã xác minh | Đã gửi mã xác minh | `verification-sent.html` | Form / xử lý / lỗi / thành công theo bước | — | Cả nhóm | Auth.render / js/auth.js |
| UI-06 | Dùng chung | Xác minh email | Xác minh email | `verify-email.html` | Form / xử lý / lỗi / thành công theo bước | — | Cả nhóm | Auth.render / js/auth.js |
| UI-07 | Dùng chung | Đăng ký thành công | Đăng ký thành công | `registration-success.html` | Form / xử lý / lỗi / thành công theo bước | — | Cả nhóm | Auth.render / js/auth.js |
| UI-08 | Dùng chung | Yêu cầu khôi phục | Yêu cầu khôi phục | `recovery-sent.html` | Form / xử lý / lỗi / thành công theo bước | — | Cả nhóm | Auth.render / js/auth.js |
| UI-09 | Dùng chung | Xác minh khôi phục | Xác minh khôi phục | `verify-reset.html` | Form / xử lý / lỗi / thành công theo bước | — | Cả nhóm | Auth.render / js/auth.js |
| UI-10 | Dùng chung | Đặt mật khẩu mới | Đặt mật khẩu mới | `reset-password.html` | Form / xử lý / lỗi / thành công theo bước | — | Cả nhóm | Auth.render / js/auth.js |
| UI-11 | Dùng chung | Đổi mật khẩu thành công | Đổi mật khẩu thành công | `reset-success.html` | Form / xử lý / lỗi / thành công theo bước | — | Cả nhóm | Auth.render / js/auth.js |
| UI-12 | Người chơi | Tìm sân | Tìm sân | `player-court-search.html` | R; bình thường / rỗng / lỗi | — | Thành viên 1 | Player.searchCourts |
| UI-13 | Người chơi | Tìm trận đấu | Tìm trận đấu | `player-open-matches.html` | R; bình thường / rỗng / lỗi | — | Thành viên 1 | Player.openMatches |
| UI-14 | Người chơi | Hoạt động của tôi | Hoạt động của tôi | `player-my-sports.html` | R/U; hủy booking, rút/hủy trận | — | Thành viên 1 | Player.mySports |
| UI-15 | Người chơi | Chi tiết sân | Chi tiết sân | `court-detail.html` | R; bình thường / rỗng / lỗi | — | Thành viên 1 | Player.courtDetail |
| UI-16 | Người chơi | Xác nhận đặt sân | Xác nhận đặt sân | `booking.html` | C; pending / validation / slot không trống | — | Thành viên 1 | Player.bookingPage |
| UI-17 | Người chơi | Đặt sân thành công | Đặt sân thành công | `booking-success.html` | R; bình thường / rỗng / lỗi | — | Thành viên 1 | js/app.js |
| UI-18 | Người chơi | Chi tiết trận | Chi tiết trận | `match-detail.html` | R; bình thường / rỗng / lỗi | — | Thành viên 1 | Player.matchDetail |
| UI-19 | Người chơi | Tạo và sửa trận | Tạo và sửa trận | `player-match-create.html` | C/U; validation / chưa có booking phù hợp | — | Thành viên 1 | Player.matchCreate |
| UI-20 | Người chơi | Ghép trận thông minh | Ghép trận thông minh | `player-skill-match.html` | Nhập / tải / kết quả / sửa / lưu / từ chối / lỗi | Skill Match | Thành viên 1 | AI.skill |
| UI-21 | Chủ sân | Quản lý sân | Quản lý sân | `venue-court-management.html` | C/R/U; lịch khung giờ trong cửa sổ lịch sân | — | Thành viên 2 | Manage.courts |
| UI-22 | Chủ sân | Quản lý đặt sân | Quản lý đặt sân | `venue-booking-management.html` | C/R/U; hủy/lưu trữ/vô hiệu hóa khi phù hợp | — | Thành viên 2 | Manage.bookings |
| UI-23 | Chủ sân | Cảnh báo vắng mặt | Cảnh báo vắng mặt | `venue-no-show-risk.html` | Nhập / tải / kết quả / sửa / lưu / từ chối / lỗi | No-show Risk | Thành viên 2 | AI.risk |
| UI-24 | Điều phối CLB | Sự kiện CLB | Sự kiện CLB | `organizer-event-management.html` | C/R/U; hủy/lưu trữ/vô hiệu hóa khi phù hợp | — | Thành viên 3 | Manage.events |
| UI-25 | Điều phối CLB | Chi tiết sự kiện | Chi tiết sự kiện | `organizer-event-detail.html` | R; bình thường / rỗng / lỗi | — | Thành viên 3 | Manage.eventDetail |
| UI-26 | Điều phối CLB | Danh sách người chơi | Danh sách người chơi | `organizer-player-roster.html` | C/R/U; hủy/lưu trữ/vô hiệu hóa khi phù hợp | — | Thành viên 3 | Manage.roster |
| UI-27 | Điều phối CLB | Đội hình và chia đội | Đội hình và chia đội | `organizer-team-lineup.html` | Nhập / tải / kết quả / sửa / lưu / từ chối / lỗi | Team Balancer | Thành viên 3 | AI.teams |
| UI-28 | Quản trị viên | Quản lý môn thể thao | Quản lý môn thể thao | `admin-sport-management.html` | C/R/U; hủy/lưu trữ/vô hiệu hóa khi phù hợp | — | Thành viên 4 | Manage.sports |
| UI-29 | Quản trị viên | Quản lý tài khoản | Quản lý tài khoản | `admin-user-management.html` | C/R/U; hủy/lưu trữ/vô hiệu hóa khi phù hợp | — | Thành viên 4 | Manage.users |
| UI-30 | Quản trị viên | Báo cáo hoạt động | Báo cáo hoạt động | `admin-sports-report.html` | C/R/U; hủy/lưu trữ/vô hiệu hóa khi phù hợp | — | Thành viên 4 | Manage.reports |
| UI-31 | Dùng chung | Hồ sơ cá nhân | Hồ sơ cá nhân | `profile.html` | R; bình thường / rỗng / lỗi | — | Cả nhóm | js/app.js |
| UI-32 | Dùng chung | Cài đặt | Cài đặt | `settings.html` | R; bình thường / rỗng / lỗi | — | Cả nhóm | js/app.js |
| UI-33 | Dùng chung | Thông báo | Thông báo | `notifications.html` | R; bình thường / rỗng / lỗi | — | Cả nhóm | js/app.js |
| UI-34 | Dùng chung | Trung tâm hỗ trợ | Trung tâm hỗ trợ | `help.html` | R; bình thường / rỗng / lỗi | — | Cả nhóm | js/app.js |
| UI-35 | Dùng chung | Điều khoản sử dụng | Điều khoản sử dụng | `terms.html` | R; bình thường / rỗng / lỗi | — | Cả nhóm | js/app.js |
| UI-36 | Dùng chung | Chính sách bảo mật | Chính sách bảo mật | `privacy.html` | R; bình thường / rỗng / lỗi | — | Cả nhóm | js/app.js |
| UI-37 | Dùng chung | Không có quyền truy cập | Không có quyền truy cập | `403.html` | Lỗi; quay lại / đổi tài khoản | — | Cả nhóm | js/app.js |
| UI-38 | Dùng chung | Không tìm thấy trang | Không tìm thấy trang | `404.html` | Lỗi; quay lại / đổi tài khoản | — | Cả nhóm | js/app.js |
| UI-39 | Chủ sân | Thống kê doanh thu | Thống kê doanh thu | `venue-revenue.html` | R; lọc ngày/tuần/tháng/năm và sân | — | Thành viên 2 | Community.revenue |
| UI-40 | Chủ sân | Đánh giá sân | Đánh giá sân | `venue-reviews.html` | R; lọc đánh giá theo sân | — | Thành viên 2 | Community.courtReviews |
| UI-41 | Dùng chung | Hồ sơ công khai | Hồ sơ công khai | `profile-public.html` | R; điện thoại công khai, mạng xã hội, thống kê | — | Cả nhóm | Community.publicProfile |
| UI-42 | Quản trị viên | Báo cáo người chơi | Báo cáo người chơi | `admin-player-reports.html` | R/U; xem xét báo cáo | — | Thành viên 4 | Community.reports |

## URL chuyển hướng tương thích

- `chat.html` → `player-my-sports.html`: trò chuyện đã gỡ.
- `venue-slot-management.html` → `venue-court-management.html`: quản lý khung giờ trong lịch sân.

Hai file này không tính là trang chức năng. Các phần bổ sung doanh thu, đánh giá sân, hồ sơ công khai và báo cáo người chơi đã được liệt kê trong bảng hiện hành.
