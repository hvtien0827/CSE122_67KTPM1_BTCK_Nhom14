# Nhật ký thay đổi CourtConnect

Ngày cập nhật tài liệu: **22/10/2026**. Áp dụng cho thư mục `web_demo_source_code` hiện tại.

Nhật ký tổng hợp từ các thay đổi đã xác nhận trong cuộc trao đổi và mã nguồn/tài liệu hiện có. Đây không phải bản trích xuất lịch sử Git. Những cải tiến cũ không xác định được ngày thực hiện được ghi theo nhóm chức năng, không gán ngày hay người thực hiện. Bản thiết kế lại đã bị loại bỏ không thuộc nhật ký này.

## 22/10/2026 — Dọn template, phụ thuộc và mã cũ

- Rà 44 HTML, 13 JavaScript và 9 CSS; bỏ 207 template không được dùng, 27 dialog rỗng, 149 lượt nạp script không cần và 36 lượt nạp CSS lịch thừa.
- Bỏ màn hình khung giờ cũ khỏi controller; giữ chuyển hướng tương thích và lịch sân hiện tại.
- Bỏ 28 selector CSS và 9 khai báo biến CSS không dùng; bỏ biến JS và nhánh lẫn role còn sót.
- Chuyển khởi tạo dữ liệu cộng đồng sang store; gọi phần đánh giá trực tiếp từ Player thay vì ghi đè hàm ngầm.
- Định dạng HTML/JS/CSS theo cấu hình hiện tại; SVG trang trí vẫn viết gọn trên một dòng.
- Thêm danh sách phụ thuộc từng trang và cập nhật kiểm thử hồi quy. Xem [báo cáo dọn mã](docs/source-cleanup-report.md).

## 21/10/2026 — Đơn giản hoá cấu trúc và chia controller theo vai trò

- Dọn dialog không liên quan khỏi HTML; giữ bố cục, nội dung chính và form riêng của trang.
- Tách `js/manage.js` thành `js/venue.js`, `js/organizer.js`, `js/admin.js`; cập nhật định tuyến và mỗi trang chuyên role chỉ nạp controller của mình.
- Đổi binding dài thành tên có nghĩa như `courtName`, `bookingRows`, `statusOptions`.
- Tách `css/navigation.css`, `css/date-picker.css`, thêm `css/organizer.css`; giữ thành phần thực sự dùng chung trong `common.css`.
- Kiểm tra lại tại thư mục repo: 12 bài kiểm tra đạt. Xem [báo cáo chi tiết](docs/structure-refactor-report.md).
- Giữ nguyên dữ liệu/nghiệp vụ localStorage. Chưa tích hợp JSON Server.

Các mục ngày 19/10 và các nhóm cũ bên dưới là lịch sử. Tên `js/manage.js`, `css/style.css` và cấu trúc sáu CSS ở đó mô tả phiên bản tại thời điểm thay đổi, không phải hướng dẫn sửa bản mới nhất.

## 19/10/2026 — Đồng bộ giao diện chọn ngày

- Thay lịch mặc định trình duyệt ở các ô ngày bằng lịch chung theo màu xanh, bo góc và theme sáng/tối của CourtConnect; nhãn tiếng Việt và hiển thị ngày `dd/mm/yyyy`.
- Có chọn tháng/năm, Hôm nay, Xóa ngày cho ô không bắt buộc; giữ nguyên tên/giá trị ISO của input, min/max, sự kiện input/change và kiểm tra form.
- Bố cục lịch nằm trong template HTML, kiểu trong `common.css`, xử lý ở `date-picker.js`. Lịch đặt sân chọn khung giờ hiện có vẫn được giữ.
- Kiểm tra `npm run test:calendar` cho chọn ngày, bàn phím, bộ lọc, doanh thu, popup và mobile.

## 19/10/2026 — Tách bố cục HTML, CSS và xử lý JavaScript

- Chuyển bố cục chính của 44 HTML và các form popup từ chuỗi JavaScript vào từng file HTML. Giữ 42 trang chức năng và 2 URL chuyển hướng tương thích.
- Tách CSS thành `common.css`, `player.css`, `venue.css`, `admin.css`, `auth.css`, `home.css`; bỏ `style.css` không còn được nạp. Giữ các giá trị thiết kế và responsive hiện có.
- Thêm `views.js` để cập nhật vùng dữ liệu, thuộc tính và trạng thái có điều kiện; bỏ cơ chế thay toàn bộ `document.body.innerHTML`.
- Giữ các quy tắc dữ liệu/nghiệp vụ trong `store.js`. Bổ sung hướng dẫn [sửa frontend](docs/frontend-structure.md) và kiểm tra `test:static`.
- Sửa bài kiểm thử dùng tên nút menu cũ và ID khung giờ cố định, để kiểm tra đúng menu hiện tại và chọn một giờ thực sự còn trống.
- Các mục dưới đây mô tả những phiên bản trước; đường dẫn `css/style.css` là tên file tại thời điểm thực hiện thay đổi đó.

