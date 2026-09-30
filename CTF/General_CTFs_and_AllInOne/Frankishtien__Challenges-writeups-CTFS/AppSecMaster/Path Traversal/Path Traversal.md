
<img width="752" height="304" alt="image" src="https://github.com/user-attachments/assets/d0931d2f-0572-4db7-84ca-012c85c86c01" />

```php
<?php
$baseDir = __DIR__ . '/files/';

if (isset($_GET['file'])) {
    $file = $_GET['file'];
    $filePath = $baseDir . $file;
    if (file_exists($filePath) && is_file($filePath)) {
        header('Content-Type: application/octet-stream');
        header('Content-Disposition: attachment; filename="' . basename($file) . '"');
        readfile($filePath);
        exit;
    } else {
        echo "<p>File not found.</p>";
    }
} else {
    // Simple UI with basic styling
    echo '<!DOCTYPE html>';
    echo '<html lang="en">';
    echo '<head>';
    echo '<meta charset="UTF-8">';
    echo '<meta name="viewport" content="width=device-width, initial-scale=1.0">';
    echo '<title>AppSecMaster File Download Application</title>';
    echo '<style>';
    echo 'body { font-family: Arial, sans-serif; background: #f7f7f7; margin: 0; padding: 0; }';
    echo '.container { max-width: 500px; margin: 40px auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.07); padding: 32px; }';
    echo 'h1 { color: #333; text-align: center; }';
    echo 'ul { list-style: none; padding: 0; }';
    echo 'li { margin: 12px 0; }';
    echo 'a { color: #007bff; text-decoration: none; font-size: 1.1em; }';
    echo 'a:hover { text-decoration: underline; }';
    echo '</style>';
    echo '</head>';
    echo '<body>';
    echo '<div class="container">';
    echo '<h1>Download a File</h1>';
    echo '<ul>';
    foreach (scandir($baseDir) as $f) {
        if ($f !== '.' && $f !== '..') {
            echo '<li><a href="?file=' . urlencode($f) . '">' . htmlspecialchars($f) . '</a></li>';
        }
    }
    echo '</ul>';
    echo '</div>';
    echo '</body>';
    echo '</html>';
}

```

---
---

```php
$baseDir = __DIR__ . '/files/';
```

- **`$baseDir`** Defiane the paht of files
- this directory is next to this `php file`

<img width="442" height="137" alt="image" src="https://github.com/user-attachments/assets/830ea794-0122-4ee5-8d51-2534931168ec" />

```php
if (isset($_GET['file'])) {
    $file = $_GET['file'];
    $filePath = $baseDir . $file;

```

> If there is a ``file`` variable in the URL (for example: ``download.php?file=test.txt``):

- It gets the file name from the query string.

- Installs the full path to the file (meaning $baseDir/test.txt).

> Checks if the file exists and is actually a regular file:

```php
if (file_exists($filePath) && is_file($filePath)) {
```

---

## Vulnerability  

```php
$file = $_GET['file'];
$filePath = $baseDir . $file;
```

> ## **`http://34.245.151.117/index.php?file=../../../../../../../../tmp/masterkey.txt`**

---

## Secure code

```php
$baseDir = __DIR__ . '/files/';

if (isset($_GET['file'])) {
    // Clean the value from null-byte and decoding attempts
    $requested = urldecode($_GET['file']);
    $requested = str_replace("\0", '', $requested);

    // Build secure files list from the physical folder
    $allowed = array();
    foreach (scandir($baseDir) as $f) {
        if ($f !== '.' && $f !== '..' && is_file($baseDir . $f)) {
            $allowed[] = $f;
        }
    }

    // If the file exists in the folder, just allow the download
    if (in_array($requested, $allowed, true)) {
        $filePath = $baseDir . $requested;
        header('Content-Type: application/octet-stream');
        header('Content-Disposition: attachment; filename="' . basename($requested) . '"');
        readfile($filePath);
        exit;
    } else {
        echo "<p>File not found or not allowed.</p>";
    }
}

```

