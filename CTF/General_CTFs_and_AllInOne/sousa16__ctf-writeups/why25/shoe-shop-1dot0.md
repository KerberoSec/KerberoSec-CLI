Write-up:

1. From the challenge description, we probably need to take a look at the admin's cart. I created user `sousa:sousa` and logged in.

2. This is the request used to access cart: `https://shoe-shop-1.ctf.zone/index.php?page=cart&id=2074`
Attempting to change id to 1 shows us admin's cart, and there is the flag: **flag{00f34f9c417fcaa72b16f79d02d33099}**