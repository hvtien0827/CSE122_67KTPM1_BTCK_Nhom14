# Kiến trúc hiện hành

28 HTML là các điểm vào, cùng tải theme → store → ui → player → community → domain → auth → ai → manage → app. Template JS tái sử dụng giao diện, không có framework.

Dữ liệu `courtconnect.v1` vẫn dùng version cấu trúc 1 để tương thích; `communityVersion` và `scope28` đánh dấu nâng cấp một lần. Giao dịch lưu localStorage có rollback nếu lỗi ghi. Khóa `cc.theme` độc lập dữ liệu. Phiên lưu `cc.session` trong sessionStorage hoặc localStorage; challenge `cc.pending` trong sessionStorage.

Bảng chính: users, players, courts, slots, bookings, matches, joinRequests, ownerApplications, courtChanges, courtReviews, abuseReports, violations, broadcasts, notifications, messages, aiHistory, settings. `legacy` giữ dữ liệu nghiệp vụ đã gỡ. events/reports rỗng giữ tương thích schema cũ, không có route/CRUD CLB.

Quyền trang trong app.js; kiểm tra hành động trong store/domain. Bảo mật chỉ mô phỏng phía client. CSS dùng biến màu cho sáng/tối. Modal dùng dialog; thông tin nổi có hover và nút bấm dùng được với bàn phím/mobile.
