## The Ghost is Calling Home
[The Ghost is Calling Home](https://compete.metactf.com/435/problems#problem31)

Write-up:

1. Attempting to login with `admin:admin` works.

2. After some exploring, we find the possibility to send a command called **/YSS/SV09/SPACECRAFT_STATUS_REPORT** in the "Commanding" section.

3. Going back to the Home page shows us there is now a **/YSS/SV09/SPACECRAFT_STATUS_REPORT**, and extracting it shows us the flag: **starpwn{0s1n7_1s_a_g00d_s7ar7}** 
