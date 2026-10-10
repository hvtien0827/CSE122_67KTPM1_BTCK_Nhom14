# Đối chiếu bộ Figma

Đã kiểm kê, trích nội dung và xem hình render của **43 PDF** trong `../../UI figma degisn`, bao gồm tất cả trang desktop/mobile, lỗi, tải, OTP và kết quả.

## Phong cách được áp dụng
- Xanh lá chính #15803d, xanh đậm khi hover; nền #f6f8f6, thẻ trắng; chữ đen/xám.
- Logo C trong ô xanh bo góc, nút pill, form trắng viền nhẹ, thẻ bo tròn và shadow nhẹ.
- Trang chủ: hero chữ bên trái / ảnh bên phải; gợi ý trận; sân nổi bật; CTA; footer nền tối. Mobile xếp một cột.
- Auth: header nhỏ, form giữa nền nhạt, nhãn phía trên, icon, nút toàn chiều rộng, footer. Mobile bỏ khung card ngoài.
- Thành phần quản lý được mở rộng theo cùng token: sidebar, bảng, thẻ thống kê, form modal và AI panel.

## Ảnh
`figma-9.jpg`: ảnh hero; `figma-4.jpg`, `figma-1.jpg`, `figma-2.jpg`: ảnh ba sân. Trích trực tiếp từ PDF trang chủ do người dùng cung cấp. Không tải ảnh ngoài hoặc tạo ảnh AI.

## Những điểm cần lưu ý
- Ba PDF tổng quan “Đăng nhập”, “Đăng ký & Xác minh email”, “Khôi phục mật khẩu” chỉ chứa tiêu đề; không coi là ba trang website bổ sung.
- Một số file biến thể OTP có tên “Mã sai”/“Hết hạn” nhưng nội dung thể hiện trạng thái khác. Mã ứng dụng dùng thông báo đúng với điều kiện thực tế thay vì sao chép sự không nhất quán đó.
- Nút Google có thông báo rõ chưa kết nối OAuth; không giả vờ có dịch vụ thật.
- Các trang role chưa có PDF được thiết kế tiếp theo cùng phong cách. Nhóm cần bổ sung frame Figma/Canva và xin duyệt.

## Danh mục đã xem
```text
00 Auth\01 Đăng nhập\Desktop 1440\Default.pdf
01 Auth\01 Đăng nhập\Desktop 1440\Error - Chưa xác minh.pdf
02 Auth\01 Đăng nhập\Desktop 1440\Error - Sai thông tin.pdf
03 Auth\01 Đăng nhập\Desktop 1440\Loading.pdf
04 Auth\01 Đăng nhập\Mobile 390\Default.pdf
05 Auth\01 Đăng nhập\Mobile 390\Error - Chưa xác minh.pdf
06 Auth\01 Đăng nhập\Mobile 390\Error - Sai thông tin.pdf
07 Auth\01 Đăng nhập\Mobile 390\Loading.pdf
08 Auth\02 Đăng ký\Desktop 1440\Default.pdf
09 Auth\02 Đăng ký\Desktop 1440\Error - Validation.pdf
10 Auth\02 Đăng ký\Mobile 390\Default.pdf
11 Auth\02 Đăng ký\Mobile 390\Error - Validation.pdf
12 Auth\03 Đã gửi mã xác minh\Desktop 1440\Default.pdf
13 Auth\03 Đã gửi mã xác minh\Mobile 390\Default.pdf
14 Auth\04 Nhập mã xác minh\Desktop 1440\Default.pdf
15 Auth\04 Nhập mã xác minh\Desktop 1440\Error - Hết hạn.pdf
16 Auth\04 Nhập mã xác minh\Desktop 1440\Error - Mã sai.pdf
17 Auth\04 Nhập mã xác minh\Mobile 390\Default.pdf
18 Auth\04 Nhập mã xác minh\Mobile 390\Error - Hết hạn.pdf
19 Auth\04 Nhập mã xác minh\Mobile 390\Error - Mã sai.pdf
20 Auth\05 Đăng ký thành công\Desktop 1440\Default.pdf
21 Auth\05 Đăng ký thành công\Mobile 390\Default.pdf
22 Auth\06 Quên mật khẩu\Desktop 1440\Default.pdf
23 Auth\06 Quên mật khẩu\Mobile 390\Default.pdf
24 Auth\07 Xác nhận yêu cầu khôi phục\Desktop 1440\Default.pdf
25 Auth\07 Xác nhận yêu cầu khôi phục\Mobile 390\Default.pdf
26 Auth\08 Nhập mã khôi phục\Desktop 1440\Default.pdf
27 Auth\08 Nhập mã khôi phục\Desktop 1440\Error - Mã sai.pdf
28 Auth\08 Nhập mã khôi phục\Mobile 390\Default.pdf
29 Auth\08 Nhập mã khôi phục\Mobile 390\Error - Mã sai.pdf
30 Auth\09 Đặt mật khẩu mới\Desktop 1440\Default.pdf
31 Auth\09 Đặt mật khẩu mới\Desktop 1440\Error - Không khớp.pdf
32 Auth\09 Đặt mật khẩu mới\Mobile 390\Default.pdf
33 Auth\09 Đặt mật khẩu mới\Mobile 390\Error - Không khớp.pdf
34 Auth\10 Đặt lại thành công\Desktop 1440\Default.pdf
35 Auth\10 Đặt lại thành công\Mobile 390\Default.pdf
36 Khôi phục mật khẩu.pdf
37 Nhắc đăng nhập — Desktop.pdf
38 Nhắc đăng nhập — Mobile.pdf
39 Trang chủ khách — Desktop 1440.pdf
40 Trang chủ khách — Mobile 390.pdf
41 Đăng ký & Xác minh email.pdf
42 Đăng nhập.pdf
```
