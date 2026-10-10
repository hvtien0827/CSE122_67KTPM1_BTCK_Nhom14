# CourtConnect – Prompt Figma: Trang chủ khách

Thiết kế trang chủ **CourtConnect** dành cho **khách chưa đăng nhập**, dựa trên 3 ảnh phác thảo đính kèm. **Bắt buộc tạo đầy đủ hai giao diện riêng: desktop và mobile, không chỉ mô tả responsive hoặc thu nhỏ bản desktop.** CourtConnect giúp tìm người chơi cùng trình độ, tạo/tham gia trận đấu và tìm, đặt sân thể thao. Toàn bộ giao diện dùng tiếng Việt; giữ thứ tự các phần dưới đây.

## Phong cách

- Hiện đại, năng động, tối giản, phù hợp đồ án web và dễ triển khai bằng HTML/CSS/JavaScript.
- Màu chủ đạo: **đen #111111, trắng #FFFFFF, xanh lá #15803D**. Nền trắng, chữ đen, nút chính xanh lá với chữ trắng; dùng xám nhạt cho nền phụ và đường viền. Footer nền đen, chữ trắng.
- Font Be Vietnam Pro hoặc Inter, khoảng cách theo hệ 8px, bo góc 12–16px, bóng nhẹ, tương phản rõ. Tránh hiệu ứng và gradient rườm rà.

## Bố cục từ trên xuống

1. **Header:** logo và tên CourtConnect bên trái; “Đăng nhập” và nút xanh “Đăng ký” bên phải.
2. **Hero hai cột:** bên trái có tiêu đề lớn “Tìm cộng đồng thể thao của bạn”, mô tả “Kết nối với người chơi gần bạn, tạo trận đấu và tìm sân phù hợp chỉ trong vài bước.”; hai nút “Tìm người chơi” (chính) và “Tạo trận đấu” (viền). Bên phải là ảnh thể thao nổi bật, ưu tiên người chơi cầu lông trên sân.
3. **Gợi ý trận đấu:** 3 thẻ nằm ngang trên desktop. Mỗi thẻ có môn thể thao, số người hiện tại/tổng số chỗ (ví dụ 2/4), địa điểm, ngày, khung giờ, trình độ và nút “Tham gia”. Dùng icon vị trí, lịch và đồng hồ để dễ đọc; điền nội dung mẫu thực tế.
4. **Đặt sân:** 3 thẻ nằm ngang, mỗi thẻ có ảnh sân, tên sân, địa chỉ và nút “Đặt sân”. Kích thước ảnh và vị trí nút nhất quán giữa các thẻ.
5. **Lời kêu gọi hành động:** khối nổi bật, căn giữa, tiêu đề “Sẵn sàng ra sân ngay?”, mô tả “Tham gia CourtConnect và bắt đầu kết nối với người chơi quanh bạn.” và nút “Bắt đầu”.
6. **Footer ba cột:** (1) logo, tên thương hiệu và mô tả ngắn về kết nối cộng đồng thể thao; (2) “Tính năng” gồm Tìm người chơi, Tạo trận đấu, Sân gần bạn, Chat, Tìm trận đấu; (3) “Liên hệ” gồm email, Facebook, Instagram với icon tương ứng. Thông tin liên hệ dùng dữ liệu minh họa.

## Giao diện mobile bắt buộc

- Tạo frame **390px**, chiều cao theo toàn bộ nội dung, có đủ 6 phần như desktop và cuộn dọc. Thiết kế thích ứng với chiều rộng 360–430px, lề hai bên 16px, không tràn hoặc cuộn ngang.
- **Header:** logo và tên thương hiệu gọn bên trái, nút menu bên phải. Thiết kế thêm trạng thái menu mở chứa “Đăng nhập” và “Đăng ký”, có nút đóng rõ ràng.
- **Hero:** một cột, thứ tự tiêu đề → mô tả → hai nút xếp dọc rộng toàn phần → ảnh thể thao. Tiêu đề khoảng 30–34px, ảnh tỉ lệ 4:3, không che hoặc cắt nội dung chữ.
- **Gợi ý trận đấu và Đặt sân:** mỗi hàng một thẻ rộng toàn phần, hiển thị đủ 3 thẻ mỗi mục. Cho phép địa chỉ xuống dòng; thông tin ngày, giờ, trình độ và số chỗ dễ đọc; nút thao tác dễ chạm.
- **Lời kêu gọi hành động:** nội dung căn giữa, nút “Bắt đầu” rộng toàn phần. **Footer:** xếp ba nhóm nội dung thành một cột, giữ đủ liên kết và thông tin liên hệ.
- Chữ nội dung tối thiểu 16px, vùng chạm tối thiểu 44×44px, khoảng cách giữa các phần 32–48px. Dùng cùng màu sắc, font và phong cách component với desktop.

## Trạng thái khách và đầu ra

- Khách được xem gợi ý trận đấu và danh sách sân. Khi chọn “Tạo trận đấu”, “Tham gia”, “Đặt sân” hoặc “Chat”, hiển thị yêu cầu đăng nhập trước khi tiếp tục. Nút “Bắt đầu” dẫn đến đăng ký. Không hiển thị avatar, thông báo hay menu tài khoản đã đăng nhập.
- Tạo hai frame hoàn chỉnh đặt cạnh nhau: **“Trang chủ khách — Desktop 1440”** (vùng nội dung khoảng 1200px) và **“Trang chủ khách — Mobile 390”**. Không bỏ phần cuối trang ở bản mobile.
- Tạo thêm trạng thái **menu mobile mở** và **nhắc đăng nhập trên cả desktop/mobile**; hộp thoại trên mobile vừa màn hình, có nút “Đăng nhập” và “Để sau”.
- Dùng Auto Layout và component tái sử dụng cho nút, thẻ trận đấu, thẻ sân; cấu hình Fill container/Hug contents hợp lý, có trạng thái hover/focus cho nút. Chỉ thiết kế trang chủ và các trạng thái nêu trên, không cần dựng riêng các trang đăng nhập/đăng ký.
