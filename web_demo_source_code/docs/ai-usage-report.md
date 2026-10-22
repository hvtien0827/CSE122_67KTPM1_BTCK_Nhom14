# Báo cáo sử dụng AI

## Công cụ
Codex được người dùng yêu cầu tạo website HTML/CSS/JS từ đề Markdown và các PDF giao diện Figma. Không sử dụng LLM API trong sản phẩm.

## Prompt chính
“Review toàn bộ file markdown, xem toàn bộ UI figma degisn, tạo trang web đủ role/tính năng, phong cách và màu sắc theo Figma; không giới hạn số trang; HTML CSS JS trong source_code.” Người dùng sau đó yêu cầu tiếp tục từ trạng thái đã làm và hoàn thành task.

## Phần AI tạo
- Mã HTML/CSS/JS của nguyên mẫu, dữ liệu mẫu và ba thuật toán theo quy tắc.
- Tài liệu kỹ thuật, kiểm kê, mẫu phân công, task/OBS và các script kiểm thử.
- Không tạo video OBS, lịch sử commit cá nhân, PR/review, bằng chứng giảng viên duyệt hoặc bảng Trello thật.

## Nguồn do nhóm cung cấp
Đề BTL-28 và 43 PDF. Ảnh sân/ảnh hero được trích từ PDF trang chủ. Các role chưa có bản Figma được thiết kế mở rộng cùng phong cách, không phải ảnh mẫu đã được thầy duyệt.

## Lỗi / điều chỉnh trong quá trình tạo
- Thư mục dự án đã chuyển đường dẫn, cần tìm lại nguồn hiện tại.
- Trình đọc ảnh mặc định bị ảnh hưởng bởi cwd cũ; đã render PDF bằng Python và kiểm tra ảnh qua dữ liệu ảnh.
- Xử lý submit bất đồng bộ phải giữ tham chiếu form trước await vì event.currentTarget có thể trở thành null.
- Bổ sung validation liên kết: sửa lịch trận xét lịch thành viên; hoàn thành booking cập nhật trận; dữ liệu localStorage hỏng không bị ghi đè ngầm.

## Kiểm chứng
Chạy kiểm tra cú pháp JS, kiểm tra các trang desktop/mobile bằng trình duyệt headless, kiểm thử xuyên vai trò và tình huống lỗi, xem ảnh render. Kết quả lịch sử và kiểm thử bản hiện tại được phân biệt tại [test-report.md](test-report.md).

## Phân biệt mock / API thật
Auth, OTP email, booking và 3 AI là mô phỏng. Không xử lý thanh toán thật; trò chuyện đã gỡ trong bản hiện tại. Không gọi API mạng. Thuật toán AI đọc được trong js/ai.js.

## Sinh viên cần bổ sung trung thực
| Thành viên | Phần tự chỉnh | Lỗi tự tìm / cách kiểm chứng | Điều học được | Commit/PR thật |
|---|---|---|---|---|
| SV1 | Chưa ghi nhận | Chưa ghi nhận | Chưa ghi nhận | |
| SV2 | Chưa ghi nhận | Chưa ghi nhận | Chưa ghi nhận | |
| SV3 | Chưa ghi nhận | Chưa ghi nhận | Chưa ghi nhận | |
| SV4 | Chưa ghi nhận | Chưa ghi nhận | Chưa ghi nhận | |


## Phạm vi cập nhật hiện tại

Nhóm giữ 4 vai trò; mỗi người xây dựng một vai trò trên `feat/player`, `feat/venue`, `feat/organizer`, `feat/admin`; các phần dùng chung do cả nhóm phối hợp. Danh mục hiện hành là 42 trang chức năng và 2 URL chuyển hướng.

AI đã hỗ trợ sửa lỗi tài khoản CLB còn bị khóa do dữ liệu bản 28 trang: khôi phục có điều kiện, giữ khóa thủ công, dữ liệu hiện hành và thêm `tests/restore-four-roles.cjs`. Ở phiên sửa ban đầu mới kiểm tra dữ liệu do thiếu trình duyệt. Trong đợt kiểm tra ngày 21/10/2026, bài hồi quy này và các luồng trình duyệt đã chạy đạt; xem [báo cáo kiểm thử mới nhất](structure-refactor-report.md). Bảng công việc sinh viên phía trên vẫn cần nhóm cập nhật từ công việc thực tế, không suy ra từ việc AI đã sửa code.


## Hỗ trợ chỉnh cấu trúc — 21/10/2026

AI hỗ trợ tách controller quản lý theo role, dọn template HTML không liên quan, đặt lại tên binding, chia CSS và cập nhật test/tài liệu. Bản mới vẫn dùng tiện ích DOM tự viết (`views.js`), không thêm Bootstrap hay framework. Kết quả và giới hạn xem [báo cáo refactor](structure-refactor-report.md); cách đọc code xem [code-map.md](code-map.md). JSON Server mới là kế hoạch, chưa có trong mã sản phẩm.
