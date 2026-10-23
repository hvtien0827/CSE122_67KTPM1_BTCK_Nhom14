> Áp dụng vào repo thật ngày 21/10/2026: `D:\Tien\Workspace\Cac Mon Hoc\WEB\BTL\Repository\web_demo_source_code`. Đã chạy lại cả 12 bài kiểm tra ngay trên thư mục đích, tất cả đạt. Bản đích trước khi chuyển được sao lưu tại `D:\Tien\Workspace\Agents Projects\Codex\Bài tập lớn\repository_before_structure_20261021`. Không commit/push hoặc thay đổi nhánh. Ảnh và kết quả test cũ trong repo được khôi phục sau kiểm thử để tránh thay đổi ngoài phạm vi. Phần bên dưới mô tả đợt chỉnh cấu trúc gốc.

> Cập nhật phạm vi 23/10/2026: trang phân tích vắng mặt của chủ sân đã gỡ. Hiện có 41 trang chức năng, 2 URL tương thích; AI còn Skill Match và Team Balancer. Các số liệu bên dưới ghi nhận đợt kiểm tra trước khi gỡ. Xem [phạm vi hiện hành](screen-list.md).

# Tách cấu trúc theo vai trò — 21/10/2026

## Phạm vi

Đã sửa trực tiếp `web_demo_source_code/`, không thao tác Git. Bản trước khi chỉnh được giữ tại `structure_before_20261021/` ở thư mục cha. Không sửa các bản PR riêng hoặc repository bên ngoài. Chưa tích hợp JSON Server.

- HTML bỏ 328 template dialog không liên quan, giữ form đúng trang; rút gọn SVG trang trí và sidebar đúng role. Bố cục vẫn là HTML tĩnh.
- Tách `manage.js` thành `venue.js` (216 dòng), `organizer.js` (210 dòng), `admin.js` (187 dòng). Các trang chuyên role chỉ nạp controller của mình.
- Đổi binding của 50 scope sang tên có nghĩa, như `courtName`, `bookingRows`, `statusOptions`.
- Tách `navigation.css`, `date-picker.css`; có `organizer.css` riêng. `common.css` còn 1.824 dòng vì giữ các thành phần thực sự dùng chung.
- Bỏ lỗi gõ `{k` trong selector icon của bản copy đầu vào.
- `store.js` giữ nguyên byte, dữ liệu/localStorage và nghiệp vụ không thay đổi trong đợt này.
- Cập nhật định tuyến, test tham chiếu namespace cũ, tài liệu chia việc và hướng dẫn vấn đáp.

## Kiểm thử cuối cùng

Tất cả bài kiểm tra dưới đây đều hoàn thành với exit code 0 trên bản cuối:

| Bài kiểm tra | Kết quả |
|---|---|
| Ranh giới cấu trúc | 44 trang, đường dẫn CSS/JS, controller/CSS/dialog đúng role |
| Static HTML | 44 HTML, 9 CSS, bố cục khi tắt JS, giữ sửa HTML, escape input |
| Smoke | 84 lượt trang desktop/mobile, không tràn ngang/lỗi JS |
| Integration | 40 kiểm tra đạt |
| Edge cases | 37 kiểm tra đạt |
| Community | Đánh giá, báo cáo, hồ sơ riêng tư, lịch, doanh thu, nhóm tài khoản đạt |
| Date picker | 83 kiểm tra đạt |
| Usability | 145 kiểm tra đạt |
| Interface | 88 kiểm tra đạt |
| Mobile activities | Bộ lọc hoạt động, thông báo thành công, lịch sân ở 320/390/760px đạt |
| Khôi phục 4 role | Tài khoản, phân quyền, dữ liệu cũ, không nhân đôi đạt |
| Theme | 168 lượt trang, lưu theme, bàn phím, cross-tab, dialog/nút đạt |

Đối chiếu 16 cặp ảnh trước/sau: bốn role × sáng/tối × 390/1440px. Ảnh có cùng kích thước và kết quả pixel được kiểm tra ở thư mục `structure-visuals/` phía ngoài mã nguồn. Không phát hiện khác biệt ở ngưỡng kênh màu 8. Đây là kiểm tra các màn hình đại diện, không phải bảo đảm mọi trạng thái của mọi trang giống từng pixel.

## Giới hạn và công việc tiếp theo

- `store.js`, `ai.js`, `community.js`, `ui.js`, `views.js`, `app.js` vẫn là các module dùng chung. Đã ghi cách đọc/phạm vi phụ trách trong `docs/code-map.md`.
- Chưa thay tiện ích binding bằng cách viết DOM thuần cho từng trang; các tên binding nay có nghĩa và ví dụ giải thích.
- Không thêm Bootstrap, không đổi chức năng chỉ để giảm số dòng.
- Các patch/ba bản PR cũ nhắm vào `manage.js`, không áp nguyên vào cấu trúc mới; chuyển đúng phần sửa sang controller tương ứng.
