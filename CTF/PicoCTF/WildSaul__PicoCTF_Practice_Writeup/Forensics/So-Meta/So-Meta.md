# So Meta
##### Tags: `picoCTF 2019` `Forensics`
### DESCRIPTION
Find the flag in this [picture](https://jupiter.challenges.picoctf.org/static/00efdf2961da1e21470ffc0d496c3cc2/pico_img.png).
##### Đầu tiên, đối với những file tải về, ta nên kiểm tra với lệnh `file`: 
```
$ file Downloads/pico_img.png 
Downloads/pico_img.png: PNG image data, 600 x 600, 8-bit/color RGB, non-interlaced
```
##### Có vẻ đây chỉ là file ảnh bình thường. Và để đọc được nó, ta có thể dùng chương trình `exiftool`
###### Exiftool là một chương trình dòng lệnh dùng để đọc, viết và chỉnh sửa `metadata` - siêu dữ liệu hay data trong data. Hỗ trợ nhiều định dạng file, chủ yếu là ảnh, âm thanh và video. Thường được sử dụng bởi các nhiếp ảnh gia hoặc chuyên gia forensics nhằm sắp xếp phân loại file, kiểm tra tính xác thực của ảnh hoặc điều tra tội phạm số.
```
$ exiftool Downloads/pico_img.png 
ExifTool Version Number         : 12.65
File Name                       : pico_img.png
Directory                       : Downloads
File Size                       : 109 kB
File Modification Date/Time     : 2024:03:01 10:44:28+07:00
File Access Date/Time           : 2024:03:01 10:44:28+07:00
File Inode Change Date/Time     : 2024:03:01 10:44:28+07:00
File Permissions                : -rw-r--r--
File Type                       : PNG
File Type Extension             : png
MIME Type                       : image/png
Image Width                     : 600
Image Height                    : 600
Bit Depth                       : 8
Color Type                      : RGB
Compression                     : Deflate/Inflate
Filter                          : Adaptive
Interlace                       : Noninterlaced
Software                        : Adobe ImageReady
XMP Toolkit                     : Adobe XMP Core 5.3-c011 66.145661, 2012/02/06-14:56:27
Creator Tool                    : Adobe Photoshop CS6 (Windows)
Instance ID                     : xmp.iid:A5566E73B2B811E8BC7F9A4303DF1F9B
Document ID                     : xmp.did:A5566E74B2B811E8BC7F9A4303DF1F9B
Derived From Instance ID        : xmp.iid:A5566E71B2B811E8BC7F9A4303DF1F9B
Derived From Document ID        : xmp.did:A5566E72B2B811E8BC7F9A4303DF1F9B
Warning                         : [minor] Text/EXIF chunk(s) found after PNG IDAT (may be ignored by some readers)
Artist                          : picoCTF{s0_m3ta_fec06741}
Image Size                      : 600x600
Megapixels                      : 0.360
```
##### Thây trong phần Artist có flag.
##### => Lấy flag thành công!
