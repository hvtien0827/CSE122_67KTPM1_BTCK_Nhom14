# Báo cáo kiểm tra bản 28 trang — 28/09/2026

Môi trường thực chạy: Windows, Node.js, Playwright và Thorium headless; hồ sơ trình duyệt thử nghiệm riêng. Server kiểm thử trên 127.0.0.1:4177. Không dùng dữ liệu trình duyệt của người dùng.

| Bộ kiểm tra | Kết quả |
|---|---|
| smoke.cjs | 224 lượt = 28 trang × 4 kích thước (320, 390, 768, 1440) × 2 theme; không lỗi JS, không tràn trang, không liên kết HTML hỏng (kiểm tra đúng hoa/thường) |
| integration.cjs | 35 kiểm tra đạt: đăng ký/xác thực, chủ sân chờ/từ chối/gửi lại/duyệt, thay đổi sân, đặt/duyệt/tạo trận, yêu cầu/duyệt tham gia, đánh giá, báo cáo/cảnh báo, thông báo, chat, doanh thu, mật khẩu và phân quyền |
| edge-cases.cjs | Các điều kiện chặn, thu hồi, lịch mobile và nâng cấp dữ liệu đều đạt; bộ chạy báo 26 kiểm tra bao gồm kiểm tra không lỗi runtime |

Kiểm tra bổ sung: đếm đệ quy đúng 28 HTML, kiểm tra cú pháp JS, xem ảnh lịch mobile dark mode. Dữ liệu mẫu có trận chờ duyệt thành viên, chủ sân pending/rejected, đề xuất sân, hủy trong 30 ngày, lịch hoàn thành và chat.

Không tuyên bố đã kiểm tra dịch vụ SMS/LLM, thanh toán, chat máy khác, trình duyệt Safari/Firefox hoặc môi trường production. Đây là kiểm tra nguyên mẫu cục bộ.

Các ảnh/JSON cũ trong `tests/artifacts` nếu có thuộc các lần thử trước; không được dùng làm kết quả cho phạm vi mới. Kết quả hiện hành là các bộ test đã cập nhật và báo cáo này.
