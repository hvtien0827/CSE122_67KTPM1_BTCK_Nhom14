# CourtConnect

Nguyên mẫu frontend CSE122 cho nhóm **4 sinh viên**. HTML, CSS, JavaScript thuần; 42 trang chức năng và 2 file HTML chuyển hướng tương thích, bốn vai trò, dữ liệu dùng chung qua localStorage và ba trải nghiệm AI mô phỏng.

## Chạy website

Cách 1: Mở thư mục `web_demo_source_code` bằng VS Code, chạy `index.html` với Live Server.

Cách 2: Nếu đã có Node.js, mở terminal trong `web_demo_source_code` và chạy:

```sh
node tests/serve.cjs
```

Mở **http://127.0.0.1:4173**. Giữ nguyên cùng địa chỉ/cổng khi chuyển vai trò. Không cần npm install để chạy website. Có thể mở trực tiếp `index.html`, nhưng nên dùng HTTP để localStorage và việc chuyển trang nhất quán giữa các trình duyệt.

## Giao diện sáng / tối

Nút mặt trăng / mặt trời ở thanh điều hướng đổi chế độ sáng/tối trên mọi trang, kể cả trang tài khoản. Lựa chọn lưu riêng trong localStorage (`cc.theme`), được giữ khi chuyển trang, tải lại và đồng bộ giữa các tab. Nền tối giữ màu xanh chính của nút; chữ xanh trên nền tối dùng sắc xanh sáng hơn để dễ đọc.

## Tài khoản mẫu

| Vai trò | Email | Mật khẩu |
|---|---|---|
| Người chơi | player@courtconnect.demo | Court123! |
| Chủ sân | venue@courtconnect.demo | Court123! |
| Điều phối CLB | organizer@courtconnect.demo | Court123! |
| Quản trị viên | admin@courtconnect.demo | Court123! |

Trang đăng nhập có mục **Trải nghiệm nhanh với 4 tài khoản mẫu** để điền và đăng nhập. Để đổi vai trò, bấm ảnh đại diện ở góc trên bên phải → **Đăng xuất / đổi vai trò**. Nút ở cuối menu bên trái vẫn được giữ trên desktop.

Tài khoản tự đăng ký có vai trò Người chơi. Mã xác minh/khôi phục mẫu: **482915**, hết hạn sau 5 phút; gửi lại sau 60 giây. Không gửi email thật và không kết nối Google OAuth. Nút Google giải thích giới hạn, không giả vờ đăng nhập thành công.

## Phân công nhóm

Mỗi người phụ trách một vai trò: Thành viên 1 — Người chơi; Thành viên 2 — Chủ sân; Thành viên 3 — Điều phối CLB; Thành viên 4 — Quản trị viên. Trang chủ, auth, hồ sơ, thông báo, cài đặt, trợ giúp, điều khoản/bảo mật, lỗi, thành phần giao diện/dữ liệu và kiểm thử tích hợp là phần làm chung. Các nhánh phụ trách lần lượt là `feat/player`, `feat/venue`, `feat/organizer`, `feat/admin`. Xem [phân công chi tiết](docs/team-assignment.md) và [bảng màn hình hiện hành](docs/screen-list.md).

## Những luồng đã triển khai

- Tài khoản: đăng ký, xác minh, sai/hết hạn mã, đăng nhập, ghi nhớ phiên, khôi phục/đổi mật khẩu, hồ sơ, thông báo, cài đặt.
- Người chơi: tìm/lọc sân và trận; xem chi tiết; gửi/hủy đơn; tạo/sửa/hủy trận từ lịch sân đã duyệt; tham gia/rút trận; ghép trận và lưu gợi ý.
- Chủ sân: tạo/sửa/xoá/lưu trữ sân, tải ảnh từ máy; lịch khung giờ ngay trong cửa sổ lịch sân; chặn slot trùng; duyệt/từ chối/hủy/hoàn thành đơn do người chơi gửi; No-show Risk, doanh thu và đánh giá sân.
- CLB: tạo/sửa/xoá/lưu trữ/hoàn thành sự kiện có giờ bắt đầu–kết thúc; quản lý hồ sơ và danh sách; chia đội tự động hoặc thủ công; chỉnh và lưu/xóa đội hình.
- Quản trị: tạo/sửa/vô hiệu hóa/kích hoạt tài khoản; quản lý môn; tạo/sửa/xoá/lưu trữ báo cáo hoạt động và tải CSV; xem xét báo cáo người chơi.
- Người chơi đánh giá sân/bạn chơi sau khi hoàn thành, báo cáo người chơi; hồ sơ công khai có điện thoại tùy chọn và biểu tượng mạng xã hội. Trò chuyện đã gỡ; URL cũ chỉ chuyển hướng.

## Demo nhanh xuyên vai trò

