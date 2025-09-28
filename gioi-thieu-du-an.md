# Giới thiệu dự án

Thiết kế 1 website bán hàng tương tự Shopee với các chức năng sau:

- Có 3 vai trò chính: Khách hàng, Người bán (Seller), Admin

- Admin có thể quản lý tất cả các chức năng của website

- Người bán có thể đăng sản phẩm, quản lý sản phẩm, xem lịch sử bán hàng, đánh giá khách hàng

- Khách hàng có thể xem sản phẩm, thêm vào giỏ hàng, mua hàng, xem lịch sử mua hàng, đánh giá sản phẩm

## Một số chức năng đặc biệt

- 🔑 **Authentication**: Sử dụng Access Token & Refresh Token, quản lý được số lượng thiết bị đăng nhập  
- 🔒 **Bảo mật**: Áp dụng xác thực 2 yếu tố (2FA)  
- 🛡️ **Phân quyền**: Dựa trên **Role** và **Permission**  
- 🎨 **Product Variant**: Sản phẩm có nhiều biến thể (size, màu, số lượng, giá, …)  
- 💳 **Thanh toán**: Hỗ trợ thanh toán đơn hàng online bằng **QR Code**  
- 📧 **Thông báo định kỳ**: Gửi mail cho khách hàng khi có sản phẩm mới (**Cron Job**)  



