# Rà soát và dọn mã nguồn

## Đợt 24/10/2026 — nhánh `refactor/remove-unused-code`

Rà trực tiếp mã hiện hành trong `Repository/web_demo_source_code`: 43 HTML (41 trang chức năng và 2 URL tương thích), JavaScript, CSS, tài nguyên, kiểm thử và tài liệu liên quan. Bản đối chiếu và ảnh/log thử nghiệm nằm ngoài repo; không dùng storage của trình duyệt cá nhân.

- Thu gọn `chat.html` và `venue-slot-management.html` về nội dung chuyển hướng dự phòng, từ 517 dòng xuống 38 dòng tổng cộng. Bỏ header/sidebar, template và tài nguyên giao diện không được dùng ở hai URL này. `redirect.js` dùng chung kiểm tra đăng nhập/role; không xoá URL cũ hoặc dữ liệu người dùng.
- Giữ quản lý khung giờ trong **Quản lý sân → Xem lịch sân**. Khách truy cập URL cũ vẫn qua đăng nhập, ghi nhớ URL cần quay lại; sai role vẫn bị từ chối.
- Thay bảng menu JS cũ chứa nhãn/icon không còn được render bằng bốn URL trang chính của role. Menu hiển thị vẫn do HTML quản lý.
- Bỏ hàm tạo textarea không được gọi, 10 tên icon động không dùng và 8 tên công khai không có nơi gọi. Giữ các hàm nội bộ đang xử lý nghiệp vụ và các API được bộ kiểm thử sử dụng.
- Bỏ 3 rule CSS không có nơi dùng; giữ biến màu tím vì lịch sân vẫn dùng cho đơn hoàn thành. Bỏ 4 lượt nạp CSS role không có thành phần tương ứng.
- Bỏ 56 chú thích HTML mô tả hộp thoại/lịch đã không còn ở phía dưới. Giữ template lỗi, form xác nhận, popup và lịch đang được gọi trực tiếp hoặc gián tiếp.
- Cập nhật manifest phụ thuộc, hướng dẫn cấu trúc, icon và task khung giờ; không tự đánh dấu tiến độ của thành viên.
- Bỏ `tests/verify-user-reqs.cjs` cũ: script ghi ảnh vào thư mục IDE cá nhân và còn đòi bấm nút desktop đã được gỡ. Kiểm tra menu trang chủ được giữ trong `bootstrap-icons.cjs`; kiểm tra menu workspace/mobile nằm trong các bộ hiện hành.

Rà tĩnh đối chiếu khai báo/phạm vi JS, tên hàm công khai và nơi gọi, binding HTML–JS, template/popup, selector/biến CSS, phụ thuộc và tài nguyên cục bộ. Các tham số `_` giữ vị trí đối số, CSS trạng thái/mobile và mã nâng cấp localStorage cũ được giữ vì vẫn có tác dụng. Không xoá code chỉ vì nó không xuất hiện ở trạng thái giao diện đầu tiên.

Kết quả xác minh 24/10:

- **17 bộ kiểm tra đạt**: structure, smoke, static-html, integration, edge-cases, community, date-picker, usability-regression, interface-polish, mobile-activities, restore-four-roles, theme, retired-court, match-sport, bootstrap-icons và redirects. Nguồn đem thử khớp từng byte với HTML/JS/CSS, test hiện hành, package và manifest trong repo.
- Smoke: 82 lượt trang desktop/mobile; icon và theme: 164 lượt mỗi bộ; không lỗi runtime/tràn ngang trong các lượt này. Redirects: 20 trường hợp trên desktop/mobile cộng luồng đăng nhập rồi mở lịch sân, giữ dữ liệu và quyền.
- **188 cặp ảnh trước/sau khớp pixel**: 41 trang × 2 chiều rộng × 2 theme, 16 popup và 8 menu mobile. Hai cặp khác ở vùng ảnh sân trong lượt đầu đã được chụp lại; cặp cuối khớp. Nội dung hiển thị và dữ liệu khởi tạo cũng khớp.
- Kiểm tra 1.325 tham chiếu tài nguyên/liên kết cục bộ trong HTML, ID trùng, binding, template, biến/selector CSS và cú pháp JS. Không phát hiện tham chiếu cục bộ hỏng, ID trùng hay binding thiếu trong phạm vi rà.
- Bản đầu vào là `main` local tại `b0ab8d6`, chậm hơn GitHub. Đối chiếu GitHub sau đó xác nhận PR #7 đã merge commit `af746f9` vào `main` remote tại `59b93f9`; local và nhánh dọn còn thiếu 2 commit. Các kết quả trên kiểm chứng bản đầu vào local cùng phần dọn, chưa kiểm chứng bản kết hợp với main mới. Cần đồng bộ và chạy lại các kiểm tra liên quan trước khi chốt PR. Bài thử bổ sung tài khoản `p2@demo.vn` dừng ở đăng nhập vì bản đầu vào cũ chưa có tài khoản này, không được tính là kiểm tra đạt.

