# Natas Level 12 -> 13

## Goal

Find the password for natas13.

## Key Concept

Unrestricted file upload via **client-controlled filename/extension** (hidden form field).

## Solution

The page is an upload form, and it includes a hidden `filename` field that we can override:

```html
<form enctype="multipart/form-data" action="index.php" method="POST">
<input type="hidden" name="MAX_FILE_SIZE" value="1000" />
<input type="hidden" name="filename" value="<?php print genRandomString(); ?>.jpg" />
</form>
```

On the backend, the upload path’s extension comes from that **client-supplied** field:

```php
function makeRandomPathFromFilename($dir, $fn) {
    $ext = pathinfo($fn, PATHINFO_EXTENSION);
    return makeRandomPath($dir, $ext);
}

$target_path = makeRandomPathFromFilename("upload", $_POST["filename"]);
```
**The vulnerability:** The server uses the extension from `$_POST["filename"]` without validation, allowing us to upload executable PHP files by simply changing `.jpg` to `.php`.

### Approach

1. Create a PHP payload that reads the next level's password: `<?php echo file_get_contents('/etc/natas_webpass/natas13'); ?>`
2. Override the hidden `filename` field to use a `.php` extension: `filename=payload.php`
3. Upload the file: the server saves it as `upload/<random>.php`
4. Visit the uploaded file's URL to execute the PHP and retrieve the password

`solve.py`

```bash
uv run natas/level12/solve.py
```
