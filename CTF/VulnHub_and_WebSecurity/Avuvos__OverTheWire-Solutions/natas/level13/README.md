# Natas Level 13 -> 14

## Goal

Find the password for natas14.

## Key Concept

File upload bypass via **magic bytes**: pass `exif_imagetype()` by making the uploaded payload *look* like a real image (at the header level), while still being executable PHP.

## Solution

Level 13 is basically Level 12 with one extra validation step. If you reuse the previous approach (upload a `.php` via the client-controlled `filename` field), the server rejects it with: `File is not an image`

From the provided source, the new check is:

```php
else if (! exif_imagetype($_FILES['uploadedfile']['tmp_name'])) {
    echo "File is not an image";
}
```

### What changed vs Level 12

Even if the upload path ends with `.php`, the server now inspects the **actual file contents** (`tmp_name`) using `exif_imagetype()`. This function identifies image types by checking the file signature (similar idea to what `file` does on Linux).

### The Bypass

Make the payload start with a valid image signature, e.g. **JPEG magic bytes**, then append PHP:

- JPEG header bytes: `FF D8 FF E0`
- PHP payload: `<?php echo file_get_contents('/etc/natas_webpass/natas14'); ?>`

Because the beginning of the file looks like a JPEG, `exif_imagetype()` accepts it, but the server still stores it as a `.php` (same core bug as Level 12), so visiting the uploaded file executes the PHP.

### Approach

1. Create a payload: `JPEG_MAGIC_BYTES + PHP_EXPLOIT`
2. Upload it while overriding the hidden `filename` field to end in `.php` (same trick as Level 12)
3. Parse the response to find the randomized uploaded path (e.g. `upload/<random>.php`)
4. Request that path to execute the PHP and print the password

### Implementation note

- **`BytesIO`**: `requests` accepts a file-like object for uploads. Using `BytesIO(payload)` lets us upload a **binary** payload (JPEG header + PHP) directly from memory, without writing a temporary file to disk.

`solve.py`

```bash
uv run natas/level13/solve.py
```