1. Người chơi: tìm sân → Đặt sân → chọn ngày và giờ trống → bấm nút Đặt sân → kiểm tra và gửi yêu cầu → xem Chờ duyệt trong Hoạt động của tôi.
2. Đổi sang Chủ sân: Quản lý đặt sân → Duyệt đơn đó.
3. Đổi sang Người chơi: Tạo trận → chọn lịch sân đã duyệt → lưu. Dùng tài khoản `player4@courtconnect.demo` (cùng mật khẩu mẫu) để tham gia.
4. Điều phối: Sự kiện → Danh sách → Đội hình → Đề xuất → chỉnh người → lưu.
5. Chủ sân: Cảnh báo vắng mặt → chọn đơn → phân tích → điều chỉnh nhận định → lưu. Đơn không tự bị từ chối.
6. Quản trị: Báo cáo → tạo báo cáo theo ngày → tải CSV.

Các sân mẫu tự bổ sung lịch trống cho 30 ngày tới khi mở website, giữ nguyên đơn cũ và lịch đã đóng. Không cần reset để tiếp tục đặt sân. Cài đặt → Khôi phục dữ liệu mẫu chỉ dùng khi muốn bắt đầu lại; thao tác này xoá thay đổi demo hiện tại sau xác nhận.

## Cấu trúc để học và sửa

```text
*.html                Bố cục, nội dung chính, form và template popup từng trang
css/common.css        Màu, font, dark mode, nút, input, nav, sidebar, bảng
css/player.css        Người chơi, đặt sân, hoạt động và lịch chọn ngày
css/venue.css         Chủ sân, quản lý sân và lịch khung giờ
css/admin.css         Biểu đồ quản trị và thành phần quản lý/đội hình CLB
css/auth.css          Đăng nhập, đăng ký, xác minh, khôi phục
css/home.css          Hero, section, CTA và footer trang chủ
js/theme.js           Nạp chế độ sáng/tối sớm, ghi nhớ lựa chọn
js/store.js           Dữ liệu mẫu, phiên, CRUD, quy tắc nghiệp vụ
js/ui.js              Cập nhật menu/tài khoản, sự kiện dialog, card, hàng bảng, toast
js/views.js           Cập nhật dữ liệu vào vị trí đã khai báo trong HTML
js/auth.js            Đăng ký, đăng nhập, OTP và khôi phục
js/player.js          Tìm sân/trận, đặt sân, hoạt động người chơi
js/community.js       Lịch sân, doanh thu, đánh giá, báo cáo, hồ sơ công khai
js/manage.js          Chủ sân, CLB, quản trị
js/ai.js              Ba thuật toán mô phỏng và giao diện điều khiển
js/app.js             Điều hướng, quyền frontend, các trang dùng chung
assets/images/        Ảnh được trích từ PDF Figma nhóm cung cấp
docs/                 Phạm vi, màn hình, phân công, kiểm thử, minh chứng
design/               Kiểm kê và đối chiếu thiết kế tham khảo
tests/                Server thử, kiểm thử tự động và ảnh kiểm tra
```

Bố cục, tiêu đề và form được sửa trực tiếp trong từng file HTML; form popup nằm trong các thẻ `template` ở cuối trang. JavaScript xử lý dữ liệu, sự kiện, kiểm tra form và cập nhật các vùng dữ liệu như danh sách sân/trận, hàng bảng, lịch và kết quả AI. Mỗi trang nạp `common.css` trước rồi CSS của nhóm trang. Đọc [hướng dẫn sửa HTML/CSS/JS](docs/frontend-structure.md) và [danh sách màn hình](docs/screen-list.md) để tìm đúng file/hàm. Dữ liệu người dùng được escape trước khi chèn vào HTML.

Kiểm tra cấu trúc frontend mới: khởi động server rồi chạy `npm run test:static`. Bài kiểm tra xác nhận bố cục có sẵn khi tắt JavaScript và thay đổi trong HTML không bị controller ghi đè. Máy chạy kiểm thử cần Playwright và trình duyệt; website không cần các thư viện này để sử dụng.

## Giới hạn của bản học tập

- Không có backend, thanh toán, gửi email, OAuth hay LLM thật. Giá, đánh giá, lịch sử vắng mặt và tài khoản là dữ liệu mô phỏng.
- Dữ liệu trên các máy/trình duyệt khác nhau không đồng bộ. Thử nhiều vai trò trong cùng trình duyệt. Những tab cùng địa chỉ cập nhật lại khi localStorage thay đổi.
- Quyền truy cập và mật khẩu lưu cục bộ là mô phỏng frontend, không phải cơ chế bảo mật production. Chỉ dùng tài khoản/mật khẩu giả.
- Bản này chưa được giảng viên duyệt. Lịch sử làm việc cá nhân, PR/review, Trello và video giải thích do nhóm thực hiện và cập nhật riêng. Các mẫu minh chứng trong `docs/` cần nhóm tự hoàn thiện; không thay thế quá trình học.
- Những trang nghiệp vụ chưa có Figma được mở rộng theo hệ thống màu và thành phần của các PDF đã cung cấp, không được coi là bản Figma đã duyệt.

