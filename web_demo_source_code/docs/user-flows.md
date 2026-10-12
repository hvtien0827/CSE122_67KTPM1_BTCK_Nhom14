# Luồng nghiệp vụ

## Đặt sân và ghép trận
```mermaid
flowchart TD
 A[Khách xem sân và trận] --> B[Đăng nhập Người chơi]
 B --> C[Chọn sân và slot trống]
 C --> D[Gửi booking chờ duyệt / giữ slot]
 D --> E[Chủ sân xem và phân tích rủi ro]
 E --> F{Quyết định thủ công}
 F -->|Duyệt| G[Người chơi nhận thông báo]
 F -->|Từ chối / Hủy| H[Mở lại slot]
 G --> I[Tạo trận trên booking đã duyệt]
 I --> J[Người khác xem hoặc nhận gợi ý Skill Match]
 J --> K[Tham gia khi còn chỗ và không trùng lịch]
 K --> L[Hoạt động của tôi]
 L --> M[Rút trận / Hủy trận / Hủy booking]
```

Hủy riêng trận không tự hủy booking. Hủy booking sẽ hủy trận liên quan. Chủ sân hoàn thành booking sau giờ kết thúc; trận liên quan cũng chuyển hoàn thành. Booking đã hoàn thành được giữ trong lịch sử.

## Điều phối CLB
Sự kiện → danh sách → thêm/bỏ người → đề xuất hai đội → xem giải thích → chuyển người giữa đội → chấp nhận/lưu hoặc từ chối/tạo lại. Danh sách thay đổi sẽ xóa lineup cũ để không lưu người đã bị bỏ khỏi sự kiện. Lưu đội hình kiểm tra không trùng/thiếu người và chênh số lượng tối đa 1.

## Quản trị
Danh mục môn → tạo/sửa/lưu trữ khi không còn ràng buộc. Tài khoản → tạo/sửa/vô hiệu hóa/kích hoạt. Báo cáo → chọn khoảng ngày → lưu snapshot → sửa/tạo lại snapshot → tải CSV hoặc lưu trữ.

## Đánh giá và báo cáo sau khi chơi
Người chơi → Hoạt động của tôi → lọc lịch đặt sân/trận đấu → chọn lượt đã hoàn thành → đánh giá sân hoặc bạn chơi bằng sao, nhãn và bình luận → gửi → thông báo thành công. Báo cáo bạn chơi trong cùng trận → gửi → admin mở Báo cáo người chơi → xem xét. Không tự đánh giá/báo cáo hoặc gửi khi chưa đủ điều kiện.

## Lịch sân và doanh thu
Chủ sân → Quản lý sân → bấm sân → lịch tuần trên desktop hoặc danh sách theo ngày trên mobile → chọn/tạo/sửa/đóng khung giờ. Chủ sân → Doanh thu → chọn ngày/tuần/tháng/năm và sân → xem đơn hoàn thành và doanh thu; đơn đã duyệt là dự kiến.

## Hồ sơ công khai
Mọi vai trò → Hồ sơ → cập nhật điện thoại và tùy chọn công khai, các liên kết mạng xã hội → lưu → xem hồ sơ công khai. Điện thoại ẩn mặc định; liên kết mạng xã hội hiển thị biểu tượng.

## Tài khoản
Đăng ký → gửi mã mô phỏng → nhập OTP → xác minh → đăng nhập. Quên mật khẩu → gửi yêu cầu → OTP → đặt mật khẩu mới → đăng nhập. Mã sai/hết hạn giữ người dùng tại bước kiểm tra và cho gửi lại theo thời gian chờ.

## Sơ đồ trang
- index → tìm sân → chi tiết sân → booking → kết quả → hoạt động cá nhân.
- index → tìm trận → chi tiết trận → hoạt động cá nhân; hoạt động → tạo/sửa trận.
- đăng nhập → trang đầu theo role → menu chức năng và tài khoản.
- hồ sơ, thông báo, cài đặt và trợ giúp dùng chung.
- các màn hình auth là trang riêng theo bản Figma; biến thể lỗi/tải là trạng thái cùng trang.


Nếu đã dùng bản 28 trang, tải lại bản hiện tại sẽ khôi phục dữ liệu CLB bị ngừng hỗ trợ; không cần xóa localStorage. Tài khoản bị khóa thủ công vẫn cần admin xử lý. Trò chuyện không còn là luồng chức năng.