## 13/10/2026 — Khôi phục menu mobile cho bốn vai trò

- Sửa lệch tên thao tác giữa nút `toggle-sidebar` và bộ xử lý menu mobile cũ; nút mở được menu trên các trang chức năng, không chỉ trang chủ.
- Dùng cùng nút cho đóng/mở, bấm ngoài menu, Escape và quản lý focus; bổ sung `aria-controls`.
- Định vị menu dưới nút phía trái, giới hạn chiều rộng và chiều cao theo màn hình; menu có thể cuộn để xem đầy đủ chức năng.
- Đồng nhất menu trang chủ trên mobile, giữ thanh bên desktop.
- File thay đổi: `js/ui.js`, `css/style.css`.
- Kiểm tra bằng Chromium mô phỏng cảm ứng 402 × 874, DPR 3: bốn vai trò, trang hồ sơ, tạo trận và trang chủ; đóng/mở, chạm ngoài, Escape, chuyển trang và giới hạn hiển thị đều đạt. Kiểm tra thanh bên desktop đạt. Chưa kiểm tra trên thiết bị iPhone thật.

## 13/10/2026 — Sửa nút Đăng ký và phân quyền điều hướng

- Loại nút khỏi quy tắc CSS dành cho liên kết thường trên header, giữ chữ trắng của nút Đăng ký ở trạng thái thường và hover.
- Khi tài khoản Chủ sân, Điều phối CLB hoặc Quản trị viên mở trang chủ (kể cả qua logo), chuyển về trang chức năng của đúng vai trò.
- Kiểm tra vai trò cả trên các trang tìm sân, tìm trận, chi tiết sân/trận vốn cho khách xem trước. Tài khoản đã đăng nhập sai vai trò nhận trang 403; khách vẫn xem trước được.
- Dùng chung quy tắc vai trò cho kiểm tra trang và đường dẫn tiếp tục sau đăng nhập; tránh chuyển tài khoản quản lý vào luồng người chơi từ liên kết lưu trước đó.
- File thay đổi: `css/style.css`, `js/ui.js`, `js/app.js`, `js/auth.js`.
- Kiểm tra: cú pháp JavaScript đạt; trình duyệt xác nhận 44 tổ hợp trang/vai trò và đường dẫn tiếp tục sau đăng nhập của cả bốn vai trò, không có lỗi JavaScript.

## 13/10/2026 — Tách nhãn trình độ khỏi nút xem trận

- Thêm khoảng cách **12px** giữa nhãn trình độ và nút **Xem trận & tham gia** trong thành phần thẻ trận đấu dùng chung.
- Thêm class `match-card-level` vào dòng trình độ và quy tắc khoảng cách tương ứng.
- Không thay đổi dữ liệu hay nghiệp vụ của trận đấu.
- File thay đổi: `js/ui.js`, `css/style.css`.
- Kiểm tra: cú pháp JavaScript bằng `node --check js/ui.js` đạt. Chưa ghi nhận kiểm tra trực quan riêng cho thay đổi khoảng cách này.

## 13/10/2026 — Bổ sung dữ liệu mẫu

### Nguyên nhân

Các trận mẫu cũ đã qua ngày chơi. Dữ liệu trong localStorage vẫn giữ các ngày cũ nên khu vực trận đang mở có thể không có nội dung.

### Thay đổi

