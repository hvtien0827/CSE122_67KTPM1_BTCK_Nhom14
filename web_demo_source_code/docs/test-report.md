# Báo cáo kiểm thử và phạm vi xác nhận

Kết quả bên dưới được ghi lại từ ngày 22/09/2026, khi bản demo có 40 trang. Không coi các con số này là kết quả chạy lại cho mã nguồn hiện tại.

Ngày: 22/09/2026. Môi trường kiểm tra: Windows, trình duyệt Thorium (Chromium) headless qua Playwright, hồ sơ thử riêng. Website phục vụ bằng HTTP localhost, không dựa vào kết nối dịch vụ ngoài.

## Kết quả lịch sử — phiên bản ngày 22/09/2026

| Nhóm | Kết quả |
|---|---|
| Cú pháp | 7 module JavaScript qua `node --check` |
| Trang / responsive | 40 trang × desktop 1440px và mobile 390px = 80 lượt; không có runtime error hoặc tràn ngang toàn trang |
| Tích hợp | 38 xác nhận thành công; kiểm thử lại sau khi bổ sung ràng buộc dữ liệu |
| Trường hợp biên | 35 xác nhận thành công, gồm mobile và một màn hình tablet 768px |
| Visual QA | Đã xem ảnh trang chủ, auth, quản lý, AI; dùng cùng palette/ảnh/bố cục cơ sở Figma |

## Các luồng đã kiểm tra
- Đăng ký, sai xác nhận mật khẩu, chặn tài khoản chưa xác minh, OTP sai/đúng/hết hạn, gửi lại, khôi phục không được bỏ qua OTP.
- Người chơi đặt → chủ sân duyệt → người chơi tạo trận → người khác tham gia/rút → hủy booking giải phóng slot và hủy trận liên quan.
- Giới hạn chỗ, duplicate booking, trùng slot, giờ kết thúc không hợp lệ, booking tương lai không được hoàn thành.
- Hoàn thành booking đã hết giờ chuyển trận liên quan sang completed.
- C/R/U/lưu trữ sân/slot; tạo sự kiện/người chơi; cập nhật roster làm vô hiệu lineup.
- Skill Match: chọn/lưu, lỗi mô phỏng, không có kết quả; Team Balancer: lưu, chỉnh, lineup trùng, thiếu người, lỗi và thủ công; No-show Risk: ghi đè nhận định, thiếu lịch sử, lỗi/thử lại.
- Sai role hiển thị 403; admin không tự khóa; email trùng; môn đang có ràng buộc không lưu trữ; tạo/kích hoạt/vô hiệu tài khoản và player tương ứng.
- Tạo/sửa/lưu trữ báo cáo, snapshot, doanh thu chỉ từ booking completed, download CSV.
- Tin nhắn hiển thị cho người nhận; thông báo đã đọc; hồ sơ và trình độ lưu lại sau reload.
- Chuỗi HTML trong tên được hiển thị dưới dạng text, không tạo phần tử executable.
- localStorage hỏng có cảnh báo và không ghi đè ngầm; khôi phục có xác nhận.

## Bằng chứng và chạy lại

`tests/artifacts/smoke-results.json`, `integration-results.json`, `edge-results.json` chứa kết quả. Các ảnh PNG trong cùng thư mục ghi lại giao diện. Xem README để chạy script.

Các test là minh chứng kỹ thuật của bản sinh mã, không thay video OBS hoặc PR/review của sinh viên.

## Giới hạn kiểm chứng

Chưa chạy trên điện thoại vật lý, Safari/iOS hoặc Firefox; không khẳng định tương thích mọi trình duyệt. Chưa có load test, backend, email/Google OAuth/LLM thật. Bảng rộng cuộn ngang bên trong vùng bảng trên mobile; toàn trang không tràn ngang. Chưa phải bài kiểm tra WCAG đầy đủ.

## Kiểm tra sáng/tối của phiên bản 40 trang (lịch sử)

- `tests/theme.cjs`: 40 trang × 2 chế độ × 2 chiều rộng (1440px, 390px) = 160 lượt, không tràn ngang toàn trang hoặc lỗi runtime.
- Xác nhận nút ở cả trang công khai, trang role và auth; chuyển bằng chuột/bàn phím; giữ focus; ghi nhớ khi tải lại/chuyển trang; đồng bộ giữa tab.
- Kiểm tra nền hộp thoại, giữ màu xanh nút chính/chữ trắng, bỏ dòng thừa của banner AI và tăng chữ FAQ.
- Đã xem ảnh desktop/mobile của trang hỗ trợ, Skill Match và đăng nhập trong cả hai chế độ.
- Chữ phụ trước đây 10–13px được tăng lên 13–14px; FAQ 15px.
- Kết quả chi tiết: `tests/artifacts/theme-results.json`.


## Bản hiện tại và kiểm tra cần chạy lại

Danh mục hiện tại có 42 trang chức năng và 2 URL chuyển hướng. Các kết quả lịch sử cập nhật cộng đồng nằm trong [community-update.md](community-update.md); chúng không phải kết quả chạy mới ngày 12/10/2026. Các trang hoạt động/đặt sân dùng thẻ trên mobile, lịch sân dùng danh sách theo ngày. Chat đã gỡ, URL cũ chỉ chuyển hướng.

Ngày 12/10/2026: chạy `node tests/restore-four-roles.cjs` đạt các trường hợp dữ liệu mới, khôi phục organizer/sự kiện từ bản 28 trang, đăng nhập/phân quyền, giữ booking, không nhân đôi khi tải lại và giữ tài khoản khóa thủ công. `node --check js/store.js` đạt.

Lượt kiểm tra nút đăng nhập nhanh CLB trên trình duyệt chưa thực hiện được do thiếu executable Playwright. Không ghi nhận kết quả trình duyệt thành công cho sửa lỗi này. Nhóm cần chạy lại smoke, integration, edge, community, theme và mobile activities trên bản hiện tại theo [README](../README.md).
