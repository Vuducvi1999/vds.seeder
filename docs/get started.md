
### requirements
- đăng nhập trước

### quy tắc generate 
Confidence nằm trong khoảng 0-100



### tính năng 
- chọn số lượng record cần seed 
- bật tắt field nào cần fake
- nếu không muốn 1 field nào đó fake, có thể nhập manual, apply cho toàn bộ data sẽ seed
- nếu muốn chi tiết hơn nữa, có thể generate preview và sửa manual từng field của mỗi record 

- màn hình chính hiện tại đang chỉ cho phép seed cho 1 resource 
  tôi cần màn hình chính hiện 1 list các danh sách các resource cần seed 
  trước tiên hãy chỉ là với 1 resource là VDSEventData


### problems
- mỗi khi import pkceAuthService là lại tạo 1 instance mới, cần chuyển sang singleton
- setting cho app nói chung chứ không riêng gì chỉ PKCE
  hoặc có thể thêm tính năng cho setting, không gộp tất cả các setting vào làm 1 nơi nữa,
  sẽ có 2 option trước khi cấu hình chi tiết
    cấu hình cho backend server
    cấu hình cho auth server 















