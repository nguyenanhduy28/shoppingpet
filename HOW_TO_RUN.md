# Hướng dẫn chạy dự án Pet Shop

Dự án được thiết kế theo mô hình Client-Server tách biệt. Bạn cần mở **2 cửa sổ Terminal riêng biệt** để chạy đồng thời cả Backend và Frontend.

---

### **Cửa sổ Terminal 1: Backend (Node.js API)**
Cửa sổ này dùng để chạy server xử lý logic và kết nối Database.
1. Di chuyển vào thư mục backend:
   ```bash
   cd backend
   ```
2. Chạy server ở chế độ phát triển (tự động cập nhật khi sửa code):
   ```bash
   npm run dev
   ```
   *Server sẽ chạy tại: `http://localhost:5000`*

---

### **Cửa sổ Terminal 2: Frontend (Giao diện người dùng)**
Cửa sổ này dùng để chạy giao diện web.
1. Di chuyển vào thư mục frontend:
   ```bash
   cd frontend
   ```
2. Khởi động giao diện:
   ```bash
   npm start
   ```
   *Giao diện sẽ tự động mở tại: `http://127.0.0.1:5500`*

---

### **Lưu ý quan trọng:**
- Đảm bảo SQL Server của bạn đang hoạt động trước khi chạy Backend.
- Nếu bạn cài đặt thư viện mới, hãy chạy `npm install` trong thư mục tương ứng.
