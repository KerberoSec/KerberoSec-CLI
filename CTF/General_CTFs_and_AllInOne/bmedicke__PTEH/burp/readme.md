# Burp Suite

# toc

<!-- vim-markdown-toc GFM -->

* [setup](#setup)
  * [test setup](#test-setup)
  * [macOS](#macos)
* [CLI](#cli)
* [Virtual Host routing](#virtual-host-routing)

<!-- vim-markdown-toc -->

# setup

* either set up the proxy in your browser or OS
* or click the `Browser` button to open Chromium (Intercept tab)
  * allows you to leave your default settings untouched
  * notice the Burp Suite extension

## test setup

* make sure `Intercept is on`
* load a page
* the page should be stuck and a new request should show up in Burp
* if you click on forward the page should load

## macOS

`brew cask install burp-suite`

# CLI

> start Burp from the command line

```sh
burpsuite --help
```
# Virtual Host routing

* Vhosts allow webservers to serve different content depending on domain name
* this is done by looking at the (mandatory )`Host` header from requests
* **changing the `Host` in a request can result in different pages being served**
* also check out: https://github.com/codingo/VHostScan
