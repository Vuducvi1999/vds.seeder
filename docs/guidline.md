# VDS Seeder Guideline

## Requirements

- **Auth Server Information**
  - **Root URL**: Dùng để tạo link đăng nhập phía FE
  - **Client ID**: ID của FE app đã đăng ký với auth server
  - **Redirect URL**: Auth server sẽ dùng link đã đăng ký này của FE để gửi exchange code
  - **Scope**: Resource cần cấp phép truy cập (chọn `MonoTemplate`)

- **Backend Server Information**
  - **Root URL**: API của backend cho FE gọi

> **Lưu ý**: Dựa vào thông tin auth server đã cung cấp, phải đăng nhập mới có thể sử dụng.

## Tính Năng

### 1. Chọn Mode Fake Data

| Mode | Mô tả |
|------|-------|
| **Auto** | Fake random cho mỗi record khi seed. Đối với các field ID reference đến bảng khác, sẽ random đến các ID có sẵn |
| **Fixed** | Nếu không muốn 1 field nào đó fake, có thể nhập manual, apply cho toàn bộ data sẽ seed |
| **NULL** | Field NULL cho tất cả record khi seed. **Lưu ý**: Required field không thể chọn NULL |

### 2. Generate Preview

Nếu muốn chi tiết hơn, có thể generate preview và sửa manual từng field của mỗi record.

### 3. Chọn Mode Request

| Mode | Mô tả |
|------|-------|
| **Batch** | Gửi số lượng lớn record |
| **Sequential** | Seed 1 record. Backend sẽ dùng cấu trúc dữ liệu dạng queue để buffer data lại, sau đó insert vào database khi đủ số lượng hoặc hết thời gian chờ |
| **Concurrent** | Giả lập số lượng lớn sequential request gọi đồng thời |

## Known Issues

- [ ] Đối với các field ID reference đến bảng khác, thì sẽ random đến các ID có sẵn (chưa hoàn thiện)
- [ ] UX đăng nhập đang rất phèn
- [ ] Navigation đến các resource cần seed đang chưa có, cứ phải back ra homepage rồi vào lại rất chuối 

## Technical Notes

- Mỗi khi import `pkceAuthService` là lại tạo 1 instance mới, cần chuyển sang singleton toàn app.
- cần có cách để phân biệt record nào trong database do seed mà có
  + ví dụ trong VDSEventData, có thể thêm đuôi "%-SEEDED" vào lanecode
