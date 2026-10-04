# Package

## Security

### Verification

As described in the article below, we demonstrate how to add an external APT repository with _key verification_.

{% embed url="https://www.digitalocean.com/community/tutorials/how-to-handle-apt-key-and-add-apt-repository-deprecation-using-gpg-to-add-external-repositories-on-ubuntu-22-04" %}

First, Download the PGP keyring and convert it to the GPG format.

{% code overflow="wrap" %}
```bash
$ curl -fsSL https://artifacts.elastic.co/GPG-KEY-elasticsearch | sudo gpg --dearmor -o /usr/share/keyrings/elastic-7.x.gpg
```
{% endcode %}

Alternativelu, we can receive the keyring from a keyserver with specified key ID:

<pre class="language-bash" data-overflow="wrap"><code class="lang-bash"><strong>$ sudo gpg --homedir /tmp --no-default-keyring --keyring /usr/share/keyrings/R.gpg --keyserver keyserver.ubuntu.com --recv-keys E298A3A825C0D65DFD57CBB651716619E084DAB9
</strong></code></pre>

Then we can add the the repository in `/etc/apt/sources.list`.

{% code overflow="wrap" %}
```
deb [arch=amd64,arm64 signed-by=/usr/share/keyrings/elastic-7.x.gpg] https://artifacts.elastic.co/packages/7.x/apt stable main
```
{% endcode %}
