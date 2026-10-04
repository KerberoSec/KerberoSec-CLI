# API: Broken Access

## Statement
Your friend has set up a platform where you can register and post a private note. Everything is based on an API. Before setting up the Front-End, he asked you to check that everything was secure.

When we visit the target url, we got a simple API in which we can basically `signup/login/make notes/search for user`.

Loggin as normal user & Intercepting every request 

<img src="https://github.com/user-attachments/assets/43e68365-3e27-4467-a077-9ba8bb936195" />

`/api/user` seems vulnerable as we can search for user and its notes.

<img src="https://github.com/user-attachments/assets/a96380c4-d5ec-4481-a59f-3974c222cbc9" />

Tried Broken Access by changing user_id to `1`.

<img alt="image" src="https://github.com/user-attachments/assets/a25621f2-b235-46a6-a3c9-d316ac65649b" />

Yup, that was this much.
