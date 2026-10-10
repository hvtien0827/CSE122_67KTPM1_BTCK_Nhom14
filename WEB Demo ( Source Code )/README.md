# CourtConnect — bản 28 trang

HTML/CSS/JavaScript thuần, 3 vai trò: người chơi, chủ sân, admin. Phạm vi theo `phan_loai_giao_dien_he_thong.md` và yêu cầu tái cấu trúc ngày 28/09/2026. Các yêu cầu cũ mâu thuẫn đã được thay thế.

## Chạy

Mở `source_code` bằng Live Server hoặc chạy `node tests/serve.cjs`, truy cập http://127.0.0.1:4173. Dùng cùng địa chỉ/cổng để giữ chung dữ liệu giữa các vai trò. Không cần cài thư viện để chạy website.

## Tài khoản mẫu

| Vai trò | Email | Số điện thoại | Mật khẩu |
|---|---|---|---|
| Người chơi | player@courtconnect.demo | 0900000001 | Court123! |
| Chủ sân | venue@courtconnect.demo | 0900000002 | Court123! |
| Admin | admin@courtconnect.demo | 0900000004 | Court123! |

Mã xác minh số điện thoại/đổi mật khẩu: **482915**, có hiệu lực 5 phút, gửi lại sau 60 giây. Không gửi SMS thật. Các tài khoản chủ sân `demo-owner-pending@courtconnect.demo` và `demo-owner-rejected@courtconnect.demo` minh họa chờ duyệt/từ chối, cùng mật khẩu mẫu.

## Luồng chính

- Đăng ký chọn Người chơi/Chủ sân; chủ sân khai thông tin sân và cần admin duyệt sau xác thực số điện thoại.
- Tìm sân → xem chi tiết/lịch → đồng ý chia sẻ tên/số điện thoại → gửi đơn → chủ sân duyệt/hoàn thành → đánh giá sân.
- Tạo trận trên lịch sân được duyệt → người khác gửi yêu cầu → chủ trận xem thống kê và duyệt/từ chối. Kiểm tra lại sức chứa và lịch trùng khi duyệt.
- Chủ sân gửi đề xuất thêm/sửa/xóa sân; admin duyệt trước khi thay đổi công khai. Xóa là lưu trữ, giữ lịch sử và chặn khi còn đơn chưa xử lý.
- Lịch sân tuần nằm trong Quản lý đặt sân; mobile chuyển sang ngày. Lịch đã thuê màu xanh; khung chưa mở bán không được tính là trống.
- Cảnh báo AI mô phỏng nếu người chơi tự hủy ít nhất 2 lượt đặt trong 30 ngày; admin/chủ sân vẫn quyết định, không tự kết luận vi phạm.
- Báo cáo người dùng/sân gồm mô tả và bằng chứng; admin xem xét, cảnh báo/khóa/không xử phạt. Bằng chứng nhập bằng mô tả hoặc đường dẫn, không tải tệp lên máy chủ.
- Admin gửi/thu hồi thông báo theo nhóm. Chat hai chiều lưu trên cùng trình duyệt. Doanh thu có lọc ngày/tuần/tháng/năm và sân.

## Cấu trúc

- `js/store.js`: seed, phiên, giao dịch localStorage, đặt sân và trận.
- `js/domain.js`: nâng cấp dữ liệu, duyệt chủ sân/sân/trận, báo cáo, thông báo, thống kê.
- `js/ui.js`, `css/style.css`, `js/theme.js`: thành phần chung, responsive, sáng/tối.
- `js/auth.js`: đăng ký, đăng nhập, OTP số điện thoại, khôi phục.
- `js/player.js`: tìm sân/trận, đặt sân, hoạt động, tạo trận.
- `js/community.js`: đánh giá sân, thông tin nổi, lịch và doanh thu.
- `js/manage.js`: chủ sân và admin.
- `js/ai.js`: ghép trận theo quy tắc, có giải thích và lưu gợi ý.
- `js/app.js`: 28 route, phân quyền và trang dùng chung.

Danh mục đầy đủ: [screen-list.md](docs/screen-list.md). Đối chiếu thay đổi: [refactor-28-plan.md](docs/refactor-28-plan.md).

## Dữ liệu và giới hạn

Không backend, SMS thật, LLM, thanh toán hay chat đa thiết bị. Dữ liệu và mật khẩu demo lưu trong trình duyệt. Kiểm soát quyền phía frontend không phải bảo mật production. Chỉ dùng dữ liệu giả.

Nâng cấp không tự reset dữ liệu. Vai trò CLB cũ bị ngừng sử dụng, không đổi vai trò; sự kiện/đánh giá đối thủ/mạng xã hội/nhận định AI ngoài phạm vi được giữ trong `legacy`. Không suy đoán người hủy cho lịch sử cũ thiếu thông tin. Các ngày mẫu cố định theo ngày tạo dữ liệu; không tự dời lịch người dùng. Cài đặt cho tải bản sao và khôi phục có xác nhận.

Bản ZIP trước tái cấu trúc nằm ngoài `source_code`: `courtconnect-before-28-pages-20260928-211347.zip`.

## Kiểm thử

Chạy server trước. Bộ test cần Playwright và Chromium (chỉ phục vụ phát triển), cấu hình `BASE_URL`, `PLAYWRIGHT_PATH`, `BROWSER_PATH` nếu dùng runtime có sẵn:

```sh
node tests/smoke.cjs
node tests/integration.cjs
node tests/edge-cases.cjs
```

Test dùng hồ sơ trình duyệt riêng, không sửa dữ liệu trình duyệt đang sử dụng. Kết quả và giới hạn: [test-report.md](docs/test-report.md).

Đây là bản mã có AI hỗ trợ, chưa thay thế minh chứng học tập/thực hành của 4 thành viên. Nhóm cần tự đọc, sửa, review và quay minh chứng thực tế; không tạo lịch sử Git hoặc bằng chứng giả.
