
### requirements
- đăng nhập trước

### quy tắc generate 
Confidence nằm trong khoảng 0-100
deviceId phải chọn trong số các vdsDevice có sẵn


### tính năng 
- chọn số lượng record cần seed 
- bật tắt field nào cần fake
- nếu không muốn 1 field nào đó fake, có thể nhập manual, apply cho toàn bộ data sẽ seed
- nếu muốn chi tiết hơn nữa, có thể generate preview và sửa manual từng field của mỗi record 

- thêm tính năng đo thời gian 

### problems
- mỗi khi import pkceAuthService là lại tạo 1 instance mới, cần chuyển sang singleton
- setting cho app nói chung chứ không riêng gì chỉ PKCE
  hoặc có thể thêm tính năng cho setting, không gộp tất cả các setting vào làm 1 nơi nữa,
  sẽ có 2 option trước khi cấu hình chi tiết
    cấu hình cho backend server
    cấu hình cho auth server 



- từng batch
- tuần tự (đạt ngưỡng số lượng thì mới insert db) 
  + đat ngưỡng thời gian 
  + hoặc số lượng record 


- check ram tiêu tốn ớ khoảng 100_000 record 

### requested by sếp

nhận imagedang base64 trong VdseentDTO 
lấy hình ddaayyr qua seerrice imageResource, lưu image 
2 thg giao tiếp vơi nhau 

- sửa DTO nhận vào Base64Image thay vì imagePath
- VdsModule gọi ResourceModule, ResourceModule nhận base64Image -> convert thành hình -> lưu vào ổ cứng 

- convert basse64 thành hình
- nhận diện chủ đề của DTO (traffic, vehicle, ...)
- thêm watermark (với thông tin chi tiết đúng với chủ đề, thời gian, object, biển số,  loại sự kiện, ...)
- giao tiếp với image resource

-> seeding tool phải tựu tạo ảnh ảo 
-> nếu ảnh năng quá thì test tuần tự thôi 
-> giả lập thông tin thời gian trên watermark trên ảnh ảo của seeding 



### pending improvement

- màn hình chính hiện tại đang chỉ cho phép seed resource VDSEventData
  tôi cần màn hình chính hiện 1 list các danh sách các resource cần seed 
  có nút home để back về màn hình chính và có thể chọn resource nào để seed 
  trước tiên chỉ có 1 resource là VDSEventData
- phải đăng nhập trước mới vào được màn chọn resource cần seed
- thêm đo lường tốc độ execute seed api 

thêm vaopf dictinoary
đếm timeout
đến sl item trong dictionary
thỏa mãn thì insert database 


### prompts
```
màn hình chính hiện tại đang chỉ cho phép seed cho 1 resource VDSEventData
  tôi cần màn hình chính hiện 1 list các danh sách các resource cần seed 
  khi cần có thể chọn resource nào để seed và có nút home để back về màn hình chính 
  trước tiên hãy chỉ là với 1 resource là VDSEventData 
```











