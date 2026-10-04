#OWASP 

- https://tryhackme.com/room/owaspbrokenaccesscontrol

Access control is a security mechanism used to control which users or systems are allowed to access a particular resource or system.
- authorization access to resources 

**Discretionary Access Control (DAC)**
- admin determines who is allowed access and what actions they are allowed to perform
- OS and filesystems 

**Mandatory Access Control (MAC)**:
- access to resources is determined by a set of predefined rules or policies that are enforced by the system
- high secure places : gov't & military systems

**Role-Based Access Control (RBAC)**
- users are assigned roles that define their level of access to resources 
- enterprise systems

**Attribute-Based Access Control (ABAC)**:
- access to resources is determined by a set of attrs: user role, time of day, location and device 
- cloud environments & web apps

access control is not foolproof and can be vulnerable to various types of attacks, such as privilege escalation and broken access control vulnerabilities.

BROKEN ACCESS CONTROL 
Broken access control vulnerabilities refer to situations where access control mechanisms fail to enforce proper restrictions on user access to resources or data.

- Horizontal priv esc = same level of permissions
- Vertical priv esc = higher acc
- insuff access control checks occur when access control checks are not done correctly 
- insecure direct object reference is a weakness in app access control mechanism

---
` http://10.10.202.4/  into the browser.`
vuln app create account form

ASSESS THE APP
- look at source code
- look for vulnerabilities 
- `/login.php`

Burp Suite / OWASP ZAP

CAPTURE THE TRAFFIC 
- make account
- login
- see there is `admin@admin.com`

in Repeater > send > Response has JSON data which has a redirect_link parameter

in url `/dashboard.php?isadmin=false`  change it to true send to Repeater
"welcome, super"
go to `/admin.php` give yourself admin access

- vertical
- `isadmin`
- ` THM{I_C4n_3xpl01t_B4c} `

---

## Mitigation

Implement Role-Based Access Control (RBAC)

```PHP
$roles = [
	'admin' => ['create','read','update','delete'],
	'editor' => ['create','read','update'],
	'user' => ['read']
];

if(hasPermission('admin','delete')){ // allow delete }
else { //deny delete }

```

**Use Parameterized Queries**:
example demonstrates how a query can be made secure using prepared statements, which separates SQL syntax from data and handles user input safely.

```PHP
// Example of vulnerable query 
$username = $_POST['username']; 
$password = $_POST['password']; 
$query = "SELECT * FROM users WHERE username='$username' AND password='$password'"; 
// Example of secure query using prepared statements 
$username = $_POST['username']; 
$password = $_POST['password']; 
$stmt = $pdo->prepare("SELECT * FROM users WHERE username=? AND password=?"); 
$stmt->execute([$username, $password]); 
$user = $stmt->fetch();
```

**Proper Session Management**:
authenticated users have timely and appropriate access to resources, thereby reducing the risk of unauthorized access to sensitive information.

```PHP
// Start session 
session_start(); 
// Set session variables 
$_SESSION['user_id'] = $user_id; 
$_SESSION['last_activity'] = time(); 
// Check if session is still valid 
if (isset($_SESSION['last_activity']) && (time() - $_SESSION['last_activity'] > 1800)) { 
	// Session has expired 
	session_unset(); 
	session_destroy(); 
}
```

**Use Secure Coding Practices**
Developers should sanitize and validate user input to prevent malicious data

```PHP
// Validate user input 
$username = filter_input(INPUT_POST, 'username', FILTER_SANITIZE_STRING); $password = filter_input(INPUT_POST, 'password', FILTER_SANITIZE_STRING); // Avoid insecure functions 
// Example of vulnerable code using md5 
$password = md5($password); 
// Example of secure code using password_hash 
$password = password_hash($password, PASSWORD_DEFAULT);
```

