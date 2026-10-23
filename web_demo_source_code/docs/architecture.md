# Kiến trúc và dữ liệu

## Nguyên tắc

HTML nhiều trang chứa bố cục, nội dung chính, form và template popup. CSS có hai file luôn dùng chung (`common.css`, `navigation.css`); lịch ngày chỉ được nạp ở trang cần dùng. Tổng cộng có ba file thành phần chung (`common.css`, `navigation.css`, `date-picker.css`) và sáu file theo nhóm trang (`player.css`, `venue.css`, `organizer.css`, `admin.css`, `auth.css`, `home.css`). JavaScript xử lý dữ liệu, sự kiện, bộ lọc và kiểm tra form; `views.js` cập nhật các vùng dữ liệu đã đánh dấu trong HTML, giữ nguyên bố cục khi lọc/lưu. Xem [hướng dẫn cấu trúc frontend](frontend-structure.md).

Không cần framework, bước build hoặc API bên ngoài để chạy website. `store.js` khởi tạo dữ liệu mẫu và nâng cấp dữ liệu cộng đồng đúng một lần, sau đó đọc localStorage `courtconnect.v1`. Mọi thay đổi đi qua hàm nghiệp vụ và `transaction()`; nếu ghi thất bại thì khôi phục trạng thái trước đó trong bộ nhớ. Dữ liệu hỏng được báo và yêu cầu khôi phục trước khi tiếp tục ghi.

## Liên kết

| Thực thể | Liên kết / ý nghĩa |
|---|---|
| users | danh tính mẫu, email, role, verified, status |
| players | userId tùy chọn; levels theo sportId; lịch sử mẫu played/noShows |
| sports | danh mục môn |
| courts | sportId, ownerId → users |
| slots | courtId, date/start/end, giá toàn slot |
| bookings | slotId, playerId → users; trạng thái |
| matches | slotId, hostId, playerIds, trình độ, sức chứa |
| events | organizerId, sportId, playerIds; teams a/b |
| reports | khoảng ngày, snapshot số đơn và doanh thu hoàn thành |
| notifications | userId, nội dung, href, read |
| aiHistory | người dùng, loại, đầu vào, kết quả, saved/rejected |
| courtReviews / opponentReviews | đánh giá sân theo booking / bạn chơi theo trận |
| playerReports | báo cáo người chơi, admin đánh dấu đã xem xét |
| messages | dữ liệu chat cũ có thể còn trong localStorage; chức năng chat đã gỡ |

## Các quy tắc quan trọng

- `pending` giữ slot, `approved` xác nhận; `rejected`/`cancelled` giải phóng slot.
- Chỉ người chơi sở hữu booking hoặc chủ sân sở hữu sân mới được thực hiện thao tác phù hợp.
- Slot cùng sân không được giao nhau, giá không âm, thời gian phải ở tương lai.
- Tạo trận cần booking được duyệt, chưa bắt đầu, chưa gắn với trận đang mở khác.
- Không tham gia trùng, quá sức chứa hay trùng lịch. Sửa lịch trận phải xét lịch của thành viên.
- Cấm sửa slot đã có booking; cấm lưu trữ sân có đơn pending/approved.
- Người dùng không tự khóa/gỡ quyền quản trị hiện tại. Giữ nguyên role của tài khoản đã tạo để bảo toàn liên kết.
- Đóng sự kiện khóa danh sách; thay đổi roster làm mất hiệu lực lineup cũ.

## Bảo mật của nguyên mẫu

Guard ở giao diện và hàm nghiệp vụ giúp mô phỏng phân quyền, không chống được người dùng sửa JavaScript/localStorage. Mật khẩu là giá trị giả lập trong localStorage. Không dùng dữ liệu thật. Chuỗi nhập vào được escape khi kết xuất; CSV xử lý dấu nháy và tiền tố công thức.

Không có đồng bộ nhiều máy hoặc đặt sân đồng thời như hệ thống production. `storage` event giúp các tab cùng trình duyệt tải lại khi dữ liệu thay đổi.


## Tương thích dữ liệu 4 vai trò

`store.js` dùng `restoreFourRoles()` khi dữ liệu có `scope28` và chưa có `fourRoleRestoreVersion = 1`. Chỉ organizer có đúng lý do ngừng hỗ trợ vai trò mới được khôi phục trạng thái từ bản lưu. Tài khoản khóa thủ công giữ nguyên. Hợp nhất sự kiện, báo cáo, lịch sử AI, đánh giá và hồ sơ mạng xã hội từ `legacy`, ưu tiên bản hiện hành nếu trùng ID. Sau khi ghi thành công, đánh dấu đã khôi phục để không lặp lại.

Controller quản lý tách thành `venue.js`, `organizer.js`, `admin.js`. Các module `ai.js`, `community.js` vẫn là phần xuyên vai trò; nhóm thống nhất hàm cần sửa. Mỗi người sửa HTML và CSS thuộc nhóm giao diện mình phụ trách. `common.css`, UI, auth và dữ liệu dùng chung là trách nhiệm phối hợp của cả nhóm. Xem [phân công](team-assignment.md).
