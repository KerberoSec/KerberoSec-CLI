### JS Authentication 

This time also source code but little different, We got the following code.
```js
function connexion(){
    var username = prompt("Username :", "");
    var password = prompt("Password :", "");
    var TheLists = ["reallyhidden"];
    for (i = 0; i < TheLists.length; i++)
    {
        if (TheLists[i].indexOf(username) == 0)
        {
            var TheSplit = TheLists[i].split(":");
            var TheUsername = TheSplit[0];
            var ThePassword = TheSplit[1];
            if (username == TheUsername && password == ThePassword)
            {
                alert("Vous pouvez utiliser ce mot de passe pour valider ce challenge (en majuscules) / You can use this password to validate this challenge (uppercase)");
            }
        }
        else
        {
            alert("Nope, you're a naughty hacker.")
        }
    }
}
```

Here you can see Hardcoded credentials list: which is `["reallyhidden"];`, I submitted it as username and password. 

<img alt="image" src="https://github.com/user-attachments/assets/06e6a006-dbe9-43cb-b452-0f904baa5411" />

---
