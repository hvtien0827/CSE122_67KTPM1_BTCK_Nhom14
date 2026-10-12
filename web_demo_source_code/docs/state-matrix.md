# Ma trận trạng thái

| Chức năng | Bình thường / tải | Rỗng / lỗi | Trạng thái nghiệp vụ | Khôi phục |
|---|---|---|---|---|
| Đăng nhập | nhập form, xử lý và khóa nút | sai thông tin, chưa xác minh, tài khoản khóa | phiên ghi nhớ hoặc phiên tab | thử lại / xác minh / khôi phục |
| Đăng ký | nhập form, xử lý | thiếu dữ liệu, email trùng, mật khẩu không khớp | chưa xác minh → xác minh | sửa input |
| OTP | nhập 6 số, đếm ngược | mã sai, hết hạn, chưa có yêu cầu | đã xác minh | gửi lại sau 60s / đổi email |
| Tìm sân/trận | render dữ liệu cục bộ, bộ lọc | không có kết quả | còn chỗ / đủ người / hết giờ | xóa bộ lọc |
| Booking | gửi form, hiện kết quả | slot bị giữ, trùng lịch | pending / approved / rejected / cancelled / completed | chọn slot khác / xem lịch |
| CRUD | form, lưu, toast | validation, ràng buộc, danh sách rỗng | active/open / archived/disabled | sửa input / tạo mới |
| Skill Match | đang xử lý, khóa submit | lỗi mô phỏng, không có trận phù hợp | chọn / lưu / từ chối | sửa tiêu chí / tạo lại / tìm thủ công |
| Team Balancer | đang xử lý | <2 người, thiếu trình độ, lỗi mô phỏng, lineup sai | đề xuất / sửa / lưu / xóa | chỉnh roster / chia thủ công |
| No-show Risk | đang xử lý | <3 trận lịch sử, lỗi mô phỏng | chấp nhận / sửa / lưu / từ chối | xử lý booking thủ công |
| Thông báo/chat | danh sách | chưa có tin | chưa đọc / đã đọc | gửi tin / đọc tất cả |
| Lưu trữ cục bộ | nạp ứng dụng | dữ liệu hỏng / ghi thất bại | dữ liệu bảo toàn khi lỗi | Cài đặt → khôi phục mẫu |

Không giả tạo độ trễ mạng cho bảng dữ liệu cục bộ. Loading có ở lúc mở ứng dụng, xử lý auth và ba AI. Các trạng thái lỗi auth nằm cùng URL thay vì tách thêm trang vô nghĩa.
