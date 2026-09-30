### Content discovery / recon

The process of identifying and mapping out different type of components,fuctionality, subdomains, directories, and endpoints is content discovery.

When doing content discovery the following components we should look for 

* Technology stack
* Subdomains 
* Directories and endpoints
* Parameters and Functionality 
* APIs 
* JS files
* Open services and Ports.

#### Analyzing web services contains
- [X] About running Server
-   [X] Operating systems, Web server (``Apache/Nginx``)
- [X] Version of the Web Server
- [X] Subdomains we can look for.

#### Looking for Common files
- [X] robots.txt, security.txt 
- [X] .htaccess
- [X] manifest.json
- [X] sitemap.xml
- [X] browserconfig.xml etc 

#### Frontend Checks
- [X] Instecting the page source, checking scripts
- [X] Check for Links(broken) or active and check for sensitive information

#### Entry Point 
- [X] Check for what endpoints exist, HTTP methods, used Parameters 
- [X] Fuzz for endpoints, files, parameters, methods and etc.

