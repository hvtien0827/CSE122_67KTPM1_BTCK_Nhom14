# CourtConnect — Bài tập lớn nhóm 14

CourtConnect là website tìm và đặt sân thể thao, ghép người chơi theo trình độ và tổ chức hoạt động CLB, thuộc học phần **Phát triển ứng dụng Web cơ bản (CSE122)**. Nhóm gồm **4 thành viên**, sử dụng **HTML, CSS và JavaScript thuần**.

## Phạm vi hiện tại

Nhóm sử dụng bản mã nguồn trong **[web_demo_source_code](web_demo_source_code/)**, giữ đủ 4 vai trò theo [đề bài gốc](docs/BTL-28_courtconnect-at-san-va-ghep-nguoi-choi-theo-trinh-o.md): **Người chơi, Chủ sân, Điều phối CLB, Quản trị viên**.

Bản hiện tại có **42 trang chức năng và 2 file HTML chuyển hướng tương thích**. Ba trải nghiệm AI được mô phỏng theo quy tắc: **Skill Match**, **No-show Risk** và **Team Balancer**. Giao diện hỗ trợ desktop/mobile và chế độ sáng/tối. Dữ liệu lưu bằng localStorage; chưa kết nối backend, email, thanh toán hoặc AI thật.

## Phân công 4 thành viên

| Thành viên | Vai trò phụ trách | Công việc chính | Nhánh phụ trách |
|---|---|---|---|
| Thành viên 1 | Người chơi | Xây dựng giao diện và chức năng cho người chơi: tìm/đặt sân, hoạt động, tạo/tham gia trận, Skill Match, đánh giá sân và bạn chơi. | `feat/player` |
| Thành viên 2 | Chủ sân | Xây dựng giao diện và chức năng cho chủ sân: quản lý sân và lịch khung giờ, xử lý đơn đặt, No-show Risk, doanh thu và đánh giá sân. | `feat/venue` |
| Thành viên 3 | Điều phối CLB | Xây dựng giao diện và chức năng cho điều phối CLB: quản lý sự kiện, danh sách người chơi, đội hình và Team Balancer. | `feat/organizer` |
| Thành viên 4 | Quản trị viên | Xây dựng giao diện và chức năng cho quản trị viên: quản lý môn thể thao, tài khoản, báo cáo hoạt động/CSV và xử lý báo cáo người chơi. | `feat/admin` |

**Phần làm chung:** trang chủ; đăng nhập/đăng ký, xác minh email và khôi phục mật khẩu; hồ sơ cá nhân/công khai; cài đặt, thông báo, trợ giúp, điều khoản, bảo mật và trang lỗi. Cả nhóm cùng xây dựng thành phần giao diện, dữ liệu mẫu, responsive, sáng/tối, kiểm thử tích hợp, tài liệu và minh chứng thuyết trình. Trò chuyện đã được gỡ khỏi bản hiện tại.

Mỗi người xây dựng HTML/CSS/JS, kiểm tra phần vai trò của mình và phụ trách nhánh tương ứng trong bảng. Các nhánh công việc được đề nghị ghép vào `main` qua Pull Request sau khi kiểm tra. Với phần làm chung, nhóm chia các đầu việc nhỏ và thống nhất người thực hiện trước khi sửa file chung. Xem [phân công chi tiết](web_demo_source_code/docs/team-assignment.md).

## Nội dung repository

| Thư mục | Nội dung |
|---|---|
| [docs](docs/) | Đề bài gốc và các tài liệu tóm tắt. |
| [prompt](prompt/) — [Tóm tắt](docs/Prompt.md) | Prompt thiết kế và danh mục giao diện hiện hành. |
| [figma](figma/) — [Tóm tắt](docs/UI_Figma.md) | PDF giao diện trang chủ và luồng tài khoản. |
| [web_demo_source_code](web_demo_source_code/) — [Tóm tắt](docs/TOM_TAT.md) | Mã nguồn demo 4 vai trò, tài nguyên và kiểm thử. |

Danh mục 42 trang chức năng của 4 vai trò được mô tả tại [bảng màn hình](web_demo_source_code/docs/screen-list.md) và [tài liệu phân loại giao diện](prompt/phan_loai_giao_dien_he_thong.md).

## Chạy thử

Mở **web_demo_source_code** bằng VS Code và chạy `index.html` qua Live Server. Hoặc chạy `npm start` trong thư mục đó rồi truy cập http://127.0.0.1:4173. Xem [hướng dẫn và 4 tài khoản demo](web_demo_source_code/README.md).
