### Javascript: Authentication
The challenge seems like authentication bypass or something like this. I have stated the chall and it bring me to login page. 

<img alt="image" src="https://github.com/user-attachments/assets/29fc358f-300c-4adc-b919-88b40c82aa8d" />

I tried login using default password and username like `admin` & `admin` OR `admin` & `pass` but didn't work. 

After that I continue to look over source code. There I can find a JS script called `login.js`, in which we got our creds. 

<img alt="image" src="https://github.com/user-attachments/assets/7bf1f1d0-1865-440b-a86d-ecc464ae0c07" />

I submitted the password as password, and yahu it got solved.

#### lesson learned, 
> Always read source code, alware inspect even if its a 404 page : )
