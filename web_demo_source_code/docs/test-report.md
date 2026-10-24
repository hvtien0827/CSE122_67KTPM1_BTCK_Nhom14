# Báo cáo kiểm thử

## Xác minh dọn mã ngày 24/10/2026

Bản đem thử có 41 trang chức năng và 2 URL chuyển hướng; dữ liệu localStorage, chưa tích hợp JSON Server. Chạy bằng Chrome với hồ sơ/dữ liệu thử riêng, trên bản sao khớp mã nguồn trong nhánh `refactor/remove-unused-code`.

**Phạm vi đầu vào:** bản kết hợp phần dọn với main mới `59b93f9` (đã merge PR #7). Đã giữ cả kiểm tra chuyển hướng và ghép trận khi xử lý xung đột package.json, rồi chạy lại toàn bộ các bộ kiểm tra dưới đây.

- 18 bộ kiểm tra hiện hành đều đạt; bao gồm 82 lượt smoke và 164 lượt mỗi bộ icon/theme, nghiệp vụ đặt sân/tạo-tham gia trận, cộng đồng, lịch, phân quyền, khôi phục dữ liệu và responsive.
- `tests/skill-participation.cjs`: 21 kiểm tra tương tác nhiều player, tài khoản phụ, tham gia/rút, hết chỗ, thông báo, hủy trận và giữ trạng thái đều đạt trên bản kết hợp.
- `tests/redirects.cjs`: 20 trường hợp khách/bốn role ở desktop/mobile, kiểm tra dữ liệu được giữ và đăng nhập từ URL cũ rồi mở lịch sân. Chạy bằng `npm run test:redirects` khi server đang hoạt động.
- 188 cặp ảnh đối chiếu với main mới `59b93f9` đều khớp pixel; nội dung và dữ liệu cũng khớp.
- Rà đường dẫn/ID, binding/template, JS/CSS và đối chiếu nguồn kiểm thử đạt. Ảnh/log mới nằm ngoài repo, không ghi đè minh chứng cũ trong `tests/artifacts`.

Chi tiết phạm vi, bản đầu vào và các giới hạn tại [báo cáo dọn mã](source-cleanup-report.md). Chưa kiểm thử trên Firefox/Safari hoặc điện thoại vật lý. Những mục bên dưới là lịch sử; nhận xét thiếu trình duyệt ở đợt cũ không áp dụng cho lần chạy ngày 24/10.

## Các đợt kiểm tra trước (lịch sử)

## Ghép trận và tham gia trực tiếp — 23/10/2026

- Ghép trận không còn bước chọn/lưu gợi ý. Nút Tôi muốn tham gia đăng ký thành viên thật; thẻ Trận đấu đã lưu dùng dữ liệu tham gia sắp tới, có chi tiết và hủy tham gia. Hủy trận từ chủ trận cập nhật trạng thái ở tài khoản người tham gia.
- Tiêu chí/bản nháp được giữ riêng theo tài khoản trong sessionStorage, kết quả tính lại khi quay lại từ chi tiết và khi dữ liệu thay đổi giữa các tab.
- `skill-participation.cjs`: 21 kiểm tra, gồm chủ trận tạo từ UI, đăng nhập tài khoản phụ, tham gia/rút/tái tham gia, số chỗ, thông báo chủ trận, không trùng thành viên, chặn trùng lịch, trận đầy, chủ trận hủy, reload/Back, dữ liệu cũ, giữ mật khẩu/trạng thái đã sửa và bố cục 320/390px.
- Tài khoản demo phụ: p2@demo.vn / 123456. Demo nhiều Player dùng hai tab cùng trình duyệt và cùng origin, không bật Ghi nhớ đăng nhập. localStorage không đồng bộ giữa hai máy hoặc hai trình duyệt riêng.
- Đã kiểm tra ảnh desktop/mobile, sáng/tối; các bộ test nghiệp vụ, giao diện và icon được chạy lại. Các nhận xét về chọn/lưu gợi ý bên dưới thuộc luồng cũ.


## Gỡ trang phân tích vắng mặt — kiểm tra 23/10/2026

- Hiện có 41 trang chức năng, 2 URL chuyển hướng; trang đã gỡ trả HTTP 404, không còn liên kết menu hoặc route xử lý.
- `venue-removal.cjs`: kiểm tra dữ liệu mới/cũ/legacy, dọn nhận định và thông báo, giữ đơn đặt/trạng thái và thống kê CLB; tải lại không phát sinh thay đổi; không ghi đè dữ liệu hỏng. Kiểm tra 32 lượt trang chủ sân/dùng chung ở desktop/mobile, sáng/tối và menu mobile đạt.
- Smoke: 82 lượt trang/kích thước; theme và Bootstrap Icons: 164 lượt trang/kích thước/theme; không lỗi JavaScript hoặc tràn ngang toàn trang.
- Tích hợp: 38 xác nhận; edge cases: 35; usability: 142; lịch: 83; interface: 88. Các bộ cấu trúc, HTML tĩnh, cộng đồng, hoạt động mobile, khôi phục bốn role, dọn sân cũ và chọn môn tạo trận đạt.
- Skill Match và Team Balancer tiếp tục hoạt động; thống kê số lần vắng của người chơi CLB được giữ vì không thuộc trang bị gỡ.

## Các đợt kiểm tra trước khi gỡ trang


> Cập nhật phạm vi 23/10/2026: trang phân tích vắng mặt của chủ sân đã gỡ. Hiện có 41 trang chức năng, 2 URL tương thích; AI còn Skill Match và Team Balancer. Các số liệu bên dưới ghi nhận đợt kiểm tra trước khi gỡ. Xem [phạm vi hiện hành](screen-list.md).

Bản sau khi dọn đã qua **12/12 bộ kiểm tra**, 98 cặp ảnh trước–sau khớp và dữ liệu khởi tạo không đổi. Xem [báo cáo dọn mã](source-cleanup-report.md) và [phụ thuộc theo trang](page-dependencies.json). Các mục bên dưới là kết quả của những phiên trước.

# Cập nhật kiểm thử cấu trúc — 21/10/2026

Bản cuối sau khi tách role đã qua toàn bộ 11 bài kiểm tra trình duyệt và kiểm tra cấu trúc. Xem [báo cáo chi tiết](structure-refactor-report.md) và [bản đồ code](code-map.md). Những phần dưới là báo cáo lịch sử.

# Báo cáo kiểm thử và phạm vi xác nhận

## Gỡ điều khiển thử lỗi AI khỏi giao diện — 19/10/2026

Đã bỏ mục “Kiểm tra tình huống AI” và checkbox gây lỗi trên Skill Match, Team Balancer, No-show Risk. Các thuật toán mô phỏng, xử lý lỗi dữ liệu, nút thử lại và thao tác thủ công vẫn giữ. Bài test dùng helper tiêm lỗi một lần vào phụ thuộc dữ liệu, không dùng checkbox hoặc nhánh gây lỗi trong sản phẩm.

- `smoke.cjs`: 84 lượt trang desktop/mobile đạt; không lỗi JavaScript hoặc tràn ngang.
- `static-html.cjs`: đạt; bố cục HTML và sáu CSS giữ đúng cấu trúc.
- `integration.cjs`: 40 xác nhận, gồm không có công tắc lỗi trên Skill Match, xử lý lỗi, thao tác thủ công và thử lại thành công.
- `edge-cases.cjs`: 37 xác nhận, gồm không có công tắc lỗi ở Team Balancer/No-show Risk, xử lý lỗi, chia thủ công và hiển thị thử lại.

Các lượt trên chạy bằng Chrome headless, hồ sơ trình duyệt và bản sao kiểm thử riêng; không dùng dữ liệu trình duyệt cá nhân. Báo cáo các phiên trước bên dưới là lịch sử tại thời điểm chạy.

## Lịch chọn ngày đồng bộ giao diện — 19/10/2026

- `date-picker.cjs`: **83 xác nhận đạt** cho sáng/tối, 320/390/1440 px, chọn/xóa ngày, đổi tháng/năm, ngày nhuận, điều hướng bàn phím, min/max, ô bắt buộc, bộ lọc trận, doanh thu và lịch trong dialog.
- `smoke.cjs`: **84 lượt trang đạt**, không lỗi JavaScript hoặc tràn ngang. `interface-polish.cjs`: **88 xác nhận đạt**; `integration.cjs`: **38 xác nhận đạt**; `static-html.cjs`: đạt.
- Đã xem ảnh lịch mới trên desktop/mobile. Input gốc vẫn giữ tên và ngày ISO cho các luồng xử lý, còn phần hiển thị dùng tiếng Việt và màu theo theme. Lịch chọn khung giờ đặt sân hiện có không bị thay.

Bằng chứng: [kết quả lịch dùng chung](../tests/artifacts/date-picker-results.json), [lịch tối desktop](../tests/artifacts/shared-date-dark-1440.png), [lịch tối mobile](../tests/artifacts/shared-date-dark-390.png), [lịch sáng desktop](../tests/artifacts/shared-date-light-1440.png). Kiểm tra bằng Chrome headless; chưa kiểm tra trên điện thoại thật.

## Tách HTML / CSS / JavaScript — 19/10/2026

Đã kiểm tra bản frontend sau khi chuyển bố cục và form popup vào HTML, tách sáu CSS và cập nhật dữ liệu qua `views.js`. Môi trường: Windows, Google Chrome headless qua Playwright, HTTP localhost, hồ sơ trình duyệt thử riêng.

| Bộ kiểm tra | Kết quả |
|---|---|
| `static-html.cjs` | 44 HTML có bố cục riêng, đúng sáu CSS; 12 trang đại diện hiển thị tiêu đề/bố cục khi tắt JavaScript; sửa HTML không bị ghi đè sau khi lọc; giá trị form có ký tự đặc biệt được giữ đúng. |
| `smoke.cjs` | 84 lượt trang desktop/mobile; không có lỗi JavaScript hoặc tràn ngang. |
| `integration.cjs` | 38 xác nhận đạt: tài khoản, OTP, đặt/duyệt/hủy sân, trận đấu, AI, quyền, CSV, hồ sơ. |
| `edge-cases.cjs` | 35 xác nhận đạt: dữ liệu sai, lịch trùng, OTP hết hạn, chia đội thiếu người, dữ liệu hỏng và khôi phục. |
| `usability-regression.cjs` | 145 xác nhận đạt, gồm mobile 320/390/760 px và dữ liệu cũ. |
| `interface-polish.cjs` | 88 xác nhận đạt cho bố cục, lịch chọn ngày, bảng, menu tài khoản và theme. |
| `theme.cjs` | 168 lượt trang; lưu lựa chọn, bàn phím, đồng bộ giữa tab, nút xanh và dialog đều đạt. |
| `community.cjs`, `mobile-activities.cjs` | Đánh giá/báo cáo, thông báo thành công, riêng tư, lịch sân, lọc doanh thu, nhóm tài khoản và menu mobile đạt. |
| `restore-four-roles.cjs` | Khôi phục dữ liệu CLB, hợp nhất theo ID, giữ bản chỉnh sửa hiện tại và trạng thái khóa thủ công đạt. |

Đã đối chiếu **52 cặp ảnh** của 13 trang đại diện × desktop/mobile × sáng/tối, cùng dữ liệu mẫu ở thời điểm kiểm tra. Kích thước ảnh khớp; tỷ lệ pixel khác nhau tối đa **0,007%** với ngưỡng sai khác kênh màu trên 15/255. Đây là kiểm tra mẫu đại diện, không khẳng định mọi trạng thái đều giống tuyệt đối.

`js/store.js` giữ nguyên SHA-256 so với bản trước khi sửa. Các bài kiểm thử cũ được cập nhật cho dữ liệu mẫu hiện tại, tên nút menu và bảng màu đang dùng; không thay đổi quy tắc nghiệp vụ để làm test đạt.

Bằng chứng: [tổng hợp đợt sửa](../tests/artifacts/refactor-results.json), [so sánh ảnh](../tests/artifacts/refactor-visual-results.json), [tích hợp](../tests/artifacts/integration-results.json), [trường hợp biên](../tests/artifacts/edge-results.json), [hồi quy](../tests/artifacts/usability-results.json), [theme](../tests/artifacts/theme-results.json). Hướng dẫn chỉnh sửa: [cấu trúc frontend](frontend-structure.md).

Giới hạn: kiểm tra trên Chrome/Chromium mô phỏng kích thước màn hình; chưa kiểm tra thiết bị iOS/Android thật. Website vẫn dùng localStorage và các dịch vụ mô phỏng của bản cũ.

## Chỉnh giao diện tiếp theo — 13/10/2026

- Căn lại thẻ sân; lịch chọn ngày tiếng Việt dùng cùng màu sáng/tối, hỗ trợ chuyển tháng, bàn phím, Escape và chặn ngày quá khứ.
- Nhóm Tài khoản có nền cho trang hiện tại; menu ảnh đại diện dùng biểu tượng ba gạch và các dòng thao tác thống nhất.
- Icon SVG cho Facebook, Instagram, TikTok, YouTube, Zalo; chỉ hiện liên kết hợp lệ đã lưu trong hồ sơ.
- Bảng quản lý sân có ảnh/tên/địa chỉ rõ hơn và nhóm nút tách khoảng; mobile vẫn hiển thị dạng thẻ.
- `interface-polish.cjs`: **88 xác nhận đạt**, kiểm tra sáng/tối tại 1440/390/320px, chọn ngày, liên kết mạng xã hội và mở lịch sân. Đã xem ảnh desktop/mobile.
- Chạy lại `smoke.cjs`: **84 lượt đạt**; `usability-regression.cjs`: **145 xác nhận đạt**; `integration.cjs`: **38 xác nhận đạt**; `community.cjs`: đạt. Không ghi nhận lỗi JavaScript trong các lượt này.

Bằng chứng: [kết quả giao diện](../tests/artifacts/interface-polish-results.json), [bảng sân tối](../tests/artifacts/polish-venue-dark-1440.png), [hồ sơ tối](../tests/artifacts/polish-profile-dark.png), [lịch sáng](../tests/artifacts/polish-calendar-light-1440.png).

## Kiểm tra bản sửa ngày 13/10/2026

Môi trường: Windows, Google Chrome headless qua Playwright, hồ sơ và dữ liệu thử riêng, HTTP localhost. Không sửa dữ liệu trình duyệt đang dùng, Git hay GitHub.

| Bộ kiểm tra | Kết quả |
|---|---|
| `smoke.cjs` | 42 trang × desktop/mobile = 84 lượt; không lỗi JavaScript hoặc tràn ngang |
| `usability-regression.cjs` | 145 xác nhận: dữ liệu cũ, đặt/duyệt sân, ảnh sân, xoá sân/báo cáo/sự kiện, roster trống, menu tài khoản, mobile 320/390/760px |
| `integration.cjs` | 38 xác nhận: auth, booking, trận đấu, AI mô phỏng, phân quyền, CSV, hồ sơ |
| `edge-cases.cjs` | 35 xác nhận: lịch trùng, dữ liệu sai, thiếu người chia đội, OTP, localStorage hỏng |
| `theme.cjs` | 168 lượt kiểm tra trang/giao diện; lưu lựa chọn, bàn phím và đồng bộ theme giữa tab đều đạt |
| `community.cjs` | Đánh giá/báo cáo, quyền đánh giá, riêng tư, lịch sân, lọc doanh thu, nhóm tài khoản và menu mobile đều đạt |
| `mobile-activities.cjs` | Thông báo thành công, lọc hoạt động, bảng dạng thẻ và lịch theo ngày ở 320/390/760px đạt |
| `restore-four-roles.cjs` | Khôi phục dữ liệu CLB, tài khoản mẫu, giữ dữ liệu và trạng thái khoá thủ công đạt |

Đã xem ảnh đặt sân desktop/mobile và hộp thoại tối. Kiểm thử doanh thu dùng khoảng ngày thực tế thay vì mặc định mọi lịch mẫu đều thuộc tháng hiện tại. Các bài kiểm thử cũ được cập nhật cho luồng chọn giờ → nút đặt sân, thêm thành viên rõ ràng và trạng thái nút bị vô hiệu hoá.

Bằng chứng: [kết quả hồi quy](../tests/artifacts/usability-results.json), [smoke](../tests/artifacts/smoke-results.json), [tích hợp](../tests/artifacts/integration-results.json), [trường hợp biên](../tests/artifacts/edge-results.json), [theme](../tests/artifacts/theme-results.json). Ảnh: [đặt sân desktop](../tests/artifacts/booking-desktop-updated.png), [mobile 390px](../tests/artifacts/booking-mobile-390-updated.png).

Giới hạn: xác nhận trên Chromium và dữ liệu thử; chưa kiểm tra thiết bị iOS/Android thật. Đây vẫn là demo localStorage, không có backend hay đồng bộ giữa các máy.

---

Phần dưới là lịch sử kiểm thử ngày 22/09/2026, khi bản demo có 40 trang.

Ngày: 22/09/2026. Môi trường kiểm tra: Windows, trình duyệt Thorium (Chromium) headless qua Playwright, hồ sơ thử riêng. Website phục vụ bằng HTTP localhost, không dựa vào kết nối dịch vụ ngoài.

## Kết quả lịch sử — phiên bản ngày 22/09/2026

| Nhóm | Kết quả |
|---|---|
| Cú pháp | 7 module JavaScript qua `node --check` |
| Trang / responsive | 40 trang × desktop 1440px và mobile 390px = 80 lượt; không có runtime error hoặc tràn ngang toàn trang |
| Tích hợp | 38 xác nhận thành công; kiểm thử lại sau khi bổ sung ràng buộc dữ liệu |
| Trường hợp biên | 35 xác nhận thành công, gồm mobile và một màn hình tablet 768px |
| Visual QA | Đã xem ảnh trang chủ, auth, quản lý, AI; dùng cùng palette/ảnh/bố cục cơ sở Figma |

## Các luồng đã kiểm tra
- Đăng ký, sai xác nhận mật khẩu, chặn tài khoản chưa xác minh, OTP sai/đúng/hết hạn, gửi lại, khôi phục không được bỏ qua OTP.
- Người chơi đặt → chủ sân duyệt → người chơi tạo trận → người khác tham gia/rút → hủy booking giải phóng slot và hủy trận liên quan.
- Giới hạn chỗ, duplicate booking, trùng slot, giờ kết thúc không hợp lệ, booking tương lai không được hoàn thành.
- Hoàn thành booking đã hết giờ chuyển trận liên quan sang completed.
- C/R/U/lưu trữ sân/slot; tạo sự kiện/người chơi; cập nhật roster làm vô hiệu lineup.
- Skill Match: chọn/lưu, lỗi mô phỏng, không có kết quả; Team Balancer: lưu, chỉnh, lineup trùng, thiếu người, lỗi và thủ công; No-show Risk: ghi đè nhận định, thiếu lịch sử, lỗi/thử lại.
- Sai role hiển thị 403; admin không tự khóa; email trùng; môn đang có ràng buộc không lưu trữ; tạo/kích hoạt/vô hiệu tài khoản và player tương ứng.
- Tạo/sửa/lưu trữ báo cáo, snapshot, doanh thu chỉ từ booking completed, download CSV.
- Tin nhắn hiển thị cho người nhận; thông báo đã đọc; hồ sơ và trình độ lưu lại sau reload.
- Chuỗi HTML trong tên được hiển thị dưới dạng text, không tạo phần tử executable.
- localStorage hỏng có cảnh báo và không ghi đè ngầm; khôi phục có xác nhận.

## Bằng chứng và chạy lại

`tests/artifacts/smoke-results.json`, `integration-results.json`, `edge-results.json` chứa kết quả. Các ảnh PNG trong cùng thư mục ghi lại giao diện. Xem README để chạy script.

Các test là minh chứng kỹ thuật của bản sinh mã, không thay video OBS hoặc PR/review của sinh viên.

## Giới hạn kiểm chứng

Chưa chạy trên điện thoại vật lý, Safari/iOS hoặc Firefox; không khẳng định tương thích mọi trình duyệt. Chưa có load test, backend, email/Google OAuth/LLM thật. Bảng rộng cuộn ngang bên trong vùng bảng trên mobile; toàn trang không tràn ngang. Chưa phải bài kiểm tra WCAG đầy đủ.

## Kiểm tra sáng/tối của phiên bản 40 trang (lịch sử)

- `tests/theme.cjs`: 40 trang × 2 chế độ × 2 chiều rộng (1440px, 390px) = 160 lượt, không tràn ngang toàn trang hoặc lỗi runtime.
- Xác nhận nút ở cả trang công khai, trang role và auth; chuyển bằng chuột/bàn phím; giữ focus; ghi nhớ khi tải lại/chuyển trang; đồng bộ giữa tab.
- Kiểm tra nền hộp thoại, giữ màu xanh nút chính/chữ trắng, bỏ dòng thừa của banner AI và tăng chữ FAQ.
- Đã xem ảnh desktop/mobile của trang hỗ trợ, Skill Match và đăng nhập trong cả hai chế độ.
- Chữ phụ trước đây 10–13px được tăng lên 13–14px; FAQ 15px.
- Kết quả chi tiết: `tests/artifacts/theme-results.json`.


## Bản ngày 12/10/2026 và kiểm tra khi đó

Danh mục hiện tại có 42 trang chức năng và 2 URL chuyển hướng. Các kết quả lịch sử cập nhật cộng đồng nằm trong [community-update.md](community-update.md); chúng không phải kết quả chạy mới ngày 12/10/2026. Các trang hoạt động/đặt sân dùng thẻ trên mobile, lịch sân dùng danh sách theo ngày. Chat đã gỡ, URL cũ chỉ chuyển hướng.

Ngày 12/10/2026: chạy `node tests/restore-four-roles.cjs` đạt các trường hợp dữ liệu mới, khôi phục organizer/sự kiện từ bản 28 trang, đăng nhập/phân quyền, giữ booking, không nhân đôi khi tải lại và giữ tài khoản khóa thủ công. `node --check js/store.js` đạt.

Lượt kiểm tra nút đăng nhập nhanh CLB trên trình duyệt chưa thực hiện được do thiếu executable Playwright. Không ghi nhận kết quả trình duyệt thành công cho sửa lỗi này. Nhóm cần chạy lại smoke, integration, edge, community, theme và mobile activities trên bản hiện tại theo [README](../README.md).
