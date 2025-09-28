## 📊 Phân tích sơ bộ các đối tượng cần tạo bảng

- **Language**: id, name, code  
- **User**: id, name, email, password  
- **UserTranslation**: id, userId, languageId, description, address  
- **RefreshToken**: token, userId  

Để phục vụ cho việc gửi mã OTP 6 số về email khi register hoặc forgot password, cần tạo thêm bảng để lưu mã OTP

- **VerificationCode**: id, email, code, expiresAt  

Để phục vụ phân quyền Role và Permission thì:

- **Role**: id, name, isActive  
- **Permission**: id, name, path, method  

> Quan hệ giữa **Role** và **Permission** là n-n, nên cần tạo bảng trung gian (**RolePermission**).

---

## 📦 Liên quan đến sản phẩm

- **Product**: id, price, categoryId  
- **ProductTranslation**: id, productId, languageId, name, description  
- **Category**: id, parentCategoryId  
- **CategoryTranslation**: id, categoryId, languageId, name  
- **Brand**: id, logo  
- **BrandTranslation**: id, brandId, languageId, name  

> Quan hệ giữa **Product** và **Category** là n-n, nên cần tạo bảng trung gian (**ProductCategory**).  
> **Category** có thể có 1 **Category** cha, nên cần tạo thêm cột `parentCategoryId` trong bảng **Category**.  
👉 Đây gọi là **tự quan hệ 1-1**.

### 🛍️ Hỗ trợ Product Variant

- **Variant**: id, name, productId  
- **VariantOption**: id, value, variantId  
- **SKU**: id, value, price, stock, images, productId  

> Quan hệ giữa **VariantOption** và **SKU** là n-n, nên cần tạo bảng trung gian (**VariantOptionSKU**).

---

## 🛒 Hỗ trợ mua hàng

- **CartItem**: id, userId, skuId, quantity  
- **ProductSKUSnapshot**: (clone sản phẩm sku lúc đó, để phòng sau này sản phẩm bị thay đổi thì không ảnh hưởng đến lịch sử mua hàng)  
  Trường: id, productName, price, images, skuValue, skuId, orderId  
- **Order**: id, userId, status  

---

## ⭐ Hỗ trợ đánh giá sản phẩm

- **Review**: id, userId, productId, rating, content  

---

## 💰 Hỗ trợ thông tin thanh toán chuyển khoản

- **PaymentTransaction** (payload mà cổng thanh toán bắn cho hệ thống khi có giao dịch):  
  Trường: id, gateway, transactionDate, accountNumber, code, body, ...  

---

## 💬 Chức năng nhắn tin

- **Message**: id, fromUserId, toUserId, content, isRead