## Kiểm thử

Chạy server trước. Bộ kiểm thử trình duyệt dùng Playwright; đây chỉ là công cụ phát triển, không phải phụ thuộc của website:

```sh
npm install --no-save playwright
npx playwright install chromium
node tests/smoke.cjs
node tests/integration.cjs
node tests/edge-cases.cjs
node tests/usability-regression.cjs
node tests/community.cjs
node tests/mobile-activities.cjs
node tests/theme.cjs
node tests/restore-four-roles.cjs
```

Có thể đặt `BROWSER_PATH` tới trình duyệt Chromium tương thích và `PLAYWRIGHT_PATH` tới thư viện có sẵn. Các bài kiểm thử dùng hồ sơ trình duyệt riêng và dữ liệu riêng. Xem `docs/test-report.md` cho kết quả thực tế.

Đọc tiếp: `docs/screen-list.md`, `docs/user-flows.md`, `docs/requirements-review.md`, `docs/team-assignment.md`, `docs/ai-usage-report.md` và `docs/obs-checklist.md`.

## Cập nhật ngày 24/09/2026

Xem [luồng mới và cách kiểm tra](docs/community-update.md): lịch sân, doanh thu, đánh giá/báo cáo, nhóm tài khoản và hồ sơ công khai. Danh mục trang hiện hành: [pages.json](docs/pages.json).


## Khôi phục dữ liệu khi quay về 4 vai trò

Ứng dụng vẫn dùng khóa localStorage `courtconnect.v1`. Nếu dữ liệu từng được chuyển sang bản 28 trang, khi tải lại ứng dụng sẽ khôi phục tài khoản CLB bị ngừng hỗ trợ cùng sự kiện, báo cáo và lịch sử AI đã lưu trữ. Tài khoản bị admin khóa thủ công vẫn bị khóa. Dữ liệu đang chỉnh sửa được ưu tiên, không tự reset dữ liệu mẫu.

Kiểm tra hồi quy bằng `node tests/restore-four-roles.cjs`. Xem [báo cáo kiểm thử](docs/test-report.md).

## Cập nhật chức năng và trải nghiệm — 13/10/2026

- Đặt sân theo ba bước; hiện giá toàn khung, trạng thái trống/đã đặt/đã qua giờ. Nút đặt sân cố định phía dưới trên mobile, chỉ bật sau khi chọn giờ.
- Quản lý sân: chọn ảnh JPEG/PNG/WebP tối đa 5 MB, có xem trước và tự thu nhỏ khi lưu. Có tuỳ chọn tự mở lịch 08:00–22:00 (mỗi lượt 2 giờ); tắt để quản lý lịch thủ công. Lịch đã mở không bị xoá khi tắt.
- Xoá sân cần xử lý các đơn chờ duyệt/đã duyệt trước; lịch sử đặt sân và doanh thu được giữ. Chủ sân không tạo đơn hộ người chơi.
- CLB: sự kiện có giờ bắt đầu/kết thúc; danh sách chỉ gồm thành viên của sự kiện đang chọn. Dùng **Thêm vào sự kiện** để đưa người chơi vào; **Tạo hồ sơ người chơi** chỉ tạo hồ sơ. Sự kiện trống hiển thị hướng dẫn, không lấy người từ sự kiện khác.
- Admin: khôi phục các bảng đánh giá/báo cáo còn thiếu trong dữ liệu cũ; xoá được báo cáo hoạt động đã lưu.
- Các vai trò đều có menu tài khoản trên thanh điều hướng; bộ lọc trạng thái phù hợp từng màn hình, nút chưa dùng được có trạng thái mờ, bảng và hộp thoại phù hợp mobile.

Xem [báo cáo kiểm thử hiện tại](docs/test-report.md).

### Hoàn thiện giao diện thẻ sân và tài khoản

Lịch chọn ngày đặt sân dùng tiếng Việt và theo chế độ sáng/tối; có chuyển tháng, nút Hôm nay và điều hướng bằng phím mũi tên. Tab tài khoản hiện tại được tô nền. Menu ảnh đại diện dùng icon ba gạch; các mục có cùng kiểu hiển thị. Hồ sơ hiển thị icon Facebook, Instagram, TikTok, YouTube và Zalo khi đã lưu liên kết tương ứng. Thẻ sân và bảng quản lý sân được căn lại chữ, giá và khoảng cách nút.

Kiểm tra phần này: `node tests/interface-polish.cjs`.
