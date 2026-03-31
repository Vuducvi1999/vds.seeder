
### requested by sếp

---------

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

---------

sửa DTO eventData nhạn vào zoneCode
trong appservice từ zoneCode suy ra NodeId nào

thêm DTO eventData nhận vào SourceReferenceId (con VDS nào phát sự kiện này)

sửa CreationTime chính xác lúc insert vào database
(cần kiểm tra lại lúc bufferService trigger thì CreationTime có chinh xac không)

---------

intergrate mino io để lưu file
sử dụng abp