- Thêm cơ chế bổ sung dữ liệu `supplementDemoData` trong `js/store.js`, chạy khi nạp kho dữ liệu.
- Bổ sung trận cầu lông và pickleball có ngày chơi sắp tới, còn chỗ để tham gia, có sân, khung giờ và đơn đặt tương ứng.
- Thêm lịch đặt sắp tới và trận của tài khoản người chơi mẫu khi thiếu.
- Bổ sung mẫu đơn chờ duyệt, bị từ chối, đã hủy và trận đã hủy khi cần.
- Bổ sung lịch đặt đã hoàn thành và trận đã diễn ra để có lịch sử hoạt động, dữ liệu doanh thu và đối tượng để đánh giá.
- Bổ sung đánh giá sân, đánh giá đối thủ và báo cáo người chơi khi thiếu; nội dung báo cáo nêu rõ là tình huống mẫu.
- Bổ sung sự kiện CLB có thành viên và đội hình, lịch sử gợi ý chia đội.
- Bổ sung gợi ý ghép trận đã lưu và nhận định nguy cơ vắng mặt mẫu.
- Bổ sung báo cáo hoạt động có số liệu từ các đơn trong khoảng thời gian báo cáo.
- Bổ sung thông báo cho tài khoản đang hoạt động chưa có thông báo.

### Bảo toàn dữ liệu

- Chỉ bổ sung bản ghi; không thay nội dung bản ghi hiện có của người dùng.
- Dùng dấu phiên bản `demoContentVersion`, ngày bổ sung trận `demoMatchBatchDate` và ID để tránh thêm trùng khi tải lại.
- Khi không còn trận tương lai đủ điều kiện, có thể bổ sung đợt trận mới vào ngày khác; không dời ngày các trận cũ.
- Không ghi đè lịch đã đóng hoặc đơn đặt hiện có; chọn giờ tránh xung đột khi tạo lịch mẫu.
- Không yêu cầu người dùng reset localStorage; dữ liệu được bổ sung khi tải lại website.
- Không thêm lại dữ liệu trò chuyện đã bị loại bỏ.
- Đợt này chỉ sửa `js/store.js`, không sửa HTML, CSS hay UI/UX.

### Kiểm tra đã thực hiện

- Kiểm tra dữ liệu cũ giữ nguyên sau bổ sung và việc tải lại không tạo bản ghi trùng.
- Kiểm tra tình huống ngày hiện tại vượt quá ngày các trận mẫu, các liên kết trận–đơn–khung giờ và những nhóm dữ liệu cần bổ sung.
- Kiểm tra trình duyệt với dữ liệu mới và dữ liệu cũ đã hết hạn: trang chủ có trận đang mở.
- Mở 42 trang chức năng theo vai trò, không gặp lỗi JavaScript hoặc thông báo lỗi tải trang trong lần kiểm tra này. Đây là kiểm tra tải trang, không đồng nghĩa kiểm thử mọi thao tác trên từng trang.
- Kiểm tra cú pháp `js/store.js` đạt.

## Các cải tiến trước đó có trong phiên bản hiện tại

Phần này ghi nhận chức năng/cải tiến đang có trong mã nguồn và README; không khẳng định từng mục đã được kiểm thử lại trong lần viết nhật ký này.

### Cấu trúc và phạm vi

- Website dùng HTML, CSS, JavaScript thuần và localStorage.
- Giữ bốn vai trò: Người chơi, Chủ sân, Điều phối CLB, Quản trị viên.
- Theo danh mục hiện hành: 42 trang chức năng và 2 trang chuyển hướng tương thích.
- Dùng thành phần JavaScript chung cho điều hướng, form, thẻ, bảng, hộp thoại và thông báo.
- Có tài liệu màn hình, phân công, kiểm thử và hướng dẫn chạy trong README và `docs/`.

### Giao diện và điều hướng dùng chung

- Có chế độ sáng/tối, nút chuyển trên thanh điều hướng, ghi nhớ lựa chọn và đồng bộ giữa các tab.
- Duy trì màu xanh chủ đạo, phối nền và màu chữ theo từng chế độ.
- Có menu mobile định vị theo nút mở, giới hạn kích thước theo vùng hiển thị.
- Có menu tài khoản và thao tác đăng xuất/đổi vai trò; desktop còn có thao tác ở cuối thanh bên.
- Có thành phần bảng/bản ghi và lịch sân thích ứng với màn hình nhỏ.
- Có thông báo phản hồi thành công hoặc lỗi cho các thao tác.
- Thẻ sân, lịch chọn ngày đặt sân và biểu tượng mạng xã hội có thành phần riêng trong mã nguồn.
- Các file liên quan chính: `css/style.css`, `js/ui.js`, `js/theme.js`, `js/app.js`.

### Người chơi

