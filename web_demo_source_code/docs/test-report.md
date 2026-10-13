# Báo cáo kiểm thử và phạm vi xác nhận

## Chỉnh giao diện tiếp theo — 13/10/2026

- Căn lại thẻ sân; lịch chọn ngày tiếng Việt dùng cùng màu sáng/tối, hỗ trợ chuyển tháng, bàn phím, Escape và chặn ngày quá khứ.
- Nhóm Tài khoản có nền cho trang hiện tại; menu ảnh đại diện dùng biểu tượng ba gạch và các dòng thao tác thống nhất.
- Icon SVG cho Facebook, Instagram, TikTok, YouTube, Zalo; chỉ hiện liên kết hợp lệ đã lưu trong hồ sơ.
- Bảng quản lý sân có ảnh/tên/địa chỉ rõ hơn và nhóm nút tách khoảng; mobile vẫn hiển thị dạng thẻ.
- `interface-polish.cjs`: **88 xác nhận đạt**, kiểm tra sáng/tối tại 1440/390/320px, chọn ngày, liên kết mạng xã hội và mở lịch sân. Đã xem ảnh desktop/mobile.
- Chạy lại `smoke.cjs`: **84 lượt đạt**; `usability-regression.cjs`: **145 xác nhận đạt**; `integration.cjs`: **38 xác nhận đạt**; `community.cjs`: đạt. Không ghi nhận lỗi JavaScript trong các lượt này.

Bằng chứng: [kết quả giao diện](../tests/artifacts/interface-polish-results.json), [bảng sân tối](../tests/artifacts/polish-venue-dark-1440.png), [hồ sơ tối](../tests/artifacts/polish-profile-dark.png), [lịch sáng](../tests/artifacts/polish-calendar-light-1440.png).

## Kiểm tra bản sửa ngày 13/10/2026

Môi trường: Windows, Google Chrome headless qua Playwright, hồ sơ và dữ liệu thử riêng, HTTP localhost. Không sửa dữ liệu trình duyệt đang dùng, Git hay GitHub.

| Bộ kiểm tra | Kết quả |
|---|---|
| `smoke.cjs` | 42 trang × desktop/mobile = 84 lượt; không lỗi JavaScript hoặc tràn ngang |
| `usability-regression.cjs` | 145 xác nhận: dữ liệu cũ, đặt/duyệt sân, ảnh sân, xoá sân/báo cáo/sự kiện, roster trống, menu tài khoản, mobile 320/390/760px |
| `integration.cjs` | 38 xác nhận: auth, booking, trận đấu, AI mô phỏng, phân quyền, CSV, hồ sơ |
| `edge-cases.cjs` | 35 xác nhận: lịch trùng, dữ liệu sai, thiếu người chia đội, OTP, localStorage hỏng |
| `theme.cjs` | 168 lượt kiểm tra trang/giao diện; lưu lựa chọn, bàn phím và đồng bộ theme giữa tab đều đạt |
| `community.cjs` | Đánh giá/báo cáo, quyền đánh giá, riêng tư, lịch sân, lọc doanh thu, nhóm tài khoản và menu mobile đều đạt |
| `mobile-activities.cjs` | Thông báo thành công, lọc hoạt động, bảng dạng thẻ và lịch theo ngày ở 320/390/760px đạt |
| `restore-four-roles.cjs` | Khôi phục dữ liệu CLB, tài khoản mẫu, giữ dữ liệu và trạng thái khoá thủ công đạt |

Đã xem ảnh đặt sân desktop/mobile và hộp thoại tối. Kiểm thử doanh thu dùng khoảng ngày thực tế thay vì mặc định mọi lịch mẫu đều thuộc tháng hiện tại. Các bài kiểm thử cũ được cập nhật cho luồng chọn giờ → nút đặt sân, thêm thành viên rõ ràng và trạng thái nút bị vô hiệu hoá.

Bằng chứng: [kết quả hồi quy](../tests/artifacts/usability-results.json), [smoke](../tests/artifacts/smoke-results.json), [tích hợp](../tests/artifacts/integration-results.json), [trường hợp biên](../tests/artifacts/edge-results.json), [theme](../tests/artifacts/theme-results.json). Ảnh: [đặt sân desktop](../tests/artifacts/booking-desktop-updated.png), [mobile 390px](../tests/artifacts/booking-mobile-390-updated.png).

Giới hạn: xác nhận trên Chromium và dữ liệu thử; chưa kiểm tra thiết bị iOS/Android thật. Đây vẫn là demo localStorage, không có backend hay đồng bộ giữa các máy.

---

Phần dưới là lịch sử kiểm thử ngày 22/09/2026, khi bản demo có 40 trang.

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
