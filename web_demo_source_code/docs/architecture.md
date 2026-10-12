# Kiến trúc và dữ liệu

## Nguyên tắc

HTML nhiều trang, CSS dùng chung, JavaScript chia theo vai trò. Không dùng framework, build tool hoặc API bên ngoài. `store.js` khởi tạo dữ liệu mẫu đúng một lần, sau đó đọc localStorage `courtconnect.v1`. Mọi thay đổi đi qua hàm nghiệp vụ và `transaction()`; nếu ghi thất bại thì khôi phục trạng thái trước đó trong bộ nhớ. Dữ liệu hỏng được báo và yêu cầu khôi phục trước khi tiếp tục ghi.

## Liên kết

| Thực thể | Liên kết / ý nghĩa |
|---|---|
| users | danh tính mẫu, email, role, verified, status |
| players | userId tùy chọn; levels theo sportId; lịch sử mẫu played/noShows |
| sports | danh mục môn |
| courts | sportId, ownerId → users |
| slots | courtId, date/start/end, giá toàn slot |
| bookings | slotId, playerId → users; trạng thái; nhận định risk |
| matches | slotId, hostId, playerIds, trình độ, sức chứa |
| events | organizerId, sportId, playerIds; teams a/b |
| reports | khoảng ngày, snapshot số đơn và doanh thu hoàn thành |
| notifications | userId, nội dung, href, read |
| aiHistory | người dùng, loại, đầu vào, kết quả, saved/rejected |
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
- Không coi thiếu lịch sử là rủi ro thấp. Không tự từ chối booking theo AI.

## Bảo mật của nguyên mẫu

Guard ở giao diện và hàm nghiệp vụ giúp mô phỏng phân quyền, không chống được người dùng sửa JavaScript/localStorage. Mật khẩu là giá trị giả lập trong localStorage. Không dùng dữ liệu thật. Chuỗi nhập vào được escape khi kết xuất; CSV xử lý dấu nháy và tiền tố công thức.

Không có đồng bộ nhiều máy hoặc đặt sân đồng thời như hệ thống production. `storage` event giúp các tab cùng trình duyệt tải lại khi dữ liệu thay đổi.
