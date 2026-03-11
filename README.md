# F8 Chat App - Frontend

Đây là phần Frontend của dự án Chat App, được xây dựng bằng React và Vite.

## Tính năng chính
- Đăng ký, Đăng nhập và Xác thực Email thông qua luồng bảo mật.
- Tìm kiếm bạn bè và xem danh sách các cuộc hội thoại.
- Nhắn tin theo thời gian thực (Real-time Real-time Messaging) bằng PusherJS và máy chủ Soketi nội bộ.
- Giao diện người dùng hiện đại, cuộn vô hạn (Infinite Scroll) các tin nhắn cũ.

## Bắt đầu

1. **Cài đặt các gói thư viện (dependencies):**
   ```bash
   npm install
   ```

2. **Cấu hình biến môi trường:**
   Đảm bảo bạn đã copy file `.env.example` thành `.env` trong thư mục `src`:
   ```bash
   cp src/.env.example src/.env
   ```
   Sau đó điều chỉnh lại cấu hình kết nối API và cổng Socket cho phù hợp.

3. **Khởi động server phát triển:**
   ```bash
   npm run dev
   ```

Ứng dụng sẽ được phục vụ tại `http://localhost:5173`.
