# CourtConnect — Prompt Figma Design: Đăng nhập, đăng ký và khôi phục mật khẩu

Thiết kế tiếp bộ giao diện xác thực của **CourtConnect** trong **Figma Design**, đồng bộ với trang chủ và hộp nhắc đăng nhập đã có. Tạo các frame có layer chỉnh sửa được, trải toàn bộ màn hình ra canvas. **Mỗi màn hình và trạng thái quan trọng phải có cả desktop 1440px và mobile 390px.** Toàn bộ nội dung bằng tiếng Việt.

## 1. Giữ nguyên phong cách hiện có

- Dùng các frame trang chủ/nhắc đăng nhập hiện có và 4 PDF xuất trong thư mục “UI degisn project” làm tham chiếu hình ảnh. Ưu tiên style/component trong file Design gốc khi có khác biệt với thông số gợi ý dưới đây.
- Giữ logo chữ **C trắng trong ô vuông xanh bo góc** và tên CourtConnect. Giữ nguyên font, độ đậm, kiểu chữ, màu sắc, bo góc, icon và cách phân cấp thông tin của bộ UI hiện tại; không tự đổi nhận diện.
- Bảng màu kế thừa: xanh lá chính #15803D, chữ đen #111111, nền trắng, nền phụ xám rất nhạt, chữ phụ xám xanh, viền xám nhạt. Icon xanh đặt trong vòng tròn xanh rất nhạt cho các bước xác minh/thành công. Màu lỗi chỉ dùng ở thông báo và trường lỗi.
- Card trắng, bo góc khoảng 12–16px, bóng nhẹ, icon nét mảnh, khoảng cách theo hệ 8px. Nút chính xanh chữ trắng, nút phụ trắng viền mảnh. Không dùng nền tối toàn trang, viền đen dày, bóng đổ cứng hoặc gradient nổi bật.
- Giữ nguyên các màn hình trang chủ đã làm. Chỉ bổ sung bộ xác thực và liên kết prototype với các nút hiện có.

## 2. Các màn hình chính bắt buộc

Tạo **10 màn hình dưới đây × 2 kích thước = tối thiểu 20 frame chính**, ngoài các frame trạng thái bổ sung.

### 01 — Đăng nhập
- Logo, tiêu đề “Đăng nhập”, mô tả “Chào mừng bạn trở lại CourtConnect”.
- Trường Email và Mật khẩu với nhãn luôn hiển thị; nút hiện/ẩn mật khẩu.
- Checkbox “Ghi nhớ đăng nhập”, liên kết “Quên mật khẩu?”.
- Nút chính “Đăng nhập”; đường phân cách “Hoặc”; nút phụ “Tiếp tục với Google”.
- Dòng “Chưa có tài khoản? Đăng ký” và liên kết “Về trang chủ”.
- Đăng nhập thành công: thông báo ngắn và điểm nối trở lại trang/hoạt động trước đó; nếu không có thì về trang chủ. Không cần thiết kế thêm dashboard.

### 02 — Đăng ký
- Tiêu đề “Tạo tài khoản”, mô tả ngắn về kết nối người chơi và đặt sân.
- Trường Họ và tên, Email, Mật khẩu, Xác nhận mật khẩu; hiện/ẩn ở cả hai trường mật khẩu.
- Gợi ý mật khẩu minh họa nhất quán: ít nhất 8 ký tự, có chữ và số; chỉ báo độ mạnh và điều kiện đã đạt.
- Checkbox chưa chọn sẵn: “Tôi đồng ý với Điều khoản sử dụng và Chính sách bảo mật”, hai liên kết phân biệt rõ.
- Nút “Tạo tài khoản”; “Hoặc”; “Tiếp tục với Google”; “Đã có tài khoản? Đăng nhập”.
- Sau khi gửi hợp lệ, đi đến màn xác nhận đã gửi mã đăng ký; chưa hiển thị tài khoản đã được xác minh.

### 03 — Đã gửi mã xác minh đăng ký
- Icon email, tiêu đề “Kiểm tra email của bạn”.
- Thông báo đã gửi mã xác minh đến email che bớt ký tự, ví dụ “t***@gmail.com”; hướng dẫn kiểm tra cả thư rác.
- Nút “Nhập mã xác minh”, liên kết “Thay đổi email” quay lại đăng ký và giữ họ tên.
- Đây là màn xác nhận yêu cầu gửi email đã được tiếp nhận, chưa phải xác minh thành công.

