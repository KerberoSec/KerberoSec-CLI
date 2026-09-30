Write-up:

1. After registering, we could see all the blog posts. Posts have paths like **/blog/1**. When reading all the existing posts, we find a post by **admin** that says: "Hi from your admin, please do not try to access restricted pages please!"

2. Attempting to access /blog/0 returns a special page for ids that don't have a corresponding blog post. Searching for post /blog/1337 returns a post that we don't have access to.

3. After creating a post, we see that we can change who can edit it (/update). Intercepting this request allows us to modify it:
`postId=1337&users=sousa`. This payload grants us access to the relevant blog post and allows us to see the flag: **flag{5a593f66535c10f2291a8dcb8e88bfbb}**