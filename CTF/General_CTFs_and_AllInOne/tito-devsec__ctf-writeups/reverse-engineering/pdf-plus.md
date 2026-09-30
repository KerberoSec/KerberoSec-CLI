# CTF Write-up: PDF PLUS

**Category:** Reverse Engineering
**Challenge Source:** tcraCyber champion 2026
**Write-up Author:** TitoDevsec (T1t0D3v$3c)

## Challenge Summary
The challenge provided a PDF file (`pdf_chall1.pdf`). The goal was to analyze the file and extract a hidden flag.

## Vulnerability Analysis
### What was wrong?
The PDF contained embedded JavaScript that executed automatically when the file was opened. This is a common technique for malware delivery or hiding information in CTFs. The flag was hidden within this JavaScript.

## Solution
1.  **Metadata Analysis:** Check the file type and metadata using `pdfinfo`.
2.  **Structure Analysis:** Use `pdf-parser` to inspect the objects within the PDF.
    ```bash
    pdf-parser pdf_chall1.pdf
    ```
    *   **Object 1** (Catalog) had an `/OpenAction` pointing to **Object 2**.
    *   **Object 2** (Action) was of type `/JavaScript` and referenced **Object 3**.
3.  **Extraction:** Extract the JavaScript content from Object 3.
    ```bash
    pdf-parser -o 3 -f pdf_chall1.pdf
    ```
4.  **Analysis:** The extracted JavaScript contained the flag.

## Code Comparison

### Vulnerable Code (Conceptual)
Allowing automatic execution of embedded scripts in documents:
```javascript
// Embedded PDF JavaScript
app.alert("Welcome!");
var flag = "tzcert{P_G0tch@D7h3JS_fl@g_F}";
```

### Secure Code
Disable JavaScript execution in PDF viewers and sanitize documents to remove active content before sharing.
```bash
# Example of stripping JavaScript from a PDF using qpdf
qpdf --empty --pages input.pdf -- output_no_js.pdf
```

## Lessons Learned
*   **PDFs can be active:** PDFs are not just static documents; they can contain scripts and actions.
*   **Static Analysis Tools:** Tools like `pdf-parser` and `peepdf` are essential for analyzing malicious or suspicious documents.
*   **Disable Auto-Execution:** Always disable "Enable Acrobat JavaScript" in PDF reader settings to mitigate risks from malicious PDFs.

## Flag
`tzcert{P_G0tch@D7h3JS_fl@g_F}`
