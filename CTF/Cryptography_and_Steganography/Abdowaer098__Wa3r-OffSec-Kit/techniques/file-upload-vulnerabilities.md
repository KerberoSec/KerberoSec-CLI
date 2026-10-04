# File Upload Vulnerabilities

## Overview
File upload vulnerabilities occur when a web application allows users to upload files without sufficiently validating their name, type, contents, or size. If an attacker can upload an executable file (like a PHP or JSP script) and request it from the server, they can achieve Remote Code Execution (RCE).

## When This Happens
- Profile picture uploads
- Document attachments (resumes, invoices, support tickets)
- XML/CSV import functionality
- Gallery or media managers

---

## Recon / Detection

### 1. Identify File Upload Endpoints
Map out any functionality that allows uploading files. Note the expected file type (e.g., `image/jpeg`, `application/pdf`).

### 2. Determine Where Files Are Stored
Upload a benign file (e.g., `test.jpg`) and find its URL.
- Is it served directly? (`https://target.com/uploads/test.jpg` -> Vulnerable if execution is allowed)
- Is it downloaded via a script? (`https://target.com/download.php?id=123` -> Harder to exploit for RCE, but maybe usable for XSS/XXE)
- Is it stored on an external CDN? (e.g., AWS S3 -> RCE not possible, but XSS or bucket takeover might be)

### 3. Check for Execution
If you can access the file directly, test if the server executes it. Upload a file with a non-harmful payload to test if it runs.

---

## Exploitation Steps (Webshell Upload)

### Step 1: The Basic Bypass
Try uploading a raw executable file:
```php
<!-- shell.php -->
<?php echo "This code is executed!"; ?>
```
If it uploads and you can access `/uploads/shell.php` and see the executed output, you have RCE.

### Step 2: Bypassing Extension Filters
If `.php` is blocked, try alternative extensions:
- **PHP**: `php3`, `php4`, `php5`, `php7`, `pht`, `phtml`, `phar`, `phps`
- **JSP**: `jspx`, `jspf`, `jsw`, `jsv`
- **ASP**: `aspx`, `ashx`, `asmx`, `cer`, `asa`
- **Perl**: `pl`, `pm`, `cgi`
- **ColdFusion**: `cfm`, `cfml`, `cfc`

### Step 3: Bypassing Content-Type Filters
If the server checks the `Content-Type` header from the multipart request, intercept it in Burp and change it:
```http
Content-Disposition: form-data; name="avatar"; filename="shell.php"
Content-Type: image/jpeg

<?php echo "shell"; ?>
```

### Step 4: Bypassing Magic Byte Filters
If the server checks the actual file content (magic bytes), prepend the signature of an allowed file type:
```php
GIF89a
<?php echo "shell"; ?>
```

### Step 5: Bypassing Filename Validation (Double Extensions & Null Bytes)
- `shell.php.jpg` (Sometimes parsed as PHP by Apache)
- `shell.php%00.jpg` (Null byte injection, works on older servers)
- `shell.php%0a.jpg` (Newline injection)
- `shell.jpg.php`

### Step 6: Case Variation
If a regex checks for `.php`, try `.PhP` or `.pHP`.

---

## Alternative Attack Vectors

If you cannot achieve RCE, file uploads can still be exploited for other vulnerabilities.

### 1. Stored XSS via SVG Upload
If SVG images are allowed, you can embed JavaScript inside the XML structure.
```xml
<?xml version="1.0" standalone="no"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg version="1.1" baseProfile="full" xmlns="http://www.w3.org/2000/svg">
   <polygon id="triangle" points="0,0 0,50 50,0" fill="#009900" stroke="#004400"/>
   <script type="text/javascript">
      alert(document.cookie);
   </script>
</svg>
```

### 2. XXE via SVG
Upload an SVG containing an XML External Entity payload to read server files.

### 3. Path Traversal in Filename
Attempt to upload the file to a sensitive directory using the `filename` parameter.
```http
Content-Disposition: form-data; name="file"; filename="../../../var/www/html/shell.php"
```

### 4. Overwriting Critical Files
If the application doesn't rename uploaded files, try to overwrite existing files, like `index.php` or `config.php`.

### 5. Server-Side Configuration Override
Upload an Apache `.htaccess` or IIS `web.config` file to change the server's behavior for that directory.
**`.htaccess` bypass:**
```apache
AddType application/x-httpd-php .png
```
Then upload a `.png` file containing PHP code.

### 6. Race Conditions
Sometimes files are uploaded temporarily, validated, and then deleted. If you can access the file before it gets deleted, you can achieve execution. Use Burp Intruder or Turbo Intruder to aggressively request the file while simultaneously uploading it.

---

## Tools

- `Burp Suite`: Essential for intercepting and modifying `Content-Type`, filenames, and file contents.
- `Fuxploider`: An open-source penetration testing tool that automates the process of detecting and exploiting file upload forms.
- `exiftool`: Insert payloads into the Exif metadata of a valid image (e.g., `exiftool -Comment='<?php echo "shell"; ?>' image.jpg`).

## References
- [File Upload to RCE Workflow](../scenarios/file-upload-to-rce-workflow.md)
- [Exploitation Methodology](../methodology/exploitation-methodology.md)
