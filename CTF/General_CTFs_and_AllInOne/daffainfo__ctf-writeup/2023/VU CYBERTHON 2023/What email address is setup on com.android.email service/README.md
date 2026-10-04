# What email address is setup on com.android.email service
> What email address is setup on com.android.email service?

## About the Challenge
We need to find the email address that set up on com.android.email

## How to Solve?
We can find the email address by exporting the SQLite Database first from `/userdata/root/data/com.android.email/databases/Emailprovider.db`

*[Image: exports]*

Open the SQLite database using `DB Browser for SQlite` software and import the database. In the `Account` table, we can see the email

*[Image: email]*

```
Joohnnycash7@gmail.com
```