# Trickster
*I found a web app that can help process images: PNG images only!*

## Solution
1. A service that allows you to upload pngs and view them in `/uploads/<filename>`
2. After some fuzzing you can find "instructions.txt", saying that the service checks for the substring `.png` in the filename, and requires the `PNG` bytes in the beggining.
3. Upload a simple php-webshell ending in `.png.php` and prepend `PNG` to the file
4. Go to the webshell in `/uploads/` and find the flag in `../`.

## Flag
**Flag:** `picoCTF{c3rt!fi3d_Xp3rt_tr1ckst3r_3f706222}`
