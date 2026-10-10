# Trạng thái nghiệp vụ

| Đối tượng | Trạng thái / chuyển tiếp | Điều kiện |
|---|---|---|
| Xác thực | chưa xác thực → xác thực | mã đúng loại, đúng số, chưa quá 5 phút |
| Chủ sân | pending → approved/rejected; rejected → hồ sơ pending mới | admin xét hồ sơ đã xác thực |
| Thay đổi sân | pending → approved/rejected | từ chối cần lý do; chặn xóa khi còn đơn |
| Đơn đặt | pending → approved/rejected/cancelled; approved → completed/cancelled | đúng chủ sân/người đặt; hoàn thành sau giờ kết thúc |
| Yêu cầu vào trận | pending → approved/rejected | đúng chủ trận; kiểm tra lại chỗ, lịch, tài khoản và trạng thái trận |
| Trận | open → completed/cancelled | hoàn thành theo đơn; chủ trận được hủy |
| Báo cáo | pending → warned/banned/dismissed | admin nhập quyết định và lý do |
| Thông báo gửi nhóm | sent → recalled | admin; thu hồi khỏi hộp người nhận |

Lịch sử bị từ chối/hủy không bị xóa. Đánh giá sân upsert theo tác giả và lượt đặt đã hoàn thành. Không đánh giá trận chưa kết thúc, không có tính năng đánh giá sao đối thủ trong phạm vi mới. Báo cáo không tự động dẫn tới vi phạm hay khóa tài khoản.