Không stage/commit/push hay đổi nhánh. Không kiểm thử trên thiết bị thật, Firefox hoặc Safari; kết quả xác nhận các tình huống Chrome và kiểm tra tĩnh đã nêu, không phải bảo đảm mọi trạng thái có thể xảy ra. Các số liệu đợt 22/10 phía dưới là lịch sử, không phải số lượng file hiện hành.

## Đợt 22/10/2026 (lịch sử)

> Cập nhật phạm vi 23/10/2026: trang phân tích vắng mặt của chủ sân đã gỡ. Hiện có 41 trang chức năng, 2 URL tương thích; AI còn Skill Match và Team Balancer. Các số liệu bên dưới ghi nhận đợt kiểm tra trước khi gỡ. Xem [phạm vi hiện hành](screen-list.md).

## Phạm vi và bản gốc đối chiếu

Thực hiện trực tiếp trong `Repository/web_demo_source_code`, nhánh hiện tại `refactor/role-structure`. Rà 44 HTML, 13 file JavaScript và 9 stylesheet CSS; kiểm tra liên kết tài nguyên, template, binding, phụ thuộc và tài liệu hướng dẫn sửa code. Không chỉnh thư viện trong `node_modules`, bản thiết kế hoặc tài liệu yêu cầu gốc của thầy.

Bản sao trước khi dọn nằm ngoài repo: `D:\Tien\Workspace\Agents Projects\Codex\Bài tập lớn\repository_before_cleanup_20261022` (không kèm `node_modules`/`.git`). Không stage, commit, push hay đổi nhánh.

## Thay đổi

| Phần | Kết quả |
|---|---|
| Template không được gọi trên trang | Bỏ 207 bản sao, gồm lịch, xác nhận/đăng nhập không được dùng, Google trên trang không có nút Google, template lỗi không được gọi trên trang xác thực |
| Dialog rỗng | Bỏ 27 dialog ở trang không có thao tác mở popup |
| Tài nguyên trang | Bỏ 149 lượt nạp JS thừa và 36 lượt nạp CSS lịch thừa |
| Lịch ngày | Giữ JS/CSS và hai template trên đúng 8 trang có input ngày, tính cả form trong popup; lịch chọn khung giờ ở chi tiết sân vẫn giữ riêng |
| CSS | Bỏ 28 selector không được tham chiếu và 9 khai báo biến không dùng; đổi tên màu biểu đồ từ `--chat-bg` thành `--chart-track` |
| JS | Bỏ 16 biến lấy từ UI không dùng, biến `brand` và tham số callback thừa; bỏ các nhánh chuyển kiểu/nhãn thao tác của role khác |
| Màn hình cũ | Bỏ `Venue.slots()`, form/controller khung giờ cũ không còn được định tuyến; URL cũ vẫn qua kiểm tra đăng nhập/role và chuyển về quản lý sân |
| Dữ liệu cộng đồng | Chuyển nguyên logic nâng cấp một lần từ `community.js` sang `store.js`, để không cần nạp cả chức năng cộng đồng trên mọi trang |
| Gọi chức năng | Player gọi phần đánh giá trực tiếp, không còn bị `community.js` ghi đè hàm sau khi nạp |
| Khả năng đọc | Định dạng HTML/JS/CSS theo cấu hình có sẵn; mỗi SVG trang trí giữ một dòng; form và bố cục được thụt dòng riêng |
| Tài liệu/kiểm thử | Thêm [danh sách phụ thuộc từng trang](page-dependencies.json), cập nhật kiểm tra cấu trúc, README và bản đồ code |

