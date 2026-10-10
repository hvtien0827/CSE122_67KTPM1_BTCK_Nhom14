# Đối chiếu yêu cầu mới

Nguồn: `phan_loai_giao_dien_he_thong.md` và nội dung yêu cầu thực thi 28 trang. Xem `refactor-28-plan.md` và `screen-list.md` để biết vị trí mỗi chức năng.

Đã gộp: thông tin sân/đặt sân/thành công, thông tin trận, hồ sơ người khác (popup), quyền riêng tư/điều khoản, lỗi 403/404. Thành công đăng ký/đổi mật khẩu là trạng thái trong trang. `verify-email.html` giữ tên nhưng xác thực số điện thoại.

Đã thêm: duyệt chủ sân, duyệt đề xuất sân, yêu cầu vào trận, báo cáo sân/người dùng có bằng chứng, xử lý cảnh báo/khóa/không xử phạt, gửi/thu hồi thông báo, chat trở lại.

Đã bỏ: CLB/sự kiện/roster/chia đội, quản lý môn riêng, báo cáo doanh thu CSV riêng, mạng xã hội công khai, đánh giá sao đối thủ, các HTML ngoài danh mục. Sports vẫn là dữ liệu phục vụ lọc/chọn, không có CRUD taxonomy riêng.

Các chức năng hiện hành và liên kết thuộc đúng 28 HTML; không giữ redirect HTML. Tính năng mô phỏng được nêu rõ, không nhận là SMS thật/AI thật/chat qua mạng.
