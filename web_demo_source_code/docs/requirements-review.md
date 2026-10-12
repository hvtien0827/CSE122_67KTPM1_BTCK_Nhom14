# Đối chiếu toàn bộ đề BTL-28

Nguồn: [đề bài gốc](../../docs/BTL-28_courtconnect-at-san-va-ghep-nguoi-choi-theo-trinh-o.md). Thực tế nhóm có 4 người, thay cho 3 người trong mẫu đề.

| Mục đề | Cách đáp ứng trong bản triển khai | Phần cần nhóm xác nhận / bổ sung |
|---|---|---|
| 1–4 lĩnh vực/ngữ cảnh/vấn đề | Sân, trận, lịch, slot và cân bằng CLB | Xác nhận phạm vi với thầy |
| 5–7 mục tiêu/role/luồng | 4 role, luồng liên kết và tài liệu user-flows | Giảng viên duyệt luồng |
| Nguyên tắc phạm vi | 42 trang chức năng và 2 URL chuyển hướng; không giới hạn 12 | Duyệt bảng kiểm kê và mockup bổ sung |
| 8 danh sách nền tảng | Có đủ 12 HTML đúng tên | Đối chiếu khi duyệt |
| 9 chuẩn từng giao diện | Semantic DOM, layout chung, responsive, tương tác, form validation, trạng thái | Nhóm tự review và quay minh chứng |
| 10 CRUD | courts/slots/bookings/matches/players/events cùng các entity quản trị | D được biểu diễn bằng hủy/lưu trữ khi phù hợp |
| 11–12 AI | Ba AI theo quy tắc, có lý do, quyền sửa/lưu/từ chối, lỗi/thủ công | Nhóm giải thích thuật toán khi bảo vệ |
| 13 dữ liệu | Module seed tập trung + localStorage, không backend | Chỉ dữ liệu mô phỏng |
| 14 nhân sự | 4 người phụ trách 4 vai trò; phần còn lại làm chung | Điền tên và xác nhận công việc thực tế |
| 15 GitHub | Tài liệu hỗ trợ quy trình nhánh công việc và Pull Request vào main | Nhóm tự đối chiếu và bổ sung commit/PR/review thực tế; tài liệu này chưa kiểm chứng tiến độ trên GitHub |
| 16 bảng công việc | task-board.csv đủ cột mã, người, hạn, nhánh, minh chứng | Import/tạo Trello/Jira/Notion thật; cập nhật hạn |
| 17 OBS | checklist và một hàng minh chứng cho từng trang | Chưa có video; phải có mặt và chỉnh trực tiếp |
| 18 thiết kế | Đã xem 43 PDF, trích ảnh, giữ token/bố cục; tài liệu design | Trang nghiệp vụ mới chưa có Figma/Canva được duyệt |
| 19 cấu trúc | README/docs/design/assets/css/js/tests | HTML ở root để mở đơn giản |
| 20 AI usage | Có báo cáo minh bạch về phần AI sinh và kiểm chứng | Sinh viên bổ sung phần tự sửa/học được |
| 21 MVP | Chức năng sản phẩm đã triển khai; minh chứng quá trình còn thiếu | Không được coi toàn bộ bài tập đã hoàn tất |
| 22 chuỗi minh chứng | screen-list + task-board + obs checklist + docs | Bổ sung phê duyệt, branch/commit/PR/review/OBS thật |
| 23 sáng tạo | nhiều role, trạng thái, UX quyết định, AI giải thích | Trình bày kịch bản demo |
| 24 chuẩn đầu ra | mã và tài liệu có thể học/sửa | Từng sinh viên phải tự chứng minh năng lực |

## Quyết định thiết kế
- Sử dụng nhiều môn theo danh mục, minh họa cầu lông và pickleball. Đề không chốt số môn.
- Trang auth được tách theo 10 bước trong bộ Figma, trạng thái lỗi/tải vẫn dùng cùng trang.
- Các thao tác tạo/sửa CRUD đơn giản dùng dialog có validation; chi tiết sân/trận/sự kiện có trang riêng vì chứa đủ nội dung và bước tiếp theo.
- Trò chuyện đã gỡ theo bản cập nhật; URL chat cũ chỉ chuyển hướng. Quản lý khung giờ được tích hợp trong lịch sân.
- Sports Report có create/read/update/archive snapshot và CSV, không phải dashboard tĩnh.
- Chưa có bằng chứng duyệt thiết kế trước khi code. Không tự đánh dấu DONE theo định nghĩa của đề chỉ vì mã đã chạy.