`auth.js` chỉ nạp ở 10 trang xác thực; `ai.js` chỉ nạp ở Skill Match, Team Balancer và No-show Risk. Các trang chỉ nạp controller role hoặc `community.js` khi cần. Các tiện ích và hàm nghiệp vụ được nhiều trang dùng vẫn đặt chung, không sao chép thành nhiều bản.

Giữ phần khôi phục dữ liệu phiên bản cũ trong store để không làm mất tài khoản/sự kiện/dữ liệu đã lưu. Các tham số `_` trong callback nhận index hoặc capture phía sau là chỗ giữ vị trí đối số, không phải biến nghiệp vụ bỏ quên. Dữ liệu chat cũ có thể vẫn nằm trong localStorage; không xoá dữ liệu người dùng như một phần của dọn giao diện.

## Xác nhận

Chạy bằng Chrome headless, storage và hồ sơ thử nghiệm riêng; không dùng dữ liệu trình duyệt cá nhân.

| Bộ kiểm tra | Kết quả |
|---|---|
| structure | Đạt: 44 trang, đường dẫn, script/CSS/popup đúng khai báo; lịch chỉ ở trang có input ngày |
| smoke | Đạt: 84 lượt trang desktop/mobile, không tràn ngang hoặc lỗi runtime |
| static-html | Đạt: 44 HTML, 9 CSS, bố cục khi tắt JS, sửa tiêu đề HTML, lọc và escape dữ liệu |
| integration | Đạt: 40 xác nhận |
| edge-cases | Đạt: 37 xác nhận, gồm dữ liệu hỏng/quota/quyền/khôi phục |
| community | Đạt: đánh giá, báo cáo, quyền, riêng tư, lịch sân và doanh thu |
| date-picker | Đạt: 83 xác nhận, gồm lịch trong popup và thao tác bàn phím |
| usability-regression | Đạt: 145 xác nhận |
| interface-polish | Đạt: 88 xác nhận |
| mobile-activities | Đạt: hoạt động/bộ lọc/lịch tại 320/390/760 px |
| restore-four-roles | Đạt: khôi phục bản cũ, giữ dữ liệu và khoá thủ công, không nhân đôi |
| theme | Đạt: 168 lượt trang, lưu lựa chọn, bàn phím, đồng bộ tab và dialog |

Đối chiếu **98 cặp ảnh**: toàn bộ 42 trang chức năng ở desktop tối và mobile sáng, cùng 7 popup ở desktop sáng và mobile tối. Các cặp cuối khớp pixel sau khi chờ trình duyệt hoàn tất vẽ ảnh; dữ liệu khởi tạo và tiêu đề khớp, không phát hiện lỗi JS hoặc trang lỗi. Hai URL tương thích được kiểm tra qua định tuyến; không so giao diện CRUD cũ vốn không được mở.

Rà tĩnh không phát hiện text rơi trong `<head>`, ID trùng trong nguồn HTML, đường dẫn tài nguyên cục bộ hỏng, binding JS không có nơi dùng hoặc view được gọi mà không có mẫu HTML. Rà selector/biến CSS trên cả HTML lẫn mã tạo DOM; các trạng thái như hover, disabled, dữ liệu rỗng và popup được giữ và kiểm tra trong các bộ test trên.

Ảnh/log do các bộ kiểm thử ghi vào `tests/artifacts` đã được khôi phục về trạng thái trước khi chạy, để không đưa ảnh và thời gian phát sinh vào thay đổi mã nguồn. Minh chứng chạy và ảnh đối chiếu mới được giữ ngoài repo tại workspace Codex.

Đây là bản localStorage hiện tại. Không tích hợp JSON Server, không thay đổi thiết kế giao diện hoặc bổ sung tính năng trong đợt dọn này. Phạm vi xác nhận là các kiểm tra và trạng thái nêu trên.
