# AsciiFX: Solution

## Vulnerability
SQL injection via the filename field in the file upload form.

The app stores uploaded filenames directly into a SQLite query without sanitization. When a filename already exists in the database, the app reflects the filename back in an error message. This makes it a readable error-based / UNION-based SQLi.

## How to Solve

1. Upload any valid image file with a crafted filename containing a UNION SELECT payload.
2. The app checks if the filename exists in the database using an unsafe query.
3. The result of the injected SELECT gets echoed back in the error response.
4. Use UNION SELECT to enumerate tables, then dump the users table to retrieve the flag.

The flag is stored as the admin user's password in the `users` table.

- Note: The flag doesn't start as A1S maybe the host has a different ip then the one on hackthebox