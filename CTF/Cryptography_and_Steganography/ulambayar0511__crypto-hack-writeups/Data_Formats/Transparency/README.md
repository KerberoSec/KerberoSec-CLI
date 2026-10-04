When you connect to a website over HTTPS, the first TLS message sent by the server is the ServerHello containing the server TLS certificate. Your browser verifies that the TLS certificate is valid, and if not, will terminate the TLS handshake. Verification includes ensuring that:

- the name on the certificate matches the domain

- the certificate has not expired

- the certificate is ultimately signed (via a "chain of trust") by a root key of a Certificate Authority (CA) that's trusted by your browser or operating system

if you could trick just a single CA to issue you a certificate for microsoft.com, you could use the corresponding private key to sign malware and bypass trust controls on Windows. 

- openssl pkey -outform der -pubin -in transparency.pem | sha256sum
- https://censys.io/certificates?q=sha256sum_value
- https://transparencyreport.google.com/https/overview
- https://search.censys.io/