# VDS Seeder Guideline

## Mục lục
1. [Requirements](#requirements)
2. [Hướng dẫn sử dụng](#hướng-dẫn-sử-dụng)
   - [Bước 1: Cấu hình API](#bước-1-cấu-hình-api)
   - [Bước 2: Đăng nhập](#bước-2-đăng-nhập)
   - [Bước 3: Chọn Resource cần Seed](#bước-3-chọn-resource-cần-seed)
   - [Bước 4: Cấu hình chế độ Seed](#bước-4-cấu-hình-chế-độ-seed)
   - [Bước 5: Generate & Preview Data](#bước-5-generate--preview-data)
   - [Bước 6: Seed Data](#bước-6-seed-data)
3. [Các tính năng chính](#các-tính-năng-chính)
4. [Known Issues](#known-issues)
5. [Technical Notes](#technical-notes)

---

## Requirements

- **Auth Server Information**
  - **Root URL**: Dùng để tạo link đăng nhập phía FE
  - **Client ID**: ID của FE app đã đăng ký với auth server
  - **Redirect URL**: Auth server sẽ dùng link đã đăng ký này của FE để gửi exchange code
  - **Scope**: Resource cần cấp phép truy cập (chọn `MonoTemplate`)

- **Backend Server Information**
  - **Root URL**: API của backend cho FE gọi

> **Lưu ý**: Dựa vào thông tin auth server đã cung cấp, phải đăng nhập mới có thể sử dụng.

---

## Hướng dẫn sử dụng

### Bước 1: Cấu hình API

Trước khi bắt đầu, cần cấu hình thông tin Auth Server và Backend API.

#### Cách mở Settings:
- Click vào icon **Settings** (hình bánh răng) ở góc phải header

![Settings Button Location](./images/01-settings-button.svg)

#### Giao diện Settings:
![Settings Modal](./images/02-settings-modal.svg)

#### Các trường cần điền:

| Trường | Mô tả | Ví dụ |
|--------|-------|-------|
| Auth Server URL | URL của auth server | `http://localhost:7001/` |
| Backend API URL | URL của backend API | `http://localhost:7001/` |
| Client ID | ID đã đăng ký với auth | `SeedingTool` |
| Redirect URI | URL callback (tự động điền) | `http://localhost:3000/callback` |
| Scopes | Quyền truy cập | `MonoTemplate` |

#### Kiểm tra kết nối:
- Click **Test Connection** để xác nhận kết nối thành công

![Test Connection Result](./images/03-test-connection.svg)

#### Lưu cấu hình:
- Click **Save Settings** để lưu lại

---

### Bước 2: Đăng nhập

Sau khi cấu hình xong, hệ thống yêu cầu đăng nhập qua Auth Server.

#### Giao diện chưa đăng nhập:
![Login Button](./images/04-login-button.svg)

#### Click nút Login:
- Hệ thống sẽ redirect sang trang đăng nhập của Auth Server
- Sau khi đăng nhập thành công, sẽ quay lại ứng dụng

#### Trạng thái đã đăng nhập:
![Logged In State](./images/05-logged-in.svg)

- Hiển thị thông tin user (username/email)
- Nút Logout để đăng xuất

---

### Bước 3: Chọn Resource cần Seed

#### Trang chủ - Danh sách Resources:
![Resource List](./images/06-resource-list.svg)

#### Các Resource hiện có:
| Resource | Mô tả |
|----------|-------|
| VDS Event | Video Detection System Event Data |

#### Cách chọn:
- Click vào card của resource cần seed
- Hệ thống sẽ chuyển sang trang seed tương ứng

---

### Bước 4: Cấu hình chế độ Seed

#### 4.1 Chọn Seed Mode (Request Mode)

![Seed Mode Selection](./images/07-seed-mode.svg)

| Mode | Mô tả |
|------|-------|
| **Batch** | Gửi tất cả records trong 1 request |
| **Sequential** | Gửi từng record một (/sequence endpoint) |
| **Concurrent** | Gửi nhiều requests đồng thời (/sequence endpoint) |

#### 4.2 Cấu hình số lượng Record

**Batch Mode:**
![Batch Count Config](./images/08-batch-config.svg)

**Concurrent Mode:**
![Concurrent Config](./images/09-concurrent-config.svg)

#### 4.3 Cấu hình Field Generation Mode

Mỗi field có 3 chế độ:

![Field Mode Selection](./images/10-field-mode-selection.svg)

| Mode | Màu | Mô tả |
|------|-----|--------|
| **Auto** | Xanh dương | Fake random cho mỗi record |
| **Fixed** | Xanh lá | Giá trị cố định (nhập manual) |
| **NULL** | Xám | Để NULL cho tất cả records |

#### Ví dụ cấu hình Field:

![Field Config Example](./images/11-field-config-example.svg)

- **Event Type**: Auto (random)
- **Source Type**: Fixed = `1` (Camera)
- **Image Path**: NULL (không bắt buộc)

---

### Bước 5: Generate & Preview Data

#### 5.1 Generate Preview

Click **Generate Preview** để xem trước data trước khi seed.

![Generate Preview Button](./images/12-generate-preview-btn.svg)

#### 5.2 Xem & Chỉnh sửa Preview

![Preview Table](./images/13-preview-table.svg)

#### Tính năng Preview:
- Hiển thị tất cả records dưới dạng bảng
- Click vào ô để chỉnh sửa giá trị (chỉ fields ở chế độ Auto mới sửa được)
- Fields ở chế độ Fixed/NULL hiển thị disabled

![Edit Cell](./images/14-edit-cell.svg)

#### 5.3 Xóa Preview

Click **Clear** để xóa preview và quay lại chế độ cấu hình.

---

### Bước 6: Seed Data

#### 6.1 Chuẩn bị Seed

Tùy trạng thái, nút Seed sẽ hiển thị khác nhau:

| Trạng thái | Text hiển thị |
|------------|---------------|
| Chưa cấu hình API | "Configure API in Settings" |
| Chưa đăng nhập | "Login to Seed Data" |
| Đã đăng nhập | "Seed X Records (Batch/Sequential/Concurrent)" |

#### Nút Seed (đã đăng nhập):
![Seed Button Ready](./images/15-seed-button-ready.svg)

#### 6.2 Quá trình Seed

![Seeding Progress](./images/16-seeding-progress.svg)

- Hiển thị progress: `Seeding X/Y...`
- Progress bar cho thấy tiến độ

#### 6.3 Kết quả

**Thành công:**
![Success Result](./images/17-result-success.svg)

**Thất bại:**
![Error Result](./images/18-result-error.svg)

Thông báo sẽ tự động biến mất sau 3 giây.

---

## Các tính năng chính

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

---

## Known Issues

- [ ] Đối với các field ID reference đến bảng khác, thì sẽ random đến các ID có sẵn (chưa hoàn thiện)
- [ ] UX đăng nhập đang rất phèn
- [ ] Navigation đến các resource cần seed đang chưa có, cứ phải back ra homepage rồi vào lại rất chuối

## Technical Notes

- Mỗi khi import `pkceAuthService` là lại tạo 1 instance mới, cần chuyển sang singleton toàn app.
- cần có cách để phân biệt record nào trong database do seed mà có
  + ví dụ trong VDSEventData, có thể thêm đuôi "%-SEEDED" vào lanecode