### 04 — Nhập mã xác minh đăng ký
- Tiêu đề “Xác minh email”, email nhận mã và liên kết thay đổi email.
- Cụm nhập mã gồm 6 chữ số, nút “Xác minh email”.
- “Chưa nhận được mã?” và “Gửi lại mã sau 00:60”; hết đếm ngược mới bật “Gửi lại mã”. Thời gian hiệu lực minh họa 05:00, có nhãn phân biệt với thời gian chờ gửi lại.
- Nêu trong ghi chú prototype: tự chuyển ô, xóa quay lại ô trước, cho phép dán đủ 6 số và tự điền mã. Không thiết kế ô nhỏ khó chạm.

### 05 — Đăng ký thành công
- Icon dấu tích xanh, tiêu đề “Tài khoản đã sẵn sàng!”, mô tả “Email đã được xác minh. Đăng nhập để bắt đầu kết nối và ra sân.”
- Nút “Đăng nhập ngay” dẫn về đăng nhập, điền sẵn email vừa xác minh; liên kết “Về trang chủ”.

### 06 — Quên mật khẩu / Nhập email
- Tiêu đề “Quên mật khẩu?”, mô tả “Nhập email bạn dùng để đăng ký. Chúng tôi sẽ gửi mã xác nhận để đặt lại mật khẩu.”
- Trường Email, nút “Gửi mã xác nhận”, liên kết “Quay lại đăng nhập”.
- Nhãn tiến trình gọn: “1. Email → 2. Xác minh → 3. Mật khẩu mới”, làm nổi bước hiện tại.

### 07 — Xác nhận yêu cầu khôi phục
- Icon email, tiêu đề “Kiểm tra email của bạn”.
- Thông báo: “Nếu email này đã được đăng ký, bạn sẽ nhận được mã xác nhận để đặt lại mật khẩu.” Hiển thị email che bớt ký tự, nhắc kiểm tra thư rác.
- Nút “Nhập mã xác nhận”, liên kết “Đổi địa chỉ email” quay lại bước 06 và “Quay lại đăng nhập”.

### 08 — Chờ nhập mã khôi phục mật khẩu
- Tiêu đề “Nhập mã xác nhận”, nhắc email nhận mã; làm nổi bước 2.
- 6 ô mã ban đầu trống, sẵn sàng nhập; đây là màn chờ người dùng nhập mã, không phải màn loading vô hạn.
- Nút “Xác nhận mã”, liên kết đổi email, đếm ngược gửi lại và thời gian hiệu lực như màn 04. Hỗ trợ dán mã và thao tác bàn phím tương tự.
- Chỉ chuyển sang đặt mật khẩu mới sau trạng thái xác minh mã thành công.

### 09 — Đặt mật khẩu mới
- Tiêu đề “Đặt mật khẩu mới”, làm nổi bước 3.
- Mật khẩu mới và Xác nhận mật khẩu mới, hiện/ẩn mật khẩu, gợi ý điều kiện và độ mạnh giống đăng ký.
- Nút “Lưu mật khẩu mới”. Lỗi không khớp đặt sát trường xác nhận; không để người dùng phải nhập lại mã khi chỉ gõ sai xác nhận mật khẩu.

### 10 — Đặt lại mật khẩu thành công
- Icon dấu tích xanh, tiêu đề “Đổi mật khẩu thành công”, mô tả “Bạn có thể đăng nhập bằng mật khẩu mới.”
- Nút “Quay lại đăng nhập”; không tự coi người dùng đã đăng nhập.

## 3. Trạng thái và phản hồi cần thiết

Tạo component variants và các frame minh họa riêng trên **cả desktop lẫn mobile**. Ghi rõ tên trạng thái, không chỉ ghi chú bằng chữ ngoài canvas:

