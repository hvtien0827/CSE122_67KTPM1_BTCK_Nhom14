# Nhật ký thay đổi CourtConnect

Ngày tổng hợp: **13/10/2026**. Áp dụng cho thư mục `web_demo_source_code` hiện tại.

Nhật ký tổng hợp từ các thay đổi đã xác nhận trong cuộc trao đổi và mã nguồn/tài liệu hiện có. Đây không phải bản trích xuất lịch sử Git. Những cải tiến cũ không xác định được ngày thực hiện được ghi theo nhóm chức năng, không gán ngày hay người thực hiện. Bản thiết kế lại đã bị loại bỏ không thuộc nhật ký này.

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
