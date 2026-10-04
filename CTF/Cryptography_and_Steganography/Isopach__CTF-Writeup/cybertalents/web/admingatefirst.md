# admin gate first
##### Flag is safe in the admin account info

By logging in with the provided credentials `test` / `test`, we get a hint:     
```
Welcome Logged User
{"username":"test","role":"user"}
```
Firstly, let's analyze the page source:
```
...
var token = getCookie('auth');
			function getMyInfo()
			{
				console.log('checking logged user info');
				$.ajax({
		            url: 'index.php?info=yes',
		            type: 'GET',
		            dataType: 'json',
		            contentType: "application/json",
		            beforeSend: function(xhr) {
		                 xhr.setRequestHeader("Authorization", "Bearer "+token) 
		            },
		            success: function(data){
		                $('#info').html(JSON.stringify(data));
		            },
		            error: function(x,y,z){
		            	console.log(x);
		            	console.log(y);
		            	console.log(z);
		            }
		        });				
			}
			getMyInfo();
```
It looks like a cookie challenge! The cookie info is read and passed into the authentication.        
And it is, as we find out by looking at the stored cookie.      

Unfortunately, the cookie is a JWT token. Let's input it into https://jwt.io and see what it gives us.
```
{
  "alg": "HS256",
  "typ": "JWT"
}
```

We discover that the algorithm used is HS256, which happens to be vulnerable to cracking.     
Changing the user/role to `admin` alone would not work without the secret key, hence we'll need to find a way to break it.

Firstly, lets download a [dictionary](https://github.com/brannondorsey/naive-hashcat/.../rockyou.txt) if you haven't already.           

Using the [JWT Cracker Tool](https://github.com/Sjord/jwtcrack), we input the following:     
`python crackjwt.py <JWT> rockyou.txt`
which gives us the secret key of `123456`.

Using that key, we go back to jwt.io and input it into the last box and get the generated JWT.

Pasting the JWT into the page gives us the following:    
`{"username":"admin","role":"admin","flag":"J!W!T#S3cr3T@2018"}`

<details>
  <summary>FLAG</summary> 

  `J!W!T#S3cr3T@2018`
</details>