- **Form:** trống, đang nhập/focus, hợp lệ, lỗi thiếu trường, sai định dạng email; lỗi ngay dưới trường, giữ dữ liệu đã nhập và không chỉ dùng màu để báo lỗi.
- **Đăng nhập:** đang xử lý với spinner trong nút; sai email/mật khẩu với thông báo chung; tài khoản chưa xác minh với CTA “Xác minh email”; thử quá nhiều lần với thông báo chờ và thử lại.
- **Đăng ký:** mật khẩu yếu, xác nhận không khớp, chưa đồng ý điều khoản; email đã được sử dụng với lối sang đăng nhập/quên mật khẩu.
- **Mã xác minh ở cả hai luồng:** nhập một phần, nhập đủ, đang kiểm tra, mã sai, mã hết hạn, gửi lại thành công, gửi lại thất bại. Khi gửi lại thành công, xóa mã cũ và khởi động lại bộ đếm trong prototype.
- **Đặt lại mật khẩu:** không đạt yêu cầu, xác nhận không khớp, đang lưu, phiên khôi phục hết hạn với CTA “Gửi mã mới”.
- **Lỗi kết nối/dịch vụ:** thông báo dễ hiểu, nút “Thử lại”, không xóa dữ liệu form. Nút đang xử lý không nhận thao tác lặp.
- **Google:** mô phỏng đang kết nối, hủy và lỗi với khả năng thử lại/đăng nhập bằng email. Chỉ thể hiện UI phía CourtConnect, không dựng lại trang đăng nhập của Google.

## 4. Desktop và mobile

- **Desktop 1440px:** header gọn kế thừa logo trang chủ, liên kết “Về trang chủ”; nền xám rất nhạt; card xác thực trắng rộng khoảng 440–480px, padding 32px, căn giữa vùng nội dung. Form đăng ký dài được cuộn tự nhiên. Footer gọn có thương hiệu, Điều khoản, Chính sách bảo mật.
- **Mobile 390px:** thiết kế riêng, thích ứng 360–430px, một cột, lề 16px, padding card 20–24px, nút chính rộng toàn phần. Logo và liên kết quay lại rõ ràng; không dùng ảnh trang trí lớn làm form rơi xuống quá xa.
- Input/nút cao khoảng 48px, vùng chạm tối thiểu 44×44px, chữ nhập liệu tối thiểu 16px. Cụm 6 ô mã phải vừa vùng nội dung; có thể giảm padding ngang của card mã để đủ vùng chạm.
- Không tràn ngang, không cắt lỗi hoặc nhãn dài. Form được cuộn dọc khi bàn phím điện thoại mở; nút và trường đang nhập vẫn tiếp cận được. Không khóa chiều cao khiến phần đăng ký phía dưới bị mất.
- Các màn thành công và lỗi vẫn giữ cùng cấu trúc, kích thước chữ và phong cách nút; mobile không phải bản desktop thu nhỏ.

## 5. Prototype và tổ chức canvas

- Luồng đăng ký: **02 → 03 → 04 → 05 → 01**.
- Luồng khôi phục: **01 → 06 → 07 → 08 → 09 → 10 → 01**.
- Liên kết qua lại đăng nhập/đăng ký; đổi email quay về đúng bước; xác minh email chưa hoàn tất từ màn đăng nhập dẫn vào luồng xác minh đăng ký.
- Nối nút Đăng nhập, Đăng ký, Bắt đầu và nút Đăng nhập trong hộp nhắc hiện có vào đúng frame mới. Nếu chỉ có PDF tham chiếu, ghi chú điểm nối vào trang chủ thay vì dựng lại trang chủ.
- Prototype minh họa các chuyển màn, hiện/ẩn mật khẩu, lỗi, gửi lại mã và thành công. Dùng dữ liệu giả, không cần backend hoặc gửi email thật. Bộ đếm/thời hạn là thông số minh họa có thể chỉnh sửa.
- Đặt các section “Đăng nhập”, “Đăng ký & Xác minh email”, “Khôi phục mật khẩu”, “Trạng thái & Components”. Desktop ở hàng trên, mobile tương ứng ở hàng dưới; sắp màn từ trái sang phải theo luồng.
- Tên frame: “Auth / 01 Đăng nhập / Desktop 1440 / Default”, “Auth / 01 Đăng nhập / Mobile 390 / Error”… Mỗi màn phải nhìn thấy riêng trên canvas, không chỉ nằm ẩn trong prototype hoặc variant.
- Tái sử dụng component logo, nút, input, password input, checkbox, OTP, cảnh báo, card và success state. Dùng Auto Layout, constraints, Fill container/Hug contents và style hiện có.

**Kết quả cần bàn giao:** đầy đủ 20 frame chính và các frame trạng thái trên cả hai kích thước, layer chỉnh sửa được, bố cục phẳng trên canvas Figma Design, có prototype nối luồng, đồng bộ với UI CourtConnect đã cung cấp.
