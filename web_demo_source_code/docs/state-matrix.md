# Ma trận trạng thái

| Chức năng | Bình thường / tải | Rỗng / lỗi | Trạng thái nghiệp vụ | Khôi phục |
|---|---|---|---|---|
| Đăng nhập | nhập form, xử lý và khóa nút | sai thông tin, chưa xác minh, tài khoản khóa | phiên ghi nhớ hoặc phiên tab | thử lại / xác minh / khôi phục |
| Đăng ký | nhập form, xử lý | thiếu dữ liệu, email trùng, mật khẩu không khớp | chưa xác minh → xác minh | sửa input |
| OTP | nhập 6 số, đếm ngược | mã sai, hết hạn, chưa có yêu cầu | đã xác minh | gửi lại sau 60s / đổi email |
| Tìm sân/trận | render dữ liệu cục bộ, bộ lọc | không có kết quả | còn chỗ / đủ người / hết giờ | xóa bộ lọc |
| Booking | gửi form, hiện kết quả | slot bị giữ, trùng lịch | pending / approved / rejected / cancelled / completed | chọn slot khác / xem lịch |
| CRUD | form, lưu, toast | validation, ràng buộc, danh sách rỗng | active/open / archived/disabled | sửa input / tạo mới |
| Skill Match | đang xử lý, khóa submit | lỗi xử lý dữ liệu, không có trận phù hợp | chọn / lưu / từ chối | sửa tiêu chí / tạo lại / tìm thủ công |
| Team Balancer | đang xử lý | <2 người, thiếu trình độ, lỗi xử lý dữ liệu, lineup sai | đề xuất / sửa / lưu / xóa | chỉnh roster / chia thủ công |
| No-show Risk | đang xử lý | <3 trận lịch sử, lỗi xử lý dữ liệu | chấp nhận / sửa / lưu / từ chối | xử lý booking thủ công |

Công tắc “Kiểm tra tình huống AI” đã được gỡ khỏi các trang sử dụng. Trường hợp lỗi vẫn được kiểm tra bằng helper `tests/helpers/inject-ai-failure.cjs`, tiêm lỗi một lần vào phụ thuộc dữ liệu rồi tự khôi phục; không cần thêm chế độ lỗi vào mã sản phẩm.
| Thông báo | danh sách | chưa có thông báo | chưa đọc / đã đọc | đọc từng thông báo / đọc tất cả |
| Lịch sân | lịch tuần desktop / danh sách ngày mobile | chưa mở slot, slot trùng hoặc đã có đơn | trống / chờ duyệt / đã thuê / hoàn thành / đã đóng | đổi ngày / sửa lịch hợp lệ |
| Doanh thu | lọc ngày/tuần/tháng/năm và sân | không có đơn phù hợp | hoàn thành tính doanh thu / đã duyệt là dự kiến | đổi bộ lọc |
| Đánh giá sân/bạn chơi | form sao, nhãn và bình luận | chưa đủ điều kiện, validation | gửi/sửa đánh giá, thông báo thành công | sửa nội dung / thử lại |
| Báo cáo người chơi | nhập và gửi báo cáo | không cùng trận, tự báo cáo, trùng báo cáo | pending / resolved, thông báo gửi thành công | admin xem xét |
| Hồ sơ công khai | thông số, biểu tượng mạng xã hội | người dùng không hợp lệ, link sai tên miền | điện thoại ẩn/công khai | chỉnh hồ sơ cá nhân |
| Lưu trữ cục bộ | nạp ứng dụng | dữ liệu hỏng / ghi thất bại | dữ liệu bảo toàn khi lỗi | Cài đặt → khôi phục mẫu |

Không giả tạo độ trễ mạng cho bảng dữ liệu cục bộ. Loading có ở lúc mở ứng dụng, xử lý auth và ba AI. Các trạng thái lỗi auth nằm cùng URL thay vì tách thêm trang vô nghĩa.


Khi nạp dữ liệu từ bản 28 trang, khôi phục một lần các organizer bị khóa do ngừng hỗ trợ vai trò và dữ liệu lưu trữ. Giữ khóa thủ công và không nhân đôi khi tải lại. Trò chuyện đã gỡ, hai URL cũ chỉ chuyển hướng.
