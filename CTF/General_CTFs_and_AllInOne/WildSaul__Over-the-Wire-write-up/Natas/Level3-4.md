# Level 3
###### user: *natas3* Pass: *G6ctbMJ5Nb4cbFwhpMPSvxGHhQ7I6W8Q*
##### Inspect trang sẽ thấy phần comment: ‘<!-- No more information leaks!! Not even Google will find it this time... -->’ tìm kiếm trên google thử xem thư mục tên gì sẽ không bị tìm bởi google -> robots.txt
##### Truy cập file trên bằng cách thay đổi URL, thêm `/robots.txt`
![image](https://github.com/WildSaul/Over-the-Wire-write-up/assets/155133173/41052e6f-8082-434c-9430-d41379dd2119)
##### Tham khảo thêm về [robots.txt](https://www.quora.com/How-can-we-make-sure-that-our-websites-folder-is-not-indexed-by-search-engines)
###### Trong quora, giải thích rằng file robots.txt đươc sử dụng để chỉ dẫn công cụ tìm kiếm (search engine) các file nào không được tìm kiếm với cú pháp User-agent: * Disallow: /tên folder/ 
##### -> folder web đang cố giấu: `/s3cr3t/`
##### Truy cập `/s3cr3t/`, key nằm trong file 'users.txt`
#
# Level 4
###### user: *natas4* Pass: *tKOcJIbzM4lTs8hbCmzn5Zr4434fGZQm*
##### Trang ghi rằng chỉ user đến từ level 5 mới có thể truy cập level 4, tìm hiểu về [cách để nói với trang web về nơi mình đến](https://www.quora.com/Can-a-website-I-visit-see-what-webpage-I-came-from)
##### Sử dụng burpsuite để thay đổi `Referer` thành http://natas5.natas.labs.overthewire.org/
###### Referer được sử dụng để nói với trang website ta truy cập là ta đến từ trang web nào trước đó, xem cách thay đổi Referer [ở đây](https://privacyinternational.org/guide-step/4148/change-http-referer-settings-firefox)
##### Sau khi đổi referer thành ta đến từ level 5, pass sẽ hiện lên trên màn hình.

