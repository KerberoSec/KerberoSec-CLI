---
title: Web Vulnerabilities WriteUps
layout: post
categories: [Writeups,Web-Vulnerabilities-Writeups]
tags: [Writeups,XSS,CSP,SQLI,Open-Redirect,IDOR,HPP,Information-disclosure,CORS,SOP,XXE,DOS,html-injection,S3,clickjacking,host-header-injection,SSRF,os-command-injection,CSRF,LFI,LFD,path-traversal,RFI,file-upload]
toc: true
published: true
---

| Vulnerabilities Name                                                                                                                                             | 
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | 
| [**1️: Cross Site Scripting (XSS)**](https://0xkourama.github.io/0xKourama/posts/Web-Vulnerabilities-WriteUps/#cross-site-scripting-xss)                             | 
| [**2️: Content Security Policy (CSP)**](https://0xkourama.github.io/0xKourama/posts/Web-Vulnerabilities-WriteUps/#content-security-policy-csp)                       |   
| [**3️: Html Injection**](https://0xkourama.github.io/0xKourama/posts/Web-Vulnerabilities-WriteUps/#html-injection)                                                   |
| [**4️: Clickjacking (UI redressing)**](https://0xkourama.github.io/0xKourama/posts/Web-Vulnerabilities-WriteUps/#clickjacking-ui-redressing)                         |
| [**5️: Cross Site Request Forgery (CSRF)**](https://0xkourama.github.io/0xKourama/posts/Web-Vulnerabilities-WriteUps/#cross-site-request-forgery-csrf)               |
| [**6️: Cross Origin Resource Sharing (CORS)**](https://0xkourama.github.io/0xKourama/posts/Web-Vulnerabilities-WriteUps/#cross-origin-resource-sharing-cors)         |
| [**7️: Same Origin Policy (SOP)**](https://0xkourama.github.io/0xKourama/posts/Web-Vulnerabilities-WriteUps/#same-origin-policy-sop)                                 |
| [**8️: Open Redirect**](https://0xkourama.github.io/0xKourama/posts/Web-Vulnerabilities-WriteUps/#open-redirect)                                                     |
| [**9️: Information Disclosure**](https://0xkourama.github.io/0xKourama/posts/Web-Vulnerabilities-WriteUps/#information-disclosure)                                   |
| [**10: Denial Of Service (DOS)**](https://0xkourama.github.io/0xKourama/posts/Web-Vulnerabilities-WriteUps/#denial-of-service-dos)                                   |
| [**1️1️: Simple Storage Service (S3)**](https://0xkourama.github.io/0xKourama/posts/Web-Vulnerabilities-WriteUps/#simple-storage-service-s3)                           |
| [**1️2️: SQLI**](https://0xkourama.github.io/0xKourama/posts/Web-Vulnerabilities-WriteUps/#sqli)                                                                       |
| [**1️3️: EXternal Xml Entity (XXE)**](https://0xkourama.github.io/0xKourama/posts/Web-Vulnerabilities-WriteUps/#external-xml-entity-xxe)                               |
| [**1️4️: Insecure Direct Object References (IDOR)**](https://0xkourama.github.io/0xKourama/posts/Web-Vulnerabilities-WriteUps/#insecure-direct-object-references-idor) |
| [**1️5️: HTTP Parameter Pollution (HPP)**](https://0xkourama.github.io/0xKourama/posts/Web-Vulnerabilities-WriteUps/#http-parameter-pollution-hpp)                     |
| [**1️6️: Host Header Injection (HHI)**](https://0xkourama.github.io/0xKourama/posts/Web-Vulnerabilities-WriteUps/#host-header-injection-hhi)                           |
| [**1️7️: Server Side Request Forgery (SSRF)**](https://0xkourama.github.io/0xKourama/posts/Web-Vulnerabilities-WriteUps/#server-side-request-forgery-ssrf)             | 
| [**1️8️: OS Command Injection**](https://0xkourama.github.io/0xKourama/posts/Web-Vulnerabilities-WriteUps/#os-command-injection)                                       |
| [**1️9️: LFI/LFD: Path Traversal: RFI**](https://0xkourama.github.io/0xKourama/posts/Web-Vulnerabilities-WriteUps/#lfilfd---path-traversal---rfi)                    |
| [**2️0️: File Upload**](https://0xkourama.github.io/0xKourama/posts/Web-Vulnerabilities-WriteUps/#file-upload)                                                         | 

## Cross Site Scripting (XSS) 

1. [**From P5 to P2 to 100 BXSS**](https://medium.com/@mohameddaher/from-p5-to-p5-to-p2-from-nothing-to-1000-bxss-4dd26bc30a82)
1. [**Google Acquisition XSS (Apigee)**](https://medium.com/@TnMch/google-acquisition-xss-apigee-5479d7b5dc4)
1. [**DOM-Based XSS at accounts.google.com by Google Voice Extension**](http://www.missoumsai.com/google-accounts-xss.html)
1. [**XSS on Microsoft.com via Angular Js template injection**](https://medium.com/@impratikdabhi/reflected-xss-on-microsoft-com-via-angular-template-injection-2e26d80a7fd8)
1. [**Researching Polymorphic Images for XSS on Google Scholar**](https://blog.doyensec.com/2020/04/30/polymorphic-images-for-xss.html)
1. [**Netflix Party Simple XSS**](https://medium.com/@kristian.balog/netflix-party-simple-xss-ec92ed1d7e18)
1. [**Stored XSS in google nest**](https://medium.com/bugbountywriteup/stored-xss-in-google-nest-a82373bbda68)
1. [**Self XSS to persistent XSS on login portal**](https://medium.com/@nnez/always-escalate-from-self-xss-to-persistent-xss-on-login-portal-54265b0adfd0)
1. [**Universal XSS affecting Firefox**](https://0x65.dev/blog/2020-03-30/cve-2019-17004-semi-universal-xss-affecting-firefox-for-ios.html)
1. [**XSS WAF Character limitation bypass like a boss**](https://medium.com/bugbountywriteup/xss-waf-character-limitation-bypass-like-a-boss-2c788647c229)
1. [**Self XSS to Account Takeover**](https://medium.com/@ch3ckm4te/self-xss-to-account-takeover-72c89775cf8f)
1. [**Reflected XSS on Microsoft subdomains**](https://medium.com/bugbountywriteup/reflected-xss-on-microsoft-com-subdomains-4bdfc2c716df)
1. [**The tricky XSS**](https://smaranchand.com.np/2020/02/the-tricky-xss/)
1. [**Reflected XSS  in AT&T**](https://medium.com/@godofdarkness.msf/reflected-xss-in-at-t-7f1bdd10d8f7)
1. [**XSS on Google using Acunetix**](https://www.acunetix.com/blog/web-security-zone/xss-google-acunetix/)
1. [**Exploiting websocket application wide XSS**](https://medium.com/@osamaavvan/exploiting-websocket-application-wide-xss-csrf-66e9e2ac8dfa)
1. [**Reflected XSS with  HTTP Smuggling**](https://hazana.xyz/posts/escalating-reflected-xss-with-http-smuggling/)
1. [**XSS on Facebook instagram CDN server bypassing signature protection**](https://www.amolbaikar.com/xss-on-facebook-instagram-cdn-server-bypassing-signature-protection/)
1. [**XSS on Facebook's Acquisition Oculus**](https://www.amolbaikar.com/xss-on-facebooks-acquisition-oculus-cdn-server/)
1. [**XSS on sony Subdomain**](https://medium.com/@gguzelkokar.mdbf15/xss-on-sony-subdomain-feddaea8f5ac)
1. [**Exploiting Self XSS**](https://footstep.ninja/posts/exploiting-self-xss/)
1. [**Effortlessly Finding Cross Site Scripting inclusion XSSI**](https://medium.com/bugbountywriteup/effortlessly-finding-cross-site-script-inclusion-xssi-jsonp-for-bug-bounty-38ae0b9e5c8a)
1. [**Bugbounty a DOM XSS**](https://jinone.github.io/bugbounty-a-dom-xss/)
1. [**Blind XSS : a mind Game**](https://medium.com/@dirtycoder0124/blind-xss-a-mind-game-to-win-the-battle-4fc67c524678?)
1. [**FireFox IOS QR code reader XSS(CVE-2019-17003)**](https://payatu.com/blog/nikhil-mittal/firefox-ios-qr-code-reader-xss-(cve-2019-17003))
1. [**HTML injection to XSS**](https://evanricafort.blogspot.com/2019/12/html-injection-to-xss-bypass-in.html)
1. [**CVE-2020-13487 Authenticated Stored Cross-site Scripting in bbPress**](https://hackerone.com/reports/881918)
1. [**XSS at error page of repository code**](https://medium.com/@navne3t/150-xss-at-error-page-of-respository-code-4fc628892742)
1. [**XSS like a Pro**](https://www.hackerinside.me/2019/12/xss-like-pro.html)
1. [**How I turned self XSS to stored XSS via CSRF**](https://medium.com/@abhishake100/how-i-turned-self-xss-to-stored-via-csrf-d12eaaf59f2e)
1. [**XSS Stored on Outlook web**](https://medium.com/@elmrhassel/xss-stored-on-outlook-web-outlook-android-app-ad4bd46b8823)
1. [**XSS Bug 20 Chars Blind XSS Payload**](https://medium.com/@mohameddaher/how-i-paid-2-for-1054-xss-bug-20-chars-blind-xss-payloads-12d32760897b)
1. [**XSS in AMP4EMAIL(DOM clobbering)**](https://research.securitum.com/xss-in-amp4email-dom-clobbering/)
1. [**DOM Based XSS bug bounty writeup**](https://hacknpentest.com/dom-based-xss-bug-bounty-writeup/)
1. [**XSS will never die**](https://medium.com/@04sabsas/xss-will-never-die-eb3584081a5f)
1. [**5000 USD XSS issue at avast desktop antivirus**](https://medium.com/bugbountywriteup/5-000-usd-xss-issue-at-avast-desktop-antivirus-for-windows-yes-desktop-1e99375f0968)
1. [**XSS to account takeover**](https://noobe.io/articles/2019-10/xss-to-account-takeover)
1. [**How Paypal helped me to generate XSS**](https://medium.com/@pflash0x0punk/how-paypal-helped-me-to-generate-xss-9408c0931add)
1. [**Bypass Uppercase filters like a PRO(XSS advanced methods)**](https://medium.com/@Master_SEC/bypass-uppercase-filters-like-a-pro-xss-advanced-methods-daf7a82673ce)
1. [**Stealing login credentials with reflected XSS**](https://medium.com/@mehulcodes/stealing-login-credentials-with-reflected-xss-7cb450bf5710)
1. [**bughunting xss on cookie popup warning**](https://victoni.github.io/bug-hunting-xss-on-cookie-popup-warning/)
1. [**XSS is love**](https://nirmaldahal.com.np/xss-is-love/)
1. [**Oneplus XSS vulnerability in customer support portal**](https://medium.com/@tech96bot/oneplus-xss-vulnerability-in-customer-support-portal-d5887a7367f4)
1. [**Exploiting cookie based XSS by finding RCE**](https://noobe.io/articles/2019-09/exploiting-cookie-based-xss-by-finding-rce)
1. [**Stored XSS on zendesk via macros**](https://medium.com/@hariharan21/stored-xss-on-zendesk-via-macros-part-2-676cefee4616)
1. [**XSS in ZOHO main**](https://www.hackerinside.me/2019/09/xss-in-zoho-mail.html)
1. [**DOM based XSS in private program**](https://www.mohamedharon.com/2019/09/dom-based-xss-in-private-program.html)
1. [**Bugbounty writeup : Take Attention and get stored XSS**](https://medium.com/@04sabsas/bugbounty-writeup-take-attention-and-get-stored-xss-495dd6eab07e)
1. [**How I xssed admin account** ](https://gauravnarwani.com/how-i-xssed-admin-account/)
1. [**Clickjacking XSS on google** ](https://websecblog.com/vulns/clickjacking-xss-on-google-org/)
1. [**Stored XSS on laporbugid**](https://learn.hackersid.com/2019/08/stored-xss-on-laporbugid.html)
1. [**Leveraging angularjs based XSS to privilege escalation**](https://www.shawarkhan.com/2019/08/leveraging-angularjs-based-xss-to-privilege-escalation.html)
1. [**How I found XSS by searching in shodan**](https://blog.usejournal.com/how-i-found-xss-by-searching-in-shodan-6943b799e648)
1. [**Chaining caache poisining to stored XSS**](https://medium.com/@nahoragg/chaining-cache-poisoning-to-stored-xss-b910076bda4f)
1. [**XSS  to RCE** ](https://medium.com/@hungrybytes/xss-to-rce-in-e20b2bc55f94)
1. [**XSS on twitter worth 1120**](https://medium.com/@bywalks/xss-on-twitter-worth-1120-914dcd28ee18)
1. [**Reflected XSS in ebay.com**](https://medium.com/@madguyyy/reflected-xss-in-ebay-com-60a9d61e26cd)
1. [**Cookie based XSS exolpoitation 2300 bug bounty** ](https://medium.com/@iSecMax/сookie-based-xss-exploitation-2300-bug-bounty-story-9bc532ffa564)
1. [**What do netcat -SMTP-self XSS have in common** ](https://medium.com/bugbountywriteup/what-do-netcat-smtp-and-self-xss-have-in-common-stored-xss-a05648b72002)
1. [**XSS on google custom search engine** ](https://thesecurityexperts.wordpress.com/2019/07/11/xss-on-google-custom-search-engine/)
1. [**Story of a Full Account Takeover vulnerability N/A to Accepted** ](https://medium.com/@nandwanajatin25/story-of-a-stored-xss-to-full-account-takeover-vulnerability-n-a-to-accepted-8478aa5e0d8e)
1. [**Yeah I got p2 in 1 minute stored XSS via markdown editor** ](https://medium.com/@schopath/yeah-i-got-p2-in-1-minute-stored-xss-via-markdown-editor-7872dba3f158)
1. [**Stored XSS on indeed** ](https://cyberzombie.in/stored-xss-on-indeed/)
1. [**Self XSS to evil XSS**](https://medium.com/@saadahmedx/self-xss-to-evil-xss-bcf2494a82a4)
1. [**How a classical XSS can lead to persistent  ATO vulnerability**](https://hackademic.co.in/how-a-classical-xss-can-lead-to-persistent-ato-vulnerability/)
1. [**Reflected XSS in tokopedia train ticket** ](https://visat.me/security/reflected-xss-in-tokopedia-train-ticket/)
1. [**Bypassing XSS filter and stealing user credit card data**](https://medium.com/@osamaavvan/bypassing-xss-filter-and-stealing-user-credit-card-data-100f247ed5eb)
1. [**Googleplex.com blind XSS**](https://websecblog.com/vulns/googleplex-com-blind-xss/)
1. [**Reflected XSS on error page** ](https://noobe.io/articles/2019-06/reflected-xss-on-error-page)
1. [**How I was able to get private ticket response panel and fortigate web panel via blind XSS** ](https://pwnsec.ninja/2019/06/06/how-i-was-able-to-get-private-ticket-response-panel-and-fortigate-web-panel-via-blind-xss/)
1. [**Unicode vs WAF**](https://medium.com/bugbountywriteup/unicode-vs-waf-xss-waf-bypass-128cd9972a30)
1. [**Story of URI based XSS with some simple google dorking** ](https://medium.com/@nandwanajatin25/story-of-a-uri-based-xss-with-some-simple-google-dorking-e1999254aa55)
1. [**Stored XSS on edmodo**](https://medium.com/@matarpan33r/stored-xss-on-edmodo-67b244824fa5)
1. [**XSSed my way to 1000**](https://gauravnarwani.com/xssed-my-way-to-1000/)
1. [**Try harder for XSS**](https://medium.com/@fbotes2/try-harder-for-xss-7aa3657255a1)
1. [**From parameter pollution to XSS**](https://medium.com/@momenbasel/from-parameter-pollution-to-xss-d095e13be060)
1. [**MIME  sniffing XSS**](https://www.komodosec.com/post/mime-sniffing-xss)
1. [**Stored XSS on techprofile Microsoft**  ](https://medium.com/@kang_ali/stored-xss-on-techprofile-microsoft-d21757588cc1)
1. [**Tale of a wormable Twitter XSS**](https://www.virtuesecurity.com/tale-of-a-wormable-twitter-xss/)
1. [**XSS attacks google bot index manipulation**](http://www.tomanthony.co.uk/blog/xss-attacks-googlebot-index-manipulation/)
1. [**From Reflected XSS to Account takeover** ](https://medium.com/a-bugz-life/from-reflected-xss-to-account-takeover-showing-xss-impact-9bc6dd35d4e6)
1. [**Stealing local storage data through XSS**](http://blog.h4rsh4d.com/2019/04/stealing-local-storage-data-through-xss.html)
1. [**CSRF attack can lead to stored XSS**](https://medium.com/bugbountywriteup/csrf-attack-can-lead-to-stored-xss-f40ba91f1e4f)
1. [**XSS Reflected (filter bypass)**](https://medium.com/bugbountywriteup/xss-reflected-xss-bypass-filter-de41d35239a3)
1. [**XSS protection bypass on hackerone private program**](https://medium.com/@bughunter.sec7/how-i-was-able-to-bypass-xss-protection-on-hackerones-private-program-8914a31339a9)
1. [**Just 5 minutes to get my 2nd Stored XSS on edmodo.com**](https://medium.com/@ZishanAdThandar/just-5-minute-to-get-my-2nd-stored-xss-on-edmodo-com-fe2ee559e00d)
1. [**Multiple XSS in  skype.com** ](https://medium.com/@jayateerthag/multiple-xss-in-skype-com-2-18cfed39edbd)
1. [**Obtaining XSS using moodle featured and minor bugs** ](https://medium.com/@daniel.thatcher/obtaining-xss-using-moodle-features-and-minor-bugs-2035665989cc)
1. [**XSS on 403 forbidden bypass akamai WAF**](https://medium.com/@bughunter.sec7/xss-403-forbidden-bypass-akamai-security-write-up-b341f588efb5)
1. [**How I was turn self XSS into reflected XSS**](https://medium.com/@heinthantzin/how-i-was-able-to-turn-self-xss-into-reflected-xss-850e3d5a2beb)
1. [**A Tale of 3 XSS**](https://gauravnarwani.com/a-tale-of-3-xss/)
1. [**Stored XSS on Google.com**](https://medium.com/@bughunter.sec7/stored-xss-on-google-com-e7ac12f03b8e)
1. [**Stored XSS in the Guides gameplaersion (www.dota2.com)**](https://medium.com/@bughunter.sec7/stored-xss-in-the-guides-gameplayversion-www-dota2-com-775fa9a1889b)
1. [**Admin google.com reflected XSS**](https://buer.haus/2015/01/21/admin-google-com-reflected-cross-site-scripting-xss/)
1. [**Paypal Stored security bypass** ](https://blog.it-securityguard.com/bugbounty-paypal-stored-xss-security-bypass/)
1. [**Paypal DOM XSS main domain**](https://blog.it-securityguard.com/bugbounty-paypal-dom-xss-main-domain/)
1. [**Bugbounty The 5k$ Google XSS**](https://blog.it-securityguard.com/bugbounty-the-5000-google-xss)
1. [**Facebook stored XSS**](https://buer.haus/2014/06/16/facebook-stored-cross-site-scripting-xss-badges/)
1. [**Ebay mobile reflected XSS**](https://thehackerblog.com/ebay-mobile-reflected-xss-disclosure-writeup/index.html)
1. [**Magix bugbounty XSS writeup**](https://www.rcesecurity.com/2014/04/magix-bug-bounty-magix-com-rce-sqli-and-xara-com-lfi-xss/)

## Content Security Policy (CSP)

1. [**csp bypass + xss**](https://hackerone.com/reports/153666)
2. [**www.hackerone.com website CSP "script-src" includes "unsafe-inline"**](https://hackerone.com/reports/225833)
3. [**https://wakatime.com/ website CSP "script-src" includes "unsafe-inline"**](https://hackerone.com/reports/244766)
4. [**Unsafe Inline and Eval CSP Usage**](https://hackerone.com/reports/244724)

---

## Html Injection

1. [**HTML-injection-in-clause-email**](https://evanricafort.blogspot.com/2019/07/html-injection-in-clause-email.html)
2. [**HTML-injection-to-xss-bypass-in**](https://evanricafort.blogspot.com/2019/12/html-injection-to-xss-bypass-in.html)
3. [**HTML-injection-in-email**](https://footstep.ninja/posts/html-injection-in-email/)
4. [**Chain-the-vulnerabilities-and-take-your-report-impact-on-the-moon-csrf-to-html-injection-which**](https://medium.com/@armaanpathan/chain-the-vulnerabilities-and-take-your-report-impact-on-the-moon-csrf-to-html-injection-which-608fa6e74236)
5. [**Stored-iframe-injection-csrf-account-takeover**](https://medium.com/@irounakdhadiwal999/stored-iframe-injection-csrf-account-takeover-42c93ad13f5d)
6. [**Hunting-good-bugs-with-only-html**](https://medium.com/@know.0nix/hunting-good-bugs-with-only-html-d8fd40d17b38)
7. [**Unauthenticated-account-takeover-through-http-leak**](https://infosecwriteups.com/unauthenticated-account-takeover-through-http-leak-33386bb0ba0b)
8. [**HTML-injection-unique-exploitation**](https://medium.com/@pratiky054/html-injection-unique-exploitation-a5c3d4e6fed8)
9. [**How-i-caught-multiple-vulnerabilities-in-udemy-com**](https://bugdisclose.medium.com/how-i-caught-multiple-vulnerabilities-in-udemy-com-14012a8a1421)
10. [**Got-easiest-bounty-with-html-injection-via-email-confirmation**](https://medium.com/cyberverse/got-easiest-bounty-with-html-injection-via-email-confirmation-b1b10575a105)

---

## Clickjacking (UI redressing)

1. [**Clickjacking-on-google-myaccount-worth-7500**](https://apapedulimu.click/clickjacking-on-google-myaccount-worth-7500)
2. [**How-i-earned-750-bounty-reward-from-at-t-bug-bounty-adesh-kolte**](https://medium.com/@adeshkolte/how-i-earned-750-bounty-reward-from-at-t-bug-bounty-adesh-kolte-ae62dea44083)
3. [**Binary-com-clickjacking-vulnerability-exploiting-html5-security-features-SandBox**](https://medium.com/@ameerassadi/binary-com-clickjacking-vulnerability-exploiting-html5-security-features-368c1ff2219d) 
4. [**1800-worth-clickjacking-1f92e79d0414**](https://medium.com/@osamaavvan/1800-worth-clickjacking-1f92e79d0414)
5. [**Account-taker-with-clickjacking**](https://medium.com/@osamaavvan/account-taker-with-clickjacking-ace744842ec3)
6. [**Clickjacking-in-google-docs-and-voice-typing-feature-c481d00b020a**](https://medium.com/@raushanraj_65039/clickjacking-in-google-docs-and-voice-typing-feature-c481d00b020a)
7. [**Google-clickjacking**](https://medium.com/@raushanraj_65039/google-clickjacking-6a04132b918a)
8. [**https://medium.com/bugbountywriteup/chaining-self-xss-with-ui-redressing-is-leading-to-session-hijacking-pwn-users-like-a-boss-efb46249cd14**](https://medium.com/bugbountywriteup/chaining-self-xss-with-ui-redressing-is-leading-to-session-hijacking-pwn-users-like-a-boss-efb46249cd14)
9. [**Facebook-clickjacking-how-we-put-a-new-dress-on-facebook-ui**](https://seekurity.com/blog/2016/04/22/admin/poc-gallery/facebook-clickjacking-how-we-put-a-new-dress-on-facebook-ui)
10. [**Clickjacking-xss-on-google-org**](https://websecblog.com/vulns/clickjacking-xss-on-google-org/)
11. [**Redressing Instagram leaking application tokens via Instagram clickjacking vulnerability**](https://www.seekurity.com/blog/general/redressing-instagram-leaking-application-tokens-via-instagram-clickjacking-vulnerability/)
12. [**Microsoft Yammer clickjacking exploiting HTML5 security features**](https://www.seekurity.com/blog/general/microsoft-yammer-clickjacking-exploiting-html5-security-features/)
13. [**Highly wormable clickjacking in player card**](https://hackerone.com/reports/85624)
14. [**Twitter Periscope Clickjacking Vulnerability**](https://hackerone.com/reports/591432)
15. [**Clickjacking on donation page**](https://hackerone.com/reports/921709)
16. [**Stealing User emails by clickjacking cards.twitter.com/xxx/xxx**](https://hackerone.com/reports/154963)
17. [**Clickjacking at join.nordvpn.com**](https://hackerone.com/reports/765955)
18. [**Clickjacking is the admin page**](https://hackerone.com/reports/728004)
19. [**Clickjacking on cas.acronis.com login page**](https://hackerone.com/reports/971234)
20. [**Clickjacking at ylands.com**](https://hackerone.com/reports/405342)

---

## Cross Site Request Forgery (CSRF)

1. **[Paypal bug bounty: Updating the Paypal. me profile picture without consent (CSRF attack): Florian Courtial](https://hethical.io/paypal-bug-bounty-updating-the-paypal-me-profile-picture-without-consent-csrf-attack/)**
2. **[Hacking PayPal Accounts with one click (Patched): Yasser Ali](http://yasserali.com/hacking-paypal-accounts-with-one-click/)**
3. **[Add tweet to collection CSRF: Vijay Kumar](https://hackerone.com/reports/100820)**
4. **[Facebookmarketingdevelopers.com: Proxies, CSRF Quandry, and API Fun: phwd](http://philippeharewood.com/facebookmarketingdevelopers-com-proxies-csrf-quandry-and-api-fun/)**
5. **[How I Hack your Beats account? Apple Bug Bounty: @aaditya_purani](https://aadityapurani.com/2016/07/20/how-i-hacked-your-beats-account-apple-bug-bounty/)**
6. **[FORM POST JSON: JSON CSRF on POST Heartbeats API: Dr.Jones](https://hackerone.com/reports/245346)**
7. **[Hacking Facebook accounts using CSRF in Oculus-Facebook integration](https://www.josipfranjkovic.com/blog/hacking-facebook-oculus-integration-csrf)**
8. **[Cross site request forgery (CSRF): Sjoerd Langkemper: Jan 9, 2019](http://www.sjoerdlangkemper.nl/2019/01/09/csrf/)**
9. **[Cross-Site Request Forgery Attack: PwnFunction](https://www.youtube.com/watch?v=eWEgUcHPle0)**
10. **[Wiping Out CSRF: Joe Rozner: Oct 17, 2017](https://medium.com/@jrozner/wiping-out-csrf-ded97ae7e83f)**
11. **[Bypass referer check logic for CSRF](https://www.hahwul.com/2019/10/11/bypass-referer-check-logic-for-csrf/)**
12. **[Bypass-referer-check-logic-for-csrf.html](https://www.hahwul.com/2019/10/bypass-referer-check-logic-for-csrf.html)**
13. **[Messenger-site-wide-csrf/](https://whitton.io/articles/messenger-site-wide-csrf/)**
14. **[Bypass-csrf-with-clickjacking-worth-1250-6c70cc263f40](https://medium.com/@saadahmedx/bypass-csrf-with-clickjacking-worth-1250-6c70cc263f40)**
15. **[Bypass CSRF with clickjacking on Google org](https://medium.com/@saadahmedx/bypass-csrf-with-clickjacking-worth-1250-6c70cc263f40)**
16. **[CSRF combined with IDOR within Document Converter exposes files](https://hackerone.com/reports/398316)**
17. **[Clickjacking & CSRF attack can be done at](https://hackerone.com/reports/14494) [https://app.mavenlink.com/login](https://app.mavenlink.com/login)**
18. **[How-i-could-have-taken-over-any-pinterest-account](http://infosecflash.com/2019/01/05/how-i-could-have-taken-over-any-pinterest-account/)**
19. **[Leaking-WordPress-CSRF-Tokens](https://ahussam.me/Leaking-WordPress-CSRF-Tokens/)**
20. **[Paypal-bbp-i-couldve-deleted-all-smc](https://blog.ayoubaitelmokhtar.com/2018/06/paypal-bbp-i-couldve-deleted-all-smc.html)**
21. **[Instagram-delete-media-csrf.html](https://blog.darabi.me/2019/12/instagram-delete-media-csrf.html)**
22. **[Wordpress-csrf-to-rce/](https://blog.ripstech.com/2019/wordpress-csrf-to-rce/)**
23. **[RCE-on-a-facebook-server](https://blog.scrt.ch/2018/08/24/remote-code-execution-on-a-facebook-server/)**
24. **[Collecting-shells-by-the-sea-of-nas-vulnerabilities](https://blog.securityevaluators.com/collecting-shells-by-the-sea-of-nas-vulnerabilities-155a0bd7c525)**
25. **[CORS-to-CSRF-attack](https://blog.usejournal.com/cors-to-csrf-attack-c33a595d441)**
26. **[1800-in-less-than-hour](https://blog.yappare.com/2018/01/1800-in-less-than-hour.html)**
27. **[Googlebugs](https://bughunt1307.herokuapp.com/googlebugs.html)**
28. **[Site-wide-csrf-on-popular-program](https://fellchase.blogspot.com/2020/02/site-wide-csrf-on-popular-program.html)**
29. **[Using-CSRF-i-got-weird-account-takeover](https://flex0geek.blogspot.com/2020/02/using-csrf-i-got-weird-account-takeover.html)**
30. **[Admin-hijacked-by-sea-surf-pirates](https://gauravnarwani.com/admin-hijacked-by-sea-surf-pirates/)**
31. **[How I could have hijacked a victim’s YouTube notifications! (Google VRP Writeup)](https://hackademic.co.in/youtube-bug/)**
32. **[How-i-was-able-to-delete-13k-microsoft-translator-projects](https://haiderm.com/how-i-was-able-to-delete-13k-microsoft-translator-projects/)**
33. **[Fastest-fix-on-open-bug-bounty-platform](https://kongwenbin.com/fastest-fix-on-open-bug-bounty-platform/)**
34. **[How-a-simple-csrf-attack-turned-into-a-p1-level-bug](https://ladysecspeare.wordpress.com/2020/04/05/how-a-simple-csrf-attack-turned-into-a-p1-level-bug/)**
35. **[CSRF-critical-exploitable-in-infected-site](https://medium.com/@Hossam.Mesbah/cross-site-request-forgery-critical-exploitable-in-infected-site-a271aedeed2f)**
36. **[Oauth-misconfiguration-lead-to-complete-account-takeover](https://medium.com/@Jacksonkv22/oauth-misconfiguration-lead-to-complete-account-takeover-c8e4e89a96a)**
37. **[A-very-useful-technique-to-bypass-the-csrf-protection-for-fun-and-profit](https://medium.com/@Skylinearafat/a-very-useful-technique-to-bypass-the-csrf-protection-for-fun-and-profit-471af64da276)**
38. **[How-i-turned-self-xss-to-stored-via-csrf](https://medium.com/@abhishake100/how-i-turned-self-xss-to-stored-via-csrf-d12eaaf59f2e)**
39. **[CSRF-vulnerability-leads-to-user-profile-change-in-microsoft-express-logic](https://medium.com/@adeshkolte/cross-site-request-forgery-vulnerability-leads-to-user-profile-change-in-microsoft-express-logic-dc3481ab47ba)**
40. **[How-i-got-500-from-microsoft-for-csrf-vulnerability](https://medium.com/@adeshkolte/how-i-got-500-from-microsoft-for-csrf-vulnerability-700accaf48b9)**
41. **[How-i-made-1000-at-t-bug-bounty-h1](https://medium.com/@adeshkolte/how-i-made-1000-at-t-bug-bounty-h1-14e68b284e2f)**
42. **[Lintern-ute-account-takeover-via-csrf-adesh-kolte](https://medium.com/@adeshkolte/lintern-ute-account-takeover-via-csrf-adesh-kolte-307f7065ee74)**
43. **[How-i-found-password-bypass-vulnerability-on-private-document-at-scribd-com](https://medium.com/@androgaming1912/how-i-found-password-bypass-vulnerability-on-private-document-at-scribd-com-c0905e8dcc9a)**
44. **[Brute-forcing-user-ids-via-csrf-to-delete-all-users-with-csrf-attack](https://medium.com/@armaanpathan/brute-forcing-user-ids-via-csrf-to-delete-all-users-with-csrf-attack-216ccd4d832c)**
45. **[Self-xss-to-account-takeover](https://medium.com/@ch3ckm4te/self-xss-to-account-takeover-72c89775cf8f)**
46. **[Obtaining-xss-using-moodle-features-and-minor-bugs](https://medium.com/@daniel.thatcher/obtaining-xss-using-moodle-features-and-minor-bugs-2035665989cc)**
47. **[How-i-hacked-companies-related-to-the-crypto-currency-and-earned-60-000](https://medium.com/@iSecMax/how-i-hacked-companies-related-to-the-crypto-currency-and-earned-60-000-93e9b3299f4e)**
48. **[Stored-iframe-injection-csrf-account-takeover](https://medium.com/@irounakdhadiwal999/stored-iframe-injection-csrf-account-takeover-42c93ad13f5d)**
49. **[Account-taken-over-in-style](https://medium.com/@kishorehariram/account-taken-over-in-style-8a547342a5ad)**
50. **[Fastest-fix-on-open-bug-bounty-platform](https://medium.com/@kongwenbin/fastest-fix-on-open-bug-bounty-platform-4bb03ff846e8)**
51. **[CSRF-email-confirmation-vulnerability-for-gmail-g-suite-in-facebook](https://medium.com/@lokeshdlk77/csrf-email-confirmation-vulnerability-for-gmail-g-suite-in-facebook-5ab551a0a526)**
52. **[CSRF-bypass-using-cross-frame-scripting](https://medium.com/@mr_hacker/csrf-bypass-using-cross-frame-scripting-c349d6f33eb6)**
53. **[CSRF CSRF CSRF](https://medium.com/@navne3t/csrf-csrf-csrf-f203e6452a9c)**
54. **[My-first-csrf-to-account-takeover-worth-750](https://medium.com/@nishantrustlingup/my-first-csrf-to-account-takeover-worth-750-1332641d4304)**
55. **[Always-escalate-from-self-xss-to-persistent-xss-on-login-portal](https://medium.com/@nnez/always-escalate-from-self-xss-to-persistent-xss-on-login-portal-54265b0adfd0)**
56. **[Exploiting-websocket-application-wide-xss-csrf](https://medium.com/@osamaavvan/exploiting-websocket-application-wide-xss-csrf-66e9e2ac8dfa)**
57. **[JSON-CSRF-attack-on-a-social-networking-site-hackerone-platform](https://medium.com/@pig.wig45/json-csrf-attack-on-a-social-networking-site-hackerone-platform-3d7aed3239b0)**
58. **[How-i-csrfd-my-first-bounty](https://medium.com/@rajeshranjan457/how-i-csrfd-my-first-bounty-a62b593d3f4d)**
59. **[Self-xss-csrf-to-stored-xss](https://medium.com/@renwa/self-xss-csrf-to-stored-xss-54f9f423a7f1)**
60. **[ATO-worth-900](https://medium.com/@saadahmedx/account-takeover-worth-900-cacbe10de58e)**
61. **[Bypass-csrf-with-clickjacking-worth-1250](https://medium.com/@saadahmedx/bypass-csrf-with-clickjacking-worth-1250-6c70cc263f40)**
62. **[CSRF-token-bypasss-a-tale-of-my-2k-bug](https://medium.com/@sainttobs/csrf-token-bypasss-a-tale-of-my-2k-bug-ff7f51166ea1)**
63. **[How-i-exploit-the-json-csrf-with-method-override-technique](https://medium.com/@secureITmania/how-i-exploit-the-json-csrf-with-method-override-technique-71c0a9a7f3b0)**
64. **[ATO-by-chaining-two-vulnerabilities](https://medium.com/@sherazkhalid_60362/account-takeover-by-chaining-two-vulnerabilities-bb447753b089)**
65. **[Account-takeover-using-csrf-json-based](https://medium.com/@shub66452/account-takeover-using-csrf-json-based-a0e6efd1bffc)**
66. **[How-i-hacked-one-cryptocurrency-service](https://medium.com/@valeriyshevchenko/how-i-hacked-one-cryptocurrency-service-db3cb0f81d6c)**
67. **[2fa-bypass-via-csrf-attack](https://medium.com/@vbharad/2-fa-bypass-via-csrf-attack-8f2f6a6e3871)**
68. **[The-accounttakeover-killing-chain](https://medium.com/@xhzeem/the-accounttakeover-killing-chain-6ba23f4c9d4)**
69. **[4x-csrfs-chained-for-company-account-takeover](https://medium.com/a-bugz-life/4x-csrfs-chained-for-company-account-takeover-f9fada416986)**
70. **[A-simple-bypass-of-registration-activation-that-lead-to-many-bug-a-story-about-how-my-friend](https://medium.com/bugbountywriteup/a-simple-bypass-of-registration-activation-that-lead-to-many-bug-a-story-about-how-my-friend-5df0889f1062)**
71. **[Critical-bypass-csrf-protection-on-ibm](https://medium.com/bugbountywriteup/critical-bypass-csrf-protection-on-ibm-313ffb68dd0c)**
72. **[CSRF-account-takeover-explained-automated-manual-bug-bounty](https://medium.com/bugbountywriteup/csrf-account-takeover-explained-automated-manual-bug-bounty-447e4b96485b)**
73. **[CSRF-account-takeover-in-a-company-worth-1b](https://medium.com/bugbountywriteup/csrf-account-takeover-in-a-company-worth-1b-6e966813c262)**
74. **[CSRF-attack-can-lead-to-stored-xss](https://medium.com/bugbountywriteup/csrf-attack-can-lead-to-stored-xss-f40ba91f1e4f)**
75. **[How-i-hijacked-your-account-when-you-opened-my-cat-picture](https://medium.com/intigriti/how-i-hijacked-your-account-when-you-opened-my-cat-picture-9a0a0acca9e8)**
76. **[Stealing-downloads-from-slack-users](https://medium.com/tenable-techblog/stealing-downloads-from-slack-users-be6829a55f63)**
77. **[Chain_XSS](https://mike-n1.github.io/Chain_XSS)**
78. **[How-i-was-able-to-bypass-the-current-password/](https://ninadmathpati.com/how-i-was-able-to-bypass-the-current-password/)**
79. **[RXSS-CSRF-bypass-to-account-takeover](https://nirmaldahal.com.np/r-xss-csrf-bypass-to-account-takeover/?cf_chl_jschl_tk=d2126b03db2a812a5531feaf545778312401bf1d-1589689403-0-AeUUwidHL9iXCyI5xkfK9YG0i5nb3qc8GtpcX97TylUt6sbNvr1DfRlTfV_2JXFOhtrfyyOYwMkMlB_oQxH8RqXIjvXrTUuipHiCQsPHcztJl1CxaJlslqhTQSLtRqnny7uqJxeV_KxTFaupU6v6klWfK-U8l_SHZTTEposq37_WtcvFiPYM95HGaE5M9I6UisfG5pavR1HZALc9RFVKKSiCrPHXllEJ2msyjXQc65GCSaR-eWHsN0EiNCgDPvAlyQSWT5ygg2bgn6QEM_ZIZDrvME3YcoWx4SGIdj26qT5K_J4RqGZdjUAJIZy-AUqEuh4mLzKqZd3F6bXPKqQylEI)**
80. **[XSS-to-ATO](https://noobe.io/articles/2019-10/xss-to-account-takeover)**
82. **[Site-wide-CSRF-GraphQL](https://rafiem.github.io/bugbounty/tokopedia/site-wide-csrf-graphql/)**
83. **[Google-bug-bounty-csrf-in-learndigital-withgoogle-com](https://santuysec.com/2020/01/21/google-bug-bounty-csrf-in-learndigital-withgoogle-com/)**
84. **[An-inconsistent-CSRF](https://smaranchand.com.np/2019/10/an-inconsistent-csrf/)**
85. **[Yet-other-examples-of-abusing-CSRF-in-logout/](https://soroush.secproject.com/blog/2019/04/yet-other-examples-of-abusing-csrf-in-logout/)**
86. **[Facebook-privacy-bug/](https://www.imperva.com/blog/facebook-privacy-bug/)**
88. **[An interesting Google vulnerability that got me 3133.7 reward.](https://www.sec-down.com/wordpress/?p=809)**
89. **[Facebook CSRF protection bypass which leads to Account Takeover.](https://ysamm.com/?p=185)**
90. **[Facebook CSRF bug which lead to Instagram Partial account takeover.](https://ysamm.com/?p=379)**
91. **[CSRF logs the victim into attacker's account](https://hackerone.com/reports/339352)**
92. **[CSRF log victim into the attacker account](https://hackerone.com/reports/293016)**
93. **[Login csrf in analytics.mopub.com](https://hackerone.com/reports/577920)**
94. **[CRITICAL Full account takeover using CSRF](https://hackerone.com/reports/127703)**
95. **[CSRF at Apply to this program that lead to submit your request automatic with out any validation](https://hackerone.com/reports/334253)**
96. **[CSRF: Close Account](https://hackerone.com/reports/856518)**
97. **[CSRF: add item to victim's cart automatically (starbucks.com: updatecart)](https://hackerone.com/reports/177472)**
98. **[Cross-Site Request Forgery (CSRF) vulnerability on API endpoint allows account takeovers](https://hackerone.com/reports/419891)**
99. **[CSRF: Modify Project Settings](https://hackerone.com/reports/766533)**
100. **[Cross-Site Request Forgery (CSRF)](https://hackerone.com/reports/152569)**
101. **[CSRF on https://market.my.games](https://hackerone.com/reports/802930)**
102. **[CSRF: Modify Company Info](https://hackerone.com/reports/856981)**

---

## Cross Origin Resource Sharing (CORS)

1. [**CORS bug on google's 404 page (rewarded)**](https://medium.com/@jayateerthag/cors-bug-on-googles-404-page-rewarded-2163d58d3c8b) 
2. [**CORS misconfiguration leading to private information disclosure**](https://medium.com/@sasaxxx777/cors-misconfiguration-leading-to-private-information-disclosure-3034cfcb4b93) 
3. [**CORS misconfiguration account takeover out of scope to grab items in scope**](https://medium.com/@mashoud1122/cors-misconfiguration-account-takeover-out-of-scope-to-grab-items-in-scope-66d9d18c7a46) 
4. [**Chrome CORS**](https://blog.bi.tk/chrome-cors/) 
5. [**Bypassing CORS**](https://medium.com/@saadahmedx/bypassing-cors-13e46987a45b) 
6. [**An unexploited CORS misconfiguration reflects further issues**](https://smaranchand.com.np/2019/05/an-unexploited-cors-misconfiguration-reflecting-further-issues/) 
7. [**Think outside the scope of advanced cors exploitation techniques**](https://medium.com/@sandh0t/think-outside-the-scope-advanced-cors-exploitation-techniques-dad019c68397) 
8. [**A simple CORS misconfiguration leaked private post of Twitter Facebook Instagram**](https://medium.com/@nahoragg/a-simple-cors-misconfig-leaked-private-post-of-twitter-facebook-instagram-5f1a634feb9d) 
9. [**Exploiting CORS misconfiguration**](https://bugbaba.blogspot.com/2018/02/exploiting-cors-miss-configuration.html) 
10. [**Exploiting-misconfigured-cors-via-wildcard-subdomains**](http://www.geekboy.ninja/blog/exploiting-misconfigured-cors-via-wildcard-subdomains/) 
11. [**Exploiting insecure CORS API api.artsy.net**](https://blog.securitybreached.org/2017/10/10/exploiting-insecure-cross-origin-resource-sharing-cors-api-artsy-net) 
12. [**Pre domain wildcard CORS exploitation**](https://medium.com/bugbountywriteup/pre-domain-wildcard-cors-exploitation-2d6ac1d4bd30) 
13. [**Exploiting misconfigured CORS on popular BTC site**](https://medium.com/@arbazhussain/exploiting-misconfigured-cors-on-popular-btc-site-2aedfff906f6) 
14. [**Cross-origin resource sharing misconfig  steal user information bughunterboy bughunterboy**](https://hackerone.com/reports/235200) 
15. [**[██████] Cross-origin resource sharing misconfiguration (CORS) Vadim jarvis7**](https://hackerone.com/reports/470298) 
16. [**CORS Misconfiguration on nordvpn.com leading to Private Information Disclosure,Account takeover**](https://hackerone.com/reports/758785) 
17. [**CORS Misconfiguration [www.zomato.com], could lead to disclosure of sensitive information**](https://hackerone.com/reports/426165) 
18. [**CORS misconfiguration**](https://hackerone.com/reports/896093) 
19. [**CORS Misconfiguration Leads to Exposing User Data**](https://hackerone.com/reports/733017) 
20. [**CORS Bypassing Misconfiguration Leads to Sensitive Exposure**](https://hackerone.com/reports/768151) 
21. [**CORS misconfiguration allows to steal client's "password", Authorization token and the customer details e.g. names, SSN, bank account etc.**](https://hackerone.com/reports/688567) 

## Same Origin Policy (SOP)

1. [**SOP-bypass-via-browser-cache**](https://enumerated.wordpress.com/2019/12/24/sop-bypass-via-browser-cache/) 
2. [**Google-sites-and-exploiting-same-origin-policy**](https://medium.com/@raushanraj_65039/google-sites-and-exploiting-same-origin-policy-d400bf569964)
3. [**SOP-bypass**](https://medium.com/bugbountywriteup/sop-bypass-ecae7f4a5c00 )
4. [**Stealing-local-files-with-simple-html-file**](https://www.netsparker.com/blog/web-security/stealing-local-files-with-simple-html-file/ )
5. [**Hacking-the-same-origin-policy**](https://medium.com/swlh/hacking-the-same-origin-policy-f9f49ad592fc)
6. [**Possible SOP bypass in www.starbucks.com due to insecure crossdomain.xml**](https://hackerone.com/reports/244504) 
7. [**CSRF possible when SOP Bypass/UXSS is available**](https://hackerone.com/reports/103787)
8. [**SOP bypass using browser cache**](https://hackerone.com/reports/761726)

---

## Open Redirect

1. [**[Report-246897] Open Redirect on Twitter**](https://hackerone.com/reports/246897): Eldeeb
1. [**[Report-103772] Open Redirect on Shopify**](https://hackerone.com/reports/103772): .np
1. [**[Report-309058] Open Redirect on Wordpress**](https://hackerone.com/reports/309058): @
1. [**[Report-260744] Open Redirect and XSS on Twitter**](https://hackerone.com/reports/260744): https://dev.twitter.com/https:/%5cblackfan.ru/
1. [**[Report-320376] Open Redirect on HackerOne**](https://hackerone.com/reports/320376): after index.php/XYZ
1. [**[Report-111968] Interstitial redirect bypass / Open Redirect on HackerOne Zendesk Session**](https://hackerone.com/reports/111968)
1. [**[Report-244721] Open Redirect on Mail.Ru**](https://hackerone.com/reports/244721)
1. [**[Report-236599] Open Redirect on ExpressionEngine**](https://hackerone.com/reports/236599)
1. [**[Report-299403] Open Redirect on HackerOne**](https://hackerone.com/reports/299403): RTLO
1. [**[Report-239503] Open Redirect & Information Disclosure on HackerOne**](https://hackerone.com/reports/239503)
1. [**[Report-210875] Open Redirect via Host Header**](https://hackerone.com/reports/210875)
1. [**[Report-119236] Open Redirect on Uber**](https://hackerone.com/reports/119236): IP address to a single number
1. [**[Report-126203] Open Redirect on Uber**](https://hackerone.com/reports/126203)
1. [**[Report-144525] Open Redirect bypass on New Relic**](https://hackerone.com/reports/144525)
1. [**[Report-104087] Open Redirect bypass using svg on Slack**](https://hackerone.com/reports/104087)
1. [**[Report-179568] Open Redirect via window.opener on Open-Xchange**](https://hackerone.com/reports/179568)
1. [**Open Redirect to RCE on Google Hangouts Electron app**](https://blog.bentkowski.info/2018/07/vulnerability-in-hangouts-chat-aka-how.html) & [RCE Tweet](https://twitter.com/mattaustin/status/1022648925902200832)

---

## Information Disclosure

1. [**I-found-gcp-service-account-tokennow**](https://blog.carnal0wnage.com/2019/01/i-found-gcp-service-account-tokennow.html) **GCP**
2. [**What-is-your-gcp-infra-worthabout-700**](https://blog.carnal0wnage.com/2020/03/what-is-your-gcp-infra-worthabout-700.html) **GCP**
3. [**Getting-access-zendesk-gcp**](https://blog.assetnote.io/bug-bounty/2019/04/23/getting-access-zendesk-gcp/) **GCP**
4. [**Aaronesau blog**](https://aaronesau.com/blog/posts/5) **Debug**
5. [**From-github-recon-to-account-takeover**](https://addictivehackers.blogspot.com/2019/08/from-github-recon-to-account-takeover.html) **ATO**
6. [**Graphql-bug-to-steal-anyones-address**](https://medium.com/@pratiky054/graphql-bug-to-steal-anyones-address-fc34f0374417) **GraphQl**
7. [**How-recon-helped-samsung-protect-their-production-repositories-of-samsungtv-ecommerce-estores**](https://blog.usejournal.com/how-recon-helped-samsung-protect-their-production-repositories-of-samsungtv-ecommerce-estores-4c51d6ec4fdd) **IMPORTANT**
8. [**Accessing 2 million Verizon Pay Monthly contracts**](https://web.archive.org/web/20191204223739/https://daleys.space/writeup/0day/2019/09/09/verizon-leak.html)
9. [**Business-logic-plex-tv**](https://blog.evanricafort.com/2019/07/business-logic-plex-tv.html)
10. [**Leak-can-i-take-user-information-please**](https://flex0geek.blogspot.com/2019/10/leak-can-i-take-user-information-please.html)
11. [**How-i-could-have-hacked-all-uber-accounts**](https://hackernoon.com/how-i-could-have-hacked-all-uber-accounts-rtzl3z72)
12. [**How-i-found-credential-enriched-redis-dump**](https://medium.com/@D0rkerDevil/how-i-found-credential-enriched-redis-dump-2b9e808024c4)
13. [**How-to-look-for-js-files-vulnerability-for-fun-and-profit**](https://medium.com/@Skylinearafat/how-to-look-for-js-files-vulnerability-for-fun-and-profit-78bfdfbd6731)
14. [**Unauthorized-access-to-all-user-information-leaks**](https://medium.com/@cc1h2e1/unauthorized-access-to-all-user-information-leaks-5db95746aecf)
15. [**How-i-get-my-first-p1-sensitive-information-disclosure-using-wpscan**](https://medium.com/@harrmahar/how-i-get-my-first-p1-sensitive-information-disclosure-using-wpscan-c2fba00ac361)
16. [**Recon-to-sensitive-information-disclosure-in-minutes**](https://hbothra22.medium.com/recon-to-sensitive-information-disclosure-in-minutes-503fc7ccdf0b)

---

## Denial Of Service (DOS)

1. [**Long String DOS**](https://medium.com/@shahjerry33/long-string-dos-6ba8ceab3aa0)
2. [**Banner grabbing to DOS and memory corruption**](https://medium.com/bugbountywriteup/banner-grabbing-to-dos-and-memory-corruption-2442b1c25bbb)
3. [**profile-picture name parameter with large value lead to DoS for other users and programs on the platform**](https://hackerone.com/reports/764434)
4. [**XMLRPC.php FILE IS enable it will used for Bruteforce attack and Denial of Service(DoS)**](https://hackerone.com/reports/752073)
5. [**XMLRPC.php FILE IS enable it will be used for brute force attack and denial of service**](https://hackerone.com/reports/325040)
6. [**DOS on the Issue page by exploiting Mermaid.**](https://hackerone.com/reports/470067)
7. [**Character limitation bypass can lead to DoS on Twitter App and 500 Internal Server Error**](https://hackerone.com/reports/819088)
8. [**Permanent DoS with one click.**](https://hackerone.com/reports/975827)
9. [**A very long name in hey.com can prevent anyone from accessing their contacts and probably can cause denial of service**](https://hackerone.com/reports/1018037)
10. [**ActiveStorage throws exception when using whitespace as filename, may lead to denial of service of multiple pages**](https://hackerone.com/reports/713407)
11. [**Denial of Service twitter.com & mobile.twitter.com**](https://hackerone.com/reports/903740)
12. [**DOS attack via comment on Issue**](https://hackerone.com/reports/557154)
13. [**DOS of https://nordvpn.com/ via CVE-2018-6389 exploitation**](https://hackerone.com/reports/752010)
14. [**Denial of Service [Chrome]**](https://hackerone.com/reports/921286)
15. [**DOS: type confusion in mrb_no_method_error**](https://hackerone.com/reports/181871)
16. [**Api.tumblr.com Denial of Service by cookies manipulation**](https://hackerone.com/reports/1005421)
17. [**Application DOS via specially crafted payload on 3d.cs.money**](https://hackerone.com/reports/993582)
18. [**Pixel Flood Attack leads to Application level DoS**](https://hackerone.com/reports/970760)
19. [**lack of input validation that can lead Denial of Service (DOS)**](https://hackerone.com/reports/768677)

---

##  Simple Storage Service (S3)

1. [**Open AWS S3 bucket leaks all Images uploaded to Zomato chat**](https://hackerone.com/reports/507097)
1. [**AWS S3 bucket writeable for authenticated aws users**](https://hackerone.com/reports/128088)
1. [**Open S3 Bucket Accessible by any Aws User**](https://hackerone.com/reports/819278) 
1. [**Open S3 Bucket WriteAble To Any Aws User**](https://hackerone.com/reports/209223) 
1. [**API: Amazon S3 bucket misconfiguration**](https://hackerone.com/reports/764243) 
1. [**No ACL on S3 Bucket in [https://www.██████████/]**](https://hackerone.com/reports/809212) 
1. [**Amazon S3 bucket misconfiguration (share)**](https://hackerone.com/reports/229690) 
1. [**Listing of Amazon S3 Bucket accessible to any amazon authenticated user (metrics.pscp.tv)**](https://hackerone.com/reports/278191) 
1. [**S3 bucket Upload on studio.redditinc.com (s3-r-w.ap-east-1.amazonaws.com)**](https://hackerone.com/reports/1276733)
1. [**unclaimed s3 bucket takeover in the 3 js file located on the github page of brave software**](https://hackerone.com/reports/1316650)
1. [**S3 bucket data at http://rockset-support.s3-us-west-2.amazonaws.com/ reveals user addresses based on latitudes and longitudes.**](https://hackerone.com/reports/947725)
1. [**Writable RubyCi Amazon s3 bucket**](https://hackerone.com/reports/207053)
1. [**public report: Reproducible: Writable RubyCi Amazon s3 bucket[207053]**](https://hackerone.com/reports/209251)
1. [**niche s3 buckets are readable/writeable/deleteable by authorized AWS users**](https://hackerone.com/reports/129381)
1. [**How-i-dumped-millions-of-crypto-currencies-accounts**](https://medium.com/@ddigvijay/how-i-dumped-millions-of-crypto-currencies-accounts-28d388053713)
1. [**Subdomain Takeover on happymondays.starbucks.com due to non-used AWS S3 DNS record**](https://hackerone.com/reports/186766)
1. [**Subdomain takeover via unsecured s3 bucket**](https://blog.securitybreached.org/2018/09/24/subdomain-takeover-via-unsecured-s3-bucket/)

---

## SQLI

1. [**SQL injection in Harvard subdomain**](https://noob3xploiter.medium.com/sql-injection-in-harvard-subdomain-be67a5dbf664)
1. [**SQLi in HackerOne (crit)**](https://hackerone.com/reports/363815)
1. [**SSRF to sqli**](https://caesarevan23.medium.com/ssrf-external-service-interaction-for-find-real-ip-cloudflare-and-leads-to-sql-injection-c22c02243299)
1. [**Blind sqli Hootsuite**](https://ahussam.me/Blind-sqli-Hootsuite/)
1. [**Tesla motors blind sql injection**](https://bitquark.co.uk/blog/2014/02/23/tesla_motors_blind_sql_injection) **' + sleep(10) + '**
1. [**Popping_a_shell_on_the_oculus_developer_portal**](https://bitquark.co.uk/blog/2014/08/31/popping_a_shell_on_the_oculus_developer_portal)
1. [**Pwning-child-company-to-get-access-to-parentcompanys-slack-team**](https://blog.parthmalhotra.com/pwning-child-company-to-get-access-to-parentcompanys-slack-team/)
1. [**SQL-injection-in-insert-update-query-without-comma**](https://blog.redforce.io/sql-injection-in-insert-update-query-without-comma/)
1. [**SQLI-extracting-data-without-knowing-columns-names**](https://blog.redforce.io/sqli-extracting-data-without-knowing-columns-names/)
1. [**SQLI-bootcampnutanix-com-bug-bounty-poc**](https://blog.securitybreached.org/2018/09/08/sqli-bootcampnutanix-com-bug-bounty-poc/)
1. [**Zol-zimbabwe-authbypass-sqli-xss**](https://blog.securitybreached.org/2018/09/09/zol-zimbabwe-authbypass-sqli-xss/)
1. [**SQLI-login-bypass-autotraders**](https://blog.securitybreached.org/2018/09/10/sqli-login-bypass-autotraders/)
1. [**SQL-injection-via-stopping-the-redirection-to-a-login-page**](https://medium.com/@St00rm/sql-injection-via-stopping-the-redirection-to-a-login-page-52b0792d5592)
1. [**Yahoo-root-access-sql-injection-tw-yahoo-com**](https://buer.haus/2015/01/15/yahoo-root-access-sql-injection-tw-yahoo-com/)
1. [**Step-by-step-exploiting-sql-injection**](https://josipfranjkovic.blogspot.com/2014/09/step-by-step-exploiting-sql-injection.html)
1. [**Fileupload-blind-sqli**](https://jspin.re/fileupload-blind-sqli/)
1. [**First-bug-bounty-submission**](https://renaudmarti.net/posts/first-bug-bounty-submission/)
1. [**Exploiting-a-tricky-blind-sql-injection-inside-limit-clause**](https://blog.noob.ninja/exploiting-a-tricky-blind-sql-injection-inside-limit-clause/)
1. [**H1-4420-From-Quiz-to-Admin-Chaining-Two-0-Days-to-Compromise-an-Uber-Wordpress**](https://www.rcesecurity.com/2019/09/H1-4420-From-Quiz-to-Admin-Chaining-Two-0-Days-to-Compromise-an-Uber-Wordpress/)
1. [**Hacking-the-nhs-for-fun-and-no-profit**](https://nathonsecurity.medium.com/hacking-the-nhs-for-fun-and-no-profit-90931029dcb4)
1. [**Hacking-makes-me-forget-my-pain**](https://abidafahd.medium.com/hacking-makes-me-forget-my-pain-b04bf51d0407)
1. [**SQL-injection-vulnerability-in-university-of-cambridge**](https://adeshkolte.medium.com/sql-injection-vulnerability-in-university-of-cambridge-b4c8d0381e1)
1. [**SQL-injection-bug-bounty**](https://ariffadhlullah2310.medium.com/sql-injection-bug-bounty-110e92e71ec3)
1. [**Shodan-is-your-friend-if-you-lose-him-you-will-lose-many**](https://bathinivijaysimhareddy.medium.com/shodan-is-your-friend-if-you-lose-him-you-will-lose-many-657d07472f75)
1. [**SQL-injection-through-user-agent**](https://frostnull.medium.com/sql-injection-through-user-agent-44a1150f6888)
1. [**Union-based-sql-injection-write-up-a-private-company-site**](https://nuraalamdipu.medium.com/union-based-sql-injection-write-up-a-private-company-site-273f89a49ed9)
1. [**SQL-injection-for-50-bounty-but-still-worth-reading**](https://orthonviper.medium.com/sql-injection-for-50-bounty-but-still-worth-reading-468442c1cc1a)
1. [**Source-code-analysis-in-ysurvey-luminate-bug**](https://rojanrijal.medium.com/source-code-analysis-in-ysurvey-luminate-bug-c86dc29b70c4)
1. [**SQL-injection-saadahmedx**](https://saadahmedx.medium.com/sql-injection-c87a390afdd3)
1. [**A-five-minute-sql-i**](https://infosecwriteups.com/a-five-minute-sql-i-16ab75b20fe4)
1. [**Bug-bounty-writeups-exploiting-sql-injection-vulnerability**](https://medium.com/sud0root/bug-bounty-writeups-exploiting-sql-injection-vulnerability-20b019553716)
1. [**Twitter**](https://twitter.com/0x01alka/status/816403077074976768)
1. [**Youtube**](https://www.youtube.com/watch?v=8gm1z9bPJ7w)
1. [**bypass sql injection #1109311**](https://hackerone.com/reports/1224660)
1. [**SQL injection in https://www.acronis.cz/ via the log parameter**](https://hackerone.com/reports/1109311)
1. [**blind sql injection**](https://hackerone.com/reports/374027)
1. [**Time based sql injection**](https://hackerone.com/reports/9921)
1. [**[critical] sql injection by GET method**](https://hackerone.com/reports/319279)
1. [**Blind SQL Injection**](https://hackerone.com/reports/1069531)
1. [**SQL injection [futexpert.mtngbissau.com]**](https://hackerone.com/reports/924855)
1. [**Sql injection on docs.atavist.com**](https://hackerone.com/reports/1039315)
1. [**[windows10.hi-tech.mail.ru] Blind SQL Injection**](https://hackerone.com/reports/786044)
1. [**SQL injection in https://labs.data.gov/dashboard/datagov/csv_to_json via User-agent**](https://hackerone.com/reports/297478)
1. [**Blind SQL injection in Hall of Fap**](https://hackerone.com/reports/295841)
1. [**SQL Injection in ████**](https://hackerone.com/reports/519631)
1. [**SQL Injection in ████**](https://hackerone.com/reports/419017)

---

## EXternal Xml Entity (XXE)

1. [**External-xml-entity-via-file-upload-svg**](https://web.archive.org/web/20200724124912/https://blog.0xatul.me/posts/2020/02/external-xml-entity-via-file-upload-svg/)
2. [**0day-writeup-xxe-in-ubercom**](https://httpsonly.blogspot.com/2017/01/0day-writeup-xxe-in-ubercom.html)
3. [**An-interesting-xxe-in-sap**](https://medium.com/@zain.sabahat/an-interesting-xxe-in-sap-8b35fec6ef33)
4. [**Bug-bounty-fastmail**](https://infosecwriteups.com/bug-bounty-fastmail-feeda67905f5)
5. [**Exploiting-xxe-with-local-dtd-files**](https://mohemiv.com/all/exploiting-xxe-with-local-dtd-files/)
6. [**XSS-to-XXE-in-Prince**](https://www.corben.io/XSS-to-XXE-in-Prince/)
7. [**Multiple-vulnerabilities-in-oracle-ebs**](https://web.archive.org/web/20210122093352/https://www.guptashubham.com/multiple-vulnerabilities-in-oracle-ebs/)
10. [**From-blind-xxe-to-root-level-file-read-access**](https://honoki.net/2018/12/12/from-blind-xxe-to-root-level-file-read-access/)
14. [**SOAP-based-unauthenticated-out-of-band-xml-external-entity-oob-xxe-in-a-help-desk-software**](https://infosecwriteups.com/soap-based-unauthenticated-out-of-band-xml-external-entity-oob-xxe-in-a-help-desk-software-c27a6abf182a)
15. [**How-i-loose-5005-in-a-day-dos-billion-laugh-attack-xxe**](https://www.protector47.com/2020/03/08/how-i-loose-5005-in-a-day-dos-billion-laugh-attack-xxe/)
18. [**XXE at ecjobs.starbucks.com.cn/retail/hxpublic_v6/hxdynamicpage6.aspx**](https://hackerone.com/reports/500515)
19. [**XXE on sms-be-vip.twitter.com in SXMP Processor**](https://hackerone.com/reports/248668)

BLIND: XXE OOB ❌

1. [**A-tale-of-two-formats-exploiting-insecure-xml-and-zip-file-parsers-to-create**](https://spaceraccoon.dev/a-tale-of-two-formats-exploiting-insecure-xml-and-zip-file-parsers-to-create-a)
2. [**How-I-Found-CVE-2018-8819-Out-of-Band-(OOB)-XXE**]( https://www.coalfire.com/The-Coalfire-Blog/June-2018/How-I-Found-CVE-2018-8819-Out-of-Band-(OOB)-XXE?feed=blogs)
11. [**XXE-oob-exploitation-at-java-17**](http://lab.onsec.ru/2014/06/xxe-oob-exploitation-at-java-17.html)
12. [**Blind-xml-external-entities-out-of-band-channel-vulnerability-paypal-case-study**](https://r00thunt.com/2018/10/05/blind-xml-external-entities-out-of-band-channel-vulnerability-paypal-case-study/)
13. [**OOB-xxe-in-prizmdoc-cve-2018-15805**](https://blog.niksthehacker.com/oob-xxe-in-prizmdoc-cve-2018-15805-dfb1e474345c)
14. [**Exploiting-out-of-band-xxe-using**](https://mahmoudsec.blogspot.com/2019/08/exploiting-out-of-band-xxe-using.html)
15. [**Blind XXE via Powerpoint files**](https://hackerone.com/reports/334488)
16. [**Phone Call to XXE via Interactive Voice Response**](https://hackerone.com/reports/395296)
17. [**XXE in Site Audit function exposing file and directory contents**](https://hackerone.com/reports/312543)

---

## Insecure Direct Object References (IDOR)

1. [**IDOR in HackerOne**](https://n1ghtmar3.medium.com/how-i-found-my-first-idor-in-hackerone-5d5f17bb431)
2. [**IDOR with Geolocation data not stripped from images**](https://hackerone.com/reports/906907)
3. [**IDOR in HackerOne**](https://n1ghtmar3.medium.com/how-i-found-my-first-idor-in-hackerone-5d5f17bb431)
5. [**How-i-could-have-hacked-your-uber-account**](https://appsecure.security/blog/how-i-could-have-hacked-your-uber-account)
6. [**IDOR-via-websockets**](https://footstep.ninja/posts/idor-via-websockets/)
7. [**Fbctf-IDOR/**](https://georgeosterweil.com/2019-02-20-fbctf-idor/)
8. [**Disclosing privately shared gaming clips of any user**](https://bugreader.com/rony@disclosing-privately-shared-gaming-clips-of-any-user-128)
9. [**Adding anyone including non-friend and blocked people as co-host in personal event!**](https://bugreader.com/binit@adding-anyone-including-non-friend-and-blocked-people-as-co-host-in-personal-event-181)
10. [**Page analyst could view job application details**](https://bugreader.com/rony@page-analyst-could-view-job-application-details-213)
11. [**Deleting Anyone's Video Poll**](https://bugreader.com/testgrounds@deleting-anyones-video-poll-175)
12. [**IDOR bug to See hidden slowvote of any user even when you dont have access right**](https://hackerone.com/reports/661978)
13. [**IDOR allow to extract all registered email**](https://hackerone.com/reports/302485)
14. [**Another image removal vulnerability on Facebook**](https://blog.darabi.me/2020/06/image-removal-vulnerability-on-facebook.html)
15. [**Gsuite Hangouts Chat 5k IDOR**](https://secreltyhiddenwriteups.blogspot.com/2018/07/gsuite-hangouts-chat-5k-idor.html)
16. [**How I pwned a company using IDOR and Blind XSS**](https://www.ansariosama.com/2017/11/how-i-pwned-company-using-idor-blind-xss.html)
17. [**Disclose Private Dashboard Chart's name and data in Facebook Analytics**](https://bugreader.com/jubabaghdad@disclose-private-dashboard-charts-name-and-data-in-facebook-analytics-184)
18. [**DoD_IDOR**](http://galnagli.com/DoD_IDOR/)
19. [**IDOR when editing users leads to Account Takeover without User Interaction at CrowdSignal**](https://hackerone.com/reports/915114)
20. [**IDOR leads to Edit Anyone's Blogs / Websites**](https://hackerone.com/reports/974222)
21. [**IDOR and statistics leakage in Orders**](https://hackerone.com/reports/544329)
22. [**IDOR in https://3d.cs.money/**](https://hackerone.com/reports/990878)
23. [**IDOR leading to downloading of any attachment**](https://hackerone.com/reports/668439)
25. [**IDOR when moving contents at CrowdSignal**](https://hackerone.com/reports/915127)
26. [**IDOR unsubscribe Anyone from NextClouds Newsletters by knowing their Email**](https://hackerone.com/reports/230328)
27. [**IDOR to delete images from other stores**](https://hackerone.com/reports/404797)
28. [**IDOR in marketing calendar tool**](https://hackerone.com/reports/797685)
29. [**IDOR when creating App on [platform.streamlabs.com/api/v1/store/whitelist] with user_id field**](https://hackerone.com/reports/983070)
30. [**IDOR with Geolocation data not stripped from images**](https://hackerone.com/reports/906907)
31. [**IDOR in semrush academy**](https://hackerone.com/reports/783708)
32. [**IDOR on the DELETE /comments/**](https://hackerone.com/reports/861849)
33. [**IDOR [NR Insights]: Modify the filter settings for any NR Insights dashboard through internal_api endpoint**](https://hackerone.com/reports/459443)
34. [**IDOR in editing courses**](https://hackerone.com/reports/227522)
35. [**IDOR when editing email leads to Account Takeover on Atavist**](https://hackerone.com/reports/950881)
36. [**IDOR to view User Order Information**](https://hackerone.com/reports/287789)
37. [**IDOR on deleting drafts on https://apps.topcoder.com/wiki/users/viewmydrafts.action via discardDraftId parameter**](https://hackerone.com/reports/868590)
38. [**IDOR: Deleting other user's signature via /appsuite/api/snippet?action=update (although an error is thrown)**](https://hackerone.com/reports/199321)
39. [**IDOR to view User Order Information**](https://hackerone.com/reports/287789)

---

## HTTP Parameter Pollution (HPP)

1. [**Recaptcha-bypass-via-http-parameter-pollution**](https://andresriancho.com/recaptcha-bypass-via-http-parameter-pollution/)
2. [**Twitter-hpp-vulnerability**](https://blog.mert.ninja/twitter-hpp-vulnerability/)
3. [**Improper-input-validation-add-custom-text-and-urls-in-sms-send-by-snapchat-bug-bounty-poc**](https://blog.securitybreached.org/2020/01/26/improper-input-validation-add-custom-text-and-urls-in-sms-send-by-snapchat-bug-bounty-poc/)
4. [**Tale-of-account-takeovers-part**](https://medium.com/@bathinivijaysimhareddy/tale-of-account-takeovers-part-1-b24e1f3c3187)
5. [**Bugbounty-compromising-user-account-how-i-was-able-to-compromise-user-account-via-http**](https://logicbomb.medium.com/bugbounty-compromising-user-account-how-i-was-able-to-compromise-user-account-via-http-4288068b901f)
6. [**From-parameter-pollution-to-xss**](https://medium.com/@momenbasel/from-parameter-pollution-to-xss-d095e13be060)
7. [**How-i-earned-60k-from-private-program**](https://medium.com/@sivakrishnasamireddi/how-i-earned-60k-from-private-program-71bd51554490)

---

## Host Header Injection (HHI)

1. [**Love-story-of-account-takeover-chaining**](https://chainlover.blogspot.com/2018/11/love-story-of-account-takeover-chaining.html) 
2. [**Host-header-injection**](https://lightningsecurity.io/blog/host-header-injection/) 
3. [**How-i-was-able-to-take-over-any-users-account-with-host-header-injection**](https://medium.com/nassec-cybersecurity-writeups/how-i-was-able-to-take-over-any-users-account-with-host-header-injection-546fff6d0f2) 
4. [**Pwn-them-all-bugbounty**](https://medium.com/@bilalmerokhel/pwn-them-all-bugbounty-4ee60e13c83) 
5. [**How-i-earned-800-for-host-header-injection-vulnerability**](https://pethuraj.com/blog/how-i-earned-800-for-host-header-injection-vulnerability/) 
6. [**10k-host-header**](https://sites.google.com/site/testsitehacking/10k-host-header) 
22. [**ATO-via-host-header-poisoning**](https://sechunter.medium.com/ato-via-host-header-poisoning-dc5c29d2fd0d) 
23. [**From-host-header-injection-to-sql-injection**](https://medium.com/@daoud_youssef/from-host-header-injection-to-sql-injection-e7c61a61b575) 
24. [**Awesome-host-header-injection-worth-2k**](https://medium.com/@imunissar786/awesome-host-header-injection-worth-2k-a7e5be1dbb1d) 
25. [**Bugbounty-rewarded-by-securing-vulnerabilities-in-bookmyshow-indias-largest-online-movie**](https://medium.com/@logicbomb_1/bugbounty-rewarded-by-securing-vulnerabilities-in-bookmyshow-indias-largest-online-movie-bb81dba9b82)
7. [**Host Header Injection**](https://hackerone.com/reports/698416) 
8. [**Host header injection/redirection signup and login page**](https://hackerone.com/reports/758380) 
9. [**Host Header Injection/Redirection in:https://www.instacart.com/**](https://hackerone.com/reports/158019) 
10. [**Email link poisoning / Host header attack**](https://hackerone.com/reports/182670) 
11. [**Host Header Injection: irccloud.com**](https://hackerone.com/reports/13286) 
12. [**Host header injection/redirection via newsletter signup**](https://hackerone.com/reports/229498) 
13. [**Host Header Injection/Redirection**](https://hackerone.com/reports/170333) 
14. [**Host header Injection**](https://hackerone.com/reports/221908) 
15. [**Header Injection In app.legalrobot.com**](https://hackerone.com/reports/264405)
16. [**Password Reset link hijacking via Host Header Poisoning**](https://hackerone.com/reports/226659) 
17. [**Host Header Injection/Redirection**](https://hackerone.com/reports/94637) 
18. [**Modify Host Header which is sent to email**](https://hackerone.com/reports/791293) 
19. [**Host Header Injection / Cache Poisoning**](https://hackerone.com/reports/123513) 
20. [**Host Header poisoning on gratipay.com**](https://hackerone.com/reports/158482) 
21. [**Host Header is not validated resulting in Open Redirect**](https://hackerone.com/reports/7357) 

---

## Server Side Request Forgery (SSRF)

1. **[SSRF to SQLI](https://caesarevan23.medium.com/ssrf-external-service-interaction-for-find-real-ip-cloudflare-and-leads-to-sql-injection-c22c02243299)**
2. **[Escalating xss in phantomjs image rendering to ssrflocal file read](https://buer.haus/2017/06/29/escalating-xss-in-phantomjs-image-rendering-to-ssrflocal-file-read/)**
3. **[Escalating-blind-ssrf-get-rce-santosh-kumar-sha](https://www.linkedin.com/pulse/escalating-blind-ssrf-get-rce-santosh-kumar-sha)**
4. **[aws-takeover-ssrf-javascript](http://web.archive.org/web/20190522083351/http://10degres.net/aws-takeover-ssrf-javascript/)**
5. **[Local-file-read-via-xss-in-dynamically](https://www.noob.ninja/2017/11/local-file-read-via-xss-in-dynamically.html)**
6. **[AWS-takeover-ssrf-javascript](http://10degres.net/aws-takeover-ssrf-javascript/)** 
7. **[Downnotifer-ssrf](http://blog.haao.sh/notes/downnotifer-ssrf/)** 
8. **[Pivoting-from-blind-SSRF-to-RCE-with-Hashicorp-Consul](http://www.kernelpicnic.net/2017/05/29/Pivoting-from-blind-SSRF-to-RCE-with-Hashicorp-Consul.html)**
9. **[Esea-server-side-request-forgery-and-querying-aws-meta-data](https://buer.haus/2016/04/18/esea-server-side-request-forgery-and-querying-aws-meta-data/)**
10. **[Airbnb-chaining-third-party-open-redirect-into-server-side-request-forgery-ssrf-via-liveperson-chat](https://buer.haus/2017/03/09/airbnb-chaining-third-party-open-redirect-into-server-side-request-forgery-ssrf-via-liveperson-chat/)**
11. **[Escalating-xss-in-phantomjs-image-rendering-to-ssrflocal-file-read/](https://buer.haus/2017/06/29/escalating-xss-in-phantomjs-image-rendering-to-ssrflocal-file-read/)**
12. **[Yahoo-small-business-luminate-and-the-not-so-secret-keys](https://dos.sh/blog/2017/6/21/yahoo-small-business-luminate-and-the-not-so-secret-keys)**
13. **[SSRF-vulnerability-in](https://evanricafort.blogspot.com/2019/08/ssrf-vulnerability-in.html)**
14. **[My-first-ssrf-using-dns-rebinfing/](https://geleta.eu/2019/my-first-ssrf-using-dns-rebinfing/)**
16. **[Bugbounty-a-simple-ssrf/](https://jinone.github.io/bugbounty-a-simple-ssrf/)**
17. **[Blind-ssrf-in-stripe-com-due-to-sentry-misconfiguration](https://medium.com/@0ktavandi/blind-ssrf-in-stripe-com-due-to-sentry-misconfiguration-60ebb6a40b5)**
18. **[Jow-i-convert-ssrf-to-xss-in-a-ssrf-vulnerable-jira](https://medium.com/@D0rkerDevil/how-i-convert-ssrf-to-xss-in-a-ssrf-vulnerable-jira-e9f37ad5b158)**
19. **[Escalating-ssrf-to-rce](https://medium.com/@GeneralEG/escalating-ssrf-to-rce-f28c482eb8b9)**
20. **[How-outdated-jira-instances-suffers-from-multiple-security-vulnerabilities](https://medium.com/@Skylinearafat/how-outdated-jira-instances-suffers-from-multiple-security-vulnerabilities-6a88c45e9ec6)**
21. **[How-i-found-xss-via-ssrf-vulnerability-adesh-kolte](https://medium.com/@adeshkolte/how-i-found-xss-via-ssrf-vulnerability-adesh-kolte-873b30a6b89f)**
22. **[Gain-adfly-smtp-access-with-ssrf-via-gopher-protocol](https://medium.com/@androgaming1912/gain-adfly-smtp-access-with-ssrf-via-gopher-protocol-26a26d0ec2cb)**
23. **[Pdfreacter-ssrf-to-root-level-local-file-read-which-led-to-rce](https://medium.com/@armaanpathan/pdfreacter-ssrf-to-root-level-local-file-read-which-led-to-rce-eb460ffb3129)**
24. **[Piercing-the-veal-short-stories-to-read-with-friends](https://medium.com/@d0nut/piercing-the-veal-short-stories-to-read-with-friends-4aa86d606fc5)**
25. **[Vimeo-upload-function-ssrf](https://medium.com/@dPhoeniixx/vimeo-upload-function-ssrf-7466d8630437)**
26. **[1-000-ssrf-in-slack](https://medium.com/@elberandre/1-000-ssrf-in-slack-7737935d3884)**
27. **[SSRF-trick-ssrf-xspa-in-microsofts-bing-webmaster-central](https://medium.com/@elberandre/ssrf-trick-ssrf-xspa-in-microsofts-bing-webmaster-central-8015b5d487fb)**
28. **[Hunting-good-bugs-with-only-html](https://medium.com/@know.0nix/hunting-good-bugs-with-only-html-d8fd40d17b38)**
29. **[Blind-ssrf-on-coda-io](https://medium.com/@kurtikleiton/blind-ssrf-on-coda-io-c7063f304455)**
30. **[Chain-of-hacks-leading-to-database-compromise](https://medium.com/@logicbomb_1/chain-of-hacks-leading-to-database-compromise-b2bc2b883915)**
31. **[The-journey-of-web-cache-firewall-bypass-to-ssrf-to-aws-credentials-compromise](https://medium.com/@logicbomb_1/the-journey-of-web-cache-firewall-bypass-to-ssrf-to-aws-credentials-compromise-b250fb40af82)**
32. **[The-unusual-case-of-open-redirection-to-aws-security-credentials-compromise](https://medium.com/@logicbomb_1/the-unusual-case-of-open-redirection-to-aws-security-credentials-compromise-59acc312f02b)**
33. **[Pcextreme-nl-fake-bug-bounty](https://medium.com/@maxon3/pcextreme-nl-fake-bug-bounty-1a8bf01d518f)**
34. **[SSRF-on-pdf-generator](https://medium.com/@michan001/ssrf-on-pdf-generator-36b81e16d67b)**
35. **[Reading-internal-files-using-ssrf-vulnerability](https://medium.com/@neerajedwards/reading-internal-files-using-ssrf-vulnerability-703c5706eefb)**
36. **[Using-vulnerability-analytics-feature-like-a-boss](https://medium.com/@ozguralp/using-vulnerability-analytics-feature-like-a-boss-655fc1f1543b)**
37. **[SSRF-via-ffmpeg-hls-processing](https://medium.com/@pflash0x0punk/ssrf-via-ffmpeg-hls-processing-a04e0288a8c5)**
38. **[SSRF-to-read-local-files-and-abusing-the-aws-metadata](https://medium.com/@pratiky054/ssrf-to-read-local-files-and-abusing-the-aws-metadata-8621a4bf382)**
39. **[SSRF-in-openid-support](https://medium.com/@putracraft.theworld/server-side-request-forgery-in-openid-support-defcc64d5e41)**
40. **[Yhe-story-of-blind-ssrf-leads-to-internal-host-discovery](https://medium.com/@rooterkaustubh/the-story-of-blind-ssrf-leads-to-internal-host-discovery-ee65b9b91e23)**
41. **[vimeo-ssrf-with-code-execution-potential](https://medium.com/@rootxharsh_90844/vimeo-ssrf-with-code-execution-potential-68c774ba7c1e)**
42. **[Just-another-tale-of-severe-bugs-on-a-private-program](https://medium.com/@sivakrishnasamireddi/just-another-tale-of-severe-bugs-on-a-private-program-405870b03532)**
43. **[How-i-found-an-ssrf-in-yahoo-guesthouse-recon-wins-8722672e41d4](https://medium.com/@th3g3nt3l/how-i-found-an-ssrf-in-yahoo-guesthouse-recon-wins-8722672e41d4)**
44. **[From-ssrf-to-local-file-disclosure](https://medium.com/@tungpun/from-ssrf-to-local-file-disclosure-58962cdc589f)**
45. **[SSRF-port-issue-hidden-approch](https://medium.com/@w_hat_boy/server-side-request-forgery-ssrf-port-issue-hidden-approch-f4e67bd8cc86)**
46. **[Exploiting-ssrf-like-a-boss-c090dc63d326](https://medium.com/@zain.sabahat/exploiting-ssrf-like-a-boss-c090dc63d326)**
47. **[Exploiting-an-ssrf-trials-and-tribulations-14c5d8dbd69a](https://medium.com/a-bugz-life/exploiting-an-ssrf-trials-and-tribulations-14c5d8dbd69a)**
48. **[The-bugs-are-out-there-hiding-in-plain-sight-12d056613ea3](https://medium.com/a-bugz-life/the-bugs-are-out-there-hiding-in-plain-sight-12d056613ea3)**
49. **[Bug-bounty-fastmail](https://medium.com/bugbountywriteup/bug-bounty-fastmail-feeda67905f5)**
50. **[Piercing-the-veil-server-side-request-forgery-to-niprnet-access](https://medium.com/bugbountywriteup/piercing-the-veil-server-side-request-forgery-to-niprnet-access-c358fd5e249a)**
51. **[SSRF_P4toP2](https://mike-n1.github.io/SSRF_P4toP2)**
52. **[Old-but-gold-dot-dot-slash-to-get-the-flag-uber-microservice](https://ngailong.wordpress.com/2019/04/07/old-but-gold-dot-dot-slash-to-get-the-flag-uber-microservice/amp/)**
53. **[Google-vrp-ssrf-in-google-cloud-platform-stackdriver](https://ngailong.wordpress.com/2019/12/19/google-vrp-ssrf-in-google-cloud-platform-stackdriver/)**
54. **[Into-the-borg-ssrf-inside-google-production-network](https://opnsec.com/2018/07/into-the-borg-ssrf-inside-google-production-network/)**
55. **[CVE-2018-16794-on-fs-thefacebook-com](https://philippeharewood.com/cve-2018-16794-on-fs-thefacebook-com/)**
56. **[Stored-XSS-and-SSRF-Google](https://s1gnalcha0s.github.io/dspl/2018/03/07/Stored-XSS-and-SSRF-Google.html)**
57. **[Exploiting-single-request-for-multiple](https://www.ansariosama.com/2017/09/exploiting-single-request-for-multiple.html)**
58. **[How-i-got-access-to-local-aws-info-via-jira](https://www.coengoedegebure.com/how-i-got-access-to-local-aws-info-via-jira/)**
59. **[SSRF-in.html#.XGWpfioiVM4.twitter](https://www.mohamedharon.com/2019/02/ssrf-server-side-request-forgery-in.html#.XGWpfioiVM4.twitter)**
60. **[SSRF-reading-local-files-from-downnotifier-server/](https://www.openbugbounty.org/blog/leonmugen/ssrf-reading-local-files-from-downnotifier-server/)**
61. **[Ok-google-give-me-all-your-internal-dns-information/](https://www.rcesecurity.com/2017/03/ok-google-give-me-all-your-internal-dns-information/)**
62. **[01-slack-webrtc-turn-compromise/](https://www.rtcsec.com/2020/04/01-slack-webrtc-turn-compromise/)**
63. **[Getting-read-access-on-edmodo.html](https://www.shawarkhan.com/2018/05/getting-read-access-on-edmodo.html)**
64. **[A-pair-of-plotly-bugs-stored-xss-and-aws-metadata-ssrf/](https://ysx.me.uk/a-pair-of-plotly-bugs-stored-xss-and-aws-metadata-ssrf/)**
65. **[Exploiting an SSRF trials and tribulations](https://medium.com/a-bugz-life/exploiting-an-ssrf-trials-and-tribulations-14c5d8dbd69a)**
66. **[SSRF on PDF generator](https://medium.com/@michan001/ssrf-on-pdf-generator-36b81e16d67b)**
67. **[Google VRP SSRF in Google cloud platform stackdriver](https://ngailong.wordpress.com/2019/12/19/google-vrp-ssrf-in-google-cloud-platform-stackdriver/)**
68. **[Vimeo upload function SSRF](https://medium.com/@dPhoeniixx/vimeo-upload-function-ssrf-7466d8630437)**
69. **[SSRF via ffmeg processing](https://medium.com/@pflash0x0punk/ssrf-via-ffmpeg-hls-processing-a04e0288a8c5)**
70. **[My first SSRF using DNS rebinding](https://geleta.eu/2019/my-first-ssrf-using-dns-rebinfing/)**
71. **[Bugbounty simple SSRF](https://jin0ne.blogspot.com/2019/11/bugbounty-simple-ssrf.html)**
72. **[SSRF reading local files from downnotifier server](https://www.openbugbounty.org/blog/leonmugen/ssrf-reading-local-files-from-downnotifier-server/)**
73. **[SSRF vulnerability](https://evanricafort.blogspot.com/2019/08/ssrf-vulnerability-in.html)**
74. **[Gain adfly SMTP access with SSRF via gopher protocol](https://medium.com/@androgaming1912/gain-adfly-smtp-access-with-ssrf-via-gopher-protocol-26a26d0ec2cb)**
75. **[Blind SSRF in stripe.com due to senntry misconfiguration](https://medium.com/@0ktavandi/blind-ssrf-in-stripe-com-due-to-sentry-misconfiguration-60ebb6a40b5)**
76. **[SSRF port issue hidden approch](https://medium.com/@w_hat_boy/server-side-request-forgery-ssrf-port-issue-hidden-approch-f4e67bd8cc86)**
77. **[The jorney of web cache firewall bypass to SSRF to AWS credentials compromise](https://medium.com/@logicbomb_1/the-journey-of-web-cache-firewall-bypass-to-ssrf-to-aws-credentials-compromise-b250fb40af82)**
78. **[SSRF to local file read and abusing aws metadata](https://medium.com/@pratiky054/ssrf-to-read-local-files-and-abusing-the-aws-metadata-8621a4bf382)**
79. **[pdfreactor SSRF to root level local files read which lead to RCE](https://medium.com/@armaanpathan/pdfreacter-ssrf-to-root-level-local-file-read-which-led-to-rce-eb460ffb3129)**
80. **[SSRF trick : SSRF XSPA in micosoft's bing webwaster](https://medium.com/@elberandre/ssrf-trick-ssrf-xspa-in-microsofts-bing-webmaster-central-8015b5d487fb)**
81. **[Downnotifeer SSRF](https://m-q-t.github.io/notes/downnotifer-ssrf/)**
82. **[Escalating SSRF to RCE](https://medium.com/cesppa/escalating-ssrf-to-rce-f28c482eb8b9)**
83. **[Vimeo SSRF with code execution potential](https://medium.com/@rootxharsh_90844/vimeo-ssrf-with-code-execution-potential-68c774ba7c1e)**
84. **[SSRF in slack](https://medium.com/@elberandre/1-000-ssrf-in-slack-7737935d3884)**
85. **[Exploiting SSRF like a boss](https://medium.com/@zain.sabahat/exploiting-ssrf-like-a-boss-c090dc63d326)**
86. **[AWS takeover SSRF javascript](http://10degres.net/aws-takeover-ssrf-javascript/)**
87. **[Into the borg of SSRF inside google production network](https://opnsec.com/2018/07/into-the-borg-ssrf-inside-google-production-network/)**
88. **[SSRF to local file disclosure](https://medium.com/@tungpun/from-ssrf-to-local-file-disclosure-58962cdc589f)**
89. **[How I found an SSRF in yahoo guesthouse (recon wins)](https://medium.com/@th3g3nt3l/how-i-found-an-ssrf-in-yahoo-guesthouse-recon-wins-8722672e41d4)**
90. **[Reading internal files using SSRF vulnerability](https://medium.com/@neerajedwards/reading-internal-files-using-ssrf-vulnerability-703c5706eefb)**
91. **[Airbnb chaining third party open redirect into SSRF via liveperson chat](https://buer.haus/2017/03/09/airbnb-chaining-third-party-open-redirect-into-server-side-request-forgery-ssrf-via-liveperson-chat/)**
92. **[SSRF in Exchange leads to ROOT access in all instances](https://hackerone.com/reports/341876)**
93. **[SSRF using Javascript allows to exfill data from Google Metadata](https://hackerone.com/reports/530974)**
94. **[SSRF in Google cloud platform stackdriver](https://ngailong.wordpress.com/2019/12/19/google-vrp-ssrf-in-google-cloud-platform-stackdriver/)**
95. **[SSRF to ROOT Access](https://hackerone.com/reports/341876)**
96. **[SSRF reading local files from downnotifier server](https://www.openbugbounty.org/blog/leonmugen/ssrf-reading-local-files-from-downnotifier-server/)**
97. **[Facebook SSRF](https://medium.com/@amineaboud/10000-facebook-ssrf-bug-bounty-402bd21e58e5)**
98. **[31k$ SSRF in Google Cloud Monitoring led to metadata exposure](https://nechudav.blogspot.com/2020/11/31k-ssrf-in-google-cloud-monitoring.html)**
99. **[How I Chained 4 vulnerabilities on GitHub Enterprise, From SSRF Execution Chain to RCE!](http://blog.orange.tw/2017/07/how-i-chained-4-vulnerabilities-on.html)**
100. **[My Expense Report resulted in a Server-Side Request Forgery (SSRF) on Lyft to Lyft](https://hackerone.com/reports/885975)**
101. **[SSRF in Exchange leads to ROOT access in all instances to Shopify](https://hackerone.com/reports/341876)**

---

## OS Command Injection

1. [**Command Injection (via CVE-2019-11510 and CVE-2019-11539)**](https://hackerone.com/reports/680480) 
2. [**RCE using bash command injection on /system/images (toimitilat.lahitapiola.fi)**](https://hackerone.com/reports/303061) 
3. [**Remote Code Execution via Extract App Plugin**](https://hackerone.com/reports/546753) 
4. [**OS Command Injection in Nexus Repository Manager 2.x(bypass CVE-2019-5475)**](https://hackerone.com/reports/688270) 
5. [**https://hackerone.com/reports/212696**](https://hackerone.com/reports/212696) 

---

## LFI/LFD: Path Traversal: RFI

### **Remote File Inclusion** (RFI)

1. **[Remote file Inclusion: RFI in upload](https://hackerone.com/reports/14092)**

### **Path Traversal**

1. **[Path Traversal allowing to read any files on the server](https://hackerone.com/reports/579517)** 
2. **[Directory traversal at https://nightly.ubnt.com](https://hackerone.com/reports/229622)** 
3. **[Remote code execution via path traversal in Zip extraction in the Extract app](https://hackerone.com/reports/765291)**
4. **[Path traversal on ████████](https://hackerone.com/reports/217344)** 
5. **[Critical Full local fylesystem access (LFI/LFD) as admin via Path Traversal in the misconfigured Java servlet on the https://███/](https://hackerone.com/reports/497771)**
6. **[Path traversal leading to limited CSRF on GET requests on two endpoints](https://hackerone.com/reports/301862)**

### **Local File Inclusion** (LFI)

1. **[[https://███] Local File Inclusion via graph.php](https://hackerone.com/reports/492767)**
2. **[Local File Inclusion In Registration Page](https://hackerone.com/reports/1007799)**
3. **[Local File Include on marketing-dam.yahoo.com](https://hackerone.com/reports/7779)**
4. **[Local files reading from the web using `brave://`](https://hackerone.com/reports/390013)**
5. **[RFI LFI Writeup](http://hassankhanyusufzai.com/RFI_LFI_writeup/)** 
6. **[How we got LFI in apache drill recom like a boss](https://medium.com/bugbountywriteup/how-we-got-lfi-in-apache-drill-recon-like-a-boss-6f739a79d87d)**
7. **[Bugbounty journey from LFI to RCE](https://medium.com/@logicbomb_1/bugbounty-journey-from-lfi-to-rce-how-a69afe5a0899)** 
8. **[From LFI to RCE via PHP sessions](https://www.rcesecurity.com/2017/08/from-lfi-to-rce-via-php-sessions/)** 
9. **[magix bugbounty magix.com XSS RCE SQLI and LFI](https://www.rcesecurity.com/2014/04/magix-bug-bounty-magix-com-rce-sqli-and-xara-com-lfi-xss/)** 
10. **[Escalating-xss-in-phantomjs-image-rendering-to-ssrflocal-file-read](https://buer.haus/2017/06/29/escalating-xss-in-phantomjs-image-rendering-to-ssrflocal-file-read/)** 
11. **[Chain-the-bugs-to-pwn-an-organisation-lfi-unrestricted-file-upload-remote-code-execution](https://medium.com/@armaanpathan/chain-the-bugs-to-pwn-an-organisation-lfi-unrestricted-file-upload-remote-code-execution-93dfa78ecce)**
12. **[Chain-of-hacks-leading-to-database-compromise](https://medium.com/@logicbomb_1/chain-of-hacks-leading-to-database-compromise-b2bc2b883915)** 
13. **[The-journey-of-web-cache-firewall-bypass-to-ssrf-to-aws-credentials-compromise](https://medium.com/@logicbomb_1/the-journey-of-web-cache-firewall-bypass-to-ssrf-to-aws-credentials-compromise-b250fb40af82)**
14. **[LFI-to-command-execution-deutche-telekom-bug-bounty](https://medium.com/@maxon3/lfi-to-command-execution-deutche-telekom-bug-bounty-6fe0de7df7a6)**
15. **[Client-not-client](https://medium.com/@tungpun/client-not-client-aa448cfdedd2)**
16. **[Exploiting-ssrf-like-a-boss](https://medium.com/@zain.sabahat/exploiting-ssrf-like-a-boss-c090dc63d326)**
17. **[Bugbounty-journey-from-lfi-to-rce-how](https://medium.com/bugbountywriteup/bugbounty-journey-from-lfi-to-rce-how-a69afe5a0899)**

---

## File Upload

1. **[Exploiting-file-uploads-pt-2](https://anotherhackerblog.com/exploiting-file-uploads-pt-2/)** 
2. **[External-xml-entity-via-file-upload-svg](https://blog.0xatul.me/posts/2020/02/external-xml-entity-via-file-upload-svg/)** 
3. **[Arbitary-File-Upload-Too-Stored-XSS](https://m0chan.github.io/2020/02/04/Arbitary-File-Upload-Too-Stored-XSS.html)** 
4. **[My-first-rce-stressed-employee-gets-me-2x-bounty](https://medium.com/@abhishake100/my-first-rce-stressed-employee-gets-me-2x-bounty-c4879c277e37)** 
5. **[Remote-image-upload-leads-to-rce-inject-malicious-code-to-php-gd-image](https://medium.com/@asdqwedev/remote-image-upload-leads-to-rce-inject-malicious-code-to-php-gd-image-90e1e8b2aada)** 
6. **[Vimeo-upload-function-ssrf](https://medium.com/@dPhoeniixx/vimeo-upload-function-ssrf-7466d8630437)** 
7. **[Manageengine-servicedesk-plus-arbitrary-file-upload](https://medium.com/@ducanhbui/manageengine-servicedesk-plus-arbitrary-file-upload-4bab0bd00425)** 
8. **[From-file-upload-to-email-pass](https://medium.com/@frostnull/from-file-upload-to-email-pass-dc7141aa1ff6)** 
9. **[Uploading-backdoor-for-fun-and-profit-rce-db-cred-p1](https://medium.com/@mohdaltaf163/uploading-backdoor-for-fun-and-profit-rce-db-cred-p1-2cdaa00e2125)** 
10. **[Simple-remote-code-execution-vulnerability-examples-for-beginners](https://ozguralp.medium.com/simple-remote-code-execution-vulnerability-examples-for-beginners-985867878311)** 
11. **[Unrestricted-file-upload-to-rce-bug-bounty-poc](https://blog.securitybreached.org/2017/12/19/unrestricted-file-upload-to-rce-bug-bounty-poc/)** 
12. **[How-i-gain-unrestricted-file-upload-remote-code-execution-bug-bounty](https://medium.com/@shayboy123/how-i-gain-unrestricted-file-upload-remote-code-execution-bug-bounty-381d0aab0dad)** 
13. **[How-i-found-rce-but-got-duplicated](https://medium.com/@smilehackerofficial/how-i-found-rce-but-got-duplicated-ea7b8b010990)**
14. **[Race-condition-that-could-result-to-rce-a-story-with-an-app-that-temporary-stored-an-uploaded](https://medium.com/bugbountywriteup/race-condition-that-could-result-to-rce-a-story-with-an-app-that-temporary-stored-an-uploaded-9a4065368ba3)** 
15. **[Asus-rce-vulnerability-on-rma-asus-europe-eu](https://mustafakemalcan.com/asus-rce-vulnerability-on-rma-asus-europe-eu/)** 
16. **[Exploitation-of-the-cve-2018-15961-unrestricted-file-upload-in-adobe-coldfusion](https://supras.io/exploitation-of-the-cve-2018-15961-unrestricted-file-upload-in-adobe-coldfusion/)** 
17. **[Unrestricted-file-upload-on-pdf](https://vict0ni.me/unrestricted-file-upload-on-pdf/)** 
18. **[Uploading files to api.techprep.fb.com](https://ysamm.com/?p=12)** 
19. **[How I got stored XSS using a file upload](https://medium.com/@vis_hacker/how-i-got-stored-xss-using-file-upload-5c33e19df51e)** 
20. **[Chain the bugs to pwn an organization LFI unrestricted file upload to RCE](https://medium.com/@armaanpathan/chain-the-bugs-to-pwn-an-organisation-lfi-unrestricted-file-upload-remote-code-execution-93dfa78ecce)** 
21. **[File Upload blind SQLI](https://jspin.re/fileupload-blind-sqli/)** 
22. **[Path traversal while uploading results in RCE](https://blog.harshjaiswal.com/path-traversal-while-uploading-results-in-rce)**
23. **[RCE by uploading a web config](https://poc-server.com/blog/2018/05/22/rce-by-uploading-a-web-config/)** 
25. **[How-i-hacked-facebook-and-received-a-3500-usd-facebook-bug-bounty](https://blog.detectify.com/2012/12/30/how-i-hacked-facebook-and-received-a-3500-usd-facebook-bug-bounty/)** 
26. **[Chaining-tricky-oauth-exploitation-to-stored-xss-b67eaea4aabd](https://medium.com/@nahoragg/chaining-tricky-oauth-exploitation-to-stored-xss-b67eaea4aabd)**
27. **[RTL override symbol not stripped from file names
](https://hackerone.com/reports/298)**
28. **[XSS by image file name](https://hackerone.com/reports/93807)** 
29. **[Arbitrary file upload and stored XSS via ███ support request](https://hackerone.com/reports/865354)** 
30. **[Unrestricted File Upload on https://app.dropcontact.io/app/upload/](https://hackerone.com/reports/949295)** 
31. **[Unrestricted file upload leads to Stored XSS](https://hackerone.com/reports/880099)** 
32. **[Unrestricted file upload on the image of contacts](https://hackerone.com/reports/808287)** 
33. **[File Upload XSS in image uploading of App in mopub](https://hackerone.com/reports/97672)** 