- Tìm, lọc sân và trận đấu; xem thông tin chi tiết.
- Chọn ngày bằng lịch của website, xem giờ trống và gửi yêu cầu đặt sân.
- Các sân mẫu tự bổ sung khung giờ cho 30 ngày tới, giữ dữ liệu lịch và đơn cũ.
- Quản lý lịch đặt, hủy đơn và theo dõi hoạt động.
- Có trang tạo trận riêng; tạo/sửa/hủy trận từ lịch sân đã duyệt, tham gia hoặc rút khỏi trận.
- Ghép trận theo tiêu chí và lưu gợi ý; thuật toán là mô phỏng bằng quy tắc.
- Có đánh giá sân, đánh giá bạn chơi sau trận và báo cáo người chơi.
- Đã gỡ tính năng trò chuyện; trang cũ chỉ chuyển hướng.
- File liên quan: `js/player.js`, `js/community.js`, `js/ai.js`, `js/store.js`.

### Chủ sân

- Thêm, sửa, lưu trữ và xóa sân theo các ràng buộc dữ liệu; có tải ảnh từ máy.
- Mở cửa sổ lịch khi xem sân, quản lý khung giờ trong lịch và kiểm tra trùng giờ.
- Không dùng tab quản lý khung giờ riêng trong luồng hiện hành; giữ trang chuyển hướng tương thích.
- Duyệt, từ chối, hủy, hoàn thành đơn đặt do người chơi gửi; đã bỏ luồng tạo đơn hộ người chơi.
- Có thống kê doanh thu theo thời gian và sân, cùng trang xem đánh giá sân.
- Có phân tích nguy cơ vắng mặt mô phỏng, cho phép lưu nhận định; không tự động từ chối đơn.
- File liên quan: `js/manage.js`, `js/community.js`, `js/ai.js`, `js/store.js`.

### Điều phối CLB

- Tạo, sửa, xóa, lưu trữ và hoàn thành sự kiện; sự kiện có giờ bắt đầu và kết thúc.
- Quản lý hồ sơ người chơi và danh sách tham gia sự kiện.
- Có chia đội tự động hoặc thủ công, chỉnh đội hình và lưu/xóa đội hình.
- Khi cập nhật danh sách thành viên, đội hình cũ được xóa để chia lại.
- File liên quan: `js/manage.js`, `js/ai.js`, `js/store.js`.

### Quản trị viên

- Quản lý tài khoản theo vai trò, tạo/sửa/vô hiệu hóa/kích hoạt tài khoản.
- Quản lý môn thể thao.
- Tạo, sửa, xóa, lưu trữ báo cáo hoạt động theo khoảng ngày và xuất CSV.
- Có danh sách báo cáo người chơi và đánh dấu đã xem xét.
- Kho dữ liệu có bổ sung/migration các nhóm dữ liệu như `playerReports` cho bản lưu cũ.
- File liên quan: `js/manage.js`, `js/community.js`, `js/store.js`.

### Tài khoản và hồ sơ

- Có đăng ký, xác minh, đăng nhập, ghi nhớ phiên, khôi phục và đổi mật khẩu theo luồng demo.
- Có trải nghiệm nhanh với bốn tài khoản mẫu.
- Hồ sơ có số điện thoại và tùy chọn công khai.
- Có liên kết mạng xã hội bằng biểu tượng, chỉ hiển thị liên kết hợp lệ đã lưu và mở sang tab mới.
- Có hồ sơ công khai, thông báo, cài đặt và khôi phục dữ liệu mẫu sau xác nhận.
- File liên quan: `js/auth.js`, `js/app.js`, `js/community.js`, `js/store.js`.

## Các điểm đã giải thích, chưa chỉnh sửa

- **Lưu trữ sân:** chuyển sân sang trạng thái lưu trữ, giữ lịch sử; chặn thao tác khi còn đơn chờ duyệt hoặc đã duyệt. Hiện chưa có nút khôi phục sân đã lưu trữ. Cuộc trao đổi về ý nghĩa nút không tạo thay đổi mã nguồn.
- **Tải CSV:** xuất dữ liệu báo cáo dạng bảng để mở bằng Excel/Google Sheets. Đề xuất tên “Xuất báo cáo (CSV)” mới chỉ là gợi ý, chưa đổi tên nút.
- Những yêu cầu lịch sử không được xác minh ở trên không được coi là đã hoàn tất chỉ vì từng xuất hiện trong cuộc trò chuyện.

## 13/10/2026 — Bổ sung nhật ký

- Tạo `CHANGELOG.md` để tổng hợp thay đổi, phạm vi kiểm tra và các giới hạn đã biết.
- Chỉ thêm tài liệu, không sửa chức năng, giao diện, dữ liệu ứng dụng hoặc Git/GitHub trong lần cập nhật nhật ký này.

# 
